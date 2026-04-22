import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    supabase.from('events').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setEvent(data) })
  }, [id])

  if (!event) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-burgundy-700/50">Loading…</div>

  const date = new Date(event.date + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Event</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{event.title}</h1>
      </section>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-burgundy-700/80">
          <span>📅 {date}</span>
          {event.time && <span>🕖 {event.time}</span>}
          {event.location && <span>📍 {event.location}</span>}
        </div>
        {event.description && (
          <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: event.description }} />
        )}
        <div className="mt-12 pt-6 border-t border-gold-300/30">
          <Link to="/events" className="text-sm text-burgundy-700 hover:underline">← Back to Events</Link>
        </div>
      </div>
    </>
  )
}
