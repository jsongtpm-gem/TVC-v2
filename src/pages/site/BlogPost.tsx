import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any>(null)

  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data, error }) => {
        if (error || !data) navigate('/blog')
        else setPost(data)
      })
  }, [slug])

  if (!post) return <div className="max-w-2xl mx-auto px-6 py-20 text-center text-burgundy-700/50">Loading…</div>

  const date = new Date(post.published_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        {post.category && <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">{post.category}</p>}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{post.title}</h1>
        <p className="mt-4 text-ivory-100/50 text-sm">{date}</p>
      </section>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {post.excerpt && (
          <p className="text-lg italic text-burgundy-700/80 leading-relaxed mb-8 pb-8 border-b border-gold-300/40" style={{ fontFamily: 'var(--font-playfair)' }}>{post.excerpt}</p>
        )}
        {post.body && <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.body }} />}
        <div className="mt-12 pt-6 border-t border-gold-300/30">
          <Link to="/blog" className="text-sm text-burgundy-700 hover:underline">← Back to News & Tastings</Link>
        </div>
      </div>
    </>
  )
}
