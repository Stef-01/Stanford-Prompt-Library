-- Migration: Add image_url field to prompts table
-- Run this in Supabase SQL Editor

-- Add image_url column to prompts table
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.prompts.image_url IS 'URL to example image/screenshot for the prompt (stored in Supabase Storage)';

-- Create storage bucket for prompt images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public read access to prompt-images bucket
CREATE POLICY IF NOT EXISTS "Public can view prompt images"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-images');

-- Allow authenticated users to upload images to their own folder
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
