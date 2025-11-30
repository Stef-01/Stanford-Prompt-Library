import { supabase } from '../config/supabase.js'
import { createLogger } from '../utils/logger.js'

const log = createLogger('Auth')

/**
 * Sign in with Google OAuth
 * Validates that user has @stanford.edu email
 */
export async function signInWithGoogle() {
  try {
    // Use environment variable if available, fallback to current origin
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin

    log.debug('🔐 Starting Google OAuth flow...')
    log.debug('🔐 Current URL:', window.location.origin)
    log.debug('🔐 Redirect URL:', redirectUrl)
    log.debug('🔐 Using env var:', import.meta.env.VITE_APP_URL ? 'Yes' : 'No (dynamic)')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
          // Hint for Stanford domain to help Google pre-select correct account
          hd: 'stanford.edu'
        },
        // Don't skip browser redirect
        skipBrowserRedirect: false
      }
    })

    if (error) {
      log.error('❌ [Auth] OAuth initiation error:', error)
      throw error
    }

    log.debug('✅ [Auth] OAuth redirect initiated')
    return data
  } catch (error) {
    log.error('❌ [Auth] Sign in error:', error)
    log.error('❌ [Auth] Error details:', {
      message: error.message,
      status: error.status,
      name: error.name
    })
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
    log.error('Sign out error:', error)
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
    log.error('Get user error:', error)
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
    log.error('Get session error:', error)
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
    log.error('Create profile error:', error)
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
    log.error('Get profile error:', error)
    return null
  }
}

/**
 * Handle auth state changes
 * Call this on app initialization
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    log.debug('🔐 Auth event:', event, 'User:', session?.user?.email || 'none')
    log.debug('🔐 Session details:', session ? 'exists' : 'null')

    if (event === 'SIGNED_IN' && session?.user) {
      try {
        log.debug('✅ User signed in:', session.user.email)

        // Validate Stanford email
        if (!isStanfordEmail(session.user.email)) {
          log.error('❌ Non-Stanford email detected:', session.user.email)
          // Don't auto sign out - let user see the error
          alert(`❌ Access Denied\n\nOnly Stanford email addresses (@stanford.edu) are allowed.\n\nYou signed in with: ${session.user.email}\n\nPlease sign in with your Stanford email.`)
          await supabase.auth.signOut({ scope: 'local' })
          window.location.href = '/'
          return
        }

        log.debug('✅ Stanford email validated')

        // Create/update user profile
        log.debug('📝 Creating/updating user profile...')
        const profileData = await createUserProfile(session.user)
        log.debug('✅ Profile created/updated:', profileData)

        // Get full profile
        log.debug('📋 Fetching user profile...')
        const profile = await getUserProfile(session.user.id)
        log.debug('✅ Profile fetched:', profile ? 'success' : 'failed')

        callback(event, session, profile)
      } catch (error) {
        log.error('❌ Auth callback error:', error)
        log.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })

        // Show detailed error instead of generic message
        alert(`❌ Authentication Error\n\n${error.message}\n\nPlease try again or contact support if the issue persists.`)

        // Sign out locally without redirecting to avoid loops
        await supabase.auth.signOut({ scope: 'local' })
        window.location.href = '/'
      }
    } else if (event === 'SIGNED_OUT') {
      log.debug('👋 User signed out')
      callback(event, null, null)
    } else {
      log.debug('🔄 Other auth event:', event)
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
