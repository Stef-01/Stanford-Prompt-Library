# Deploy Stanford Prompt Library to Vercel

## Prerequisites

1. ✅ **Supabase database** - Already configured with all tables
2. ✅ **Google OAuth credentials** - Already set up
3. ⏳ **Vercel account** - Sign up at https://vercel.com
4. ⏳ **Categories seeded** - Run `seed-categories.sql` in Supabase

---

## Step 1: Seed Categories

Before deploying, populate the categories table:

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `seed-categories.sql`
4. Click **Run**
5. You should see 8 categories inserted

---

## Step 2: Create Vercel Project

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Click "Sign Up" or "Login"
   - Use GitHub to authenticate

2. **Import GitHub Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find `Stanford-Prompt-Library`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**

   Click "Environment Variables" and add these:

   ```
   VITE_SUPABASE_URL=https://daptpijlyyojkkizkxpa.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhcHRwaWpseXlvamtraXpreHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTQ1ODQsImV4cCI6MjA3OTA3MDU4NH0.aTMEMTvwJ3kuvI4zHFT9QtH-Gk1HaJo7i1eI1IGSBFc
   VITE_APP_URL=https://your-app-name.vercel.app
   ```

   (Replace `your-app-name` with your actual Vercel domain after first deploy)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - You'll get a URL like `https://stanford-prompt-library.vercel.app`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? stanford-prompt-library
# - Directory? app
# - Override settings? No

# Set environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://daptpijlyyojkkizkxpa.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add VITE_APP_URL
# Paste: Your production URL

# Deploy to production
vercel --prod
```

---

## Step 3: Update Google OAuth Redirect URLs

After deployment, you'll have a production URL. Update Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://daptpijlyyojkkizkxpa.supabase.co/auth/v1/callback
   ```
5. Also add your Vercel domain:
   ```
   https://your-app-name.vercel.app
   ```
6. Click **Save**

7. Go back to Supabase → **Authentication** → **Providers** → **Google**
8. Verify the redirect URL is set correctly
9. Add your production domain to **Site URL** and **Redirect URLs**

---

## Step 4: Make Yourself Admin

Once deployed and you've signed in to production:

1. Go to Supabase → **Table Editor** → **users**
2. Find your user record (your email)
3. Set `is_admin` = `true`
4. Click **Save**

Now you can approve prompts in production!

---

## Step 5: Test Production Deployment

1. **Visit your production URL**
2. **Sign in with Stanford email**
3. **Submit a test prompt**
4. **Approve it in Supabase** (Table Editor → prompts → change status to 'approved')
5. **Verify you gain access to main app**
6. **Test all features:**
   - Browse prompts
   - Search
   - Filter by category
   - Like prompts
   - Copy/export
   - Leaderboard

---

## Step 6: Continuous Deployment

Every time you push to your branch, Vercel will automatically:
- Build the app
- Run tests (if configured)
- Deploy to a preview URL
- Auto-deploy to production when you merge to main

To enable this:
1. Push changes: `git push origin your-branch`
2. Vercel detects the push
3. Builds and creates preview deployment
4. Preview URL shared in GitHub (if connected)

---

## Troubleshooting

### Build Fails

**Error:** `ENOENT: no such file or directory`
- **Fix:** Ensure Root Directory is set to `app` in Vercel settings

**Error:** `Missing environment variables`
- **Fix:** Add all VITE_* variables in Vercel → Project Settings → Environment Variables

### OAuth Fails in Production

**Error:** `redirect_uri_mismatch`
- **Fix:** Add your production Vercel URL to Google Cloud Console authorized redirect URIs

### App Shows Blank Screen

**Error:** Environment variables not loaded
- **Fix:** In Vercel, ensure all VITE_* variables are set for **Production** environment
- **Fix:** Redeploy after adding variables

### Database Connection Fails

**Error:** `Failed to fetch`
- **Fix:** Verify Supabase URL and anon key are correct
- **Fix:** Check Supabase project is not paused (free tier)

---

## Post-Deployment Checklist

- [ ] Categories seeded in database
- [ ] Deployed to Vercel successfully
- [ ] OAuth redirect URLs updated
- [ ] Environment variables set in production
- [ ] Made yourself admin
- [ ] Tested sign-in flow
- [ ] Tested prompt submission
- [ ] Tested approval workflow
- [ ] Tested all features (browse, search, filter, like, export)
- [ ] Checked mobile responsiveness
- [ ] Monitored for errors (Vercel dashboard)

---

## Next Steps

1. **Soft launch** to a small group of Stanford users
2. **Monitor Supabase logs** for errors
3. **Gather feedback** on UX and features
4. **Iterate** based on user feedback
5. **Add remaining features** from phase 2:
   - Multi-domain Stanford validation
   - Advanced admin dashboard
   - Vector dedup
   - Replicability testing

---

## Production URLs

- **App**: https://your-app-name.vercel.app
- **Supabase**: https://daptpijlyyojkkizkxpa.supabase.co
- **GitHub**: https://github.com/Stef-01/Stanford-Prompt-Library

---

## Support

If you encounter issues:
- Check Vercel deployment logs
- Check Supabase logs (Dashboard → Logs)
- Check browser console for frontend errors
- Review this deployment guide

**You're ready to launch! 🚀**
