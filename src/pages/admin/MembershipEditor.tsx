import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

const inp = "w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"
const lbl = "block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5"

const RICH = ['intro', 'benefits_body', 'annual_fees_body', 'tasting_fees_body']

function CollapseSection({
  label, preview, keys, children, onSave, saving, saved,
}: {
  label: string; preview: string; keys: string[]
  children: React.ReactNode; onSave: (keys: string[]) => void; saving: boolean; saved: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-ivory-300 rounded-sm bg-white">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-ivory-50 transition-colors">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs tracking-widest uppercase text-burgundy-600 mb-0.5">{label}</p>
          {preview
            ? <p className="text-sm text-burgundy-800 truncate">{preview}</p>
            : <p className="text-sm text-burgundy-400 italic">No content yet</p>
          }
        </div>
        <span className="text-burgundy-400 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-ivory-300 px-4 py-4 space-y-4">
          {children}
          <button onClick={() => onSave(keys)} disabled={saving}
            className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-xs tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function MembershipEditor() {
  const [c, setC] = useState<Record<string, string>>({})
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'membership')
      .then(({ data }) => {
        if (!data) return
        setC(Object.fromEntries(data.map(r => [r.section, r.value ?? ''])))
      })
  }, [])

  async function saveKeys(sectionKeys: string[], sectionId: string) {
    setSavingSection(sectionId)
    await Promise.all(sectionKeys.map(key =>
      supabase.from('content').upsert({ page: 'membership', section: key, value: c[key] ?? '' }, { onConflict: 'page,section' })
    ))
    setSavingSection(null); setSavedSection(sectionId)
    setTimeout(() => setSavedSection(null), 2000)
  }

  function field(key: string, label: string) {
    return (
      <div key={key} className="space-y-1.5">
        <label className={lbl}>{label}</label>
        {RICH.includes(key)
          ? <RichTextEditor content={c[key] ?? ''} onChange={v => setC(prev => ({ ...prev, [key]: v }))} />
          : <input type="text" value={c[key] ?? ''} onChange={e => setC(prev => ({ ...prev, [key]: e.target.value }))} className={inp} />
        }
      </div>
    )
  }

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Membership</h1>
      </div>

      <div className="space-y-2">
        <CollapseSection label="Page Header" preview={c.hero_title ?? ''}
          keys={['hero_title', 'intro', 'join_renew_url']}
          onSave={k => saveKeys(k, 'header')}
          saving={savingSection === 'header'} saved={savedSection === 'header'}>
          {field('hero_title', 'Hero Title')}
          {field('intro', 'Intro Text')}
          {field('join_renew_url', 'Join / Renew Button URL')}
        </CollapseSection>

        <CollapseSection label="Benefits of Membership" preview={c.benefits_title ?? stripHtml(c.benefits_body ?? '')}
          keys={['benefits_title', 'benefits_body']}
          onSave={k => saveKeys(k, 'benefits')}
          saving={savingSection === 'benefits'} saved={savedSection === 'benefits'}>
          {field('benefits_title', 'Section Title')}
          {field('benefits_body', 'Body')}
        </CollapseSection>

        <CollapseSection label="Annual Membership Fees" preview={c.annual_fees_title ?? stripHtml(c.annual_fees_body ?? '')}
          keys={['annual_fees_title', 'annual_fees_body']}
          onSave={k => saveKeys(k, 'annual_fees')}
          saving={savingSection === 'annual_fees'} saved={savedSection === 'annual_fees'}>
          {field('annual_fees_title', 'Section Title')}
          {field('annual_fees_body', 'Body')}
        </CollapseSection>

        <CollapseSection label="Tasting Event Fees" preview={c.tasting_fees_title ?? stripHtml(c.tasting_fees_body ?? '')}
          keys={['tasting_fees_title', 'tasting_fees_body']}
          onSave={k => saveKeys(k, 'tasting_fees')}
          saving={savingSection === 'tasting_fees'} saved={savedSection === 'tasting_fees'}>
          {field('tasting_fees_title', 'Section Title')}
          {field('tasting_fees_body', 'Body')}
        </CollapseSection>
      </div>
    </div>
  )
}
