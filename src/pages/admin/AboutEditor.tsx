import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface BoardMember { id?: number; name: string; role: string; bio: string; sort_order: number; photo?: string }
const emptyMember = (): BoardMember => ({ name: '', role: '', bio: '', sort_order: 0 })

export default function AboutEditor() {
  const [c, setC] = useState<Record<string, string>>({})
  const [board, setBoard] = useState<any[]>([])
  const [form, setForm] = useState<BoardMember>(emptyMember())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  function loadBoard() {
    supabase.from('board_members').select('*').order('sort_order').then(({ data }) => { if (data) setBoard(data) })
  }

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'about')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    loadBoard()
  }, [])

  async function saveContent() {
    setSaving(true)
    await Promise.all(['hero_title','history_title','history_body','mission_title','mission_body'].map(key =>
      supabase.from('content').upsert({ page: 'about', section: key, value: c[key] ?? '' }, { onConflict: 'page,section' })
    ))
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function saveMember() {
    let photoUrl = form.photo
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      await supabase.storage.from('board-photos').upload(path, photoFile, { upsert: true })
      photoUrl = supabase.storage.from('board-photos').getPublicUrl(path).data.publicUrl
    }
    const payload = { name: form.name, role: form.role, bio: form.bio, sort_order: form.sort_order, photo: photoUrl ?? null }
    if (editingId) {
      await supabase.from('board_members').update(payload).eq('id', editingId)
    } else {
      await supabase.from('board_members').insert(payload)
    }
    setForm(emptyMember()); setEditingId(null); setPhotoFile(null); setPhotoPreview(null); loadBoard()
  }

  async function deleteMember(id: number) {
    if (!confirm('Delete this board member?')) return
    await supabase.from('board_members').delete().eq('id', id)
    loadBoard()
  }

  function startEdit(m: any) {
    setForm({ name: m.name, role: m.role ?? '', bio: m.bio ?? '', sort_order: m.sort_order, photo: m.photo })
    setEditingId(m.id); setPhotoPreview(m.photo ?? null)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>About Page</h1>
      </div>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-burgundy-800">Page Content</h2>
        {[{key:'hero_title',label:'Hero Title',multiline:false},{key:'history_title',label:'History Title',multiline:false}].map(({key,label,multiline}) => (
          <div key={key}>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">{label}</label>
            {multiline
              ? <textarea rows={2} value={c[key]??''} onChange={e=>setC({...c,[key]:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors resize-none" />
              : <input type="text" value={c[key]??''} onChange={e=>setC({...c,[key]:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
            }
          </div>
        ))}
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">History Body</label>
          <RichTextEditor content={c.history_body??''} onChange={v=>setC({...c,history_body:v})} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Mission Title</label>
          <input type="text" value={c.mission_title??''} onChange={e=>setC({...c,mission_title:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Mission Body</label>
          <RichTextEditor content={c.mission_body??''} onChange={v=>setC({...c,mission_body:v})} />
        </div>
        <button onClick={saveContent} disabled={saving} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-6 py-2.5 text-sm tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
          {saving?'Saving…':saved?'Saved ✓':'Save Changes'}
        </button>
      </section>

      <hr className="divider-gold" />

      <section>
        <h2 className="text-lg font-semibold text-burgundy-800 mb-4">Board of Directors</h2>
        <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5 mb-6 space-y-4">
          <h3 className="text-sm font-semibold text-burgundy-700">{editingId ? 'Edit Member' : '+ Add Member'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Name</label>
              <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Role / Title</label>
              <input type="text" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Bio</label>
            <RichTextEditor content={form.bio} onChange={v=>setForm({...form,bio:v})} placeholder="Board member bio…" />
          </div>
          <div className="flex items-center gap-4">
            {photoPreview && <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-ivory-300" />}
            <div>
              <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Photo</label>
              <input ref={photoInputRef} type="file" accept="image/*" className="text-sm text-burgundy-700"
                onChange={e => { const f=e.target.files?.[0]; if(f){setPhotoFile(f);setPhotoPreview(URL.createObjectURL(f))} }} />
            </div>
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:+e.target.value})} className="w-24 border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
          <div className="flex gap-3">
            <button onClick={saveMember} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
              {editingId?'Update':'Add Member'}
            </button>
            {editingId && <button onClick={()=>{setForm(emptyMember());setEditingId(null);setPhotoPreview(null)}} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">Cancel</button>}
          </div>
        </div>

        <div className="space-y-2">
          {board.map(m => (
            <div key={m.id} className="flex items-center gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
              {m.photo
                ? <img src={m.photo} alt={m.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                : <div className="w-9 h-9 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-700 font-semibold text-sm flex-shrink-0">{m.name.charAt(0)}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-burgundy-800">{m.name}</p>
                {m.role && <p className="text-xs text-burgundy-700/60">{m.role}</p>}
              </div>
              <button onClick={()=>startEdit(m)} className="text-xs text-burgundy-700 hover:underline">Edit</button>
              <button onClick={()=>deleteMember(m.id)} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
