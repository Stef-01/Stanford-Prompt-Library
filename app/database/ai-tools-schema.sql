-- Stanford Prompt Library - AI Tools Recommendation Feature
-- Run this in Supabase SQL Editor after main schema.sql

-- =============================================================================
-- AI TOOLS TABLES
-- =============================================================================

-- AI Tools table
CREATE TABLE public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Tool Information
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) >= 20 AND char_length(description) <= 1000),
  category TEXT NOT NULL CHECK (category IN (
    'Language Model', 'Development Tool', 'Search & Research',
    'Image Generation', 'Video Generation', 'Audio Generation',
    'Data Analysis', 'Productivity', 'Education', 'Other'
  )),
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  tags TEXT[] DEFAULT '{}',

  -- Approval workflow (same as prompts)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,

  -- Voting metrics
  upvotes_count INTEGER DEFAULT 0 CHECK (upvotes_count >= 0),
  downvotes_count INTEGER DEFAULT 0 CHECK (downvotes_count >= 0),
  net_score INTEGER GENERATED ALWAYS AS (upvotes_count - downvotes_count) STORED,

  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(array_to_string(tags, ' '), '')
    )
  ) STORED
);

-- Tool Categories reference table
CREATE TABLE public.tool_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tool Votes table (upvote/downvote)
CREATE TABLE public.tool_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate votes (one vote per user per tool)
  UNIQUE(user_id, tool_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- AI Tools
CREATE INDEX idx_ai_tools_user_id ON ai_tools(user_id);
CREATE INDEX idx_ai_tools_status ON ai_tools(status);
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_tags ON ai_tools USING GIN(tags);
CREATE INDEX idx_ai_tools_created_at ON ai_tools(created_at DESC);
CREATE INDEX idx_ai_tools_net_score ON ai_tools(net_score DESC);
CREATE INDEX idx_ai_tools_upvotes ON ai_tools(upvotes_count DESC);
CREATE INDEX idx_ai_tools_search ON ai_tools USING GIN(search_vector);
CREATE INDEX idx_ai_tools_public ON ai_tools(is_public, status)
  WHERE is_public = TRUE AND status = 'approved';

-- Tool Votes
CREATE INDEX idx_tool_votes_user_id ON tool_votes(user_id);
CREATE INDEX idx_tool_votes_tool_id ON tool_votes(tool_id);
CREATE INDEX idx_tool_votes_created_at ON tool_votes(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;

-- AI TOOLS POLICIES
-- Approved members can view approved public tools
CREATE POLICY "Approved members can view approved tools"
  ON ai_tools FOR SELECT
  USING (
    is_public = TRUE
    AND status = 'approved'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_approved_member = TRUE
    )
  );

-- Users can view their own tools (any status)
CREATE POLICY "Users can view own tools"
  ON ai_tools FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated approved members can submit tools
CREATE POLICY "Approved members can submit tools"
  ON ai_tools FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_approved_member = TRUE
    )
  );

-- Users can update own pending tools
CREATE POLICY "Users can update own pending tools"
  ON ai_tools FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all tools
CREATE POLICY "Admins can view all tools"
  ON ai_tools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can update any tool (for approval/rejection)
CREATE POLICY "Admins can update tools"
  ON ai_tools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- TOOL VOTES POLICIES
-- Approved members can view all votes
CREATE POLICY "Approved members can view votes"
  ON tool_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_approved_member = TRUE
    )
  );

-- Approved members can vote on tools
CREATE POLICY "Approved members can vote on tools"
  ON tool_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_approved_member = TRUE
    )
  );

-- Users can update their own votes (change upvote to downvote or vice versa)
CREATE POLICY "Users can update own votes"
  ON tool_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON tool_votes FOR DELETE
  USING (auth.uid() = user_id);

-- TOOL CATEGORIES POLICIES
-- Anyone can view tool categories
CREATE POLICY "Anyone can view tool categories"
  ON tool_categories FOR SELECT
  USING (true);

-- =============================================================================
-- TRIGGERS & FUNCTIONS
-- =============================================================================

-- Trigger for updated_at on ai_tools
CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on tool_votes
CREATE TRIGGER update_tool_votes_updated_at
  BEFORE UPDATE ON tool_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Update vote counters when vote is added
CREATE OR REPLACE FUNCTION update_tool_vote_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New vote
    IF NEW.vote_type = 'upvote' THEN
      UPDATE ai_tools
      SET upvotes_count = upvotes_count + 1
      WHERE id = NEW.tool_id;
    ELSE
      UPDATE ai_tools
      SET downvotes_count = downvotes_count + 1
      WHERE id = NEW.tool_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote changed (upvote to downvote or vice versa)
    IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
      UPDATE ai_tools
      SET upvotes_count = GREATEST(upvotes_count - 1, 0),
          downvotes_count = downvotes_count + 1
      WHERE id = NEW.tool_id;
    ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
      UPDATE ai_tools
      SET downvotes_count = GREATEST(downvotes_count - 1, 0),
          upvotes_count = upvotes_count + 1
      WHERE id = NEW.tool_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    -- Vote removed
    IF OLD.vote_type = 'upvote' THEN
      UPDATE ai_tools
      SET upvotes_count = GREATEST(upvotes_count - 1, 0)
      WHERE id = OLD.tool_id;
    ELSE
      UPDATE ai_tools
      SET downvotes_count = GREATEST(downvotes_count - 1, 0)
      WHERE id = OLD.tool_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tool_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON tool_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_vote_counters();

-- Function: Auto-approve tool when submitted (or keep pending for moderation)
-- For now, auto-approve to match the prompt workflow
CREATE OR REPLACE FUNCTION auto_set_tool_public()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    NEW.is_public = TRUE;
  ELSIF NEW.status = 'rejected' THEN
    NEW.is_public = FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tool_status_change
  BEFORE INSERT OR UPDATE OF status ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_tool_public();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert tool categories
INSERT INTO tool_categories (name, slug, icon, color, description) VALUES
  ('Language Model', 'language-model', '🤖', '#3b82f6', 'AI language models like ChatGPT, Claude, etc.'),
  ('Development Tool', 'development-tool', '💻', '#8b5cf6', 'AI-powered coding assistants and IDEs'),
  ('Search & Research', 'search-research', '🔍', '#06b6d4', 'AI search engines and research tools'),
  ('Image Generation', 'image-generation', '🎨', '#f97316', 'AI image creation and editing tools'),
  ('Video Generation', 'video-generation', '🎬', '#ec4899', 'AI video creation and editing tools'),
  ('Audio Generation', 'audio-generation', '🎵', '#22c55e', 'AI audio, music, and voice generation'),
  ('Data Analysis', 'data-analysis', '📊', '#a855f7', 'AI data analysis and visualization tools'),
  ('Productivity', 'productivity', '⚡', '#eab308', 'AI productivity and workflow tools'),
  ('Education', 'education', '📚', '#10b981', 'AI learning and educational platforms'),
  ('Other', 'other', '✨', '#6b7280', 'Other AI tools and services')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample AI tools (optional - remove if you want empty start)
-- Commenting out for production, uncomment for testing
/*
INSERT INTO ai_tools (
  user_id,
  name,
  description,
  category,
  url,
  tags,
  status,
  is_public,
  upvotes_count,
  downvotes_count
)
SELECT
  u.id,
  'Claude 3.5 Sonnet',
  'Anthropic''s most intelligent model, excellent for coding, writing, and complex analysis with industry-leading context window.',
  'Language Model',
  'https://claude.ai',
  ARRAY['ai', 'language-model', 'coding', 'writing'],
  'approved',
  TRUE,
  47,
  3
FROM users u
WHERE u.is_admin = TRUE
LIMIT 1;
*/

-- =============================================================================
-- UTILITY VIEWS
-- =============================================================================

-- View: Top AI Tools by net score
CREATE OR REPLACE VIEW top_ai_tools AS
SELECT
  t.*,
  u.display_name as submitted_by_name,
  u.avatar_url as submitted_by_avatar
FROM ai_tools t
JOIN users u ON t.user_id = u.id
WHERE t.status = 'approved' AND t.is_public = TRUE
ORDER BY t.net_score DESC, t.upvotes_count DESC, t.created_at DESC;

-- =============================================================================
-- DONE!
-- =============================================================================

-- Verify tables created
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('ai_tools', 'tool_votes', 'tool_categories')
ORDER BY tablename;
