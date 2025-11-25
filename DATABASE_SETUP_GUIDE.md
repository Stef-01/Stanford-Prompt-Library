# 🚀 Quick Database Setup - Step by Step

## ⚠️ **CRITICAL** - Run in This Order

### Step 1: Add Database Columns ✅

**File:** `MIGRATION_RUN_THIS_FIRST.sql`

```sql
-- Copy and paste this into Supabase SQL Editor and run:

ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS author_name TEXT;

COMMENT ON COLUMN public.prompts.author_name IS 'Display name for prompt author';

UPDATE public.prompts p
SET author_name = u.display_name
FROM public.users u
WHERE p.user_id = u.id AND p.author_name IS NULL;

ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.prompts.image_url IS 'URL to example image/screenshot for the prompt';
```

**Result:** ✅ Fixes the "author_name column not found" error

---

### Step 2: Setup Storage Bucket 🗂️

#### Option A: Manual Setup (Recommended - Easiest)

1. **Go to Supabase Dashboard** → **Storage**
2. **Click "New Bucket"**
3. **Settings:**
   - Name: `prompt-images`
   - Public bucket: ✅ **Yes**
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`
4. **Click "Create Bucket"**

#### Option B: SQL Setup (Advanced)

**File:** `MIGRATION_STORAGE_SETUP.sql`

Run this in Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompt-images',
  'prompt-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Then run the storage policies from the file
```

---

### Step 3: Setup Storage Policies 🔐

**Go to Supabase Dashboard** → **Storage** → **prompt-images bucket** → **Policies**

**Add these policies:**

#### 1. Public Read Access
```sql
CREATE POLICY "Public can view prompt images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-images');
```

#### 2. Users Can Upload
```sql
CREATE POLICY "Users can upload prompt images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 3. Users Can Delete Own
```sql
CREATE POLICY "Users can delete own prompt images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 4. Admins Can Delete Any
```sql
CREATE POLICY "Admins can delete any prompt images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-images'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = TRUE
  )
);
```

---

## ✅ Verify Setup

### Check Columns
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'prompts'
AND column_name IN ('author_name', 'image_url');
```

**Expected result:** 2 rows showing both columns

### Check Storage Bucket
1. Go to **Storage** in Supabase Dashboard
2. You should see **prompt-images** bucket
3. It should be marked as **Public**

### Check Policies
```sql
SELECT policyname
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%prompt%';
```

**Expected result:** 4-5 policies listed

---

## 🎯 What This Fixes

✅ **author_name error** - Users can now submit prompts
✅ **Image upload** - Users can attach images to prompts
✅ **Storage bucket** - Images stored securely in Supabase

---

## 🐛 Troubleshooting

### Error: "author_name column not found"
- Run Step 1 migration

### Error: "bucket does not exist"
- Create bucket manually (Option A in Step 2)

### Error: "permission denied for storage"
- Setup storage policies (Step 3)

### Images not uploading
1. Check bucket exists and is public
2. Check policies are created
3. Check browser console for errors

---

## 📝 Quick Reference

**Files:**
- `MIGRATION_RUN_THIS_FIRST.sql` - Database columns
- `MIGRATION_STORAGE_SETUP.sql` - Storage setup

**Order:**
1. Run database migration
2. Create storage bucket
3. Add storage policies
4. Test by submitting a prompt

---

**After completing all steps, refresh the app and try submitting a prompt!** 🚀
