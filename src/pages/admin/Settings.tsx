import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Settings() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  async function uploadLogo() {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = ext === 'svg' ? 'logo.svg' : 'logo.png'
    await supabase.storage.from('logos').upload(filename, file, { upsert: true })
    const url = supabase.storage.from('logos').getPublicUrl(filename).data.publicUrl
    await supabase.from('content').upsert({ page: 'settings', section: 'logo_url', value: url }, { onConflict: 'page,section' })
    setUploading(false); setUploaded(true)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Settings</h1>
      </div>

      <section className="bg-white border border-ivory-300 rounded-sm p-6">
        <h2 className="text-lg font-semibold text-burgundy-800 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Logo</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Upload Logo (PNG, JPG, SVG — max 2MB)</label>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setUploaded(false) } }}
              className="text-sm text-burgundy-700" />
          </div>
          {preview && (
            <div className="flex gap-6">
              <div className="bg-white border border-ivory-300 rounded-sm p-4 flex items-center justify-center">
                <img src={preview} alt="Preview (light)" style={{ height: 56 }} />
              </div>
              <div className="bg-burgundy-900 border border-burgundy-800 rounded-sm p-4 flex items-center justify-center">
                <img src={preview} alt="Preview (dark)" style={{ height: 56 }} />
              </div>
            </div>
          )}
          <button onClick={uploadLogo} disabled={!file || uploading}
            className="bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 px-6 py-2.5 text-sm tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
            {uploading ? 'Uploading…' : uploaded ? 'Uploaded ✓' : 'Upload Logo'}
          </button>
          {uploaded && <p className="text-sm text-green-700">Logo updated — refresh the site to see the change.</p>}
        </div>
      </section>
    </div>
  )
}
