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
    console.log('🔐 Auth event:', event, 'User:', session?.user?.email || 'none')
    console.log('🔐 Session details:', session ? 'exists' : 'null')

    if (event === 'SIGNED_IN' && session?.user) {
      try {
        console.log('✅ User signed in:', session.user.email)

        // Validate Stanford email
        if (!isStanfordEmail(session.user.email)) {
          console.error('❌ Non-Stanford email detected:', session.user.email)
          // Don't auto sign out - let user see the error
          alert(`❌ Access Denied\n\nOnly Stanford email addresses (@stanford.edu) are allowed.\n\nYou signed in with: ${session.user.email}\n\nPlease sign in with your Stanford email.`)
          await supabase.auth.signOut({ scope: 'local' })
          window.location.href = '/'
          return
        }

        console.log('✅ Stanford email validated')

        // Create/update user profile
        console.log('📝 Creating/updating user profile...')
        const profileData = await createUserProfile(session.user)
        console.log('✅ Profile created/updated:', profileData)

        // Get full profile
        console.log('📋 Fetching user profile...')
        const profile = await getUserProfile(session.user.id)
        console.log('✅ Profile fetched:', profile ? 'success' : 'failed')

        callback(event, session, profile)
      } catch (error) {
        console.error('❌ Auth callback error:', error)
        console.error('Error details:', {
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
      console.log('👋 User signed out')
      callback(event, null, null)
    } else {
      console.log('🔄 Other auth event:', event)
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
