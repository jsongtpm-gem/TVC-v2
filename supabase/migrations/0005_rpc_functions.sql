-- RPC functions used by the public blog page (BlogPost.tsx) to track
-- view counts and likes without requiring an authenticated session.

CREATE OR REPLACE FUNCTION increment_post_views(post_id INTEGER)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE id = post_id;
$$;

CREATE OR REPLACE FUNCTION update_post_likes(post_id INTEGER, delta INTEGER)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts
  SET likes = GREATEST(COALESCE(likes, 0) + delta, 0)
  WHERE id = post_id
  RETURNING likes;
$$;

GRANT EXECUTE ON FUNCTION increment_post_views(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION update_post_likes(INTEGER, INTEGER) TO anon;
