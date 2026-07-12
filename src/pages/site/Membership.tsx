import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Membership() {
  const [c, setC] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'membership')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
  }, [])

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Join Us</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title || 'Membership'}</h1>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-10">
        {c.intro && (
          <div className="prose-wine text-burgundy-900/80 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: c.intro }} />
        )}

        {c.join_renew_url && (
          <div className="text-center">
            <a href={c.join_renew_url} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-8 py-3 text-sm tracking-widest uppercase transition-colors rounded-sm">
              Join / Renew →
            </a>
          </div>
        )}

        <hr className="divider-gold" />

        {c.benefits_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>{c.benefits_title}</h2>
            <div className="prose-wine text-burgundy-900/80 leading-relaxed mt-6" dangerouslySetInnerHTML={{ __html: c.benefits_body }} />
          </section>
        )}

        <hr className="divider-gold" />

        {c.annual_fees_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>{c.annual_fees_title}</h2>
            <div className="prose-wine text-burgundy-900/80 leading-relaxed mt-6"
              dangerouslySetInnerHTML={{ __html: c.join_renew_url
                ? c.annual_fees_body.replace(/href="#"/g, `href="${c.join_renew_url}"`)
                : c.annual_fees_body
              }} />
          </section>
        )}

        <hr className="divider-gold" />

        {c.tasting_fees_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>{c.tasting_fees_title}</h2>
            <div className="prose-wine text-burgundy-900/80 leading-relaxed mt-6" dangerouslySetInnerHTML={{ __html: c.tasting_fees_body }} />
          </section>
        )}
      </div>
    </>
  )
}
