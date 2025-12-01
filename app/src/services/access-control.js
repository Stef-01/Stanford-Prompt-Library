import { supabase } from '../config/supabase.js'
import { getCurrentUser, createUserProfile } from './auth.js'
import { isBypassActive } from '../utils/access-code.js'
import { createLogger } from '../utils/logger.js'

const log = createLogger('AccessControl')

/**
 * Check user's access level and return status
 * Returns object with hasAccess, reason, and user data
 */
export async function checkUserAccess() {
  try {
    // Bypass mode disabled - Stanford authentication only
    // if (isBypassActive()) {
    //   console.log('🔓 Bypass mode active - granting access')
    //   return {
    //     hasAccess: true,
    //     userData: {
    //       id: 'bypass-user',
    //       display_name: 'Testing Mode',
    //       email: 'test@stanford.edu',
    //       is_approved_member: true,
    //       has_submitted_prompt: true,
    //       is_admin: false
    //     }
    //   }
    // }

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
    log.debug(' Fetching user profile for:', user.id, user.email)
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle() // Use maybeSingle instead of single - won't error if no rows

    if (error) {
      log.error(' ❌ Error fetching user data:', error)
      log.error(' Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })

      // Check if this is a "table doesn't exist" error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        log.error(' ⚠️  USERS TABLE DOES NOT EXIST')
        log.error(' Run: app/database/schema.sql in Supabase SQL Editor')
        return {
          hasAccess: false,
          reason: 'DATABASE_SETUP_REQUIRED',
          message: 'Database setup required. See console for instructions.',
          error: error
        }
      }

      // For other database errors, DON'T sign out - keep session active
      log.error(' Database error, keeping session active for debugging')
      return {
        hasAccess: false,
        reason: 'DATABASE_ERROR',
        message: `Database error: ${error.message}`,
        error: error
      }
    }

    // If user doesn't exist in database, create profile
    if (!userData) {
      log.debug('User profile not found, creating...')
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
        log.error(' ❌ Failed to create user profile:', createError)
        log.error(' Profile creation error details:', {
          message: createError.message,
          code: createError.code,
          details: createError.details,
          hint: createError.hint
        })

        // DON'T sign out - keep session active so user can see error
        return {
          hasAccess: false,
          reason: 'PROFILE_CREATION_ERROR',
          message: `Failed to create profile: ${createError.message}`,
          error: createError
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
        log.debug('Access status changed:', payload)
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
