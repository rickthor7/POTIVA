import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Info,
  KeyRound,
  Leaf,
  MapPin,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sprout,
  CalendarDays,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Mascot, PottedPlant, ProductArt, QRPattern } from '../components/illustrations'
import { SPECIES } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { formatDateID, todayISO } from '../lib/utils'

const DEMO_CODE = 'PTV-CABAI-24'

export default function Scan() {
  usePageTitle('Scan & Aktivasi')
  const { plants, actions } = useApp()
  const toast = useToast()
  const navigate = useNavigate()
  const timer = useRef(null)
  const [step, setStep] = useState('scan')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [newPlantId, setNewPlantId] = useState(null)
  const [form, setForm] = useState({
    speciesId: 'cabai-milo',
    name: '',
    plantedAt: todayISO(),
    location: 'Balkon',
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  const startScan = () => {
    setError('')
    setScanning(true)
    timer.current = setTimeout(() => {
      setScanning(false)
      setStep('confirm')
      toast('QR dikenali. Konfirmasi tanamannya, ya.', { title: 'Plant ID ditemukan ✅' })
    }, 2200)
  }

  const submitCode = (e) => {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean.startsWith('PTV-') || clean.length < 8) {
      setError(
        `Kode "${clean || '...'}" tidak dikenali. Coba kode demo ${DEMO_CODE} atau periksa kembali QR-nya.`,
      )
      return
    }
    setError('')
    setStep('confirm')
    toast('Kode produk valid. Sekarang konfirmasi tanamannya.', { title: 'Produk terverifikasi ✅' })
  }

  const useDemoCode = () => {
    setCode(DEMO_CODE)
    setError('')
  }

  const simulateInvalid = () => {
    setError('QR tidak valid. Pastikan kamu memindai QR dari kemasan POTIVA, lalu coba lagi.')
    setScanning(false)
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submitActivation = (e) => {
    e.preventDefault()
    const species = SPECIES.find((s) => s.id === form.speciesId)
    const id = actions.addPlant({ ...form, name: form.name || species.name })
    setNewPlantId(id)
    setStep('done')
    toast(`${form.name || species.name} masuk ke My Garden. +40 XP!`, {
      title: 'Tanamanmu berhasil ditambahkan 🌱',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addedPlant = plants.find((p) => p.id === newPlantId)
  const species = SPECIES.find((s) => s.id === form.speciesId)

  if (step === 'done' && addedPlant) {
    return (
      <div className="container page page--app">
        <div className="scan-done card">
          <span className="scan-done__icon">
            <CheckCircle2 size={34} />
          </span>
          <span className="eyebrow">Plant ID aktif</span>
          <h1>Selamat, {addedPlant.name} sudah di rumah!</h1>
          <p>
            Profil tanamanmu sudah dibuat dan Plant Care akan merekomendasikan jadwal
            awal. Ini rekomendasi, bukan aturan mutlak — sesuaikan dengan kondisi nyata.
          </p>

          <div className="scan-done__plant">
            <PottedPlant width={150} growth={10} pot={addedPlant.pot} potTone={addedPlant.potTone} />
            <div className="scan-done__details">
              <span className="badge badge--fresh">Hari ke-1</span>
              <strong>{addedPlant.name}</strong>
              <span>
                <Leaf size={13} /> {species?.latin}
              </span>
              <span>
                <MapPin size={13} /> {addedPlant.location}
              </span>
              <span>
                <CalendarDays size={13} /> Ditanam {formatDateID(addedPlant.plantedAt)}
              </span>
            </div>
          </div>

          <div className="scan-done__next">
            <div>
              <DropletsIcon /> <span>Cek kelembapan media sebelum menyiram</span>
            </div>
            <div>
              <SunIcon /> <span>Taruh di cahaya pagi, hindari panas ekstrem</span>
            </div>
            <div>
              <Sprout size={15} /> <span>Catat foto pertama di Plant Journal</span>
            </div>
          </div>

          <div className="scan-done__actions">
            <Link to={`/garden?plant=${addedPlant.id}`} className="btn btn--primary btn--lg">
              Buka My Garden <ArrowRight size={17} />
            </Link>
            <Link to="/care" className="btn btn--outline btn--lg">
              Atur jadwal perawatan
            </Link>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setStep('scan')
                setCode('')
                setNewPlantId(null)
                setForm({ speciesId: 'cabai-milo', name: '', plantedAt: todayISO(), location: 'Balkon' })
              }}
            >
              Scan produk lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="container page page--app">
        <PageHeader
          eyebrow="Scan & Aktivasi · Langkah 2"
          title="Konfirmasi tanamanmu."
          subtitle="QR sudah terverifikasi. Pilih tanaman yang sesuai dengan isi kemasan dan tentukan tanggal mulai tanam."
          actions={
            <button className="btn btn--ghost" onClick={() => setStep('scan')}>
              <ScanLine size={16} /> Scan ulang
            </button>
          }
        />

        <div className="scan-confirm">
          <aside className="scan-verified card">
            <span className="scan-verified__check">
              <Check size={18} />
            </span>
            <span className="eyebrow">Terverifikasi</span>
            <div className="scan-verified__art">
              <ProductArt type="pot-mini" />
            </div>
            <strong>Pot Mini Terra</strong>
            <span className="scan-verified__code">Kode: {code || DEMO_CODE}</span>
            <span className="scan-verified__batch">Batch PTV-2411-08 · Pot & benih</span>
            <div className="scan-verified__security">
              <ShieldCheck size={15} />
              <p>
                QR hanya untuk aktivasi dan identifikasi produk. Data tanaman pribadimu
                hanya bisa diakses melalui akunmu.
              </p>
            </div>
          </aside>

          <form className="card card--pad scan-form" onSubmit={submitActivation}>
            <h2>Pilih jenis tanaman</h2>
            <p className="scan-form__sub">Pilih satu yang paling sesuai dengan kemasan.</p>
            <div className="species-grid">
              {SPECIES.map((sp) => (
                <label
                  key={sp.id}
                  className={`species-option ${form.speciesId === sp.id ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="species"
                    value={sp.id}
                    checked={form.speciesId === sp.id}
                    onChange={() => set('speciesId', sp.id)}
                  />
                  <span className="species-option__emoji">{sp.emoji}</span>
                  <div>
                    <strong>{sp.name}</strong>
                    <span>{sp.difficulty} · {sp.light}</span>
                  </div>
                  <span className="species-option__tick">
                    <Check size={12} />
                  </span>
                </label>
              ))}
            </div>

            <div className="form-grid scan-form__fields">
              <div className="field">
                <label htmlFor="s-name">Nama panggilan (opsional)</label>
                <input
                  id="s-name"
                  className="input"
                  placeholder={species?.name}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className="field">
                <label htmlFor="s-date">Tanggal mulai tanam</label>
                <input
                  id="s-date"
                  type="date"
                  className="input"
                  value={form.plantedAt}
                  onChange={(e) => set('plantedAt', e.target.value)}
                  max={todayISO()}
                />
              </div>
              <div className="field">
                <label htmlFor="s-location">Lokasi tanaman</label>
                <select
                  id="s-location"
                  className="select"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                >
                  <option>Balkon</option>
                  <option>Dapur</option>
                  <option>Jendela kamar</option>
                  <option>Teras</option>
                  <option>Halaman</option>
                  <option>Ruang kerja</option>
                </select>
              </div>
              <div className="field">
                <label>Ringkasan</label>
                <div className="scan-form__summary">
                  <span>{species?.emoji} {species?.name}</span>
                  <span>{species?.water}</span>
                </div>
              </div>
            </div>

            <div className="scan-form__note">
              <Info size={15} />
              <span>
                Jadwal awal akan dibuat berdasarkan jenis tanaman ini. Kamu bisa
                mengubahnya kapan saja di Plant Care.
              </span>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block">
              <Sparkles size={18} /> Aktifkan Plant ID
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="Scan & Aktivasi"
        title="Pindai QR pada produk POTIVA."
        subtitle="Hubungkan pot dan benih fisikmu dengan taman digital, panduan perawatan, dan jurnal pertumbuhan."
      />

      <div className="scan-layout">
        <section className="scanner card">
          <div className="scanner__head">
            <span className="badge badge--cream">
              <Camera size={12} /> Kamera demo
            </span>
            <span className="scanner__status">
              <i className={scanning ? 'is-live' : ''} /> {scanning ? 'Memindai…' : 'Siap memindai'}
            </span>
          </div>

          <div className={`scanner__frame ${scanning ? 'is-scanning' : ''}`}>
            <span className="scanner__corner scanner__corner--tl" />
            <span className="scanner__corner scanner__corner--tr" />
            <span className="scanner__corner scanner__corner--bl" />
            <span className="scanner__corner scanner__corner--br" />
            <div className="scanner__pot">
              <ProductArt type="pot-mini" />
              <div className="scanner__qr">
                <QRPattern size={92} />
              </div>
            </div>
            {scanning && <span className="scanner__line" />}
          </div>

          <p className="scanner__hint">
            <ScanLine size={15} /> Arahkan kamera ke QR Code pada kemasan. Di demo ini,
            pemindaian disimulasikan.
          </p>

          <button className="btn btn--primary btn--lg btn--block" onClick={startScan} disabled={scanning}>
            <Camera size={18} /> {scanning ? 'Memindai QR…' : 'Aktifkan kamera & scan'}
          </button>

          <div className="scanner__manual">
            <span className="scanner__or">atau masukkan kode manual</span>
            <form onSubmit={submitCode}>
              <label className="sr-only" htmlFor="manual-code">
                Kode produk
              </label>
              <div className="scanner__manual-row">
                <input
                  id="manual-code"
                  className="input"
                  placeholder={`Contoh: ${DEMO_CODE}`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="submit" className="btn btn--outline">
                  <KeyRound size={16} /> Cek
                </button>
              </div>
            </form>
            <div className="scanner__manual-links">
              <button className="link-btn" onClick={useDemoCode}>
                Isi kode demo
              </button>
              <button className="link-btn link-btn--muted" onClick={simulateInvalid}>
                Lihat state QR tidak valid
              </button>
            </div>
          </div>

          {error && (
            <div className="scanner__error" role="alert">
              <Info size={16} />
              <div>
                <strong>QR belum bisa dibaca</strong>
                <p>{error}</p>
                <button className="link-btn" onClick={() => setError('')}>
                  Coba lagi
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="scan-side">
          <section className="card card--pad">
            <span className="eyebrow">Cara kerjanya</span>
            <ol className="scan-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Beli produk POTIVA</strong>
                  <p>QR Plant ID ada di pot atau kemasan benih.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Scan & konfirmasi</strong>
                  <p>Pilih jenis tanaman dan tanggal mulai tanam.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Rawat & catat</strong>
                  <p>Jadwal, pengingat, dan jurnal aktif otomatis.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="scan-tip">
            <Mascot size={96} waving={false} />
            <div>
              <span className="eyebrow">Kata Poti</span>
              <p>Setiap QR hanya mengidentifikasi produk. Data tanamanmu tetap milikmu.</p>
            </div>
          </section>

          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Butuh bantuan?</h2>
                <p>Masalah umum saat scan.</p>
              </div>
            </div>
            <ul className="scan-help">
              <li>
                <Check size={13} /> Pastikan kamera diizinkan di browser.
              </li>
              <li>
                <Check size={13} /> Coba dekatkan kamera dan hindari pantulan cahaya.
              </li>
              <li>
                <Check size={13} /> Gunakan kode manual jika kamera tidak tersedia.
              </li>
            </ul>
            <Link to="/account?tab=bantuan" className="btn btn--outline btn--sm btn--block">
              Hubungi bantuan
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

function DropletsIcon() {
  return <Sprout size={15} />
}

function SunIcon() {
  return <Sparkles size={15} />
}
