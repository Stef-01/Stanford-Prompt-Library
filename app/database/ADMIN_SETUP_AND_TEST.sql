-- =============================================================================
-- ADMIN PANEL SETUP AND TESTING SCRIPT
-- =============================================================================
-- This script helps you set up and test the admin panel functionality
-- Run these commands in the Supabase SQL Editor

-- =============================================================================
-- STEP 1: VERIFY YOUR USER EXISTS
-- =============================================================================
-- Replace 'your-email@example.com' with your actual email address
SELECT
  id,
  email,
  display_name,
  is_admin,
  is_approved_member,
  has_submitted_prompt,
  created_at
FROM users
WHERE email = 'your-email@example.com';

-- NOTE: Copy the 'id' value from the result - you'll need it for the next step


-- =============================================================================
-- STEP 2: MAKE YOURSELF AN ADMIN
-- =============================================================================
-- Replace 'YOUR_USER_ID_HERE' with the id from Step 1
UPDATE users
SET is_admin = TRUE
WHERE id = 'YOUR_USER_ID_HERE'
RETURNING id, email, display_name, is_admin;

-- Verify admin status
SELECT id, email, display_name, is_admin
FROM users
WHERE is_admin = TRUE;


-- =============================================================================
-- STEP 3: VERIFY PENDING PROMPTS EXIST
-- =============================================================================
-- Check if there are any pending prompts to review
SELECT
  p.id,
  p.title,
  p.status,
  p.is_initial_prompt,
  u.display_name AS author,
  u.email AS author_email,
  p.created_at
FROM prompts p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;


-- =============================================================================
-- STEP 4: CREATE TEST PENDING PROMPTS (if needed)
-- =============================================================================
-- If you don't have any pending prompts, create some test prompts
-- Replace 'YOUR_USER_ID_HERE' with a valid user id

-- Test prompt 1
INSERT INTO prompts (
  user_id,
  title,
  content,
  description,
  category,
  tags,
  status,
  is_initial_prompt
) VALUES (
  'YOUR_USER_ID_HERE',
  'Test Prompt for Admin Approval',
  'This is a test prompt created for testing the admin approval workflow. It should appear in the admin panel under pending prompts.',
  'A test prompt to verify admin panel functionality',
  'AI Agents',
  ARRAY['test', 'admin', 'approval'],
  'pending',
  TRUE  -- This is an initial prompt, so approving it will grant member access
)
RETURNING id, title, status;

-- Test prompt 2
INSERT INTO prompts (
  user_id,
  title,
  content,
  description,
  category,
  tags,
  status,
  is_initial_prompt
) VALUES (
  'YOUR_USER_ID_HERE',
  'Another Test Prompt',
  'You are a helpful AI assistant that specializes in code review. When reviewing code, focus on: 1) Security vulnerabilities 2) Performance issues 3) Best practices 4) Code readability',
  'Code review assistant prompt',
  'Website Coding',
  ARRAY['code-review', 'testing'],
  'pending',
  FALSE
)
RETURNING id, title, status;


-- =============================================================================
-- STEP 5: VERIFY RLS POLICIES ARE CORRECT
-- =============================================================================
-- Check that admin policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'prompts'
AND (policyname LIKE '%admin%' OR policyname LIKE '%Admins%');


-- =============================================================================
-- STEP 6: TEST MANUAL APPROVAL (optional)
-- =============================================================================
-- Manually approve a prompt to test the database trigger
-- Replace 'PROMPT_ID_HERE' with an actual prompt id from Step 3

-- First, let's see the prompt before approval
SELECT
  p.id,
  p.title,
  p.status,
  p.is_public,
  p.is_initial_prompt,
  u.is_approved_member,
  u.email
FROM prompts p
JOIN users u ON p.user_id = u.id
WHERE p.id = 'PROMPT_ID_HERE';

-- Now approve it
UPDATE prompts
SET
  status = 'approved',
  is_public = TRUE
WHERE id = 'PROMPT_ID_HERE'
RETURNING id, title, status, is_public;

-- Verify the user was granted member access (if it was an initial prompt)
SELECT
  u.id,
  u.email,
  u.is_approved_member,
  u.total_prompts
FROM users u
JOIN prompts p ON u.id = p.user_id
WHERE p.id = 'PROMPT_ID_HERE';


-- =============================================================================
-- STEP 7: TEST MANUAL REJECTION (optional)
-- =============================================================================
-- Manually reject a prompt
-- Replace 'PROMPT_ID_HERE' with an actual prompt id

UPDATE prompts
SET
  status = 'rejected',
  rejection_reason = 'This is a test rejection',
  is_public = FALSE
WHERE id = 'PROMPT_ID_HERE'
RETURNING id, title, status, rejection_reason;


-- =============================================================================
-- STEP 8: VIEW ADMIN STATISTICS
-- =============================================================================
-- Get the same stats that the admin panel shows

-- Pending prompts count
SELECT COUNT(*) AS pending_count
FROM prompts
WHERE status = 'pending';

-- Approved prompts count
SELECT COUNT(*) AS approved_count
FROM prompts
WHERE status = 'approved';

-- Rejected prompts count
SELECT COUNT(*) AS rejected_count
FROM prompts
WHERE status = 'rejected';

-- Total users count
SELECT COUNT(*) AS total_users
FROM users;

-- All stats in one query
SELECT
  (SELECT COUNT(*) FROM prompts WHERE status = 'pending') AS pending_count,
  (SELECT COUNT(*) FROM prompts WHERE status = 'approved') AS approved_count,
  (SELECT COUNT(*) FROM prompts WHERE status = 'rejected') AS rejected_count,
  (SELECT COUNT(*) FROM users) AS total_users;


-- =============================================================================
-- STEP 9: RESET TEST DATA (if needed)
-- =============================================================================
-- WARNING: This will delete test prompts!
-- Only run if you want to clean up test data

-- Delete test prompts
-- DELETE FROM prompts
-- WHERE title LIKE 'Test Prompt%' OR title LIKE '%Test%'
-- RETURNING id, title;

-- Reset user approval status (if needed)
-- UPDATE users
-- SET is_approved_member = FALSE
-- WHERE email = 'test-user@example.com'
-- RETURNING id, email, is_approved_member;


-- =============================================================================
-- DEBUGGING: Check what prompts you can see as admin
-- =============================================================================
-- This simulates what the admin panel query returns
SELECT
  p.id,
  p.title,
  p.content,
  p.description,
  p.status,
  p.category,
  p.tags,
  p.is_initial_prompt,
  p.is_public,
  p.rejection_reason,
  p.likes_count,
  p.created_at,
  json_build_object(
    'id', u.id,
    'email', u.email,
    'display_name', u.display_name,
    'avatar_url', u.avatar_url
  ) AS users
FROM prompts p
INNER JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;


-- =============================================================================
-- DONE!
-- =============================================================================
-- You should now be set up as an admin with test prompts to review
-- Open the app and click the admin shield icon to access the admin panel
