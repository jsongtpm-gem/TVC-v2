import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface FAQForm { question: string; answer: string; sort_order: number }
const emptyForm = (): FAQForm => ({ question: '', answer: '', sort_order: 0 })

export default function FAQsEditor() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [form, setForm] = useState<FAQForm>(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)

  function load() {
    supabase.from('faqs').select('*').order('sort_order').then(({ data }) => { if (data) setFaqs(data) })
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (editingId) await supabase.from('faqs').update(form).eq('id', editingId)
    else await supabase.from('faqs').insert(form)
    setForm(emptyForm()); setEditingId(null); load()
  }

  async function del(id: number) {
    if (!confirm('Delete this FAQ?')) return
    await supabase.from('faqs').delete().eq('id', id); load()
  }

  function startEdit(f: any) {
    setForm({ question: f.question, answer: f.answer ?? '', sort_order: f.sort_order })
    setEditingId(f.id)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>FAQs</h1>
      </div>

      <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-burgundy-700">{editingId ? 'Edit FAQ' : '+ New FAQ'}</h2>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Question</label>
          <input type="text" value={form.question} onChange={e=>setForm({...form,question:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Answer</label>
          <RichTextEditor content={form.answer} onChange={v=>setForm({...form,answer:v})} placeholder="FAQ answer…" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Sort Order</label>
          <input type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:+e.target.value})} className="w-24 border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
        <div className="flex gap-3">
          <button onClick={save} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">{editingId?'Update':'Add FAQ'}</button>
          {editingId && <button onClick={()=>{setForm(emptyForm());setEditingId(null)}} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        {faqs.map(f => (
          <div key={f.id} className="flex items-start gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-burgundy-800">{f.question}</p>
              <p className="text-xs text-burgundy-700/50">Sort: {f.sort_order}</p>
            </div>
            <button onClick={()=>startEdit(f)} className="text-xs text-burgundy-700 hover:underline">Edit</button>
            <button onClick={()=>del(f.id)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
