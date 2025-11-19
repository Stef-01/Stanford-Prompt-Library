# 🔧 Fixing Supabase 401 Errors

## Problem

You're seeing 401 (Unauthorized) errors in the browser console when loading the Opportunities page:

```
Failed to load resource: the server responded with a status of 401 ()
Error fetching opportunities: Object
daptpijlyyojkkizkxpa.supabase.co/rest/v1/opportunities?...
```

## Root Cause

The **Row-Level Security (RLS)** policies on the `opportunities` table are not properly configured to allow **anonymous (unauthenticated) access**.

While the RLS policy exists with:
```sql
CREATE POLICY "Opportunities are viewable by all"
  ON opportunities FOR SELECT
  USING (is_public = TRUE);
```

This policy doesn't explicitly grant access to the `anon` role, which is what Supabase uses for unauthenticated requests.

---

## Solution

### Step 1: Run the Fix Script

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the file: `app/database/fix-opportunities-rls.sql`

This script will:
- ✅ Recreate RLS policies with explicit `anon` and `authenticated` roles
- ✅ Grant SELECT permissions to the `anon` role
- ✅ Fix policies for `opportunity_saves` table
- ✅ Grant EXECUTE permissions for RPC functions

### Step 2: Verify the Fix

After running the script, test in an **incognito/private browser window**:

1. Open your app without logging in
2. Navigate to the Opportunities page
3. You should see opportunities loading without 401 errors

---

## What Changed

### Before (Not Working)
```sql
CREATE POLICY "Opportunities are viewable by all"
  ON opportunities FOR SELECT
  USING (is_public = TRUE);
```
❌ Doesn't explicitly allow `anon` role

### After (Working)
```sql
CREATE POLICY "Anyone can view public opportunities"
  ON opportunities
  FOR SELECT
  TO anon, authenticated
  USING (is_public = TRUE);

GRANT SELECT ON opportunities TO anon;
```
✅ Explicitly allows both `anon` and `authenticated` roles
✅ Grants SELECT permission to `anon` role

---

## Troubleshooting

### Still seeing 401 errors?

**Check 1: Verify opportunities are public**
```sql
SELECT COUNT(*)
FROM opportunities
WHERE is_public = TRUE;
```
Should return 20+ opportunities.

**Check 2: Verify RLS policies exist**
```sql
SELECT *
FROM pg_policies
WHERE tablename = 'opportunities';
```
Should show at least 2 policies.

**Check 3: Verify anon role has permissions**
```sql
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'opportunities'
AND grantee = 'anon';
```
Should show `SELECT` permission.

**Check 4: Test as anon role**
```sql
SET ROLE anon;
SELECT COUNT(*) FROM opportunities WHERE is_public = TRUE;
RESET ROLE;
```
Should return the number of public opportunities (not error).

### Environment Variables

Ensure your `.env` file has the correct Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in:
**Supabase Dashboard** → **Project Settings** → **API**

---

## Related Tables

The same fix applies to these tables (already included in the script):

| Table | Issue | Fix |
|-------|-------|-----|
| `opportunities` | 401 on SELECT | Grant anon access |
| `opportunity_saves` | User-specific saves | Requires authentication (correct) |
| `ai_tools` | Same RLS issue | Apply same fix pattern |
| `tool_categories` | Same RLS issue | Apply same fix pattern |

---

## Prevention

When creating new tables with RLS in Supabase:

1. **Always specify roles explicitly**:
   ```sql
   TO anon, authenticated
   ```

2. **Grant permissions explicitly**:
   ```sql
   GRANT SELECT ON your_table TO anon;
   ```

3. **Test with anonymous access**:
   ```sql
   SET ROLE anon;
   SELECT * FROM your_table;
   RESET ROLE;
   ```

---

## Summary

✅ **Run**: `fix-opportunities-rls.sql` in Supabase SQL Editor
✅ **Test**: Load Opportunities page without logging in
✅ **Verify**: No more 401 errors in console

**Location**: `app/database/fix-opportunities-rls.sql`

---

**Need help?** Check the Supabase Dashboard → Authentication → Policies to see active RLS policies.
