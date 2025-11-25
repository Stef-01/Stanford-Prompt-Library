-- Migration: Add author_name and image_url columns to prompts table
-- Run this in Supabase SQL Editor

-- Part 1: Add author_name column
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS author_name TEXT;

COMMENT ON COLUMN public.prompts.author_name IS 'Display name for prompt author (can be real name or pseudonym). If null, uses users.display_name';

-- Update existing prompts to use their user's display_name
UPDATE public.prompts p
SET author_name = u.display_name
FROM public.users u
WHERE p.user_id = u.id AND p.author_name IS NULL;

-- Part 2: Add image_url column
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.prompts.image_url IS 'URL to example image/screenshot for the prompt (stored in Supabase Storage)';
