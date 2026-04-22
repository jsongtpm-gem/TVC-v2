import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface EventForm { title: string; date: string; time: string; location: string; description: string; is_upcoming: boolean }
const emptyForm = (): EventForm => ({ title: '', date: '', time: '', location: '', description: '', is_upcoming: true })

export default function EventsEditor() {
  const [events, setEvents] = useState<any[]>([])
  const [form, setForm] = useState<EventForm>(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)

  function load() {
    supabase.from('events').select('*').order('date', { ascending: false }).then(({ data }) => { if (data) setEvents(data) })
  }
  useEffect(() => { load() }, [])

  async function save() {
    const payload = { title: form.title, date: form.date, time: form.time || null, location: form.location || null, description: form.description || null, is_upcoming: form.is_upcoming }
    if (editingId) await supabase.from('events').update(payload).eq('id', editingId)
    else await supabase.from('events').insert(payload)
    setForm(emptyForm()); setEditingId(null); load()
  }

  async function del(id: number) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id); load()
  }

  function startEdit(ev: any) {
    setForm({ title: ev.title, date: ev.date, time: ev.time ?? '', location: ev.location ?? '', description: ev.description ?? '', is_upcoming: ev.is_upcoming })
    setEditingId(ev.id)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Events</h1>
      </div>

      <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-burgundy-700">{editingId ? 'Edit Event' : '+ New Event'}</h2>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Time</label>
            <input type="text" placeholder="7:00 PM" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="upcoming" checked={form.is_upcoming} onChange={e=>setForm({...form,is_upcoming:e.target.checked})} className="accent-burgundy-700" />
            <label htmlFor="upcoming" className="text-sm text-burgundy-700">Upcoming</label>
          </div>
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Location</label>
          <input type="text" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Description</label>
          <RichTextEditor content={form.description} onChange={v=>setForm({...form,description:v})} placeholder="Event description…" />
        </div>
        <div className="flex gap-3">
          <button onClick={save} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">{editingId?'Update':'Add Event'}</button>
          {editingId && <button onClick={()=>{setForm(emptyForm());setEditingId(null)}} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">Cancel</button>}
        </div>
      </div>

      <div className="space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="flex items-center gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
            <div className="flex-shrink-0 text-center w-12">
              <div className="text-xs font-semibold text-burgundy-700">{new Date(ev.date+'T12:00:00').toLocaleDateString('en-CA',{month:'short'}).toUpperCase()}</div>
              <div className="text-lg font-bold text-burgundy-800" style={{fontFamily:'var(--font-playfair)'}}>{new Date(ev.date+'T12:00:00').getDate()}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-burgundy-800 truncate">{ev.title}</p>
              <p className="text-xs text-burgundy-700/60">{ev.is_upcoming?'Upcoming':'Past'}{ev.location?` · ${ev.location}`:''}</p>
            </div>
            <button onClick={()=>startEdit(ev)} className="text-xs text-burgundy-700 hover:underline">Edit</button>
            <button onClick={()=>del(ev.id)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
