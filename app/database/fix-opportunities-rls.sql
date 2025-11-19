-- =====================================================
-- FIX OPPORTUNITIES RLS FOR ANONYMOUS ACCESS
-- Run this in Supabase SQL Editor to fix 401 errors
-- =====================================================

-- This script fixes the "401 Unauthorized" errors when trying
-- to view opportunities without being logged in.

-- Problem: The current RLS policy allows SELECT but may not
-- be configured correctly for anonymous (anon) access.

-- Solution: Recreate the RLS policy to explicitly allow
-- anonymous users to read public opportunities.

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Opportunities are viewable by all" ON opportunities;
DROP POLICY IF EXISTS "Public opportunities are viewable by everyone" ON opportunities;
DROP POLICY IF EXISTS "Anyone can view public opportunities" ON opportunities;

-- Step 2: Create new policy that explicitly allows anon role
CREATE POLICY "Anyone can view public opportunities"
  ON opportunities
  FOR SELECT
  TO anon, authenticated
  USING (is_public = TRUE);

-- Step 3: Verify RLS is enabled (should already be enabled)
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Step 4: Grant SELECT permission to anon role
GRANT SELECT ON opportunities TO anon;
GRANT SELECT ON opportunities TO authenticated;

-- Step 5: Do the same for opportunity_saves (for authenticated users only)
-- Note: Saves should only be visible to the owner
DROP POLICY IF EXISTS "Users can view their own saves" ON opportunity_saves;
CREATE POLICY "Users can view their own saves"
  ON opportunity_saves
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own saves" ON opportunity_saves;
CREATE POLICY "Users can manage their own saves"
  ON opportunity_saves
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own saves" ON opportunity_saves;
CREATE POLICY "Users can delete their own saves"
  ON opportunity_saves
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE opportunity_saves ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions for RPC functions
GRANT EXECUTE ON FUNCTION increment_opportunity_clicks(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_opportunity_views(UUID) TO anon, authenticated;

-- Step 7: Verify the fix
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICY FIX APPLIED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'The following changes were made:';
  RAISE NOTICE '1. ✓ Recreated SELECT policy for opportunities';
  RAISE NOTICE '2. ✓ Explicitly allowed anon and authenticated roles';
  RAISE NOTICE '3. ✓ Granted SELECT permissions to anon role';
  RAISE NOTICE '4. ✓ Updated opportunity_saves policies';
  RAISE NOTICE '5. ✓ Granted EXECUTE permissions for RPC functions';
  RAISE NOTICE '';
  RAISE NOTICE 'Test the fix:';
  RAISE NOTICE '1. Open your app in an incognito/private window';
  RAISE NOTICE '2. Navigate to the Opportunities page';
  RAISE NOTICE '3. You should see opportunities without logging in';
  RAISE NOTICE '';
  RAISE NOTICE 'If you still see 401 errors:';
  RAISE NOTICE '1. Check that opportunities have is_public = TRUE';
  RAISE NOTICE '2. Verify your VITE_SUPABASE_ANON_KEY is correct';
  RAISE NOTICE '3. Check Supabase Dashboard > Authentication > Policies';
  RAISE NOTICE '';
END $$;

-- Optional: Check if there are any public opportunities
SELECT
  COUNT(*) as total_opportunities,
  COUNT(*) FILTER (WHERE is_public = TRUE) as public_opportunities,
  COUNT(*) FILTER (WHERE is_public = FALSE) as private_opportunities
FROM opportunities;

-- Optional: Test the policy by simulating anon access
-- This will show if the policy works correctly
SET ROLE anon;
SELECT COUNT(*) as visible_to_anon FROM opportunities WHERE is_public = TRUE;
RESET ROLE;
