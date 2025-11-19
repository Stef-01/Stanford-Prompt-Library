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
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('[Supabase Config] ✅ Supabase client created successfully')
