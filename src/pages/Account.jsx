import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Coins,
  Flame,
  HelpCircle,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Trophy,
  UserRound,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { EmptyArt, PottedPlant } from '../components/illustrations'
import { formatIDR, levelFromXp } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { formatDateID } from '../lib/utils'

const TABS = [
  { id: 'profil', label: 'Profil', icon: UserRound },
  { id: 'tanaman', label: 'Tanaman', icon: Sprout },
  { id: 'pesanan', label: 'Pesanan', icon: Package },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings2 },
  { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
]

const FAQ = [
  {
    q: 'Bagaimana cara mengaktifkan Plant ID?',
    a: 'Buka halaman Scan, arahkan kamera ke QR pada kemasan POTIVA, lalu konfirmasi jenis tanaman dan tanggal tanam. Bisa juga masukkan kode secara manual.',
  },
  {
    q: 'Apakah progres game sama dengan kondisi tanaman asli?',
    a: 'Tidak. Progres My Garden adalah gamifikasi dari aktivitas yang kamu catat. Untuk kondisi nyata, gunakan foto dan catatan di Plant Journal.',
  },
  {
    q: 'Mengapa jadwal perawatan berbeda dengan tanaman teman saya?',
    a: 'Jadwal mempertimbangkan jenis tanaman, fase pertumbuhan, lokasi, dan preferensimu. Semua jadwal bisa diubah di Plant Care.',
  },
  {
    q: 'Apakah e-book bisa dibaca selamanya?',
    a: 'Ya. Setelah pembelian terkonfirmasi, e-book tetap ada di tab Milikku dan bisa dibaca kapan saja.',
  },
  {
    q: 'Bagaimana data saya disimpan?',
    a: 'Versi demo ini menyimpan data di localStorage browser-mu. Tidak ada data yang dikirim ke server.',
  },
]

export default function Account() {
  usePageTitle('Akun')
  const { user, guest, wallet, plants, journals, careHistory, orders, settings, getSpecies, actions } = useApp()
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('tab') || 'profil'
  const tab = TABS.some((t) => t.id === rawTab) ? rawTab : 'profil'
  const toast = useToast()
  const { openCart } = useUI()
  const level = levelFromXp(wallet.xp)
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    city: user?.city || '',
    phone: user?.phone || '',
  })

  const setTab = (id) => setParams({ tab: id }, { replace: true })
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const saveProfile = (e) => {
    e.preventDefault()
    if (!form.fullName.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast('Nama dan email yang valid wajib diisi.', { type: 'error' })
      return
    }
    actions.updateProfile({
      fullName: form.fullName,
      name: form.fullName.split(' ')[0],
      email: form.email,
      city: form.city,
      phone: form.phone,
      initials: form.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join(''),
    })
    actions.login({ name: form.fullName, email: form.email })
    toast('Perubahan profil tersimpan.', { title: 'Profil diperbarui' })
  }

  const reorder = (order) => {
    order.items.forEach((item) => actions.addToCart(item.productId, item.qty))
    openCart()
    toast('Produk dari pesanan sebelumnya masuk keranjang.', { title: 'Beli lagi 🛒' })
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="Akun"
        title={`Halo, ${guest ? 'Tamu' : user?.name || 'Sahabat'}!`}
        subtitle="Kelola profil, tanaman, pesanan, dan preferensi notifikasimu di satu tempat."
      />

      <section className="account-hero">
        <div className="account-hero__cover" />
        <div className="account-hero__main">
          <span className="avatar avatar--lg">{guest ? '?' : user?.initials || 'SP'}</span>
          <div className="account-hero__info">
            <h2>{guest ? 'Tamu POTIVA' : user?.fullName}</h2>
            <p>{guest ? 'Masuk untuk menyimpan profilmu' : user?.email}</p>
            <div className="account-hero__tags">
              <span className="badge">
                <MapPin size={12} /> {user?.city || 'Indonesia'}
              </span>
              <span className="badge badge--fresh">
                <Trophy size={12} /> Level {level.level}
              </span>
              <span className="badge">
                <CalendarDays size={12} /> Bergabung {user?.joined || '2026'}
              </span>
            </div>
          </div>
          <div className="account-hero__actions">
            {guest ? (
              <Link to="/masuk" className="btn btn--primary">
                <UserRound size={16} /> Masuk
              </Link>
            ) : (
              <>
                <button className="btn btn--outline btn--sm" onClick={() => setTab('profil')}>
                  <Pencil size={14} /> Edit profil
                </button>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    actions.logout()
                    toast('Kamu sudah keluar dari akun demo.', { type: 'info' })
                  }}
                >
                  <LogOut size={14} /> Keluar
                </button>
              </>
            )}
          </div>
        </div>
        <div className="account-hero__stats">
          <div>
            <strong>{plants.length}</strong>
            <span>Tanaman</span>
          </div>
          <div>
            <strong>{journals.length}</strong>
            <span>Catatan jurnal</span>
          </div>
          <div>
            <strong>{careHistory.length}</strong>
            <span>Perawatan</span>
          </div>
          <div>
            <strong>
              <Flame size={16} /> {wallet.streak}
            </strong>
            <span>Hari beruntun</span>
          </div>
        </div>
      </section>

      <nav className="account-tabs" aria-label="Menu akun">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`account-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      {tab === 'profil' && (
        <div className="account-grid">
          <form className="card card--pad" onSubmit={saveProfile}>
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Informasi profil</h2>
                <p>Nama ini tampil di jurnal dan komunitas.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="field field--full">
                <label htmlFor="a-name">Nama lengkap</label>
                <input id="a-name" className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="a-email">Email</label>
                <input id="a-email" type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="a-phone">Nomor telepon</label>
                <input id="a-phone" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08xx xxxx xxxx" />
              </div>
              <div className="field field--full">
                <label htmlFor="a-city">Kota</label>
                <input id="a-city" className="input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Bandung" />
              </div>
            </div>
            <div className="account-form-actions">
              <button type="submit" className="btn btn--primary">
                <Check size={16} /> Simpan perubahan
              </button>
              <span>Data demo tersimpan lokal di browser.</span>
            </div>
          </form>

          <div className="account-side">
            <section className="card card--pad account-wallet">
              <span className="eyebrow">Dompet kebun</span>
              <div className="account-wallet__coins">
                <Coins size={22} />
                <strong>{wallet.coins}</strong>
                <span>koin</span>
              </div>
              <div className="progress progress--thin">
                <div className="progress__bar" style={{ width: `${level.percent}%` }} />
              </div>
              <span className="account-wallet__xp">
                Level {level.level} · {level.current}/{level.target} XP
              </span>
              <Link to="/garden" className="btn btn--outline btn--sm btn--block">
                Buka My Garden <ArrowRight size={14} />
              </Link>
            </section>

            <section className="card card--pad">
              <span className="eyebrow">Keamanan</span>
              <h3 className="account-side__title">Kata sandi</h3>
              <p className="account-side__text">Terakhir diubah 30 hari lalu.</p>
              <button
                className="btn btn--outline btn--sm btn--block"
                onClick={() => toast('Fitur ubah kata sandi tersedia di versi produksi.', { type: 'info' })}
              >
                <ShieldCheck size={15} /> Ubah kata sandi
              </button>
            </section>
          </div>
        </div>
      )}

      {tab === 'tanaman' && (
        <div className="account-plants">
          <div className="panel-head">
            <div>
              <h2>Tanamanmu</h2>
              <p>{plants.length} profil tanaman aktif.</p>
            </div>
            <Link to="/scan" className="btn btn--primary btn--sm">
              <Plus size={15} /> Tambah tanaman
            </Link>
          </div>
          {plants.length === 0 ? (
            <div className="card card--pad empty">
              <EmptyArt variant="garden" />
              <h3>Belum ada tanaman</h3>
              <p>Scan QR produk POTIVA untuk memulai.</p>
              <Link to="/scan" className="btn btn--primary">
                Scan produk
              </Link>
            </div>
          ) : (
            <div className="account-plant-list">
              {plants.map((plant) => {
                const species = getSpecies(plant)
                return (
                  <div className="account-plant card" key={plant.id}>
                    <div className="account-plant__art">
                      <PottedPlant width={78} growth={plant.growth} potTone={plant.potTone} />
                    </div>
                    <div className="account-plant__info">
                      <strong>{plant.name}</strong>
                      <span>
                        {species?.emoji} {species?.latin} · {plant.location}
                      </span>
                      <div className="account-plant__bar">
                        <div className="progress progress--thin">
                          <div className="progress__bar" style={{ width: `${plant.growth}%` }} />
                        </div>
                        <small>{plant.growth}%</small>
                      </div>
                      <span className="account-plant__date">
                        <CalendarDays size={12} /> Ditanam {formatDateID(plant.plantedAt, { year: false })}
                      </span>
                    </div>
                    <Link to={`/garden?plant=${plant.id}`} className="btn btn--outline btn--sm">
                      Rawat
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'pesanan' && (
        <div className="account-orders">
          <div className="panel-head">
            <div>
              <h2>Pesanan</h2>
              <p>{orders.length} pesanan tercatat.</p>
            </div>
            <Link to="/shop" className="btn btn--outline btn--sm">
              <ShoppingBag size={14} /> Belanja lagi
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="card card--pad empty">
              <EmptyArt variant="cart" />
              <h3>Belum ada pesanan</h3>
              <p>Produk yang kamu beli akan muncul di sini.</p>
              <Link to="/shop" className="btn btn--primary">
                Jelajahi Shop
              </Link>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => (
                <article className="order-card card" key={order.id}>
                  <header className="order-card__head">
                    <div>
                      <strong>{order.id}</strong>
                      <span>
                        <CalendarDays size={12} /> {formatDateID(order.date)}
                      </span>
                    </div>
                    <span className={`badge ${order.status === 'Diproses' ? 'badge--warning' : ''}`}>
                      {order.status}
                    </span>
                  </header>
                  <ul className="order-card__items">
                    {order.items.map((item) => (
                      <li key={item.productId}>
                        <span>{item.qty}×</span> {item.name}
                        <em>{formatIDR(item.price * item.qty)}</em>
                      </li>
                    ))}
                  </ul>
                  <footer className="order-card__foot">
                    <span>{order.courier || 'Pengiriman standar'} · {order.payment || 'Transfer Bank'}</span>
                    <div>
                      <strong>{formatIDR(order.total)}</strong>
                      <button className="btn btn--sm btn--outline" onClick={() => reorder(order)}>
                        Beli lagi
                      </button>
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pengaturan' && (
        <div className="account-grid">
          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <Bell size={18} /> Notifikasi
                </h2>
                <p>Pilih kabar yang memang ingin kamu terima.</p>
              </div>
            </div>
            {[
              ['reminderOn', 'Pengingat perawatan', 'Tugas yang jatuh tempo dan jadwal hari ini.'],
              ['journalOn', 'Pengingat jurnal', 'Ajakan mencatat setelah beberapa hari tanpa update.'],
              ['pushOn', 'Web push', 'Notifikasi lewat browser (butuh izin).'],
              ['emailOn', 'Email ringkasan', 'Rangkuman mingguan kebunmu.'],
              ['promoOn', 'Promo & produk baru', 'Maksimal dua kali sebulan.'],
              ['quietHours', 'Jam tenang', 'Tidak ada notifikasi antara 21.00–07.00.'],
            ].map(([key, title, desc]) => (
              <div className="setting-row" key={key}>
                <div>
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!settings[key]}
                    onChange={(e) => {
                      actions.updateSettings({ [key]: e.target.checked })
                      toast('Preferensi notifikasi diperbarui.', { type: 'info' })
                    }}
                    aria-label={title}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            ))}
            <div className="care-settings__time">
              <label htmlFor="account-reminder">
                <Bell size={15} /> Jam pengingat utama
              </label>
              <input
                id="account-reminder"
                type="time"
                className="input"
                value={settings.reminderTime}
                onChange={(e) => actions.updateSettings({ reminderTime: e.target.value })}
              />
            </div>
          </section>

          <div className="account-side">
            <section className="card card--pad">
              <span className="eyebrow">Privasi</span>
              <h3 className="account-side__title">Datamu, kendalimu</h3>
              <p className="account-side__text">
                Foto jurnal dan catatan tanaman hanya tersimpan di perangkat ini pada versi
                demo. Di produksi, akses dibatasi sesuai izin akun.
              </p>
              <button
                className="btn btn--outline btn--sm btn--block"
                onClick={() => toast('Kebijakan privasi lengkap tersedia di versi produksi.', { type: 'info' })}
              >
                Baca kebijakan privasi
              </button>
            </section>
            <section className="card card--pad reset-card">
              <span className="eyebrow">Zona demo</span>
              <h3 className="account-side__title">Reset data demo</h3>
              <p className="account-side__text">
                Kembalikan tanaman, jurnal, keranjang, dan pesanan ke kondisi awal.
              </p>
              <button
                className="btn btn--danger btn--sm btn--block"
                onClick={() => {
                  actions.resetDemo()
                  toast('Data demo sudah dikembalikan ke awal.', { title: 'Reset selesai' })
                }}
              >
                <RotateCcw size={14} /> Reset sekarang
              </button>
            </section>
          </div>
        </div>
      )}

      {tab === 'bantuan' && (
        <div className="account-grid">
          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Pertanyaan yang sering muncul</h2>
                <p>Jawaban singkat untuk hal yang paling sering ditanyakan.</p>
              </div>
            </div>
            <div className="faq-list">
              {FAQ.map((item) => (
                <details className="faq" key={item.q}>
                  <summary>
                    {item.q} <ChevronDown size={16} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="account-side">
            <section className="card card--pad">
              <span className="eyebrow">Hubungi kami</span>
              <h3 className="account-side__title">Butuh bantuan lain?</h3>
              <p className="account-side__text">
                Tim POTIVA siap membantu pada hari kerja, 09.00–17.00 WIB.
              </p>
              <a href="mailto:halo@potiva.id" className="btn btn--outline btn--sm btn--block">
                <Mail size={14} /> halo@potiva.id
              </a>
              <Link to="/scan" className="btn btn--ghost btn--sm btn--block">
                <Leaf size={14} /> Panduan scan QR
              </Link>
            </section>
            <section className="card card--pad account-side__help">
              <Sprout size={22} />
              <strong>Grow Beyond Nature.</strong>
              <p>Terima kasih sudah menanam bersama POTIVA.</p>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
