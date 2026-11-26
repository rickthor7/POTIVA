import { Link } from 'react-router-dom'
import { Check, Coins, Plus, Star } from 'lucide-react'
import { formatIDR } from '../data/appData'
import { ProductArt } from './illustrations'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'

export default function ProductCard({ product, compact = false }) {
  const { actions, wallet, ownedCosmetics } = useApp()
  const toast = useToast()
  const isCosmetic = Boolean(product.cosmetic)
  const owned = isCosmetic && ownedCosmetics.includes(product.id)

  const addToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    actions.addToCart(product.id)
    toast(`${product.name} masuk keranjang.`, { title: 'Ditambahkan 🛒' })
  }

  const buyCosmetic = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (owned) return
    if (wallet.coins < product.coinPrice) {
      toast(
        `Kumpulkan ${product.coinPrice - wallet.coins} koin lagi dengan merawat kebun.`,
        { type: 'error', title: 'Koin belum cukup' },
      )
      return
    }
    actions.buyCosmeticWithCoins(product.id)
    toast(`${product.name} terbuka dan langsung dipakai Poti!`, {
      title: 'Gaya baru ✨',
    })
  }

  return (
    <article className={`product-card card card-hover ${compact ? 'product-card--compact' : ''}`}>
      <Link to={`/shop/${product.id}`} className="product-card__media" aria-label={`Lihat ${product.name}`}>
        {product.tag && <span className="badge badge--fresh product-card__tag">{product.tag}</span>}
        {owned && <span className="badge product-card__owned-badge">Dimiliki</span>}
        <ProductArt type={product.art} />
      </Link>
      <div className="product-card__body">
        <span className="product-card__cat">{product.category}</span>
        <Link to={`/shop/${product.id}`} className="product-card__title">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card__meta">
          <Star size={13} fill="currentColor" /> {product.rating}
          <span>·</span>
          {product.sold.toLocaleString('id-ID')} terjual
        </div>
        <div className="product-card__foot">
          <div>
            {isCosmetic ? (
              <strong className="product-card__coins">
                <Coins size={14} /> {product.coinPrice} koin
              </strong>
            ) : (
              <strong>{formatIDR(product.price)}</strong>
            )}
            {isCosmetic ? (
              <span className="product-card__stock">{owned ? 'Siap dipakai' : 'Buka di Lemari Gaya'}</span>
            ) : (
              product.stock < 20 && <span className="product-card__stock">Stok {product.stock}</span>
            )}
          </div>
          {isCosmetic ? (
            owned ? (
              <span className="product-card__owned" aria-label={`${product.name} sudah dimiliki`}>
                <Check size={18} />
              </span>
            ) : (
              <button
                className="btn btn--primary btn--icon product-card__add"
                onClick={buyCosmetic}
                aria-label={`Buka ${product.name} dengan ${product.coinPrice} koin`}
              >
                <Coins size={17} />
              </button>
            )
          ) : (
            <button
              className="btn btn--primary btn--icon product-card__add"
              onClick={addToCart}
              aria-label={`Tambah ${product.name} ke keranjang`}
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
