import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import EventCard from '../../components/EventCard'

export default function Events() {
  const [c, setC] = useState<Record<string, string>>({})
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [past, setPast] = useState<any[]>([])

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'events')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    supabase.from('events').select('*').eq('is_upcoming', true).order('date')
      .then(({ data }) => { if (data) setUpcoming(data) })
    supabase.from('events').select('*').eq('is_upcoming', false).order('date', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setPast(data) })
  }, [])

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Calendar</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title}</h1>
        {c.intro && <p className="mt-4 text-ivory-100/70 max-w-xl mx-auto leading-relaxed">{c.intro}</p>}
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <section className="mb-14">
          <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Upcoming Events</h2>
          <div className="h-0.5 w-12 bg-gold-400 mb-8" />
          {upcoming.length === 0
            ? <p className="text-burgundy-700/60 italic">No upcoming events at this time. Please check back soon.</p>
            : <div className="space-y-4">{upcoming.map(ev => <EventCard key={ev.id} event={ev} />)}</div>
          }
        </section>
        {past.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Past Events</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-8" />
            <div className="space-y-4">{past.map(ev => <EventCard key={ev.id} event={ev} />)}</div>
          </section>
        )}
      </div>
    </>
  )
}
