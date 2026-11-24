import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ScanLine,
  ShoppingBag,
  Sprout,
  UserRound,
  X,
  Settings,
  BookOpen,
} from 'lucide-react'
import { Logo } from './illustrations'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'

const PUBLIC_LINKS = [
  { label: 'Fitur', to: '/#fitur' },
  { label: 'Cara Kerja', to: '/#cara-kerja' },
  { label: 'Shop', to: '/shop' },
  { label: 'E-Library', to: '/library' },
  { label: 'Komunitas', to: '/community' },
]

const APP_LINKS = [
  { label: 'Beranda', to: '/app', end: true },
  { label: 'My Garden', to: '/garden' },
  { label: 'Plant Care', to: '/care' },
  { label: 'Jurnal', to: '/journal' },
  { label: 'E-Library', to: '/library' },
  { label: 'Shop', to: '/shop' },
]

export default function Navbar({ mode = 'public' }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { user, guest, cartCount, actions } = useApp()
  const { openCart } = useUI()
  const location = useLocation()
  const navigate = useNavigate()
  const accountRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const logout = () => {
    actions.logout()
    setAccountOpen(false)
    navigate('/')
  }

  const links = mode === 'app' ? APP_LINKS : PUBLIC_LINKS
  const loggedIn = !guest && !!user

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${mode === 'app' ? 'nav--app' : ''}`}>
      <div className="container nav__inner">
        <Link to={mode === 'app' ? '/app' : '/'} className="nav__brand" aria-label="POTIVA — Beranda">
          <Logo />
        </Link>

        <nav className="nav__links" aria-label="Navigasi utama">
          {links.map((link) =>
            mode === 'app' ? (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ) : (
              <Link key={link.to} to={link.to} className="nav__link">
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="nav__actions">
          <Link to="/scan" className="btn btn--outline btn--sm nav__scan">
            <ScanLine size={16} /> Scan QR
          </Link>

          {mode === 'app' && (
            <Link to="/care" className="icon-btn nav__bell" aria-label="Notifikasi perawatan">
              <Bell size={19} />
              <span className="nav__dot" />
            </Link>
          )}

          <button className="icon-btn nav__cart" onClick={openCart} aria-label={`Keranjang, ${cartCount} item`}>
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
          </button>

          {mode === 'public' ? (
            <div className="nav__auth">
              {loggedIn ? (
                <Link to="/app" className="btn btn--primary nav__cta">
                  <Sprout size={17} /> Buka Kebun
                </Link>
              ) : (
                <>
                  <Link to="/masuk" className="nav__login">
                    Masuk
                  </Link>
                  <Link to="/masuk?tab=daftar" className="btn btn--primary nav__cta">
                    Mulai Sekarang
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="account" ref={accountRef}>
              <button
                className="account__btn"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="avatar avatar--sm">{loggedIn ? user.initials : '?'}</span>
                <span className="account__name">{loggedIn ? user.name : 'Tamu'}</span>
                <ChevronDown size={15} className={accountOpen ? 'is-rotated' : ''} />
              </button>
              {accountOpen && (
                <div className="account__menu" role="menu">
                  <div className="account__head">
                    <strong>{loggedIn ? user.fullName : 'Tamu POTIVA'}</strong>
                    <span>{loggedIn ? user.email : 'Belum masuk'}</span>
                  </div>
                  <Link to="/account" className="account__item" role="menuitem">
                    <UserRound size={16} /> Profil & Pengaturan
                  </Link>
                  <Link to="/journal" className="account__item" role="menuitem">
                    <BookOpen size={16} /> Jurnal tanamanku
                  </Link>
                  <button className="account__item" role="menuitem" onClick={() => navigate('/account?tab=pengaturan')}>
                    <Settings size={16} /> Preferensi
                  </button>
                  <div className="divider" />
                  {loggedIn ? (
                    <button className="account__item account__item--danger" role="menuitem" onClick={logout}>
                      <LogOut size={16} /> Keluar
                    </button>
                  ) : (
                    <Link to="/masuk" className="account__item" role="menuitem">
                      <UserRound size={16} /> Masuk ke akun
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            className="icon-btn nav__burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav__panel">
          <nav className="nav__panel-links" aria-label="Menu seluler">
            {mode === 'app' && (
              <NavLink to="/scan" className="nav__panel-link">
                <ScanLine size={18} /> Scan QR Plant ID
              </NavLink>
            )}
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="nav__panel-link" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {mode === 'app' && (
              <>
                <Link to="/community" className="nav__panel-link" onClick={() => setMenuOpen(false)}>
                  Komunitas
                </Link>
                <Link to="/account" className="nav__panel-link" onClick={() => setMenuOpen(false)}>
                  Profil
                </Link>
              </>
            )}
          </nav>
          <div className="nav__panel-foot">
            {loggedIn ? (
              <Link to="/app" className="btn btn--primary btn--block" onClick={() => setMenuOpen(false)}>
                <Sprout size={17} /> Buka Kebun
              </Link>
            ) : (
              <Link to="/masuk" className="btn btn--primary btn--block" onClick={() => setMenuOpen(false)}>
                Masuk / Daftar
              </Link>
            )}
            <p className="nav__panel-note">Grow Beyond Nature 🌿</p>
          </div>
        </div>
      )}
    </header>
  )
}
