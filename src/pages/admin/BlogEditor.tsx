import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface PostForm { title: string; slug: string; category: string; excerpt: string; body: string; is_published: boolean; published_at: string }
const emptyForm = (): PostForm => ({ title: '', slug: '', category: '', excerpt: '', body: '', is_published: true, published_at: new Date().toISOString().split('T')[0] })

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

export default function BlogEditor() {
  const [posts, setPosts] = useState<any[]>([])
  const [form, setForm] = useState<PostForm>(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)

  function load() {
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).then(({ data }) => { if (data) setPosts(data) })
  }
  useEffect(() => { load() }, [])

  async function save() {
    const payload = { title: form.title, slug: form.slug, category: form.category || null, excerpt: form.excerpt || null, body: form.body || null, is_published: form.is_published, published_at: form.published_at }
    if (editingId) await supabase.from('blog_posts').update(payload).eq('id', editingId)
    else await supabase.from('blog_posts').insert(payload)
    setForm(emptyForm()); setEditingId(null); load()
  }

  async function del(id: number) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id); load()
  }

  function startEdit(p: any) {
    setForm({ title: p.title, slug: p.slug, category: p.category??'', excerpt: p.excerpt??'', body: p.body??'', is_published: p.is_published, published_at: p.published_at?.split('T')[0]??'' })
    setEditingId(p.id)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>News & Tastings</h1>
      </div>

      <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-burgundy-700">{editingId ? 'Edit Post' : '+ New Post'}</h2>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={e=>{const t=e.target.value;setForm({...form,title:t,slug:editingId?form.slug:toSlug(t)})}} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Slug</label>
            <input type="text" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors font-mono" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Category</label>
            <input type="text" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Published Date</label>
            <input type="date" value={form.published_at} onChange={e=>setForm({...form,published_at:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="published" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})} className="accent-burgundy-700" />
            <label htmlFor="published" className="text-sm text-burgundy-700">Published</label>
          </div>
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors resize-none" />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Body</label>
          <RichTextEditor content={form.body} onChange={v=>setForm({...form,body:v})} placeholder="Post content…" />
        </div>
        <div className="flex gap-3">
          <button onClick={save} className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">{editingId?'Update':'Publish Post'}</button>
          {editingId && <button onClick={()=>{setForm(emptyForm());setEditingId(null)}} className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">Cancel</button>}
        </div>
      </div>

      <div className="space-y-2">
        {posts.map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-burgundy-800 truncate">{p.title}</p>
              <p className="text-xs text-burgundy-700/60">{p.published_at?.split('T')[0]} · {p.is_published?'Published':'Draft'}{p.category?` · ${p.category}`:''}</p>
            </div>
            <button onClick={()=>startEdit(p)} className="text-xs text-burgundy-700 hover:underline">Edit</button>
            <button onClick={()=>del(p.id)} className="text-xs text-red-600 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
