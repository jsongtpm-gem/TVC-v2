import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const fields = [
  { key: 'hero_title', label: 'Hero Title', multiline: false },
  { key: 'hero_subtitle', label: 'Hero Subtitle', multiline: true },
  { key: 'about_blurb', label: 'About Blurb', multiline: true },
  { key: 'cta_text', label: 'CTA Button Text', multiline: false },
  { key: 'cta_subtext', label: 'CTA Subtext', multiline: true },
]

export default function HomeEditor() {
  const [c, setC] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'home')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
  }, [])

  async function save() {
    setSaving(true)
    await Promise.all(fields.map(({ key }) =>
      supabase.from('content').upsert({ page: 'home', section: key, value: c[key] ?? '' }, { onConflict: 'page,section' })
    ))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Home Page</h1>
      </div>
      <div className="space-y-6">
        {fields.map(({ key, label, multiline }) => (
          <div key={key}>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">{label}</label>
            {multiline
              ? <textarea rows={3} value={c[key] ?? ''} onChange={e => setC({ ...c, [key]: e.target.value })}
                  className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors resize-none" />
              : <input type="text" value={c[key] ?? ''} onChange={e => setC({ ...c, [key]: e.target.value })}
                  className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
            }
          </div>
        ))}
        <button onClick={save} disabled={saving}
          className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-6 py-2.5 text-sm tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
