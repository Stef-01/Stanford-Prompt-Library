# Stanford Prompt Library - 1 Week MVP Plan

**Timeline**: 7 days of intense vibe coding
**Goal**: Ship a working site with core features, polish later
**Budget**: $150 Claude Code credits + minimal API costs

---

## 🎯 MVP Scope - What We're Shipping Week 1

### ✅ Core Features (MUST HAVE)
1. **Auth**: Google OAuth with @stanford.edu check (simple)
2. **Gated Access**: Submit 1 prompt → Admin approves → Full access
3. **Browse Prompts**: Search, filter by category, like prompts
4. **Submit Prompts**: Simple form with validation
5. **Admin Approval**: Use Supabase dashboard (no custom UI)
6. **Deploy**: Live on Vercel

### 🚫 Cut from Week 1 (Do Later)
- ❌ Multi-domain validation (just @stanford.edu for now)
- ❌ Fancy admin dashboard (use Supabase UI)
- ❌ Vector similarity dedup (expensive, complex)
- ❌ Replicability testing (costs OpenAI credits per prompt)
- ❌ Advanced monitoring (Sentry, custom analytics)
- ❌ Perfect UI polish (make it work first)

---

## 📅 Day-by-Day Plan

### **Day 1: Setup + Auth** (Today)
- [ ] Init Vite project
- [ ] Setup Supabase project
- [ ] Google OAuth (simple @stanford.edu check)
- [ ] Basic database schema
- [ ] Deploy "Hello World" to Vercel

### **Day 2: Database + Gated Access**
- [ ] Create tables (users, prompts, likes)
- [ ] RLS policies
- [ ] Gated access logic (has_submitted_prompt flag)
- [ ] Access gate UI (3 screens)

### **Day 3: Prompt Submission + Basic Evaluation**
- [ ] Prompt submission form
- [ ] Simple validation (schema check only)
- [ ] Safety scan (basic PII/secrets regex)
- [ ] Store prompts as "pending"

### **Day 4: Admin Approval + Browse**
- [ ] Admin flag in database
- [ ] Approve/reject via Supabase UI
- [ ] Browse prompts (approved members only)
- [ ] Search and filters

### **Day 5: Social Features**
- [ ] Like/unlike system
- [ ] Copy to clipboard
- [ ] User profile
- [ ] Leaderboard

### **Day 6: Polish + Testing**
- [ ] Fix bugs
- [ ] Mobile responsive
- [ ] Performance optimization
- [ ] User testing

### **Day 7: Deploy + Launch**
- [ ] Final deploy
- [ ] DNS setup
- [ ] Soft launch to beta users
- [ ] Monitor and fix

---

## 🗄️ Simplified Database Schema

```sql
-- USERS (minimal)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
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

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROMPTS (simplified)
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  -- Approval (admin uses Supabase UI)
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  is_initial_prompt BOOLEAN DEFAULT FALSE,

  -- Social
  likes_count INTEGER DEFAULT 0,

  -- Visibility
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- LIKES (simple)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  prompt_id UUID NOT NULL REFERENCES prompts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- CATEGORIES (reference)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT
);
```

---

## 🚀 Tech Stack (Keep It Simple)

```
Frontend:
├─ Vite (vanilla JS - already have HTML)
├─ Existing HTML/CSS (modify, don't rebuild)
└─ Minimal dependencies

Backend:
├─ Supabase (auth, database, storage)
└─ No custom API needed!

Deployment:
├─ Vercel (frontend)
└─ That's it!

Evaluation (MVP):
├─ Client-side schema validation
└─ Basic regex safety scan
```

---

## 💰 Cost Breakdown

**Week 1 MVP:**
- Supabase: Free tier (plenty for beta)
- Vercel: Free tier (plenty for beta)
- OpenAI: $0 (not using for MVP)
- **Total: $0/month**

**Post-MVP (if we add later):**
- Supabase Pro: $25/mo
- OpenAI API: ~$10-20/mo (if we add dedup/replicability)

---

## ⚡ What We're NOT Doing (Yet)

### Evaluation Pipeline - SIMPLIFIED
**Week 1:**
- ✅ Client-side form validation
- ✅ Basic regex for PII/secrets
- ✅ Manual admin approval

**Later:**
- 🔮 Vector similarity dedup
- 🔮 Replicability testing
- 🔮 Advanced safety scanning

### Admin Interface - SIMPLIFIED
**Week 1:**
- ✅ Admin flag in database
- ✅ Use Supabase dashboard to approve/reject
- ✅ Simple SQL query to see pending prompts

**Later:**
- 🔮 Custom admin dashboard with preview cards
- 🔮 One-click approve/reject UI
- 🔮 Evaluation results display

### Monitoring - SIMPLIFIED
**Week 1:**
- ✅ Supabase logs (built-in)
- ✅ Vercel Analytics (built-in)

**Later:**
- 🔮 Sentry error tracking
- 🔮 Custom metrics
- 🔮 Advanced analytics

---

## 📝 Implementation Priority

### Phase 1: Core Loop (Days 1-3)
```
User signs in → Sees "submit prompt" gate → Submits →
Admin approves in Supabase → User gets access → Browses prompts
```

### Phase 2: Social (Days 4-5)
```
User browses → Likes prompts → Sees leaderboard →
Submits more prompts → Builds reputation
```

### Phase 3: Ship (Days 6-7)
```
Fix bugs → Deploy → Soft launch → Iterate
```

---

## 🎨 Frontend Strategy

**Don't Rebuild - Adapt!**
- ✅ Use existing `prompt-library-site.html`
- ✅ Convert to modular JS
- ✅ Hook up to Supabase
- ✅ Make windows functional
- ✅ Add auth gates

**NOT:**
- ❌ Rebuild from scratch
- ❌ Add complex state management
- ❌ Perfect animations
- ❌ Pixel-perfect design

---

## 🔐 Auth Strategy (Simplified)

```javascript
// Week 1: Simple check
if (!user.email.endsWith('@stanford.edu')) {
  throw new Error('Stanford email required')
}

// Later: Multi-domain
const validDomains = ['stanford.edu', 'alumni.stanford.edu', ...]
```

**Server-side verification:**
- ✅ Still verify hd claim (copy code from plan)
- ✅ But only check @stanford.edu for MVP
- ✅ Add more domains later

---

## 📋 Day 1 Tasks (START NOW)

### Task 1.1: Project Setup (30 min)
```bash
npm create vite@latest stanford-prompt-library -- --template vanilla
cd stanford-prompt-library
npm install @supabase/supabase-js
```

### Task 1.2: Supabase Setup (30 min)
- Create project
- Enable Google OAuth
- Get credentials

### Task 1.3: Basic Auth (2 hours)
- Supabase client
- Sign in with Google
- Check @stanford.edu
- Create user profile

### Task 1.4: Database Schema (1 hour)
- Run SQL migrations
- Create tables
- Enable RLS
- Seed categories

### Task 1.5: Deploy Hello World (30 min)
- Connect to Vercel
- Deploy
- Verify live

**Total Day 1: ~5 hours of focused coding**

---

## 🎯 Success Criteria

### MVP Launch (End of Week 1)
- [ ] Users can sign in with Stanford email
- [ ] New users must submit 1 prompt
- [ ] Admin can approve in Supabase dashboard
- [ ] Approved users can browse all prompts
- [ ] Users can search and filter prompts
- [ ] Users can like prompts
- [ ] Leaderboard shows top contributors
- [ ] Deployed live with custom domain

### Post-MVP (Week 2+)
- [ ] Custom admin dashboard
- [ ] Advanced evaluation pipeline
- [ ] Dedup with vector similarity
- [ ] Perfect UI polish
- [ ] Advanced monitoring

---

## 🚨 Critical Path (Don't Get Distracted)

**Must Have:**
1. Auth works
2. Gated access works
3. Submit prompt works
4. Admin approve works
5. Browse prompts works
6. Site is live

**Nice to Have (but not this week):**
- Perfect UI
- Advanced evaluation
- Custom admin UI
- Monitoring stack
- Complex features

---

## 💪 Let's Ship This!

**Right Now:**
1. ✅ Create Vite project
2. ✅ Setup Supabase
3. ✅ Implement auth
4. ✅ Deploy to Vercel

**Today's Goal:**
- Working auth
- Database created
- Deployed to Vercel
- Can sign in and see "submit prompt" gate

---

## 📊 Progress Tracking

### Day 1 Progress: [ ] 0/5 tasks
- [ ] Project setup
- [ ] Supabase setup
- [ ] Basic auth
- [ ] Database schema
- [ ] Deploy hello world

### Overall MVP: [ ] 0%

---

**LET'S START CODING! 🚀**

I'll begin with Day 1, Task 1.1 now.
