# 🚀 Quick Start: Fix Opportunities Not Loading

## Problem
Opportunities page is empty - no cards show up.

## Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in left sidebar

### Step 2: Run These 3 Files (Copy & Paste Each)

#### File 1: Create Tables (30 seconds)
📁 **Location**: `app/database/opportunities-schema.sql`

1. Open the file
2. Copy **entire contents**
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Wait for "Success" message

**What this does**: Creates `opportunities` and `opportunity_saves` tables with indexes, triggers, and RLS policies.

---

#### File 2: Add Sample Data (30 seconds)
📁 **Location**: `app/database/seed-opportunities.sql`

1. Open the file
2. Copy **entire contents**
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Wait for "Success" message

**What this does**: Adds 20+ real Stanford AI opportunities (HAI Fellowship, TreeHacks, etc.)

---

#### File 3: Fix 401 Errors (30 seconds)
📁 **Location**: `app/database/fix-opportunities-rls.sql`

1. Open the file
2. Copy **entire contents**
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Wait for "Success" message

**What this does**: Allows anonymous users to view public opportunities.

---

### Step 3: Verify Setup (30 seconds)

Run this query in Supabase SQL Editor:

```sql
SELECT
  COUNT(*) as total_opportunities,
  COUNT(*) FILTER (WHERE status = 'featured') as featured,
  COUNT(*) FILTER (WHERE is_public = TRUE) as public_opportunities
FROM opportunities;
```

**Expected Result**:
```
total_opportunities: 20+
featured: 3
public_opportunities: 20+
```

---

### Step 4: Test in App (30 seconds)

1. Go to your app (http://localhost:5173 or your deployed URL)
2. Click **"Opportunities"** icon in dock (💼)
3. You should see **20+ opportunity cards** in a bento grid layout
4. Try searching for "HAI" or "fellowship"
5. Try clicking category filters

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ See 20+ opportunity cards on page load
- ✅ 3 large featured cards at top (2x2 size)
- ✅ Search bar filters results
- ✅ Category buttons work
- ✅ Bookmark icons appear on cards
- ✅ No errors in browser console (F12)

---

## ❌ Troubleshooting

### Issue: "Table does not exist"
**Fix**: Run File 1 (`opportunities-schema.sql`)

### Issue: "No opportunities found"
**Fix**: Run File 2 (`seed-opportunities.sql`)

### Issue: "401 Unauthorized" in console
**Fix**: Run File 3 (`fix-opportunities-rls.sql`)

### Issue: Still not working
1. Open browser console (F12)
2. Look for red error messages
3. Check OPPORTUNITIES_NOT_LOADING.md for detailed diagnostics

---

## File Locations

All SQL files are in:
```
app/database/
├── opportunities-schema.sql    ← File 1
├── seed-opportunities.sql      ← File 2
└── fix-opportunities-rls.sql   ← File 3
```

---

## Why This Happens

The Opportunities page code is complete and working, but it queries a database table that doesn't exist yet. You need to:

1. **Create the table** (schema.sql)
2. **Add data** (seed.sql)
3. **Allow access** (fix-rls.sql)

Once these 3 steps are done, everything will work automatically.

---

## Total Time: ~2 minutes

- File 1: 30 seconds
- File 2: 30 seconds
- File 3: 30 seconds
- Verify: 30 seconds

---

## Alternative: Run Verification First

If you're not sure if tables exist, run this diagnostic:

📁 **Location**: `app/database/verify-opportunities.sql`

This will show exactly what's missing and what needs to be set up.

---

## Need More Help?

📖 **Detailed Guide**: See `OPPORTUNITIES_NOT_LOADING.md`
📖 **Full Documentation**: See `DEPLOYMENT_READY.md`
📖 **Database Details**: See `OPPORTUNITIES_IMPLEMENTATION.md`

---

**Ready? Start with Step 1 above! 🚀**
