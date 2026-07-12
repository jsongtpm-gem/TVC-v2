import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface FAQForm { question: string; answer: string; sort_order: number }
const emptyForm = (): FAQForm => ({ question: '', answer: '', sort_order: 0 })
const fieldCls = "w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"
const lbl = "block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5"

function FAQFormFields({ form, setForm, onSave, onCancel, saveLabel }: {
  form: FAQForm; setForm: (f: FAQForm) => void
  onSave: () => void; onCancel: () => void; saveLabel: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>Question</label>
        <input type="text" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
          className={fieldCls} />
      </div>
      <div>
        <label className={lbl}>Answer</label>
        <RichTextEditor content={form.answer} onChange={v => setForm({ ...form, answer: v })} placeholder="FAQ answer…" />
      </div>
      <div>
        <label className={lbl}>Sort Order</label>
        <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })}
          className="w-24 border border-ivory-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
      </div>
      <div className="flex gap-3">
        <button onClick={onSave} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
          {saveLabel}
        </button>
        <button onClick={onCancel} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function FAQsEditor() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FAQForm>(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FAQForm>(emptyForm())

  function load() {
    supabase.from('faqs').select('*').order('sort_order').then(({ data }) => { if (data) setFaqs(data) })
  }
  useEffect(() => { load() }, [])

  async function add() {
    await supabase.from('faqs').insert(addForm)
    setAddForm(emptyForm()); setShowAdd(false); load()
  }

  async function update() {
    if (!editingId) return
    await supabase.from('faqs').update(editForm).eq('id', editingId)
    setEditingId(null); load()
  }

  async function del(id: number) {
    if (!confirm('Delete this FAQ?')) return
    await supabase.from('faqs').delete().eq('id', id); load()
  }

  function startEdit(f: any) {
    setEditForm({ question: f.question, answer: f.answer ?? '', sort_order: f.sort_order })
    setEditingId(f.id)
    setShowAdd(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>FAQs</h1>
      </div>

      {/* Add form — collapsed by default */}
      {showAdd ? (
        <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5">
          <p className="text-xs tracking-widest uppercase text-burgundy-600 font-semibold mb-4">New FAQ</p>
          <FAQFormFields form={addForm} setForm={setAddForm} onSave={add}
            onCancel={() => { setAddForm(emptyForm()); setShowAdd(false) }} saveLabel="Add FAQ" />
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)}
          className="w-full border border-dashed border-burgundy-400 text-burgundy-700 hover:border-burgundy-600 px-4 py-2.5 text-xs tracking-widest uppercase rounded-sm transition-colors text-left">
          + New FAQ
        </button>
      )}

      {/* FAQ list */}
      <div className="space-y-2">
        {faqs.map(f => (
          editingId === f.id ? (
            <div key={f.id} className="border border-burgundy-300 rounded-sm bg-ivory-50 p-4">
              <p className="text-xs tracking-widest uppercase text-burgundy-600 font-semibold mb-4 truncate">Editing: {f.question}</p>
              <FAQFormFields form={editForm} setForm={setEditForm} onSave={update}
                onCancel={() => setEditingId(null)} saveLabel="Update" />
            </div>
          ) : (
            <div key={f.id} className="flex items-start gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-burgundy-800">{f.question}</p>
              </div>
              <button onClick={() => startEdit(f)} className="text-xs text-burgundy-700 hover:underline flex-shrink-0">Edit</button>
              <button onClick={() => del(f.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Delete</button>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
