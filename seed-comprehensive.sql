-- Stanford Prompt Library - Comprehensive Seed Data
-- Categories, Tags, and Initial Prompts for Elite Academic Work

-- =============================================================================
-- CATEGORIES - Comprehensive Academic & Professional Domains
-- =============================================================================

INSERT INTO public.categories (name, slug, icon, color) VALUES
  -- Academic Research
  ('Research & Academia', 'research-academia', '🔬', '#3b82f6'),
  ('Data Science & ML', 'data-science-ml', '📊', '#10b981'),

  -- Business & Finance
  ('Business Strategy', 'business-strategy', '💼', '#ec4899'),
  ('Finance & Investment', 'finance-investment', '💰', '#f59e0b'),
  ('Consulting', 'consulting', '📈', '#8b5cf6'),

  -- Technical
  ('Software Engineering', 'software-engineering', '💻', '#06b6d4'),
  ('Product & Design', 'product-design', '🎨', '#f97316'),

  -- Professional Writing
  ('Legal & Policy', 'legal-policy', '⚖️', '#64748b'),
  ('Medical & Healthcare', 'medical-healthcare', '🏥', '#ef4444'),

  -- Creative & Communication
  ('Content & Marketing', 'content-marketing', '✍️', '#a855f7'),
  ('Education & Teaching', 'education-teaching', '📚', '#14b8a6'),

  -- Entrepreneurship
  ('Startups & Ventures', 'startups-ventures', '🚀', '#f43f5e'),

  -- General
  ('Career Development', 'career-development', '🎯', '#0ea5e9'),
  ('Academic Writing', 'academic-writing', '📝', '#84cc16')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- COMMON TAGS - Specific Work Products & Use Cases
-- =============================================================================

-- Note: Tags are stored as arrays in the prompts table
-- This is a reference list of recommended tags to use

-- Research & Academic Tags:
-- 'Research Proposal', 'Literature Review', 'Grant Proposal', 'IRB Application',
-- 'Academic Paper', 'Thesis Outline', 'Dissertation Chapter', 'Experimental Design',
-- 'Data Collection', 'Conference Abstract', 'Poster Presentation', 'Peer Review',
-- 'Research Question', 'Hypothesis Generation', 'Methodology', 'Citation Analysis'

-- Business & Finance Tags:
-- 'Investment Analysis', 'Business Plan', 'Market Research', 'Financial Model',
-- 'Pitch Deck', 'Due Diligence', 'Competitive Analysis', 'Strategy Document',
-- 'Case Study', 'Valuation Report', 'Industry Analysis', 'Financial Projection',
-- 'Business Model Canvas', 'Go-to-Market Strategy', 'Pricing Strategy', 'Revenue Model'

-- Consulting Tags:
-- 'Consulting Report', 'SWOT Analysis', 'Stakeholder Analysis', 'Recommendation Memo',
-- 'Client Presentation', 'Problem Framing', 'Executive Summary', 'Decision Framework',
-- 'Impact Assessment', 'Change Management', 'Process Optimization'

-- Technical Tags:
-- 'Technical Specification', 'System Design', 'Code Review', 'API Documentation',
-- 'Architecture Diagram', 'Bug Report', 'Test Plan', 'Performance Analysis',
-- 'Security Audit', 'Patent Application', 'Technical Proposal', 'Database Schema',
-- 'Algorithm Design', 'Code Refactoring', 'DevOps', 'Cloud Architecture'

-- Legal & Policy Tags:
-- 'Policy Brief', 'Legal Memorandum', 'Case Brief', 'Contract Review',
-- 'Regulatory Analysis', 'Legislative Proposal', 'Risk Assessment', 'Compliance Report',
-- 'Legal Research', 'Statutory Interpretation', 'Precedent Analysis', 'Policy Recommendation'

-- Medical & Healthcare Tags:
-- 'Clinical Protocol', 'Case Presentation', 'Diagnosis Report', 'Treatment Plan',
-- 'Medical Literature Review', 'Patient Education', 'Quality Improvement',
-- 'Clinical Trial Design', 'Healthcare Policy', 'Medical Ethics', 'Evidence Summary'

-- Product & Design Tags:
-- 'Product Requirements', 'User Research', 'UX Design', 'Design System',
-- 'Product Roadmap', 'Feature Specification', 'Usability Testing', 'A/B Testing',
-- 'Product Analytics', 'User Story', 'Design Critique', 'Wireframe'

-- Content & Marketing Tags:
-- 'Content Strategy', 'Marketing Copy', 'Brand Voice', 'SEO Optimization',
-- 'Social Media', 'Email Campaign', 'Creative Brief', 'Campaign Strategy',
-- 'Audience Segmentation', 'Messaging Framework', 'Press Release'

-- Data Science Tags:
-- 'Data Analysis', 'Statistical Modeling', 'Machine Learning', 'Data Visualization',
-- 'Predictive Analytics', 'Feature Engineering', 'Model Evaluation', 'Data Pipeline',
-- 'Exploratory Data Analysis', 'Causal Inference', 'Experimental Design', 'A/B Testing'

-- Career & Professional Tags:
-- 'Resume Review', 'Cover Letter', 'Interview Prep', 'Networking Email',
-- 'LinkedIn Profile', 'Portfolio Review', 'Career Transition', 'Salary Negotiation',
-- 'Personal Statement', 'Recommendation Letter', 'Job Application'

-- Education Tags:
-- 'Lesson Plan', 'Course Syllabus', 'Learning Objectives', 'Assessment Design',
-- 'Teaching Philosophy', 'Curriculum Development', 'Student Feedback', 'Rubric Design'

-- General Academic Tags:
-- 'Brainstorming', 'Outline', 'Editing', 'Summarization', 'Translation',
-- 'Proofreading', 'Citation', 'Bibliography', 'Presentation', 'Slide Deck'

-- =============================================================================
-- SAMPLE INITIAL PROMPTS - High Quality Examples
-- =============================================================================

-- Note: You'll need to create a test user first, then use their ID
-- For now, this is a template. Run this after you have your first user.

-- Example usage (replace USER_ID with actual user ID):
/*
INSERT INTO public.prompts (
  user_id,
  title,
  description,
  content,
  category,
  tags,
  status,
  is_public,
  is_initial_prompt
) VALUES

-- Research Proposal Generator
(
  'USER_ID',
  'Research Proposal Generator',
  'Creates comprehensive research proposals following academic standards with clear objectives, methodology, and impact statements.',
  'You are an expert academic advisor helping to develop a research proposal.

Context:
- Research Topic: [INSERT TOPIC]
- Academic Field: [INSERT FIELD]
- Target Audience: [Grant committee/PhD committee/etc.]
- Length: [INSERT LENGTH]

Please create a comprehensive research proposal that includes:

1. **Title**: Concise and descriptive
2. **Abstract** (250 words): Summary of the entire proposal
3. **Introduction**:
   - Background and context
   - Problem statement
   - Research gap
   - Significance of the study
4. **Literature Review**:
   - Current state of knowledge
   - Key theories and frameworks
   - Gaps this research will address
5. **Research Questions/Hypotheses**:
   - Primary research question
   - 2-3 secondary questions
   - Testable hypotheses (if applicable)
6. **Methodology**:
   - Research design
   - Data collection methods
   - Analysis approach
   - Sample size and selection
   - Ethical considerations
7. **Timeline**: Realistic milestones
8. **Expected Outcomes**: Potential impact and contributions
9. **Budget** (if applicable): Major cost categories
10. **References**: Key citations in the field

Make the proposal rigorous, specific, and compelling. Use clear academic language and demonstrate feasibility.',
  'Research & Academia',
  ARRAY['Research Proposal', 'Academic Writing', 'Grant Proposal', 'Methodology'],
  'approved',
  true,
  false
),

-- Investment Analysis Framework
(
  'USER_ID',
  'Investment Analysis Report Builder',
  'Generates detailed investment analysis reports with financial modeling, risk assessment, and recommendation framework.',
  'You are a senior investment analyst creating a comprehensive investment analysis report.

Context:
- Company/Asset: [INSERT NAME]
- Industry: [INSERT INDUSTRY]
- Investment Type: [Equity/Debt/Venture/PE/etc.]
- Investment Thesis: [INSERT BRIEF THESIS]

Create a detailed investment analysis report including:

## Executive Summary
- Investment recommendation (Buy/Hold/Sell or Invest/Pass)
- Key investment highlights (3-5 points)
- Valuation range and expected returns
- Primary risks

## Company Overview
- Business model and value proposition
- Products/services and revenue streams
- Market position and competitive advantages
- Management team quality

## Industry Analysis
- Market size and growth trajectory
- Competitive landscape (Porter''s Five Forces)
- Industry trends and tailwinds/headwinds
- Regulatory environment

## Financial Analysis
- Historical performance (3-5 years)
- Revenue growth and profitability trends
- Key metrics (margins, ROI, cash flow)
- Balance sheet strength
- Comparison to peers

## Valuation
- Methodology (DCF, Comparable, Precedent Transactions)
- Key assumptions and drivers
- Sensitivity analysis
- Price target and expected return

## Investment Risks
- Company-specific risks
- Market and industry risks
- Execution risks
- Risk mitigation strategies

## Investment Recommendation
- Clear recommendation with rationale
- Entry/exit strategy
- Position sizing recommendation
- Key catalysts to monitor

Use quantitative rigor and present data in clear tables. Be objective and highlight both opportunities and risks.',
  'Finance & Investment',
  ARRAY['Investment Analysis', 'Financial Model', 'Due Diligence', 'Valuation Report'],
  'approved',
  true,
  false
),

-- Technical Specification Document
(
  'USER_ID',
  'Technical Specification Document Generator',
  'Creates comprehensive technical specs for software projects with system architecture, API design, and implementation details.',
  'You are a senior software architect creating a technical specification document.

Context:
- Project Name: [INSERT NAME]
- System Type: [Web App/Mobile/API/Microservice/etc.]
- Tech Stack: [INSERT STACK]
- Scale Requirements: [Users/transactions/data volume]

Create a comprehensive technical specification including:

## 1. Overview
- Project purpose and goals
- Key stakeholders
- Success criteria

## 2. System Architecture
- High-level architecture diagram (describe components)
- Technology stack with justification
- Third-party services and integrations
- Deployment architecture

## 3. Functional Requirements
- User stories or use cases
- Core features and workflows
- User interface requirements
- Data flow diagrams

## 4. Technical Requirements
- Performance requirements (latency, throughput)
- Scalability targets
- Security requirements
- Compliance needs (GDPR, HIPAA, etc.)

## 5. API Design
- Endpoint specifications (REST/GraphQL)
- Request/response formats
- Authentication and authorization
- Rate limiting and quotas

## 6. Database Schema
- Entity relationship diagram
- Table structures
- Indexing strategy
- Data migration plan

## 7. Infrastructure
- Server requirements
- Cloud services (AWS/GCP/Azure)
- CDN and caching strategy
- Monitoring and logging

## 8. Security
- Authentication mechanism
- Data encryption (at rest and in transit)
- Input validation and sanitization
- Security audit plan

## 9. Testing Strategy
- Unit testing approach
- Integration testing
- Load testing parameters
- QA process

## 10. Implementation Plan
- Development phases
- Milestones and timeline
- Dependencies and risks
- Rollout strategy

Be specific, use technical terminology appropriately, and consider scalability and maintainability.',
  'Software Engineering',
  ARRAY['Technical Specification', 'System Design', 'Architecture', 'API Documentation'],
  'approved',
  true,
  false
),

-- Consulting Report Framework
(
  'USER_ID',
  'Strategic Consulting Report Builder',
  'Creates McKinsey/BCG-style consulting reports with data-driven insights, strategic recommendations, and implementation roadmap.',
  'You are a management consultant at a top-tier firm creating a strategic recommendation report.

Context:
- Client: [INSERT CLIENT NAME/INDUSTRY]
- Problem Statement: [INSERT PROBLEM]
- Scope: [INSERT SCOPE]
- Timeline: [INSERT TIMELINE]

Create a comprehensive consulting report following this structure:

## Executive Summary (1-2 pages)
- Key findings (3-5 bullets)
- Strategic recommendations (prioritized)
- Expected impact (quantified)
- Implementation timeline

## Situation Analysis
- Current state assessment
- Problem deep-dive
- Root cause analysis
- Data and insights

## Market & Competitive Analysis
- Market dynamics and trends
- Competitive positioning
- Benchmarking against peers
- Opportunities and threats

## Strategic Options
- Option 1: [Name and brief description]
  - Pros and cons
  - Financial impact
  - Implementation complexity
- Option 2: [Continue for 2-4 options]
- Comparative analysis matrix

## Recommended Strategy
- Detailed recommendation with rationale
- Strategic pillars and initiatives
- Expected outcomes (quantified)
- Quick wins vs. long-term plays

## Implementation Roadmap
- Phase 1: Months 1-3
- Phase 2: Months 4-6
- Phase 3: Months 7-12
- Key milestones and deliverables

## Financial Analysis
- Cost-benefit analysis
- ROI projections
- Funding requirements
- Sensitivity analysis

## Risk Assessment
- Implementation risks
- Mitigation strategies
- Contingency plans
- Success factors

## Next Steps
- Immediate actions
- Decision points
- Governance structure
- Tracking metrics

Use the pyramid principle, data-driven insights, and executive-friendly language. Include recommendation for how to track success.',
  'Consulting',
  ARRAY['Consulting Report', 'Strategy Document', 'Recommendation Memo', 'Executive Summary'],
  'approved',
  true,
  false
),

-- Policy Brief Generator
(
  'USER_ID',
  'Policy Brief & Recommendation Builder',
  'Creates evidence-based policy briefs with stakeholder analysis, implementation recommendations, and impact assessment.',
  'You are a policy analyst creating a comprehensive policy brief for decision-makers.

Context:
- Policy Issue: [INSERT ISSUE]
- Jurisdiction: [Federal/State/Local/International]
- Target Audience: [Legislators/Regulators/Executives]
- Urgency: [INSERT TIMELINE]

Create a policy brief following this structure:

## Executive Summary
- Problem statement (2-3 sentences)
- Key recommendations (3-5 bullets)
- Expected impact
- Implementation timeline

## Background & Context
- Historical context
- Current situation
- Why action is needed now
- Affected populations

## Problem Analysis
- Root causes
- Current policy gaps
- Data and evidence
- Stakeholder perspectives

## Policy Options
### Option 1: [Name]
- Description
- Pros and cons
- Cost and feasibility
- Political considerations

### Option 2-3: [Continue]

## Recommended Policy
- Detailed recommendation
- Rationale and evidence base
- Theory of change
- Expected outcomes (quantified)

## Stakeholder Analysis
- Supporters and opponents
- Key influencers
- Coalition-building opportunities
- Opposition management

## Implementation Plan
- Legislative/regulatory pathway
- Key steps and timeline
- Required resources
- Pilot program (if applicable)

## Cost-Benefit Analysis
- Fiscal impact
- Economic benefits
- Social returns
- Comparison to alternatives

## Monitoring & Evaluation
- Success metrics
- Data collection plan
- Evaluation timeline
- Adjustment mechanisms

## Risks & Mitigation
- Implementation risks
- Political risks
- Unintended consequences
- Mitigation strategies

Use evidence-based argumentation, cite relevant research, and maintain objectivity while making clear recommendations.',
  'Legal & Policy',
  ARRAY['Policy Brief', 'Regulatory Analysis', 'Policy Recommendation', 'Impact Assessment'],
  'approved',
  true,
  false
);
*/

-- =============================================================================
-- HELPER QUERIES
-- =============================================================================

-- View all categories
SELECT * FROM public.categories ORDER BY name;

-- View all prompts with their categories
SELECT
  p.title,
  p.category,
  p.tags,
  p.status,
  u.display_name as author
FROM public.prompts p
JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- Count prompts by category
SELECT
  category,
  COUNT(*) as count
FROM public.prompts
WHERE status = 'approved'
GROUP BY category
ORDER BY count DESC;

-- Most used tags
SELECT
  unnest(tags) as tag,
  COUNT(*) as usage_count
FROM public.prompts
WHERE status = 'approved'
GROUP BY tag
ORDER BY usage_count DESC
LIMIT 20;
