# 🧪 Comprehensive Testing Guide - Prompt Submission System

## Overview

This guide covers testing the complete prompt submission flow, identifying potential failure points, and how to diagnose and fix issues.

---

## 🎯 Testing Checklist

### Phase 1: Database Setup Verification

**Before testing submissions, verify database setup:**

1. **Run Verification Script**
   ```sql
   -- In Supabase SQL Editor, run:
   -- File: VERIFY_DATABASE_SETUP.sql
   ```

2. **Expected Results:**
   - ✅ `author_name` column exists
   - ✅ `image_url` column exists
   - ✅ `prompt-images` bucket exists
   - ✅ Storage policies configured (4-5 policies)

3. **If Any ❌ Appear:**
   - Follow `DATABASE_SETUP_GUIDE.md` step-by-step
   - Run migrations in correct order
   - Re-run verification script

---

### Phase 2: Application Testing

#### Test 1: Basic Submission (No Image)

**Steps:**
1. Sign in to the application
2. Click "Submit" in the dock
3. Fill out form:
   - Title: "Test Prompt 1"
   - Description: "Testing basic submission"
   - Category: Any category
   - Content: "This is a test prompt"
   - Tags: Select 2-3 tags
   - Author Name: Leave default or customize
4. Click "Submit for Review"

**Expected Behavior:**
- Button shows loading spinner
- Button changes to green "Submitted Successfully!" with checkmark
- After 800ms: Success alert appears
- Window closes automatically
- Library window refreshes with new prompt

**If Button Gets Stuck:**
- Check browser console (F12) for errors
- Error alert should show with specific guidance

**Possible Errors:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "⚠️ Database Setup Required" | Missing `author_name` or `image_url` columns | Run `MIGRATION_RUN_THIS_FIRST.sql` |
| "❌ Submission Failed" + error text | Database connection or other issue | Check console, verify Supabase connection |

---

#### Test 2: Submission With Image

**Steps:**
1. Open Submit window
2. Fill out form (same as Test 1)
3. Click "Choose Image" button
4. Select an image file (PNG, JPG, WEBP under 5MB)
5. Verify image preview appears
6. Click "Submit for Review"

**Expected Behavior:**
- Image uploads to Supabase Storage
- Prompt submits with `image_url` field populated
- Same success flow as Test 1

**Possible Errors:**

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "⚠️ Storage Bucket Missing" | `prompt-images` bucket doesn't exist | Follow Step 2 in DATABASE_SETUP_GUIDE.md |
| "⚠️ Storage Permission Error" | Storage policies not configured | Follow Step 3 in DATABASE_SETUP_GUIDE.md |
| No error but image not saved | Bucket exists but policies wrong | Verify all 4-5 policies are created |

---

#### Test 3: Form Validation

**Test Invalid Inputs:**

1. **Empty Title:**
   - Leave title blank
   - Click Submit
   - **Expected:** Red error message under title field
   - **Expected:** Submission blocked

2. **Title Too Short:**
   - Enter "Hi"
   - Click Submit
   - **Expected:** Error: "Title must be at least 3 characters"

3. **Empty Content:**
   - Leave content blank
   - **Expected:** Error: "Prompt content is required"

4. **Content Too Short:**
   - Enter "Test"
   - **Expected:** Error: "Prompt must be at least 20 characters"

5. **No Category:**
   - Leave category unselected
   - **Expected:** Error: "Please select a category"

**Expected Behavior:**
- Validation runs BEFORE submission
- Button loading state is restored immediately
- No API call is made if validation fails
- Error messages are clear and specific

---

#### Test 4: Image Handling

**Test Image Upload Edge Cases:**

1. **Large File (>5MB):**
   - Upload 6MB image
   - **Expected:** Should be rejected by browser or storage policy

2. **Wrong File Type:**
   - Try uploading .pdf or .txt file
   - **Expected:** File picker should only show image types

3. **Clear Image:**
   - Upload image
   - Click "×" clear button
   - Verify preview disappears
   - Submit form
   - **Expected:** Submits without image (no error)

4. **Network Failure During Upload:**
   - Simulate offline
   - Try to submit with image
   - **Expected:** Graceful error message
   - **Expected:** Prompt still submits (without image)

---

#### Test 5: Initial Prompt vs. Regular Prompt

**Test Initial Prompt:**

1. Create new test user account
2. Sign in
3. Submit first prompt
4. **Expected:** Alert says "Your first prompt has been submitted! It will be reviewed by an admin shortly..."
5. **Expected:** User status remains "not approved" until admin approves

**Test Regular Prompt:**

1. Use existing approved member account
2. Submit prompt
3. **Expected:** Alert says "Prompt submitted successfully! Your prompt will be reviewed and published soon."
4. **Expected:** User can immediately submit another prompt

---

#### Test 6: Admin Approval Flow

**As Admin:**

1. Sign in as admin
2. Open Admin Panel
3. Navigate to pending prompts
4. Find test prompt
5. Click "Approve"
6. **Expected:** Prompt status changes to "approved"
7. **Expected:** If initial prompt, user's `is_approved_member` becomes `true`
8. **Expected:** Prompt appears in Explore window

---

### Phase 3: UI/UX Testing

#### Test Window Behavior

1. **Window Opens:**
   - Click Submit dock icon
   - **Expected:** Window animates open from dock icon

2. **Window Closes After Success:**
   - Submit prompt successfully
   - **Expected:** Window automatically closes after alert

3. **Window Stays Open After Error:**
   - Trigger error (e.g., no database migration)
   - **Expected:** Window stays open with error message
   - **Expected:** User can fix issue and retry

4. **Multiple Submissions:**
   - Submit prompt
   - Reopen Submit window
   - **Expected:** Form is reset and clean
   - **Expected:** Can submit again without refresh

---

#### Test Tag System

1. **Expand Parent Tags:**
   - Click "Coding ▼"
   - **Expected:** Shows child tags (Python, JavaScript, etc.)

2. **Select Child Tags:**
   - Click on child tags
   - **Expected:** Tags appear in selected container

3. **Remove Tags:**
   - Click "×" on selected tag
   - **Expected:** Tag is removed from selection

4. **Validation:**
   - Submit without selecting tags
   - **Expected:** Should still submit (tags are optional)

---

## 🐛 Debugging Common Issues

### Issue 1: "Button Stuck" - Submission Doesn't Complete

**Symptoms:**
- Click "Submit for Review"
- Button shows spinner
- Nothing happens
- Button stays in loading state

**Diagnosis:**
```javascript
// Open browser console (F12)
// Look for errors in console
```

**Common Causes:**
1. Database column missing → See error alert
2. Network timeout → Check Supabase connection
3. JavaScript error → Check console for stack trace

---

### Issue 2: Form Submits But Window Doesn't Close

**Symptoms:**
- Success alert shows
- Window stays open
- Form is reset

**Cause:**
- `closeWindow('submit')` function not imported or failing

**Fix:**
- Verify line 9 in SubmitWindow.js has: `import { closeWindow } from '../../utils/desktop-windows.js'`

---

### Issue 3: Image Uploads But URL Not Saved

**Symptoms:**
- Image preview works
- Submission succeeds
- But image doesn't show in library

**Diagnosis:**
```sql
-- Check if image_url is being saved
SELECT id, title, image_url FROM prompts ORDER BY created_at DESC LIMIT 5;
```

**Common Causes:**
1. `image_url` column doesn't exist → Run migration
2. Image upload succeeds but URL not returned → Check storage policies
3. Storage bucket is private → Bucket must be public

---

### Issue 4: "Schema Cache" Error

**Full Error:**
```
Could not find the 'author_name' column of 'prompts' in the schema cache
```

**Cause:**
- Database migration `MIGRATION_RUN_THIS_FIRST.sql` has not been run

**Fix:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `MIGRATION_RUN_THIS_FIRST.sql`
4. Paste and run
5. Verify with `VERIFY_DATABASE_SETUP.sql`
6. Refresh application

---

### Issue 5: Storage Permission Errors

**Error Messages:**
- "new row violates row-level security policy"
- "permission denied for bucket prompt-images"

**Cause:**
- Storage policies not configured

**Fix:**
1. Follow Step 3 in `DATABASE_SETUP_GUIDE.md`
2. Create all 4-5 storage policies
3. Verify policies exist:
   ```sql
   SELECT policyname FROM pg_policies
   WHERE tablename = 'objects' AND policyname LIKE '%prompt%';
   ```

---

## 📊 Testing Checklist Summary

Use this checklist to verify everything works:

- [ ] Database columns verified (author_name, image_url)
- [ ] Storage bucket created (prompt-images)
- [ ] Storage policies configured (4-5 policies)
- [ ] Basic submission works (no image)
- [ ] Image upload works
- [ ] Form validation works correctly
- [ ] Error messages are helpful and specific
- [ ] Success flow works (button → alert → close window)
- [ ] Window closes automatically after success
- [ ] Library refreshes after submission
- [ ] Initial prompt submission works
- [ ] Regular prompt submission works
- [ ] Admin can approve prompts
- [ ] Approved prompts appear in Explore
- [ ] Tag selection works
- [ ] Image clear button works
- [ ] Multiple consecutive submissions work

---

## 🔍 Manual Test Scenarios

### Scenario 1: New User First-Time Experience

1. Create new Stanford email account
2. Sign in to app
3. See landing page
4. Sign in with Google/Stanford
5. Submit initial prompt
6. Wait for admin approval
7. Get approved
8. Verify can now submit more prompts

### Scenario 2: Power User Workflow

1. Sign in as approved member
2. Submit 3 prompts with different categories
3. Attach images to all prompts
4. Use various tags
5. Verify all appear in "My Library"
6. Wait for admin approval
7. Verify approved prompts appear in Explore

### Scenario 3: Admin Workflow

1. Sign in as admin
2. Open Admin Panel
3. See pending prompts (from Scenario 2)
4. Review prompt details
5. Approve 2 prompts
6. Reject 1 prompt
7. Verify approvals trigger member approval for new users
8. Verify approved prompts are now public

---

## 🚀 Automated Testing (Future)

**Recommended Test Framework:**
- Jest for unit tests
- Playwright for E2E tests
- Supabase test database for integration tests

**Key Tests to Automate:**
1. Form validation logic
2. submitPrompt() function with mocks
3. Error message parsing
4. Window open/close behavior
5. Database trigger for member approval

---

## 📝 Logging and Monitoring

**Check Console Logs:**
```javascript
// These log messages appear during submission:
console.log('🎨 Submitting prompt...', promptData)
console.log('📸 Uploading image...', fileName)
console.log('✅ Prompt submitted:', result)
console.error('❌ Submit error:', error)
```

**Supabase Dashboard Checks:**
1. **Database → Table Editor → prompts**
   - Verify new rows appear
   - Check `status` field (should be 'pending')
   - Check `image_url` field (should have URL if image uploaded)

2. **Storage → prompt-images**
   - Verify images are uploaded
   - Check folder structure: `{user_id}/{timestamp}-{random}.{ext}`
   - Verify images are publicly accessible

3. **Authentication → Users**
   - Verify `has_submitted_prompt` becomes `true`
   - Verify `is_approved_member` changes after approval

---

## ✅ Success Criteria

**Submission is working correctly when:**
1. ✅ Form validates inputs before submission
2. ✅ Button shows loading state during submission
3. ✅ Success state is visually clear (green button with checkmark)
4. ✅ Error messages are specific and actionable
5. ✅ Window closes automatically after success
6. ✅ Images upload successfully to storage
7. ✅ Data appears correctly in database
8. ✅ Admin can approve prompts
9. ✅ Approved prompts appear in Explore window
10. ✅ Initial prompt approval grants member access

---

## 🔧 Troubleshooting Commands

**Verify Database Schema:**
```sql
-- Check columns
\d prompts

-- Or use information_schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'prompts';
```

**Check Recent Submissions:**
```sql
SELECT id, title, author_name, status, created_at, image_url
FROM prompts
ORDER BY created_at DESC
LIMIT 10;
```

**Check Storage Bucket:**
```sql
SELECT * FROM storage.buckets WHERE id = 'prompt-images';
```

**Check Storage Policies:**
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

**Last Updated:** 2025-11-25
**Version:** 1.0
