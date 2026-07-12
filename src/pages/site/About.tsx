import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface BoardMember { id: number; name: string; role?: string; bio?: string; photo?: string; sort_order: number }
interface Document { id: number; section: string; name: string; url: string }

const stats = [
  { value: '1975', label: 'Founded' },
  { value: '50+', label: 'Years of Tastings' },
  { value: '9', label: 'Events Per Year' },
  { value: '400+', label: 'Past Tastings' },
]

export default function About() {
  const [c, setC] = useState<Record<string, string>>({})
  const [board, setBoard] = useState<BoardMember[]>([])
  const [docs, setDocs] = useState<Document[]>([])

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'about')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    supabase.from('board_members').select('*').order('sort_order')
      .then(({ data }) => { if (data) setBoard(data) })
    supabase.from('documents').select('*').in('section', ['annual_report', 'bylaw']).order('uploaded_at')
      .then(({ data }) => { if (data) setDocs(data) })
  }, [])

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-10 md:py-14 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Our Club</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
          {c.hero_title || 'About the Toronto Vintners Club'}
        </h1>
      </section>

      {/* Stats bar */}
      <div className="bg-burgundy-900 text-ivory-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-gold-400" style={{ fontFamily: 'var(--font-playfair)' }}>{s.value}</p>
              <p className="text-xs tracking-widest uppercase text-ivory-100/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-8">

        {c.history_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
              {c.history_title || 'Our History'}
            </h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.history_body }} />
          </section>
        )}

        <hr className="divider-gold" />

        {(c.annual_report_body || docs.some(d => d.section === 'annual_report')) && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
              {c.annual_report_title || 'Annual Report'}
            </h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            {c.annual_report_body && (
              <div className="prose-wine text-burgundy-900/80 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: c.annual_report_body }} />
            )}
            {docs.filter(d => d.section === 'annual_report').length > 0 && (
              <ul className="space-y-2">
                {docs.filter(d => d.section === 'annual_report').map(d => (
                  <li key={d.id}>
                    <a href={d.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-burgundy-700 border-b border-gold-400 hover:border-burgundy-700 transition-colors pb-0.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {d.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {(c.bylaw_body || docs.some(d => d.section === 'bylaw')) && (
          <>
            <hr className="divider-gold" />
            <section>
              <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                {c.bylaw_title || 'By-Law'}
              </h2>
              <div className="h-0.5 w-12 bg-gold-400 mb-6" />
              {c.bylaw_body && (
                <div className="prose-wine text-burgundy-900/80 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: c.bylaw_body }} />
              )}
              {docs.filter(d => d.section === 'bylaw').length > 0 && (
                <ul className="space-y-2">
                  {docs.filter(d => d.section === 'bylaw').map(d => (
                    <li key={d.id}>
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-burgundy-700 border-b border-gold-400 hover:border-burgundy-700 transition-colors pb-0.5">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {d.name} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

      </div>

      {board.length > 0 && (
        <div className="border-t border-ivory-300/60 px-4 sm:px-6 py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-5 text-center">
              <h2 className="text-2xl font-semibold text-burgundy-800 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                {c.board_title || 'Board of Directors'}
              </h2>
              <div className="h-0.5 w-12 bg-gold-400 mx-auto" />
              {c.board_body && (
                <div className="prose-wine text-burgundy-900/80 leading-relaxed mt-4 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: c.board_body }} />
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {board.map(member => (
                <div key={member.id} className="text-center">
                  <div className="flex justify-center mb-3">
                    {member.photo
                      ? <img src={member.photo} alt={member.name} className="w-20 h-20 rounded-full object-cover" />
                      : <div className="w-20 h-20 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-700 text-xl font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>{member.name.charAt(0)}</div>
                    }
                  </div>
                  <h3 className="font-semibold text-burgundy-800 text-sm leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{member.name}</h3>
                  {member.role && <p className="text-xs text-gold-500 uppercase tracking-wide mt-0.5 italic">{member.role}</p>}
                  {member.bio && <div className="mt-2 text-xs text-burgundy-900/70 text-left prose-wine-compact" dangerouslySetInnerHTML={{ __html: member.bio }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
