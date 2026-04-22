import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title}</h1>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 space-y-12">
        {c.intro && <div className="prose-wine text-burgundy-900/80 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: c.intro }} />}
        <hr className="divider-gold" />
        {c.benefits_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>{c.benefits_title}</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.benefits_body }} />
          </section>
        )}
        <hr className="divider-gold" />
        {c.tiers_body && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>{c.tiers_title}</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.tiers_body }} />
          </section>
        )}
        <hr className="divider-gold" />
        {c.how_to_join && (
          <section>
            <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>How to Join</h2>
            <div className="h-0.5 w-12 bg-gold-400 mb-6" />
            <div className="prose-wine text-burgundy-900/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.how_to_join }} />
          </section>
        )}
        <div className="bg-ivory-300 border border-gold-300/50 rounded-sm p-8 text-center">
          <p className="text-burgundy-800 mb-4 leading-relaxed">Interested in joining? We'd love to hear from you. Please reach out to our Membership Committee.</p>
          <Link to="/contact" className="inline-block bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-8 py-3 text-sm tracking-widest uppercase transition-colors rounded-sm">Get in Touch</Link>
        </div>
      </div>
    </>
  )
}
