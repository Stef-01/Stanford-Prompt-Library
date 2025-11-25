# 🚀 Quick Fix Guide - Get Prompt Submission Working

## The Problem
When you click "Submit for Review", you're getting errors about storage policies not being set up.

## The Solution (3 Steps - Takes 2 minutes)

### Step 1: Run Database Migration

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the **ENTIRE** contents of this file:
   ```
   app/database/MIGRATION_RUN_THIS_FIRST.sql
   ```
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: ✅ Success (no errors)

---

### Step 2: Create Storage Bucket

**IMPORTANT: Do NOT use the "Add Policy" screen you showed in your screenshot!**

Instead:

1. Stay in **SQL Editor**
2. Click **New Query**
3. Run this simple SQL:

```sql
-- Create the storage bucket for prompt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;
```

4. Click **Run**
5. You should see: ✅ Success

---

### Step 3: Add Storage Policies

1. Stay in **SQL Editor**
2. Click **New Query**
3. Copy and paste the **ENTIRE** contents of this file:
   ```
   app/database/MIGRATION_STORAGE_SETUP.sql
   ```
4. Click **Run**
5. You should see: ✅ Success (no errors)

---

## ✅ Verify It Worked

1. In **SQL Editor**, create a **New Query**
2. Copy and paste the **ENTIRE** contents of:
   ```
   VERIFY_DATABASE_SETUP.sql
   ```
3. Click **Run**
4. You should see **ALL** ✅ checkmarks:
   - ✅ author_name column exists
   - ✅ image_url column exists
   - ✅ prompt-images bucket exists
   - ✅ Storage policies configured

If you see any ❌, go back and re-run the step that failed.

---

## 🧪 Test Prompt Submission

1. **Refresh your browser** (important!)
2. Open the Submit window
3. Fill out the form
4. Click "Submit for Review"
5. You should see:
   - Button changes to green "Submitted Successfully!"
   - After 0.8 seconds: Success alert appears
   - Window closes automatically

---

## ❌ If You Still Get Errors

Check the browser console (F12) and look for errors. Common issues:

### "Could not find the 'author_name' column"
- ❌ Step 1 didn't run correctly
- ✅ Re-run `MIGRATION_RUN_THIS_FIRST.sql`

### "Bucket prompt-images does not exist"
- ❌ Step 2 didn't run correctly
- ✅ Re-run the bucket creation SQL

### "new row violates row-level security policy"
- ❌ Step 3 didn't run correctly
- ✅ Re-run `MIGRATION_STORAGE_SETUP.sql`

---

## 📝 Important Notes

1. **DO NOT use the Supabase UI "Add Policy" screen** - Use SQL Editor only
2. **Run ALL SQL in SQL Editor** - Not in the Storage settings UI
3. **Refresh browser after running migrations** - Clear any cached data
4. **If submitting without image** - Storage policies aren't needed (but good to set up)

---

## 🎯 Summary

You asked: "Should I instead run the editor schema instead of the add policy screen?"

**Answer: YES! Always use SQL Editor, never the Add Policy UI for this setup.**

The Add Policy UI you showed works differently and requires different syntax. Our migration files are written for SQL Editor.

---

**After completing all 3 steps and verifying, you should be able to submit prompts successfully!** 🎉
