-- Additional images per blog post (BlogEditor.tsx, BlogPost.tsx).
-- Falls back to blog_posts.image_url when no rows exist for a post.

CREATE TABLE blog_images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON blog_images FOR SELECT USING (true);
CREATE POLICY "admin_write" ON blog_images FOR ALL USING (auth.uid() IS NOT NULL);
