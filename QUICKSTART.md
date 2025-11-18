# Stanford Prompt Library - Quick Start Guide

## Current Status ✅

- ✅ Project initialized with Vite
- ✅ Supabase configuration created (.env file)
- ✅ All backend services implemented (auth, access-control, prompts)
- ✅ All UI components created (gates + main app)
- ✅ Development server tested and working
- ⏳ **Next: Database setup and testing**

## Step 1: Set Up Database

### Important Note About SQL Migration

When you tried to run the SQL migration, you got this error:
```
ERROR: 42601: syntax error at or near "app"
LINE 1: app/database/schema.sql
```

This happened because you pasted the **file path** instead of the **SQL content**.

### How to Fix It

1. Open the file `app/database/schema.sql` in your editor
2. **Select ALL the SQL code** (it should start with `-- Stanford Prompt Library - MVP Database Schema`)
3. Copy the entire content (351 lines)
4. Go to your Supabase Dashboard: https://daptpijlyyojkkizkxpa.supabase.co
5. Navigate to: **SQL Editor** (in the left sidebar)
6. Click **New Query**
7. **Paste the SQL content** (not the file path!)
8. Click **Run** or press `Ctrl+Enter`

You should see:
```
Success. No rows returned
```

### Verify Database Setup

After running the SQL, go to **Table Editor** in Supabase and verify these tables exist:
- ✓ users
- ✓ prompts
- ✓ likes
- ✓ categories

## Step 2: Start Development Server

From the `app` directory:

```bash
cd app
npm run dev
```

You should see:
```
VITE v7.2.2  ready in 267 ms

➜  Local:   http://localhost:5173/
```

Open http://localhost:5173/ in your browser.

## Step 3: Test the Complete Flow

### 3.1 Test Sign In (Gate 1)

1. You should see the **Sign In Gate** with:
   - "Stanford Prompt Library" title
   - Google sign-in button
   - List of features
   - "How it works" section

2. Click **"Sign in with Stanford Email"**
   - You'll be redirected to Google OAuth
   - **Important:** Must use your @stanford.edu email
   - Non-Stanford emails will be rejected

3. After signing in, you should be redirected back to the app

### 3.2 Test Prompt Submission (Gate 2)

After signing in, you should see the **Submit Prompt Gate**:

1. Fill out the form:
   - **Title:** (3-200 characters) e.g., "GPT-4 Code Review Assistant"
   - **Category:** Select from dropdown
   - **Description:** (20-500 characters) Brief description
   - **Content:** (50+ characters) Your full prompt
   - **Tags:** (optional) Comma-separated, e.g., "python, code, review"

2. Click **"Submit for Review"**

3. You should see:
   - Alert: "Your first prompt has been submitted! It will be reviewed shortly."
   - Page refreshes to **Pending Approval Gate**

### 3.3 Test Pending Approval (Gate 3)

You should now see the **Pending Approval Gate** with:
- Status timeline showing current step
- Preview of your submitted prompt
- Real-time subscription (page will auto-update when approved)

## Step 4: Admin Approval Process

### Make Yourself Admin

Since you're the first user, you need to make yourself admin:

1. Go to Supabase: **Table Editor** → **users**
2. Find your user record (your email)
3. Click on the row to edit
4. Set `is_admin` = `true`
5. Click **Save**

### Approve Your Initial Prompt

1. Still in Supabase, go to **Table Editor** → **prompts**
2. You should see your submitted prompt with `status = 'pending'`
3. Click on the row to view details
4. Verify it's a good prompt
5. Change `status` from `'pending'` to `'approved'`
6. Click **Save**

### What Happens Next (Automatic)

The database trigger `grant_member_access_on_approval()` will automatically:
1. Detect that an initial prompt was approved
2. Update the user record: `is_approved_member = true`
3. Update the user record: `has_submitted_prompt = true`

Your browser (if still on the pending gate page) will:
1. Receive real-time update via Supabase subscription
2. Show approval notification: "🎉 Congratulations!"
3. Automatically redirect to the **Main App**

## Step 5: Test Main App (Full Access)

Once approved, you should see the **Main App** with:

### Header
- Logo: "📚 Stanford Prompt Library"
- User greeting: "Hi, [Your Name]!"
- Sign Out button

### Navigation
- 🔍 **Explore** - Browse all prompts
- 🏆 **Leaderboard** - Top contributors
- 👤 **Profile** - Your prompts

### Explore View
- Search bar
- Category filters (Research, Coding, Creative, Education, Business)
- Prompts grid showing your approved prompt
- Each prompt card has:
  - Title, description, tags
  - Author info
  - Like button (❤️ + count)
  - Copy button (📋)
  - Export button (⬇️)

### Test Features

**Search:**
- Type keywords in search bar
- Results should filter in real-time

**Category Filters:**
- Click different categories
- Prompts should filter by category

**Like Prompt:**
- Click ❤️ button
- Count should increment
- Click again to unlike
- Count should decrement

**Copy Prompt:**
- Click 📋 button
- Prompt content copied to clipboard
- Button changes to ✅ briefly

**Export Prompt:**
- Click ⬇️ button
- Downloads as markdown file
- File named after prompt title

**Leaderboard:**
- Click "🏆 Leaderboard" in nav
- Should show ranked users table
- Top 3 get medal emojis (🥇🥈🥉)

## Common Issues & Solutions

### Database Not Set Up

**Error:** Console shows Supabase errors like "relation 'users' does not exist"

**Solution:** Complete Step 1 - make sure you ran the SQL content, not the file path!

### Google OAuth Not Configured

**Error:** OAuth redirect fails or shows error

**Solution:**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials (Client ID + Secret)
4. Add redirect URL: `http://localhost:5173`
5. Add production URL when deployed

### Non-Stanford Email Rejected

**Expected behavior!** The app only allows @stanford.edu emails.

If you need to test with non-Stanford email during development:
1. Temporarily modify `app/src/services/auth.js`
2. Change `isStanfordEmail()` function to return `true`
3. **Remember to revert before deploying!**

### Real-time Approval Not Working

**Issue:** Page doesn't auto-update when prompt is approved

**Solution:**
1. Check browser console for errors
2. Verify Supabase Realtime is enabled:
   - Supabase Dashboard → **Database** → **Replication**
   - Ensure `users` table has Realtime enabled
3. Try manually refreshing the page

## Next Steps After Testing

Once everything works locally:

1. ✅ **Test all three gates** (sign-in, submit, pending)
2. ✅ **Test admin approval** workflow
3. ✅ **Test main app** features (search, filter, like, copy, export)
4. 📝 **Submit a few more prompts** to test leaderboard
5. 🚀 **Deploy to Vercel** (see SETUP_INSTRUCTIONS.md)

## File Structure Reference

```
app/
├── src/
│   ├── components/
│   │   ├── SignInGate.js          # Gate 1: Authentication
│   │   ├── SubmitPromptGate.js    # Gate 2: First submission
│   │   ├── PendingApprovalGate.js # Gate 3: Waiting for approval
│   │   └── MainApp.js             # Main application
│   ├── services/
│   │   ├── auth.js                # Authentication logic
│   │   ├── access-control.js      # Gated access logic
│   │   └── prompts.js             # Prompt CRUD + features
│   ├── config/
│   │   └── supabase.js            # Supabase client
│   ├── main.js                    # App entry point + routing
│   └── style.css                  # Complete styling
├── database/
│   └── schema.sql                 # Database schema (COPY THIS!)
├── .env                           # Supabase credentials ✅
├── package.json
└── index.html
```

## Support

If you encounter any issues:

1. **Check browser console** for errors (F12 → Console)
2. **Check Supabase logs** (Dashboard → Logs)
3. **Verify .env file** has correct credentials
4. **Ensure database** is set up (all tables exist)

---

**You're almost there!** Just complete the database setup and you'll be able to test the complete application end-to-end. 🚀
