import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface PostForm {
  title: string; slug: string; category: string; author: string; excerpt: string
  body: string; is_published: boolean; published_at: string
}
interface ImageEntry { url: string; name: string }

const emptyForm = (): PostForm => ({
  title: '', slug: '', category: '', author: '', excerpt: '', body: '',
  is_published: true, published_at: new Date().toISOString().split('T')[0]
})

function toSlug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

const inp = "w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-burgundy-700 transition-colors"
const lbl = "block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5"

function ImageManager({ images, setImages }: { images: ImageEntry[]; setImages: (imgs: ImageEntry[]) => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function upload(file: File) {
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${import.meta.env.VITE_UPLOAD_WORKER_URL}/blog`, {
        method: 'POST',
        headers: { 'X-Upload-Secret': import.meta.env.VITE_UPLOAD_SECRET },
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      const { url } = await res.json()
      const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
      setImages([...images, { url, name }])
    } catch (e: any) { setError(`Upload failed: ${e.message}`) }
    setUploading(false)
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative border border-ivory-300 rounded-sm overflow-hidden bg-white">
              <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-white/90 text-red-600 text-xs w-5 h-5 flex items-center justify-center rounded-sm hover:bg-white border border-ivory-200">
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border border-dashed border-burgundy-400 text-burgundy-700 hover:border-burgundy-600 px-4 py-2 text-xs tracking-widest uppercase rounded-sm transition-colors disabled:opacity-50">
          {uploading ? 'Uploading…' : '+ Add Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]); e.target.value = '' }} />
        {images.length === 0 && <span className="text-xs text-burgundy-700/40 italic">First image will be used as cover</span>}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function PostFormFields({ form, setForm, images, setImages, onSave, onCancel, saveLabel, isNew }: {
  form: PostForm; setForm: (f: PostForm) => void
  images: ImageEntry[]; setImages: (imgs: ImageEntry[]) => void
  onSave: () => void; onCancel: () => void; saveLabel: string; isNew: boolean
}) {
  const [rtKey] = useState(() => Math.random())

  return (
    <div className="space-y-4">
      <div>
        <label className={lbl}>Title</label>
        <input type="text" value={form.title}
          onChange={e => { const t = e.target.value; setForm({ ...form, title: t, slug: isNew ? toSlug(t) : form.slug }) }}
          className={inp} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Slug</label>
          <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inp + ' font-mono'} />
        </div>
        <div>
          <label className={lbl}>Category</label>
          <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp} placeholder="e.g. Tasting Notes" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Author</label>
          <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className={inp} />
        </div>
        <div>
          <label className={lbl}>Published Date</label>
          <input type="date" value={form.published_at} onChange={e => setForm({ ...form, published_at: e.target.value })} className={inp} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id={`pub-${rtKey}`} checked={form.is_published}
          onChange={e => setForm({ ...form, is_published: e.target.checked })} className="accent-burgundy-700" />
        <label htmlFor={`pub-${rtKey}`} className="text-sm text-burgundy-700">Published</label>
      </div>

      <div>
        <label className={lbl}>Images</label>
        <ImageManager images={images} setImages={setImages} />
      </div>

      <div>
        <label className={lbl}>Excerpt</label>
        <textarea rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
          className={inp + ' resize-none'} />
      </div>

      <div>
        <label className={lbl}>Body</label>
        <RichTextEditor key={rtKey} content={form.body} onChange={v => setForm({ ...form, body: v })} placeholder="Post content…" />
      </div>

      <div className="flex gap-3">
        <button onClick={onSave}
          className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-5 py-2 text-sm tracking-widest uppercase transition-colors rounded-sm">
          {saveLabel}
        </button>
        <button onClick={onCancel}
          className="border border-ivory-300 text-burgundy-700 px-5 py-2 text-sm rounded-sm hover:border-burgundy-400 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function BlogEditor() {
  const [posts, setPosts] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<PostForm>(emptyForm())
  const [addImages, setAddImages] = useState<ImageEntry[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<PostForm>(emptyForm())
  const [editImages, setEditImages] = useState<ImageEntry[]>([])

  function load() {
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false })
      .then(({ data }) => { if (data) setPosts(data) })
  }
  useEffect(() => { load() }, [])

  async function saveImages(postId: number, images: ImageEntry[]) {
    try {
      await supabase.from('blog_images').delete().eq('post_id', postId)
      if (images.length > 0) {
        await supabase.from('blog_images').insert(
          images.map((img, i) => ({ post_id: postId, url: img.url, name: img.name, sort_order: i }))
        )
      }
    } catch { /* blog_images table may not exist yet */ }
  }

  function buildPayload(form: PostForm, firstImageUrl: string | null) {
    return {
      title: form.title, slug: form.slug, category: form.category || null,
      excerpt: form.excerpt || null, body: form.body || null,
      is_published: form.is_published, published_at: form.published_at,
      image_url: firstImageUrl,
      ...(form.author ? { author: form.author } : {}),
    }
  }

  async function add() {
    const { data, error } = await supabase.from('blog_posts')
      .insert(buildPayload(addForm, addImages[0]?.url || null)).select('id').single()
    if (error) { alert(`Save failed: ${error.message}`); return }
    if (data) await saveImages(data.id, addImages)
    setAddForm(emptyForm()); setAddImages([]); setShowAdd(false); load()
  }

  async function update() {
    if (!editingId) return
    const { error } = await supabase.from('blog_posts')
      .update(buildPayload(editForm, editImages[0]?.url || null)).eq('id', editingId)
    if (error) { alert(`Save failed: ${error.message}`); return }
    await saveImages(editingId, editImages)
    setEditingId(null); load()
  }

  async function del(id: number) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id); load()
  }

  async function startEdit(p: any) {
    setEditForm({
      title: p.title, slug: p.slug, category: p.category ?? '', author: p.author ?? '',
      excerpt: p.excerpt ?? '', body: p.body ?? '',
      is_published: p.is_published, published_at: p.published_at?.split('T')[0] ?? ''
    })
    const { data } = await supabase.from('blog_images').select('url,name').eq('post_id', p.id).order('sort_order')
    const imgs: ImageEntry[] = data ?? []
    // Fall back to the legacy image_url field if no blog_images entries exist
    if (imgs.length === 0 && p.image_url) {
      setEditImages([{ url: p.image_url, name: '' }])
    } else {
      setEditImages(imgs)
    }
    setEditingId(p.id)
    setShowAdd(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div>
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>News & Tastings</h1>
      </div>

      {/* Add form — collapsed by default */}
      {showAdd ? (
        <div className="bg-ivory-100 border border-ivory-300 rounded-sm p-5">
          <p className="text-xs tracking-widest uppercase text-burgundy-600 font-semibold mb-4">New Post</p>
          <PostFormFields
            form={addForm} setForm={setAddForm}
            images={addImages} setImages={setAddImages}
            onSave={add}
            onCancel={() => { setAddForm(emptyForm()); setAddImages([]); setShowAdd(false) }}
            saveLabel="Publish Post" isNew={true} />
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)}
          className="w-full border border-dashed border-burgundy-400 text-burgundy-700 hover:border-burgundy-600 px-4 py-2.5 text-xs tracking-widest uppercase rounded-sm transition-colors text-left">
          + New Post
        </button>
      )}

      {/* Post list */}
      <div className="space-y-2">
        {posts.map(p => (
          editingId === p.id ? (
            <div key={p.id} className="border border-burgundy-300 rounded-sm bg-ivory-50 p-4">
              <p className="text-xs tracking-widest uppercase text-burgundy-600 font-semibold mb-4 truncate">Editing: {p.title}</p>
              <PostFormFields
                form={editForm} setForm={setEditForm}
                images={editImages} setImages={setEditImages}
                onSave={update}
                onCancel={() => setEditingId(null)}
                saveLabel="Update" isNew={false} />
            </div>
          ) : (
            <div key={p.id} className="flex items-center gap-4 bg-white border border-ivory-300 rounded-sm px-4 py-3">
              {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded-sm flex-shrink-0 border border-ivory-200" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-burgundy-800 truncate">{p.title}</p>
                <p className="text-xs text-burgundy-700/60">
                  {p.published_at?.split('T')[0]}
                  {p.author ? ` · ${p.author}` : ''}
                  {' · '}{p.is_published ? 'Published' : 'Draft'}
                  {p.category ? ` · ${p.category}` : ''}
                  {p.views ? ` · ${p.views} views` : ''}
                  {p.likes ? ` · ${p.likes} likes` : ''}
                </p>
              </div>
              <button onClick={() => startEdit(p)} className="text-xs text-burgundy-700 hover:underline flex-shrink-0">Edit</button>
              <button onClick={() => del(p.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Delete</button>
            </div>
          )
        ))}
      </div>
    </div>
  )
}
