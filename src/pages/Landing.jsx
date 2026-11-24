import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  Coins,
  Droplets,
  Heart,
  Leaf,
  NotebookPen,
  ScanLine,
  ShoppingBag,
  Sparkles,
  Sprout,
  Star,
  Store,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { usePageTitle } from '../lib/usePageTitle'
import { useApp } from '../store/AppStore'
import {
  EbookCover,
  HeroScene,
  JournalPhoto,
  LeafPattern,
  Mascot,
  PottedPlant,
  QRPattern,
  Sprout as SproutIcon,
} from '../components/illustrations'
import ProductCard from '../components/ProductCard'
import { EBOOKS, PRODUCTS } from '../data/appData'

const STEPS = [
  {
    icon: ShoppingBag,
    title: 'Pilih & beli produk',
    text: 'Pot atau benih POTIVA datang dengan QR Plant ID unik di kemasannya.',
    note: 'Pot Mini · Benih Cabai · Paket Pemula',
  },
  {
    icon: ScanLine,
    title: 'Pindai QR-nya',
    text: 'Buka halaman aktivasi, konfirmasi jenis tanaman, dan mulai dari tanggal tanammu.',
    note: 'Butuh 30 detik · tanpa ribet',
  },
  {
    icon: Sprout,
    title: 'Rawat & tumbuhkan',
    text: 'Ikuti jadwal perawatan, isi jurnal, dan lihat taman virtualmu bertumbuh.',
    note: 'Pengingat · jurnal · XP & reward',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Aku tipe yang gampang lupa nyiram. Pengingat POTIVA plus catatan jurnal bikin tanaman pertamaku hidup sampai panen.',
    name: 'Rara Anindya',
    role: 'Mahasiswa · Bandung',
    initial: 'RA',
    tone: '#3F8F55',
  },
  {
    quote:
      'Anakku jadi ikut rawat karena ada taman virtualnya. Sekarang dia yang ingat jadwal sebelum aku.',
    name: 'Dimas Prakoso',
    role: 'Ayah dua anak · Jakarta',
    initial: 'DP',
    tone: '#B7791F',
  },
  {
    quote:
      'Panduan di e-library-nya benar-benar untuk pemula. Nggak bikin merasa bodoh karena baru mulai.',
    name: 'Sinta Kusuma',
    role: 'Karyawan · Surabaya',
    initial: 'SK',
    tone: '#2C7A8C',
  },
]

export default function Landing() {
  usePageTitle('Grow Beyond Nature')
  const { guest, user } = useApp()
  const loggedIn = !guest && !!user

  return (
    <>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero" id="beranda">
        <div className="hero__deco" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__copy">
            <span className="hero__pill">
              <Sparkles size={14} /> Plant ID · pot & benih jadi taman digital
            </span>
            <h1>
              Grow Something
              <span className="mark hero__mark">
                Amazing.
                <svg viewBox="0 0 320 22" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M4 15c56-11 116-12 170-6 44 5 84 5 142-3"
                    stroke="#A8D66D"
                    strokeWidth="9"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>
            <p className="hero__lead">
              Bersama POTIVA, menanam jadi lebih mudah, menyenangkan, dan bermakna.
              Pindai produkmu, rawat taman virtual, dan catat setiap pertumbuhan — semuanya
              di satu tempat.
            </p>
            <div className="hero__cta">
              <Link to={loggedIn ? '/app' : '/masuk'} className="btn btn--primary btn--lg">
                Mulai Sekarang <ArrowRight size={19} />
              </Link>
              <Link to="/shop" className="btn btn--outline btn--lg">
                <ShoppingBag size={18} /> Jelajahi Produk
              </Link>
            </div>
            <div className="hero__trust">
              <div className="avatar-stack" aria-hidden="true">
                <span style={{ background: '#3F8F55' }}>RA</span>
                <span style={{ background: '#B7791F' }}>DP</span>
                <span style={{ background: '#2C7A8C' }}>SK</span>
                <span style={{ background: '#8B5E3C' }}>+2k</span>
              </div>
              <div>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                  <strong>4.9/5</strong>
                </div>
                <span className="hero__trust-text">2.400+ pekebun pemula sudah bergabung</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__scene">
              <HeroScene />
            </div>
            <div className="float-card float-card--qr">
              <QRPattern size={46} />
              <div>
                <strong>Plant ID aktif</strong>
                <span>Pot Mini · Cabai Milo</span>
              </div>
              <span className="float-card__status">
                <Check size={11} /> Terhubung
              </span>
            </div>
            <div className="float-card float-card--xp">
              <span className="float-card__icon">
                <Trophy size={16} />
              </span>
              <div>
                <strong>Level 3</strong>
                <span className="float-card__bar">
                  <i style={{ width: '72%' }} />
                </span>
              </div>
              <span className="float-card__coins">
                <Coins size={13} /> 120
              </span>
            </div>
            <div className="float-card float-card--task">
              <span className="float-card__icon float-card__icon--blue">
                <Droplets size={16} />
              </span>
              <div>
                <strong>Cek kelembapan</strong>
                <span>Hari ini · 08.00</span>
              </div>
              <span className="float-card__tick">
                <Check size={13} />
              </span>
            </div>
            <div className="float-card float-card--gain">
              <span className="float-card__icon float-card__icon--fresh">
                <Leaf size={15} />
              </span>
              <strong>+25 XP</strong>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="hero__stats">
            {[
              ['2.400+', 'Pekebun aktif'],
              ['18', 'Jenis benih & panduan'],
              ['46 rb+', 'Catatan pertumbuhan'],
              ['4.9/5', 'Rating komunitas'],
            ].map(([value, label]) => (
              <div key={label} className="hero__stat">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARA KERJA ──────────────────────────── */}
      <section className="section how" id="cara-kerja">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Cara Kerja</span>
            <h2>Dari pot di tanganmu, ke taman digital.</h2>
            <p>
              Tiga langkah sederhana. Tidak perlu alat mahal, tidak perlu jadi ahli
              terlebih dahulu.
            </p>
          </div>
          <div className="how__grid">
            {STEPS.map((step, index) => (
              <article className="how__card" key={step.title}>
                <span className="how__num">0{index + 1}</span>
                <span className="how__icon">
                  <step.icon size={24} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="how__note">
                  <SproutIcon size={15} /> {step.note}
                </span>
                {index < STEPS.length - 1 && <span className="how__line" aria-hidden="true" />}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FITUR BENTO ─────────────────────────── */}
      <section className="section features" id="fitur">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Fitur POTIVA</span>
            <h2>Satu tempat untuk seluruh perjalanan menanam.</h2>
            <p>
              Mulai dari mengingat jadwal siram sampai merayakan daun pertama. Semua
              terhubung dengan tanaman yang benar-benar kamu rawat.
            </p>
          </div>

          <div className="bento">
            <article className="bento__card bento__card--garden">
              <div className="bento__head">
                <span className="bento__icon">
                  <Sprout size={20} />
                </span>
                <span className="badge badge--fresh">Paling seru</span>
              </div>
              <h3>Kebun virtual yang tumbuh bersama usahamu</h3>
              <p>
                Setiap perawatan nyata menambah progres taman virtual. Level, XP, misi
                harian, dan hadiah — tanpa mengklaim kondisi tanaman asli.
              </p>
              <div className="garden-preview" aria-hidden="true">
                <div className="garden-preview__hill" />
                <div className="garden-preview__pot garden-preview__pot--1">
                  <PottedPlant width={92} growth={26} potTone="cream" />
                </div>
                <div className="garden-preview__pot garden-preview__pot--2">
                  <PottedPlant width={116} growth={58} potTone="sage" />
                </div>
                <div className="garden-preview__pot garden-preview__pot--3">
                  <PottedPlant width={138} growth={90} />
                </div>
                <span className="garden-preview__chip">
                  <Zap size={13} /> +15 XP
                </span>
                <span className="garden-preview__level">
                  <Trophy size={14} /> Lv. 3 · 430 XP
                </span>
              </div>
              <Link to="/garden" className="bento__link">
                Buka My Garden <ArrowRight size={16} />
              </Link>
            </article>

            <article className="bento__card bento__card--care">
              <div className="bento__head">
                <span className="bento__icon">
                  <CalendarCheck2 size={20} />
                </span>
                <span className="badge">Hari ini</span>
              </div>
              <h3>Plant Care</h3>
              <p>Jadwal lembut yang bisa kamu sesuaikan, bukan aturan kaku.</p>
              <ul className="mini-tasks">
                <li>
                  <span className="mini-tasks__dot mini-tasks__dot--water">
                    <Droplets size={14} />
                  </span>
                  <div>
                    <strong>Cek kelembapan</strong>
                    <span>Cabai Milo · 08.00</span>
                  </div>
                  <Check size={15} className="mini-tasks__check" />
                </li>
                <li>
                  <span className="mini-tasks__dot mini-tasks__dot--feed">
                    <Sprout size={14} />
                  </span>
                  <div>
                    <strong>Pupuk ringan</strong>
                    <span>Basil Lemon · 17.00</span>
                  </div>
                  <span className="mini-tasks__pill">Nanti</span>
                </li>
                <li>
                  <span className="mini-tasks__dot mini-tasks__dot--light">
                    <Zap size={14} />
                  </span>
                  <div>
                    <strong>Geser ke cahaya</strong>
                    <span>Mint Nana · 15.00</span>
                  </div>
                  <span className="mini-tasks__pill">Nanti</span>
                </li>
              </ul>
              <Link to="/care" className="bento__link">
                Atur jadwal <ArrowRight size={16} />
              </Link>
            </article>

            <article className="bento__card bento__card--journal">
              <div className="bento__head">
                <span className="bento__icon">
                  <NotebookPen size={20} />
                </span>
              </div>
              <h3>Plant Journal</h3>
              <p>Simpan foto dan cerita di balik setiap daun baru.</p>
              <div className="journal-thumbs" aria-hidden="true">
                <div className="journal-thumbs__item">
                  <JournalPhoto entry={{ photo: 2 }} />
                </div>
                <div className="journal-thumbs__item">
                  <JournalPhoto entry={{ photo: 4 }} />
                </div>
                <span className="journal-thumbs__count">+12</span>
              </div>
              <Link to="/journal" className="bento__link">
                Lihat timeline <ArrowRight size={16} />
              </Link>
            </article>

            <article className="bento__card bento__card--library">
              <div className="bento__head">
                <span className="bento__icon">
                  <BookOpen size={20} />
                </span>
                <span className="badge badge--cream">E-Library</span>
              </div>
              <h3>Belajar tanpa merasa sendirian</h3>
              <p>E-book dan panduan ringkas, ditulis untuk pemula sungguhan.</p>
              <div className="cover-mini" aria-hidden="true">
                <div className="cover-mini__item cover-mini__item--a">
                  <EbookCover ebook={EBOOKS[0]} />
                </div>
                <div className="cover-mini__item cover-mini__item--b">
                  <EbookCover ebook={EBOOKS[1]} />
                </div>
              </div>
              <Link to="/library" className="bento__link">
                Jelajahi E-Library <ArrowRight size={16} />
              </Link>
            </article>

            <article className="bento__card bento__card--shop">
              <div className="bento__head">
                <span className="bento__icon">
                  <Store size={20} />
                </span>
                <span className="badge">Shop</span>
              </div>
              <h3>Perlengkapan yang tepat, bukan yang paling mahal</h3>
              <p>Pot, benih, dan perawatan yang sudah diuji untuk pemula.</p>
              <div className="shop-mini" aria-hidden="true">
                <div className="shop-mini__art">
                  <PottedPlant width={104} growth={55} />
                </div>
                <div className="shop-mini__info">
                  <strong>Pot Mini Terra</strong>
                  <span>Rp15.000</span>
                  <span className="shop-mini__stars">
                    <Star size={11} fill="currentColor" /> 4.9 · 1.240 terjual
                  </span>
                </div>
              </div>
              <Link to="/shop" className="bento__link">
                Belanja sekarang <ArrowRight size={16} />
              </Link>
            </article>

            <article className="bento__card bento__card--community">
              <div className="bento__head">
                <span className="bento__icon">
                  <Users size={20} />
                </span>
                <span className="badge badge--outline">Segera hadir</span>
              </div>
              <h3>Komunitas yang saling menumbuhkan</h3>
              <p>Bagikan hasil panen, tanya saat daun menguning, ikut tantangan 30 hari.</p>
              <div className="community-mini">
                <span className="community-mini__avatars" aria-hidden="true">
                  <i style={{ background: '#3F8F55' }}>G</i>
                  <i style={{ background: '#B7791F' }}>M</i>
                  <i style={{ background: '#2C7A8C' }}>R</i>
                  <i style={{ background: '#8B5E3C' }}>D</i>
                </span>
                <span className="community-mini__quote">
                  <Heart size={13} /> 214 menyukai kebun balkon Rio
                </span>
              </div>
              <Link to="/community" className="bento__link">
                Intip komunitas <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ── PRODUK UNGGULAN ─────────────────────── */}
      <section className="section products-section" id="produk">
        <div className="container">
          <div className="section-head section-head--row">
            <div>
              <span className="eyebrow">POTIVA Shop</span>
              <h2>Mulai dari satu pot kecil.</h2>
              <p>Produk pilihan yang paling sering jadi titik awal para pemula.</p>
            </div>
            <Link to="/shop" className="btn btn--outline">
              Lihat semua produk <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── E-LIBRARY TEASER ────────────────────── */}
      <section className="section learn">
        <div className="container learn__grid">
          <div className="learn__copy">
            <span className="eyebrow">POTIVA E-Library</span>
            <h2>Belajar dulu, menanam kemudian — atau bersamaan.</h2>
            <p>
              Semua panduan ditulis dengan bahasa sederhana, langkah kecil, dan foto yang
              jelas. Karena pemula tidak butuh teori panjang — butuh tahu harus berbuat
              apa besok pagi.
            </p>
            <ul className="learn__list">
              <li>
                <Check size={16} /> Panduan per tanaman, dari semai sampai panen
              </li>
              <li>
                <Check size={16} /> Checklist perawatan yang bisa kamu ikuti bertahap
              </li>
              <li>
                <Check size={16} /> Studi kasus nyata: balkon sempit, cahaya minim, lupa nyiram
              </li>
            </ul>
            <div className="learn__cta">
              <Link to="/library" className="btn btn--primary">
                Jelajahi E-Library <ArrowRight size={17} />
              </Link>
              <span className="learn__price">
                Mulai dari <strong>Rp23.000</strong>
              </span>
            </div>
          </div>
          <div className="learn__visual">
            <div className="learn__book learn__book--back">
              <EbookCover ebook={EBOOKS[1]} />
            </div>
            <div className="learn__book learn__book--front">
              <EbookCover ebook={EBOOKS[0]} />
            </div>
            <div className="learn__badge">
              <span>
                <BookOpen size={16} />
              </span>
              <div>
                <strong>48 halaman</strong>
                <span>bahasa sederhana</span>
              </div>
            </div>
            <div className="learn__note">
              <Star size={13} fill="currentColor" /> 4.9 · 1.820 pembaca
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONI ───────────────────────────── */}
      <section className="section testimonials">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">Cerita mereka</span>
            <h2>Semua mulai dari satu pot.</h2>
            <p>Termasuk yang tadinya yakin tanaman pasti mati dalam seminggu.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t) => (
              <figure className="testi-card card" key={t.name}>
                <div className="testi-card__stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <span className="testi-card__avatar" style={{ background: t.tone }}>
                    {t.initial}
                  </span>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────── */}
      <section className="container">
        <div className="cta-banner">
          <LeafPattern className="cta-banner__pattern" />
          <div className="cta-banner__copy">
            <span className="cta-banner__eyebrow">
              <Sparkles size={14} /> Gratis untuk mulai
            </span>
            <h2>Siap menumbuhkan sesuatu yang amazing?</h2>
            <p>
              Mulai dari satu pot hari ini. POTIVA menemani dari benih pertama sampai
              panen yang bikin bangga.
            </p>
            <div className="cta-banner__actions">
              <Link to={loggedIn ? '/app' : '/masuk'} className="btn btn--cream btn--lg">
                Mulai Sekarang <ArrowRight size={18} />
              </Link>
              <Link to="/scan" className="btn btn--outline btn--lg cta-banner__scan">
                <ScanLine size={18} /> Scan QR Produk
              </Link>
            </div>
          </div>
          <div className="cta-banner__mascot" aria-hidden="true">
            <Mascot size={230} />
          </div>
        </div>
      </section>
    </>
  )
}
