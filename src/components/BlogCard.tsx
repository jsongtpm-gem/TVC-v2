import { Link } from 'react-router-dom'

interface Post {
  id: number; title: string; slug: string; category?: string; excerpt?: string
  published_at: string; image_url?: string; author?: string; likes?: number
}

export default function BlogCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="bg-white border border-ivory-300 rounded-sm shadow-sm hover:shadow-md hover:border-gold-400 transition-all duration-200 h-full flex flex-col overflow-hidden">
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="w-full h-44 object-cover" />
        )}
        <div className="p-6 flex flex-col flex-1">
          {post.category && (
            <p className="text-xs tracking-widest uppercase text-gold-500 mb-2">{post.category}</p>
          )}
          <h3 className="text-lg font-semibold text-burgundy-800 group-hover:text-burgundy-700 mb-2 leading-snug"
            style={{ fontFamily: 'var(--font-playfair)' }}>{post.title}</h3>
          {post.excerpt && <p className="text-sm text-burgundy-700/70 leading-relaxed flex-1 mb-3 line-clamp-3">{post.excerpt}</p>}
          <div className="mt-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs text-burgundy-700/50">{date}</p>
              {post.author && <><span className="text-burgundy-700/30 text-xs">·</span><p className="text-xs text-burgundy-700/50">{post.author}</p></>}
            </div>
            {(post.likes ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-burgundy-700/40">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {post.likes}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
