import { supabase } from '../config/supabase.js'

/**
 * Sign in with Google OAuth
 * Validates that user has @stanford.edu email
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Reload page to clear state
    window.location.href = '/'
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

/**
 * Validate that email is from Stanford
 */
export function isStanfordEmail(email) {
  if (!email) return false

  // Simple check for MVP - just @stanford.edu
  // Later we can add more subdomains
  return email.toLowerCase().endsWith('@stanford.edu')
}

/**
 * Create or update user profile in database
 */
export async function createUserProfile(user) {
  try {
    // Validate Stanford email
    if (!isStanfordEmail(user.email)) {
      throw new Error('Only Stanford email addresses (@stanford.edu) are allowed')
    }

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (error && error.code !== '23505') {
      // Ignore duplicate key errors
      throw error
    }

    return data
  } catch (error) {
    console.error('Create profile error:', error)
    throw error
  }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get profile error:', error)
    return null
  }
}

/**
 * Handle auth state changes
 * Call this on app initialization
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth event:', event, session?.user?.email)

    if (event === 'SIGNED_IN' && session?.user) {
      try {
        // Validate Stanford email
        if (!isStanfordEmail(session.user.email)) {
          await signOut()
          alert('Only Stanford email addresses are allowed. Please sign in with your @stanford.edu email.')
          return
        }

        // Create/update user profile
        await createUserProfile(session.user)

        // Get full profile
        const profile = await getUserProfile(session.user.id)

        callback(event, session, profile)
      } catch (error) {
        console.error('Auth callback error:', error)
        await signOut()
        alert('Authentication error: ' + error.message)
      }
    } else if (event === 'SIGNED_OUT') {
      callback(event, null, null)
    } else {
      callback(event, session, null)
    }
  })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Require authentication
 * Redirects to sign in if not authenticated
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    // Show sign in prompt
    return false
  }
  return true
}
