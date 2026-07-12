import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BlogCard from '../../components/BlogCard'

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ArticleImage({ url }: { url: string }) {
  return <img src={url} alt="" className="w-full object-cover rounded-sm" style={{ maxHeight: '480px' }} />
}

const LIKED_KEY = 'tvc_liked_posts'
function getLikedPosts(): number[] {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]') } catch { return [] }
}

function ShareBar({ title, liked, likeCount, liking, onLike }: {
  title: string; liked: boolean; likeCount: number; liking: boolean; onLike: () => void
}) {
  const [copied, setCopied] = useState(false)
  const url = window.location.href

  function share(platform: string) {
    const links: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const btnCls = "text-burgundy-700/40 hover:text-burgundy-700 transition-colors"

  return (
    <div className="border-t border-b border-gold-300/30 py-4 flex items-center justify-between">
      <div className="flex items-center gap-5">
        {/* Facebook */}
        <button onClick={() => share('facebook')} className={btnCls} title="Share on Facebook">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </button>
        {/* X / Twitter */}
        <button onClick={() => share('x')} className={btnCls} title="Share on X">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>
        {/* LinkedIn */}
        <button onClick={() => share('linkedin')} className={btnCls} title="Share on LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </button>
        {/* Copy link */}
        <button onClick={copyLink} className={copied ? 'text-burgundy-700 transition-colors' : btnCls} title="Copy link">
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </button>
      </div>

      {/* Like button */}
      <button
        onClick={onLike}
        disabled={liking}
        className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
          liked ? 'text-burgundy-700' : 'text-burgundy-700/40 hover:text-burgundy-600'
        }`}>
        <HeartIcon filled={liked} />
        <span className="tabular-nums">{likeCount}</span>
      </button>
    </div>
  )
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)
  const [images, setImages] = useState<{ url: string }[]>([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const [recentPosts, setRecentPosts] = useState<any[]>([])

  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/blog'); return }
        setPost(data)
        setLikeCount(data.likes ?? 0)
        setLiked(getLikedPosts().includes(data.id))
        supabase.rpc('increment_post_views', { post_id: data.id }).then()
        supabase.from('blog_images').select('url').eq('post_id', data.id).order('sort_order')
          .then(({ data: imgs }) => { if (imgs) setImages(imgs) })
        supabase.from('blog_posts').select('*').eq('is_published', true)
          .neq('id', data.id).order('published_at', { ascending: false }).limit(3)
          .then(({ data: recent }) => { if (recent) setRecentPosts(recent) })
      })
  }, [slug])

  async function toggleLike() {
    if (!post || liking) return
    setLiking(true)
    const delta = liked ? -1 : 1
    const likedPosts = getLikedPosts()
    const { data } = await supabase.rpc('update_post_likes', { post_id: post.id, delta })
    if (liked) {
      localStorage.setItem(LIKED_KEY, JSON.stringify(likedPosts.filter((id: number) => id !== post.id)))
    } else {
      localStorage.setItem(LIKED_KEY, JSON.stringify([...likedPosts, post.id]))
    }
    setLiked(!liked)
    setLikeCount(typeof data === 'number' ? data : Math.max(0, likeCount + delta))
    setLiking(false)
  }

  if (!post) return <div className="max-w-2xl mx-auto px-6 py-20 text-center text-burgundy-700/50">Loading…</div>

  const date = new Date(post.published_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  const coverImage = images[0]?.url || post.image_url
  const inlineImages = images.slice(1)
  const leadImage = inlineImages[0]
  const trailImages = inlineImages.slice(1)

  return (
    <>
      <section className="relative text-ivory-100 py-16 md:py-24 px-4 sm:px-6 text-center overflow-hidden"
        style={{ backgroundColor: '#5c1a1a' }}>
        {coverImage && (
          <>
            <img src={coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.35 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 to-burgundy-800/40" />
          </>
        )}
        <div className="relative">
          {post.category && <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">{post.category}</p>}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}>{post.title}</h1>
          <p className="mt-4 text-ivory-100/50 text-sm">
            {date}
            {post.author && <> · <span className="text-ivory-100/70">{post.author}</span></>}
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {post.excerpt && (
          <p className="text-lg italic text-burgundy-700/80 leading-relaxed mb-8 pb-8 border-b border-gold-300/40"
            style={{ fontFamily: 'var(--font-playfair)' }}>{post.excerpt}</p>
        )}

        {leadImage && <div className="mb-8"><ArticleImage url={leadImage.url} /></div>}

        {post.body && <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.body }} />}

        {trailImages.length > 0 && (
          <div className={`mt-8 ${trailImages.length === 1 ? '' : 'grid grid-cols-2 gap-3'}`}>
            {trailImages.map((img, i) => <ArticleImage key={i} url={img.url} />)}
          </div>
        )}

        {/* Share bar + like */}
        <div className="mt-10">
          <ShareBar
            title={post.title}
            liked={liked} likeCount={likeCount} liking={liking} onLike={toggleLike} />
        </div>

        <div className="mt-6">
          <Link to="/blog" className="text-sm text-burgundy-700 hover:underline">← Back to News & Tastings</Link>
        </div>
      </div>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div className="border-t border-ivory-300/60 bg-ivory-50 py-10 md:py-14 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-burgundy-800 mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              More Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map(p => <BlogCard key={p.id} post={p} />)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
