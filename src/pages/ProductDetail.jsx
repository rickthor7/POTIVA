import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Coins,
  Droplets,
  Gamepad2,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Truck,
} from 'lucide-react'
import { PRODUCTS, formatIDR } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { ProductArt, PottedPlant, Mascot } from '../components/illustrations'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const product = PRODUCTS.find((p) => p.id === id)
  usePageTitle(product?.name || 'Produk')
  const { actions, wallet, ownedCosmetics, potiLook } = useApp()
  const { openCart } = useUI()
  const toast = useToast()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [selectedSeed, setSelectedSeed] = useState(() => product?.seedOptions?.[0] || null)

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

  const isCosmetic = Boolean(product.cosmetic)
  const isSeed = Boolean(product.speciesId)
  const owned = isCosmetic && ownedCosmetics.includes(product.id)
  const canBuyCosmetic = wallet.coins >= product.coinPrice
  const canBuySeedCoin = isSeed && wallet.coins >= product.coinPrice

  const seedChoice = product.seedOptions?.length
    ? selectedSeed && product.seedOptions.includes(selectedSeed)
      ? selectedSeed
      : product.seedOptions[0]
    : null

  const add = () => {
    actions.addToCart(product.id, qty, seedChoice ? { variant: seedChoice } : undefined)
    toast(
      isSeed
        ? `${qty}× ${product.name} masuk keranjang. Setelah checkout, benih juga masuk Kebun Poti!`
        : seedChoice
          ? `${qty}× ${product.name} (Benih: ${seedChoice}) masuk keranjang.`
          : `${qty}× ${product.name} masuk keranjang.`,
      { title: 'Ditambahkan 🛒' },
    )
    openCart()
  }

  const buySeedCoin = () => {
    if (!canBuySeedCoin) {
      toast(`Butuh ${product.coinPrice - wallet.coins} koin lagi atau beli paket fisiknya lewat keranjang.`, {
        type: 'error',
        title: 'Koin belum cukup',
      })
      return
    }
    actions.buySeedWithCoins(product.id)
    toast(`${product.name} masuk Tas Benih Kebun Poti! 🌱`, { title: 'Siap ditanam di game' })
  }

  const buyNow = () => {
    actions.addToCart(product.id, qty, seedChoice ? { variant: seedChoice } : undefined)
    navigate('/checkout')
  }

  const buyCosmetic = () => {
    if (owned) {
      navigate('/garden?play=1')
      return
    }
    if (!canBuyCosmetic) {
      toast(`Kumpulkan ${product.coinPrice - wallet.coins} koin lagi dengan merawat kebun.`, {
        type: 'error',
        title: 'Koin belum cukup',
      })
      return
    }
    actions.buyCosmeticWithCoins(product.id)
    toast(`${product.name} terbuka dan langsung dipakai Poti!`, { title: 'Gaya baru ✨' })
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
            {isCosmetic ? (
              <>
                <div>
                  <Sparkles size={19} />
                  <span>Tampilan Poti</span>
                </div>
                <div>
                  <Check size={19} />
                  <span>Bisa dilepas</span>
                </div>
                <div>
                  <Coins size={19} />
                  <span>{product.coinPrice} koin</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Sparkles size={19} />
                  <span>Produk Pilihan</span>
                </div>
                <div>
                  <Droplets size={19} />
                  <span>Drainase baik</span>
                </div>
                <div>
                  <Sprout size={19} />
                  <span>Ramah pemula</span>
                </div>
              </>
            )}
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
            <span className="pdp__stock">
              {isCosmetic ? 'Aksesori digital' : `Stok ${product.stock}`}
            </span>
          </div>
          <div className={`pdp__price ${isCosmetic ? 'pdp__price--coins' : ''}`}>
            {isCosmetic ? (
              <>
                <Coins size={22} /> {product.coinPrice} koin
              </>
            ) : (
              formatIDR(product.price)
            )}
          </div>
          <p className="pdp__desc">{product.description}</p>

          <div className="pdp__includes">
            <h3>{isCosmetic ? 'Yang Poti dapat' : 'Isi paket'}</h3>
            <ul>
              {product.includes.map((item) => (
                <li key={item}>
                  <Check size={14} /> {item}
                </li>
              ))}
            </ul>
          </div>

          {product.seedOptions?.length > 0 && (
            <div className="pdp__variants">
              <h3>Pilih varian benih ({seedChoice})</h3>
              <div className="pdp__variant-list" role="radiogroup" aria-label="Pilihan benih">
                {product.seedOptions.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    role="radio"
                    aria-checked={seedChoice === seed}
                    className={`chip pdp__variant-chip ${seedChoice === seed ? 'is-active' : ''}`}
                    onClick={() => setSelectedSeed(seed)}
                  >
                    <Sprout size={14} /> {seed}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCosmetic ? (
            <div className="pdp__buy pdp__buy--cosmetic">
              <button
                className="btn btn--primary btn--lg"
                onClick={buyCosmetic}
                disabled={!owned && !canBuyCosmetic}
              >
                {owned ? (
                  <>
                    <Gamepad2 size={18} /> Pakai di game
                  </>
                ) : (
                  <>
                    <Coins size={18} /> Buka dengan {product.coinPrice} koin
                  </>
                )}
              </button>
              <Link to="/garden?play=1" className="btn btn--outline btn--lg">
                <Shirt size={18} /> Buka Lemari Gaya
              </Link>
            </div>
          ) : (
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
              {isSeed && (
                <button className="btn btn--fresh btn--lg" onClick={buySeedCoin}>
                  <Coins size={17} /> Benih game ({product.coinPrice} koin)
                </button>
              )}
            </div>
          )}

          {isCosmetic ? (
            <div className="pdp__ship pdp__ship--digital">
              <div>
                <Shirt size={18} />
                <span>
                  <strong>Langsung dipakai</strong>
                  Item otomatis masuk Lemari Gaya Poti.
                </span>
              </div>
              <div>
                <Coins size={18} />
                <span>
                  <strong>Koin kebun</strong>
                  Kumpulkan koin dengan merawat tanaman dan tantangan game.
                </span>
              </div>
              <div>
                <Gamepad2 size={18} />
                <span>
                  <strong>Bisa dilepas</strong>
                  Ganti gaya Poti kapan saja lewat tombol Gaya di game.
                </span>
              </div>
            </div>
          ) : (
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
          )}

          <p className="pdp__note">
            {isCosmetic ? (
              <>
                <Shirt size={15} /> Aksesori tersimpan di browser demo ini. Buka game untuk
                memakai, melepas, atau memadukannya dengan gaya lain.
              </>
            ) : (
              <>
                <Sprout size={15} /> Pot ini punya lubang drainase. Cek kelembapan media sebelum
                menyiram, ya — bukan hanya mengikuti jadwal.
              </>
            )}
          </p>
        </div>
      </div>

      <section className="pdp__related">
        <div className="panel-head">
          <div>
            <h2>{isCosmetic ? 'Gaya lainnya' : 'Lengkapi juga'}</h2>
            <p>
              {isCosmetic
                ? 'Padukan aksesori ini dengan gaya Poti yang lain.'
                : 'Kombinasi yang sering dibeli bersama produk ini.'}
            </p>
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

      {isCosmetic ? (
        <div className="pdp__art-note">
          <Mascot size={110} waving={false} look={potiLook} />
          <p>
            Penampilan Poti tersimpan di akunmu. Buka Lemari Gaya di game untuk memakai,
            melepas, atau mencoba kombinasi aksesori lain.
          </p>
          <Link to="/garden?play=1" className="btn btn--outline btn--sm">
            <Gamepad2 size={15} /> Buka Lemari Gaya
          </Link>
        </div>
      ) : (
        <div className="pdp__art-note">
          <PottedPlant width={90} growth={60} potTone="cream" />
          <p>
            Rawat tanamanmu sambil bermain di Kebun Poti 2D, kumpulkan koin, dan tukar hasil panen
            menjadi voucher diskon POTIVA.
          </p>
          <Link to="/garden?play=1" className="btn btn--outline btn--sm">
            <Gamepad2 size={15} /> Buka Kebun Poti
          </Link>
        </div>
      )}
    </div>
  )
}
