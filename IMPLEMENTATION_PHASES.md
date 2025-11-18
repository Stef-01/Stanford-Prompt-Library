# Stanford Prompt Library - Implementation Phases

**Status**: Ready for Implementation
**Last Updated**: 2025-11-18
**Deployment Target**: Vercel + Supabase

This document outlines the complete step-by-step implementation plan with checkmarks for tracking progress.

---

## Table of Contents

1. [Phase 0: Project Setup](#phase-0-project-setup)
2. [Phase 1: Multi-Domain Authentication](#phase-1-multi-domain-authentication)
3. [Phase 2: Database Schema & Security](#phase-2-database-schema--security)
4. [Phase 3: Gated Access System](#phase-3-gated-access-system)
5. [Phase 4: Admin Approval Interface](#phase-4-admin-approval-interface)
6. [Phase 5: Automated Evaluation Pipeline](#phase-5-automated-evaluation-pipeline)
7. [Phase 6: Frontend Implementation](#phase-6-frontend-implementation)
8. [Phase 7: Vercel Deployment & Infrastructure](#phase-7-vercel-deployment--infrastructure)
9. [Phase 8: Observability & Monitoring](#phase-8-observability--monitoring)
10. [Phase 9: Testing & Quality Assurance](#phase-9-testing--quality-assurance)
11. [Phase 10: Launch & Post-Launch](#phase-10-launch--post-launch)

---

## Phase 0: Project Setup

**Timeline**: Week 1 (Days 1-3)
**Goal**: Initialize project structure and development environment

### 0.1 Repository & Environment Setup
- [ ] Initialize Git repository structure
- [ ] Create `.cline/` directory for task logging
- [ ] Set up `.env.example` template
- [ ] Create `.gitignore` for sensitive files
- [ ] Initialize npm project with Vite
- [ ] Install core dependencies

```bash
# Commands
npm create vite@latest stanford-prompt-library -- --template vanilla
cd stanford-prompt-library
npm install @supabase/supabase-js
npm install simplemde dompurify marked
npm install -D vitest @vitest/ui
```

### 0.2 Project Structure
- [ ] Create directory structure:

```
/stanford-prompt-library
├── .cline/                    # Task logging
│   └── task-log.md
├── src/
│   ├── components/            # UI components
│   │   ├── admin/            # Admin-specific components
│   │   ├── auth/             # Authentication components
│   │   ├── prompts/          # Prompt components
│   │   └── shared/           # Shared/common components
│   ├── services/             # Business logic
│   │   ├── auth.js           # Authentication service
│   │   ├── prompts.js        # Prompts CRUD
│   │   ├── evaluation/       # Evaluation pipeline
│   │   │   ├── schema-check.js
│   │   │   ├── safety-scan.js
│   │   │   ├── dedup-check.js
│   │   │   └── replicability-test.js
│   │   ├── admin.js          # Admin functions
│   │   └── supabase.js       # Supabase client
│   ├── utils/                # Utility functions
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── cache.js
│   ├── config/               # Configuration
│   │   ├── constants.js
│   │   └── env.js
│   ├── styles/               # CSS/styling
│   │   ├── main.css
│   │   └── components.css
│   └── app.js                # Main application entry
├── api/                       # Vercel serverless functions
│   ├── auth/
│   │   └── verify-token.js
│   ├── evaluation/
│   │   ├── evaluate-prompt.js
│   │   └── dedup-check.js
│   └── admin/
│       ├── approve-prompt.js
│       └── reject-prompt.js
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                      # Documentation
│   ├── DEPLOYMENT_PLAN.md
│   ├── CRITICAL_APPRAISAL.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── EXECUTIVE_SUMMARY.md
├── public/                    # Static assets
├── .env.example
├── .gitignore
├── vercel.json                # Vercel configuration
├── package.json
└── README.md
```

### 0.3 Documentation Setup
- [ ] Copy existing documentation to `docs/` folder
- [ ] Create API documentation template
- [ ] Set up task logging format in `.cline/task-log.md`

**Completion Criteria**: Project structure is set up, dependencies installed, documentation organized.

---

## Phase 1: Multi-Domain Authentication

**Timeline**: Week 1 (Days 4-7) + Week 2 (Days 1-2)
**Goal**: Implement Stanford multi-domain email authentication with server-side verification

### 1.1 Define Stanford Email Domains
- [ ] Create whitelist configuration

```javascript
// src/config/constants.js
export const STANFORD_EMAIL_DOMAINS = [
  'stanford.edu',
  'alumni.stanford.edu',
  'cs.stanford.edu',
  'gse.stanford.edu',
  'gsb.stanford.edu',
  'law.stanford.edu',
  'med.stanford.edu',
  'earth.stanford.edu',
  'physics.stanford.edu',
  'biology.stanford.edu',
  'math.stanford.edu',
  'ee.stanford.edu',
  // Add more as needed
]

export const STANFORD_DOMAIN_REGEX = /@([\w-]+\.)?stanford\.edu$/i
```

### 1.2 Google OAuth Configuration
- [ ] Create Google Cloud Project
- [ ] Set up OAuth 2.0 credentials
- [ ] Configure authorized redirect URIs
- [ ] Add domain restrictions

**Google Cloud Console Steps**:
```
1. Go to https://console.cloud.google.com
2. Create new project: "Stanford Prompt Library"
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized JavaScript origins:
   - http://localhost:5173 (development)
   - https://prompts.stanford.edu (production)
6. Add authorized redirect URIs:
   - https://YOUR_PROJECT.supabase.co/auth/v1/callback
7. Save Client ID and Client Secret
```

### 1.3 Supabase Auth Configuration
- [ ] Create Supabase project
- [ ] Enable Google OAuth provider
- [ ] Configure provider settings

**Supabase Dashboard Steps**:
```
1. Go to Authentication > Providers
2. Enable Google
3. Add Client ID and Client Secret
4. Configure additional settings:
   {
     "hd": "*",  // Don't restrict here, we'll verify server-side
     "prompt": "select_account"
   }
```

### 1.4 Server-Side ID Token Verification
- [ ] Create Vercel API endpoint for token verification
- [ ] Implement hd claim validation
- [ ] Validate email domain against whitelist

```javascript
// api/auth/verify-token.js
import { createClient } from '@supabase/supabase-js'
import { OAuth2Client } from 'google-auth-library'

const STANFORD_EMAIL_DOMAINS = [
  'stanford.edu',
  'alumni.stanford.edu',
  // ... rest of domains
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id_token } = req.body

    // Verify Google ID token
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, hd, email_verified } = payload

    // Validation checks
    if (!email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      })
    }

    // Extract domain from email
    const emailDomain = email.split('@')[1]

    // Check if domain is in whitelist
    const isStanfordEmail = STANFORD_EMAIL_DOMAINS.some(domain => {
      return emailDomain === domain || emailDomain.endsWith('.' + domain)
    })

    if (!isStanfordEmail) {
      return res.status(403).json({
        error: 'Only Stanford email addresses are allowed',
        code: 'INVALID_DOMAIN',
        domain: emailDomain
      })
    }

    // Verify hd claim matches email domain (if hd is present)
    if (hd && hd !== emailDomain) {
      return res.status(403).json({
        error: 'Email domain mismatch',
        code: 'DOMAIN_MISMATCH'
      })
    }

    // Success - token is valid
    return res.status(200).json({
      valid: true,
      email,
      domain: emailDomain,
      hd: hd || null
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    })
  }
}
```

### 1.5 Client-Side Auth Flow
- [ ] Implement Google Sign-In button
- [ ] Handle OAuth callback
- [ ] Call server-side verification endpoint
- [ ] Store session securely

```javascript
// src/services/auth.js
import { supabase } from './supabase'

export async function signInWithGoogle() {
  try {
    // Step 1: Initiate Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
          // Don't use hd parameter - we verify server-side
        }
      }
    })

    if (error) throw error
    return data

  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function verifyStanfordEmail(idToken) {
  try {
    // Step 2: Verify token server-side
    const response = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    const result = await response.json()
    return result

  } catch (error) {
    console.error('Email verification error:', error)
    throw error
  }
}

export async function handleAuthCallback() {
  try {
    // Get session from URL hash
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) throw error
    if (!session) throw new Error('No session found')

    // Extract ID token
    const idToken = session.provider_token

    // Verify Stanford email server-side
    const verification = await verifyStanfordEmail(idToken)

    if (!verification.valid) {
      // Sign out invalid user
      await supabase.auth.signOut()
      throw new Error('Invalid Stanford email')
    }

    // Create or update user profile
    await createUserProfile(session.user, verification)

    return { user: session.user, verification }

  } catch (error) {
    console.error('Auth callback error:', error)
    throw error
  }
}

async function createUserProfile(user, verification) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: verification.email,
      email_domain: verification.domain,
      display_name: user.user_metadata.full_name || verification.email.split('@')[0],
      avatar_url: user.user_metadata.avatar_url,
      is_stanford_verified: true,
      verified_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error && error.code !== '23505') {
    throw error
  }

  return data
}
```

### 1.6 Database Triggers for Email Validation
- [ ] Create trigger to validate email on insert/update
- [ ] Add check constraint for email domain

```sql
-- Database migration
CREATE OR REPLACE FUNCTION validate_stanford_email()
RETURNS TRIGGER AS $$
DECLARE
  valid_domains TEXT[] := ARRAY[
    'stanford.edu',
    'alumni.stanford.edu',
    'cs.stanford.edu',
    'gse.stanford.edu',
    'gsb.stanford.edu',
    'law.stanford.edu',
    'med.stanford.edu',
    'earth.stanford.edu'
  ];
  email_domain TEXT;
  is_valid BOOLEAN := FALSE;
BEGIN
  -- Extract domain from email
  email_domain := substring(NEW.email from '@(.*)$');

  -- Check if domain is in valid list or is a subdomain of stanford.edu
  IF email_domain = ANY(valid_domains) OR email_domain LIKE '%.stanford.edu' THEN
    is_valid := TRUE;
  END IF;

  IF NOT is_valid THEN
    RAISE EXCEPTION 'Email domain % is not a valid Stanford domain', email_domain;
  END IF;

  -- Set verification flags
  NEW.is_stanford_verified := TRUE;
  NEW.email_domain := email_domain;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stanford_email_on_insert
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_stanford_email();

CREATE TRIGGER check_stanford_email_on_update
  BEFORE UPDATE OF email ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_stanford_email();
```

### 1.7 Testing Authentication
- [ ] Test with valid Stanford email
- [ ] Test with invalid domain
- [ ] Test with non-verified email
- [ ] Test token verification endpoint
- [ ] Test database triggers

**Completion Criteria**:
- Users can sign in with Google OAuth
- Server-side verification blocks non-Stanford emails
- Multiple Stanford subdomains are supported
- Database enforces email domain constraints

---

## Phase 2: Database Schema & Security

**Timeline**: Week 2 (Days 3-7)
**Goal**: Create database schema with gated access support and evaluation pipeline tables

### 2.1 Core Tables

#### 2.1.1 Users Table (Enhanced)
- [ ] Create users table with gated access fields

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  email_domain TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,

  -- Stanford verification
  is_stanford_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Gated access fields
  has_submitted_prompt BOOLEAN DEFAULT FALSE,
  is_approved_member BOOLEAN DEFAULT FALSE,
  member_since TIMESTAMPTZ,
  initial_prompt_id UUID,  -- Reference to their first submitted prompt

  -- Admin fields
  is_admin BOOLEAN DEFAULT FALSE,
  can_approve_prompts BOOLEAN DEFAULT FALSE,

  -- Stats
  total_prompts INTEGER DEFAULT 0,
  approved_prompts INTEGER DEFAULT 0,
  rejected_prompts INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  reputation_score DECIMAL(10,2) DEFAULT 0.0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_domain ON users(email_domain);
CREATE INDEX idx_users_is_approved_member ON users(is_approved_member);
CREATE INDEX idx_users_has_submitted_prompt ON users(has_submitted_prompt);
CREATE INDEX idx_users_is_admin ON users(is_admin);
```

#### 2.1.2 Prompts Table (Enhanced with Evaluation)
- [ ] Create prompts table with evaluation and approval fields

```sql
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',

  -- Required sections for evaluation
  prompt_text TEXT NOT NULL,  -- The actual prompt to be used
  example_input TEXT,          -- Example input for the prompt
  example_output TEXT,         -- Expected output example
  instructions TEXT,           -- How to use the prompt

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, evaluating, approved, rejected
  is_initial_prompt BOOLEAN DEFAULT FALSE,  -- First prompt for gated access
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  evaluated_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,

  -- Evaluation results
  evaluation_results JSONB DEFAULT '{}',
  evaluation_score DECIMAL(5,2),
  passed_schema_check BOOLEAN DEFAULT FALSE,
  passed_safety_scan BOOLEAN DEFAULT FALSE,
  passed_dedup_check BOOLEAN DEFAULT FALSE,
  passed_replicability_test BOOLEAN DEFAULT FALSE,

  -- Social metrics
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  copies_count INTEGER DEFAULT 0,

  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,  -- Only true after approval
  is_featured BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Image
  example_image_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(array_to_string(tags, ' '), '')
    )
  ) STORED,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'evaluating', 'approved', 'rejected')),
  CONSTRAINT valid_category CHECK (category IN (
    'AI Agents', 'Creative Writing', 'Data Analysis',
    'Image Generation', 'Business', 'Research',
    'Gaming', 'Website Coding'
  ))
);

-- Indexes
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_is_initial_prompt ON prompts(is_initial_prompt);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_likes ON prompts(likes_count DESC);
CREATE INDEX idx_prompts_search ON prompts USING GIN(search_vector);
CREATE INDEX idx_prompts_public ON prompts(is_public, is_deleted, status)
  WHERE is_public = TRUE AND is_deleted = FALSE AND status = 'approved';
```

#### 2.1.3 Evaluation Logs Table
- [ ] Create table to track evaluation pipeline runs

```sql
CREATE TABLE public.evaluation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Evaluation details
  evaluation_type TEXT NOT NULL,  -- schema, safety, dedup, replicability
  passed BOOLEAN NOT NULL,
  score DECIMAL(5,2),
  details JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Metadata
  evaluator_version TEXT,
  model_used TEXT,  -- For replicability tests

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evaluation_logs_prompt_id ON evaluation_logs(prompt_id);
CREATE INDEX idx_evaluation_logs_type ON evaluation_logs(evaluation_type);
CREATE INDEX idx_evaluation_logs_passed ON evaluation_logs(passed);
CREATE INDEX idx_evaluation_logs_created_at ON evaluation_logs(created_at DESC);
```

#### 2.1.4 Admin Actions Table
- [ ] Create table to track admin approvals/rejections

```sql
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,

  -- Action details
  action TEXT NOT NULL,  -- approve, reject, feature, unfeature
  notes TEXT,
  previous_status TEXT,
  new_status TEXT,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_action CHECK (action IN ('approve', 'reject', 'feature', 'unfeature', 'delete'))
);

-- Indexes
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_prompt_id ON admin_actions(prompt_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);
```

#### 2.1.5 Deduplication Table
- [ ] Create table to store prompt embeddings for similarity checking

```sql
-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.prompt_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE UNIQUE,

  -- Embedding vector (1536 dimensions for OpenAI text-embedding-ada-002)
  embedding vector(1536),

  -- Metadata for regeneration
  model_used TEXT NOT NULL,
  embedding_version TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX idx_prompt_embeddings_vector ON prompt_embeddings
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_prompt_embeddings_prompt_id ON prompt_embeddings(prompt_id);
```

### 2.2 Row Level Security (RLS) Policies
- [ ] Enable RLS on all tables
- [ ] Create policies for gated access

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_embeddings ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Anyone can view public profile info
CREATE POLICY "Users can view public profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- PROMPTS POLICIES
-- Only approved members can view approved prompts
CREATE POLICY "Approved members can view approved prompts"
  ON prompts FOR SELECT
  USING (
    is_public = TRUE
    AND is_deleted = FALSE
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

-- Any authenticated Stanford user can submit prompts
CREATE POLICY "Stanford users can submit prompts"
  ON prompts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_stanford_verified = TRUE
    )
  );

-- Users can update own prompts (only if pending)
CREATE POLICY "Users can update own pending prompts"
  ON prompts FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  );

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

-- Admins can update prompts (for approval/rejection)
CREATE POLICY "Admins can update prompts"
  ON prompts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.can_approve_prompts = TRUE
    )
  );

-- EVALUATION LOGS POLICIES
-- Users can view logs for their own prompts
CREATE POLICY "Users can view own prompt evaluation logs"
  ON evaluation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = evaluation_logs.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all evaluation logs"
  ON evaluation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- ADMIN ACTIONS POLICIES
-- Admins can view all admin actions
CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admins can create admin actions
CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.can_approve_prompts = TRUE
    )
  );
```

### 2.3 Database Functions
- [ ] Create function to approve user after prompt approval
- [ ] Create function to check duplicate prompts

```sql
-- Function: Grant member access after prompt approval
CREATE OR REPLACE FUNCTION grant_member_access_after_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an initial prompt and it's being approved
  IF NEW.is_initial_prompt = TRUE AND NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE users
    SET
      is_approved_member = TRUE,
      member_since = NOW(),
      initial_prompt_id = NEW.id
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_prompt_approved
  AFTER UPDATE OF status ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION grant_member_access_after_approval();

-- Function: Update user prompt submission status
CREATE OR REPLACE FUNCTION mark_user_has_submitted_prompt()
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
  EXECUTE FUNCTION mark_user_has_submitted_prompt();

-- Function: Check for similar prompts (for deduplication)
CREATE OR REPLACE FUNCTION find_similar_prompts(
  p_embedding vector(1536),
  p_threshold FLOAT DEFAULT 0.85,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  prompt_id UUID,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.prompt_id,
    1 - (pe.embedding <=> p_embedding) AS similarity
  FROM prompt_embeddings pe
  INNER JOIN prompts p ON p.id = pe.prompt_id
  WHERE
    p.is_deleted = FALSE
    AND (1 - (pe.embedding <=> p_embedding)) > p_threshold
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

### 2.4 Seed Data
- [ ] Create initial admin user
- [ ] Seed categories
- [ ] Create test data for development

```sql
-- Create admin user (update with actual admin email)
INSERT INTO users (
  id,
  email,
  email_domain,
  display_name,
  is_stanford_verified,
  is_admin,
  can_approve_prompts,
  is_approved_member
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Replace with actual UUID
  'admin@stanford.edu',
  'stanford.edu',
  'Admin User',
  TRUE,
  TRUE,
  TRUE,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  is_admin = TRUE,
  can_approve_prompts = TRUE;

-- Seed categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('AI Agents', 'ai-agents', 'Build autonomous AI agents with advanced reasoning', '🤖', '#3b82f6'),
  ('Creative Writing', 'creative-writing', 'Storytelling, poetry, and narrative generation', '✍️', '#22c55e'),
  ('Data Analysis', 'data-analysis', 'Statistical analysis and data interpretation', '📊', '#a855f7'),
  ('Image Generation', 'image-generation', 'Midjourney, DALL-E, and Stable Diffusion prompts', '🎨', '#f97316'),
  ('Business', 'business', 'Marketing, strategy, and professional communication', '💼', '#ec4899'),
  ('Research', 'research', 'Academic writing and research methodologies', '🔬', '#06b6d4'),
  ('Gaming', 'gaming', 'Game design, narratives, and interactive experiences', '🎮', '#eab308'),
  ('Website Coding', 'website-coding', 'Web development and coding prompts', '💻', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;
```

**Completion Criteria**:
- All database tables created with proper indexes
- RLS policies enforce gated access
- Triggers handle member approval workflow
- Seed data is loaded

---

## Phase 3: Gated Access System

**Timeline**: Week 3 (Days 1-5)
**Goal**: Implement the gated access flow where users must submit a prompt to view others

### 3.1 Access Check Middleware
- [ ] Create function to check if user has access to view prompts

```javascript
// src/services/access-control.js
import { supabase } from './supabase'

export async function checkUserAccess() {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        hasAccess: false,
        reason: 'NOT_AUTHENTICATED',
        message: 'Please sign in to continue'
      }
    }

    // Get user details
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_stanford_verified, is_approved_member, has_submitted_prompt')
      .eq('id', user.id)
      .single()

    if (error) throw error

    // Check Stanford verification
    if (!userData.is_stanford_verified) {
      return {
        hasAccess: false,
        reason: 'NOT_VERIFIED',
        message: 'Your Stanford email needs to be verified'
      }
    }

    // Check if user has submitted a prompt
    if (!userData.has_submitted_prompt) {
      return {
        hasAccess: false,
        reason: 'NO_PROMPT_SUBMITTED',
        message: 'Submit your first prompt to unlock access to the library',
        needsAction: 'SUBMIT_PROMPT'
      }
    }

    // Check if user is approved member
    if (!userData.is_approved_member) {
      return {
        hasAccess: false,
        reason: 'PENDING_APPROVAL',
        message: 'Your prompt is under review. You\'ll get access once it\'s approved!',
        needsAction: 'WAIT_FOR_APPROVAL'
      }
    }

    // User has full access
    return {
      hasAccess: true,
      userData
    }

  } catch (error) {
    console.error('Access check error:', error)
    return {
      hasAccess: false,
      reason: 'ERROR',
      message: 'Unable to verify access. Please try again.'
    }
  }
}

export async function getUserStatus() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      prompts!user_id (
        id,
        status,
        is_initial_prompt,
        submitted_at
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) throw error

  // Find initial prompt
  const initialPrompt = data.prompts?.find(p => p.is_initial_prompt)

  return {
    ...data,
    initialPrompt,
    totalPrompts: data.prompts?.length || 0
  }
}
```

### 3.2 Access Gate UI Component
- [ ] Create UI component for access gate

```javascript
// src/components/access/AccessGate.js
export class AccessGate {
  constructor() {
    this.container = null
  }

  async render() {
    const accessStatus = await checkUserAccess()

    if (accessStatus.hasAccess) {
      // User has access, show main app
      return this.renderMainApp()
    }

    // Show appropriate gate based on reason
    switch (accessStatus.reason) {
      case 'NOT_AUTHENTICATED':
        return this.renderSignInGate()

      case 'NO_PROMPT_SUBMITTED':
        return this.renderSubmitPromptGate()

      case 'PENDING_APPROVAL':
        return this.renderPendingApprovalGate()

      default:
        return this.renderErrorGate(accessStatus.message)
    }
  }

  renderSignInGate() {
    return `
      <div class="access-gate">
        <div class="gate-content">
          <h1>Welcome to Stanford Prompt Library</h1>
          <p>A collaborative platform for Stanford students to share and discover AI prompts</p>
          <button onclick="signInWithGoogle()" class="btn-primary">
            Sign in with Stanford Email
          </button>
        </div>
      </div>
    `
  }

  renderSubmitPromptGate() {
    return `
      <div class="access-gate">
        <div class="gate-content">
          <div class="gate-icon">🔒</div>
          <h1>Submit Your First Prompt to Unlock Access</h1>
          <p>To maintain quality and encourage contributions, we ask all members to share at least one prompt before accessing the library.</p>

          <div class="gate-benefits">
            <h3>What you'll get access to:</h3>
            <ul>
              <li>✨ Browse 500+ curated AI prompts</li>
              <li>🔍 Advanced search and filtering</li>
              <li>⭐ Upvote and favorite prompts</li>
              <li>🏆 Leaderboards and competitions</li>
              <li>📚 Learn from the community</li>
            </ul>
          </div>

          <button onclick="openSubmitPromptForm()" class="btn-primary btn-large">
            Submit Your First Prompt
          </button>

          <p class="gate-note">
            Your prompt will be quickly reviewed to ensure quality. Most submissions are approved within 24 hours.
          </p>
        </div>
      </div>
    `
  }

  renderPendingApprovalGate() {
    return `
      <div class="access-gate">
        <div class="gate-content">
          <div class="gate-icon">⏳</div>
          <h1>Your Prompt is Under Review</h1>
          <p>Thank you for submitting your prompt! Our team is reviewing it now.</p>

          <div class="review-status">
            <div class="status-item completed">
              <span class="status-icon">✓</span>
              <span>Prompt submitted</span>
            </div>
            <div class="status-item active">
              <span class="status-icon">⏳</span>
              <span>Under review</span>
            </div>
            <div class="status-item">
              <span class="status-icon">○</span>
              <span>Access granted</span>
            </div>
          </div>

          <div class="review-info">
            <h3>What happens next?</h3>
            <ol>
              <li>Your prompt goes through automated quality checks</li>
              <li>Our team reviews it for content and clarity</li>
              <li>You'll receive an email when approved (usually within 24 hours)</li>
              <li>Once approved, you'll have full access to the library!</li>
            </ol>
          </div>

          <button onclick="viewMyPromptStatus()" class="btn-secondary">
            View My Submission
          </button>

          <button onclick="signOut()" class="btn-text">
            Sign Out
          </button>
        </div>
      </div>
    `
  }

  renderErrorGate(message) {
    return `
      <div class="access-gate">
        <div class="gate-content error">
          <div class="gate-icon">⚠️</div>
          <h1>Access Error</h1>
          <p>${message}</p>
          <button onclick="location.reload()" class="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    `
  }

  renderMainApp() {
    // Load main application
    return null // Main app will render itself
  }
}
```

### 3.3 Initial Prompt Submission Flow
- [ ] Create special submission form for initial prompt
- [ ] Mark prompt as initial prompt
- [ ] Show submission confirmation

```javascript
// src/components/prompts/InitialPromptForm.js
export async function submitInitialPrompt(promptData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user already submitted
    const { data: userData } = await supabase
      .from('users')
      .select('has_submitted_prompt')
      .eq('id', user.id)
      .single()

    if (userData.has_submitted_prompt) {
      throw new Error('You have already submitted your initial prompt')
    }

    // Submit prompt marked as initial
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert([{
        user_id: user.id,
        title: promptData.title,
        content: promptData.content,
        markdown_content: promptData.content,
        description: promptData.description,
        category: promptData.category,
        tags: promptData.tags,
        prompt_text: promptData.promptText,
        example_input: promptData.exampleInput,
        example_output: promptData.exampleOutput,
        instructions: promptData.instructions,
        is_initial_prompt: true,  // Mark as initial prompt
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error

    // Trigger evaluation pipeline
    await triggerEvaluation(prompt.id)

    return {
      success: true,
      promptId: prompt.id,
      message: 'Your prompt has been submitted and is now under review!'
    }

  } catch (error) {
    console.error('Initial prompt submission error:', error)
    throw error
  }
}

async function triggerEvaluation(promptId) {
  try {
    const response = await fetch('/api/evaluation/evaluate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id: promptId })
    })

    if (!response.ok) {
      console.error('Failed to trigger evaluation')
    }
  } catch (error) {
    console.error('Evaluation trigger error:', error)
  }
}
```

### 3.4 Status Checking and Notifications
- [ ] Create function to check prompt status
- [ ] Set up real-time subscription for status changes
- [ ] Show notification when approved

```javascript
// src/services/notifications.js
export function subscribeToPromptStatus(promptId, callback) {
  const subscription = supabase
    .channel(`prompt:${promptId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'prompts',
        filter: `id=eq.${promptId}`
      },
      (payload) => {
        const prompt = payload.new
        callback(prompt)

        // Show notification if approved
        if (prompt.status === 'approved' && prompt.is_initial_prompt) {
          showApprovalNotification()
        }
      }
    )
    .subscribe()

  return subscription
}

function showApprovalNotification() {
  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Prompt Approved! 🎉', {
      body: 'Your prompt has been approved. You now have full access to the library!',
      icon: '/logo.png'
    })
  }

  // Show in-app notification
  showToast({
    title: 'Congratulations!',
    message: 'Your prompt has been approved. Welcome to the community!',
    type: 'success',
    duration: 5000
  })

  // Reload to show main app
  setTimeout(() => {
    window.location.reload()
  }, 2000)
}
```

**Completion Criteria**:
- Non-authenticated users see sign-in gate
- Authenticated users without submitted prompt see submission gate
- Users with pending prompt see waiting gate
- Approved users have full access to library
- Real-time status updates work

---

## Phase 4: Admin Approval Interface

**Timeline**: Week 3 (Days 6-7) + Week 4 (Days 1-3)
**Goal**: Create admin dashboard for quickly reviewing and approving/rejecting prompts

### 4.1 Admin Dashboard Layout
- [ ] Create admin-only route
- [ ] Design dashboard with pending prompts queue
- [ ] Add filters (pending, approved, rejected, all)

```javascript
// src/components/admin/AdminDashboard.js
export class AdminDashboard {
  constructor() {
    this.currentFilter = 'pending'
    this.prompts = []
  }

  async init() {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/'
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin, can_approve_prompts')
      .eq('id', user.id)
      .single()

    if (!userData?.is_admin) {
      window.location.href = '/'
      return
    }

    await this.loadPrompts()
    this.render()
    this.setupRealtimeSubscription()
  }

  async loadPrompts() {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        users!inner(display_name, email, avatar_url),
        evaluation_logs(*)
      `)
      .order('submitted_at', { ascending: false })

    if (this.currentFilter !== 'all') {
      query = query.eq('status', this.currentFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading prompts:', error)
      return
    }

    this.prompts = data
  }

  render() {
    const container = document.getElementById('admin-dashboard')

    container.innerHTML = `
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <div class="admin-stats">
          <div class="stat-card">
            <span class="stat-value">${this.getCountByStatus('pending')}</span>
            <span class="stat-label">Pending Review</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${this.getCountByStatus('evaluating')}</span>
            <span class="stat-label">In Evaluation</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${this.getTodayApprovalCount()}</span>
            <span class="stat-label">Approved Today</span>
          </div>
        </div>
      </div>

      <div class="admin-filters">
        <button class="filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}"
                onclick="adminDashboard.setFilter('pending')">
          Pending (${this.getCountByStatus('pending')})
        </button>
        <button class="filter-btn ${this.currentFilter === 'evaluating' ? 'active' : ''}"
                onclick="adminDashboard.setFilter('evaluating')">
          Evaluating (${this.getCountByStatus('evaluating')})
        </button>
        <button class="filter-btn ${this.currentFilter === 'approved' ? 'active' : ''}"
                onclick="adminDashboard.setFilter('approved')">
          Approved (${this.getCountByStatus('approved')})
        </button>
        <button class="filter-btn ${this.currentFilter === 'rejected' ? 'active' : ''}"
                onclick="adminDashboard.setFilter('rejected')">
          Rejected (${this.getCountByStatus('rejected')})
        </button>
        <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}"
                onclick="adminDashboard.setFilter('all')">
          All
        </button>
      </div>

      <div class="admin-prompt-grid">
        ${this.prompts.map(prompt => this.renderPromptCard(prompt)).join('')}
      </div>
    `
  }

  renderPromptCard(prompt) {
    const evalResults = this.getEvaluationSummary(prompt)

    return `
      <div class="admin-prompt-card ${prompt.is_initial_prompt ? 'initial-prompt' : ''}"
           id="prompt-${prompt.id}">

        <!-- Preview Section -->
        <div class="card-preview">
          <div class="card-header">
            <span class="prompt-category">${prompt.category}</span>
            ${prompt.is_initial_prompt ? '<span class="initial-badge">Initial Prompt</span>' : ''}
          </div>

          <h3 class="prompt-title">${prompt.title}</h3>
          <p class="prompt-description">${prompt.description || 'No description provided'}</p>

          <div class="prompt-tags">
            ${(prompt.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>

          <div class="prompt-author">
            <img src="${prompt.users.avatar_url || '/default-avatar.png'}"
                 alt="${prompt.users.display_name}"
                 class="author-avatar">
            <div>
              <div class="author-name">${prompt.users.display_name}</div>
              <div class="author-email">${prompt.users.email}</div>
            </div>
          </div>
        </div>

        <!-- Evaluation Results -->
        <div class="card-evaluation">
          <h4>Evaluation Results</h4>
          <div class="eval-checks">
            <div class="eval-check ${evalResults.schema ? 'passed' : 'failed'}">
              <span class="check-icon">${evalResults.schema ? '✓' : '✗'}</span>
              <span>Schema Check</span>
            </div>
            <div class="eval-check ${evalResults.safety ? 'passed' : 'failed'}">
              <span class="check-icon">${evalResults.safety ? '✓' : '✗'}</span>
              <span>Safety Scan</span>
            </div>
            <div class="eval-check ${evalResults.dedup ? 'passed' : 'failed'}">
              <span class="check-icon">${evalResults.dedup ? '✓' : '✗'}</span>
              <span>Dedup Check</span>
            </div>
            <div class="eval-check ${evalResults.replicability ? 'passed' : 'failed'}">
              <span class="check-icon">${evalResults.replicability ? '✓' : '✗'}</span>
              <span>Replicability</span>
            </div>
          </div>
          ${evalResults.score ? `<div class="eval-score">Score: ${evalResults.score}/100</div>` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="card-actions">
          <button class="btn-view" onclick="adminDashboard.viewFullPrompt('${prompt.id}')">
            View Full Details
          </button>

          ${prompt.status === 'pending' || prompt.status === 'evaluating' ? `
            <div class="action-buttons">
              <button class="btn-approve" onclick="adminDashboard.approvePrompt('${prompt.id}')">
                ✓ Approve
              </button>
              <button class="btn-reject" onclick="adminDashboard.showRejectDialog('${prompt.id}')">
                ✗ Reject
              </button>
            </div>
          ` : `
            <div class="status-badge status-${prompt.status}">
              ${prompt.status.toUpperCase()}
            </div>
          `}
        </div>

        <!-- Submitted timestamp -->
        <div class="card-footer">
          <span>Submitted ${this.formatRelativeTime(prompt.submitted_at)}</span>
        </div>
      </div>
    `
  }

  getEvaluationSummary(prompt) {
    return {
      schema: prompt.passed_schema_check,
      safety: prompt.passed_safety_scan,
      dedup: prompt.passed_dedup_check,
      replicability: prompt.passed_replicability_test,
      score: prompt.evaluation_score
    }
  }

  async approvePrompt(promptId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update prompt status
      const { error: promptError } = await supabase
        .from('prompts')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          is_public: true
        })
        .eq('id', promptId)

      if (promptError) throw promptError

      // Log admin action
      const { error: actionError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: user.id,
          prompt_id: promptId,
          action: 'approve',
          previous_status: 'pending',
          new_status: 'approved'
        }])

      if (actionError) console.error('Failed to log action:', actionError)

      // Show success message
      showToast({
        title: 'Prompt Approved',
        message: 'The prompt has been approved and is now public',
        type: 'success'
      })

      // Reload prompts
      await this.loadPrompts()
      this.render()

    } catch (error) {
      console.error('Approval error:', error)
      showToast({
        title: 'Error',
        message: 'Failed to approve prompt',
        type: 'error'
      })
    }
  }

  async showRejectDialog(promptId) {
    const reason = prompt('Please provide a reason for rejection (this will be sent to the user):')

    if (!reason || reason.trim() === '') {
      return
    }

    await this.rejectPrompt(promptId, reason)
  }

  async rejectPrompt(promptId, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update prompt status
      const { error: promptError } = await supabase
        .from('prompts')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', promptId)

      if (promptError) throw promptError

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert([{
          admin_id: user.id,
          prompt_id: promptId,
          action: 'reject',
          notes: reason,
          previous_status: 'pending',
          new_status: 'rejected'
        }])

      showToast({
        title: 'Prompt Rejected',
        message: 'The user will be notified',
        type: 'info'
      })

      await this.loadPrompts()
      this.render()

    } catch (error) {
      console.error('Rejection error:', error)
      showToast({
        title: 'Error',
        message: 'Failed to reject prompt',
        type: 'error'
      })
    }
  }

  async viewFullPrompt(promptId) {
    // Open modal with full prompt details
    const prompt = this.prompts.find(p => p.id === promptId)
    if (!prompt) return

    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h2>${prompt.title}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal-body">
          <div class="prompt-full-content">
            <h3>Description</h3>
            <p>${prompt.description}</p>

            <h3>Prompt Text</h3>
            <pre><code>${prompt.prompt_text}</code></pre>

            ${prompt.example_input ? `
              <h3>Example Input</h3>
              <pre><code>${prompt.example_input}</code></pre>
            ` : ''}

            ${prompt.example_output ? `
              <h3>Example Output</h3>
              <pre><code>${prompt.example_output}</code></pre>
            ` : ''}

            ${prompt.instructions ? `
              <h3>Instructions</h3>
              <p>${prompt.instructions}</p>
            ` : ''}

            <h3>Evaluation Logs</h3>
            ${this.renderEvaluationLogs(prompt.evaluation_logs)}
          </div>
        </div>
        <div class="modal-footer">
          ${prompt.status === 'pending' ? `
            <button class="btn-approve" onclick="adminDashboard.approvePrompt('${prompt.id}'); this.closest('.modal-overlay').remove()">
              Approve
            </button>
            <button class="btn-reject" onclick="adminDashboard.showRejectDialog('${prompt.id}'); this.closest('.modal-overlay').remove()">
              Reject
            </button>
          ` : ''}
          <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
            Close
          </button>
        </div>
      </div>
    `

    document.body.appendChild(modal)
  }

  renderEvaluationLogs(logs) {
    if (!logs || logs.length === 0) {
      return '<p>No evaluation logs available</p>'
    }

    return logs.map(log => `
      <div class="eval-log">
        <div class="log-header">
          <span class="log-type">${log.evaluation_type}</span>
          <span class="log-result ${log.passed ? 'passed' : 'failed'}">
            ${log.passed ? '✓ Passed' : '✗ Failed'}
          </span>
        </div>
        ${log.score ? `<div class="log-score">Score: ${log.score}</div>` : ''}
        ${log.details ? `<pre class="log-details">${JSON.stringify(log.details, null, 2)}</pre>` : ''}
        ${log.error_message ? `<div class="log-error">${log.error_message}</div>` : ''}
      </div>
    `).join('')
  }

  setupRealtimeSubscription() {
    // Subscribe to new prompt submissions
    this.subscription = supabase
      .channel('admin-prompts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'prompts'
        },
        (payload) => {
          // Show notification
          showToast({
            title: 'New Prompt Submitted',
            message: 'A new prompt is awaiting review',
            type: 'info'
          })

          // Reload if on pending filter
          if (this.currentFilter === 'pending' || this.currentFilter === 'all') {
            this.loadPrompts().then(() => this.render())
          }
        }
      )
      .subscribe()
  }

  setFilter(filter) {
    this.currentFilter = filter
    this.loadPrompts().then(() => this.render())
  }

  getCountByStatus(status) {
    return this.prompts.filter(p => p.status === status).length
  }

  getTodayApprovalCount() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.prompts.filter(p =>
      p.status === 'approved' &&
      new Date(p.approved_at) >= today
    ).length
  }

  formatRelativeTime(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }
}
```

### 4.2 Admin API Endpoints
- [ ] Create Vercel serverless functions for admin actions

```javascript
// api/admin/approve-prompt.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt_id, admin_id } = req.body

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Verify admin permissions
    const { data: admin } = await supabase
      .from('users')
      .select('can_approve_prompts')
      .eq('id', admin_id)
      .single()

    if (!admin?.can_approve_prompts) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Approve prompt
    const { error } = await supabase
      .from('prompts')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: admin_id,
        is_public: true
      })
      .eq('id', prompt_id)

    if (error) throw error

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Approval error:', error)
    return res.status(500).json({ error: error.message })
  }
}
```

### 4.3 Keyboard Shortcuts for Admins
- [ ] Add keyboard shortcuts for quick actions

```javascript
// src/components/admin/KeyboardShortcuts.js
export function setupAdminKeyboardShortcuts(dashboard) {
  document.addEventListener('keydown', (e) => {
    // Only in admin dashboard
    if (!window.location.pathname.includes('/admin')) return

    // Prevent shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    switch(e.key) {
      case '1':
        dashboard.setFilter('pending')
        break
      case '2':
        dashboard.setFilter('evaluating')
        break
      case '3':
        dashboard.setFilter('approved')
        break
      case '4':
        dashboard.setFilter('rejected')
        break
      case 'r':
        // Refresh
        dashboard.loadPrompts().then(() => dashboard.render())
        break
      // Add more shortcuts as needed
    }
  })
}
```

**Completion Criteria**:
- Admin dashboard displays pending prompts
- Preview cards show how prompt will look on site
- Quick approve/reject buttons work
- Evaluation results visible
- Real-time updates for new submissions
- Keyboard shortcuts functional

---

## Phase 5: Automated Evaluation Pipeline

**Timeline**: Week 4 (Days 4-7) + Week 5 (Days 1-4)
**Goal**: Implement automated checks to minimize human review time

### 5.1 Schema Validation
- [ ] Implement schema checker to verify required fields

```javascript
// src/services/evaluation/schema-check.js
export async function performSchemaCheck(prompt) {
  const results = {
    passed: true,
    score: 100,
    issues: [],
    details: {}
  }

  // Check required fields
  const requiredFields = [
    { field: 'title', minLength: 10, maxLength: 200 },
    { field: 'description', minLength: 20, maxLength: 500 },
    { field: 'prompt_text', minLength: 50, maxLength: 10000 },
    { field: 'category', values: ['AI Agents', 'Creative Writing', 'Data Analysis', 'Image Generation', 'Business', 'Research', 'Gaming', 'Website Coding'] }
  ]

  for (const req of requiredFields) {
    const value = prompt[req.field]

    // Check if field exists
    if (!value || value.trim() === '') {
      results.passed = false
      results.score -= 25
      results.issues.push(`Missing required field: ${req.field}`)
      continue
    }

    // Check length constraints
    if (req.minLength && value.length < req.minLength) {
      results.passed = false
      results.score -= 10
      results.issues.push(`${req.field} is too short (min: ${req.minLength} characters)`)
    }

    if (req.maxLength && value.length > req.maxLength) {
      results.passed = false
      results.score -= 10
      results.issues.push(`${req.field} is too long (max: ${req.maxLength} characters)`)
    }

    // Check enum values
    if (req.values && !req.values.includes(value)) {
      results.passed = false
      results.score -= 15
      results.issues.push(`${req.field} must be one of: ${req.values.join(', ')}`)
    }
  }

  // Check for required sections in prompt_text
  const requiredSections = [
    { name: 'Instructions', patterns: [/instructions?:/i, /how to use:/i, /steps?:/i] },
    { name: 'Context or Background', patterns: [/context:/i, /background:/i, /scenario:/i] },
  ]

  for (const section of requiredSections) {
    const hasSection = section.patterns.some(pattern => pattern.test(prompt.prompt_text))

    results.details[section.name] = hasSection

    if (!hasSection) {
      results.score -= 5
      results.issues.push(`Recommended: Include ${section.name} section`)
    }
  }

  // Check if tags are provided
  if (!prompt.tags || prompt.tags.length === 0) {
    results.score -= 5
    results.issues.push('Recommended: Add at least one tag')
  }

  // Check if example input/output are provided
  if (!prompt.example_input || !prompt.example_output) {
    results.score -= 10
    results.issues.push('Recommended: Provide example input and output')
  }

  results.score = Math.max(0, results.score)

  return results
}
```

### 5.2 Safety Scanner
- [ ] Implement safety checks for sensitive information

```javascript
// src/services/evaluation/safety-scan.js
export async function performSafetyScan(prompt) {
  const results = {
    passed: true,
    score: 100,
    issues: [],
    details: {
      pii_found: false,
      secrets_found: false,
      sensitive_ids_found: false
    }
  }

  const allText = [
    prompt.title,
    prompt.description,
    prompt.prompt_text,
    prompt.example_input,
    prompt.example_output,
    prompt.instructions
  ].join(' ')

  // Check for PHI/PII patterns
  const piiPatterns = [
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'SSN' },
    { pattern: /\b\d{16}\b/g, type: 'Credit Card' },
    { pattern: /\b[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, type: 'IBAN' },
    { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, type: 'Phone Number' },
    { pattern: /\b\d{9}\b/g, type: 'Tax ID' }
  ]

  for (const { pattern, type } of piiPatterns) {
    const matches = allText.match(pattern)
    if (matches) {
      results.passed = false
      results.score -= 30
      results.details.pii_found = true
      results.issues.push(`Potential ${type} detected. Please remove all personal information.`)
    }
  }

  // Check for API keys, secrets, tokens
  const secretPatterns = [
    { pattern: /sk-[a-zA-Z0-9]{32,}/g, type: 'OpenAI API Key' },
    { pattern: /ghp_[a-zA-Z0-9]{36}/g, type: 'GitHub Personal Access Token' },
    { pattern: /AIza[a-zA-Z0-9_-]{35}/g, type: 'Google API Key' },
    { pattern: /AKIA[0-9A-Z]{16}/g, type: 'AWS Access Key' },
    { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, type: 'Stripe Secret Key' },
    { pattern: /xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}/g, type: 'Slack Bot Token' }
  ]

  for (const { pattern, type } of secretPatterns) {
    const matches = allText.match(pattern)
    if (matches) {
      results.passed = false
      results.score = 0  // Critical failure
      results.details.secrets_found = true
      results.issues.push(`${type} detected! Please remove immediately.`)
    }
  }

  // Check for Stanford-specific IDs
  const idPatterns = [
    { pattern: /\b0\d{7}\b/g, type: 'Stanford ID' },
    { pattern: /\b[A-Z]{2}\d{5}\b/g, type: 'Course ID' },
    { pattern: /SUID:\s*\d+/gi, type: 'SUID' }
  ]

  for (const { pattern, type } of idPatterns) {
    const matches = allText.match(pattern)
    if (matches) {
      results.passed = false
      results.score -= 20
      results.details.sensitive_ids_found = true
      results.issues.push(`Potential ${type} detected. Please anonymize.`)
    }
  }

  // Check for offensive content (basic)
  const offensivePatterns = [
    // Add patterns here - keeping minimal for brevity
  ]

  for (const pattern of offensivePatterns) {
    if (pattern.test(allText)) {
      results.passed = false
      results.score = 0
      results.issues.push('Content contains inappropriate language')
      break
    }
  }

  // Check for URLs to private repositories
  const privateRepoPattern = /github\.com\/[^\/\s]+\/[^\/\s]+/gi
  const repoMatches = allText.match(privateRepoPattern)
  if (repoMatches) {
    results.issues.push('GitHub repository links detected. Ensure they are public.')
    results.score -= 5
  }

  results.score = Math.max(0, results.score)

  return results
}
```

### 5.3 Deduplication Check
- [ ] Implement vector similarity search to find duplicates

```javascript
// api/evaluation/dedup-check.js
import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi } from 'openai'

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt_id } = req.body

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', prompt_id)
      .single()

    if (promptError) throw promptError

    // Generate embedding
    const textToEmbed = `${prompt.title} ${prompt.description} ${prompt.prompt_text}`

    const embeddingResponse = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: textToEmbed
    })

    const embedding = embeddingResponse.data.data[0].embedding

    // Store embedding
    await supabase
      .from('prompt_embeddings')
      .upsert({
        prompt_id: prompt.id,
        embedding: embedding,
        model_used: 'text-embedding-ada-002',
        embedding_version: 'v1'
      })

    // Find similar prompts
    const { data: similarPrompts } = await supabase
      .rpc('find_similar_prompts', {
        p_embedding: embedding,
        p_threshold: 0.85,  // 85% similarity
        p_limit: 5
      })

    const results = {
      passed: true,
      score: 100,
      similar_prompts: similarPrompts || [],
      details: {}
    }

    // Check similarity threshold
    if (similarPrompts && similarPrompts.length > 0) {
      const highestSimilarity = similarPrompts[0].similarity

      if (highestSimilarity > 0.95) {
        results.passed = false
        results.score = 0
        results.details.reason = 'Duplicate prompt detected'
      } else if (highestSimilarity > 0.90) {
        results.passed = true
        results.score = 50
        results.details.reason = 'Very similar prompt exists'
      } else if (highestSimilarity > 0.85) {
        results.score = 80
        results.details.reason = 'Somewhat similar prompt exists'
      }
    }

    // Log evaluation
    await supabase
      .from('evaluation_logs')
      .insert([{
        prompt_id: prompt.id,
        evaluation_type: 'dedup',
        passed: results.passed,
        score: results.score,
        details: results,
        completed_at: new Date().toISOString()
      }])

    // Update prompt
    await supabase
      .from('prompts')
      .update({
        passed_dedup_check: results.passed
      })
      .eq('id', prompt.id)

    return res.status(200).json(results)

  } catch (error) {
    console.error('Dedup check error:', error)
    return res.status(500).json({ error: error.message })
  }
}
```

### 5.4 Replicability Test
- [ ] Implement test that runs prompt with example input

```javascript
// api/evaluation/replicability-test.js
import { Configuration, OpenAIApi } from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}))

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt_id } = req.body

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get prompt
    const { data: prompt } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', prompt_id)
      .single()

    if (!prompt.example_input || !prompt.example_output) {
      // Skip if no examples provided
      return res.status(200).json({
        passed: true,
        score: 100,
        skipped: true,
        reason: 'No example input/output provided'
      })
    }

    const results = {
      passed: true,
      score: 100,
      details: {}
    }

    // Construct full prompt with example input
    const fullPrompt = `${prompt.prompt_text}\n\nInput: ${prompt.example_input}`

    // Run prompt through model
    const startTime = Date.now()

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: fullPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const duration = Date.now() - startTime
    const actualOutput = completion.data.choices[0].message.content

    results.details.actual_output = actualOutput
    results.details.expected_output = prompt.example_output
    results.details.duration_ms = duration

    // Basic checks
    // 1. Check if output was generated
    if (!actualOutput || actualOutput.trim() === '') {
      results.passed = false
      results.score = 0
      results.details.reason = 'No output generated'
    }

    // 2. Check output length is reasonable
    if (actualOutput.length < 10) {
      results.score -= 20
      results.details.warnings = ['Output is very short']
    }

    // 3. Check if instructions were followed (basic check)
    const instructionPatterns = extractInstructionPatterns(prompt.prompt_text)
    const instructionAdherence = checkInstructionAdherence(actualOutput, instructionPatterns)

    results.details.instruction_adherence = instructionAdherence
    if (instructionAdherence < 0.5) {
      results.passed = false
      results.score -= 30
      results.details.reason = 'Instructions not followed'
    }

    // 4. Check for harmful content in output
    const harmfulCheck = await checkHarmfulContent(actualOutput)
    if (!harmfulCheck.passed) {
      results.passed = false
      results.score = 0
      results.details.reason = 'Output contains harmful content'
    }

    results.score = Math.max(0, results.score)

    // Log evaluation
    await supabase
      .from('evaluation_logs')
      .insert([{
        prompt_id: prompt.id,
        evaluation_type: 'replicability',
        passed: results.passed,
        score: results.score,
        details: results,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        model_used: 'gpt-3.5-turbo'
      }])

    // Update prompt
    await supabase
      .from('prompts')
      .update({
        passed_replicability_test: results.passed
      })
      .eq('id', prompt.id)

    return res.status(200).json(results)

  } catch (error) {
    console.error('Replicability test error:', error)

    // Log failed evaluation
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase
      .from('evaluation_logs')
      .insert([{
        prompt_id: req.body.prompt_id,
        evaluation_type: 'replicability',
        passed: false,
        details: { error: error.message },
        error_message: error.message
      }])

    return res.status(500).json({ error: error.message })
  }
}

function extractInstructionPatterns(promptText) {
  const patterns = []

  // Look for numbered steps
  const numberedSteps = promptText.match(/\d+\.\s+([^\n]+)/g)
  if (numberedSteps) {
    patterns.push({ type: 'steps', count: numberedSteps.length })
  }

  // Look for output format specifications
  if (/format:|structure:|output:/i.test(promptText)) {
    patterns.push({ type: 'format_specified' })
  }

  // Look for specific requirements
  const requirements = promptText.match(/must|should|need to|required/gi)
  if (requirements) {
    patterns.push({ type: 'requirements', count: requirements.length })
  }

  return patterns
}

function checkInstructionAdherence(output, patterns) {
  let adherenceScore = 1.0

  for (const pattern of patterns) {
    if (pattern.type === 'steps') {
      // Check if output has similar number of steps or sections
      const outputSteps = output.match(/\n\n|\d+\.|•|-/g)
      if (!outputSteps || outputSteps.length < pattern.count * 0.5) {
        adherenceScore -= 0.2
      }
    }

    if (pattern.type === 'format_specified') {
      // Basic check - would need more sophisticated analysis
      adherenceScore += 0.1
    }
  }

  return Math.max(0, Math.min(1, adherenceScore))
}

async function checkHarmfulContent(text) {
  // Use OpenAI moderation API
  try {
    const moderation = await openai.createModeration({
      input: text
    })

    const results = moderation.data.results[0]

    return {
      passed: !results.flagged,
      categories: results.categories,
      category_scores: results.category_scores
    }
  } catch (error) {
    console.error('Moderation check failed:', error)
    return { passed: true } // Default to passing if check fails
  }
}
```

### 5.5 Evaluation Pipeline Orchestrator
- [ ] Create main evaluation pipeline that runs all checks

```javascript
// api/evaluation/evaluate-prompt.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt_id } = req.body

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Update status to evaluating
    await supabase
      .from('prompts')
      .update({ status: 'evaluating' })
      .eq('id', prompt_id)

    // Run all evaluation checks
    const checks = [
      { name: 'schema', endpoint: '/api/evaluation/schema-check' },
      { name: 'safety', endpoint: '/api/evaluation/safety-scan' },
      { name: 'dedup', endpoint: '/api/evaluation/dedup-check' },
      { name: 'replicability', endpoint: '/api/evaluation/replicability-test' }
    ]

    const results = {}
    let allPassed = true
    let totalScore = 0

    for (const check of checks) {
      try {
        const response = await fetch(`${process.env.VERCEL_URL}${check.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_id })
        })

        const result = await response.json()
        results[check.name] = result

        if (!result.passed) {
          allPassed = false
        }

        totalScore += result.score || 0

      } catch (error) {
        console.error(`${check.name} check failed:`, error)
        results[check.name] = {
          passed: false,
          error: error.message
        }
        allPassed = false
      }
    }

    const averageScore = totalScore / checks.length

    // Update prompt with evaluation results
    await supabase
      .from('prompts')
      .update({
        evaluation_results: results,
        evaluation_score: averageScore,
        evaluated_at: new Date().toISOString(),
        // If all checks passed and score is high, auto-approve
        // Otherwise, keep as pending for manual review
        status: (allPassed && averageScore >= 80) ? 'approved' : 'pending',
        is_public: (allPassed && averageScore >= 80)
      })
      .eq('id', prompt_id)

    return res.status(200).json({
      success: true,
      all_passed: allPassed,
      average_score: averageScore,
      auto_approved: allPassed && averageScore >= 80,
      results
    })

  } catch (error) {
    console.error('Evaluation pipeline error:', error)
    return res.status(500).json({ error: error.message })
  }
}
```

### 5.6 Client-Side Evaluation Trigger
- [ ] Trigger evaluation when prompt is submitted

```javascript
// src/services/prompts.js (add to existing file)
export async function submitPromptWithEvaluation(promptData) {
  try {
    // Submit prompt
    const prompt = await createPrompt(promptData)

    // Trigger evaluation pipeline
    const response = await fetch('/api/evaluation/evaluate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id: prompt.id })
    })

    if (!response.ok) {
      console.error('Failed to trigger evaluation')
    }

    const evaluationResult = await response.json()

    return {
      prompt,
      evaluation: evaluationResult
    }

  } catch (error) {
    console.error('Prompt submission error:', error)
    throw error
  }
}
```

**Completion Criteria**:
- Schema validation catches missing/invalid fields
- Safety scanner detects PII, secrets, and sensitive IDs
- Deduplication check finds similar prompts
- Replicability test runs prompt and checks output
- Pipeline automatically approves high-quality prompts
- All results logged to database

---

## Phase 6: Frontend Implementation

**Timeline**: Week 5 (Days 5-7) + Week 6 (Full week)
**Goal**: Build user-facing interface components

### 6.1 Main Application Shell
- [ ] Convert existing HTML to modular components
- [ ] Implement window management system
- [ ] Add navigation and routing

### 6.2 Prompt Components
- [ ] Prompt card display
- [ ] Prompt detail view
- [ ] Prompt submission form (with required fields for evaluation)
- [ ] Markdown editor integration

### 6.3 Search and Filtering
- [ ] Search bar with full-text search
- [ ] Category filters
- [ ] Tag filters
- [ ] Sort options (newest, most liked, most viewed)

### 6.4 Social Features
- [ ] Like/unlike buttons
- [ ] Favorites/bookmarks
- [ ] Copy-to-clipboard
- [ ] Export as markdown

### 6.5 User Profile
- [ ] Profile page
- [ ] User statistics
- [ ] Submitted prompts list
- [ ] Approval status tracking

### 6.6 Leaderboard
- [ ] Top contributors table
- [ ] Time filters (all-time, monthly, weekly)
- [ ] Ranking algorithm (prompts + likes weighted)

**Completion Criteria**:
- All windows from original HTML are functional
- Users can browse, search, and filter prompts
- Submission form collects all required evaluation fields
- Social features work
- UI is responsive and polished

---

## Phase 7: Vercel Deployment & Infrastructure

**Timeline**: Week 7 (Days 1-4)
**Goal**: Deploy to Vercel with proper configuration

### 7.1 Vercel Configuration
- [ ] Create `vercel.json` configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "OPENAI_API_KEY": "@openai-api-key"
  },
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### 7.2 Environment Variables
- [ ] Set up production environment variables in Vercel dashboard
- [ ] Configure Supabase URL and keys
- [ ] Configure OpenAI API key for evaluations
- [ ] Configure Google OAuth credentials

### 7.3 Rate Limiting and Caching
- [ ] Implement Vercel Edge Config for rate limiting

```javascript
// middleware.js (Vercel Edge Middleware)
import { get } from '@vercel/edge-config'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Get user IP
  const ip = request.ip || request.headers.get('x-forwarded-for')

  // Check rate limit
  const rateLimit = await checkRateLimit(ip)

  if (!rateLimit.allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': rateLimit.retryAfter.toString()
      }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

- [ ] Configure caching headers for static assets

```javascript
// next.config.js (if using Next.js) or vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate"
        }
      ]
    }
  ]
}
```

### 7.4 Custom Domain
- [ ] Configure custom domain (prompts.stanford.edu)
- [ ] Set up SSL/TLS certificates
- [ ] Configure DNS records

### 7.5 Deployment Pipeline
- [ ] Connect GitHub repository to Vercel
- [ ] Configure automatic deployments on push to main
- [ ] Set up preview deployments for branches

**Completion Criteria**:
- Application deployed to Vercel
- Custom domain configured
- Environment variables set
- Rate limiting active
- Caching configured
- Auto-deployment working

---

## Phase 8: Observability & Monitoring

**Timeline**: Week 7 (Days 5-7)
**Goal**: Set up comprehensive monitoring and logging

### 8.1 Vercel Analytics
- [ ] Enable Vercel Analytics
- [ ] Configure Web Vitals tracking
- [ ] Set up custom events

### 8.2 Supabase Logs
- [ ] Configure log retention
- [ ] Set up log exports
- [ ] Create log dashboards

### 8.3 Sentry Integration
- [ ] Create Sentry project
- [ ] Install Sentry SDK
- [ ] Configure error tracking

```javascript
// src/config/sentry.js
import * as Sentry from '@sentry/browser'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  }
})
```

### 8.4 Custom Metrics
- [ ] Track prompt submissions
- [ ] Track evaluation results
- [ ] Track approval/rejection rates
- [ ] Track user activation (gated access)

```javascript
// src/services/analytics.js
export async function trackMetric(metricName, value, metadata = {}) {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metricName,
        value,
        metadata,
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('Failed to track metric:', error)
  }
}

// Usage
trackMetric('prompt_submitted', 1, { category: 'AI Agents' })
trackMetric('user_activated', 1, { time_to_activation_hours: 2.5 })
trackMetric('prompt_approved', 1, { auto_approved: true })
```

### 8.5 Alerting
- [ ] Configure alerts for critical errors
- [ ] Set up alerts for evaluation pipeline failures
- [ ] Create alerts for high rejection rates

**Completion Criteria**:
- Vercel Analytics tracking pageviews and performance
- Supabase logs accessible and searchable
- Sentry catching and reporting errors
- Custom metrics being tracked
- Alerts configured and tested

---

## Phase 9: Testing & Quality Assurance

**Timeline**: Week 8 (Full week)
**Goal**: Comprehensive testing before launch

### 9.1 Unit Tests
- [ ] Test authentication functions
- [ ] Test evaluation pipeline components
- [ ] Test access control logic
- [ ] Test CRUD operations

### 9.2 Integration Tests
- [ ] Test complete user flows
- [ ] Test gated access workflow
- [ ] Test admin approval workflow
- [ ] Test evaluation pipeline end-to-end

### 9.3 E2E Tests
- [ ] Test user sign-up and first prompt submission
- [ ] Test prompt approval flow
- [ ] Test browsing as approved member
- [ ] Test admin dashboard

### 9.4 Security Testing
- [ ] Test email domain validation
- [ ] Test RLS policies
- [ ] Test rate limiting
- [ ] Test input sanitization
- [ ] Penetration testing (if resources available)

### 9.5 Performance Testing
- [ ] Load test API endpoints
- [ ] Test database query performance
- [ ] Test evaluation pipeline under load
- [ ] Optimize slow queries

### 9.6 User Acceptance Testing
- [ ] Beta test with small group (10-20 users)
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Iterate on UX

**Completion Criteria**:
- All tests passing
- No critical bugs
- Performance meets targets (page load < 2s, API < 200ms)
- Security audit passed
- Beta users satisfied

---

## Phase 10: Launch & Post-Launch

**Timeline**: Week 9-10
**Goal**: Public launch and immediate post-launch support

### 10.1 Pre-Launch Checklist
- [ ] Final security review
- [ ] Database backups verified
- [ ] Monitoring dashboards ready
- [ ] Admin team trained
- [ ] Support documentation prepared
- [ ] Launch announcement drafted

### 10.2 Soft Launch
- [ ] Launch to limited audience (50-100 users)
- [ ] Monitor closely for issues
- [ ] Gather feedback
- [ ] Fix any issues discovered

### 10.3 Public Launch
- [ ] Announce on Stanford mailing lists
- [ ] Post on social media
- [ ] Send to relevant Stanford communities
- [ ] Monitor traffic and performance

### 10.4 Post-Launch Monitoring
- [ ] Daily error log reviews
- [ ] Monitor approval queue
- [ ] Track key metrics:
  - User signups
  - Prompt submissions
  - Approval rates
  - User activation rate
  - Active users
- [ ] Respond to user feedback

### 10.5 Iteration
- [ ] Prioritize bug fixes
- [ ] Implement quick wins
- [ ] Plan feature roadmap based on feedback

**Completion Criteria**:
- Public launch successful
- No major incidents
- User feedback positive
- Key metrics trending upward
- System stable

---

## Progress Tracking

Use this section to track overall progress:

### Phase Completion Status
- [ ] Phase 0: Project Setup (0%)
- [ ] Phase 1: Multi-Domain Authentication (0%)
- [ ] Phase 2: Database Schema & Security (0%)
- [ ] Phase 3: Gated Access System (0%)
- [ ] Phase 4: Admin Approval Interface (0%)
- [ ] Phase 5: Automated Evaluation Pipeline (0%)
- [ ] Phase 6: Frontend Implementation (0%)
- [ ] Phase 7: Vercel Deployment & Infrastructure (0%)
- [ ] Phase 8: Observability & Monitoring (0%)
- [ ] Phase 9: Testing & Quality Assurance (0%)
- [ ] Phase 10: Launch & Post-Launch (0%)

### Overall Project Status
**Current Phase**: Phase 0 - Project Setup
**Completion**: 0% (0/11 phases)
**Timeline**: On Track / Behind / Ahead
**Blockers**: None
**Next Milestone**: Complete project structure setup

---

## Notes and Updates

### 2025-11-18
- Initial implementation plan created
- Documentation structure established
- Ready to begin Phase 0

---

## Resources

### Documentation
- [DEPLOYMENT_PLAN.md](./docs/DEPLOYMENT_PLAN.md) - Original technical plan
- [CRITICAL_APPRAISAL.md](./docs/CRITICAL_APPRAISAL.md) - Risk analysis
- [IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md) - Quick reference

### External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

---

**Last Updated**: 2025-11-18
**Document Version**: 1.0
**Maintained By**: Development Team
