# Opportunities Page - Database Setup Guide

## Overview

The Opportunities page is a sophisticated, modern interface for browsing Stanford AI opportunities. It features a bento-box grid layout, frosted glass UI components, custom SVG icons, and advanced animations.

## Database Setup

### Prerequisites

- Supabase project with admin access
- Existing `users` table (referenced by foreign keys)

### Installation Steps

#### 1. Create Tables and Functions

Run the schema file to create all necessary database objects:

```sql
-- Run this file in Supabase SQL Editor
-- File: app/database/opportunities-schema.sql
```

This creates:
- ✅ `opportunities` table (main opportunities data)
- ✅ `opportunity_saves` table (user bookmarks)
- ✅ Database triggers (auto-update timestamps and counts)
- ✅ RPC functions (increment_opportunity_clicks, increment_opportunity_views)
- ✅ Row-Level Security policies
- ✅ Search indexes (full-text search support)

#### 2. Seed Sample Data

Populate the database with 20+ real Stanford AI opportunities:

```sql
-- Run this file in Supabase SQL Editor
-- File: app/database/seed-opportunities.sql
```

This creates:
- 3 Featured opportunities (2x2 cards):
  - HAI Policy Fellowship
  - StartX Accelerator
  - TreeHacks 2025
- Fellowships: HAI Graduate Fellowship, SAIL Postdocs, Digital Economy Lab, Embedded Ethics
- Research: HAI RA positions, CRFM collaborations, SAIL research groups
- Internships: AIMI Summer Research
- Startups: CS+Social Good Fellowship
- Clubs: Stanford AI Club, Stanford ACM MLab, AI Salon
- Teaching: Code in Place, Stanford AI4ALL
- Courses: Biodesign for Digital Health, AI & Access to Justice

#### 3. Verify Installation

Check that tables were created successfully:

```sql
-- Verify opportunities table
SELECT COUNT(*) as total_opportunities,
       COUNT(*) FILTER (WHERE status = 'featured') as featured,
       COUNT(*) FILTER (WHERE status = 'active') as active
FROM opportunities;

-- Should return: total_opportunities: 20+, featured: 3, active: 17+
```

## Database Schema

### `opportunities` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| title | TEXT | Opportunity title (5-200 chars) |
| description | TEXT | Full description (min 50 chars) |
| category | TEXT | fellowship, research, internship, teaching, competition, startup, club, course |
| organization | TEXT | Organization name (e.g., "Stanford HAI") |
| location | TEXT | Location (e.g., "Stanford, CA", "Remote") |
| url | TEXT | External link (must start with http/https) |
| tags | TEXT[] | Array of tags for filtering |
| status | TEXT | active, coming_soon, closed, featured |
| card_size | TEXT | 1x1, 2x1, 1x2, 2x2 (bento grid size) |
| gradient | TEXT | purple-blue, blue-cyan, green-teal, orange-red, pink-purple |
| icon | TEXT | Icon name from icon library |
| priority | INTEGER | Sort order (higher = shown first) |
| views_count | INTEGER | Auto-incremented view counter |
| saves_count | INTEGER | Auto-incremented save counter |
| clicks_count | INTEGER | Auto-incremented click counter |
| deadline | TIMESTAMPTZ | Application deadline (nullable) |
| posted_at | TIMESTAMPTZ | When opportunity was posted |
| created_at | TIMESTAMPTZ | Record creation time |
| updated_at | TIMESTAMPTZ | Auto-updated on changes |
| is_public | BOOLEAN | Visibility flag (default: true) |
| search_vector | TSVECTOR | Full-text search index (auto-generated) |

### `opportunity_saves` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| user_id | UUID | Foreign key to users.id |
| opportunity_id | UUID | Foreign key to opportunities.id |
| created_at | TIMESTAMPTZ | When user saved the opportunity |

**Unique constraint**: (user_id, opportunity_id) - prevents duplicate saves

## Security & Permissions

### Row-Level Security (RLS)

**Opportunities Table:**
- ✅ Public read access for all opportunities where `is_public = true`
- ✅ Admin-only write access (create, update, delete)

**Opportunity Saves Table:**
- ✅ Users can only view their own saves
- ✅ Users can only create/delete their own saves
- ✅ No access to other users' bookmarks

### RPC Function Permissions

- `increment_opportunity_clicks(UUID)` - Authenticated users only
- `increment_opportunity_views(UUID)` - Authenticated users only

## Adding New Opportunities

### Via SQL (Admin)

```sql
INSERT INTO opportunities (
  title,
  description,
  category,
  organization,
  location,
  url,
  tags,
  status,
  card_size,
  gradient,
  icon,
  priority,
  deadline
) VALUES (
  'New Fellowship',
  'This is a detailed description of at least 50 characters...',
  'fellowship',
  'Stanford University',
  'Stanford, CA',
  'https://example.stanford.edu',
  ARRAY['AI', 'research', 'summer'],
  'active',
  '1x1',
  'purple-blue',
  'graduation-cap',
  80,
  '2025-06-30'::timestamptz
);
```

### Via Admin Panel (Coming Soon)

The admin panel will provide a visual interface for creating and managing opportunities.

## Categories and Icons

### Available Categories

| Category | Label | Default Icon |
|----------|-------|--------------|
| fellowship | Fellowships | graduation-cap |
| research | Research | beaker |
| internship | Internships | briefcase |
| teaching | Teaching | book-open |
| competition | Competitions | trophy |
| startup | Startups | rocket |
| club | Clubs | users-group |
| course | Courses | book-open |

### Available Icons

All icons use 2px stroke weight for consistency:

- **Opportunities**: briefcase, graduation-cap, lightbulb, users-group, rocket, globe, trophy, book-open, beaker, code, sparkles
- **Status**: clock, check-badge, fire, star
- **Actions**: arrow-right, external-link, bell, bookmark, x, search, filter

### Available Gradients

- `purple-blue`: #A855F7 → #3B82F6 (default for fellowships)
- `blue-cyan`: #3B82F6 → #06B6D4 (research/tech)
- `green-teal`: #10B981 → #14B8A6 (social good/environment)
- `orange-red`: #F97316 → #EF4444 (urgent/competitive)
- `pink-purple`: #EC4899 → #A855F7 (creative/design)

## Features

### User Features

- ✅ **Browse Opportunities**: Bento grid layout with varied card sizes
- ✅ **Search**: Full-text search across title, description, organization, tags
- ✅ **Filter by Category**: 8 categories with visual filter buttons
- ✅ **Bookmark Opportunities**: Save opportunities for later (requires sign-in)
- ✅ **View Details**: Click card to open opportunity in new tab
- ✅ **Track Analytics**: Automatic view and click tracking
- ✅ **Deadline Alerts**: Visual indicators for upcoming deadlines

### Visual Features

- ✅ **Frosted Glass Effects**: Backdrop blur and transparency
- ✅ **Animated Dot Grid Background**: Sine wave animation
- ✅ **Cursor Glow Effect**: Follows mouse movement
- ✅ **Scroll-Triggered Reveals**: Cards animate in with 100ms stagger
- ✅ **Hover Effects**: 4px lift, layered shadows, gradient intensification
- ✅ **Animated Border Glow**: Gradient border on hover
- ✅ **Toast Notifications**: Slide-in notifications for saves/errors

### Accessibility

- ✅ **Reduced Motion Support**: Respects prefers-reduced-motion
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Focus Indicators**: Clear focus states with purple outline
- ✅ **High Contrast Mode**: Enhanced borders for better visibility
- ✅ **Screen Reader Support**: Semantic HTML and ARIA labels

## API Reference

### Service Layer Functions

```javascript
// Fetch opportunities with filters
import { getOpportunities } from './services/opportunities.js'

const opportunities = await getOpportunities({
  category: 'fellowship',  // Optional: filter by category
  status: 'featured',      // Optional: filter by status
  limit: 50,               // Optional: max results (default: 50)
  featured: false          // Optional: featured only
})

// Get featured opportunities
const featured = await getFeaturedOpportunities() // Returns 3 featured

// Get single opportunity by ID
const opportunity = await getOpportunityById('uuid-here')

// Search opportunities
const results = await searchOpportunities('AI policy', 20)

// Toggle bookmark (save/unsave)
const result = await toggleOpportunitySave('opportunity-uuid')
// Returns: { saved: boolean, message: string }

// Check if opportunity is saved
const isSaved = await isOpportunitySaved('opportunity-uuid')

// Get user's saved opportunities
const saved = await getUserSavedOpportunities()

// Track click (analytics)
await trackOpportunityClick('opportunity-uuid')
```

### Admin Functions

```javascript
// Create new opportunity (admin only)
const result = await createOpportunity({
  title: 'New Opportunity',
  description: 'Description here...',
  category: 'fellowship',
  organization: 'Stanford',
  // ... other fields
})

// Update opportunity (admin only)
const result = await updateOpportunity('uuid', {
  status: 'featured',
  priority: 100
})

// Delete opportunity (admin only)
const result = await deleteOpportunity('uuid')
```

## Rollback

If you need to remove all opportunities-related database objects:

```sql
-- Run this file in Supabase SQL Editor
-- File: app/database/rollback-opportunities.sql
```

This safely removes:
- Triggers: update_saves_count, set_opportunities_updated_at
- Functions: All opportunity-related functions
- Tables: opportunity_saves, opportunities (with CASCADE)

**Note**: Existing tables (users, prompts, etc.) are **not affected** by rollback.

## Troubleshooting

### "No opportunities found"

1. Check database connection: Verify Supabase credentials in `.env`
2. Run seed script: `app/database/seed-opportunities.sql`
3. Check RLS policies: Ensure `is_public = true` for opportunities
4. Check browser console for errors

### "Please sign in to save opportunities"

- Expected behavior for unauthenticated users
- Bookmarking requires Supabase authentication
- Sign in via the application's auth flow

### Search not working

1. Verify `search_vector` column exists
2. Check that GIN index is created: `idx_opportunities_search`
3. Ensure `textSearch()` is supported by your Supabase version

### Cards not animating

1. Check if user has `prefers-reduced-motion` enabled
2. Verify `initBentoGrid()` is called after rendering
3. Check browser console for JavaScript errors

## Performance Optimization

### Database Indexes

All necessary indexes are created automatically:
- `idx_opportunities_status` - For status filtering
- `idx_opportunities_category` - For category filtering
- `idx_opportunities_priority` - For sorting
- `idx_opportunities_search` - For full-text search (GIN index)
- `idx_opportunities_posted_at` - For date sorting
- `idx_opportunities_deadline` - For deadline queries

### Query Optimization

- Limit results to 50 by default
- Use specific category filters to reduce data transfer
- Search uses optimized full-text search (tsvector)
- Bulk save status checks reduce roundtrips

### Frontend Optimization

- CSS: 41.18 kB (8.39 kB gzipped)
- JS: 366.78 kB (90.47 kB gzipped)
- Lazy loading for images (if added)
- Scroll-triggered reveals reduce initial animation load

## Future Enhancements

- [ ] Admin panel for CRUD operations
- [ ] Email notifications for upcoming deadlines
- [ ] Advanced filtering (tags, location, deadline range)
- [ ] Sorting options (date, popularity, deadline)
- [ ] Export saved opportunities to calendar
- [ ] Share opportunities via link
- [ ] Opportunity recommendations based on profile
- [ ] Application tracking integration

## Support

For issues or questions:
1. Check browser console (F12) for errors
2. Verify database setup with SQL verification queries
3. Review Supabase logs for RLS policy issues
4. Check that all migration files were run in order

## Credits

- Design: Inspired by modern bento-box layouts and macOS Big Sur
- Icons: Custom SVG icons with 2px stroke weight
- Data: Real Stanford AI opportunities (HAI, SAIL, StartX, etc.)
- Framework: Vanilla JavaScript with Supabase backend
