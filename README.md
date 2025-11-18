# Stanford Prompt Library - Live Wiki

A collaborative platform for Stanford students to share, discover, and rank AI prompts.

![Status](https://img.shields.io/badge/status-planning-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-Supabase%20%7C%20Vite%20%7C%20Vercel-blueviolet)

---

## 🎯 Overview

The Stanford Prompt Library is a community-driven wiki where Stanford students can:
- **Share** their best AI prompts with the community
- **Discover** high-quality prompts across various categories
- **Rank** prompts through an upvote system
- **Compete** on leaderboards for top contributors
- **Learn** from prompt engineering courses and tutorials

---

## 📚 Documentation

This repository contains comprehensive planning and implementation documentation:

### 1. [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) - Master Plan
**70+ pages** of detailed technical specifications including:
- Complete architecture overview
- Full database schema with all tables, indexes, and relationships
- Row-level security policies
- Authentication implementation (Google OAuth with Stanford restriction)
- All CRUD operations and business logic
- Search and filtering systems
- Upvote/like mechanisms
- Leaderboard calculations
- Backup and disaster recovery strategies
- Performance optimization
- Security hardening
- Deployment procedures
- Cost estimations
- Launch checklist

**Start here** for understanding the complete system architecture.

### 2. [CRITICAL_APPRAISAL.md](./CRITICAL_APPRAISAL.md) - Risk Analysis
**30+ pages** analyzing potential vulnerabilities:
- Architecture weaknesses and mitigations
- Data integrity safeguards
- Security hardening measures
- Performance deep dives
- Disaster recovery procedures
- Edge cases and corner cases
- Cost optimization strategies
- Pre-launch checklist

**Read this** to understand potential risks and how they're mitigated.

### 3. [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Quick Start
**Step-by-step implementation guide** covering:
- Supabase project setup
- Database migration procedures
- Frontend configuration
- Service implementations
- Component creation
- Testing procedures
- Deployment steps
- Monitoring setup
- Troubleshooting guide

**Use this** as your daily reference during implementation.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Vite)                    │
│  ┌────────────┬──────────────┬──────────────────┐  │
│  │ Components │   Services   │   State Mgmt     │  │
│  │            │              │                  │  │
│  │ - Windows  │ - Auth       │ - User Session   │  │
│  │ - Cards    │ - Prompts    │ - App State      │  │
│  │ - Forms    │ - Likes      │ - Cache          │  │
│  │ - Search   │ - Leaderboard│                  │  │
│  └────────────┴──────────────┴──────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────┐
│              Supabase Backend (Cloud)                │
│  ┌─────────────────────────────────────────────┐   │
│  │           PostgreSQL Database               │   │
│  │  - Users, Prompts, Likes, Categories       │   │
│  │  - Full-text search with indexes           │   │
│  │  - Row Level Security (RLS)                │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │        Authentication (Google OAuth)        │   │
│  │  - Stanford email verification              │   │
│  │  - Session management                       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │          Storage (Images & Backups)         │   │
│  │  - Prompt example images                    │   │
│  │  - User avatars                             │   │
│  │  - Automated backups                        │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │         Edge Functions (Serverless)         │   │
│  │  - Health checks                            │   │
│  │  - Scheduled tasks                          │   │
│  │  - Custom API endpoints                     │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔐 Authentication
- **Google Sign-In** with Stanford email restriction
- Email domain validation at multiple layers
- Secure session management
- Profile creation and management

### 📝 Prompt Management
- **CRUD operations** with full validation
- **Markdown editor** for rich content
- **Image uploads** for examples
- **Tag system** for categorization
- **Category organization**
- **Soft deletes** for data preservation

### 🔍 Search & Discovery
- **Full-text search** with PostgreSQL
- **Tag filtering** (multiple tags supported)
- **Category filtering**
- **Use-case filtering**
- **Sort by**: Newest, Most Liked, Most Viewed
- **Fuzzy search** for typo tolerance

### ❤️ Social Features
- **Upvote/Like system** with real-time counters
- **Favorites** for bookmarking
- **User profiles** with statistics
- **Activity feeds**
- **Following system** (future)

### 🏆 Leaderboards
- **Top contributors** ranked by:
  - Prompts submitted (1x weight)
  - Likes received (2x weight)
- **Time filters**: All-time, Monthly, Weekly
- **Materialized views** for performance
- **Auto-refresh** every 5 minutes

### 📋 Export & Sharing
- **Copy to clipboard** functionality
- **Export as Markdown** files
- **Share links** (future)
- **API access** (future)

---

## 🗄️ Database Schema

### Core Tables
```
users (10 fields)
├── id, email, display_name, avatar_url
├── total_prompts, total_likes_received
├── reputation_score, followers_count
└── created_at, updated_at

prompts (15 fields)
├── id, user_id, title, content
├── category, tags[], description
├── likes_count, views_count, copies_count
├── is_public, is_featured, is_deleted
└── created_at, updated_at, deleted_at

likes (4 fields)
├── id, user_id, prompt_id
└── created_at

categories (7 fields)
├── id, name, slug, description
├── icon, color, prompts_count
└── created_at

+ favorites, comments, views, tags
```

See [DEPLOYMENT_PLAN.md Section 2](./DEPLOYMENT_PLAN.md#2-database-schema-design) for complete schema.

---

## 🔒 Security Features

### Multi-Layer Security
1. **Authentication Layer**
   - Google OAuth with Stanford domain (hd=stanford.edu)
   - Email verification required
   - Session timeout and refresh

2. **Database Layer**
   - Row Level Security (RLS) on all tables
   - Stanford email check constraint
   - Input validation triggers
   - Foreign key constraints

3. **Application Layer**
   - Content sanitization (DOMPurify)
   - XSS prevention
   - SQL injection prevention
   - Rate limiting

4. **Network Layer**
   - HTTPS/SSL encryption
   - CORS configuration
   - Content Security Policy

See [CRITICAL_APPRAISAL.md Section 3](./CRITICAL_APPRAISAL.md#3-security-hardening) for security details.

---

## 📊 Data Persistence Strategy

### Permanent Data Preservation
1. **Soft Deletes Only**
   - No hard deletes allowed (enforced by trigger)
   - Deleted data marked with `is_deleted = TRUE`
   - Retains data integrity for analytics

2. **Multi-Layer Backups**
   - **Daily**: Automated Supabase backups
   - **Weekly**: External S3 backups
   - **Monthly**: Long-term archival
   - **Point-in-time recovery**: 7 days

3. **Database Constraints**
   - Foreign key constraints prevent orphaned data
   - Check constraints ensure data validity
   - Unique constraints prevent duplicates

4. **Audit Trail**
   - `created_at` timestamp on all records
   - `updated_at` auto-updated on changes
   - `version` field for prompt updates

See [DEPLOYMENT_PLAN.md Section 5](./DEPLOYMENT_PLAN.md#5-data-persistence--backup-strategy) for backup details.

---

## 🚀 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + Vanilla JS | Fast development, simple deployment |
| **Styling** | TailwindCSS | Responsive, modern UI |
| **Backend** | Supabase | Database, Auth, Storage, Realtime |
| **Database** | PostgreSQL | Robust, full-text search, RLS |
| **Auth** | Google OAuth | Secure, Stanford-only access |
| **Storage** | Supabase Storage | Images, backups, user uploads |
| **Hosting** | Vercel | Serverless, auto-scaling, CDN |
| **Monitoring** | Sentry | Error tracking, performance |
| **Analytics** | Custom | User behavior, engagement metrics |

---

## 💰 Cost Estimate

### Initial Setup (Monthly)
- **Supabase Pro**: $25/month
  - 8GB database
  - 250GB bandwidth
  - 250GB storage
  - Daily backups
  - 99.9% SLA

- **Vercel** (Optional Pro): $20/month
  - Unlimited bandwidth
  - Analytics
  - Custom domain

- **Cloudflare** (Free tier): $0/month
  - CDN
  - DDoS protection

**Total: $25-45/month initially**

### Scaling Costs
- Database: Upgrade Supabase plan as needed ($60-99/mo for more resources)
- Storage: Additional storage at $0.021/GB/month
- Bandwidth: Additional bandwidth at $0.09/GB

See [DEPLOYMENT_PLAN.md Section 12](./DEPLOYMENT_PLAN.md#12-cost-estimation) for detailed cost analysis.

---

## 📅 Implementation Timeline

### Phase 1: Setup (Week 1-2)
- Supabase project creation
- Database schema implementation
- OAuth configuration
- RLS policies

### Phase 2: Development (Week 3-6)
- Frontend refactoring
- Authentication flow
- CRUD operations
- Search & filtering
- Social features

### Phase 3: Testing (Week 7-8)
- Unit tests
- Integration tests
- E2E tests
- Load testing
- Security audit

### Phase 4: Deployment (Week 9)
- Production setup
- Domain configuration
- Monitoring setup
- Soft launch

### Phase 5: Launch (Week 10)
- Public announcement
- User onboarding
- Feedback collection

**Total: 10 weeks from start to public launch**

---

## ✅ Pre-Launch Checklist

```
Infrastructure
✓ Supabase project configured
✓ Production environment variables set
✓ Custom domain with SSL
✓ CDN configured
✓ Backups tested

Security
✓ RLS policies enabled
✓ Stanford email validation working
✓ Rate limiting tested
✓ Content sanitization verified
✓ Security audit completed

Features
✓ Authentication working
✓ CRUD operations tested
✓ Search functioning
✓ Like/unlike system operational
✓ Leaderboard accurate

Performance
✓ Page load < 2s
✓ API response < 200ms
✓ Load testing passed
✓ Mobile responsive

Monitoring
✓ Error tracking configured
✓ Analytics setup
✓ Uptime monitoring
✓ Alerts tested

Legal
✓ Privacy policy
✓ Terms of service
✓ GDPR compliance
```

See [DEPLOYMENT_PLAN.md Section 13](./DEPLOYMENT_PLAN.md#13-launch-checklist) for complete checklist.

---

## 🛠️ Development Setup

### Prerequisites
```bash
Node.js >= 18
npm >= 9
Git
Supabase account
Google Cloud account (for OAuth)
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/stanford/prompt-library.git
cd prompt-library

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Open http://localhost:5173
```

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed setup.

---

## 📖 API Documentation

### Authentication
```javascript
// Sign in with Google
POST /auth/v1/authorize
  ?provider=google
  &hd=stanford.edu
  &redirect_to=https://prompts.stanford.edu

// Sign out
POST /auth/v1/logout
```

### Prompts
```javascript
// Get all prompts
GET /rest/v1/prompts
  ?is_public=eq.true
  &is_deleted=eq.false
  &order=created_at.desc

// Create prompt
POST /rest/v1/prompts
  {
    "title": "...",
    "content": "...",
    "category": "...",
    "tags": [...]
  }

// Like prompt
POST /rest/v1/likes
  {
    "prompt_id": "...",
    "user_id": "..."
  }
```

Full API documentation available via Supabase auto-generated docs.

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test auth.test.js

# Run E2E tests
npm run test:e2e

# Load testing
k6 run tests/load/basic.js
```

See [IMPLEMENTATION_GUIDE.md Phase 5](./IMPLEMENTATION_GUIDE.md#phase-5-testing-week-5-6) for testing guide.

---

## 🚦 Deployment

### Production Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Verify deployment
curl https://prompts.stanford.edu/health
```

### Environment Variables
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_APP_URL=https://prompts.stanford.edu
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

See [IMPLEMENTATION_GUIDE.md Phase 6](./IMPLEMENTATION_GUIDE.md#phase-6-deployment-week-7) for deployment guide.

---

## 📊 Monitoring & Analytics

### Key Metrics
- **User Growth**: Daily active users, signups
- **Content**: Prompts submitted, categories distribution
- **Engagement**: Likes, favorites, copies
- **Performance**: Page load time, API latency
- **Errors**: Error rate, failed requests

### Dashboards
- Supabase Dashboard: Database metrics
- Vercel Analytics: Frontend performance
- Sentry: Error tracking and alerts
- Custom Dashboard: Business metrics

---

## 🤝 Contributing

This project is currently in planning phase. Contributions will be welcome after initial launch.

### Future Contribution Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

- **Project Lead**: TBD
- **Backend Developer**: TBD
- **Frontend Developer**: TBD
- **UI/UX Designer**: TBD

---

## 📞 Support

For questions or issues:
- Email: [email protected]
- GitHub Issues: [Create an issue](https://github.com/stanford/prompt-library/issues)
- Documentation: See files in this repository

---

## 🗺️ Roadmap

### V1.0 (Launch) - Week 10
- ✅ Core features (auth, CRUD, search, likes)
- ✅ Leaderboards
- ✅ Basic UI/UX

### V1.1 - Month 2-3
- Comments/discussions
- Prompt versioning
- Email notifications
- Admin dashboard

### V2.0 - Month 4-6
- AI-powered suggestions
- Collaborative editing
- Team/organization features
- Browser extension

### V3.0 - Month 7+
- Advanced analytics
- API for integrations
- Premium features
- Mobile app

---

## 🌟 Acknowledgments

- Stanford University for hosting
- Supabase for backend infrastructure
- Vercel for hosting platform
- Open source community

---

**Built with ❤️ at Stanford University**

For detailed implementation instructions, see:
- [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) - Complete architecture
- [CRITICAL_APPRAISAL.md](./CRITICAL_APPRAISAL.md) - Risk analysis
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Step-by-step guide
