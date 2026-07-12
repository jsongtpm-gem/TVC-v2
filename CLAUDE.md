# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is managed via NVM. Always prefix commands with the full path or export PATH first:

```bash
export PATH="/Users/jsong/.nvm/versions/node/v24.14.1/bin:$PATH"
```

```bash
npm run dev        # start Vite dev server
npm run build      # tsc -b && vite build (TypeScript check + bundle)
npm run lint       # eslint
```

**Deploy:** `npm run build && vercel --prod --yes`

There are no tests. Build (`npm run build`) is the type-check gate.

## Architecture

**Stack:** Vite + React 18 SPA, deployed statically to Vercel. All routing via `vercel.json` rewrites to `index.html`.

**Database:** Supabase PostgreSQL (`src/lib/supabase.ts`). All env vars are `VITE_*` prefixed. RLS is enabled on every table: `public_read` policy for SELECT, `admin_write` for everything else (requires `auth.uid() IS NOT NULL`). The anon key is safe to expose — it can only read public data and write when authenticated.

**Auth:** Supabase email/password auth. `RequireAuth` HOC in `App.tsx` guards all `/admin/*` routes by checking `supabase.auth.getSession()`.

**File uploads:** A Cloudflare Worker at `https://tvc-upload.jsong-tpm.workers.dev` proxies uploads to R2. Auth via `X-Upload-Secret` header (`VITE_UPLOAD_SECRET`). Routes: `POST /blog` → `torontotvcblog` bucket, `POST /events` → `torontotvc` bucket. Worker source is in `workers/upload/`. Returns `{ url }` with the public R2 CDN URL.

**Route structure (`App.tsx`):**
- `/` through `/contact` — public pages wrapped in `SiteLayout` (Nav + Footer)
- `/admin/*` — editor pages wrapped in `RequireAuth` + `AdminNav`
- `/events/:id` redirects to `/events` (no individual event pages)

## Key Patterns

**Content pages** fetch from the `content` table keyed by `(page, section)` — e.g. `supabase.from('content').select('section,value').eq('page', 'home')`. Page components convert this to a `Record<string, string>` map.

**Admin editors** follow a consistent pattern:
- Sections collapsed by default, expand on click (CollapseSection pattern)
- `+ New [item]` as a dashed button that expands to a form
- Inline edit: when `editingId === item.id`, render the form in place of the list row
- Each section saves independently

**RichTextEditor** (`src/components/admin/RichTextEditor.tsx`) is uncontrolled after mount. It uses a `hasInitialized` ref to seed content once on first load, then leaves the editor uncontrolled with `onChange` as the output. **Always key it** with a value that changes when switching between edited items (e.g. `<RichTextEditor key={formKey} ...>`) so it remounts and reinitialises. Never feed the `content` prop back in on re-renders.

**Styling:** Tailwind with a custom palette — `burgundy-*`, `gold-*`, `ivory-*`. Body font is Source Serif 4, headings use Playfair Display via CSS variable `--font-playfair`. Rich text content rendered with `.prose-wine` (normal) or `.prose-wine-compact` (board bios) CSS classes defined in `src/index.css`.

## Database Tables

Schema baseline is in `supabase-schema.sql`. Additional columns added via migrations (run in Supabase Dashboard → SQL Editor):

| Table | Notable columns |
|---|---|
| `content` | `page, section, value` — keyed CMS content |
| `events` | `title, date, time, location, description, is_upcoming` |
| `blog_posts` | `title, slug, category, author, excerpt, body, image_url, published_at, is_published, views, likes` |
| `blog_images` | `post_id, url, name, sort_order` — multiple images per post |
| `faqs` | `question, answer, sort_order` |
| `board_members` | `name, role, bio, sort_order, photo` |
| `documents` | PDF files (annual reports, bylaws) with `type, name, url, year` |

**RPC functions** (SECURITY DEFINER, callable by anon):
- `increment_post_views(post_id INTEGER)` — increments `blog_posts.views`
- `update_post_likes(post_id INTEGER, delta INTEGER) RETURNS integer` — increments/decrements `blog_posts.likes`, returns new count

Blog like state is persisted in `localStorage` under key `tvc_liked_posts` (array of post IDs).
