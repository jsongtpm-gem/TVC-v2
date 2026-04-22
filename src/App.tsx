import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'

import Nav from './components/Nav'
import Footer from './components/Footer'
import AdminNav from './components/admin/AdminNav'

import Home from './pages/site/Home'
import About from './pages/site/About'
import Events from './pages/site/Events'
import EventDetail from './pages/site/EventDetail'
import Blog from './pages/site/Blog'
import BlogPost from './pages/site/BlogPost'
import Membership from './pages/site/Membership'
import FAQs from './pages/site/FAQs'
import Contact from './pages/site/Contact'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import HomeEditor from './pages/admin/HomeEditor'
import AboutEditor from './pages/admin/AboutEditor'
import EventsEditor from './pages/admin/EventsEditor'
import BlogEditor from './pages/admin/BlogEditor'
import FAQsEditor from './pages/admin/FAQsEditor'
import MembershipEditor from './pages/admin/MembershipEditor'
import ContactEditor from './pages/admin/ContactEditor'
import Settings from './pages/admin/Settings'

function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      setChecking(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (checking) return <div className="min-h-screen bg-ivory-100 flex items-center justify-center text-burgundy-700/50 text-sm">Loading…</div>
  if (!authed) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
        <Route path="/about" element={<SiteLayout><About /></SiteLayout>} />
        <Route path="/events" element={<SiteLayout><Events /></SiteLayout>} />
        <Route path="/events/:id" element={<SiteLayout><EventDetail /></SiteLayout>} />
        <Route path="/blog" element={<SiteLayout><Blog /></SiteLayout>} />
        <Route path="/blog/:slug" element={<SiteLayout><BlogPost /></SiteLayout>} />
        <Route path="/membership" element={<SiteLayout><Membership /></SiteLayout>} />
        <Route path="/faqs" element={<SiteLayout><FAQs /></SiteLayout>} />
        <Route path="/contact" element={<SiteLayout><Contact /></SiteLayout>} />

        {/* Admin login (no auth required) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected admin */}
        <Route path="/admin" element={<RequireAuth><AdminNav><Dashboard /></AdminNav></RequireAuth>} />
        <Route path="/admin/home" element={<RequireAuth><AdminNav><HomeEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/about" element={<RequireAuth><AdminNav><AboutEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/events" element={<RequireAuth><AdminNav><EventsEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/blog" element={<RequireAuth><AdminNav><BlogEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/faqs" element={<RequireAuth><AdminNav><FAQsEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/membership" element={<RequireAuth><AdminNav><MembershipEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/contact" element={<RequireAuth><AdminNav><ContactEditor /></AdminNav></RequireAuth>} />
        <Route path="/admin/settings" element={<RequireAuth><AdminNav><Settings /></AdminNav></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
