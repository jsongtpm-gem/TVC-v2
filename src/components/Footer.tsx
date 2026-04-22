import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-burgundy-900 text-ivory-200 mt-12 md:mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-12 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3"><Logo height={44} variant="light" /></div>
          <p className="text-sm leading-relaxed text-ivory-200/80">
            A community of wine enthusiasts exploring the world's great vineyards, one bottle at a time.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-gold-400 mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'],['/about','About the Club'],['/events','Events'],['/membership','Membership'],['/blog','News & Tastings'],['/faqs','FAQs'],['/contact','Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-ivory-200/70 hover:text-ivory-100 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-gold-400 mb-4">Contact</h4>
          <address className="not-italic text-sm text-ivory-200/70 space-y-2 leading-relaxed">
            <p>218 Walmer Road<br />Toronto, ON M5R 3R7</p>
            <p>+1 (416) 209-1442</p>
            <p><a href="mailto:info@torontovintners.org" className="hover:text-ivory-100 transition-colors">info@torontovintners.org</a></p>
          </address>
        </div>
      </div>
      <div className="border-t border-ivory-200/10 px-6 py-5 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-ivory-200/40">© {new Date().getFullYear()} Toronto Vintners Club Inc. All rights reserved.</p>
        <Link to="/admin" className="text-xs text-ivory-200/20 hover:text-ivory-200/50 transition-colors">Admin</Link>
      </div>
    </footer>
  )
}
