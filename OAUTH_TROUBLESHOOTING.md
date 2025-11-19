# OAuth Redirect Loop - Troubleshooting Guide

## Problem
After signing in with Google, you're redirected back to the Google login page instead of accessing the app.

## Root Causes

### 1. **Supabase Site URL Not Set Correctly**
**Most Common Issue!**

**Check:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/daptpijlyyojkkizkxpa)
2. Click **Authentication** → **URL Configuration**
3. Verify **Site URL** is set to your production domain:
   ```
   https://your-vercel-app-name.vercel.app
   ```

**NOT** `http://localhost:5173` or `http://localhost:3000`!

If it's wrong, update it and test again.

---

### 2. **Non-Stanford Email**
If you're not using a `@stanford.edu` email, the app will reject the sign-in.

**Solution:**
- Use your Stanford email for sign-in
- OR use the bypass code (click trophy 🏆 → enter "Easy")

---

### 3. **Database RLS Policy Error**
If the user profile can't be created due to RLS policies.

**Check browser console (F12) for:**
```
❌ Auth callback error: new row violates row-level security policy
```

**Fix:**
Run this SQL in Supabase SQL Editor:
```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

### 4. **Google OAuth Redirect URI Not Configured**
**Check:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, verify you have:
   ```
   https://daptpijlyyojkkizkxpa.supabase.co/auth/v1/callback
   ```

---

## Debugging Steps

### Step 1: Open Browser Console
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Try signing in again
4. Look for error messages (especially ones with ❌)

### Step 2: Check the Logs
Look for these patterns in console:

**Good flow:**
```
🔐 Auth event: SIGNED_IN User: yourname@stanford.edu
✅ User signed in: yourname@stanford.edu
✅ Stanford email validated
📝 Creating/updating user profile...
✅ Profile created/updated
```

**Bad flow - Non-Stanford email:**
```
🔐 Auth event: SIGNED_IN User: yourname@gmail.com
❌ Non-Stanford email detected: yourname@gmail.com
```

**Bad flow - Database error:**
```
✅ Stanford email validated
📝 Creating/updating user profile...
❌ Auth callback error: [error details]
```

### Step 3: Share the Error
Copy the full error from console and share it. The detailed logs will show exactly what's failing.

---

## Quick Fixes

### Fix 1: Use Access Code Bypass
**For testing without OAuth:**
1. Go to sign-in page
2. Click the trophy icon (🏆 Community Driven)
3. Enter code: `Easy`
4. You'll bypass all authentication

### Fix 2: Clear Browser Data
Sometimes cached redirect URLs cause issues:
1. Open browser settings
2. Clear browsing data (cookies and cache)
3. Close all browser windows
4. Try signing in again

### Fix 3: Use Incognito/Private Window
Test in a private browsing window to rule out cache issues.

---

## Verification Checklist

After making changes, verify:

- [ ] Supabase Site URL is set to production domain
- [ ] Google OAuth redirect URI includes Supabase callback
- [ ] Redirect URLs in Supabase include production domain with `/**`
- [ ] Using `@stanford.edu` email for sign-in
- [ ] Browser console shows no errors
- [ ] Can successfully sign in and see the app

---

## Still Not Working?

1. **Check browser console** - Look for the detailed error logs
2. **Try bypass mode** - Use the "Easy" access code to test the app
3. **Share console logs** - Copy the full error output for debugging

The new logging added will show exactly where the auth flow is breaking!
