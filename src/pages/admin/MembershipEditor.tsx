import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

export default function MembershipEditor() {
  const [c, setC] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'membership')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
  }, [])

  async function save() {
    setSaving(true)
    await Promise.all(['hero_title','intro','benefits_title','benefits_body','tiers_title','tiers_body','how_to_join'].map(key =>
      supabase.from('content').upsert({ page: 'membership', section: key, value: c[key] ?? '' }, { onConflict: 'page,section' })
    ))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const richFields = ['intro','benefits_body','tiers_body','how_to_join']
  const textFields = [
    { key: 'hero_title', label: 'Hero Title' },
    { key: 'benefits_title', label: 'Benefits Title' },
    { key: 'tiers_title', label: 'Tiers Title' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Membership</h1>
      </div>
      {textFields.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">{label}</label>
          <input type="text" value={c[key]??''} onChange={e=>setC({...c,[key]:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
      ))}
      {richFields.map(key => (
        <div key={key}>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">{key.replace(/_/g,' ')}</label>
          <RichTextEditor content={c[key]??''} onChange={v=>setC({...c,[key]:v})} />
        </div>
      ))}
      <button onClick={save} disabled={saving} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-6 py-2.5 text-sm tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
        {saving?'Saving…':saved?'Saved ✓':'Save Changes'}
      </button>
    </div>
  )
}
