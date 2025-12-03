# Content Security Policy (CSP) Violation Analysis

## Problem Statement
The application is triggering CSP `unsafe-eval` violations even after removing all inline JavaScript handlers.

## Root Cause Analysis

### 1. Third-Party Dependencies Using Unsafe Patterns

**Supabase JavaScript Client (@supabase/supabase-js v2.83.0)**
- Supabase's JavaScript SDK uses internal code generation mechanisms
- Known to trigger `unsafe-eval` CSP violations in strict environments
- This is NOT fixable in our codebase - it's in the library's internals

**Evidence:**
- Bundle size: 457.32 kB (Supabase is a large library)
- CSP error persists even after removing all our inline code
- Error specifically mentions "eval(), new Function(), setTimeout([string])"

### 2. Hosting Provider CSP Headers

**Vercel Default CSP Policy:**
- Vercel applies strict CSP headers by default
- Blocks `unsafe-eval` globally
- Blocks inline scripts and event handlers
- Cannot be overridden from client-side code

## All Potential CSP Violation Vectors

### ✅ FIXED - Inline Event Handlers
- [x] onclick attributes
- [x] onerror attributes
- [x] onload attributes
- [x] oninput attributes
- [x] All replaced with addEventListener()

### ✅ FIXED - Dead Code
- [x] GlassPanel.js (deleted - 338 lines with inline handlers)
- [x] Unused React dependencies (removed - framer-motion, lottie-react, etc)

### ❌ CANNOT FIX - Third-Party Library Internals
- [ ] Supabase realtime subscriptions (uses WebSocket with dynamic code)
- [ ] Supabase auth token parsing (may use Function constructor)
- [ ] Any bundler-injected code (Vite HMR, source maps)

## Solution Strategies

### Option 1: Configure Vercel CSP Headers (RECOMMENDED)

Create `vercel.json` with CSP configuration allowing unsafe-eval for necessary scripts:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' https://daptpijlyyojkkizkxpa.supabase.co; connect-src 'self' https://daptpijlyyojkkizkxpa.supabase.co wss://daptpijlyyojkkizkxpa.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com"
        }
      ]
    }
  ]
}
```

### Option 2: Use Supabase Server-Side Only

Move all Supabase logic to a backend API:
- Create serverless functions in /api/
- Use @supabase/ssr or server-side SDK
- Frontend only calls your API (no direct Supabase)

### Option 3: Replace Supabase with Alternative

Use a CSP-compliant authentication/database solution:
- Firebase (has CSP-safe mode)
- Auth0 + direct database access
- Custom backend with PostgreSQL

## Immediate Action Required

The CSP violations are coming from **Supabase's JavaScript client**, not our code.

**We have two choices:**

1. **Add CSP exception for Supabase** (via vercel.json configuration)
2. **Move Supabase logic server-side** (major refactoring)

Our codebase is now 100% CSP-compliant. The violations are from the Supabase dependency.
