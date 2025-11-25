-- ============================================
-- DATABASE SETUP VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check if setup is complete
-- ============================================

-- 1. Check if required columns exist in prompts table
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'author_name'
    ) THEN '✅ author_name column exists'
    ELSE '❌ MISSING: author_name column - Run MIGRATION_RUN_THIS_FIRST.sql'
  END as author_name_status,

  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'prompts' AND column_name = 'image_url'
    ) THEN '✅ image_url column exists'
    ELSE '❌ MISSING: image_url column - Run MIGRATION_RUN_THIS_FIRST.sql'
  END as image_url_status;

-- 2. Check if storage bucket exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets WHERE id = 'prompt-images'
    ) THEN '✅ prompt-images bucket exists'
    ELSE '❌ MISSING: prompt-images bucket - Follow Step 2 in DATABASE_SETUP_GUIDE.md'
  END as storage_bucket_status;

-- 3. Check if storage policies exist
SELECT
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ Storage policies configured'
    WHEN COUNT(*) > 0 THEN '⚠️ INCOMPLETE: Only ' || COUNT(*) || ' policies (need 4-5)'
    ELSE '❌ MISSING: No storage policies - Follow Step 3 in DATABASE_SETUP_GUIDE.md'
  END as storage_policies_status
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%prompt%';

-- 4. List all prompt-related storage policies
SELECT policyname, cmd as operation
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%prompt%'
ORDER BY policyname;

-- ============================================
-- SUMMARY: If you see any ❌ or ⚠️ above,
-- follow the instructions in DATABASE_SETUP_GUIDE.md
-- ============================================
