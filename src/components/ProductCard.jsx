import { Link } from 'react-router-dom'
import { Plus, Star } from 'lucide-react'
import { formatIDR } from '../data/appData'
import { ProductArt } from './illustrations'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'

export default function ProductCard({ product, compact = false }) {
  const { actions } = useApp()
  const toast = useToast()

  const addToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    actions.addToCart(product.id)
    toast(`${product.name} masuk keranjang.`, { title: 'Ditambahkan 🛒' })
  }

  return (
    <article className={`product-card card card-hover ${compact ? 'product-card--compact' : ''}`}>
      <Link to={`/shop/${product.id}`} className="product-card__media" aria-label={`Lihat ${product.name}`}>
        {product.tag && <span className="badge badge--fresh product-card__tag">{product.tag}</span>}
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
            <strong>{formatIDR(product.price)}</strong>
            {product.stock < 20 && <span className="product-card__stock">Stok {product.stock}</span>}
          </div>
          <button
            className="btn btn--primary btn--icon product-card__add"
            onClick={addToCart}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
