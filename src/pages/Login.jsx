import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  Sparkles,
  Sprout,
  Trophy,
  UserRound,
} from 'lucide-react'
import { Logo, Mascot, PottedPlant } from '../components/illustrations'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'

const BENEFITS = [
  'Plant ID otomatis untuk produk POTIVA yang kamu beli',
  'Jadwal perawatan yang bisa disesuaikan dengan ritme harianmu',
  'Jurnal foto dan taman virtual yang tumbuh bersama usahamu',
]

export default function Login() {
  usePageTitle('Masuk')
  const [params, setParams] = useSearchParams()
  const mode = params.get('tab') === 'daftar' ? 'daftar' : 'masuk'
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const toast = useToast()
  const navigate = useNavigate()
  const { user, guest, actions } = useApp()

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
  }

  const switchMode = (next) => {
    setParams(next === 'daftar' ? { tab: 'daftar' } : {}, { replace: true })
    setError('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (mode === 'daftar' && form.name.trim().length < 2) {
      setError('Tulis namamu dulu, ya (minimal 2 karakter).')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Alamat email belum valid. Contoh: nama@email.com')
      return
    }
    if (form.password.length < 6) {
      setError('Kata sandi minimal 6 karakter untuk versi demo ini.')
      return
    }
    actions.login({
      name: mode === 'daftar' ? form.name.trim() : form.name.trim() || user?.fullName || 'Sahabat',
      email: form.email.trim(),
    })
    toast(
      mode === 'daftar'
        ? 'Akun demo dibuat. Semua progres tersimpan di browser ini.'
        : 'Selamat datang kembali. Kebunmu menunggu.',
      { title: mode === 'daftar' ? 'Akun siap 🌱' : 'Berhasil masuk 👋' },
    )
    navigate('/app')
  }

  return (
    <div className="container page auth-page">
      <div className="auth">
        <aside className="auth-visual">
          <div className="auth-visual__top">
            <Logo light />
            <span className="auth-visual__badge">
              <Sparkles size={13} /> Grow Beyond Nature
            </span>
          </div>
          <h2>Satu pot kecil bisa jadi awal yang besar.</h2>
          <p>
            Masuk untuk menghubungkan produk POTIVA-mu, menyimpan jurnal pertumbuhan,
            dan merawat taman virtual yang tumbuh bersama usahamu.
          </p>
          <ul className="auth-visual__list">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span>
                  <Check size={13} />
                </span>
                {b}
              </li>
            ))}
          </ul>
          <div className="auth-visual__scene">
            <Mascot size={176} />
            <div className="auth-visual__card">
              <span>
                <Trophy size={15} />
              </span>
              <div>
                <strong>Level 3</strong>
                <span>430 XP · 120 koin</span>
              </div>
            </div>
            <div className="auth-visual__plant">
              <PottedPlant width={96} growth={62} potTone="cream" />
            </div>
          </div>
        </aside>

        <div className="auth-panel">
          {!guest && user && (
            <div className="auth-signed">
              <span className="avatar avatar--sm">{user.initials}</span>
              <span>
                Sudah masuk sebagai <strong>{user.name}</strong>
              </span>
              <Link to="/app" className="btn btn--sm btn--primary">
                Buka kebun
              </Link>
            </div>
          )}

          <div className="auth-tabs">
            <button className={mode === 'masuk' ? 'is-active' : ''} onClick={() => switchMode('masuk')}>
              Masuk
            </button>
            <button className={mode === 'daftar' ? 'is-active' : ''} onClick={() => switchMode('daftar')}>
              Daftar
            </button>
          </div>

          <h1>{mode === 'masuk' ? 'Selamat datang kembali.' : 'Mulai kebun pertamamu.'}</h1>
          <p className="auth-panel__sub">
            {mode === 'masuk'
              ? 'Lanjutkan perjalanan menanammu dari tempat terakhir.'
              : 'Gratis, tanpa kartu kredit. Cukup satu email untuk memulai.'}
          </p>

          <form className="auth-form" onSubmit={submit} noValidate>
            {mode === 'daftar' && (
              <div className="field">
                <label htmlFor="auth-name">Nama</label>
                <div className="input-icon">
                  <UserRound size={17} />
                  <input
                    id="auth-name"
                    className="input"
                    placeholder="Nama panggilanmu"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}
            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <div className="input-icon">
                <Mail size={17} />
                <input
                  id="auth-email"
                  type="email"
                  className="input"
                  placeholder="namamu@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="field">
              <div className="field-row">
                <label htmlFor="auth-password">Kata sandi</label>
                {mode === 'masuk' && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => toast('Reset kata sandi tersedia di versi produksi.', { type: 'info' })}
                  >
                    Lupa?
                  </button>
                )}
              </div>
              <div className="input-icon">
                <Lock size={17} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete={mode === 'masuk' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="input-icon__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn--primary btn--lg btn--block">
              {mode === 'masuk' ? 'Masuk ke kebunku' : 'Buat akun & mulai'} <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-divider">
            <span>atau lanjutkan dengan</span>
          </div>
          <div className="auth-social">
            <button
              className="btn btn--outline"
              onClick={() => toast('Google login tersedia di versi produksi.', { type: 'info' })}
            >
              <span className="auth-social__g">G</span> Google
            </button>
            <button
              className="btn btn--outline"
              onClick={() => toast('Apple login tersedia di versi produksi.', { type: 'info' })}
            >
              <span className="auth-social__a"></span> Apple
            </button>
          </div>

          <div className="auth-demo">
            <Leaf size={15} />
            <p>
              <strong>Mode demo:</strong> gunakan email apa pun dan kata sandi minimal 6
              karakter. Tidak ada data yang dikirim ke server.
            </p>
          </div>

          <p className="auth-terms">
            Dengan melanjutkan, kamu setuju pada <a href="#syarat">Syarat Layanan</a> dan{' '}
            <a href="#privasi">Kebijakan Privasi</a> POTIVA.
          </p>
          <Link to="/" className="auth-back">
            <Sprout size={14} /> Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
