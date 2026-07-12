import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface EventForm {
  title: string
  date: string
  time: string
  location: string
  description: string
  pdf_url: string
  ticket_url: string
}

const emptyForm = (): EventForm => ({
  title: '', date: '', time: '6:00 PM', location: 'Faculty Club U of T - 41 Wilcocks St., Toronto, ON',
  description: '', pdf_url: '', ticket_url: ''
})

const inp = "w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"
const lbl = "block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5"

function CollapseHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left"
    >
      <h2 className="text-sm font-semibold text-burgundy-700">{label}</h2>
      <span className="text-burgundy-400 text-xs">{open ? '▲ collapse' : '▼ edit'}</span>
    </button>
  )
}

function EventEditForm({
  initial, eventId, onSave, onCancel
}: {
  initial: EventForm
  eventId: number
  onSave: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<EventForm>(initial)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const pdfRef = useRef<HTMLInputElement>(null)

  async function uploadPdf(file: File) {
    setUploadingPdf(true); setPdfError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${import.meta.env.VITE_UPLOAD_WORKER_URL}/events`, {
        method: 'POST',
        headers: { 'X-Upload-Secret': import.meta.env.VITE_UPLOAD_SECRET },
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      const { url } = await res.json()
      setForm(f => ({ ...f, pdf_url: url }))
    } catch (e: any) { setPdfError(`Upload failed: ${e.message}`) }
    setUploadingPdf(false)
  }

  async function save() {
    const payload = {
      title: form.title, date: form.date, time: form.time || null,
      location: form.location || null, description: form.description || null,
      pdf_url: form.pdf_url || null, ticket_url: form.ticket_url || null,
    }
    await supabase.from('events').update(payload).eq('id', eventId)
    onSave()
  }

  return (
    <div className="border-t border-ivory-300 bg-ivory-50 p-5 space-y-4">
      <div>
        <label className={lbl}>Title</label>
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inp} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Date</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inp} />
        </div>
        <div>
          <label className={lbl}>Time</label>
          <input type="text" placeholder="7:00 PM" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className={inp} />
        </div>
      </div>
      <div>
        <label className={lbl}>Location</label>
        <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inp} />
      </div>
      <div>
        <label className={lbl}>Description</label>
        <RichTextEditor key={eventId} content={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Event description…" />
      </div>
      <div>
        <label className={lbl}>PDF Details Sheet <span className="normal-case text-burgundy-600/50">(optional — stored on Cloudflare R2)</span></label>
        <div className="flex gap-2 items-center">
          <button type="button" onClick={() => pdfRef.current?.click()} disabled={uploadingPdf}
            className="border border-ivory-300 text-burgundy-700 px-3 py-2 text-xs tracking-widest uppercase rounded-sm hover:border-burgundy-400 transition-colors disabled:opacity-50 whitespace-nowrap">
            {uploadingPdf ? 'Uploading…' : 'Upload PDF'}
          </button>
          <input ref={pdfRef} type="file" accept="application/pdf" className="hidden"
            onChange={e => { if (e.target.files?.[0]) uploadPdf(e.target.files[0]) }} />
          <span className="text-xs text-burgundy-700/50">or</span>
          <input type="url" placeholder="Paste URL…" value={form.pdf_url}
            onChange={e => setForm({ ...form, pdf_url: e.target.value })} className={inp + ' flex-1'} />
        </div>
        {form.pdf_url && <p className="text-xs text-burgundy-700/50 mt-1 truncate">{form.pdf_url}</p>}
        {pdfError && <p className="text-xs text-red-600 mt-1">{pdfError}</p>}
      </div>
      <div>
        <label className={lbl}>Buy Tickets URL <span className="normal-case text-burgundy-600/50">(optional)</span></label>
        <input type="url" placeholder="https://…" value={form.ticket_url} onChange={e => setForm({ ...form, ticket_url: e.target.value })} className={inp} />
      </div>
      <div className="flex gap-3">
        <button onClick={save} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">Update</button>
        <button onClick={onCancel} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">Cancel</button>
      </div>
    </div>
  )
}

function EventRow({ ev, expandedId, setExpandedId, onSave, onDelete }: {
  ev: any; expandedId: number | null; setExpandedId: (id: number | null) => void
  onSave: () => void; onDelete: (id: number) => void
}) {
  return (
    <div className="bg-white border border-ivory-300 rounded-sm overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex-shrink-0 text-center w-14">
          <div className="text-xs font-semibold text-burgundy-700">
            {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short' }).toUpperCase()}
          </div>
          <div className="text-lg font-bold text-burgundy-800 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            {new Date(ev.date + 'T12:00:00').getDate()}
          </div>
          <div className="text-xs text-burgundy-700/50">
            {new Date(ev.date + 'T12:00:00').getFullYear()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-burgundy-800 truncate">{ev.title}</p>
          <p className="text-xs text-burgundy-700/60">
            {ev.ticket_url ? 'Tickets · ' : ''}{ev.pdf_url ? 'PDF' : ''}
          </p>
        </div>
        <button onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
          className="text-xs text-burgundy-700 hover:underline">
          {expandedId === ev.id ? 'Close' : 'Edit'}
        </button>
        <button onClick={() => onDelete(ev.id)} className="text-xs text-red-600 hover:underline">Delete</button>
      </div>
      {expandedId === ev.id && (
        <EventEditForm
          initial={{ title: ev.title, date: ev.date, time: ev.time ?? '', location: ev.location ?? '', description: ev.description ?? '', pdf_url: ev.pdf_url ?? '', ticket_url: ev.ticket_url ?? '' }}
          eventId={ev.id}
          onSave={onSave}
          onCancel={() => setExpandedId(null)}
        />
      )}
    </div>
  )
}

export default function EventsEditor() {
  const [intro, setIntro] = useState('')
  const [tastingsBody, setTastingsBody] = useState('')
  const [introSaved, setIntroSaved] = useState(false)
  const [tastingsSaved, setTastingsSaved] = useState(false)
  const [tastingsKey, setTastingsKey] = useState(0)
  const [showIntro, setShowIntro] = useState(false)
  const [showTastings, setShowTastings] = useState(false)
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [past, setPast] = useState<any[]>([])
  const [pastTotal, setPastTotal] = useState(0)
  const [pastLimit, setPastLimit] = useState(20)
  const [loadingMore, setLoadingMore] = useState(false)
  const [newForm, setNewForm] = useState<EventForm>(emptyForm())
  const [newFormKey, setNewFormKey] = useState(0)
  const [showNewForm, setShowNewForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [uploadingNewPdf, setUploadingNewPdf] = useState(false)
  const [newPdfError, setNewPdfError] = useState('')
  const newPdfRef = useRef<HTMLInputElement>(null)

  async function uploadNewPdf(file: File) {
    setUploadingNewPdf(true); setNewPdfError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${import.meta.env.VITE_UPLOAD_WORKER_URL}/events`, {
        method: 'POST',
        headers: { 'X-Upload-Secret': import.meta.env.VITE_UPLOAD_SECRET },
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      const { url } = await res.json()
      setNewForm(f => ({ ...f, pdf_url: url }))
    } catch (e: any) { setNewPdfError(`Upload failed: ${e.message}`) }
    setUploadingNewPdf(false)
  }

  const today = new Date().toISOString().split('T')[0]

  function loadEvents(limit = pastLimit) {
    supabase.from('events').select('*').gte('date', today).order('date', { ascending: true })
      .then(({ data }) => { if (data) setUpcoming(data) })
    supabase.from('events').select('*', { count: 'exact', head: true }).lt('date', today)
      .then(({ count }) => { if (count != null) setPastTotal(count) })
    supabase.from('events').select('*').lt('date', today).order('date', { ascending: false }).limit(limit)
      .then(({ data }) => { if (data) setPast(data) })
  }

  async function loadMorePast() {
    setLoadingMore(true)
    const newLimit = pastLimit + 20
    setPastLimit(newLimit)
    const { data } = await supabase.from('events').select('*').lt('date', today)
      .order('date', { ascending: false }).limit(newLimit)
    if (data) setPast(data)
    setLoadingMore(false)
  }

  useEffect(() => {
    supabase.from('content').select('section,value').eq('page', 'events').in('section', ['intro', 'tastings_body'])
      .then(({ data }) => {
        if (!data) return
        const map = Object.fromEntries(data.map(r => [r.section, r.value ?? '']))
        setIntro(map.intro ?? '')
        setTastingsBody(map.tastings_body ?? '')
        setTastingsKey(k => k + 1)
      })
    loadEvents()
  }, [])

  async function saveIntro() {
    await supabase.from('content').upsert({ page: 'events', section: 'intro', value: intro }, { onConflict: 'page,section' })
    setIntroSaved(true)
    setTimeout(() => setIntroSaved(false), 2000)
  }

  async function saveTastings() {
    await supabase.from('content').upsert({ page: 'events', section: 'tastings_body', value: tastingsBody }, { onConflict: 'page,section' })
    setTastingsSaved(true)
    setTimeout(() => setTastingsSaved(false), 2000)
  }

  async function addEvent() {
    const payload = {
      title: newForm.title, date: newForm.date, time: newForm.time || null,
      location: newForm.location || null, description: newForm.description || null,
      pdf_url: newForm.pdf_url || null, ticket_url: newForm.ticket_url || null,
    }
    await supabase.from('events').insert(payload)
    setNewForm(emptyForm())
    setNewFormKey(k => k + 1)
    loadEvents()
  }

  async function del(id: number) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setExpandedId(null)
    loadEvents()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Events</h1>
      </div>

      {/* Page Intro — collapsible */}
      <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5">
        <CollapseHeader label="Page Intro Text" open={showIntro} onToggle={() => setShowIntro(v => !v)} />
        {showIntro && (
          <div className="mt-4 space-y-4">
            <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={3} className={inp + ' resize-y'} />
            <button onClick={saveIntro} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
              {introSaved ? 'Saved ✓' : 'Save Intro'}
            </button>
          </div>
        )}
      </div>

      {/* How Our Tastings Work — collapsible */}
      <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5">
        <CollapseHeader label="How Our Tastings Work" open={showTastings} onToggle={() => setShowTastings(v => !v)} />
        {showTastings && (
          <div className="mt-4 space-y-4">
            <RichTextEditor key={tastingsKey} content={tastingsBody} onChange={v => setTastingsBody(v)} placeholder="Describe how tastings work…" />
            <button onClick={saveTastings} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
              {tastingsSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* New event form — collapsed by default */}
      {showNewForm ? (
        <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-burgundy-700">New Event</h2>
          <div>
            <label className={lbl}>Title</label>
            <input type="text" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} className={inp} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Date</label>
              <input type="date" value={newForm.date} onChange={e => setNewForm({ ...newForm, date: e.target.value })} className={inp} />
            </div>
            <div>
              <label className={lbl}>Time</label>
              <input type="text" placeholder="7:00 PM" value={newForm.time} onChange={e => setNewForm({ ...newForm, time: e.target.value })} className={inp} />
            </div>
          </div>
          <div>
            <label className={lbl}>Location</label>
            <input type="text" value={newForm.location} onChange={e => setNewForm({ ...newForm, location: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl}>Description</label>
            <RichTextEditor key={newFormKey} content={newForm.description} onChange={v => setNewForm({ ...newForm, description: v })} placeholder="Event description…" />
          </div>
          <div>
            <label className={lbl}>PDF Details Sheet <span className="normal-case text-burgundy-600/50">(optional — stored on Cloudflare R2)</span></label>
            <div className="flex gap-2 items-center">
              <button type="button" onClick={() => newPdfRef.current?.click()} disabled={uploadingNewPdf}
                className="border border-ivory-300 text-burgundy-700 px-3 py-2 text-xs tracking-widest uppercase rounded-sm hover:border-burgundy-400 transition-colors disabled:opacity-50 whitespace-nowrap">
                {uploadingNewPdf ? 'Uploading…' : 'Upload PDF'}
              </button>
              <input ref={newPdfRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => { if (e.target.files?.[0]) uploadNewPdf(e.target.files[0]) }} />
              <span className="text-xs text-burgundy-700/50">or</span>
              <input type="url" placeholder="Paste URL…" value={newForm.pdf_url}
                onChange={e => setNewForm({ ...newForm, pdf_url: e.target.value })} className={inp + ' flex-1'} />
            </div>
            {newForm.pdf_url && <p className="text-xs text-burgundy-700/50 mt-1 truncate">{newForm.pdf_url}</p>}
            {newPdfError && <p className="text-xs text-red-600 mt-1">{newPdfError}</p>}
          </div>
          <div>
            <label className={lbl}>Buy Tickets URL <span className="normal-case text-burgundy-600/50">(optional)</span></label>
            <input type="url" placeholder="https://…" value={newForm.ticket_url} onChange={e => setNewForm({ ...newForm, ticket_url: e.target.value })} className={inp} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { addEvent(); setShowNewForm(false) }} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
              Add Event
            </button>
            <button onClick={() => { setNewForm(emptyForm()); setShowNewForm(false) }} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)}
          className="w-full border border-dashed border-burgundy-400 text-burgundy-700 hover:border-burgundy-600 px-4 py-2.5 text-xs tracking-widest uppercase rounded-sm transition-colors text-left">
          + New Event
        </button>
      )}

      {/* Event list with inline edit */}
      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-sm text-burgundy-700/50 text-center py-6">No events yet.</p>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs tracking-widest uppercase text-gold-500 font-semibold">Upcoming</p>
          {upcoming.map(ev => <EventRow key={ev.id} ev={ev} expandedId={expandedId} setExpandedId={setExpandedId} onSave={() => { setExpandedId(null); loadEvents() }} onDelete={del} />)}
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-xs tracking-widest uppercase text-burgundy-700/40 font-semibold mt-4 mb-3">Past</p>
          {(Object.entries(
            past.reduce((acc: Record<string, any[]>, ev) => {
              const year = ev.date.slice(0, 4)
              ;(acc[year] = acc[year] || []).push(ev)
              return acc
            }, {})
          ) as [string, any[]][])
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, evs]) => (
              <div key={year} className="mb-4">
                <p className="text-xs tracking-widest uppercase text-gold-500/70 mb-2">{year}</p>
                <div className="space-y-2">
                  {evs.map(ev => <EventRow key={ev.id} ev={ev} expandedId={expandedId} setExpandedId={setExpandedId} onSave={() => { setExpandedId(null); loadEvents() }} onDelete={del} />)}
                </div>
              </div>
            ))
          }
          {past.length < pastTotal && (
            <button onClick={loadMorePast} disabled={loadingMore}
              className="w-full border border-ivory-300 text-burgundy-700 hover:bg-ivory-100 py-2 text-xs tracking-widest uppercase rounded-sm transition-colors disabled:opacity-50 mt-2">
              {loadingMore ? 'Loading…' : `Load More (${pastTotal - past.length} remaining)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
