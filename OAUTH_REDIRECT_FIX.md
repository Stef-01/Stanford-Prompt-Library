# Fix OAuth Redirect to Localhost After Sign In

## Problem
After signing in on Vercel production, you're redirected to `localhost:3000` instead of your Vercel URL.

## Root Cause
Supabase has the wrong Site URL configured. It's still pointing to localhost instead of your production domain.

---

## Quick Fix (5 minutes)

### Step 1: Update Supabase Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/daptpijlyyojkkizkxpa)
2. Click **Authentication** (in left sidebar)
3. Click **URL Configuration** tab
4. Update these fields:

   **Site URL:**
   ```
   https://your-vercel-app-name.vercel.app
   ```

   **Redirect URLs (add both):**
   ```
   https://your-vercel-app-name.vercel.app/**
   http://localhost:5173/**
   ```

5. Click **Save**

### Step 2: Update Google Cloud Console (if not already done)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on your **OAuth 2.0 Client ID**
3. Under **Authorized JavaScript origins**, add:
   ```
   https://your-vercel-app-name.vercel.app
   ```

4. Under **Authorized redirect URIs**, ensure you have:
   ```
   https://daptpijlyyojkkizkxpa.supabase.co/auth/v1/callback
   ```

5. Click **Save**

### Step 3: Test

1. Go to your Vercel URL
2. Sign out (if signed in)
3. Sign in again
4. You should now stay on your Vercel domain after OAuth

---

## Why This Happens

The OAuth flow works like this:

1. User clicks "Sign in with Google" on your site
2. Redirected to Google OAuth
3. User approves
4. Google redirects to Supabase callback URL
5. **Supabase redirects to the "Site URL" configured in its settings**
6. If Site URL is `localhost:3000`, that's where you end up!

The fix is making sure Supabase knows your production URL.

---

## Verification Checklist

After making changes, verify:

- [ ] Supabase Site URL is set to your Vercel domain
- [ ] Supabase Redirect URLs includes your Vercel domain with `/**`
- [ ] Google Cloud Console has Vercel domain in authorized origins
- [ ] Google Cloud Console has Supabase callback URL
- [ ] Tested sign-in flow from production - stays on production domain
- [ ] Tested sign-in flow from localhost - works for development

---

## Still Having Issues?

### Error: "redirect_uri_mismatch"

**Fix:** Make sure Google Cloud Console has:
```
https://daptpijlyyojkkizkxpa.supabase.co/auth/v1/callback
```

### Error: "Invalid redirect URL"

**Fix:** In Supabase → Authentication → URL Configuration, add your domain to the allowed list with `/**` wildcard.

### Error: Still redirecting to localhost

**Fix:**
1. Clear browser cache and cookies
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Try in incognito/private window
4. Double-check Supabase Site URL is saved correctly

---

## Quick Reference

**Your Supabase Project:** https://supabase.com/dashboard/project/daptpijlyyojkkizkxpa
**Authentication Settings:** https://supabase.com/dashboard/project/daptpijlyyojkkizkxpa/auth/url-configuration
**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

---

**That's it! Your OAuth should now work correctly on production. 🎉**
