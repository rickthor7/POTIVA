import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  HelpCircle,
  Leaf,
  ScanLine,
  Search,
  ShoppingBag,
  Sparkles,
  Sprout,
  Truck,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { EmptyArt, Mascot } from '../components/illustrations'
import { PRODUCTS, PRODUCT_CATEGORIES, formatIDR } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'
import { usePageTitle } from '../lib/usePageTitle'

export default function Shop() {
  usePageTitle('POTIVA Shop')
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('kategori')
  const [category, setCategory] = useState(
    initialCategory && PRODUCT_CATEGORIES.includes(initialCategory) ? initialCategory : 'Semua',
  )
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('populer')
  const { cartItems, cartCount, cartSubtotal, actions } = useApp()
  const { openCart } = useUI()

  const filtered = useMemo(() => {
    const list = PRODUCTS.filter((p) => (category === 'Semua' ? true : p.category === category)).filter((p) => {
      const q = search.trim().toLowerCase()
      return q ? `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q) : true
    })
    return list.sort((a, b) => {
      if (sort === 'murah') return a.price - b.price
      if (sort === 'mahal') return b.price - a.price
      return b.sold - a.sold
    })
  }, [category, search, sort])

  const chooseCategory = (cat) => {
    setCategory(cat)
    if (cat === 'Semua') setParams({}, { replace: true })
    else setParams({ kategori: cat }, { replace: true })
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="POTIVA Shop"
        title="Lengkapi kebutuhan menanammu."
        subtitle="Pot, benih, dan perawatan yang diuji untuk pemula. Setiap produk fisik membawa QR Plant ID."
        actions={
          <button className="btn btn--primary" onClick={openCart}>
            <ShoppingBag size={17} /> Keranjang {cartCount > 0 && <span className="btn__count">{cartCount}</span>}
          </button>
        }
      />

      <div className="shop-promo">
        <span>
          <Truck size={17} /> Gratis pengiriman untuk belanja di atas {formatIDR(75000)}
        </span>
        <span>
          <Check size={16} /> Garansi produk aman sampai tujuan
        </span>
        <span>
          <Sparkles size={16} /> QR Plant ID di setiap pot & benih
        </span>
      </div>

      <div className="shop-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="search"
            placeholder="Cari pot, benih, atau perlengkapan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari produk"
          />
        </div>
        <div className="shop-toolbar__right">
          <div className="scroll-x shop-cats">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'is-active' : ''}`}
                onClick={() => chooseCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <select className="select shop-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan produk">
            <option value="populer">Terpopuler</option>
            <option value="murah">Harga terendah</option>
            <option value="mahal">Harga tertinggi</option>
          </select>
        </div>
      </div>

      <div className="shop-layout">
        <div className="shop-main">
          {filtered.length === 0 ? (
            <div className="card card--pad empty">
              <EmptyArt variant="search" />
              <h3>Produk tidak ditemukan</h3>
              <p>Coba kata kunci lain atau lihat semua kategori.</p>
              <button
                className="btn btn--primary"
                onClick={() => {
                  setSearch('')
                  chooseCategory('Semua')
                }}
              >
                Lihat semua produk
              </button>
            </div>
          ) : (
            <>
              <p className="shop-count">
                Menampilkan <strong>{filtered.length}</strong> produk
              </p>
              <div className="product-grid shop-grid">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="shop-side">
          <section className="card card--pad shop-cart-card">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <ShoppingBag size={17} /> Ringkasan keranjang
                </h2>
                <p>{cartCount ? `${cartCount} item siap checkout` : 'Belum ada item'}</p>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="shop-cart-empty">
                <Sprout size={26} />
                <p>Keranjangmu kosong. Mulai dari satu pot kecil, yuk.</p>
              </div>
            ) : (
              <>
                <ul className="shop-cart-list">
                  {cartItems.slice(0, 3).map(({ product, qty }) => (
                    <li key={product.id}>
                      <span className="shop-cart-list__qty">{qty}×</span>
                      <div>
                        <strong>{product.name}</strong>
                        <span>{formatIDR(product.price * qty)}</span>
                      </div>
                      <button
                        className="shop-cart-list__remove"
                        onClick={() => actions.removeFromCart(product.id)}
                        aria-label={`Hapus ${product.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  {cartItems.length > 3 && (
                    <li className="shop-cart-list__more">+{cartItems.length - 3} produk lainnya</li>
                  )}
                </ul>
                <div className="shop-cart-total">
                  <span>Subtotal</span>
                  <strong>{formatIDR(cartSubtotal)}</strong>
                </div>
                <Link to="/checkout" className="btn btn--primary btn--block">
                  Checkout <ArrowRight size={16} />
                </Link>
                <button className="btn btn--ghost btn--block btn--sm" onClick={openCart}>
                  Buka keranjang
                </button>
              </>
            )}
          </section>

          <section className="card card--pad shop-help">
            <span className="shop-help__icon">
              <HelpCircle size={19} />
            </span>
            <strong>Bingung pilih pot?</strong>
            <p>Pot mini cocok untuk meja dan balkon sempit. Pot besar untuk tanaman yang tumbuh tinggi.</p>
            <Link to="/library" className="btn btn--outline btn--sm btn--block">
              <Leaf size={14} /> Baca panduan memilih pot
            </Link>
          </section>

          <section className="shop-scan-card">
            <Mascot size={92} waving={false} />
            <div>
              <strong>Sudah punya produk POTIVA?</strong>
              <p>Scan QR di kemasan untuk mengaktifkan Plant ID.</p>
              <Link to="/scan" className="btn btn--cream btn--sm">
                <ScanLine size={15} /> Scan sekarang
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
