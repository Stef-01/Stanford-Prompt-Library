-- =====================================================
-- OPPORTUNITIES VERIFICATION SCRIPT
-- Run this after installation to verify everything works
-- =====================================================

-- Check 1: Tables exist
DO $$
BEGIN
  RAISE NOTICE '=== TABLE EXISTENCE CHECK ===';

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'opportunities') THEN
    RAISE NOTICE '✓ opportunities table exists';
  ELSE
    RAISE EXCEPTION '✗ opportunities table NOT FOUND';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'opportunity_saves') THEN
    RAISE NOTICE '✓ opportunity_saves table exists';
  ELSE
    RAISE EXCEPTION '✗ opportunity_saves table NOT FOUND';
  END IF;
END $$;

-- Check 2: Row counts
DO $$
DECLARE
  total_count INTEGER;
  featured_count INTEGER;
  active_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== DATA COUNT CHECK ===';

  SELECT COUNT(*) INTO total_count FROM opportunities;
  SELECT COUNT(*) INTO featured_count FROM opportunities WHERE status = 'featured';
  SELECT COUNT(*) INTO active_count FROM opportunities WHERE status = 'active';

  RAISE NOTICE 'Total opportunities: %', total_count;
  RAISE NOTICE 'Featured opportunities: %', featured_count;
  RAISE NOTICE 'Active opportunities: %', active_count;

  IF total_count < 20 THEN
    RAISE WARNING '⚠ Expected 20+ opportunities, found %', total_count;
  ELSE
    RAISE NOTICE '✓ Data count looks good';
  END IF;

  IF featured_count < 3 THEN
    RAISE WARNING '⚠ Expected 3 featured opportunities, found %', featured_count;
  ELSE
    RAISE NOTICE '✓ Featured count looks good';
  END IF;
END $$;

-- Check 3: Category distribution
SELECT
  category,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✓'
    ELSE '✗'
  END as status
FROM opportunities
GROUP BY category
ORDER BY count DESC;

-- Check 4: Indexes exist
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== INDEX CHECK ===';

  IF EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_opportunities_status') THEN
    RAISE NOTICE '✓ idx_opportunities_status exists';
  ELSE
    RAISE WARNING '⚠ idx_opportunities_status NOT FOUND';
  END IF;

  IF EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_opportunities_category') THEN
    RAISE NOTICE '✓ idx_opportunities_category exists';
  ELSE
    RAISE WARNING '⚠ idx_opportunities_category NOT FOUND';
  END IF;

  IF EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_opportunities_search') THEN
    RAISE NOTICE '✓ idx_opportunities_search exists (full-text)';
  ELSE
    RAISE WARNING '⚠ idx_opportunities_search NOT FOUND';
  END IF;
END $$;

-- Check 5: RLS policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== ROW-LEVEL SECURITY CHECK ===';

  -- Check if RLS is enabled on opportunities
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'opportunities'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    RAISE NOTICE '✓ RLS enabled on opportunities table';
  ELSE
    RAISE WARNING '⚠ RLS NOT enabled on opportunities table';
  END IF;

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'opportunities';

  RAISE NOTICE 'Found % RLS policies on opportunities', policy_count;

  IF policy_count < 2 THEN
    RAISE WARNING '⚠ Expected at least 2 policies, found %', policy_count;
  END IF;
END $$;

-- Check 6: Functions exist
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FUNCTION CHECK ===';

  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'increment_opportunity_clicks') THEN
    RAISE NOTICE '✓ increment_opportunity_clicks function exists';
  ELSE
    RAISE WARNING '⚠ increment_opportunity_clicks NOT FOUND';
  END IF;

  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'increment_opportunity_views') THEN
    RAISE NOTICE '✓ increment_opportunity_views function exists';
  ELSE
    RAISE WARNING '⚠ increment_opportunity_views NOT FOUND';
  END IF;

  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'update_opportunity_saves_count') THEN
    RAISE NOTICE '✓ update_opportunity_saves_count function exists';
  ELSE
    RAISE WARNING '⚠ update_opportunity_saves_count NOT FOUND';
  END IF;
END $$;

-- Check 7: Triggers exist
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TRIGGER CHECK ===';

  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'set_opportunities_updated_at') THEN
    RAISE NOTICE '✓ set_opportunities_updated_at trigger exists';
  ELSE
    RAISE WARNING '⚠ set_opportunities_updated_at NOT FOUND';
  END IF;

  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_saves_count') THEN
    RAISE NOTICE '✓ update_saves_count trigger exists';
  ELSE
    RAISE WARNING '⚠ update_saves_count NOT FOUND';
  END IF;
END $$;

-- Check 8: Full-text search working
DO $$
DECLARE
  search_result INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FULL-TEXT SEARCH CHECK ===';

  SELECT COUNT(*) INTO search_result
  FROM opportunities
  WHERE search_vector @@ to_tsquery('english', 'HAI | fellowship | research');

  RAISE NOTICE 'Search for "HAI | fellowship | research" found % results', search_result;

  IF search_result = 0 THEN
    RAISE WARNING '⚠ Search returned no results - check search_vector';
  ELSE
    RAISE NOTICE '✓ Full-text search working';
  END IF;
END $$;

-- Check 9: Sample opportunities details
SELECT
  '=== SAMPLE OPPORTUNITIES ===' as section;

SELECT
  title,
  category,
  status,
  card_size,
  organization,
  CASE
    WHEN deadline IS NOT NULL THEN 'Has deadline'
    ELSE 'No deadline'
  END as deadline_status,
  array_length(tags, 1) as tag_count
FROM opportunities
ORDER BY priority DESC
LIMIT 5;

-- Check 10: Foreign key constraints
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== FOREIGN KEY CHECK ===';

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'opportunity_saves'
    AND constraint_name LIKE '%user_id%'
  ) THEN
    RAISE NOTICE '✓ Foreign key to users.id exists';
  ELSE
    RAISE WARNING '⚠ Foreign key to users.id NOT FOUND';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'opportunity_saves'
    AND constraint_name LIKE '%opportunity_id%'
  ) THEN
    RAISE NOTICE '✓ Foreign key to opportunities.id exists';
  ELSE
    RAISE WARNING '⚠ Foreign key to opportunities.id NOT FOUND';
  END IF;
END $$;

-- Summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'If you see any ⚠ warnings or ✗ errors above,';
  RAISE NOTICE 'review the installation steps in OPPORTUNITIES_README.md';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy frontend with: npm run build';
  RAISE NOTICE '2. Open app and click Opportunities in dock';
  RAISE NOTICE '3. Test search, filters, and bookmarks';
END $$;
