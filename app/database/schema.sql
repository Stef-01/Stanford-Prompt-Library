-- Stanford Prompt Library - MVP Database Schema
-- Run this in Supabase SQL Editor

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,

  -- Gated access
  has_submitted_prompt BOOLEAN DEFAULT FALSE,
  is_approved_member BOOLEAN DEFAULT FALSE,

  -- Admin
  is_admin BOOLEAN DEFAULT FALSE,

  -- Stats
  total_prompts INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) >= 10),
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'AI Agents', 'Creative Writing', 'Data Analysis',
    'Image Generation', 'Business', 'Research',
    'Gaming', 'Website Coding'
  )),
  tags TEXT[] DEFAULT '{}',

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_initial_prompt BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,

  -- Social metrics
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),

  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(array_to_string(tags, ' '), '')
    )
  ) STORED
);

-- Likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate likes
  UNIQUE(user_id, prompt_id)
);

-- Categories reference table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_approved_member ON users(is_approved_member);

-- Prompts
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_likes ON prompts(likes_count DESC);
CREATE INDEX idx_prompts_search ON prompts USING GIN(search_vector);
CREATE INDEX idx_prompts_public ON prompts(is_public, status)
  WHERE is_public = TRUE AND status = 'approved';

-- Likes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_prompt_id ON likes(prompt_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Anyone can view public profile info
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can insert own profile on first sign in
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PROMPTS POLICIES
-- Approved members can view approved public prompts
CREATE POLICY "Approved members can view approved prompts"
  ON prompts FOR SELECT
  USING (
    is_public = TRUE
    AND status = 'approved'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_approved_member = TRUE
    )
  );

-- Users can view their own prompts (any status)
CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert prompts
CREATE POLICY "Authenticated users can submit prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own pending prompts
CREATE POLICY "Users can update own pending prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all prompts
CREATE POLICY "Admins can view all prompts"
  ON prompts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can update any prompt (for approval/rejection)
CREATE POLICY "Admins can update prompts"
  ON prompts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- LIKES POLICIES
-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  USING (true);

-- Authenticated users can like prompts
CREATE POLICY "Users can like prompts"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can unlike prompts"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- CATEGORIES POLICIES
-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- =============================================================================
-- TRIGGERS & FUNCTIONS
-- =============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Grant member access after initial prompt is approved
CREATE OR REPLACE FUNCTION grant_member_access_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an initial prompt being approved for the first time
  IF NEW.is_initial_prompt = TRUE
     AND NEW.status = 'approved'
     AND (OLD.status IS NULL OR OLD.status != 'approved') THEN

    UPDATE users
    SET
      is_approved_member = TRUE,
      total_prompts = total_prompts + 1
    WHERE id = NEW.user_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_prompt_approved
  AFTER INSERT OR UPDATE OF status ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION grant_member_access_on_approval();

-- Function: Mark user as having submitted a prompt
CREATE OR REPLACE FUNCTION mark_user_submitted_prompt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET has_submitted_prompt = TRUE
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_first_prompt_submission
  AFTER INSERT ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION mark_user_submitted_prompt();

-- Function: Increment likes counter
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment prompt likes count
  UPDATE prompts
  SET likes_count = likes_count + 1
  WHERE id = NEW.prompt_id;

  -- Increment user's total likes received
  UPDATE users u
  SET total_likes_received = total_likes_received + 1
  FROM prompts p
  WHERE u.id = p.user_id
  AND p.id = NEW.prompt_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_added
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

-- Function: Decrement likes counter
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement prompt likes count
  UPDATE prompts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.prompt_id;

  -- Decrement user's total likes received
  UPDATE users u
  SET total_likes_received = GREATEST(total_likes_received - 1, 0)
  FROM prompts p
  WHERE u.id = p.user_id
  AND p.id = OLD.prompt_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_removed
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert categories
INSERT INTO categories (name, slug, icon, color) VALUES
  ('AI Agents', 'ai-agents', '🤖', '#3b82f6'),
  ('Creative Writing', 'creative-writing', '✍️', '#22c55e'),
  ('Data Analysis', 'data-analysis', '📊', '#a855f7'),
  ('Image Generation', 'image-generation', '🎨', '#f97316'),
  ('Business', 'business', '💼', '#ec4899'),
  ('Research', 'research', '🔬', '#06b6d4'),
  ('Gaming', 'gaming', '🎮', '#eab308'),
  ('Website Coding', 'website-coding', '💻', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- DONE!
-- =============================================================================

-- Verify tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
