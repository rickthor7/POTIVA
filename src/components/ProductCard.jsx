import { Link } from 'react-router-dom'
import { Check, Coins, Plus, Sprout, Star } from 'lucide-react'
import { formatIDR } from '../data/appData'
import { ProductArt } from './illustrations'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'

export default function ProductCard({ product, compact = false }) {
  const { actions, wallet, ownedCosmetics, seedInventory = {} } = useApp()
  const toast = useToast()
  const isCosmetic = Boolean(product.cosmetic)
  const isSeed = Boolean(product.speciesId)
  const owned = isCosmetic && ownedCosmetics.includes(product.id)
  const ownedSeeds = isSeed ? seedInventory[product.speciesId] || 0 : 0

  const addToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const seedChoice = product.seedOptions?.[0] || null
    actions.addToCart(product.id, 1, seedChoice ? { variant: seedChoice } : undefined)
    toast(
      isSeed
        ? `${product.name} masuk keranjang. Setelah checkout, benih juga masuk Kebun Poti!`
        : seedChoice
          ? `${product.name} (Benih: ${seedChoice}) masuk keranjang. Buka produk untuk ganti pilihan benih.`
          : `${product.name} masuk keranjang.`,
      { title: 'Ditambahkan 🛒' },
    )
  }

  const buySeedCoin = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (wallet.coins < product.coinPrice) {
      toast(
        `Kumpulkan ${product.coinPrice - wallet.coins} koin lagi atau beli paket fisiknya lewat keranjang.`,
        { type: 'error', title: 'Koin belum cukup' },
      )
      return
    }
    actions.buySeedWithCoins(product.id)
    toast(`${product.name} masuk Tas Benih Kebun Poti! 🌱`, { title: 'Siap ditanam di game' })
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
            ) : isSeed ? (
              <span className="product-card__stock">
                {ownedSeeds > 0 ? `Di Tas Benih: ${ownedSeeds}` : 'Bisa ditanam di Kebun Poti'}
              </span>
            ) : product.seedOptions?.length ? (
              <span className="product-card__stock">Pilih 9 varian benih</span>
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
          ) : isSeed ? (
            <div className="product-card__seed-acts">
              <button
                className="btn btn--outline btn--icon product-card__seed-coin"
                onClick={buySeedCoin}
                title={`Beli benih virtual game (${product.coinPrice} koin)`}
                aria-label={`Beli ${product.name} untuk game dengan ${product.coinPrice} koin`}
              >
                <Sprout size={16} />
              </button>
              <button
                className="btn btn--primary btn--icon product-card__add"
                onClick={addToCart}
                aria-label={`Tambah ${product.name} ke keranjang`}
              >
                <Plus size={18} />
              </button>
            </div>
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
