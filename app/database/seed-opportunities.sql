-- =====================================================
-- OPPORTUNITIES SEED DATA
-- Real Stanford AI opportunities
-- =====================================================

-- Clear existing data (safe - only affects opportunities table)
TRUNCATE opportunities CASCADE;

-- Featured Opportunities (2x2 cards)
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority, deadline) VALUES

-- Featured #1: HAI Policy Fellowship
(
  'HAI Policy Fellowship',
  'Fully funded summer fellowship for graduate students to gain hands-on experience in AI policy. Bridge cutting-edge AI research with public policy challenges in Washington D.C. and California. Work alongside leading policymakers and researchers to shape the future of AI governance.',
  'fellowship',
  'Stanford HAI',
  'Washington D.C. & California',
  'https://hai.stanford.edu/policy/student-opportunities',
  ARRAY['policy', 'graduate', 'fully-funded', 'AI governance', 'summer'],
  'featured',
  '2x2',
  'purple-blue',
  'graduation-cap',
  100,
  '2025-05-09'::timestamptz
),

-- Featured #2: StartX Accelerator
(
  'StartX Accelerator',
  'Premier equity-free accelerator for Stanford-affiliated founders. Access 1,800+ mentors, $1.2M+ in perks and resources, 4+ assigned mentors per startup. Build your AI company while receiving unparalleled support from Silicon Valley''s top minds. Zero equity taken.',
  'startup',
  'StartX',
  'Stanford & Remote',
  'https://www.startx.com',
  ARRAY['entrepreneurship', 'accelerator', 'equity-free', 'mentorship', 'startup'],
  'featured',
  '2x2',
  'orange-red',
  'rocket',
  95,
  NULL
),

-- Featured #3: TreeHacks 2025
(
  'TreeHacks 2025',
  'Largest collegiate hackathon in the U.S. featuring AI prizes: $5k Edge AI Prize, 6-month Tesla Model 3/Y w/ FSD, $7k Best Agents Hack, NVIDIA Jetson kits. Focus on VLMs, robotics, computer vision, edge AI, and AI agents. Open to college students worldwide.',
  'competition',
  'TreeHacks',
  'Stanford, CA',
  'https://treehacks-2025.devpost.com',
  ARRAY['hackathon', 'prizes', 'AI agents', 'robotics', 'computer vision'],
  'active',
  '2x2',
  'pink-purple',
  'trophy',
  90,
  '2025-02-15'::timestamptz
);

-- Regular Fellowships (varied sizes)
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority, deadline) VALUES

(
  'HAI Graduate Fellowship',
  '3-quarter program fostering collaboration between engineers, social scientists, humanists, and others. $1,000 per quarter compensation. Participate in bi-weekly seminars with HAI faculty, guest speakers, HAI postdocs, and cohort members.',
  'fellowship',
  'Stanford HAI',
  'Stanford, CA',
  'https://hai.stanford.edu/research/fellowship-programs',
  ARRAY['interdisciplinary', 'graduate', 'seminars', 'academic year'],
  'active',
  '2x1',
  'purple-blue',
  'graduation-cap',
  85,
  '2025-05-09'::timestamptz
),

(
  'SAIL Postdoctoral Fellows',
  'Two-year funded postdoc positions in AI research across robotics, statistical ML, generative AI, reinforcement learning, computer vision, NLP, genomics, healthcare, and societal impact. PhD must be completed before fellowship start.',
  'fellowship',
  'Stanford SAIL',
  'Stanford, CA',
  'https://hai.stanford.edu/research/fellowship-programs',
  ARRAY['postdoc', 'research', 'AI', 'machine learning', '2-year'],
  'active',
  '2x1',
  'blue-cyan',
  'beaker',
  80,
  '2025-12-15'::timestamptz
),

(
  'Digital Economy Lab Postdoc',
  'Full-time research position at intersection of economics and transformative AI. Led by Professor Erik Brynjolfsson. Salary $85,000-$88,000. Focus on economic theories, metrics, and policies for AI-powered future.',
  'fellowship',
  'Stanford Digital Economy Lab',
  'Stanford, CA',
  'https://digitaleconomy.stanford.edu/about/full-time-postdoctoral-associate/',
  'ARRAY[''economics'', ''AI policy'', ''postdoc'', ''research'', ''full-time''],
  'active',
  '1x1',
  'green-teal',
  'briefcase',
  75,
  '2025-01-31'::timestamptz
),

(
  'Embedded Ethics Fellowship',
  'Fellowship integrating ethics into CS curriculum. 9-10 week program for undergrad/grad students. Work with CS faculty and graduate students to create ethics modules. Joint program with HAI and McCoy Family Center for Ethics in Society.',
  'fellowship',
  'Stanford HAI',
  'Stanford, CA',
  'https://hai.stanford.edu/research/fellowship-programs',
  ARRAY['ethics', 'curriculum design', 'teaching', 'CS education'],
  'active',
  '1x1',
  'purple-blue',
  'book-open',
  70,
  NULL
);

-- Research & Internships
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority) VALUES

(
  'HAI Research Assistant Positions',
  'Multiple specialized RA opportunities across AI Index (research & data collection), Digital Economy Lab (AI & Future of Work), RAISE Health (Responsible AI for healthcare), and Data Science & Analytics. Support cutting-edge AI research at Stanford.',
  'research',
  'Stanford HAI',
  'Stanford, CA',
  'https://hai.stanford.edu/research/research-opportunities',
  ARRAY['research assistant', 'data collection', 'AI Index', 'healthcare AI'],
  'active',
  '2x1',
  'blue-cyan',
  'lightbulb',
  65
),

(
  'AIMI Summer Research Internship',
  'Two-week virtual program for high school students (June 17-28). Team-based hands-on research projects in AI healthcare, lectures, mentoring from Stanford researchers. Free program, no prior experience required. 9am-12pm PST daily.',
  'internship',
  'Stanford AIMI',
  'Remote',
  'https://aimi.stanford.edu/education/summer-research-internship',
  ARRAY['high school', 'healthcare AI', 'virtual', 'free', 'summer'],
  'active',
  '1x1',
  'green-teal',
  'beaker',
  60
),

(
  'SAIL Research Groups',
  'Undergraduate research opportunities in Computer Vision, NLP, Reinforcement Learning, Robotics, Human-Centered AI, and Computational Cognitive Science labs. Contact individual labs and faculty directly for positions.',
  'research',
  'Stanford SAIL',
  'Stanford, CA',
  'https://ai.stanford.edu/research-groups/',
  ARRAY['undergraduate', 'research', 'computer vision', 'NLP', 'robotics'],
  'active',
  '1x1',
  'blue-cyan',
  'beaker',
  55
),

(
  'CRFM Research Collaborations',
  'Interdisciplinary research on foundation models. Research opportunities across 10+ departments including law, music, robotics, and biomedicine. Focus on technical foundations, beneficial applications, societal impact, and AI policy.',
  'research',
  'Stanford CRFM',
  'Stanford, CA',
  'https://crfm.stanford.edu',
  ARRAY['foundation models', 'interdisciplinary', 'research', 'LLMs'],
  'active',
  '2x1',
  'purple-blue',
  'lightbulb',
  50
);

-- Startup & Innovation
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority, deadline) VALUES

(
  'CS+Social Good Fellowship',
  'Funded fellowship to work with organizations using tech for social issues. $7,000 base stipend (financial aid available). 9 consecutive weeks, 35+ hours/week. Partners include Accountability Counsel and Recidiviz. Self-designed and pre-arranged placements.',
  'fellowship',
  'Stanford SOLO',
  'Remote & Various',
  'https://solo.stanford.edu/programs/cssocial-good-fellowship',
  ARRAY['social impact', 'tech for good', 'funded', 'summer', 'fellowship'],
  'active',
  '2x1',
  'green-teal',
  'users-group',
  45,
  NULL
),

(
  'HAI Seed Research Grants',
  '$2.37M total funding across 32 interdisciplinary teams. Faculty from all seven Stanford schools and 31+ departments. $10,000 additional funding for projects with public policy component. Topics: organizational culture, AI for science, cybersecurity, healthcare.',
  'research',
  'Stanford HAI',
  'Stanford, CA',
  'https://hai.stanford.edu/news/stanford-hai-funds-groundbreaking-ai-research-projects',
  ARRAY['grants', 'funding', 'interdisciplinary', 'research', 'policy'],
  'active',
  '1x1',
  'orange-red',
  'lightbulb',
  40
);

-- Student Clubs & Organizations
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority) VALUES

(
  'Stanford AI Club',
  'Premier AI club featuring Nonprofit Organization Project (ML for nonprofits), workshops, student research support, speaker series with industry leaders, Hacky Hours with sponsored API credits, and weekly reading groups.',
  'club',
  'Stanford AI Club',
  'Stanford, CA',
  'https://aiclub.stanford.edu',
  ARRAY['student club', 'workshops', 'nonprofits', 'networking', 'weekly'],
  'active',
  '1x1',
  'blue-cyan',
  'users-group',
  35
),

(
  'Stanford ACM MLab',
  'Stanford''s premier machine learning club. Intensive fall workshop followed by research project work. Published 6 papers at top conferences (ACL, ICLR). Alumni at Google AI, Stanford ML Group, VMWare. Fall 2024: 30 teams with 94 participants.',
  'club',
  'Stanford ACM',
  'Stanford, CA',
  'https://www.stanfordacm.org/mlab',
  ARRAY['machine learning', 'research', 'publications', 'workshops', 'student club'],
  'active',
  '1x1',
  'purple-blue',
  'code',
  30
),

(
  'AI Salon',
  'Bi-weekly discussion event for AI Lab community. High-level AI/ML topics in Enlightenment-style salon (no electronics/whiteboard). Fridays 4-5pm with refreshments. Open to all Stanford students, postdocs, faculty. Topics: AI & Government, Climate, Medicine.',
  'club',
  'Stanford SAIL',
  'Gates CS 219, Stanford',
  'https://ai.stanford.edu/events/ai-salon/',
  ARRAY['discussion', 'networking', 'interdisciplinary', 'weekly', 'community'],
  'active',
  '1x1',
  'pink-purple',
  'users-group',
  25
);

-- Teaching & Education
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority, deadline) VALUES

(
  'Code in Place Section Leader',
  'Volunteer teaching opportunity for introductory Python programming (CS106A). 2+ hours per week. Open to anyone who knows first half of CS106A material. Training provided on computer science education. 30,000+ students have taken the course.',
  'teaching',
  'Stanford Code in Place',
  'Remote',
  'https://codeinplace.stanford.edu',
  ARRAY['teaching', 'volunteer', 'Python', 'education', 'remote'],
  'active',
  '1x1',
  'green-teal',
  'book-open',
  20,
  '2025-04-04'::timestamptz
),

(
  'Stanford AI4ALL',
  'Two-week online program to increase inclusion in AI for rising 9th-graders. Free program featuring mentorship from Stanford graduate students, career workshops, social events. Earn Stanford AI4ALL Certificate of Achievement. Focus on ethical AI and tech for social good.',
  'teaching',
  'Stanford AI4ALL',
  'Remote',
  'https://hai.stanford.edu/stanford-ai4all',
  ARRAY['high school', 'free', 'diversity', 'ethics', 'certificate'],
  'active',
  '2x1',
  'pink-purple',
  'graduation-cap',
  15
);

-- Courses
INSERT INTO opportunities (title, description, category, organization, location, url, tags, status, card_size, gradient, icon, priority) VALUES

(
  'Biodesign for Digital Health',
  'Ten-week course teaching need-driven innovation in digital health. Lectures, panel discussions, breakout sessions with 50+ industry experts. Student teams work on actual digital health challenges. Final presentations with project extension funding.',
  'course',
  'Stanford Biodesign',
  'Stanford, CA',
  'https://med.stanford.edu/biodesign/programs/stanford-courses/biodesign-for-digital-health.html',
  ARRAY['digital health', 'innovation', 'design thinking', 'healthcare'],
  'active',
  '1x1',
  'blue-cyan',
  'beaker',
  10
),

(
  'AI & Access to Justice (LAW 809E)',
  'Legal Innovation through Frontier Technology Lab. 3-credit course where teams work on AI tools for legal aid, courts, and bar associations. Partners with ABA, Legal Aid Society. Projects: AI for demand letters, housing intake, eviction support.',
  'course',
  'Stanford Law School',
  'Stanford, CA',
  'https://justiceinnovation.law.stanford.edu/projects/ai-access-to-justice/',
  ARRAY['law', 'legal tech', 'AI for good', 'access to justice', '3 credits'],
  'active',
  '2x1',
  'purple-blue',
  'book-open',
  5
);

-- Success message
SELECT 'Opportunities seeded successfully!' AS status,
       COUNT(*) AS total_opportunities,
       COUNT(*) FILTER (WHERE status = 'featured') AS featured,
       COUNT(*) FILTER (WHERE status = 'active') AS active
FROM opportunities;
