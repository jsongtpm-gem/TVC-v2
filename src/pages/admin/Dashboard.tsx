import { Link } from 'react-router-dom'

const sections = [
  { href: '/admin/home', label: 'Home Page', desc: 'Hero text, about blurb, CTA' },
  { href: '/admin/about', label: 'About', desc: 'History, mission, board of directors' },
  { href: '/admin/events', label: 'Events', desc: 'Create and manage club events' },
  { href: '/admin/membership', label: 'Membership', desc: 'Benefits, tiers, how to join' },
  { href: '/admin/blog', label: 'News & Tastings', desc: 'Blog posts and tasting notes' },
  { href: '/admin/faqs', label: 'FAQs', desc: 'Frequently asked questions' },
  { href: '/admin/contact', label: 'Contact', desc: 'Address, phone, email' },
  { href: '/admin/settings', label: 'Settings', desc: 'Logo and site settings' },
]

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-gold-500 mb-1">Admin</p>
        <h1 className="text-3xl font-semibold text-burgundy-800" style={{ fontFamily: 'var(--font-playfair)' }}>Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ href, label, desc }) => (
          <Link key={href} to={href} className="bg-white border border-ivory-300 rounded-sm p-5 hover:border-gold-400 hover:shadow-md transition-all duration-200 group">
            <h2 className="font-semibold text-burgundy-800 group-hover:text-burgundy-700 mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{label}</h2>
            <p className="text-sm text-burgundy-700/60">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
