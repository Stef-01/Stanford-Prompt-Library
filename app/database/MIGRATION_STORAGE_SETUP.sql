-- Storage Bucket Setup for Prompt Images
-- Run this AFTER the main migration (MIGRATION_RUN_THIS_FIRST.sql)
--
-- NOTE: You may need to create the storage bucket manually in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New Bucket"
-- 3. Name: prompt-images
-- 4. Public: Yes
-- 5. Then run the policies below

-- Create storage bucket (if not exists via SQL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompt-images',
  'prompt-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view prompt images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload prompt images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own prompt images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete any prompt images" ON storage.objects;

-- Policy 1: Public can view/download images
CREATE POLICY "Public can view prompt images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-images');

-- Policy 2: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload prompt images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own images
CREATE POLICY "Users can update own prompt images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own images
CREATE POLICY "Users can delete own prompt images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Admins can delete any images
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
