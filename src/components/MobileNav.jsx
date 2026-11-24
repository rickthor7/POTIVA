import { NavLink } from 'react-router-dom'
import { Home, Sprout, CalendarCheck2, ShoppingBag, UserRound } from 'lucide-react'
import { useApp } from '../store/AppStore'

const ITEMS = [
  { to: '/app', label: 'Beranda', icon: Home, end: true },
  { to: '/garden', label: 'Garden', icon: Sprout },
  { to: '/care', label: 'Care', icon: CalendarCheck2 },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/account', label: 'Profil', icon: UserRound },
]

export default function MobileNav() {
  const { cartCount } = useApp()
  return (
    <nav className="mobile-nav" aria-label="Navigasi bawah">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `mobile-nav__item ${isActive ? 'is-active' : ''}`}
        >
          <span className="mobile-nav__icon">
            <Icon size={21} strokeWidth={2.2} />
            {to === '/shop' && cartCount > 0 && <span className="mobile-nav__badge">{cartCount}</span>}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
