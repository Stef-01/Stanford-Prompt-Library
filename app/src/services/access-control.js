import { supabase } from '../config/supabase.js'
import { getCurrentUser, createUserProfile } from './auth.js'

/**
 * Check user's access level and return status
 * Returns object with hasAccess, reason, and user data
 */
export async function checkUserAccess() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return {
        hasAccess: false,
        reason: 'NOT_AUTHENTICATED',
        message: 'Please sign in with your Stanford email to continue',
        needsAction: 'SIGN_IN'
      }
    }

    // Get user profile from database
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle() // Use maybeSingle instead of single - won't error if no rows

    if (error) {
      console.error('Error fetching user data:', error)
      // Database error - clear session and force re-auth
      await supabase.auth.signOut()
      return {
        hasAccess: false,
        reason: 'NOT_AUTHENTICATED',
        message: 'Database error. Please sign in again.',
        needsAction: 'SIGN_IN'
      }
    }

    // If user doesn't exist in database, create profile
    if (!userData) {
      console.log('User profile not found, creating...')
      try {
        await createUserProfile(user)

        // Fetch the newly created profile
        const { data: newUserData, error: retryError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (retryError || !newUserData) {
          throw new Error('Failed to create user profile')
        }

        // New user, needs to submit prompt
        return {
          hasAccess: false,
          reason: 'NO_PROMPT_SUBMITTED',
          message: 'Submit your first prompt to unlock access to the library',
          needsAction: 'SUBMIT_PROMPT',
          userData: newUserData
        }
      } catch (createError) {
        console.error('Failed to create user profile:', createError)
        // Clear the bad session
        await supabase.auth.signOut()
        return {
          hasAccess: false,
          reason: 'NOT_AUTHENTICATED',
          message: 'Failed to create profile. Please sign in again.',
          needsAction: 'SIGN_IN'
        }
      }
    }

    // Check if user has submitted a prompt
    if (!userData.has_submitted_prompt) {
      return {
        hasAccess: false,
        reason: 'NO_PROMPT_SUBMITTED',
        message: 'Submit your first prompt to unlock access to the library',
        needsAction: 'SUBMIT_PROMPT',
        userData
      }
    }

    // Check if user is approved member
    if (!userData.is_approved_member) {
      return {
        hasAccess: false,
        reason: 'PENDING_APPROVAL',
        message: 'Your prompt is under review. You\'ll get access once approved!',
        needsAction: 'WAIT_FOR_APPROVAL',
        userData
      }
    }

    // User has full access
    return {
      hasAccess: true,
      userData
    }

  } catch (error) {
    console.error('Access check error:', error)
    return {
      hasAccess: false,
      reason: 'ERROR',
      message: 'Unable to verify access. Please try again.',
      error
    }
  }
}

/**
 * Get detailed user status including initial prompt
 */
export async function getUserStatus() {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        prompts:prompts!user_id (
          id,
          title,
          status,
          is_initial_prompt,
          created_at,
          rejection_reason
        )
      `)
      .eq('id', user.id)
      .single()

    if (error) throw error

    // Find initial prompt
    const initialPrompt = data.prompts?.find(p => p.is_initial_prompt)

    return {
      ...data,
      initialPrompt,
      totalPrompts: data.prompts?.length || 0
    }
  } catch (error) {
    console.error('Get user status error:', error)
    return null
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data?.is_admin || false
  } catch (error) {
    console.error('Check admin error:', error)
    return false
  }
}

/**
 * Subscribe to access status changes
 * Useful for real-time updates when prompt is approved
 */
export function subscribeToAccessChanges(userId, callback) {
  const channel = supabase
    .channel(`user-access:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        console.log('Access status changed:', payload)
        callback(payload.new)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from access changes
 */
export async function unsubscribeFromAccessChanges(channel) {
  if (channel) {
    await supabase.removeChannel(channel)
  }
}
