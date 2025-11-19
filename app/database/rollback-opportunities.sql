-- =====================================================
-- ROLLBACK SCRIPT FOR OPPORTUNITIES
-- Safe to run - only affects new opportunities tables
-- NO IMPACT on existing tables (users, prompts, etc.)
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_saves_count ON opportunity_saves;
DROP TRIGGER IF EXISTS set_opportunities_updated_at ON opportunities;

-- Drop functions
DROP FUNCTION IF EXISTS update_opportunity_saves_count();
DROP FUNCTION IF EXISTS update_opportunities_updated_at();
DROP FUNCTION IF EXISTS increment_opportunity_clicks(UUID);
DROP FUNCTION IF EXISTS increment_opportunity_views(UUID);

-- Drop tables (CASCADE removes dependent objects)
DROP TABLE IF EXISTS opportunity_saves CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Opportunities tables rolled back successfully';
  RAISE NOTICE 'Removed: opportunities, opportunity_saves, and all related functions/triggers';
  RAISE NOTICE 'Existing tables (users, prompts, etc.) unaffected';
END $$;
