# Setup Instructions for Member Approval & Image Upload Features

This document provides instructions for setting up the new features:
1. **Member Approval System** (already working via database triggers)
2. **Image Upload for Prompts** (new feature)
3. **Premium Landing Page** (UI improvement)

## Prerequisites

- Supabase project with database access
- Access to Supabase SQL Editor

## Database Migration

### Step 1: Add Image Upload Support

Run the following SQL migration in your Supabase SQL Editor:

```sql
-- File: app/database/migration-add-image-url.sql

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
```

### Step 2: Verify Setup

After running the migration, verify:

1. **Check the prompts table:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'prompts' AND column_name = 'image_url';
   ```

2. **Check the storage bucket:**
   - Go to Supabase Dashboard → Storage
   - You should see a bucket named `prompt-images`
   - It should be marked as "Public"

3. **Check storage policies:**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%prompt%';
   ```

## Features Overview

### 1. Member Approval System ✅

**Status:** Already functional

The member approval system works automatically through database triggers:

- When a user submits their first prompt, it's marked as `is_initial_prompt = true`
- When an admin approves an initial prompt, the database trigger `grant_member_access_on_approval()` automatically:
  - Sets `is_approved_member = true` for the user
  - Grants them access to the library
  - The user receives real-time notification via Supabase Realtime

**How to use:**
1. User signs in with Stanford email
2. User submits their first prompt (marked as "Initial Prompt" in admin panel)
3. Admin reviews and clicks "Approve"
4. User automatically gets access to browse the library

### 2. Image Upload for Prompts 🆕

**Status:** Newly implemented

Users can now upload example images (screenshots, diagrams) when submitting prompts:

**Features:**
- Accepts PNG, JPG, WebP formats
- Max file size: 5MB
- Images stored in Supabase Storage
- Automatic validation and compression
- Preview before submission
- Optional - users can submit without images

**Implementation details:**
- Images are stored in `prompt-images` bucket
- Organized by user ID: `{userId}/{timestamp}-{random}.{ext}`
- Public URLs are saved to `prompts.image_url` column
- Images display in:
  - Admin panel (for review)
  - Library grid view
  - Prompt detail modal

### 3. Premium Landing Page ✨

**Status:** Newly implemented

The landing page has been redesigned with:
- Modern gradient background
- Floating book emoji animation
- Glassmorphism design elements
- Minimal text, maximum impact
- Mobile-responsive design
- Smooth animations and transitions

## Admin Panel Usage

### Approving Members

1. Navigate to the Admin Panel (click Admin button in app)
2. You'll see stats for:
   - Pending Review
   - Approved
   - Rejected
   - Total Users
3. Filter prompts by status (Pending, Approved, Rejected, All)
4. For each prompt, you can:
   - **Approve**: Grant user access (if it's their initial prompt)
   - **Reject**: Deny the prompt with optional reason
   - View prompt details, tags, category, and example image

### Reviewing Prompts with Images

When reviewing prompts:
- Example images appear above the prompt content
- Full-size image preview available
- Images help verify prompt quality and usefulness

## Testing

### Test Member Approval

1. Create a new Stanford account (or use test account)
2. Sign in and submit a prompt
3. User should see "Pending Approval" screen
4. As admin, approve the prompt
5. User should receive real-time notification and gain access

### Test Image Upload

1. Sign in with a test account
2. Open Submit Prompt window
3. Fill in all required fields
4. Click "Choose Image" and select a PNG/JPG file
5. Preview should appear
6. Submit prompt
7. Check admin panel to see the image
8. After approval, view in library to see image in grid

## Troubleshooting

### Images not uploading

1. Check Supabase Storage bucket exists:
   - Dashboard → Storage → Look for `prompt-images`
2. Check bucket is public:
   - Click bucket → Settings → Public bucket should be enabled
3. Check storage policies:
   - Run verification query from Step 2 above
4. Check browser console for errors

### Member approval not working

1. Verify database trigger exists:
   ```sql
   SELECT trigger_name FROM information_schema.triggers
   WHERE event_object_table = 'prompts'
   AND trigger_name = 'on_prompt_approved';
   ```
2. Check user's `is_approved_member` status:
   ```sql
   SELECT email, is_approved_member, has_submitted_prompt
   FROM users
   WHERE email = 'user@stanford.edu';
   ```

### Landing page not displaying correctly

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check browser console for CSS errors

## Summary of Changes

### Files Modified

1. **app/src/components/SignInGate.js** - New premium landing page design
2. **app/src/services/prompts.js** - Added image upload to `submitPrompt()` function
3. **app/src/components/windows/SubmitWindow.js** - Connected image upload UI to backend
4. **app/src/components/AdminPanel.js** - Display images in admin review
5. **app/src/components/windows/LibraryWindow.js** - Display images in library and modal

### Files Created

1. **app/database/migration-add-image-url.sql** - Database migration for image support

### Features Working

- ✅ Member approval system (via database triggers)
- ✅ Premium landing page
- ✅ Image upload for prompts
- ✅ Image display in admin panel
- ✅ Image display in library
- ✅ Real-time approval notifications

## Next Steps

After setup, consider:

1. **Testing thoroughly** with multiple test accounts
2. **Backup database** before deploying to production
3. **Monitor storage usage** in Supabase dashboard
4. **Set up storage limits** if needed for cost control
5. **Configure CDN** for faster image delivery (optional)

## Support

If you encounter issues:
1. Check Supabase logs (Dashboard → Logs → Database/Storage)
2. Check browser console for JavaScript errors
3. Verify all migration steps completed successfully
4. Review the implementation in the modified files listed above
