-- Migration: Add author display preferences to prompts
-- This allows users to choose how their name appears (real name or pseudonym)

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
