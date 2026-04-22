import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { to: '/',           label: 'Home' },
  { to: '/about',      label: 'About' },
  { to: '/events',     label: 'Events' },
  { to: '/membership', label: 'Membership' },
  { to: '/blog',       label: 'News & Tastings' },
  { to: '/faqs',       label: 'FAQs' },
  { to: '/contact',    label: 'Contact' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-ivory-300 sticky top-0 z-50">
      <div className="hidden sm:block bg-burgundy-700 text-ivory-100 text-xs tracking-widest uppercase text-center py-1.5 px-4">
        Toronto Vintners Club &nbsp;·&nbsp; Est. in Toronto, Ontario
      </div>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center"><Logo height={40} variant="dark" /></Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to}
                className={`px-3 py-2 text-sm tracking-wide transition-colors rounded-sm ${active ? 'text-burgundy-700 font-semibold border-b-2 border-burgundy-700' : 'text-burgundy-900 hover:text-burgundy-700'}`}
                style={{ fontFamily: 'var(--font-source-serif)' }}>
                {label}
              </Link>
            )
          })}
        </nav>
        <button className="md:hidden text-burgundy-700 p-2" onClick={() => setOpen(!open)}>
          {open
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>
      {open && (
        <nav className="md:hidden bg-white border-t border-ivory-200 px-6 pb-4">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm border-b border-ivory-200 last:border-0 ${pathname === to ? 'text-burgundy-700 font-semibold' : 'text-burgundy-900'}`}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
