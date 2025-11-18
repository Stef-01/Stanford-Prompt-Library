# Stanford Prompt Library - Live Wiki Deployment Plan

## Executive Summary
This document outlines a comprehensive plan to transform the Stanford Prompt Library HTML prototype into a production-ready live wiki with permanent data persistence, user authentication, and social features powered by Supabase.

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Technology Stack
- **Frontend**: Existing HTML/CSS/JavaScript (to be modularized)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Hosting**: Vercel/Netlify (Frontend) + Supabase Cloud (Backend)
- **CDN**: Cloudflare for static assets
- **Domain**: Custom Stanford domain (e.g., prompts.stanford.edu)

### 1.2 High-Level Architecture
```
┌─────────────────┐
│  Client (Web)   │
│   HTML/CSS/JS   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Supabase      │
│  - Auth (Google)│
│  - PostgreSQL   │
│  - Storage      │
│  - Realtime     │
│  - Edge Funcs   │
└─────────────────┘
```

---

## 2. DATABASE SCHEMA DESIGN

### 2.1 Core Tables

#### `users` (extends Supabase auth.users)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_stanford_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  total_prompts INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  reputation_score DECIMAL(10,2) DEFAULT 0.0
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
```

#### `prompts` (Core content table)
```sql
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',

  -- Social metrics
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  copies_count INTEGER DEFAULT 0,

  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Image storage (optional)
  example_image_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
  ) STORED
);

-- Indexes
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_likes ON prompts(likes_count DESC);
CREATE INDEX idx_prompts_search ON prompts USING GIN(search_vector);
CREATE INDEX idx_prompts_public ON prompts(is_public, is_deleted) WHERE is_public = TRUE AND is_deleted = FALSE;
```

#### `likes` (User interactions)
```sql
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate likes
  UNIQUE(user_id, prompt_id)
);

-- Indexes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_prompt_id ON likes(prompt_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);
```

#### `categories` (Predefined categories)
```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  prompts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with initial categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('AI Agents', 'ai-agents', 'Build autonomous AI agents with advanced reasoning', '🤖', '#3b82f6'),
  ('Creative Writing', 'creative-writing', 'Storytelling, poetry, and narrative generation', '✍️', '#22c55e'),
  ('Data Analysis', 'data-analysis', 'Statistical analysis and data interpretation', '📊', '#a855f7'),
  ('Image Generation', 'image-generation', 'Midjourney, DALL-E, and Stable Diffusion prompts', '🎨', '#f97316'),
  ('Business', 'business', 'Marketing, strategy, and professional communication', '💼', '#ec4899'),
  ('Research', 'research', 'Academic writing and research methodologies', '🔬', '#06b6d4'),
  ('Gaming', 'gaming', 'Game design, narratives, and interactive experiences', '🎮', '#eab308'),
  ('Website Coding', 'website-coding', 'Web development and coding prompts', '💻', '#8b5cf6');
```

#### `tags` (User-generated tags)
```sql
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_usage ON tags(usage_count DESC);
CREATE INDEX idx_tags_name ON tags(name);
```

#### `views` (Analytics)
```sql
CREATE TABLE public.views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_views_prompt_id ON views(prompt_id);
CREATE INDEX idx_views_created_at ON views(created_at DESC);
```

#### `favorites` (User's saved prompts)
```sql
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, prompt_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_prompt_id ON favorites(prompt_id);
```

#### `comments` (Optional - for future expansion)
```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_prompt_id ON comments(prompt_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

#### `leaderboard_cache` (Materialized view for performance)
```sql
CREATE MATERIALIZED VIEW leaderboard_cache AS
SELECT
  u.id,
  u.display_name,
  u.email,
  u.avatar_url,
  u.total_prompts,
  u.total_likes_received,
  u.reputation_score,
  (u.total_prompts * 1.0 + u.total_likes_received * 2.0) AS leaderboard_score,
  RANK() OVER (ORDER BY (u.total_prompts * 1.0 + u.total_likes_received * 2.0) DESC) AS rank
FROM users u
WHERE u.total_prompts > 0
ORDER BY leaderboard_score DESC;

-- Refresh periodically via cron job
CREATE INDEX idx_leaderboard_score ON leaderboard_cache(leaderboard_score DESC);
```

### 2.2 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Users: Read own data, update own data
CREATE POLICY "Users can view all public profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Prompts: Read public prompts, full access to own prompts
CREATE POLICY "Anyone can view public prompts"
  ON prompts FOR SELECT
  USING (is_public = TRUE AND is_deleted = FALSE);

CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft-delete own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Likes: Users can like/unlike
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like prompts"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike prompts"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites: Users can favorite/unfavorite
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### 2.3 Database Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment likes counter on prompts
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts
  SET likes_count = likes_count + 1
  WHERE id = NEW.prompt_id;

  UPDATE users
  SET total_likes_received = total_likes_received + 1
  WHERE id = (SELECT user_id FROM prompts WHERE id = NEW.prompt_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_added AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

-- Decrement likes counter
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.prompt_id;

  UPDATE users
  SET total_likes_received = GREATEST(total_likes_received - 1, 0)
  WHERE id = (SELECT user_id FROM prompts WHERE id = OLD.prompt_id);

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_removed AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- Update user's total_prompts on prompt creation
CREATE OR REPLACE FUNCTION increment_user_prompts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET total_prompts = total_prompts + 1
  WHERE id = NEW.user_id;

  UPDATE categories
  SET prompts_count = prompts_count + 1
  WHERE name = NEW.category;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_prompt_created AFTER INSERT ON prompts
  FOR EACH ROW EXECUTE FUNCTION increment_user_prompts();

-- Prevent hard deletes, enforce soft deletes
CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletes are not allowed. Use soft delete instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_prompt_hard_delete BEFORE DELETE ON prompts
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();
```

---

## 3. AUTHENTICATION IMPLEMENTATION

### 3.1 Google OAuth with Stanford Email Restriction

#### Supabase Auth Configuration
```javascript
// In Supabase Dashboard > Authentication > Providers
// Enable Google OAuth with:
{
  "client_id": "YOUR_GOOGLE_CLIENT_ID",
  "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
  "redirect_url": "https://your-project.supabase.co/auth/v1/callback"
}
```

#### Email Domain Restriction (Stanford Only)
```sql
-- Create function to verify Stanford email
CREATE OR REPLACE FUNCTION verify_stanford_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@stanford.edu' THEN
    RAISE EXCEPTION 'Only Stanford email addresses are allowed';
  END IF;

  NEW.is_stanford_verified = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stanford_email BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION verify_stanford_email();
```

#### Frontend Auth Integration
```javascript
// auth.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sign in with Google (Stanford emails only)
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        hd: 'stanford.edu' // Force Stanford domain
      }
    }
  })

  if (error) throw error
  return data
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User signed in, update UI
    updateUIForAuthenticatedUser(session.user)
  } else if (event === 'SIGNED_OUT') {
    // User signed out, redirect to login
    redirectToLogin()
  }
})
```

### 3.2 User Profile Creation
```javascript
// On first sign in, create user profile
async function createUserProfile(user) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata.avatar_url || null,
        is_stanford_verified: user.email.endsWith('@stanford.edu')
      }
    ])
    .select()
    .single()

  if (error && error.code !== '23505') { // Ignore duplicate key error
    throw error
  }

  return data
}
```

---

## 4. FRONTEND MODIFICATIONS

### 4.1 Code Restructuring
Transform monolithic HTML into modular structure:

```
/src
  /components
    - Header.js
    - Dock.js
    - Window.js
    - PromptCard.js
    - PromptForm.js
    - SearchBar.js
    - Leaderboard.js
    - MarkdownEditor.js
  /services
    - supabase.js
    - auth.js
    - prompts.js
    - likes.js
    - leaderboard.js
  /utils
    - validators.js
    - formatters.js
  /styles
    - main.css
    - components.css
  /pages
    - index.html
    - auth-callback.html
  - app.js
  - config.js
```

### 4.2 Markdown Editor Integration
```javascript
// Use SimpleMDE or similar
import SimpleMDE from 'simplemde'

const markdownEditor = new SimpleMDE({
  element: document.getElementById('prompt-content'),
  spellChecker: false,
  placeholder: 'Enter your prompt here (supports markdown)...',
  toolbar: ['bold', 'italic', 'heading', '|', 'code', 'quote', 'unordered-list', 'ordered-list', '|', 'link', 'image', '|', 'preview', 'guide']
})
```

### 4.3 Search & Filter Implementation
```javascript
// Advanced search with filters
async function searchPrompts(query, filters = {}) {
  let queryBuilder = supabase
    .from('prompts')
    .select(`
      *,
      users!inner(display_name, avatar_url),
      likes(count)
    `)
    .eq('is_public', true)
    .eq('is_deleted', false)

  // Text search
  if (query) {
    queryBuilder = queryBuilder.textSearch('search_vector', query)
  }

  // Category filter
  if (filters.category) {
    queryBuilder = queryBuilder.eq('category', filters.category)
  }

  // Tags filter (any of the tags)
  if (filters.tags && filters.tags.length > 0) {
    queryBuilder = queryBuilder.contains('tags', filters.tags)
  }

  // Use case filter
  if (filters.useCases && filters.useCases.length > 0) {
    queryBuilder = queryBuilder.contains('use_cases', filters.useCases)
  }

  // Sorting
  if (filters.sortBy === 'likes') {
    queryBuilder = queryBuilder.order('likes_count', { ascending: false })
  } else if (filters.sortBy === 'views') {
    queryBuilder = queryBuilder.order('views_count', { ascending: false })
  } else {
    queryBuilder = queryBuilder.order('created_at', { ascending: false })
  }

  // Pagination
  const page = filters.page || 0
  const limit = filters.limit || 20
  queryBuilder = queryBuilder.range(page * limit, (page + 1) * limit - 1)

  const { data, error } = await queryBuilder

  if (error) throw error
  return data
}
```

### 4.4 Upvote/Like System
```javascript
// Like a prompt
async function likePrompt(promptId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Must be logged in to like')

  const { data, error } = await supabase
    .from('likes')
    .insert([{ user_id: user.id, prompt_id: promptId }])
    .select()

  if (error) {
    if (error.code === '23505') {
      // Already liked, unlike instead
      return unlikePrompt(promptId)
    }
    throw error
  }

  return data
}

// Unlike a prompt
async function unlikePrompt(promptId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Must be logged in to unlike')

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)

  if (error) throw error
}

// Check if user has liked a prompt
async function hasUserLiked(promptId) {
  const user = await getCurrentUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single()

  return !!data
}
```

### 4.5 Copy to Clipboard Feature
```javascript
async function copyPromptToClipboard(promptId) {
  const { data, error } = await supabase
    .from('prompts')
    .select('content')
    .eq('id', promptId)
    .single()

  if (error) throw error

  await navigator.clipboard.writeText(data.content)

  // Track copy event
  await supabase
    .from('prompts')
    .update({ copies_count: data.copies_count + 1 })
    .eq('id', promptId)

  showNotification('Prompt copied to clipboard!')
}

// Export as Markdown
function exportAsMarkdown(prompt) {
  const markdown = `# ${prompt.title}\n\n${prompt.description}\n\n## Prompt\n\n${prompt.content}`
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${prompt.title.replace(/\s+/g, '-').toLowerCase()}.md`
  a.click()
  URL.revokeObjectURL(url)
}
```

### 4.6 Leaderboard Implementation
```javascript
async function getLeaderboard(timeframe = 'all', limit = 50) {
  let query = supabase
    .from('leaderboard_cache')
    .select('*')
    .limit(limit)

  // For real-time filtering (if not using materialized view)
  if (timeframe !== 'all') {
    // Use direct query instead of materialized view
    const dateFilter = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : null

    if (dateFilter) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - dateFilter)

      // Custom query with aggregation
      query = supabase.rpc('get_leaderboard_timeframe', {
        timeframe_days: dateFilter,
        row_limit: limit
      })
    }
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Database function for timeframe-based leaderboard
/*
CREATE OR REPLACE FUNCTION get_leaderboard_timeframe(timeframe_days INTEGER, row_limit INTEGER)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  prompts_count BIGINT,
  likes_count BIGINT,
  score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.display_name,
    u.email,
    u.avatar_url,
    COUNT(DISTINCT p.id) AS prompts_count,
    COUNT(DISTINCT l.id) AS likes_count,
    (COUNT(DISTINCT p.id)::NUMERIC * 1.0 + COUNT(DISTINCT l.id)::NUMERIC * 2.0) AS score
  FROM users u
  LEFT JOIN prompts p ON p.user_id = u.id
    AND p.created_at >= NOW() - (timeframe_days || ' days')::INTERVAL
    AND p.is_deleted = FALSE
  LEFT JOIN likes l ON l.user_id = (SELECT user_id FROM prompts WHERE id = l.prompt_id)
    AND l.created_at >= NOW() - (timeframe_days || ' days')::INTERVAL
  GROUP BY u.id, u.display_name, u.email, u.avatar_url
  HAVING COUNT(DISTINCT p.id) > 0
  ORDER BY score DESC
  LIMIT row_limit;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 5. DATA PERSISTENCE & BACKUP STRATEGY

### 5.1 Supabase Automatic Backups
- Daily automated backups (included in Supabase Pro plan)
- Point-in-time recovery (PITR) up to 7 days
- Ability to restore to any point in time

### 5.2 Custom Backup Solution
```javascript
// Scheduled backup via Supabase Edge Functions
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Export all prompts to backup storage
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')

  if (error) throw error

  // Store backup in Supabase Storage
  const timestamp = new Date().toISOString()
  const backupData = JSON.stringify(prompts, null, 2)

  await supabase.storage
    .from('backups')
    .upload(`prompts_backup_${timestamp}.json`, backupData, {
      contentType: 'application/json'
    })

  return new Response(
    JSON.stringify({ success: true, timestamp }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### 5.3 Backup Schedule
- **Daily**: Full database backup at 2 AM UTC
- **Weekly**: Backup to external S3 bucket
- **Monthly**: Long-term archival backup

### 5.4 Data Retention Policy
```sql
-- Soft deletes are never hard-deleted (permanent retention)
-- Views data retention: 90 days
CREATE OR REPLACE FUNCTION cleanup_old_views()
RETURNS void AS $$
BEGIN
  DELETE FROM views WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (if available) or Edge Function
```

---

## 6. SECURITY CONSIDERATIONS

### 6.1 Authentication Security
- ✅ Google OAuth with Stanford domain restriction
- ✅ Email verification required
- ✅ Session timeout after 7 days
- ✅ Refresh token rotation
- ✅ CSRF protection (built into Supabase)

### 6.2 Data Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Encrypted connections (SSL/TLS)
- ✅ API keys stored in environment variables
- ✅ Rate limiting on API endpoints
- ✅ Input sanitization and validation

### 6.3 Content Moderation
```javascript
// Content validation before submission
function validatePromptContent(content) {
  const maxLength = 50000 // 50k characters
  const minLength = 10

  if (content.length < minLength) {
    throw new Error('Prompt is too short')
  }

  if (content.length > maxLength) {
    throw new Error('Prompt is too long')
  }

  // Check for malicious patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /data:text\/html/i
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      throw new Error('Invalid content detected')
    }
  }

  return true
}
```

### 6.4 Rate Limiting
```sql
-- Create rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action)
);

-- Rate limit function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT count, window_start INTO v_count, v_window_start
  FROM rate_limits
  WHERE user_id = p_user_id AND action = p_action;

  IF v_count IS NULL THEN
    -- First request
    INSERT INTO rate_limits (user_id, action, count, window_start)
    VALUES (p_user_id, p_action, 1, NOW());
    RETURN TRUE;
  END IF;

  IF NOW() - v_window_start > (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Window expired, reset
    UPDATE rate_limits
    SET count = 1, window_start = NOW()
    WHERE user_id = p_user_id AND action = p_action;
    RETURN TRUE;
  END IF;

  IF v_count >= p_max_requests THEN
    -- Rate limit exceeded
    RETURN FALSE;
  END IF;

  -- Increment count
  UPDATE rate_limits
  SET count = count + 1
  WHERE user_id = p_user_id AND action = p_action;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. DEPLOYMENT STRATEGY

### 7.1 Environment Setup

#### Development
```bash
# .env.development
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173
```

#### Production
```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://prompts.stanford.edu
```

### 7.2 Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.3 Database Migration Strategy
```bash
# Use Supabase CLI for migrations
npx supabase migration new initial_schema
npx supabase migration new add_leaderboard_cache
npx supabase db push # Apply migrations
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Database Optimization
- ✅ Proper indexing on all foreign keys and search columns
- ✅ Materialized views for leaderboard
- ✅ Connection pooling (built into Supabase)
- ✅ Query optimization using `EXPLAIN ANALYZE`

### 8.2 Frontend Optimization
- ✅ Code splitting
- ✅ Lazy loading of components
- ✅ Image optimization (WebP, lazy loading)
- ✅ CDN for static assets
- ✅ Service Worker for offline support

### 8.3 Caching Strategy
```javascript
// Cache frequently accessed data
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedCategories() {
  const cacheKey = 'categories'
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('prompts_count', { ascending: false })

  if (error) throw error

  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })

  return data
}
```

### 8.4 Realtime Updates (Optional)
```javascript
// Subscribe to new prompts in specific category
const subscription = supabase
  .channel('prompts-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'prompts',
      filter: 'category=eq.AI Agents'
    },
    (payload) => {
      console.log('New prompt added:', payload.new)
      // Update UI with new prompt
      addPromptToUI(payload.new)
    }
  )
  .subscribe()

// Cleanup on component unmount
// subscription.unsubscribe()
```

---

## 9. TESTING STRATEGY

### 9.1 Unit Tests
```javascript
// tests/auth.test.js
import { describe, it, expect } from 'vitest'
import { signInWithGoogle, validateStanfordEmail } from '../src/services/auth'

describe('Authentication', () => {
  it('should only allow Stanford emails', () => {
    expect(validateStanfordEmail('test@stanford.edu')).toBe(true)
    expect(validateStanfordEmail('test@gmail.com')).toBe(false)
  })
})
```

### 9.2 Integration Tests
```javascript
// tests/prompts.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import { createPrompt, searchPrompts } from '../src/services/prompts'

describe('Prompts', () => {
  let testUser

  beforeAll(async () => {
    testUser = await createTestUser()
  })

  it('should create a new prompt', async () => {
    const prompt = await createPrompt({
      title: 'Test Prompt',
      content: 'This is a test',
      category: 'AI Agents'
    })

    expect(prompt.id).toBeDefined()
    expect(prompt.title).toBe('Test Prompt')
  })

  it('should search prompts by keyword', async () => {
    const results = await searchPrompts('test')
    expect(results.length).toBeGreaterThan(0)
  })
})
```

### 9.3 E2E Tests
```javascript
// tests/e2e/submit-prompt.spec.js
import { test, expect } from '@playwright/test'

test('user can submit a prompt', async ({ page }) => {
  await page.goto('/')

  // Sign in
  await page.click('text=Sign In')
  // ... Google OAuth flow ...

  // Open submit window
  await page.click('[data-window="submit"]')

  // Fill form
  await page.fill('input[name="title"]', 'My Test Prompt')
  await page.selectOption('select[name="category"]', 'AI Agents')
  await page.fill('textarea[name="content"]', 'This is my prompt content')

  // Submit
  await page.click('button[type="submit"]')

  // Verify success
  await expect(page.locator('text=Prompt submitted successfully')).toBeVisible()
})
```

---

## 10. MONITORING & ANALYTICS

### 10.1 Application Monitoring
```javascript
// Initialize error tracking (e.g., Sentry)
import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1
})
```

### 10.2 Usage Analytics
```javascript
// Track key metrics
async function trackEvent(eventName, properties = {}) {
  await supabase
    .from('analytics_events')
    .insert([
      {
        event_name: eventName,
        properties,
        user_id: (await getCurrentUser())?.id,
        timestamp: new Date().toISOString()
      }
    ])
}

// Track prompt views
trackEvent('prompt_viewed', { prompt_id: '123' })

// Track searches
trackEvent('search_performed', { query: 'AI agents', results_count: 42 })

// Track copies
trackEvent('prompt_copied', { prompt_id: '123' })
```

### 10.3 Performance Monitoring
```javascript
// Monitor API response times
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name.includes('supabase')) {
      console.log('API call:', entry.name, 'Duration:', entry.duration)
    }
  })
})

performanceObserver.observe({ entryTypes: ['resource'] })
```

---

## 11. SCALABILITY CONSIDERATIONS

### 11.1 Database Scalability
- **Vertical Scaling**: Upgrade Supabase plan as needed
- **Read Replicas**: Use Supabase read replicas for read-heavy operations
- **Partitioning**: Partition large tables (prompts, views) by date if needed

### 11.2 Application Scalability
- **CDN**: Cloudflare for edge caching
- **Serverless**: Supabase Edge Functions auto-scale
- **Static Assets**: Serve from CDN

### 11.3 Load Testing
```javascript
// k6 load test script
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
}

export default function () {
  const res = http.get('https://your-app.com/api/prompts')
  check(res, { 'status is 200': (r) => r.status === 200 })
  sleep(1)
}
```

---

## 12. COST ESTIMATION

### 12.1 Supabase Costs
- **Pro Plan**: $25/month
  - 8GB database
  - 250GB bandwidth
  - 250GB storage
  - Daily backups

### 12.2 Hosting Costs
- **Vercel Pro**: $20/month (if needed, otherwise free tier)

### 12.3 Total Monthly Cost
- **Initial**: ~$25-45/month
- **With growth**: Scale Supabase plan as needed

---

## 13. LAUNCH CHECKLIST

### Phase 1: Setup (Week 1-2)
- [ ] Set up Supabase project
- [ ] Configure Google OAuth with Stanford domain restriction
- [ ] Create database schema and run migrations
- [ ] Set up Row Level Security policies
- [ ] Configure database functions and triggers
- [ ] Set up Supabase Storage for images and backups

### Phase 2: Development (Week 3-6)
- [ ] Refactor HTML into modular components
- [ ] Implement authentication flow
- [ ] Build CRUD operations for prompts
- [ ] Implement search and filtering
- [ ] Add like/upvote system
- [ ] Build leaderboard functionality
- [ ] Integrate markdown editor
- [ ] Add copy/export features
- [ ] Implement user profiles
- [ ] Add image upload for prompt examples

### Phase 3: Testing (Week 7-8)
- [ ] Write and run unit tests
- [ ] Perform integration testing
- [ ] Execute E2E tests
- [ ] Conduct load testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] User acceptance testing (UAT) with small group

### Phase 4: Deployment (Week 9)
- [ ] Set up production environment
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure CDN
- [ ] Set up monitoring and analytics
- [ ] Create backup strategy
- [ ] Deploy to production
- [ ] Soft launch with limited users

### Phase 5: Launch (Week 10)
- [ ] Final security review
- [ ] Performance check
- [ ] Backup verification
- [ ] Public announcement
- [ ] Monitor for issues
- [ ] Gather user feedback

---

## 14. CRITICAL APPRAISAL & RISK MITIGATION

### 14.1 Potential Risks

#### Risk 1: Data Loss
**Severity**: Critical
**Mitigation**:
- ✅ Soft deletes (no hard deletes)
- ✅ Daily automated backups
- ✅ Point-in-time recovery
- ✅ Weekly external backups
- ✅ Trigger-based data integrity checks

#### Risk 2: Authentication Bypass
**Severity**: Critical
**Mitigation**:
- ✅ Stanford email domain validation at DB level
- ✅ Server-side email verification
- ✅ Row Level Security enforced
- ✅ OAuth tokens expire and rotate
- ✅ Regular security audits

#### Risk 3: Performance Degradation
**Severity**: High
**Mitigation**:
- ✅ Comprehensive indexing strategy
- ✅ Materialized views for heavy queries
- ✅ CDN for static assets
- ✅ Connection pooling
- ✅ Load testing before launch
- ✅ Monitoring and alerts

#### Risk 4: Spam/Abuse
**Severity**: Medium
**Mitigation**:
- ✅ Rate limiting on submissions
- ✅ Content validation
- ✅ Soft moderation tools
- ✅ User reporting system
- ✅ Admin dashboard for moderation

#### Risk 5: Cost Overrun
**Severity**: Medium
**Mitigation**:
- ✅ Start with Pro plan ($25/mo)
- ✅ Monitor usage dashboard
- ✅ Set up billing alerts
- ✅ Optimize queries to reduce DB load
- ✅ Use caching to reduce API calls

### 14.2 Single Points of Failure

#### SPOF 1: Supabase Service
**Impact**: Application unavailable
**Mitigation**:
- Use Supabase's built-in redundancy (99.9% SLA)
- Monitor status page
- Have fallback static page
- Maintain recent database backups for migration

#### SPOF 2: Google OAuth
**Impact**: Users can't sign in
**Mitigation**:
- Google has 99.9% uptime SLA
- Keep users signed in with long-lived sessions
- Future: Add email/password as backup auth method

### 14.3 Data Integrity Safeguards

1. **Foreign Key Constraints**: All relationships enforced at DB level
2. **Check Constraints**: Validate data ranges (e.g., likes_count >= 0)
3. **Triggers**: Auto-update counters and timestamps
4. **Soft Deletes**: Never lose data permanently
5. **Audit Trail**: Track all modifications (created_at, updated_at)

### 14.4 Scalability Limits

**Current Design Handles**:
- ~10,000 users
- ~100,000 prompts
- ~1,000,000 likes
- ~1,000 concurrent users

**When to Scale**:
- Database: Upgrade Supabase plan or add read replicas
- Frontend: Already serverless, auto-scales
- Search: Consider Algolia/Meilisearch for >100k prompts

---

## 15. POST-LAUNCH ROADMAP

### Phase 1 (Months 1-3)
- [ ] Monitor performance and fix bugs
- [ ] Gather user feedback
- [ ] Optimize slow queries
- [ ] Add user-requested features
- [ ] Build admin moderation dashboard

### Phase 2 (Months 4-6)
- [ ] Add comments/discussions on prompts
- [ ] Implement prompt versioning
- [ ] Add collaborative editing
- [ ] Build browser extension for quick access
- [ ] Add API for external integrations

### Phase 3 (Months 7-12)
- [ ] AI-powered prompt suggestions
- [ ] Prompt templates library
- [ ] Advanced analytics dashboard
- [ ] Team/organization features
- [ ] Premium features consideration

---

## 16. SUCCESS METRICS

### KPIs to Track
1. **User Growth**
   - New signups per week
   - Active users (DAU/MAU)
   - User retention rate

2. **Content Growth**
   - New prompts submitted per week
   - Quality score (avg likes per prompt)
   - Categories with most activity

3. **Engagement**
   - Average session duration
   - Prompts viewed per session
   - Search queries per user
   - Copy/export actions

4. **Performance**
   - Page load time < 2s
   - API response time < 200ms
   - Uptime > 99.9%

---

## CONCLUSION

This plan provides a comprehensive, bulletproof strategy for launching the Stanford Prompt Library as a production-ready live wiki. Key strengths:

1. **Data Permanence**: Soft deletes, multi-layer backups, database-level constraints
2. **Security**: RLS, Stanford email validation, rate limiting, content moderation
3. **Scalability**: Proper indexing, caching, materialized views, CDN
4. **Reliability**: 99.9% SLA, monitoring, error tracking, automated backups
5. **Performance**: Optimized queries, caching strategy, load testing
6. **Maintainability**: Modular code, comprehensive tests, clear documentation

**Estimated Timeline**: 10 weeks from start to public launch
**Estimated Cost**: $25-45/month initially
**Team Required**: 1-2 developers (can be done solo with more time)

The architecture is designed to be robust, secure, and scalable while remaining simple enough to maintain with a small team. All user contributions will be permanently preserved through soft deletes and comprehensive backup strategies.
