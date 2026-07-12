-- Adds columns used by BlogEditor/BlogPost/BlogCard that were previously
-- applied ad hoc via the Supabase Dashboard and never captured in a migration.

ALTER TABLE blog_posts
  ADD COLUMN author TEXT,
  ADD COLUMN image_url TEXT,
  ADD COLUMN views INTEGER DEFAULT 0,
  ADD COLUMN likes INTEGER DEFAULT 0;
