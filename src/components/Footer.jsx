import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Instagram, Youtube, Facebook, Mail, MapPin, Leaf } from 'lucide-react'
import { Logo, LeafPattern } from './illustrations'
import { useToast } from './Toast'

const COLUMNS = [
  {
    title: 'Jelajah',
    links: [
      { label: 'My Garden', to: '/garden' },
      { label: 'Plant Care', to: '/care' },
      { label: 'Plant Journal', to: '/journal' },
      { label: 'E-Library', to: '/library' },
      { label: 'Komunitas', to: '/community' },
    ],
  },
  {
    title: 'Belanja',
    links: [
      { label: 'Semua Produk', to: '/shop' },
      { label: 'Pot & Planter', to: '/shop?kategori=Pot' },
      { label: 'Benih', to: '/shop?kategori=Benih' },
      { label: 'Perlengkapan', to: '/shop?kategori=Perawatan' },
      { label: 'Keranjang', to: '/checkout' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Pertanyaan Umum', to: '/account?tab=bantuan' },
      { label: 'Panduan Perawatan', to: '/library' },
      { label: 'Status Pesanan', to: '/account?tab=pesanan' },
      { label: 'Kebijakan Privasi', to: '/#privasi' },
      { label: 'Syarat & Ketentuan', to: '/#syarat' },
    ],
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const toast = useToast()

  const submit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast('Masukkan alamat email yang valid, ya.', { type: 'error' })
      return
    }
    toast('Kamu masuk daftar! Tips menanam akan mampir ke inbox.', {
      title: 'Terima kasih 🌱',
    })
    setEmail('')
  }

  return (
    <footer className="footer" id="tentang">
      <LeafPattern className="footer__pattern" />
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo light />
            <p>
              POTIVA menghubungkan pot dan benih fisik dengan taman digital, panduan
              perawatan, dan komunitas yang menemani perjalanan menanammu.
            </p>
            <div className="footer__contact">
              <span>
                <Mail size={15} /> halo@potiva.id
              </span>
              <span>
                <MapPin size={15} /> Bandung, Indonesia
              </span>
            </div>
            <div className="footer__social">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram POTIVA">
                <Instagram size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube POTIVA">
                <Youtube size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook POTIVA">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div className="footer__cols">
            {COLUMNS.map((col) => (
              <div key={col.title} className="footer__col">
                <h4>{col.title}</h4>
                {col.links.map((link) => (
                  <Link key={link.label} to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="footer__news">
          <div>
            <h4>
              <Leaf size={17} /> Tips tumbuh, sekali seminggu.
            </h4>
            <p>Panduan singkat, pengingat musim tanam, dan kabar produk baru. Tanpa spam.</p>
          </div>
          <form className="footer__form" onSubmit={submit}>
            <label className="sr-only" htmlFor="footer-email">
              Alamat email
            </label>
            <input
              id="footer-email"
              type="email"
              className="input"
              placeholder="namamu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn--fresh">
              Berlangganan <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="footer__bottom">
          <span>© 2026 POTIVA. Dibuat dengan 🌱 di Indonesia.</span>
          <span className="footer__tag">Grow Beyond Nature.</span>
        </div>
      </div>
    </footer>
  )
}
