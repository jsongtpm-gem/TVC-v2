import { Link } from 'react-router-dom'

interface Post { id: number; title: string; slug: string; category?: string; excerpt?: string; published_at: string }

export default function BlogCard({ post }: { post: Post }) {
  const date = new Date(post.published_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="bg-white border border-ivory-300 rounded-sm p-6 shadow-sm hover:shadow-md hover:border-gold-400 transition-all duration-200 h-full flex flex-col">
        {post.category && (
          <p className="text-xs tracking-widest uppercase text-gold-500 mb-2">{post.category}</p>
        )}
        <h3 className="text-lg font-semibold text-burgundy-800 group-hover:text-burgundy-700 mb-2 leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>{post.title}</h3>
        {post.excerpt && <p className="text-sm text-burgundy-700/70 leading-relaxed flex-1 mb-3 line-clamp-3">{post.excerpt}</p>}
        <p className="text-xs text-burgundy-700/50 mt-auto">{date}</p>
      </article>
    </Link>
  )
}
