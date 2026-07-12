import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Logo from '../Logo'

const sections = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/home', label: 'Home Page', icon: '⌂' },
  { href: '/admin/events', label: 'Events', icon: '◷' },
  { href: '/admin/membership', label: 'Membership', icon: '✦' },
  { href: '/admin/blog', label: 'Blog', icon: '✎' },
  { href: '/admin/contact', label: 'Contact', icon: '✉' },
  { href: '/admin/about', label: 'About', icon: '◉' },
  { href: '/admin/faqs', label: 'FAQs', icon: '?' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
]

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const NavLinks = () => (
    <>
      {sections.map(({ href, label, icon }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
        return (
          <Link key={href} to={href} onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${active ? 'bg-burgundy-700 text-ivory-100' : 'text-burgundy-900/70 hover:bg-ivory-300 hover:text-burgundy-900'}`}>
            <span className="w-4 text-center opacity-60">{icon}</span>{label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-ivory-100 border-r border-ivory-300 flex-shrink-0">
        <div className="px-4 py-5 border-b border-ivory-300">
          <Logo height={32} variant="dark" />
          <p className="text-xs text-burgundy-700/50 mt-1 tracking-widest uppercase">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5"><NavLinks /></nav>
        <div className="px-3 py-4 border-t border-ivory-300">
          <Link to="/" className="block text-xs text-burgundy-700/60 hover:text-burgundy-700 mb-2 transition-colors">← View site</Link>
          <button onClick={logout} className="w-full text-left text-xs text-burgundy-700/60 hover:text-burgundy-700 transition-colors">Log out</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-ivory-100 border-b border-ivory-300 flex items-center justify-between px-4 h-12">
        <Logo height={28} variant="dark" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-burgundy-700 p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-ivory-100 pt-12">
          <nav className="px-3 py-4 space-y-0.5"><NavLinks /></nav>
          <div className="px-3 py-4 border-t border-ivory-300">
            <Link to="/" className="block text-xs text-burgundy-700/60 mb-2">← View site</Link>
            <button onClick={logout} className="text-xs text-burgundy-700/60">Log out</button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto pt-12 md:pt-0">{children}</main>
    </div>
  )
}
