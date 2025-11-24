import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[Supabase Config] Checking environment variables...')
console.log('[Supabase Config] VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
console.log('[Supabase Config] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  MISSING SUPABASE ENVIRONMENT VARIABLES                    ║
╚════════════════════════════════════════════════════════════════╝

The application cannot connect to Supabase because environment
variables are not configured.

QUICK FIX:
1. Copy: app/.env.example → app/.env
2. Get credentials from Supabase Dashboard:
   → https://app.supabase.com
   → Project Settings → API
3. Add to app/.env:
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
4. Restart dev server: npm run dev

Missing: ${!supabaseUrl ? 'VITE_SUPABASE_URL ' : ''}${!supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''}

See: ENV_SETUP.md for detailed instructions
  `
  console.error(errorMsg)
  throw new Error('Missing Supabase environment variables. See console for setup instructions.')
}

console.log('[Supabase Config] ✅ Creating Supabase client...')
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensure OAuth callbacks are detected automatically
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,

    // Use PKCE flow for OAuth (more secure, better compatibility)
    flowType: 'pkce',

    // Ensure proper storage
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',

    // Debug mode for better error messages in development
    debug: import.meta.env.DEV
  }
})
console.log('[Supabase Config] ✅ Supabase client created successfully')

// Log initial session status
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('[Supabase] ❌ Initial session check error:', error)
  } else if (data.session) {
    console.log('[Supabase] ✅ Active session found:', data.session.user.email)
    console.log('[Supabase] Session expires:', new Date(data.session.expires_at * 1000).toLocaleString())
  } else {
    console.log('[Supabase] No active session')
  }
})

// Monitor all auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`[Supabase Auth] Event: ${event}`)

  if (event === 'SIGNED_IN') {
    console.log('[Supabase Auth] ✅ Sign-in successful:', session?.user?.email)
  } else if (event === 'SIGNED_OUT') {
    console.log('[Supabase Auth] 👋 User signed out')
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('[Supabase Auth] 🔄 Token refreshed')
  } else if (event === 'USER_UPDATED') {
    console.log('[Supabase Auth] 📝 User updated')
  } else if (event === 'INITIAL_SESSION') {
    console.log('[Supabase Auth] 🔍 Initial session:', session ? 'exists' : 'none')
  }

  if (session) {
    console.log('[Supabase Auth] Session expires at:', new Date(session.expires_at * 1000).toLocaleString())
  }
})
