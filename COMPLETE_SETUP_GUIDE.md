# 🚀 Complete Setup Guide - Stanford Prompt Library

## Overview

This guide walks you through setting up the Stanford Prompt Library from scratch. All code is ready - you just need to configure your environment and database.

**Time to complete**: ~5 minutes

---

## Prerequisites

- ✅ Supabase account (free tier works)
- ✅ Node.js installed
- ✅ Git repository cloned

---

## Setup Checklist

### ☐ Step 1: Environment Variables (2 minutes)

**Issue if skipped**: App won't load, missing .env errors

1. Navigate to app directory:
   ```bash
   cd app
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Get Supabase credentials:
   - Go to https://app.supabase.com
   - Select your project
   - Click **Settings** → **API**
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public** key (starts with `eyJhbGc...`)

4. Edit `app/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_APP_URL=http://localhost:5173
   ```

5. Verify in console (after starting dev server):
   ```
   [Supabase Config] VITE_SUPABASE_URL: ✓ Set
   [Supabase Config] VITE_SUPABASE_ANON_KEY: ✓ Set
   ```

**Documentation**: See `ENV_SETUP.md` for detailed instructions

---

### ☐ Step 2: Database Setup (2 minutes)

**Issue if skipped**: Authentication loop, opportunities don't load

1. Open https://app.supabase.com
2. Go to **SQL Editor**
3. Run **3 files** in order:

#### File 1: Core Schema
📁 `app/database/schema.sql`

- Creates `users`, `prompts`, `likes`, `categories` tables
- Sets up RLS policies
- Creates indexes
- **Critical**: Without this, you'll see authentication loops

#### File 2: Opportunities Schema
📁 `app/database/opportunities-schema.sql`

- Creates `opportunities` and `opportunity_saves` tables
- Sets up full-text search
- Creates analytics functions
- **Critical**: Without this, Opportunities page will be empty

#### File 3: RLS Fix
📁 `app/database/fix-opportunities-rls.sql`

- Grants anonymous access to public opportunities
- Fixes 401 errors
- **Critical**: Without this, you'll get 401 Unauthorized errors

**Optional - Add Sample Data**:
- Run `app/database/seed-opportunities.sql` to add 20+ real Stanford AI opportunities

**Verify Setup**:
```sql
-- Should return a number (0 if empty, 20+ if seeded)
SELECT COUNT(*) FROM opportunities;

-- Should return 0 (table exists but no users yet)
SELECT COUNT(*) FROM users;
```

**Documentation**:
- `QUICKSTART_OPPORTUNITIES.md` - Database setup
- `AUTH_LOOP_FIX.md` - Authentication issues
- `SUPABASE_401_FIX.md` - RLS policy details

---

### ☐ Step 3: Install Dependencies

```bash
cd app
npm install
```

---

### ☐ Step 4: Start Dev Server

```bash
npm run dev
```

Open http://localhost:5173

---

## Verification Checklist

### ✅ Environment Variables Working

**Check console** (F12):
```
[Supabase Config] ✓ Set
[Supabase Config] ✓ Set
[Supabase Config] ✅ Creating Supabase client...
[Supabase Config] ✅ Supabase client created successfully
```

**If you see** ✗ Missing:
- Check `app/.env` file exists
- Verify values are correct (no quotes needed)
- Restart dev server

---

### ✅ Database Setup Complete

**Sign in** with Google (Stanford email)

**What you should see**:
1. Sign in page → Click "Sign in with Google"
2. OAuth flow → Select your Stanford account
3. Redirect back to app
4. See one of these screens:
   - "Submit your first prompt" (correct - new user flow)
   - "Pending approval" (if you submitted a prompt)
   - Main app (if you're already approved)

**What you should NOT see**:
- ❌ Infinite loop back to sign-in page
- ❌ "Database Setup Required" error
- ❌ "Database Error" screen

**If you see errors**:
- Check browser console (F12) for detailed logs
- See `AUTH_LOOP_FIX.md` for troubleshooting

---

### ✅ Opportunities Page Working

**Navigate to Opportunities**:
- Click Opportunities icon (💼) in dock

**What you should see**:
- 20+ opportunity cards (if you ran seed-opportunities.sql)
- OR empty state "No opportunities found" (if no data seeded)
- Search bar and category filters
- No console errors

**What you should NOT see**:
- ❌ 401 Unauthorized errors in console
- ❌ "Table does not exist" errors
- ❌ Blank page with no UI

**If empty or errors**:
- Check console for specific error
- Run `SELECT COUNT(*) FROM opportunities` in Supabase
- See `OPPORTUNITIES_NOT_LOADING.md`

---

### ✅ Wallpapers Working

**Navigate to Settings**:
- Click Settings icon (⚙️) in dock
- Scroll to "Desktop Wallpaper" section

**What you should see**:
- 6 wallpaper options (grid layout)
- Gradient Mesh should be selected by default
- Animated gradient orbs in background
- Intensity slider (1-10)
- Color palette swatches (4 options)

**Test wallpapers**:
- Click different wallpaper → Should see animation change
- Drag intensity slider → Animation speed changes
- Click color palette → Colors update

**If not working**:
- Check console for errors
- Verify canvas is rendering
- Hard refresh (Ctrl+Shift+R)

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Symptom**: Big error box on page load

**Fix**:
1. Create `app/.env` from `app/.env.example`
2. Add your Supabase credentials
3. Restart dev server

**Doc**: `ENV_SETUP.md`

---

### Issue: Authentication Loop

**Symptom**: Sign in → Redirect to sign in → Loop forever

**Fix**:
1. Run `app/database/schema.sql` in Supabase
2. Refresh page
3. Sign in again

**Doc**: `AUTH_LOOP_FIX.md`

---

### Issue: Opportunities Page Empty

**Symptom**: Page loads but no cards show

**Fix**:
1. Check `.env` file exists and is configured
2. Run `app/database/opportunities-schema.sql`
3. Run `app/database/fix-opportunities-rls.sql`
4. Optional: Run `app/database/seed-opportunities.sql` for sample data
5. Refresh page

**Doc**: `OPPORTUNITIES_NOT_LOADING.md` → `ACTUAL_ISSUE_FOUND.md`

---

### Issue: 401 Unauthorized Errors

**Symptom**: Red 401 errors in console when loading opportunities

**Fix**:
1. Run `app/database/fix-opportunities-rls.sql` in Supabase
2. Refresh page

**Doc**: `SUPABASE_401_FIX.md`

---

### Issue: Wallpapers Not Visible

**Symptom**: Colors change but no animations

**Already Fixed**: This was fixed in commit `70c03ca`
- Enhanced all animations with better visuals
- Increased particle counts
- Added glow effects
- Fixed z-index issues

**If still not working**:
- Hard refresh (Ctrl+Shift+R)
- Check console for errors
- Verify canvas element exists in DOM

---

## Production Deployment

### Hosting Platform Setup

**Vercel, Netlify, etc.**:

1. Add environment variables in hosting dashboard:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_URL=https://your-domain.com
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

3. Configure OAuth redirect URLs in Supabase:
   - Dashboard → Authentication → URL Configuration
   - Add production URL to "Redirect URLs"

---

## Architecture Overview

### Frontend (Vite + React)
```
app/
├── src/
│   ├── components/     # UI components
│   ├── services/       # API layer
│   ├── config/         # Configuration
│   └── wallpapers/     # Animation system
├── database/           # SQL scripts
└── dist/              # Production build
```

### Database (Supabase/PostgreSQL)
```
Tables:
- users              # User profiles
- prompts            # User-submitted prompts
- opportunities      # Job/opportunity listings
- opportunity_saves  # User bookmarks
- likes             # Prompt likes

Features:
- RLS (Row Level Security)
- Full-text search
- Real-time subscriptions
- Analytics functions
```

---

## Key Features

### ✅ Implemented & Working

1. **Authentication**
   - Google OAuth with Stanford email validation
   - Session persistence
   - Auto sign-out on non-Stanford emails

2. **Gated Access System**
   - Must submit initial prompt for approval
   - Admin approval workflow
   - Real-time access updates

3. **Opportunities Page**
   - Bento grid layout with animated backgrounds
   - Full-text search
   - Category filtering
   - Bookmark system
   - 20+ real Stanford AI opportunities

4. **Animated Wallpapers**
   - 6 different animations
   - Adjustable intensity (1-10)
   - 4 color palettes
   - Integrated in Settings

5. **Enhanced Error Handling**
   - Beautiful error screens
   - Detailed console logging
   - Step-by-step fix instructions
   - No more infinite loops

---

## Documentation Index

| Issue | Guide |
|-------|-------|
| **Setting up .env** | `ENV_SETUP.md` |
| **Authentication loop** | `AUTH_LOOP_FIX.md` |
| **Opportunities empty** | `ACTUAL_ISSUE_FOUND.md` |
| **401 errors** | `SUPABASE_401_FIX.md` |
| **Quick opportunities setup** | `QUICKSTART_OPPORTUNITIES.md` |
| **Detailed diagnostics** | `OPPORTUNITIES_NOT_LOADING.md` |
| **Full deployment** | `DEPLOYMENT_READY.md` |

---

## Recent Fixes Summary

### Session Improvements:

1. **Wallpaper System** (Commit: `70c03ca`)
   - Enhanced animations with 80-180% more particles
   - Moved to Settings tab
   - Set Gradient Mesh as default

2. **Supabase 401 Fix** (Commit: `0c3deaa`)
   - Created RLS fix script
   - Grants anonymous access to public data

3. **Environment Setup** (Commit: `794900b`)
   - Identified missing .env file issue
   - Enhanced error logging
   - Created ENV_SETUP.md guide

4. **Authentication Loop Fix** (Commit: `8b610e2`)
   - Removed auto sign-out on DB errors
   - Added beautiful error screens
   - Session preservation for debugging

---

## Support & Troubleshooting

### Getting Help:

1. **Check browser console** (F12) for detailed error logs
2. **Review documentation** linked above for your specific issue
3. **Verify setup steps** completed in order
4. **Check Supabase dashboard** for database status

### Debug Mode:

Open browser console to see detailed logs:
```
[Supabase Config] ✓ Environment check
[Access Control] Fetching user profile
[Opportunities Service] ✅ Successfully fetched 20 opportunities
[Wallpaper Service] Applying wallpaper: gradient-mesh
```

---

## Success Criteria

✅ You're fully set up when:

1. Dev server starts without errors
2. Sign in works without loops
3. See "Submit Prompt" or main app after sign-in
4. Opportunities page shows cards (or empty state if not seeded)
5. Wallpapers animate in background
6. Settings shows wallpaper picker
7. No 401 errors in console

**Total setup time**: ~5 minutes
**All fixes committed**: Ready to deploy

---

## Next Steps After Setup

1. **Submit your first prompt** (if new user)
2. **Get admin approval** (mark yourself as admin in Supabase)
3. **Explore opportunities** page
4. **Customize wallpaper** in Settings
5. **Deploy to production** (follow deployment section above)

---

**Need help?** All issues encountered in this session have been documented with solutions. Check the relevant guide from the Documentation Index above! 🚀
