import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface FAQ { id: number; question: string; answer: string; sort_order: number }

export default function FAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [heroTitle, setHeroTitle] = useState('Frequently Asked Questions')
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('faqs').select('*').order('sort_order')
      .then(({ data }) => { if (data) setFaqs(data) })
    supabase.from('content').select('value').eq('page', 'faqs').eq('section', 'hero_title').single()
      .then(({ data }) => { if (data?.value) setHeroTitle(data.value) })
  }, [])

  return (
    <>
      <section className="bg-burgundy-800 text-ivory-100 py-16 md:py-20 px-4 sm:px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gold-400 mb-4">Support</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{heroTitle}</h1>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {faqs.length === 0
          ? <p className="text-burgundy-700/60 italic text-center py-10">No FAQs available yet.</p>
          : (
            <div className="divide-y divide-ivory-300">
              {faqs.map(faq => (
                <div key={faq.id} className="py-5">
                  <button className="w-full text-left flex items-start justify-between gap-4" onClick={() => setOpen(open === faq.id ? null : faq.id)}>
                    <span className="text-lg font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>{faq.question}</span>
                    <span className="flex-shrink-0 mt-1 text-gold-500 text-lg">{open === faq.id ? '−' : '+'}</span>
                  </button>
                  {open === faq.id && faq.answer && (
                    <div className="mt-4 prose-wine text-burgundy-900/75 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  )}
                </div>
              ))}
            </div>
          )
        }
      </div>
    </>
  )
}
