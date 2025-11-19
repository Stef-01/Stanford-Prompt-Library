# 🔧 Environment Setup Guide

## The Real Issue

**The opportunities don't load because the `.env` file doesn't exist.**

The Supabase table exists with 20 opportunities, but the frontend can't connect to fetch them because Supabase credentials aren't configured.

---

## Quick Fix (1 Minute)

### Step 1: Create `.env` File

```bash
cd app
cp .env.example .env
```

### Step 2: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Click **"Project Settings"** (gear icon)
4. Click **"API"** in left sidebar
5. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (looks like: `eyJhbGc...`)

### Step 3: Edit `.env` File

Open `app/.env` and paste your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://daptpijlyyojkkizkxpa.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...

# App Configuration
VITE_APP_URL=http://localhost:5173
```

**IMPORTANT**: Replace with YOUR actual values from Supabase Dashboard!

### Step 4: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Test

1. Open http://localhost:5173
2. Click **Opportunities** icon
3. You should see 20+ opportunity cards!

---

## How to Verify It's Working

### Check 1: Console Logs

Open browser console (F12) and look for:

```
[Supabase Config] Checking environment variables...
[Supabase Config] VITE_SUPABASE_URL: ✓ Set
[Supabase Config] VITE_SUPABASE_ANON_KEY: ✓ Set
[Supabase Config] ✅ Creating Supabase client...
[Supabase Config] ✅ Supabase client created successfully
```

✅ **Good!** - Environment variables are configured

❌ **Bad**:
```
[Supabase Config] VITE_SUPABASE_URL: ✗ Missing
[Supabase Config] VITE_SUPABASE_ANON_KEY: ✗ Missing
╔════════════════════════════════════════╗
║  ⚠️  MISSING SUPABASE ENVIRONMENT...   ║
╚════════════════════════════════════════╝
```

This means `.env` file isn't set up correctly.

### Check 2: Network Requests

In DevTools → Network tab, look for requests to:
```
https://xxxxx.supabase.co/rest/v1/opportunities
```

- **Status 200** ✅ Success
- **Status 401** ❌ RLS policies need fixing (run `fix-opportunities-rls.sql`)
- **No requests** ❌ Environment variables not configured

### Check 3: Opportunities Service Logs

```
[Opportunities Service] Fetching opportunities with filters: {...}
[Opportunities Service] ✅ Successfully fetched 20 opportunities
```

✅ **Good!** - Data is loading

---

## Common Errors

### Error 1: "Missing Supabase environment variables"

**Console shows**:
```
╔════════════════════════════════════════╗
║  ⚠️  MISSING SUPABASE ENVIRONMENT...   ║
╚════════════════════════════════════════╝
```

**Cause**: No `.env` file or empty values

**Fix**:
1. Make sure `app/.env` exists (not `.env.example`)
2. Make sure it contains actual values (not placeholders)
3. Restart dev server

### Error 2: "401 Unauthorized"

**Console shows**:
```
[Opportunities Service] ⚠️  AUTHENTICATION ERROR
[Opportunities Service] 1. Missing .env file
[Opportunities Service] 2. RLS policies blocking
[Opportunities Service] 3. Invalid ANON_KEY
```

**Cause**: Either:
- Wrong `VITE_SUPABASE_ANON_KEY`
- RLS policies blocking anonymous access

**Fix**:
1. Verify your anon key is correct (copy from Supabase Dashboard)
2. Run `app/database/fix-opportunities-rls.sql` in Supabase SQL Editor

### Error 3: Environment variables not loading in build

**Cause**: Vite only loads `.env` files during build/dev

**Fix**:
1. Make sure `.env` is in `app/` directory (not root)
2. Restart dev server completely
3. For production build: `npm run build` reads `.env` automatically

---

## File Structure

```
Stanford-Prompt-Library/
├── app/
│   ├── .env              ← CREATE THIS (your credentials)
│   ├── .env.example      ← Template with placeholders
│   └── src/
│       └── config/
│           └── supabase.js  ← Uses env vars
```

---

## Security Notes

### ⚠️ NEVER commit `.env` to Git

The `.env` file is already in `.gitignore` - it should NEVER be committed.

**Safe to commit**: `.env.example` (has placeholders)
**NEVER commit**: `.env` (has real credentials)

### anon key vs service_role key

- **anon public key** ✅ Safe to use in frontend (limited permissions)
- **service_role key** ❌ NEVER use in frontend (full admin access)

Always use the **anon public** key in your `.env` file.

---

## Verifying Database Connection

### Test 1: Check Supabase Client

```javascript
// Run in browser console
console.log(window.supabase ? 'Client exists' : 'Client missing')
```

### Test 2: Manual Query

```javascript
// Run in browser console
const { data, error } = await window.supabase
  .from('opportunities')
  .select('count')

console.log('Data:', data)
console.log('Error:', error)
```

**Expected**: `Data: [{ count: 20 }]`

---

## Production Deployment

For deployed sites (Vercel, Netlify, etc.):

1. Add environment variables in hosting dashboard
2. Use the same variable names:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy after adding variables

### Vercel
Dashboard → Settings → Environment Variables → Add

### Netlify
Site Settings → Build & Deploy → Environment → Add variable

---

## Summary

✅ **The Problem**: No `.env` file = No Supabase connection = Empty opportunities page

✅ **The Solution**:
1. Create `app/.env` from `app/.env.example`
2. Add your Supabase credentials
3. Restart dev server
4. See 20+ opportunities load!

**Time to fix**: 1-2 minutes

---

## Still Having Issues?

1. Check browser console for specific error messages
2. Verify `.env` file is in `app/` directory
3. Confirm you copied BOTH variables
4. Make sure dev server was restarted
5. Try hard refresh (Ctrl+Shift+R)

If opportunities still don't load after setting up `.env`, check:
- QUICKSTART_OPPORTUNITIES.md (database setup)
- OPPORTUNITIES_NOT_LOADING.md (detailed diagnostics)
- SUPABASE_401_FIX.md (RLS policy issues)
