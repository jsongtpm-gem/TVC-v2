import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Event {
  id: number
  title: string
  date: string
  time?: string
  location?: string
  description?: string
  pdf_url?: string
  ticket_url?: string
}

function UpcomingEventRow({ event }: { event: Event }) {
  const dateObj = new Date(event.date + 'T12:00:00')
  const dayName = dateObj.toLocaleString('en-CA', { weekday: 'long' })
  const month = dateObj.toLocaleString('en-CA', { month: 'long' })
  const day = dateObj.getDate()

  return (
    <article className="border border-ivory-300 rounded-sm bg-white overflow-hidden">
      <div className="flex">
        <div className="flex-shrink-0 w-24 sm:w-36 bg-burgundy-800 text-ivory-100 flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-6 py-4 sm:py-8 text-center">
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gold-400">{dayName}</span>
          <span className="text-3xl sm:text-4xl font-bold leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>{day}</span>
          <span className="text-xs sm:text-sm tracking-widest uppercase text-ivory-100/70">{month}</span>
        </div>
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-2 sm:gap-3 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
            <h3 className="text-base sm:text-xl font-semibold text-burgundy-800 leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>
              {event.title}
            </h3>
            {event.pdf_url && (
              <a href={event.pdf_url} target="_blank" rel="noopener noreferrer"
                className="text-xs tracking-widest uppercase text-gold-600 border-b border-gold-400 hover:border-gold-600 transition-colors whitespace-nowrap">
                Details ↗
              </a>
            )}
          </div>
          {event.time && (
            <p className="text-xs tracking-wide text-gold-500 uppercase">{event.time}{event.location && ` · ${event.location}`}</p>
          )}
          {event.description && (
            <div className="hidden sm:block prose-wine text-sm text-burgundy-700/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }} />
          )}
          {event.ticket_url && (
            <div className="pt-1 sm:pt-2">
              <a href={event.ticket_url} target="_blank" rel="noopener noreferrer"
                className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-4 sm:px-6 py-2 sm:py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm">
                Buy Tickets →
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function PastEventRow({ event }: { event: Event }) {
  const dateObj = new Date(event.date + 'T12:00:00')
  const formatted = dateObj.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="flex items-baseline gap-4 py-2.5 border-b border-ivory-300 last:border-0">
      <span className="flex-shrink-0 text-xs text-burgundy-700/50 w-36">{formatted}</span>
      <span className="text-sm text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>
        {event.pdf_url
          ? <a href={event.pdf_url} target="_blank" rel="noopener noreferrer" className="hover:text-burgundy-600 border-b border-transparent hover:border-gold-400 transition-colors">{event.title} ↗</a>
          : event.title
        }
      </span>
    </div>
  )
}

const PAGE_SIZE = 20

export default function Events() {
  const [c, setC] = useState<Record<string, string>>({})
  const [upcoming, setUpcoming] = useState<Event[]>([])
  const [past, setPast] = useState<Event[]>([])
  const [pastLimit, setPastLimit] = useState(PAGE_SIZE)
  const [pastTotal, setPastTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'events')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })

    supabase.from('events').select('*').gte('date', today).order('date')
      .then(({ data }) => { if (data) setUpcoming(data) })

    supabase.from('events').select('*', { count: 'exact', head: true }).lt('date', today)
      .then(({ count }) => { if (count != null) setPastTotal(count) })

    supabase.from('events').select('*').lt('date', today).order('date', { ascending: false }).limit(PAGE_SIZE)
      .then(({ data }) => { if (data) setPast(data) })
  }, [])

  async function loadMore() {
    setLoadingMore(true)
    const newLimit = pastLimit + PAGE_SIZE
    const { data } = await supabase.from('events').select('*').lt('date', today)
      .order('date', { ascending: false }).limit(newLimit)
    if (data) setPast(data)
    setPastLimit(newLimit)
    setLoadingMore(false)
  }

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-10 md:py-14 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-3">Calendar</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title || 'Events'}</h1>
        {c.intro && <p className="hidden sm:block mt-4 text-ivory-100/70 max-w-2xl mx-auto leading-relaxed">{c.intro}</p>}
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <section className="mb-6 md:mb-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-burgundy-800 mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Upcoming Events</h2>
          <div className="h-0.5 w-12 bg-gold-400 mb-6" />
          {upcoming.length === 0
            ? <p className="text-burgundy-700/60 italic">No upcoming events at this time. Please check back soon.</p>
            : <div className="space-y-4">{upcoming.map(ev => <UpcomingEventRow key={ev.id} event={ev} />)}</div>
          }
        </section>

        {c.tastings_body && (
          <section className="mb-6 md:mb-10 bg-ivory-200 border border-ivory-300 rounded-sm px-6 sm:px-8 py-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-burgundy-800 mb-5" style={{ fontFamily: 'var(--font-playfair)' }}>How Our Tastings Work</h2>
            <div className="prose-wine text-sm text-burgundy-700/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: c.tastings_body }} />
            <p className="mt-4">
              <Link to="/faqs" className="text-sm text-burgundy-700 border-b border-gold-400 hover:border-burgundy-700 transition-colors">
                Find out more here (FAQs) →
              </Link>
            </p>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-burgundy-800 mb-2 sm:mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Past Events</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            {Object.entries(
              past.reduce((acc, ev) => {
                const year = ev.date.slice(0, 4)
                ;(acc[year] = acc[year] || []).push(ev)
                return acc
              }, {} as Record<string, Event[]>)
            )
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, evs]) => (
                <div key={year} className="mb-6">
                  <p className="text-xs tracking-[0.2em] uppercase text-gold-500 mb-2">{year}</p>
                  <div className="bg-white border border-ivory-300 rounded-sm px-5 py-1">
                    {evs.map(ev => <PastEventRow key={ev.id} event={ev} />)}
                  </div>
                </div>
              ))
            }
            {past.length < pastTotal && (
              <div className="text-center mt-4">
                <button onClick={loadMore} disabled={loadingMore}
                  className="border border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-ivory-100 px-8 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
                  {loadingMore ? 'Loading…' : `Load More (${pastTotal - past.length} remaining)`}
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <section className="bg-ivory-300 border-t border-b border-gold-300/40 py-10 px-6 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-gold-500 mb-3">Join the Club</p>
        <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
          Become a Member
        </h2>
        <p className="text-burgundy-700/80 max-w-xl mx-auto mb-5 leading-relaxed">
          Membership is open to anyone of legal drinking age (19+). No experience necessary — just a love of great wine.
        </p>
        <Link to="/membership" className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-8 py-3 text-sm tracking-widest uppercase transition-colors rounded-sm">
          Learn About Membership
        </Link>
      </section>
    </>
  )
}
