import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Invalid email or password.'); setLoading(false) }
    else navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-burgundy-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-sm shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-burgundy-800 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>Toronto Vintners Club</h1>
          <p className="text-xs tracking-widest uppercase text-gold-500">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase text-burgundy-600 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-ivory-300 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy-700 transition-colors" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-ivory-100 py-2.5 text-sm tracking-widest uppercase transition-colors rounded-sm disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
