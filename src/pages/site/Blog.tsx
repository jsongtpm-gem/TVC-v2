import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BlogCard from '../../components/BlogCard'

export default function Blog() {
  const [c, setC] = useState<Record<string, string>>({})
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'blog')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { if (data) setPosts(data) })
  }, [])

  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)))

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">From the Club</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title}</h1>
        {c.intro && <p className="mt-4 text-ivory-100/70 max-w-xl mx-auto leading-relaxed">{c.intro}</p>}
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <span key={cat} className="px-3 py-1 bg-ivory-300 border border-gold-300/50 text-xs tracking-widest uppercase text-burgundy-700 rounded-sm">{cat}</span>
            ))}
          </div>
        )}
        {posts.length === 0
          ? <p className="text-burgundy-700/60 italic text-center py-10">No posts published yet.</p>
          : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{posts.map(post => <BlogCard key={post.id} post={post} />)}</div>
        }
      </div>
    </>
  )
}
