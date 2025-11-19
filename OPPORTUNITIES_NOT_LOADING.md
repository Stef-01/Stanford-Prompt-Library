# 🔍 Why Opportunities Don't Load - Diagnostic Guide

## Problem

The Opportunities page is not showing any opportunities. The page loads but the grid is empty.

---

## Root Cause

The **`opportunities` table doesn't exist in your Supabase database yet**.

The code is working correctly, but it's trying to query a table that hasn't been created. When the query fails (likely with a 401 or table not found error), the `getOpportunities()` function catches the error and returns an empty array, resulting in an empty grid.

---

## Quick Fix (5 Minutes)

### Option A: Run Single Setup Script (RECOMMENDED)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run: `app/database/complete-opportunities-setup.sql` (created in this fix)
3. Wait for "SETUP COMPLETE" message
4. Refresh your app

### Option B: Run Files Individually

1. Open **Supabase Dashboard** → **SQL Editor**
2. Run these files **in order**:
   - `app/database/opportunities-schema.sql` (creates tables)
   - `app/database/seed-opportunities.sql` (adds 20+ opportunities)
   - `app/database/fix-opportunities-rls.sql` (fixes 401 errors)
3. Refresh your app

---

## Detailed Diagnosis

### 1. Check if Table Exists

Run this in Supabase SQL Editor:

```sql
SELECT EXISTS (
  SELECT FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'opportunities'
);
```

**Expected**: `true`
**If `false`**: Table doesn't exist - run setup scripts

### 2. Check if Data Exists

```sql
SELECT COUNT(*) as total_opportunities
FROM opportunities
WHERE is_public = TRUE;
```

**Expected**: 20+ opportunities
**If error**: Table doesn't exist
**If 0**: Need to run seed script

### 3. Check RLS Policies

```sql
SELECT *
FROM pg_policies
WHERE tablename = 'opportunities';
```

**Expected**: At least 2 policies
**If 0**: Need to run RLS fix script

### 4. Test Anonymous Access

```sql
SET ROLE anon;
SELECT COUNT(*) FROM opportunities WHERE is_public = TRUE;
RESET ROLE;
```

**Expected**: Number of public opportunities
**If error**: RLS policies not allowing anon access

---

## What Each Script Does

| Script | Purpose | Creates |
|--------|---------|---------|
| `opportunities-schema.sql` | Creates database structure | Tables, indexes, triggers, functions, RLS |
| `seed-opportunities.sql` | Adds sample data | 20+ Stanford AI opportunities |
| `fix-opportunities-rls.sql` | Fixes 401 auth errors | Grants anon access permissions |
| `verify-opportunities.sql` | Tests everything works | Verification results |

---

## Common Issues

### Issue 1: "Table does not exist"
**Cause**: Haven't run `opportunities-schema.sql`
**Fix**: Run the schema file in Supabase SQL Editor

### Issue 2: "401 Unauthorized"
**Cause**: RLS policies don't allow anonymous access
**Fix**: Run `fix-opportunities-rls.sql`

### Issue 3: "No opportunities found"
**Cause**: Table exists but has no data
**Fix**: Run `seed-opportunities.sql`

### Issue 4: "Missing environment variables"
**Cause**: `.env` file not configured
**Fix**: Copy `app/.env.example` to `app/.env` and fill in Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in: **Supabase Dashboard** → **Project Settings** → **API**

---

## Verification Steps

After running setup scripts:

### Step 1: Check Console
Open browser console (F12) and look for:
- ❌ "Error fetching opportunities" → RLS issue
- ❌ "relation 'opportunities' does not exist" → Table not created
- ✅ No errors → Good!

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Reload Opportunities page
3. Look for requests to `supabase.co/rest/v1/opportunities`
4. Check status code:
   - ❌ 401 → RLS issue (run fix-opportunities-rls.sql)
   - ❌ 404 → Table doesn't exist (run schema)
   - ✅ 200 → Success!

### Step 3: Visual Test
You should see:
- 20+ opportunity cards in bento grid layout
- Featured cards (2x2 size) at top
- Search bar and category filters working
- Bookmark icons on each card

---

## Still Not Working?

### Check 1: Verify Supabase Connection

```javascript
// Run in browser console
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Key exists' : 'Key missing')
```

Both should show values.

### Check 2: Check Build

```bash
cd app
npm run build
```

Look for build errors. If successful, you should see:
```
dist/assets/index-*.js   ~388 kB
```

### Check 3: Hard Refresh

Sometimes cached files cause issues:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

---

## Prevention

To avoid this in future:

1. **Always run database migrations** when deploying new features
2. **Check DEPLOYMENT_READY.md** for setup instructions
3. **Run verify scripts** after database changes
4. **Test in incognito mode** to verify anonymous access

---

## Summary

✅ **Most Likely Issue**: `opportunities` table doesn't exist in Supabase
✅ **Quick Fix**: Run `complete-opportunities-setup.sql` in Supabase SQL Editor
✅ **Verify**: Reload app, check for 20+ opportunity cards

**Setup Time**: ~2 minutes
**Location**: All scripts in `app/database/` folder

---

Need help? Check the browser console (F12) for specific error messages and refer to the error codes above.
