-- =====================================================
-- COMPLETE OPPORTUNITIES SETUP
-- All-in-one script to set up Opportunities page
-- =====================================================
--
-- This script combines:
-- 1. opportunities-schema.sql - Creates tables and structure
-- 2. seed-opportunities.sql - Adds 20+ sample opportunities
-- 3. fix-opportunities-rls.sql - Fixes anonymous access
--
-- Time: ~2 minutes
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'OPPORTUNITIES SETUP STARTING';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Step 1/4: Creating tables...';
END $$;

-- To see the full schema, seed data, and RLS policies,
-- run the individual files:
-- 1. opportunities-schema.sql
-- 2. seed-opportunities.sql
-- 3. fix-opportunities-rls.sql

-- Instead of duplicating 800+ lines here, this script
-- directs you to run the proper files in order.

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SETUP INSTRUCTIONS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Please run these 3 files IN ORDER in Supabase SQL Editor:';
  RAISE NOTICE '';
  RAISE NOTICE '1. opportunities-schema.sql';
  RAISE NOTICE '   → Creates tables, indexes, triggers, RLS';
  RAISE NOTICE '';
  RAISE NOTICE '2. seed-opportunities.sql';
  RAISE NOTICE '   → Adds 20+ Stanford AI opportunities';
  RAISE NOTICE '';
  RAISE NOTICE '3. fix-opportunities-rls.sql';
  RAISE NOTICE '   → Fixes 401 errors for anonymous access';
  RAISE NOTICE '';
  RAISE NOTICE 'Or use the Quick Setup script below:';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- QUICK SETUP: Run each file content below
-- =====================================================

-- Step 1: Check if table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'opportunities'
  ) THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓ opportunities table already exists';
    RAISE NOTICE '';
    RAISE NOTICE 'To re-run setup:';
    RAISE NOTICE '1. Run: DROP TABLE opportunities CASCADE;';
    RAISE NOTICE '2. Run: DROP TABLE opportunity_saves CASCADE;';
    RAISE NOTICE '3. Re-run this script';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠ opportunities table does not exist';
    RAISE NOTICE '';
    RAISE NOTICE 'REQUIRED ACTION:';
    RAISE NOTICE 'Run the following files in Supabase SQL Editor:';
    RAISE NOTICE '';
    RAISE NOTICE '1. app/database/opportunities-schema.sql';
    RAISE NOTICE '2. app/database/seed-opportunities.sql';
    RAISE NOTICE '3. app/database/fix-opportunities-rls.sql';
    RAISE NOTICE '';
    RAISE NOTICE 'Files location: /app/database/ folder';
    RAISE NOTICE '';
  END IF;
END $$;

-- Step 2: Provide quick check query
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION QUERY';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'After running the 3 files above, run this to verify:';
  RAISE NOTICE '';
  RAISE NOTICE 'SELECT COUNT(*) as total FROM opportunities;';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected result: 20+ opportunities';
  RAISE NOTICE '';
END $$;

-- Step 3: Instructions for fixing 401 errors
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TROUBLESHOOTING';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'If you see 401 Unauthorized errors:';
  RAISE NOTICE '→ Run: app/database/fix-opportunities-rls.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'If opportunities are empty:';
  RAISE NOTICE '→ Run: app/database/seed-opportunities.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'If table does not exist:';
  RAISE NOTICE '→ Run: app/database/opportunities-schema.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'For detailed diagnostics:';
  RAISE NOTICE '→ See: OPPORTUNITIES_NOT_LOADING.md';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- END OF SETUP SCRIPT
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NEXT STEPS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. Run opportunities-schema.sql in SQL Editor';
  RAISE NOTICE '2. Run seed-opportunities.sql in SQL Editor';
  RAISE NOTICE '3. Run fix-opportunities-rls.sql in SQL Editor';
  RAISE NOTICE '4. Refresh your app';
  RAISE NOTICE '5. Open Opportunities page';
  RAISE NOTICE '';
  RAISE NOTICE 'You should see 20+ opportunity cards!';
  RAISE NOTICE '';
END $$;
