import { BookOpen, Check, Star } from 'lucide-react'
import { EbookCover } from './illustrations'
import { formatIDR } from '../data/appData'

export default function EbookCard({ ebook, owned, onOpen }) {
  return (
    <article className="ebook-card">
      <button className="ebook-card__cover" onClick={() => onOpen(ebook)} aria-label={`Lihat ${ebook.title}`}>
        <EbookCover ebook={ebook} />
        {owned && (
          <span className="ebook-card__owned">
            <Check size={12} /> Dimiliki
          </span>
        )}
        {ebook.badge && !owned && <span className="ebook-card__badge">{ebook.badge}</span>}
      </button>
      <div className="ebook-card__body">
        <span className="ebook-card__cat">{ebook.category}</span>
        <button className="ebook-card__title" onClick={() => onOpen(ebook)}>
          <h3>{ebook.title}</h3>
        </button>
        <span className="ebook-card__author">{ebook.author}</span>
        <div className="ebook-card__meta">
          <span>
            <BookOpen size={12} /> {ebook.pages} hal
          </span>
          <span>
            <Star size={12} fill="currentColor" /> {ebook.rating}
          </span>
        </div>
        <div className="ebook-card__foot">
          {owned ? (
            <span className="ebook-card__price ebook-card__price--owned">Sudah dimiliki</span>
          ) : (
            <strong>{formatIDR(ebook.price)}</strong>
          )}
          <button className="btn btn--sm btn--outline" onClick={() => onOpen(ebook)}>
            {owned ? 'Baca' : 'Detail'}
          </button>
        </div>
      </div>
    </article>
  )
}
