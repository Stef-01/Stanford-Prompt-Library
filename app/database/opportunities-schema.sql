-- =====================================================
-- OPPORTUNITIES PAGE DATABASE SCHEMA
-- Safe to run - creates NEW tables only
-- =====================================================

-- NEW TABLE: opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  category TEXT NOT NULL CHECK (category IN (
    'fellowship',
    'research',
    'internship',
    'teaching',
    'competition',
    'startup',
    'club',
    'course'
  )),

  -- Metadata
  organization TEXT NOT NULL,
  location TEXT, -- e.g., "Remote", "Stanford, CA", "Global"
  url TEXT CHECK (url ~ '^https?://'),
  tags TEXT[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'coming_soon',
    'closed',
    'featured'
  )),

  -- Display properties
  card_size TEXT DEFAULT '1x1' CHECK (card_size IN ('1x1', '2x1', '1x2', '2x2')),
  gradient TEXT DEFAULT 'purple-blue' CHECK (gradient IN (
    'purple-blue',
    'blue-cyan',
    'green-teal',
    'orange-red',
    'pink-purple'
  )),
  icon TEXT DEFAULT 'briefcase' CHECK (icon IN (
    'briefcase',
    'graduation-cap',
    'lightbulb',
    'users-group',
    'rocket',
    'globe',
    'trophy',
    'book-open',
    'beaker',
    'code',
    'sparkles'
  )),
  priority INTEGER DEFAULT 0, -- higher = shown first

  -- Engagement (will be updated by triggers)
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  saves_count INTEGER DEFAULT 0 CHECK (saves_count >= 0),
  clicks_count INTEGER DEFAULT 0 CHECK (clicks_count >= 0),

  -- Timestamps
  deadline TIMESTAMP WITH TIME ZONE, -- application deadline if applicable
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Admin
  is_public BOOLEAN DEFAULT TRUE,

  -- Search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(organization, '') || ' ' ||
      array_to_string(tags, ' ')
    )
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON opportunities USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_at ON opportunities(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline) WHERE deadline IS NOT NULL;

-- NEW TABLE: opportunity_saves (bookmark feature)
CREATE TABLE IF NOT EXISTS public.opportunity_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_saves_user ON opportunity_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_saves_opportunity ON opportunity_saves(opportunity_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON opportunities;
CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();

-- Trigger for saves_count
CREATE OR REPLACE FUNCTION update_opportunity_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE opportunities
    SET saves_count = saves_count + 1
    WHERE id = NEW.opportunity_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE opportunities
    SET saves_count = GREATEST(0, saves_count - 1)
    WHERE id = OLD.opportunity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_saves_count ON opportunity_saves;
CREATE TRIGGER update_saves_count
  AFTER INSERT OR DELETE ON opportunity_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_saves_count();

-- Function to increment clicks (called from frontend)
CREATE OR REPLACE FUNCTION increment_opportunity_clicks(opp_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE opportunities
  SET clicks_count = clicks_count + 1
  WHERE id = opp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment views (called when opportunity is viewed)
CREATE OR REPLACE FUNCTION increment_opportunity_views(opp_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE opportunities
  SET views_count = views_count + 1
  WHERE id = opp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Opportunities are viewable by all" ON opportunities;
CREATE POLICY "Opportunities are viewable by all"
  ON opportunities FOR SELECT
  USING (is_public = TRUE);

DROP POLICY IF EXISTS "Admins can manage all opportunities" ON opportunities;
CREATE POLICY "Admins can manage all opportunities"
  ON opportunities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

ALTER TABLE opportunity_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saves" ON opportunity_saves;
CREATE POLICY "Users can view their own saves"
  ON opportunity_saves FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own saves" ON opportunity_saves;
CREATE POLICY "Users can manage their own saves"
  ON opportunity_saves FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own saves" ON opportunity_saves;
CREATE POLICY "Users can delete their own saves"
  ON opportunity_saves FOR DELETE
  USING (user_id = auth.uid());

-- Grant permissions
GRANT SELECT ON opportunities TO authenticated;
GRANT SELECT, INSERT, DELETE ON opportunity_saves TO authenticated;
GRANT EXECUTE ON FUNCTION increment_opportunity_clicks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_opportunity_views(UUID) TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Opportunities schema created successfully!';
  RAISE NOTICE 'Tables: opportunities, opportunity_saves';
  RAISE NOTICE 'Functions: increment_opportunity_clicks, increment_opportunity_views';
END $$;
