import { Link } from 'react-router-dom'

interface Event { id: number; title: string; date: string; time?: string; location?: string }

export default function EventCard({ event }: { event: Event }) {
  const dateObj = new Date(event.date + 'T12:00:00')
  const month = dateObj.toLocaleString('en-CA', { month: 'short' }).toUpperCase()
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <article className="flex gap-5 bg-white border border-ivory-300 rounded-sm p-5 shadow-sm hover:shadow-md hover:border-gold-400 transition-all duration-200">
        <div className="flex-shrink-0 w-14 text-center">
          <div className="bg-burgundy-700 text-white rounded-t-sm px-2 py-1 text-xs tracking-widest uppercase">{month}</div>
          <div className="bg-ivory-300 rounded-b-sm px-2 py-2">
            <span className="block text-2xl font-bold text-burgundy-800 leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>{day}</span>
            <span className="block text-xs text-burgundy-700/60">{year}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-burgundy-800 group-hover:text-burgundy-700 mb-1 leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>{event.title}</h3>
          {event.time && <p className="text-xs text-gold-500 tracking-wide mb-1">{event.time}</p>}
          {event.location && <p className="text-sm text-burgundy-700/70 truncate">{event.location}</p>}
        </div>
      </article>
    </Link>
  )
}
