import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import MobileNav from './MobileNav'
import GameShortcut from './GameShortcut'
import { useApp } from '../store/AppStore'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return () => clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

export function PublicLayout() {
  return (
    <div className="site">
      <ScrollManager />
      <a href="#main" className="skip-link">
        Lewati ke konten utama
      </a>
      <Navbar mode="public" />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <GameShortcut />
    </div>
  )
}

export function AppLayout() {
  const { guest } = useApp()
  return (
    <div className="site site--app">
      <ScrollManager />
      <a href="#main" className="skip-link">
        Lewati ke konten utama
      </a>
      <Navbar mode="app" />
      <main id="main" className="app-main">
        {guest && (
          <div className="container">
            <div className="guest-banner">
              <span>
                <Sprout size={17} /> Kamu menjelajah sebagai tamu. Progres tersimpan di perangkat
                ini.
              </span>
              <Link to="/masuk" className="btn btn--sm btn--primary">
                Masuk untuk menyimpan
              </Link>
            </div>
          </div>
        )}
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container app-footer__inner">
          <span>🌱 POTIVA · Grow Beyond Nature</span>
          <div>
            <Link to="/garden?play=1">Kebun Poti</Link>
            <Link to="/library">E-Library</Link>
            <Link to="/community">Komunitas</Link>
            <Link to="/account?tab=bantuan">Bantuan</Link>
          </div>
        </div>
      </footer>
      <GameShortcut app />
      <MobileNav />
    </div>
  )
}
