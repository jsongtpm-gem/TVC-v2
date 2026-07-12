-- Baseline schema. Mirrors supabase-schema.sql at the repo root.
-- Run this first on any new (e.g. staging) Supabase project via SQL Editor.

CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  value TEXT,
  UNIQUE(page, section)
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  description TEXT,
  is_upcoming BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  excerpt TEXT,
  body TEXT,
  published_at DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT true
);

CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE board_members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  sort_order INTEGER DEFAULT 0,
  photo TEXT
);

-- RLS: public reads, authenticated writes
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON content FOR SELECT USING (true);
CREATE POLICY "admin_write" ON content FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "public_read" ON events FOR SELECT USING (true);
CREATE POLICY "admin_write" ON events FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "public_read" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "admin_write" ON blog_posts FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "public_read" ON faqs FOR SELECT USING (true);
CREATE POLICY "admin_write" ON faqs FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "public_read" ON board_members FOR SELECT USING (true);
CREATE POLICY "admin_write" ON board_members FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed default content
INSERT INTO content (page, section, value) VALUES
  ('home','hero_title','Welcome to the Toronto Vintners Club'),
  ('home','hero_subtitle','A community of passionate wine lovers exploring the world one bottle at a time.'),
  ('home','about_blurb','Since our founding, the Toronto Vintners Club has brought together enthusiasts, collectors, and connoisseurs to share a love of fine wine. Through monthly tastings, educational events, and spirited conversation, we celebrate the craft and culture of winemaking.'),
  ('home','cta_text','Become a Member'),
  ('home','cta_subtext','Join a community of discerning wine lovers in the heart of Toronto.'),
  ('about','hero_title','About the Toronto Vintners Club'),
  ('about','history_title','Our History'),
  ('about','history_body','<p>The Toronto Vintners Club was established by a small group of wine enthusiasts who wished to explore the world of wine in a structured, collegial setting. What began as informal gatherings in living rooms has grown into one of the city''s most respected wine societies.</p>'),
  ('about','mission_title','Our Mission'),
  ('about','mission_body','<p>To foster a deep appreciation of fine wine through education, tasting, and fellowship. We welcome members of all experience levels — from the curious newcomer to the seasoned collector — united by a genuine passion for wine.</p>'),
  ('membership','hero_title','Membership'),
  ('membership','intro','<p>Membership in the Toronto Vintners Club offers access to an exceptional calendar of wine tastings, educational seminars, and social events.</p>'),
  ('membership','benefits_title','Member Benefits'),
  ('membership','benefits_body','<ul><li>Priority access to all monthly tastings and special events</li><li>Access to member-only wine purchasing opportunities</li><li>Annual wine cellar tour and harvest dinner</li><li>Subscription to our quarterly newsletter</li></ul>'),
  ('membership','tiers_title','Membership Tiers'),
  ('membership','tiers_body','<p>We offer individual and joint memberships. Annual dues are reviewed each year by the Board. Please contact us for current rates and availability.</p>'),
  ('membership','how_to_join','<p>Membership is open to any adult with a sincere interest in wine. Prospective members are encouraged to attend a tasting as a guest before applying.</p>'),
  ('events','hero_title','Events'),
  ('events','intro','Join us for our upcoming tastings, dinners, and wine education evenings.'),
  ('blog','hero_title','News & Tastings'),
  ('blog','intro','Reflections, tasting notes, and updates from the Toronto Vintners Club.'),
  ('faqs','hero_title','Frequently Asked Questions'),
  ('contact','hero_title','Contact Us'),
  ('contact','address','218 Walmer Road, Toronto, ON M5R 3R7'),
  ('contact','phone','+1 (416) 209-1442'),
  ('contact','email','info@torontovintners.org'),
  ('contact','intro','We welcome your enquiries. Please reach out by email or telephone, and a member of our executive will respond promptly.');

INSERT INTO faqs (question, answer, sort_order) VALUES
  ('How do I become a member?','<p>Prospective members are encouraged to attend a tasting as a guest of an existing member. Following this introduction, you may submit a membership application to the Membership Committee.</p>',1),
  ('How often does the club meet?','<p>The Club typically holds monthly tasting events from September through June, along with a summer social and the annual member dinner.</p>',2),
  ('Do I need to be an expert in wine to join?','<p>Not at all. Our membership spans the full spectrum of experience, from enthusiastic beginners to seasoned collectors.</p>',3),
  ('What is the annual membership fee?','<p>Annual dues are set by the Board of Directors and reviewed each year. Please contact us directly for current rates.</p>',4),
  ('Are guests permitted at events?','<p>Members may bring guests to selected events where capacity allows. Please contact the Club secretary to confirm guest policy for a specific event.</p>',5);

INSERT INTO board_members (name, role, bio, sort_order) VALUES
  ('[Name]','Board President','<p>Placeholder — update via Admin panel.</p>',1),
  ('[Name]','Vice-President','<p>Placeholder — update via Admin panel.</p>',2),
  ('[Name]','Secretary','<p>Placeholder — update via Admin panel.</p>',3),
  ('[Name]','Treasurer','<p>Placeholder — update via Admin panel.</p>',4);
