# Stanford Prompt Library - Implementation Quick Start Guide

This guide provides step-by-step instructions to implement the deployment plan.

---

## Phase 1: Supabase Setup (Day 1-2)

### Step 1: Create Supabase Project
```bash
# Visit https://supabase.com/dashboard
# 1. Create new project
# 2. Choose region: US West (closest to Stanford)
# 3. Generate secure database password
# 4. Wait for project provisioning (~2 minutes)
```

### Step 2: Configure Google OAuth
```bash
# 1. Go to Google Cloud Console
# 2. Create OAuth 2.0 credentials
# 3. Add authorized redirect URI:
#    https://YOUR_PROJECT.supabase.co/auth/v1/callback

# 4. In Supabase Dashboard > Authentication > Providers
# 5. Enable Google provider
# 6. Add Client ID and Secret
# 7. Add additional configuration:
{
  "hd": "stanford.edu"
}
```

### Step 3: Run Database Migrations
```sql
-- Connect to Supabase SQL Editor
-- Copy and run each section from DEPLOYMENT_PLAN.md Section 2

-- 1. Create tables
-- 2. Create indexes
-- 3. Enable RLS
-- 4. Create policies
-- 5. Create functions
-- 6. Create triggers
```

### Step 4: Seed Initial Data
```sql
-- Run the category insert from DEPLOYMENT_PLAN.md
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('AI Agents', 'ai-agents', 'Build autonomous AI agents with advanced reasoning', '🤖', '#3b82f6'),
  -- ... rest of categories
;
```

---

## Phase 2: Frontend Setup (Day 3-5)

### Step 1: Initialize Project
```bash
# Create new Vite project
npm create vite@latest stanford-prompt-library -- --template vanilla

cd stanford-prompt-library
npm install

# Install dependencies
npm install @supabase/supabase-js
npm install simplemde
npm install dompurify
npm install marked
```

### Step 2: Project Structure
```bash
mkdir -p src/{components,services,utils,styles}
mkdir -p public/assets

# Move existing HTML
mv ../prompt-library-site.html public/index.html
```

### Step 3: Configure Supabase Client
```javascript
// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 4: Create Environment Files
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

---

## Phase 3: Core Feature Implementation (Week 2-4)

### Authentication Service
```javascript
// src/services/auth.js
import { supabase } from '../config/supabase'

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        hd: 'stanford.edu',
        prompt: 'select_account'
      }
    }
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
```

### Prompts Service
```javascript
// src/services/prompts.js
import { supabase } from '../config/supabase'

export async function createPrompt(promptData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('prompts')
    .insert([{
      user_id: user.id,
      title: promptData.title,
      content: promptData.content,
      markdown_content: promptData.content,
      description: promptData.description,
      category: promptData.category,
      tags: promptData.tags,
      example_image_url: promptData.image_url
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPrompts(filters = {}) {
  let query = supabase
    .from('prompts')
    .select(`
      *,
      users!inner(display_name, avatar_url)
    `)
    .eq('is_public', true)
    .eq('is_deleted', false)

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  if (filters.tags?.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function likePrompt(promptId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('likes')
    .insert([{ user_id: user.id, prompt_id: promptId }])

  if (error) {
    if (error.code === '23505') {
      // Already liked, unlike
      return unlikePrompt(promptId)
    }
    throw error
  }
}

export async function unlikePrompt(promptId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)

  if (error) throw error
}
```

### Leaderboard Service
```javascript
// src/services/leaderboard.js
import { supabase } from '../config/supabase'

export async function getLeaderboard(timeframe = 'all', limit = 50) {
  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('*')
    .limit(limit)

  if (error) throw error
  return data
}
```

---

## Phase 4: UI Components (Week 3-4)

### Window Component Base
```javascript
// src/components/Window.js
export class Window {
  constructor(id, title) {
    this.id = id
    this.title = title
    this.element = null
  }

  create() {
    const windowEl = document.createElement('div')
    windowEl.className = 'window'
    windowEl.id = `window-${this.id}`
    windowEl.innerHTML = `
      <div class="window-header">
        <div class="window-controls">
          <div class="window-control close"></div>
          <div class="window-control minimize"></div>
          <div class="window-control maximize"></div>
        </div>
        <span class="window-title">${this.title}</span>
      </div>
      <div class="window-content" id="content-${this.id}"></div>
    `
    this.element = windowEl
    return windowEl
  }

  open() {
    this.element.classList.add('active')
  }

  close() {
    this.element.classList.remove('active')
  }
}
```

### Prompt Card Component
```javascript
// src/components/PromptCard.js
import { likePrompt } from '../services/prompts'

export function createPromptCard(prompt) {
  const card = document.createElement('div')
  card.className = 'content-card'
  card.innerHTML = `
    <div class="prompt-card">
      <h3>${prompt.title}</h3>
      <p class="description">${prompt.description}</p>
      <div class="meta">
        <span class="author">${prompt.users.display_name}</span>
        <span class="category">${prompt.category}</span>
      </div>
      <div class="actions">
        <button class="btn-like" data-prompt-id="${prompt.id}">
          ❤️ ${prompt.likes_count}
        </button>
        <button class="btn-copy" data-prompt-id="${prompt.id}">
          📋 Copy
        </button>
      </div>
    </div>
  `

  // Add event listeners
  const likeBtn = card.querySelector('.btn-like')
  likeBtn.addEventListener('click', async () => {
    await likePrompt(prompt.id)
    likeBtn.textContent = `❤️ ${prompt.likes_count + 1}`
  })

  const copyBtn = card.querySelector('.btn-copy')
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(prompt.content)
    showNotification('Copied to clipboard!')
  })

  return card
}
```

---

## Phase 5: Testing (Week 5-6)

### Unit Tests Setup
```bash
npm install --save-dev vitest @vitest/ui
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js']
  }
})
```

### Example Test
```javascript
// tests/auth.test.js
import { describe, it, expect } from 'vitest'
import { validateStanfordEmail } from '../src/utils/validators'

describe('Email Validation', () => {
  it('should accept Stanford emails', () => {
    expect(validateStanfordEmail('test@stanford.edu')).toBe(true)
  })

  it('should reject non-Stanford emails', () => {
    expect(validateStanfordEmail('test@gmail.com')).toBe(false)
  })
})
```

### Run Tests
```bash
npm run test
npm run test:ui  # Opens browser interface
```

---

## Phase 6: Deployment (Week 7)

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Environment Variables in Vercel
```bash
# Via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Or via Vercel Dashboard > Settings > Environment Variables
```

### Configure Custom Domain
```bash
# In Vercel Dashboard
# Settings > Domains > Add Domain
# Add: prompts.stanford.edu

# Update DNS records at Stanford IT:
# CNAME: prompts.stanford.edu -> cname.vercel-dns.com
```

---

## Phase 7: Monitoring Setup (Week 7)

### Sentry Setup
```bash
npm install @sentry/browser
```

```javascript
// src/config/sentry.js
import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
})
```

### Health Check Endpoint
```javascript
// Create Supabase Edge Function
// supabase/functions/health/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { error } = await supabase.from('users').select('count').limit(1)

    return new Response(
      JSON.stringify({
        status: error ? 'unhealthy' : 'healthy',
        timestamp: new Date().toISOString()
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: err.message }),
      { status: 500 }
    )
  }
})
```

```bash
# Deploy Edge Function
supabase functions deploy health
```

---

## Phase 8: Launch (Week 8)

### Pre-Launch Checklist
```bash
# 1. Run all tests
npm run test

# 2. Build for production
npm run build

# 3. Test production build locally
npm run preview

# 4. Verify environment variables
vercel env ls

# 5. Deploy to production
vercel --prod

# 6. Verify deployment
curl https://prompts.stanford.edu/health
```

### Soft Launch
```markdown
1. Share with 10-20 beta users
2. Monitor for 1 week
3. Gather feedback
4. Fix critical issues
5. Prepare public announcement
```

### Public Launch
```markdown
1. Announce on Stanford mailing lists
2. Post on social media
3. Monitor traffic closely
4. Be ready for quick fixes
5. Gather user feedback
```

---

## Maintenance & Operations

### Daily Tasks
- Check error logs in Sentry
- Review health check status
- Monitor user signups

### Weekly Tasks
- Review leaderboard accuracy
- Check backup integrity
- Analyze usage metrics
- Review and moderate content

### Monthly Tasks
- Review and optimize database queries
- Update dependencies
- Security audit
- Cost analysis
- Feature planning based on feedback

---

## Troubleshooting Guide

### Issue: Users can't sign in
```bash
# Check:
1. Google OAuth credentials are correct
2. Redirect URI matches exactly
3. Stanford domain restriction (hd=stanford.edu) is set
4. Check Supabase logs for auth errors
```

### Issue: Prompts not appearing
```bash
# Check:
1. RLS policies are enabled
2. User is authenticated
3. Prompts are marked as public
4. Check browser console for errors
5. Verify database connection
```

### Issue: Search not working
```bash
# Check:
1. Full-text search index exists
2. Search query is properly formatted
3. Check if search_vector column is populated
4. Try regenerating search vectors
```

### Issue: Slow performance
```bash
# Check:
1. Database query performance (EXPLAIN ANALYZE)
2. Missing indexes
3. Refresh materialized views
4. Check for N+1 query problems
5. Enable query caching
```

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run test                   # Run tests

# Supabase
supabase start                 # Start local Supabase
supabase db reset              # Reset database
supabase db push               # Push migrations
supabase functions deploy      # Deploy edge functions

# Deployment
vercel                         # Deploy to preview
vercel --prod                  # Deploy to production
vercel logs                    # View logs

# Database
psql <connection-string>       # Connect to database
supabase db dump               # Backup database
supabase db restore            # Restore database
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support

For issues or questions:
1. Check this documentation
2. Check DEPLOYMENT_PLAN.md for architecture details
3. Check CRITICAL_APPRAISAL.md for edge cases
4. Contact development team

---

**Good luck with the implementation! 🚀**
