import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  QrCode,
  ShoppingBag,
  Sprout,
  Ticket,
  Truck,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { ProductArt, EmptyArt } from '../components/illustrations'
import { formatIDR } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'

const COURIERS = [
  { id: 'jne', label: 'JNE Reguler', eta: '2–3 hari', cost: 9000 },
  { id: 'sicepat', label: 'SiCepat REG', eta: '1–2 hari', cost: 11000 },
  { id: 'pickup', label: 'Ambil di Bandung', eta: 'Siap besok', cost: 0 },
]

const PAYMENTS = [
  { id: 'transfer', label: 'Transfer Bank', note: 'BCA · Mandiri · BNI', icon: CreditCard },
  { id: 'qris', label: 'QRIS', note: 'Scan dengan e-wallet apa pun', icon: QrCode },
  { id: 'cod', label: 'Bayar di Tempat', note: 'Tersedia untuk area tertentu', icon: Banknote },
]

export default function Checkout() {
  usePageTitle('Checkout')
  const { user, cartItems, cartSubtotal, vouchers = [], actions } = useApp()
  const toast = useToast()
  const [courier, setCourier] = useState('jne')
  const [payment, setPayment] = useState('transfer')
  const shopVouchers = useMemo(
    () => vouchers.filter((v) => !v.used && v.target === 'shop'),
    [vouchers],
  )
  const [selectedVoucherId, setSelectedVoucherId] = useState(() => {
    const first = vouchers.find((v) => !v.used && v.target === 'shop')
    return first?.id || ''
  })
  const [success, setSuccess] = useState(null)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: user?.fullName || '',
    phone: '',
    email: user?.email || '',
    address: '',
    city: user?.city || '',
    postal: '',
    notes: '',
  })

  const selectedCourier = COURIERS.find((c) => c.id === courier)
  const activeVoucher = shopVouchers.find((v) => v.id === selectedVoucherId) || null
  const discountAmount = activeVoucher ? Math.round((cartSubtotal * activeVoucher.discount) / 100) : 0
  const shippingCost = cartSubtotal >= 75000 ? 0 : selectedCourier.cost
  const total = Math.max(0, cartSubtotal - discountAmount) + shippingCost
  const selectedPayment = PAYMENTS.find((p) => p.id === payment)

  const snapshot = useMemo(
    () =>
      cartItems.map(({ product, qty, variant }) => ({
        name: variant ? `${product.name} · Benih ${variant}` : product.name,
        qty,
        price: product.price,
        art: product.art,
        hasSeed: Boolean(product.speciesId),
      })),
    [cartItems],
  )

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Nama penerima wajib diisi.'
    if (!/^[0-9+\-\s]{8,}$/.test(form.phone.trim())) next.phone = 'Masukkan nomor telepon yang valid.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Alamat email belum valid.'
    if (form.address.trim().length < 10) next.address = 'Alamat terlalu singkat, mohon lengkapi.'
    if (!form.city.trim()) next.city = 'Kota wajib diisi.'
    if (!/^\d{4,6}$/.test(form.postal.trim())) next.postal = 'Kode pos 4–6 digit.'
    return next
  }

  const submit = (e) => {
    e.preventDefault()
    if (cartItems.length === 0) return
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast('Ada beberapa data yang perlu dilengkapi.', { type: 'error', title: 'Cek lagi formnya' })
      return
    }
    const orderId = actions.checkout({
      shippingCost,
      voucherId: activeVoucher?.id || null,
      courier: `${selectedCourier.label} · ${selectedCourier.eta}`,
      payment: selectedPayment.label,
      address: `${form.address}, ${form.city} ${form.postal}`,
    })
    setSuccess({
      id: orderId,
      total,
      discountAmount,
      voucherCode: activeVoucher?.code || null,
      shippingCost,
      items: snapshot,
      hasSeeds: snapshot.some((i) => i.hasSeed),
      courier: selectedCourier,
      payment: selectedPayment,
    })
    toast('Pesananmu sedang diproses. Cek detailnya di halaman akun.', {
      title: 'Pesanan dibuat 🎉',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (success) {
    return (
      <div className="container page page--app">
        <div className="checkout-success card">
          <span className="checkout-success__icon">
            <CheckCircle2 size={34} />
          </span>
          <span className="eyebrow">Pesanan diterima</span>
          <h1>Terima kasih, {form.name.split(' ')[0] || 'Sahabat'}!</h1>
          <p>
            Pesanan <strong>{success.id}</strong> sudah kami catat. Konfirmasi pembayaran
            dan info pengiriman akan dikirim ke {form.email}.
          </p>

          <div className="checkout-success__steps">
            <div className="is-done">
              <span>
                <Check size={14} />
              </span>
              Pesanan dibuat
            </div>
            <i />
            <div>
              <span>2</span>
              Pembayaran
            </div>
            <i />
            <div>
              <span>3</span>
              Dikemas & dikirim
            </div>
          </div>

          <div className="checkout-success__box">
            <div className="checkout-success__items">
              {success.items.map((item) => (
                <div key={item.name} className="checkout-success__item">
                  <span className="checkout-success__thumb">
                    <ProductArt type={item.art} />
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.qty}× {formatIDR(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-success__totals">
              <div>
                <span>Metode</span>
                <strong>{success.payment.label}</strong>
              </div>
              <div>
                <span>Pengiriman</span>
                <strong>
                  {success.courier.label} · {success.courier.eta}
                </strong>
              </div>
              {success.discountAmount > 0 && (
                <div>
                  <span>Diskon voucher ({success.voucherCode})</span>
                  <strong>-{formatIDR(success.discountAmount)}</strong>
                </div>
              )}
              <div className="checkout-success__grand">
                <span>Total</span>
                <strong>{formatIDR(success.total)}</strong>
              </div>
            </div>
          </div>

          {success.hasSeeds && (
            <p className="checkout-success__seednote">
              <Sprout size={15} /> Benih yang kamu beli juga sudah masuk ke{' '}
              <Link to="/garden?play=1">Tas Benih Kebun Poti</Link> dan siap ditanam!
            </p>
          )}

          <p className="checkout-success__note">
            Ini adalah demo. Tidak ada pembayaran nyata yang diproses, dan pesanan hanya
            tersimpan di browser ini.
          </p>

          <div className="checkout-success__actions">
            <Link to="/account?tab=pesanan" className="btn btn--primary">
              <Package size={16} /> Lihat pesanan
            </Link>
            <Link to="/shop" className="btn btn--outline">
              Lanjut belanja
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container page page--app">
        <PageHeader eyebrow="Checkout" title="Keranjangmu masih kosong" subtitle="Tambahkan produk dulu sebelum checkout." />
        <div className="card card--pad empty">
          <EmptyArt variant="cart" />
          <h3>Belum ada yang bisa di-checkout</h3>
          <p>Mulai dari pot mini atau benih yang cocok untuk pemula.</p>
          <Link to="/shop" className="btn btn--primary">
            <ShoppingBag size={16} /> Jelajahi Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="Checkout"
        title="Satu langkah lagi menuju tanam pertama."
        subtitle="Isi data pengiriman dan pilih metode pembayaran. Semuanya bisa diubah sebelum pesanan dibuat."
        actions={
          <Link to="/shop" className="btn btn--outline">
            <ArrowLeft size={16} /> Kembali belanja
          </Link>
        }
      />

      <div className="checkout-steps">
        <div className="is-done">
          <span>
            <Check size={13} />
          </span>
          Keranjang
        </div>
        <i />
        <div className="is-active">
          <span>2</span>
          Pengiriman
        </div>
        <i />
        <div>
          <span>3</span>
          Pembayaran
        </div>
      </div>

      <form className="checkout-grid" onSubmit={submit} noValidate>
        <div className="checkout-main">
          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <MapPin size={18} /> Alamat penerima
                </h2>
                <p>Kami hanya mengirim ke alamat yang kamu isi di sini.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="c-name">Nama penerima</label>
                <input
                  id="c-name"
                  className={`input ${errors.name ? 'is-error' : ''}`}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Nama lengkap"
                  autoComplete="name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="c-phone">Nomor WhatsApp</label>
                <input
                  id="c-phone"
                  className={`input ${errors.phone ? 'is-error' : ''}`}
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="08xx xxxx xxxx"
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
              <div className="field field--full">
                <label htmlFor="c-email">Email</label>
                <input
                  id="c-email"
                  type="email"
                  className={`input ${errors.email ? 'is-error' : ''}`}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="namamu@email.com"
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="field field--full">
                <label htmlFor="c-address">Alamat lengkap</label>
                <textarea
                  id="c-address"
                  className={`textarea ${errors.address ? 'is-error' : ''}`}
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Jalan, nomor rumah, RT/RW, kecamatan, patokan"
                  rows={3}
                  autoComplete="street-address"
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>
              <div className="field">
                <label htmlFor="c-city">Kota / Kabupaten</label>
                <input
                  id="c-city"
                  className={`input ${errors.city ? 'is-error' : ''}`}
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Bandung"
                  autoComplete="address-level2"
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="field">
                <label htmlFor="c-postal">Kode pos</label>
                <input
                  id="c-postal"
                  className={`input ${errors.postal ? 'is-error' : ''}`}
                  value={form.postal}
                  onChange={(e) => set('postal', e.target.value)}
                  placeholder="40123"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
                {errors.postal && <span className="field-error">{errors.postal}</span>}
              </div>
              <div className="field field--full">
                <label htmlFor="c-notes">Catatan untuk kurir (opsional)</label>
                <input
                  id="c-notes"
                  className="input"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Contoh: titip ke pos keamanan jika tidak ada orang"
                />
              </div>
            </div>
          </section>

          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <Truck size={18} /> Metode pengiriman
                </h2>
                <p>Gratis pengiriman untuk belanja di atas {formatIDR(75000)}.</p>
              </div>
            </div>
            <div className="option-list">
              {COURIERS.map((c) => (
                <label key={c.id} className={`option ${courier === c.id ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="courier"
                    value={c.id}
                    checked={courier === c.id}
                    onChange={() => setCourier(c.id)}
                  />
                  <span className="option__radio" />
                  <div className="option__body">
                    <strong>{c.label}</strong>
                    <span>{c.eta}</span>
                  </div>
                  <span className="option__price">
                    {cartSubtotal >= 75000 || c.cost === 0 ? 'Gratis' : formatIDR(c.cost)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <CreditCard size={18} /> Metode pembayaran
                </h2>
                <p>Demo: tidak ada transaksi nyata yang diproses.</p>
              </div>
            </div>
            <div className="option-list">
              {PAYMENTS.map((p) => (
                <label key={p.id} className={`option ${payment === p.id ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value={p.id}
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                  />
                  <span className="option__radio" />
                  <span className="option__icon">
                    <p.icon size={18} />
                  </span>
                  <div className="option__body">
                    <strong>{p.label}</strong>
                    <span>{p.note}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="checkout-side">
          <section className="card card--pad checkout-summary">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Ringkasan pesanan</h2>
                <p>{cartItems.length} jenis produk</p>
              </div>
            </div>
            <ul className="checkout-items">
              {cartItems.map(({ product, qty, variant }) => (
                <li key={`${product.id}-${variant || 'std'}`}>
                  <span className="checkout-items__thumb">
                    <ProductArt type={product.art} />
                  </span>
                  <div>
                    <strong>
                      {product.name}
                      {variant ? ` · Benih ${variant}` : ''}
                    </strong>
                    <span>
                      {qty}× {formatIDR(product.price)}
                    </span>
                  </div>
                  <span className="checkout-items__sub">{formatIDR(product.price * qty)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-totals">
              <div>
                <span>Subtotal</span>
                <span>{formatIDR(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="checkout-totals__discount">
                  <span>Diskon {activeVoucher.discount}% ({activeVoucher.code})</span>
                  <span>-{formatIDR(discountAmount)}</span>
                </div>
              )}
              <div>
                <span>Pengiriman</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost)}</span>
              </div>
              <div className="checkout-totals__grand">
                <span>Total</span>
                <strong>{formatIDR(total)}</strong>
              </div>
            </div>

            {shopVouchers.length > 0 && (
              <div className="voucher-picker">
                <label htmlFor="checkout-voucher">
                  <Ticket size={14} /> Pakai Voucher Panen (10–15%)
                </label>
                <select
                  id="checkout-voucher"
                  className="select"
                  value={selectedVoucherId}
                  onChange={(e) => setSelectedVoucherId(e.target.value)}
                >
                  <option value="">Tidak pakai voucher</option>
                  {shopVouchers.map((vc) => (
                    <option key={vc.id} value={vc.id}>
                      {vc.code} · Diskon {vc.discount}% semua produk
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn btn--primary btn--lg btn--block">
              Buat pesanan <ArrowRight size={18} />
            </button>
            <p className="checkout-summary__note">
              <Sprout size={14} /> Dengan membuat pesanan, kamu setuju pada syarat layanan
              POTIVA (demo).
            </p>
          </section>

          <div className="checkout-side__help">
            <ShoppingBag size={16} /> Butuh bantuan? <Link to="/account?tab=bantuan">Hubungi kami</Link>
          </div>
        </aside>
      </form>
    </div>
  )
}
