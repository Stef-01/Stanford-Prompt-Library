# 🚀 Quick Setup Guide - Run These Migrations NOW

## ⚠️ CRITICAL: Run These SQL Migrations First

You need to run TWO migrations in your Supabase SQL Editor:

### 1️⃣ Add author_name Column (REQUIRED)

```sql
-- File: app/database/migration-add-author-name.sql

-- Add author_name field to prompts table
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN public.prompts.author_name IS 'Display name for prompt author (can be real name or pseudonym). If null, uses users.display_name';

-- Update existing prompts to use their user's display_name
UPDATE public.prompts p
SET author_name = u.display_name
FROM public.users u
WHERE p.user_id = u.id AND p.author_name IS NULL;
```

### 2️⃣ Add image_url Column (FOR IMAGE UPLOADS)

```sql
-- File: app/database/migration-add-image-url.sql

-- Add image_url column to prompts table
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for prompt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public read access
CREATE POLICY IF NOT EXISTS "Public can view prompt images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-images');

-- Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Users can upload prompt images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete own prompt images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to delete any images
CREATE POLICY IF NOT EXISTS "Admins can delete any prompt images"
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

## ✅ How to Run These Migrations

1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor** (left sidebar)
3. **Create a new query**
4. **Paste Migration 1** (author_name) → Click "Run"
5. **Create another new query**
6. **Paste Migration 2** (image_url) → Click "Run"

## 🎯 What This Fixes

✅ **author_name error** - Users can now submit prompts
✅ **Image upload** - Users can attach images to prompts
✅ **Storage bucket** - Images stored securely in Supabase

---

After running these migrations, the app will work perfectly!
