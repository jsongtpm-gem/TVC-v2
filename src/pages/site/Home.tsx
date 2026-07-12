import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import EventCard from '../../components/EventCard'
import BlogCard from '../../components/BlogCard'
export default function Home() {
  const [c, setC] = useState<Record<string, string>>({})
  const [events, setEvents] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'home')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    supabase.from('events').select('*').gte('date', today).order('date').limit(3)
      .then(({ data }) => { if (data) setEvents(data) })
    supabase.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setPosts(data) })
  }, [])

  return (
    <>
      <section className="relative bg-burgundy-800 text-ivory-100 overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(45deg,#9B7D4C 0px,#9B7D4C 1px,transparent 0px,transparent 50%)`, backgroundSize: '20px 20px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-20 text-center w-full">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Toronto Vintners Club</p>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight tracking-tight mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {c.hero_title || 'Welcome to the Toronto Vintners Club'}
          </h1>
          <p className="text-sm md:text-lg text-ivory-100/70 max-w-xl mx-auto leading-relaxed mb-8 hidden sm:block">
            {c.hero_subtitle || 'A community of passionate wine lovers exploring the world one bottle at a time.'}
          </p>

          {/* Primary CTAs — always above the fold */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link to="/membership"
              className="inline-block bg-gold-500 hover:bg-gold-400 text-white px-8 py-4 text-sm tracking-widest uppercase transition-colors rounded-sm font-semibold">
              {c.cta_text || 'Become a Member'}
            </Link>
            <Link to="/events"
                className="inline-block bg-burgundy-600 hover:bg-burgundy-500 border border-ivory-100/30 text-ivory-100 px-8 py-4 text-sm tracking-widest uppercase transition-colors rounded-sm font-semibold">
                Event Ticket
              </Link>
          </div>

          {/* Next event label */}
          {events[0] && (
            <p className="text-xs text-ivory-100/50 tracking-wide">
              Next event: <span className="text-gold-400">{events[0].title}</span>
              {' · '}{new Date(events[0].date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}
            </p>
          )}
        </div>
      </section>

      <div className="h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50" />

      <section className="max-w-3xl mx-auto px-6 py-8 md:py-10 text-center">
        <p className="text-lg sm:text-xl md:text-2xl font-normal leading-snug text-burgundy-800 italic" style={{ fontFamily: 'var(--font-playfair)' }}>
          {c.about_blurb}
        </p>
        <Link to="/about" className="inline-block mt-5 text-sm text-burgundy-700 tracking-widest uppercase border-b border-gold-400 pb-0.5 hover:border-burgundy-700 transition-colors">
          Learn More
        </Link>
      </section>

      <hr className="divider-gold max-w-5xl mx-auto px-6" />

      {events.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-gold-500 mb-1">What's On</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Upcoming Events</h2>
            </div>
            <Link to="/events" className="text-sm text-burgundy-700 hover:underline hidden md:inline">All events →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {events.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link to="/events" className="text-sm text-burgundy-700 hover:underline">All events →</Link>
          </div>
        </section>
      )}

      <hr className="divider-gold max-w-5xl mx-auto px-6" />

      {posts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-gold-500 mb-1">From the Club</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>News & Tastings</h2>
            </div>
            <Link to="/blog" className="text-sm text-burgundy-700 hover:underline hidden md:inline">All posts →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {posts.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      <section className="bg-ivory-300 border-t border-b border-gold-300/40 py-10 px-6 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-gold-500 mb-3">Join the Club</p>
        <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
          {c.cta_text || 'Become a Member'}
        </h2>
        <p className="text-burgundy-700/80 max-w-xl mx-auto mb-5 leading-relaxed">
          {c.cta_subtext || 'Join a community of discerning wine lovers in the heart of Toronto.'}
        </p>
        <Link to="/membership" className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-8 py-3 text-sm tracking-widest uppercase transition-colors rounded-sm">
          Learn About Membership
        </Link>
      </section>
    </>
  )
}
