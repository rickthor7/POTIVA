import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Download,
  Library as LibraryIcon,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import EbookCard from '../components/EbookCard'
import { EbookCover } from '../components/illustrations'
import { EBOOKS, EBOOK_CATEGORIES, formatIDR } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'

export default function Library() {
  usePageTitle('E-Library')
  const { ownedEbooks, actions } = useApp()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [view, setView] = useState('catalog')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(
    () =>
      EBOOKS.filter((book) => (view === 'owned' ? ownedEbooks.includes(book.id) : true))
        .filter((book) => (category === 'Semua' ? true : book.category === category))
        .filter((book) => {
          const q = search.trim().toLowerCase()
          if (!q) return true
          return `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(q)
        }),
    [search, category, view, ownedEbooks],
  )

  const featured = EBOOKS[0]
  const featuredOwned = ownedEbooks.includes(featured.id)
  const isOwned = (id) => ownedEbooks.includes(id)

  const openBook = (book) => setSelected(book)

  const buy = () => {
    if (!selected) return
    actions.buyEbook(selected.id)
    toast(`${selected.title} sekarang bisa kamu baca kapan saja.`, {
      title: 'Pembelian berhasil 🎉',
    })
  }

  const read = () => {
    if (!selected) return
    actions.markGuideRead()
    toast('Pembaca demo dibuka. Selamat membaca dan menanam!', {
      title: 'Selamat membaca 📖',
    })
    setSelected(null)
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="POTIVA E-Library"
        title="Belajar menanam, tanpa merasa sendirian."
        subtitle="Panduan ringkas dan e-book yang ditulis untuk pemula sungguhan. Beli sekali, baca selamanya."
        actions={
          <div className="library-tabs">
            <button className={`library-tab ${view === 'catalog' ? 'is-active' : ''}`} onClick={() => setView('catalog')}>
              <LibraryIcon size={15} /> Katalog
            </button>
            <button className={`library-tab ${view === 'owned' ? 'is-active' : ''}`} onClick={() => setView('owned')}>
              <BookOpen size={15} /> Milikku ({ownedEbooks.length})
            </button>
          </div>
        }
      />

      {view === 'catalog' && !search && category === 'Semua' && (
        <section className="library-feature">
          <div className="library-feature__book">
            <EbookCover ebook={featured} />
          </div>
          <div className="library-feature__copy">
            <span className="badge badge--fresh">
              <Sparkles size={12} /> Pilihan untuk pemula
            </span>
            <h2>{featured.title}</h2>
            <p>{featured.description}</p>
            <div className="library-feature__meta">
              <span>
                <Star size={14} fill="currentColor" /> {featured.rating}
              </span>
              <span>
                <BookOpen size={14} /> {featured.pages} halaman
              </span>
              <span>
                <Download size={14} /> PDF & web
              </span>
              <span>
                <Clock size={14} /> ± 40 menit baca
              </span>
            </div>
            <div className="library-feature__actions">
              <button className="btn btn--primary" onClick={() => openBook(featured)}>
                {featuredOwned ? 'Lanjut baca' : `Beli · ${formatIDR(featured.price)}`}
                <ArrowRight size={16} />
              </button>
              <span className="library-feature__note">
                <Check size={14} /> Akses langsung setelah pembelian
              </span>
            </div>
          </div>
          <div className="library-feature__deco" aria-hidden="true" />
        </section>
      )}

      <div className="library-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="search"
            placeholder="Cari judul, penulis, atau kategori…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari e-book"
          />
        </div>
        <div className="scroll-x library-cats">
          {EBOOK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'is-active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card card--pad empty">
          <BookOpen size={40} className="text-leaf" />
          <h3>{view === 'owned' ? 'Belum ada e-book yang dimiliki' : 'Belum ada yang cocok'}</h3>
          <p>
            {view === 'owned'
              ? 'E-book yang kamu beli akan muncul di sini dan bisa dibaca kapan saja.'
              : 'Coba kata kunci lain atau lihat semua kategori.'}
          </p>
          <button
            className="btn btn--primary"
            onClick={() => {
              setSearch('')
              setCategory('Semua')
              setView('catalog')
            }}
          >
            Lihat semua e-book
          </button>
        </div>
      ) : (
        <div className="ebook-grid">
          {filtered.map((book) => (
            <EbookCard
              key={book.id}
              ebook={book}
              owned={isOwned(book.id)}
              onOpen={openBook}
            />
          ))}
        </div>
      )}

      <p className="library-note">
        Harga dan pembayaran pada versi demo ini disimulasikan. Status akses tetap tersimpan
        di perangkatmu.
      </p>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.title : ''}
        subtitle={selected ? `oleh ${selected.author} · ${selected.category}` : ''}
        size="lg"
      >
        {selected && (
          <div className="ebook-detail">
            <div className="ebook-detail__cover">
              <EbookCover ebook={selected} />
              {isOwned(selected.id) && (
                <span className="ebook-card__owned">
                  <Check size={12} /> Dimiliki
                </span>
              )}
            </div>
            <div className="ebook-detail__body">
              <div className="ebook-detail__meta">
                <span>
                  <Star size={14} fill="currentColor" /> {selected.rating}
                </span>
                <span>
                  <BookOpen size={14} /> {selected.pages} halaman
                </span>
                <span>{selected.readers.toLocaleString('id-ID')} pembaca</span>
              </div>
              <p className="ebook-detail__desc">{selected.description}</p>
              <h4>Yang ada di dalamnya</h4>
              <ul className="ebook-detail__contents">
                {selected.contents.map((item) => (
                  <li key={item}>
                    <Check size={14} /> {item}
                  </li>
                ))}
              </ul>
              <div className="ebook-detail__buy">
                <div>
                  {isOwned(selected.id) ? (
                    <span className="ebook-detail__owned">
                      <Check size={15} /> Sudah kamu miliki
                    </span>
                  ) : (
                    <>
                      <strong>{formatIDR(selected.price)}</strong>
                      <span>Akses selamanya · PDF & web</span>
                    </>
                  )}
                </div>
                {isOwned(selected.id) ? (
                  <button className="btn btn--primary" onClick={read}>
                    Baca sekarang <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="btn btn--primary" onClick={buy}>
                    Beli & akses <ArrowRight size={16} />
                  </button>
                )}
              </div>
              <p className="ebook-detail__demo">
                Demo: pembayaran disimulasikan. Di versi produksi, akses diberikan setelah
                pembayaran terkonfirmasi.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
