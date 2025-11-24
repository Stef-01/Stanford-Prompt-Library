# ⚙️ Supabase Authentication Configuration Guide

## Critical: This Must Be Done First!

Before users can sign in, you **must** configure the following in your Supabase Dashboard. Incorrect configuration is the #1 cause of authentication loops.

---

## 1. Get Your Project Details

You need:
- ✅ Your production URL: `https://your-app.vercel.app` (or wherever you deploy)
- ✅ Your Supabase project ID: Found in Supabase Dashboard URL
- ✅ Your Supabase URL: `https://[project-id].supabase.co`

---

## 2. Configure Supabase Dashboard

### Step 1: Open Supabase Dashboard

1. Go to: https://app.supabase.com
2. Select your project
3. Navigate to: **Authentication** (left sidebar)

### Step 2: Configure URL Settings

Click: **Authentication → URL Configuration**

#### Site URL
Set to your **primary production domain** (NO trailing slash):
```
https://your-app.vercel.app
```

❌ **Wrong:**
- `https://your-app.vercel.app/` (trailing slash)
- `http://your-app.vercel.app` (wrong protocol)
- `localhost:5173` (dev URL in production)

✅ **Right:**
- `https://your-app.vercel.app`

#### Redirect URLs
Add **all** domains where users might access your app (with wildcard):

**For production + local dev:**
```
https://your-app.vercel.app/**
http://localhost:5173/**
http://127.0.0.1:5173/**
```

**If you have multiple domains:**
```
https://your-app.vercel.app/**
https://your-app.com/**
https://www.your-app.com/**
http://localhost:5173/**
```

**Important:**
- Each line is a separate redirect URL
- Include `/**` wildcard at the end
- Add both `localhost` and `127.0.0.1` for local dev
- Include `www` and non-`www` if both are used

#### Additional Redirect URLs
Leave empty unless you have specific requirements.

### Step 3: Configure Google OAuth Provider

Click: **Authentication → Providers → Google**

#### Enable Google Auth
- ✅ Check "Enabled"

#### Client ID
Paste your Google OAuth Client ID from Google Cloud Console:
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```

#### Client Secret
Paste your Google OAuth Client Secret:
```
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

#### Authorized Client IDs (optional)
Leave empty for now.

#### Skip nonce check (optional)
Leave unchecked (more secure).

**Click "Save"**

---

## 3. Configure Google Cloud Console

You also need to configure Google's side of OAuth.

### Step 1: Open Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Select your project (or create one)
3. Navigate to: **APIs & Services → Credentials**

### Step 2: Create OAuth 2.0 Client ID

If you don't have one yet:

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `Stanford Prompt Library` (or whatever you prefer)

### Step 3: Configure OAuth Client

#### Authorized JavaScript origins
Add the domains where your app runs:

**For production + local dev:**
```
https://your-app.vercel.app
http://localhost:5173
http://localhost
```

❌ **Don't include:**
- Paths (e.g., `https://your-app.vercel.app/auth`)
- Trailing slashes
- Wildcards

✅ **Just the origins:**
- `https://your-app.vercel.app`

#### Authorized redirect URIs
**This is critical!** Add your **Supabase callback URL**:

```
https://[your-project-id].supabase.co/auth/v1/callback
```

**Example:**
```
https://daptpijlyyojkkizkxpa.supabase.co/auth/v1/callback
```

**How to find your project ID:**
- Open Supabase Dashboard
- Look at the URL: `https://supabase.com/dashboard/project/[this-is-your-project-id]`
- Or check your `VITE_SUPABASE_URL` in .env file

**Important:**
- Must be exactly: `https://[project-id].supabase.co/auth/v1/callback`
- No wildcards
- No additional paths
- HTTPS only (Supabase doesn't use HTTP)

### Step 4: Copy Credentials

After creating/updating:

1. Copy the **Client ID**
2. Copy the **Client Secret**
3. Paste both into Supabase Dashboard (Step 3 above)

---

## 4. Configure Environment Variables

In your app's `.env` file (or deployment platform):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here

# App Configuration
VITE_APP_URL=https://your-app.vercel.app
```

### Where to find Supabase credentials:

1. Open Supabase Dashboard
2. Go to: **Settings → API**
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Setting in Vercel:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://...`
   - Environment: Production (and Preview if needed)
3. Click "Save"
4. **Redeploy** after adding variables

---

## 5. Verification Checklist

Before testing, verify:

### Supabase Dashboard:
- [ ] Site URL is set correctly (no trailing slash)
- [ ] Redirect URLs include your domain with `/**`
- [ ] Google OAuth is enabled
- [ ] Client ID and Secret are configured
- [ ] Changes are saved

### Google Cloud Console:
- [ ] Authorized JavaScript origins include your domain
- [ ] Authorized redirect URIs include Supabase callback URL
- [ ] OAuth consent screen is configured
- [ ] Changes are saved

### Environment Variables:
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] `VITE_APP_URL` is set (production)
- [ ] Variables are deployed/restarted

---

## 6. Test the Configuration

### Local Testing:

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:5173`
3. Open browser console (F12)
4. Look for: `[Config Validation] Starting auth configuration check...`
5. Check for any errors or warnings
6. Click "Sign in with Stanford Email"
7. Should redirect to Google
8. After selecting account, should redirect back
9. Console should show: `[Supabase Auth] ✅ Sign-in successful`

### Production Testing:

1. Deploy your app
2. Open production URL
3. Open browser console
4. Click "Sign in with Stanford Email"
5. Complete OAuth flow
6. Should stay signed in (no loop!)

---

## Common Configuration Mistakes

### ❌ Mistake 1: Trailing Slash Mismatch
```
Supabase Site URL: https://myapp.com/
App redirects to:   https://myapp.com
Result: OAuth callback fails
```

**Fix:** Remove trailing slash from Site URL

### ❌ Mistake 2: Wrong Protocol
```
Supabase Site URL: http://myapp.com
App uses:          https://myapp.com
Result: OAuth callback fails
```

**Fix:** Use HTTPS in production

### ❌ Mistake 3: Missing Wildcard
```
Redirect URL: https://myapp.com
User lands on: https://myapp.com/dashboard
Result: Redirect not allowed
```

**Fix:** Add `/**` wildcard: `https://myapp.com/**`

### ❌ Mistake 4: Wrong Callback URL
```
Google redirect URI: https://myapp.com/auth/callback
Supabase expects:    https://[project].supabase.co/auth/v1/callback
Result: OAuth fails
```

**Fix:** Use Supabase callback URL, not your app URL

### ❌ Mistake 5: Forgot to Deploy Env Vars
```
Set VITE_APP_URL locally
Forgot to set in Vercel
Result: Production uses wrong URL
```

**Fix:** Set environment variables in deployment platform

---

## Troubleshooting

### Issue: 401 Error on `/auth/v1/user`

**Cause:** OAuth callback not completing, session not established

**Check:**
1. Browser console for: `[Auth] Redirect URL: ...`
2. Does it match Supabase Site URL exactly?
3. Is redirect URL in Supabase "Redirect URLs" list?

**Fix:**
- Ensure Site URL and `VITE_APP_URL` match
- Add redirect URL with `/**` wildcard

### Issue: "Redirect URI mismatch" Error from Google

**Cause:** Google redirect URI not configured correctly

**Check:**
1. Error message shows expected URI
2. Compare with what's in Google Cloud Console

**Fix:**
- Add exact Supabase callback URL to Google Cloud Console
- Format: `https://[project-id].supabase.co/auth/v1/callback`

### Issue: "URL not allowed" Error from Supabase

**Cause:** App URL not in Supabase Redirect URLs

**Check:**
1. Browser console for: `[Auth] Current URL: ...`
2. Is this URL in Supabase Redirect URLs?

**Fix:**
- Add URL to Supabase Redirect URLs with `/**`
- Include both `www` and non-`www` if needed

### Issue: Works Locally, Fails in Production

**Cause:** Environment variables not set in production

**Check:**
1. Vercel/deployment platform environment variables
2. Is `VITE_APP_URL` set?

**Fix:**
- Add all environment variables to deployment platform
- Redeploy after adding variables

---

## Quick Reference

### Supabase Dashboard Locations:

- **URL Configuration:** Authentication → URL Configuration
- **Google OAuth:** Authentication → Providers → Google
- **API Keys:** Settings → API
- **Auth Logs:** Authentication → Logs

### Google Cloud Console Locations:

- **OAuth Credentials:** APIs & Services → Credentials
- **OAuth Consent Screen:** APIs & Services → OAuth consent screen

### Key URLs to Configure:

1. **Supabase Site URL:** Your app domain (no trailing slash)
2. **Supabase Redirect URLs:** Your app domain + `/**`
3. **Google JavaScript Origins:** Your app domain
4. **Google Redirect URI:** `https://[project].supabase.co/auth/v1/callback`

---

## Support

If you're still having issues:

1. Check browser console logs
2. Check Supabase Auth logs (Dashboard → Authentication → Logs)
3. Run config validator: `validateAuthConfig()` in console
4. Compare your configuration with this guide

The enhanced logging will show exactly what's happening at each step.

---

**Last Updated:** 2025-11-24
**Related Docs:** OAUTH_AUTH_LOOP_FIX.md, ENV_SETUP.md
