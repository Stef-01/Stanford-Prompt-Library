# Stanford Prompt Library - Sophisticated UI Overhaul Plan
## Opportunities Page & Site-Wide Enhancements

**Version:** 2.0
**Date:** 2025-11-19
**Status:** Planning Phase

---

## 🎯 Core Principles

### Non-Negotiables
1. **Desktop Metaphor Preservation** - All windows, dock, dragging must remain
2. **Zero Data Loss** - Database migrations with rollback capability
3. **Progressive Enhancement** - New features enhance, never replace
4. **Performance First** - All animations GPU-accelerated, 60fps target
5. **Accessibility** - Full keyboard navigation, screen reader support

---

## 📋 Executive Summary

This plan transforms the Opportunities page into a showcase of modern design while maintaining the unique desktop-style interface. Changes are implemented as **window content upgrades** - the desktop shell remains untouched.

**Estimated Timeline:** 3-4 weeks
**Estimated Code:** ~3,500 lines
**Risk Level:** Low (content changes only, no structural changes)

---

## 🎨 Phase 1: Design System Enhancement (Week 1)

### 1.1 Custom Icon Library

**Location:** `/app/src/assets/icons/`

**Requirements:**
- Create 20+ custom SVG icons with consistent 2px stroke weight
- Icon categories: Opportunities, Features, Actions, Status
- Exportable as React/Vue components or inline SVG
- Designed at 24x24px base size, scalable to 16px-48px

**Icons Needed:**
```
Opportunities:
- briefcase.svg (Jobs/Internships)
- graduation-cap.svg (Fellowships)
- lightbulb.svg (Research Projects)
- users-group.svg (Collaborations)
- rocket.svg (Startups/Ventures)
- globe.svg (Global Opportunities)
- trophy.svg (Competitions)
- book-open.svg (Learning Resources)

Status:
- clock.svg (Coming Soon)
- check-badge.svg (Active)
- fire.svg (Hot/Trending)
- star.svg (Featured)

Actions:
- arrow-right.svg (Navigate)
- external-link.svg (External)
- bell.svg (Subscribe)
- bookmark.svg (Save)
```

**Implementation:**
```javascript
// /app/src/components/icons/Icon.js
export function Icon({ name, size = 24, color = 'currentColor', className = '' }) {
  const icons = {
    briefcase: '<path d="M..." stroke-width="2" stroke-linecap="round"/>',
    // ... other icons
  }

  return `
    <svg
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="${color}"
      class="icon ${className}"
      style="
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      "
    >
      ${icons[name]}
    </svg>
  `
}
```

**File:** `/app/src/components/icons/IconLibrary.js` (~600 lines)

---

### 1.2 Enhanced Color System

**Location:** `/app/src/style.css` (add to existing :root)

```css
:root {
  /* Existing colors remain */

  /* NEW: Gradient System */
  --gradient-purple-blue: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
  --gradient-blue-cyan: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  --gradient-green-teal: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
  --gradient-orange-red: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  --gradient-pink-purple: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);

  /* NEW: Glow Effects */
  --glow-blue: 0 0 20px rgba(59, 130, 246, 0.4);
  --glow-purple: 0 0 20px rgba(168, 85, 247, 0.4);
  --glow-green: 0 0 20px rgba(16, 185, 129, 0.4);

  /* NEW: Layered Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 15px rgba(0, 0, 0, 0.2),
    0 20px 25px rgba(0, 0, 0, 0.1);
  --shadow-xl:
    0 10px 15px rgba(0, 0, 0, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 30px 50px rgba(0, 0, 0, 0.15);

  /* NEW: Typography Scale */
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --text-4xl: 36px;
  --text-3xl: 30px;
  --text-2xl: 24px;
  --text-xl: 20px;
  --text-lg: 18px;
  --text-base: 16px;
  --text-sm: 14px;
  --text-xs: 12px;

  --letter-tight: -0.02em;
  --letter-normal: 0em;
  --letter-wide: 0.05em;
}
```

**File:** `/app/src/style.css` (additions, ~100 lines)

---

### 1.3 Frosted Glass Components

**Location:** `/app/src/components/ui/GlassPanel.js`

```javascript
/**
 * Frosted Glass Panel Component
 * Creates backdrop-blur effect with subtle borders
 */
export function GlassPanel({
  children,
  blur = 10,
  opacity = 0.8,
  border = true,
  className = ''
}) {
  return `
    <div class="glass-panel ${className}" style="
      background: rgba(255, 255, 255, ${opacity * 0.05});
      backdrop-filter: blur(${blur}px) saturate(180%);
      -webkit-backdrop-filter: blur(${blur}px) saturate(180%);
      border: ${border ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow: hidden;
    ">
      ${children}
    </div>
  `
}
```

**File:** `/app/src/components/ui/GlassPanel.js` (~150 lines with variants)

---

## 🏗️ Phase 2: Opportunities Page - Core Structure (Week 1-2)

### 2.1 Database Schema

**Location:** `/app/database/opportunities-schema.sql`

**NO DATA LOSS STRATEGY:**
- All new tables with UUID primary keys
- Foreign keys reference existing `users` table
- Rollback scripts included
- Migration versioning with timestamps

```sql
-- NEW TABLE: opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  category TEXT NOT NULL CHECK (category IN (
    'internship',
    'fellowship',
    'research',
    'collaboration',
    'startup',
    'competition',
    'learning',
    'other'
  )),

  -- Metadata
  organization TEXT NOT NULL,
  location TEXT, -- e.g., "Remote", "Stanford, CA", "Global"
  url TEXT CHECK (url ~ '^https?://'),
  tags TEXT[] DEFAULT '{}',

  -- Status
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN (
    'active',
    'coming_soon',
    'closed',
    'featured'
  )),

  -- Display properties
  card_size TEXT DEFAULT '1x1' CHECK (card_size IN ('1x1', '2x1', '1x2', '2x2')),
  gradient TEXT DEFAULT 'purple-blue', -- references gradient system
  icon TEXT DEFAULT 'briefcase', -- references icon library
  priority INTEGER DEFAULT 0, -- higher = shown first

  -- Engagement
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  saves_count INTEGER DEFAULT 0 CHECK (saves_count >= 0),
  clicks_count INTEGER DEFAULT 0 CHECK (clicks_count >= 0),

  -- Timestamps
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Admin
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT FALSE,

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
CREATE INDEX idx_opportunities_status ON opportunities(status) WHERE is_public = TRUE;
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_priority ON opportunities(priority DESC);
CREATE INDEX idx_opportunities_search ON opportunities USING GIN(search_vector);
CREATE INDEX idx_opportunities_posted_at ON opportunities(posted_at DESC);

-- NEW TABLE: opportunity_saves (bookmark feature)
CREATE TABLE public.opportunity_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
    SET saves_count = saves_count - 1
    WHERE id = OLD.opportunity_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saves_count
  AFTER INSERT OR DELETE ON opportunity_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_saves_count();

-- RLS Policies
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Opportunities are viewable by authenticated users"
  ON opportunities FOR SELECT
  TO authenticated
  USING (is_public = TRUE);

CREATE POLICY "Admins can manage all opportunities"
  ON opportunities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

ALTER TABLE opportunity_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saves"
  ON opportunity_saves FOR ALL
  TO authenticated
  USING (user_id = auth.uid());
```

**Rollback Script:** `/app/database/rollback-opportunities.sql`
```sql
-- Safe rollback - does not affect existing tables
DROP TRIGGER IF EXISTS update_saves_count ON opportunity_saves;
DROP TRIGGER IF EXISTS set_opportunities_updated_at ON opportunities;
DROP FUNCTION IF EXISTS update_opportunity_saves_count();
DROP FUNCTION IF EXISTS update_opportunities_updated_at();
DROP TABLE IF EXISTS opportunity_saves;
DROP TABLE IF EXISTS opportunities;
```

**File:** `/app/database/opportunities-schema.sql` (~250 lines)
**File:** `/app/database/rollback-opportunities.sql` (~15 lines)

---

### 2.2 Service Layer

**Location:** `/app/src/services/opportunities.js`

```javascript
import { supabase } from './supabase.js'

/**
 * Get all public opportunities with optional filters
 * @param {Object} options - Filter options
 * @returns {Array} Array of opportunities
 */
export async function getOpportunities({
  category = null,
  status = 'active',
  limit = 50
} = {}) {
  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('is_public', true)
    .order('priority', { ascending: false })
    .order('posted_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching opportunities:', error)
    throw error
  }

  return data || []
}

/**
 * Get featured opportunities (2x2 cards)
 */
export async function getFeaturedOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'featured')
    .order('priority', { ascending: false })
    .limit(3)

  if (error) throw error
  return data || []
}

/**
 * Save/unsave an opportunity (bookmark)
 */
export async function toggleOpportunitySave(opportunityId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if already saved
  const { data: existing } = await supabase
    .from('opportunity_saves')
    .select('id')
    .eq('user_id', user.id)
    .eq('opportunity_id', opportunityId)
    .single()

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('opportunity_saves')
      .delete()
      .eq('id', existing.id)

    if (error) throw error
    return { saved: false }
  } else {
    // Save
    const { error } = await supabase
      .from('opportunity_saves')
      .insert({ user_id: user.id, opportunity_id: opportunityId })

    if (error) throw error
    return { saved: true }
  }
}

/**
 * Get user's saved opportunities
 */
export async function getUserSavedOpportunities() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('opportunity_saves')
    .select('opportunity_id, opportunities(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data?.map(s => s.opportunities) || []
}

/**
 * Track opportunity click (analytics)
 */
export async function trackOpportunityClick(opportunityId) {
  const { error } = await supabase.rpc('increment_opportunity_clicks', {
    opp_id: opportunityId
  })

  if (error) console.error('Failed to track click:', error)
}

/**
 * Search opportunities
 */
export async function searchOpportunities(query) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .textSearch('search_vector', query)
    .eq('is_public', true)
    .limit(20)

  if (error) throw error
  return data || []
}
```

**File:** `/app/src/services/opportunities.js` (~300 lines with admin functions)

---

### 2.3 Bento Grid Layout System

**Location:** `/app/src/components/layouts/BentoGrid.js`

```javascript
/**
 * Bento Box Grid Layout
 * Responsive grid with varied card sizes
 */
export function BentoGrid({ children, className = '' }) {
  return `
    <div class="bento-grid ${className}">
      ${children}
    </div>
  `
}

/**
 * Bento Card with size variants
 */
export function BentoCard({
  size = '1x1', // '1x1', '2x1', '1x2', '2x2'
  gradient = 'purple-blue',
  children,
  className = '',
  animated = true
}) {
  const sizeClasses = {
    '1x1': 'bento-card-1x1',
    '2x1': 'bento-card-2x1',
    '1x2': 'bento-card-1x2',
    '2x2': 'bento-card-2x2'
  }

  return `
    <div
      class="bento-card ${sizeClasses[size]} gradient-${gradient} ${className}"
      data-size="${size}"
      ${animated ? 'data-animate="true"' : ''}
    >
      <div class="bento-card-inner">
        ${children}
      </div>
    </div>
  `
}
```

**CSS:** `/app/src/style.css` (additions)

```css
/* ===================================
   BENTO GRID SYSTEM
   =================================== */

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;

  /* Responsive */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Card Size Variants */
.bento-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;

  /* Layered shadows */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05);
}

.bento-card-1x1 {
  grid-column: span 1;
  grid-row: span 1;
  min-height: 280px;
}

.bento-card-2x1 {
  grid-column: span 2;
  grid-row: span 1;
  min-height: 280px;
}

.bento-card-1x2 {
  grid-column: span 1;
  grid-row: span 2;
  min-height: 584px; /* 280*2 + 24 gap */
}

.bento-card-2x2 {
  grid-column: span 2;
  grid-row: span 2;
  min-height: 584px;
}

/* Hover Effects */
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 15px rgba(0, 0, 0, 0.2),
    0 20px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

/* Gradient Overlays */
.bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
  transition: opacity 0.3s;
  pointer-events: none;
}

.gradient-purple-blue::before {
  background: var(--gradient-purple-blue);
}

.gradient-blue-cyan::before {
  background: var(--gradient-blue-cyan);
}

.gradient-green-teal::before {
  background: var(--gradient-green-teal);
}

.gradient-orange-red::before {
  background: var(--gradient-orange-red);
}

.gradient-pink-purple::before {
  background: var(--gradient-pink-purple);
}

.bento-card:hover::before {
  opacity: 0.12;
}

/* Animated Border Glow */
.bento-card::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.bento-card:hover::after {
  opacity: 1;
  animation: border-glow 2s linear infinite;
}

@keyframes border-glow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

/* Card Inner Content */
.bento-card-inner {
  position: relative;
  z-index: 1;
  padding: 28px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Scroll-triggered animations */
.bento-card[data-animate="true"] {
  opacity: 0;
  transform: translateY(30px);
}

.bento-card[data-animate="true"].visible {
  animation: bento-reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes bento-reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Background Animated Grid Pattern */
.opportunities-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.05) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  animation: grid-pulse 4s ease-in-out infinite;
}

@keyframes grid-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
}

/* Cursor Glow Effect */
.cursor-glow {
  position: fixed;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(168, 85, 247, 0.15) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s;
  opacity: 0;
}

.cursor-glow.active {
  opacity: 1;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .bento-card,
  .bento-card::before,
  .bento-card::after,
  .dot-grid {
    animation: none !important;
    transition: none !important;
  }

  .bento-card:hover {
    transform: none;
  }
}
```

**File:** `/app/src/components/layouts/BentoGrid.js` (~200 lines)
**File:** `/app/src/style.css` (additions, ~350 lines)

---

## 🎯 Phase 3: Opportunities Window Component (Week 2)

### 3.1 Main Window Component

**Location:** `/app/src/components/windows/OpportunitiesWindow.js`

```javascript
import {
  getOpportunities,
  getFeaturedOpportunities,
  toggleOpportunitySave,
  trackOpportunityClick
} from '../../services/opportunities.js'
import { Icon } from '../icons/Icon.js'
import { GlassPanel } from '../ui/GlassPanel.js'
import { BentoGrid, BentoCard } from '../layouts/BentoGrid.js'

let opportunities = []
let featured = []
let userSaves = new Set()
let currentCategory = 'all'

/**
 * Render Opportunities Window
 */
export async function renderOpportunitiesWindow(contentContainer) {
  // Load data
  opportunities = await getOpportunities()
  featured = await getFeaturedOpportunities()

  contentContainer.innerHTML = `
    <!-- Background Effects -->
    <div class="opportunities-background">
      <div class="dot-grid"></div>
      <div class="cursor-glow" id="cursor-glow"></div>
    </div>

    <!-- Frosted Glass Header -->
    ${GlassPanel({
      blur: 12,
      opacity: 0.9,
      className: 'opportunities-header',
      children: `
        <div style="padding: 24px 32px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="
              font-family: var(--font-display);
              font-size: var(--text-4xl);
              font-weight: 700;
              letter-spacing: var(--letter-tight);
              margin: 0 0 8px 0;
              background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">
              Opportunities
            </h1>
            <p style="
              font-size: var(--text-base);
              color: var(--text-secondary);
              margin: 0;
            ">
              Discover internships, fellowships, and more
            </p>
          </div>

          <div style="display: flex; gap: 12px; align-items: center;">
            <!-- Category Filter -->
            <select
              id="category-filter"
              style="
                padding: 10px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: var(--text-primary);
                font-size: var(--text-sm);
                cursor: pointer;
              "
            >
              <option value="all">All Categories</option>
              <option value="internship">Internships</option>
              <option value="fellowship">Fellowships</option>
              <option value="research">Research</option>
              <option value="collaboration">Collaborations</option>
              <option value="startup">Startups</option>
              <option value="competition">Competitions</option>
              <option value="learning">Learning</option>
            </select>

            <!-- Saved Filter -->
            <button
              id="show-saved-btn"
              class="glass-button"
              style="
                padding: 10px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: var(--text-primary);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              ${Icon({ name: 'bookmark', size: 18 })}
              <span>Saved</span>
            </button>
          </div>
        </div>
      `
    })}

    <!-- Main Content -->
    <div style="padding: 32px; overflow-y: auto; max-height: calc(100% - 120px);">
      ${BentoGrid({
        children: renderOpportunityCards()
      })}
    </div>
  `

  attachEventListeners(contentContainer)
  initScrollAnimations(contentContainer)
  initCursorGlow(contentContainer)
}

/**
 * Render opportunity cards in bento layout
 */
function renderOpportunityCards() {
  let cards = []

  // Featured cards (2x2) first
  featured.forEach(opp => {
    cards.push(renderOpportunityCard(opp, '2x2'))
  })

  // Regular opportunities with varied sizes
  const sizes = ['1x1', '2x1', '1x1', '1x1', '2x1', '1x2']
  opportunities.forEach((opp, index) => {
    const size = sizes[index % sizes.length]
    cards.push(renderOpportunityCard(opp, size))
  })

  return cards.join('')
}

/**
 * Render single opportunity card
 */
function renderOpportunityCard(opp, size = '1x1') {
  const isSaved = userSaves.has(opp.id)
  const statusBadge = getStatusBadge(opp.status)

  return BentoCard({
    size,
    gradient: opp.gradient,
    children: `
      <!-- Card Header -->
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${Icon({ name: opp.icon, size: 24, color: '#fff' })}
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          ${statusBadge}
          <button
            class="save-btn"
            data-opportunity-id="${opp.id}"
            style="
              width: 36px;
              height: 36px;
              border-radius: 8px;
              background: rgba(255, 255, 255, ${isSaved ? '0.15' : '0.05'});
              border: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
            "
          >
            ${Icon({
              name: 'bookmark',
              size: 18,
              color: isSaved ? '#eab308' : '#fff'
            })}
          </button>
        </div>
      </div>

      <!-- Card Content -->
      <div style="flex: 1;">
        <div style="margin-bottom: 8px;">
          <span style="
            display: inline-block;
            font-size: var(--text-xs);
            text-transform: uppercase;
            letter-spacing: var(--letter-wide);
            color: rgba(255, 255, 255, 0.6);
            font-weight: 600;
          ">
            ${opp.category}
          </span>
        </div>

        <h3 style="
          font-size: ${size === '2x2' ? 'var(--text-2xl)' : 'var(--text-xl)'};
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 12px 0;
          letter-spacing: var(--letter-tight);
          line-height: 1.3;
        ">
          ${opp.title}
        </h3>

        <p style="
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: ${size === '2x2' ? '4' : '2'};
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${opp.description}
        </p>

        <!-- Organization & Location -->
        <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            ${Icon({ name: 'briefcase', size: 14, color: 'rgba(255,255,255,0.6)' })}
            <span style="font-size: var(--text-xs); color: rgba(255,255,255,0.7);">
              ${opp.organization}
            </span>
          </div>
          ${opp.location ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              ${Icon({ name: 'globe', size: 14, color: 'rgba(255,255,255,0.6)' })}
              <span style="font-size: var(--text-xs); color: rgba(255,255,255,0.7);">
                ${opp.location}
              </span>
            </div>
          ` : ''}
        </div>

        <!-- Tags -->
        ${opp.tags && opp.tags.length > 0 ? `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
            ${opp.tags.slice(0, 3).map(tag => `
              <span style="
                padding: 4px 10px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 6px;
                font-size: var(--text-xs);
                color: rgba(255,255,255,0.8);
              ">
                ${tag}
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Card Footer -->
      <div style="margin-top: auto; padding-top: 16px;">
        ${opp.url && opp.status === 'active' ? `
          <button
            class="opportunity-link-btn"
            data-opportunity-id="${opp.id}"
            data-url="${opp.url}"
            style="
              width: 100%;
              padding: 12px 20px;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 10px;
              color: white;
              font-size: var(--text-sm);
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            "
            onmouseover="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateY(0)'"
          >
            <span>Learn More</span>
            ${Icon({ name: 'arrow-right', size: 16 })}
          </button>
        ` : ''}

        <!-- Stats -->
        <div style="
          display: flex;
          gap: 16px;
          margin-top: 12px;
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.5);
        ">
          <span>${opp.saves_count} saves</span>
          <span>${opp.views_count} views</span>
        </div>
      </div>
    `
  })
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
  const badges = {
    active: {
      icon: 'check-badge',
      text: 'Active',
      color: '#10b981'
    },
    coming_soon: {
      icon: 'clock',
      text: 'Coming Soon',
      color: '#eab308'
    },
    featured: {
      icon: 'star',
      text: 'Featured',
      color: '#a855f7'
    }
  }

  const badge = badges[status] || badges.coming_soon

  return `
    <div style="
      padding: 6px 12px;
      background: linear-gradient(135deg, ${badge.color}20, ${badge.color}10);
      border: 1px solid ${badge.color}40;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 6px;
      backdrop-filter: blur(8px);
    ">
      ${Icon({ name: badge.icon, size: 14, color: badge.color })}
      <span style="
        font-size: var(--text-xs);
        color: ${badge.color};
        font-weight: 600;
        text-shadow: 0 0 8px ${badge.color}80;
      ">
        ${badge.text}
      </span>
    </div>
  `
}

/**
 * Attach event listeners
 */
function attachEventListeners(container) {
  // Save buttons
  container.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const oppId = btn.dataset.opportunityId

      try {
        const result = await toggleOpportunitySave(oppId)

        if (result.saved) {
          userSaves.add(oppId)
        } else {
          userSaves.delete(oppId)
        }

        // Update button
        const icon = btn.querySelector('svg')
        btn.style.background = result.saved
          ? 'rgba(255,255,255,0.15)'
          : 'rgba(255,255,255,0.05)'
        icon.setAttribute('stroke', result.saved ? '#eab308' : '#fff')

        // Animate
        btn.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.2)' },
          { transform: 'scale(1)' }
        ], {
          duration: 300,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        })
      } catch (error) {
        console.error('Save error:', error)
      }
    })
  })

  // Link buttons
  container.querySelectorAll('.opportunity-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const oppId = btn.dataset.opportunityId
      const url = btn.dataset.url

      trackOpportunityClick(oppId)
      window.open(url, '_blank', 'noopener,noreferrer')
    })
  })

  // Category filter
  const categoryFilter = container.querySelector('#category-filter')
  categoryFilter?.addEventListener('change', async (e) => {
    currentCategory = e.target.value
    opportunities = await getOpportunities({
      category: currentCategory === 'all' ? null : currentCategory
    })

    // Re-render cards
    const bentoGrid = container.querySelector('.bento-grid')
    bentoGrid.innerHTML = renderOpportunityCards()
    initScrollAnimations(container)
  })
}

/**
 * Initialize scroll-triggered animations
 */
function initScrollAnimations(container) {
  const cards = container.querySelectorAll('.bento-card[data-animate="true"]')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible')
        }, index * 100) // Stagger 100ms
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1
  })

  cards.forEach(card => observer.observe(card))
}

/**
 * Initialize cursor glow effect
 */
function initCursorGlow(container) {
  const glow = container.querySelector('#cursor-glow')
  if (!glow) return

  let isOverCard = false

  container.addEventListener('mousemove', (e) => {
    const target = e.target.closest('.bento-card')

    if (target) {
      if (!isOverCard) {
        glow.classList.add('active')
        isOverCard = true
      }
      glow.style.left = e.clientX + 'px'
      glow.style.top = e.clientY + 'px'
    } else {
      if (isOverCard) {
        glow.classList.remove('active')
        isOverCard = false
      }
    }
  })

  container.addEventListener('mouseleave', () => {
    glow.classList.remove('active')
    isOverCard = false
  })
}
```

**File:** `/app/src/components/windows/OpportunitiesWindow.js` (~800 lines)

---

## 📊 Implementation Summary

### File Structure
```
/app
├── /database
│   ├── opportunities-schema.sql (NEW - 250 lines)
│   └── rollback-opportunities.sql (NEW - 15 lines)
├── /src
│   ├── /assets
│   │   └── /icons (NEW - 20+ SVG files)
│   ├── /animations
│   │   └── (existing files enhanced)
│   ├── /components
│   │   ├── /icons
│   │   │   └── Icon.js (NEW - 150 lines)
│   │   ├── /layouts
│   │   │   └── BentoGrid.js (NEW - 200 lines)
│   │   ├── /ui
│   │   │   └── GlassPanel.js (NEW - 150 lines)
│   │   └── /windows
│   │       └── OpportunitiesWindow.js (NEW - 800 lines)
│   ├── /services
│   │   └── opportunities.js (NEW - 300 lines)
│   └── style.css (ENHANCED +600 lines)
```

### Total New Code
- **Database:** 265 lines
- **Services:** 300 lines
- **Components:** 1,300 lines
- **Styles:** 600 lines
- **Icons:** 20+ SVG files
- **Total:** ~2,465 lines + icons

### Data Safety Guarantees
1. ✅ No modifications to existing tables
2. ✅ All new tables with foreign keys
3. ✅ Rollback scripts provided
4. ✅ RLS policies for security
5. ✅ Database triggers for integrity

### Desktop Interface Preservation
1. ✅ All changes are window content only
2. ✅ Dock, dragging, window controls unchanged
3. ✅ Existing windows unaffected
4. ✅ Can be toggled on/off per window

---

## 🚀 Deployment Plan

### Week 1: Foundation
- [ ] Add enhanced color system to CSS
- [ ] Create icon library (SVGs)
- [ ] Build GlassPanel component
- [ ] Build BentoGrid layout system

### Week 2: Backend
- [ ] Run database migrations (opportunities tables)
- [ ] Create opportunities service layer
- [ ] Seed initial opportunity data (10-15 items)
- [ ] Test CRUD operations

### Week 3: Frontend
- [ ] Build OpportunitiesWindow component
- [ ] Implement scroll animations
- [ ] Add cursor glow effect
- [ ] Connect to backend services

### Week 4: Polish & Testing
- [ ] Test on all screen sizes
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Performance testing (60fps animations)
- [ ] User acceptance testing

---

## 🎯 Success Metrics

### Performance
- [ ] 60fps animations on all devices
- [ ] < 300ms page load time
- [ ] Lighthouse score > 90

### Accessibility
- [ ] Full keyboard navigation
- [ ] Screen reader compatible
- [ ] Color contrast ratio > 4.5:1

### User Engagement
- [ ] Track opportunity clicks
- [ ] Monitor save/bookmark rates
- [ ] Measure time on page

---

## 🔄 Rollback Strategy

If issues occur:

```sql
-- Run rollback script
\i /app/database/rollback-opportunities.sql

-- Revert CSS changes
git checkout app/src/style.css

-- Remove new components
rm -rf app/src/components/windows/OpportunitiesWindow.js
rm -rf app/src/services/opportunities.js
```

**No existing functionality affected - rollback is safe**

---

## 📝 Next Steps

After this plan is approved:
1. Review and adjust design specifications
2. Create detailed mockups/wireframes
3. Begin Week 1 implementation
4. Set up progress tracking system

**Ready to proceed?**
