import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, Sprout } from 'lucide-react'
import { Mascot, PottedPlant } from '../components/illustrations'
import { usePageTitle } from '../lib/usePageTitle'

export default function NotFound() {
  usePageTitle('Halaman tidak ditemukan')
  return (
    <div className="container page notfound">
      <div className="notfound__art">
        <span className="notfound__404">404</span>
        <Mascot size={190} />
        <div className="notfound__pot">
          <PottedPlant width={100} growth={30} potTone="cream" />
        </div>
      </div>
      <span className="eyebrow">Halaman tidak ditemukan</span>
      <h1>Sepertinya benih ini belum tumbuh.</h1>
      <p>
        Tautan yang kamu buka mungkin sudah dipindahkan atau salah ketik. Yuk kembali ke
        kebun dan cari jalan lain.
      </p>
      <div className="notfound__actions">
        <Link to="/" className="btn btn--primary btn--lg">
          <ArrowLeft size={17} /> Kembali ke beranda
        </Link>
        <Link to="/app" className="btn btn--outline btn--lg">
          <Compass size={17} /> Buka kebunku
        </Link>
      </div>
      <span className="notfound__note">
        <Sprout size={14} /> Grow Beyond Nature
      </span>
    </div>
  )
}
