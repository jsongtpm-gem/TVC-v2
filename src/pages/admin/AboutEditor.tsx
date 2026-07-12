import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface BoardMember { id?: number; name: string; role: string; bio: string; sort_order: number; photo?: string }
interface Document { id: number; section: string; name: string; url: string }
const emptyMember = (): BoardMember => ({ name: '', role: '', bio: '', sort_order: 0 })

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function CollapseSection({
  label, preview, children, onSave, saving, saved,
}: {
  label: string
  preview: string
  children: React.ReactNode
  onSave: () => void
  saving: boolean
  saved: boolean
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
          <button onClick={onSave} disabled={saving}
            className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-xs tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

function PdfManager({ section, docs, onReload }: { section: string; docs: Document[]; onReload: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingName, setPendingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sectionDocs = docs.filter(d => d.section === section)

  function defaultName() {
    if (section === 'bylaw') return 'Bylaws'
    return `${new Date().getFullYear()} Annual Report`
  }

  function onFileSelected(file: File) {
    setPendingFile(file)
    setPendingName(defaultName())
  }

  async function upload() {
    if (!pendingFile) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', pendingFile)
      const res = await fetch(`${import.meta.env.VITE_UPLOAD_WORKER_URL}/events`, {
        method: 'POST',
        headers: { 'X-Upload-Secret': import.meta.env.VITE_UPLOAD_SECRET },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      await supabase.from('documents').insert({ section, name: pendingName || defaultName(), url })
      setPendingFile(null); setPendingName('')
      onReload()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function remove(id: number) {
    if (!confirm('Remove this PDF?')) return
    await supabase.from('documents').delete().eq('id', id)
    onReload()
  }

  return (
    <div className="space-y-3">
      <p className="text-xs tracking-widest uppercase text-burgundy-600">PDFs</p>
      {sectionDocs.length > 0 && (
        <ul className="space-y-1.5">
          {sectionDocs.map(d => (
            <li key={d.id} className="flex items-center gap-3 bg-ivory-100 border border-ivory-300 rounded-sm px-3 py-2">
              <svg className="w-4 h-4 text-burgundy-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <a href={d.url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-burgundy-700 hover:underline flex-1 truncate">{d.name}</a>
              <button onClick={() => remove(d.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Remove</button>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelected(f) }} />
        {pendingFile ? (
          <div className="border border-ivory-300 rounded-sm p-3 space-y-2 bg-ivory-50">
            <p className="text-xs text-burgundy-700/60 truncate">{pendingFile.name}</p>
            <input
              type="text"
              value={pendingName}
              onChange={e => setPendingName(e.target.value)}
              placeholder="Display name…"
              className="w-full border border-ivory-300 rounded-sm px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"
            />
            <div className="flex gap-2">
              <button type="button" onClick={upload} disabled={uploading}
                className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-4 py-1.5 text-xs tracking-widest uppercase rounded-sm transition-colors disabled:opacity-50">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button type="button" onClick={() => { setPendingFile(null); setPendingName(''); if (inputRef.current) inputRef.current.value = '' }}
                className="border border-ivory-300 text-burgundy-700 px-4 py-1.5 text-xs rounded-sm hover:border-burgundy-400 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="border border-dashed border-burgundy-400 text-burgundy-700 hover:border-burgundy-600 px-4 py-2 text-xs rounded-sm transition-colors">
            + Upload PDF
          </button>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}

function MemberForm({ form, setForm, photoPreview, setPhotoPreview, photoInputRef, setPhotoFile, onSave, onCancel, isNew }: {
  form: BoardMember; setForm: (f: BoardMember) => void
  photoPreview: string | null; setPhotoPreview: (v: string | null) => void
  photoInputRef: React.RefObject<HTMLInputElement | null>; setPhotoFile: (f: File | null) => void
  onSave: () => void; onCancel: () => void; isNew?: boolean
}) {
  const [open, setOpen] = useState(false)
  const fieldCls = "w-full border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"

  if (isNew && !open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="w-full border border-dashed border-burgundy-400 text-burgundy-700 hover:border-burgundy-600 px-4 py-2.5 text-xs tracking-widest uppercase rounded-sm transition-colors text-left">
        + Add Member
      </button>
    )
  }

  return (
    <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5 space-y-4">
      {isNew && <p className="text-xs tracking-widest uppercase text-burgundy-600 font-semibold">New Member</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Role / Title</label>
          <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={fieldCls} />
        </div>
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Bio</label>
        <RichTextEditor content={form.bio} onChange={v => setForm({ ...form, bio: v })} placeholder="Board member bio…" />
      </div>
      <div className="flex items-center gap-4">
        {photoPreview && <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-ivory-300" />}
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Photo</label>
          <input ref={photoInputRef} type="file" accept="image/*" className="text-sm text-burgundy-700"
            onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) } }} />
        </div>
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Sort Order</label>
        <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })} className="w-24 border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
      </div>
      <div className="flex gap-3">
        <button onClick={() => { onSave(); if (isNew) setOpen(false) }}
          className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
          {isNew ? 'Add Member' : 'Update'}
        </button>
        <button onClick={() => { onCancel(); if (isNew) setOpen(false) }}
          className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AboutEditor() {
  const [c, setC] = useState<Record<string, string>>({})
  const [board, setBoard] = useState<any[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [form, setForm] = useState<BoardMember>(emptyMember())
  const [editingId, setEditingId] = useState<number | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  function loadBoard() {
    supabase.from('board_members').select('*').order('sort_order').then(({ data }) => { if (data) setBoard(data) })
  }

  function loadDocs() {
    supabase.from('documents').select('*').in('section', ['annual_report', 'bylaw']).order('uploaded_at')
      .then(({ data }) => { if (data) setDocs(data) })
  }

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'about')
      .then(({ data }) => { if (data) setC(Object.fromEntries(data.map(r => [r.section, r.value ?? '']))) })
    loadBoard()
    loadDocs()
  }, [])

  async function saveKeys(keys: string[], sectionId: string) {
    setSavingSection(sectionId)
    await Promise.all(keys.map(key =>
      supabase.from('content').upsert({ page: 'about', section: key, value: c[key] ?? '' }, { onConflict: 'page,section' })
    ))
    setSavingSection(null)
    setSavedSection(sectionId)
    setTimeout(() => setSavedSection(null), 2000)
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

  const inputCls = "w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>About Page</h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-burgundy-800 mb-4">Page Content</h2>

        <CollapseSection label="Hero Title" preview={c.hero_title ?? ''}
          onSave={() => saveKeys(['hero_title'], 'hero')}
          saving={savingSection === 'hero'} saved={savedSection === 'hero'}>
          <input type="text" value={c.hero_title ?? ''} onChange={e => setC({ ...c, hero_title: e.target.value })} className={inputCls} />
        </CollapseSection>

        <CollapseSection label="History" preview={c.history_title ?? stripHtml(c.history_body ?? '')}
          onSave={() => saveKeys(['history_title', 'history_body'], 'history')}
          saving={savingSection === 'history'} saved={savedSection === 'history'}>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Title</label>
            <input type="text" value={c.history_title ?? ''} onChange={e => setC({ ...c, history_title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Body</label>
            <RichTextEditor content={c.history_body ?? ''} onChange={v => setC({ ...c, history_body: v })} />
          </div>
        </CollapseSection>

        <CollapseSection label="Annual Report" preview={c.annual_report_title ?? stripHtml(c.annual_report_body ?? '')}
          onSave={() => saveKeys(['annual_report_title', 'annual_report_body'], 'annual_report')}
          saving={savingSection === 'annual_report'} saved={savedSection === 'annual_report'}>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Title</label>
            <input type="text" value={c.annual_report_title ?? ''} onChange={e => setC({ ...c, annual_report_title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Body</label>
            <RichTextEditor content={c.annual_report_body ?? ''} onChange={v => setC({ ...c, annual_report_body: v })} />
          </div>
          <PdfManager section="annual_report" docs={docs} onReload={loadDocs} />
        </CollapseSection>

        <CollapseSection label="By-Law" preview={c.bylaw_title ?? stripHtml(c.bylaw_body ?? '')}
          onSave={() => saveKeys(['bylaw_title', 'bylaw_body'], 'bylaw')}
          saving={savingSection === 'bylaw'} saved={savedSection === 'bylaw'}>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Title</label>
            <input type="text" value={c.bylaw_title ?? ''} onChange={e => setC({ ...c, bylaw_title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Body</label>
            <RichTextEditor content={c.bylaw_body ?? ''} onChange={v => setC({ ...c, bylaw_body: v })} />
          </div>
          <PdfManager section="bylaw" docs={docs} onReload={loadDocs} />
        </CollapseSection>

        <CollapseSection label="Board of Directors — Intro" preview={c.board_title ?? stripHtml(c.board_body ?? '')}
          onSave={() => saveKeys(['board_title', 'board_body'], 'board')}
          saving={savingSection === 'board'} saved={savedSection === 'board'}>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Title</label>
            <input type="text" value={c.board_title ?? ''} onChange={e => setC({ ...c, board_title: e.target.value })} className={inputCls} placeholder="Board of Directors" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Body</label>
            <RichTextEditor content={c.board_body ?? ''} onChange={v => setC({ ...c, board_body: v })} />
          </div>
        </CollapseSection>
      </section>

      <hr className="divider-gold" />

      <section>
        <h2 className="text-lg font-semibold text-burgundy-800 mb-4">Board of Directors — Members</h2>

        {/* Member form — shown for add (toggled) or always shown when editing */}
        {!editingId && (
          <MemberForm
            form={form} setForm={setForm}
            photoPreview={photoPreview} setPhotoPreview={setPhotoPreview}
            photoInputRef={photoInputRef} setPhotoFile={setPhotoFile}
            onSave={saveMember} onCancel={() => { setForm(emptyMember()); setPhotoPreview(null) }}
            isNew
          />
        )}

        <div className="space-y-2 mt-4">
          {board.map(m => (
            editingId === m.id ? (
              <div key={m.id} className="border border-burgundy-300 rounded-sm bg-ivory-50 p-4 space-y-4">
                <p className="text-xs tracking-widest uppercase text-burgundy-600 font-semibold">Editing: {m.name}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Role / Title</label>
                    <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Bio</label>
                  <RichTextEditor content={form.bio} onChange={v => setForm({ ...form, bio: v })} placeholder="Board member bio…" />
                </div>
                <div className="flex items-center gap-4">
                  {photoPreview && <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-ivory-300" />}
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Photo</label>
                    <input ref={photoInputRef} type="file" accept="image/*" className="text-sm text-burgundy-700"
                      onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)) } }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })} className="w-24 border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
                </div>
                <div className="flex gap-3">
                  <button onClick={saveMember} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">Update</button>
                  <button onClick={() => { setForm(emptyMember()); setEditingId(null); setPhotoPreview(null) }} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-center gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
                {m.photo
                  ? <img src={m.photo} alt={m.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-9 h-9 rounded-full bg-burgundy-100 flex items-center justify-center text-burgundy-700 font-semibold text-sm flex-shrink-0">{m.name.charAt(0)}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-burgundy-800">{m.name}</p>
                  {m.role && <p className="text-xs text-burgundy-700/60">{m.role}</p>}
                </div>
                <button onClick={() => startEdit(m)} className="text-xs text-burgundy-700 hover:underline">Edit</button>
                <button onClick={() => deleteMember(m.id)} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  )
}
