import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Contact() {
  const [c, setC] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'contact')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
  }, [])

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Get in Touch</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{c.hero_title || 'Contact Us'}</h1>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        <div>
          <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Contact Information</h2>
          <div className="h-0.5 w-12 bg-gold-400 mb-8" />
          {c.intro && <p className="text-burgundy-900/75 leading-relaxed mb-8">{c.intro}</p>}
          <div className="space-y-5">
            {c.address && (
              <div className="flex gap-4 text-sm">
                <span className="text-gold-500 text-lg mt-0.5">📍</span>
                <div>
                  <p className="text-xs tracking-widest uppercase text-burgundy-600 mb-1">Address</p>
                  <p className="text-burgundy-900 leading-relaxed whitespace-pre-line">{c.address}</p>
                </div>
              </div>
            )}
            {c.phone && (
              <div className="flex gap-4 text-sm">
                <span className="text-gold-500 text-lg mt-0.5">📞</span>
                <div>
                  <p className="text-xs tracking-widest uppercase text-burgundy-600 mb-1">Telephone</p>
                  <a href={`tel:${c.phone.replace(/\s/g,'')}`} className="text-burgundy-900 hover:text-burgundy-700 transition-colors">{c.phone}</a>
                </div>
              </div>
            )}
            {c.email && (
              <div className="flex gap-4 text-sm">
                <span className="text-gold-500 text-lg mt-0.5">✉️</span>
                <div>
                  <p className="text-xs tracking-widest uppercase text-burgundy-600 mb-1">Email</p>
                  <a href={`mailto:${c.email}`} className="text-burgundy-900 hover:text-burgundy-700 transition-colors">{c.email}</a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-burgundy-800 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Send a Message</h2>
          <div className="h-0.5 w-12 bg-gold-400 mb-8" />
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Name</label>
              <input type="text" placeholder="Your full name" className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Email</label>
              <input type="email" placeholder="your@email.com" className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Message</label>
              <textarea rows={5} placeholder="Your message…" className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors resize-none" />
            </div>
            <button type="submit" className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 py-3 text-sm tracking-widest uppercase transition-colors rounded-sm">Send Message</button>
          </form>
        </div>
      </div>
    </>
  )
}
