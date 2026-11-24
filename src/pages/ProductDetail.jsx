import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Droplets,
  Minus,
  Package,
  Plus,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Star,
  Truck,
} from 'lucide-react'
import { PRODUCTS, formatIDR } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { ProductArt, PottedPlant } from '../components/illustrations'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const product = PRODUCTS.find((p) => p.id === id)
  usePageTitle(product?.name || 'Produk')
  const { actions } = useApp()
  const { openCart } = useUI()
  const toast = useToast()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)

  if (!product) {
    return (
      <div className="container page page--app">
        <div className="card card--pad empty">
          <h3>Produk tidak ditemukan</h3>
          <p>Mungkin produk ini sudah tidak tersedia atau tautannya salah.</p>
          <Link to="/shop" className="btn btn--primary">
            <ArrowLeft size={16} /> Kembali ke Shop
          </Link>
        </div>
      </div>
    )
  }

  const add = () => {
    actions.addToCart(product.id, qty)
    toast(`${qty}× ${product.name} masuk keranjang.`, { title: 'Ditambahkan 🛒' })
    openCart()
  }

  const buyNow = () => {
    actions.addToCart(product.id, qty)
    navigate('/checkout')
  }

  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  const fallbackRelated = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <div className="container page page--app">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <Link to={`/shop?kategori=${product.category}`}>{product.category}</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      <div className="pdp">
        <div className="pdp__media">
          <div className="pdp__main">
            <ProductArt type={product.art} />
            {product.tag && <span className="badge badge--fresh pdp__tag">{product.tag}</span>}
          </div>
          <div className="pdp__perks">
            <div>
              <ScanLine size={19} />
              <span>QR Plant ID</span>
            </div>
            <div>
              <Droplets size={19} />
              <span>Drainase baik</span>
            </div>
            <div>
              <Sprout size={19} />
              <span>Ramah pemula</span>
            </div>
          </div>
        </div>

        <div className="pdp__info">
          <span className="pdp__cat">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="pdp__meta">
            <span className="pdp__rating">
              <Star size={15} fill="currentColor" /> {product.rating}
            </span>
            <span>·</span>
            <span>{product.sold.toLocaleString('id-ID')} terjual</span>
            <span>·</span>
            <span className="pdp__stock">Stok {product.stock}</span>
          </div>
          <div className="pdp__price">{formatIDR(product.price)}</div>
          <p className="pdp__desc">{product.description}</p>

          <div className="pdp__includes">
            <h3>Isi paket</h3>
            <ul>
              {product.includes.map((item) => (
                <li key={item}>
                  <Check size={14} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pdp__buy">
            <div className="qty qty--lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kurangi jumlah">
                <Minus size={15} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Tambah jumlah">
                <Plus size={15} />
              </button>
            </div>
            <button className="btn btn--outline btn--lg" onClick={add}>
              <ShoppingBag size={18} /> Tambah ke keranjang
            </button>
            <button className="btn btn--primary btn--lg" onClick={buyNow}>
              Beli sekarang <ArrowRight size={17} />
            </button>
          </div>

          <div className="pdp__ship">
            <div>
              <Truck size={18} />
              <span>
                <strong>Pengiriman 1–3 hari</strong>
                Gratis di atas {formatIDR(75000)}
              </span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <span>
                <strong>Garansi sampai tujuan</strong>
                Rusak saat kirim? Kami ganti.
              </span>
            </div>
            <div>
              <Package size={18} />
              <span>
                <strong>Dikemas aman</strong>
                Media tanam tidak berhamburan.
              </span>
            </div>
          </div>

          <p className="pdp__note">
            <Sprout size={15} /> Pot ini punya lubang drainase. Cek kelembapan media sebelum
            menyiram, ya — bukan hanya mengikuti jadwal.
          </p>
        </div>
      </div>

      <section className="pdp__related">
        <div className="panel-head">
          <div>
            <h2>Lengkapi juga</h2>
            <p>Kombinasi yang sering dibeli bersama produk ini.</p>
          </div>
          <Link to="/shop" className="panel-head__link">
            Semua produk <ChevronRight size={15} />
          </Link>
        </div>
        <div className="product-grid">
          {(related.length >= 2 ? related : fallbackRelated).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <div className="pdp__art-note">
        <PottedPlant width={90} growth={60} potTone="cream" />
        <p>
          Setiap pembelian pot atau benih POTIVA menyertakan QR untuk mengaktifkan profil
          tanaman digital di My Garden.
        </p>
        <Link to="/scan" className="btn btn--outline btn--sm">
          <ScanLine size={15} /> Coba scan demo
        </Link>
      </div>
    </div>
  )
}
