import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Leaf } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'
import { formatIDR } from '../data/appData'
import { ProductArt, Sprout } from './illustrations'

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUI()
  const { cartItems, cartSubtotal, actions } = useApp()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeCart()
    }
    if (cartOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [cartOpen, closeCart])

  const shipping = cartSubtotal >= 75000 || cartSubtotal === 0 ? 0 : 9000

  return (
    <div className={`drawer ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}>
      <button className="drawer__scrim" onClick={closeCart} aria-label="Tutup keranjang" tabIndex={cartOpen ? 0 : -1} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Keranjang belanja">
        <header className="drawer__head">
          <div className="drawer__title">
            <span className="drawer__icon">
              <ShoppingBag size={19} />
            </span>
            <div>
              <h2>Keranjang</h2>
              <p>{cartItems.length ? `${cartItems.length} jenis produk` : 'Belum ada produk'}</p>
            </div>
          </div>
          <button className="icon-btn" onClick={closeCart} aria-label="Tutup">
            <X size={20} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="drawer__empty">
            <div className="drawer__empty-art">
              <Sprout size={54} color="#3F8F55" />
            </div>
            <h3>Keranjangmu masih kosong</h3>
            <p>Lengkapi kebutuhan menanammu dengan pot, benih, dan perlengkapan dari POTIVA.</p>
            <Link to="/shop" className="btn btn--primary" onClick={closeCart}>
              Jelajahi Shop <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer__items">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="cart-row">
                  <div className="cart-row__art">
                    <ProductArt type={product.art} />
                  </div>
                  <div className="cart-row__info">
                    <Link to={`/shop/${product.id}`} onClick={closeCart} className="cart-row__name">
                      {product.name}
                    </Link>
                    <span className="cart-row__price">{formatIDR(product.price)}</span>
                    <div className="qty">
                      <button
                        onClick={() => actions.setCartQty(product.id, qty - 1)}
                        disabled={qty <= 1}
                        aria-label={`Kurangi jumlah ${product.name}`}
                      >
                        <Minus size={13} />
                      </button>
                      <span>{qty}</span>
                      <button
                        onClick={() => actions.setCartQty(product.id, qty + 1)}
                        aria-label={`Tambah jumlah ${product.name}`}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-row__remove"
                    onClick={() => actions.removeFromCart(product.id)}
                    aria-label={`Hapus ${product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="drawer__ship">
              <Leaf size={16} />
              {shipping === 0 ? (
                <span>Selamat! Kamu dapat <strong>gratis pengiriman</strong>.</span>
              ) : (
                <span>
                  Tambah <strong>{formatIDR(75000 - cartSubtotal)}</strong> lagi untuk gratis
                  pengiriman.
                </span>
              )}
            </div>

            <footer className="drawer__foot">
              <div className="drawer__sum">
                <span>Subtotal</span>
                <strong>{formatIDR(cartSubtotal)}</strong>
              </div>
              <div className="drawer__sum drawer__sum--muted">
                <span>Pengiriman</span>
                <span>{shipping === 0 ? 'Gratis' : formatIDR(shipping)}</span>
              </div>
              <div className="drawer__total">
                <span>Total</span>
                <strong>{formatIDR(cartSubtotal + shipping)}</strong>
              </div>
              <Link to="/checkout" className="btn btn--primary btn--lg btn--block" onClick={closeCart}>
                Lanjut ke Checkout <ArrowRight size={18} />
              </Link>
              <Link to="/shop" className="btn btn--ghost btn--block" onClick={closeCart}>
                Lanjut belanja
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
