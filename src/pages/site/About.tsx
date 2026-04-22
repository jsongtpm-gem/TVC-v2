import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface BoardMember { id: number; name: string; role?: string; bio?: string; photo?: string; sort_order: number }

export default function About() {
  const [c, setC] = useState<Record<string, string>>({})
  const [board, setBoard] = useState<BoardMember[]>([])

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'about')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    supabase.from('board_members').select('*').order('sort_order')
      .then(({ data }) => { if (data) setBoard(data) })
  }, [])

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Our Club</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title}</h1>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-12">
        {c.history_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>{c.history_title || 'Our History'}</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.history_body }} />
          </section>
        )}

        <hr className="divider-gold" />

        {c.mission_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>{c.mission_title || 'Our Mission'}</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.mission_body }} />
          </section>
        )}

        <hr className="divider-gold" />

        {board.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Board of Directors</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {board.map(member => (
                <div key={member.id} className="bg-white border border-ivory-300 rounded-sm p-5 shadow-sm">
                  <div className="flex items-center gap-4 mb-3">
                    {member.photo
                      ? <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-16 h-16 rounded-full bg-burgundy-100 flex items-center justify-center flex-shrink-0 text-burgundy-700 text-xl font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>{member.name.charAt(0)}</div>
                    }
                    <div>
                      <h3 className="font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>{member.name}</h3>
                      {member.role && <p className="text-xs tracking-wide text-gold-500 uppercase">{member.role}</p>}
                    </div>
                  </div>
                  {member.bio && <div className="prose-wine text-sm text-burgundy-900/75 leading-relaxed" dangerouslySetInnerHTML={{ __html: member.bio }} />}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
