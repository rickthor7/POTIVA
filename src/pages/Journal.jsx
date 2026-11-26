import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  ImagePlus,
  Leaf,
  NotebookPen,
  Plus,
  Sprout,
  X,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { EmptyArt, JournalPhoto, Mascot } from '../components/illustrations'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { compressImage, formatDateID, todayISO } from '../lib/utils'

const STAGES = [
  'Benih',
  'Kecambah',
  'Daun pertama',
  'Tanaman muda',
  'Tumbuh subur',
  'Berbunga',
  'Berbuah',
  'Panen',
]

const ACTIVITIES = ['Catatan', 'Periksa', 'Siram', 'Pupuk', 'Repotting', 'Pangkas', 'Panen']

export default function Journal() {
  usePageTitle('Plant Journal')
  const { journals, plants, getPlant, potiLook, actions } = useApp()
  const toast = useToast()
  const [plantFilter, setPlantFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    plantId: plants[0]?.id || '',
    dateISO: todayISO(),
    stage: 'Tanaman muda',
    activity: 'Catatan',
    title: '',
    note: '',
  })

  const filtered = useMemo(
    () =>
      journals
        .filter((j) => (plantFilter === 'all' ? true : j.plantId === plantFilter))
        .filter((j) => (stageFilter === 'all' ? true : j.stage === stageFilter))
        .slice()
        .sort((a, b) => (b.dateISO || '').localeCompare(a.dateISO || '')),
    [journals, plantFilter, stageFilter],
  )

  const photoCount = journals.filter((j) => j.image || j.photo).length
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Pilih file gambar (JPG atau PNG).', { type: 'error' })
      return
    }
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      setPhoto(compressed)
    } catch {
      toast('Foto gagal diproses. Coba file lain.', { type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.note.trim()) {
      toast('Isi judul dan catatan singkat dulu, ya.', { type: 'error' })
      return
    }
    actions.addJournal({ ...form, photo })
    toast('+20 XP · catatanmu masuk ke timeline tanaman.', { title: 'Jurnal tersimpan 📔' })
    setOpen(false)
    setPhoto(null)
    setForm((f) => ({ ...f, title: '', note: '' }))
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="Plant Journal"
        title="Perjalanan tumbuh tanamanmu."
        subtitle="Foto, catatan kecil, dan momen pertama. Bukan untuk sempurna — untuk diingat."
        actions={
          <button className="btn btn--primary" onClick={() => setOpen(true)}>
            <Plus size={17} /> Tambah catatan
          </button>
        }
      />

      <div className="journal-layout">
        <div className="journal-main">
          <div className="journal-toolbar">
            <div className="scroll-x journal-chips">
              <button
                className={`chip ${plantFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setPlantFilter('all')}
              >
                Semua tanaman
              </button>
              {plants.map((p) => (
                <button
                  key={p.id}
                  className={`chip ${plantFilter === p.id ? 'is-active' : ''}`}
                  onClick={() => setPlantFilter(p.id)}
                >
                  <Sprout size={13} /> {p.name}
                </button>
              ))}
            </div>
            <select
              className="select journal-stage-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              aria-label="Filter tahap pertumbuhan"
            >
              <option value="all">Semua tahap</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="card card--pad empty">
              <EmptyArt variant="journal" />
              <h3>Belum ada catatan di filter ini</h3>
              <p>Perjalanan tumbuh tanamanmu dimulai dari satu foto dan satu kalimat.</p>
              <button className="btn btn--primary" onClick={() => setOpen(true)}>
                Tambah catatan pertama
              </button>
            </div>
          ) : (
            <div className="timeline">
              {filtered.map((entry) => {
                const plant = getPlant(entry.plantId)
                const d = entry.dateISO ? new Date(`${entry.dateISO}T12:00:00`) : null
                return (
                  <div className="timeline__item" key={entry.id}>
                    <div className="timeline__rail">
                      {d && (
                        <span className="timeline__date">
                          <strong>{d.getDate()}</strong>
                          <span>
                            {d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', '')}
                          </span>
                        </span>
                      )}
                      <i className="timeline__line" />
                      <span className="timeline__dot" />
                    </div>
                    <article className="journal-entry card">
                      <header className="journal-entry__head">
                        <div className="journal-entry__badges">
                          <span className="badge badge--fresh">{entry.stage}</span>
                          <span className="badge badge--outline">{entry.activity}</span>
                        </div>
                        <span className="journal-entry__plant">
                          <Leaf size={13} /> {plant?.name}
                        </span>
                      </header>
                      <h3>{entry.title}</h3>
                      <p>{entry.note}</p>
                      {(entry.image || entry.photo) && (
                        <div className="journal-entry__photo">
                          {entry.image ? (
                            <img src={entry.image} alt={entry.title} loading="lazy" />
                          ) : (
                            <JournalPhoto entry={entry} />
                          )}
                        </div>
                      )}
                      <footer className="journal-entry__foot">
                        <span>
                          <CalendarDays size={13} /> {formatDateID(entry.dateISO, { year: false })} · {entry.date}
                        </span>
                        <span>
                          <Check size={13} /> Tercatat
                        </span>
                      </footer>
                    </article>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <aside className="journal-side">
          <section className="card card--pad journal-summary">
            <span className="eyebrow">Ringkasan</span>
            <div className="journal-summary__grid">
              <div>
                <strong>{journals.length}</strong>
                <span>Catatan</span>
              </div>
              <div>
                <strong>{photoCount}</strong>
                <span>Foto</span>
              </div>
              <div>
                <strong>{plants.length}</strong>
                <span>Tanaman</span>
              </div>
            </div>
            <button className="btn btn--primary btn--block btn--sm" onClick={() => setOpen(true)}>
              <NotebookPen size={15} /> Tambah update
            </button>
          </section>

          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Tahap pertumbuhan</h2>
                <p>Catatan berdasarkan fase.</p>
              </div>
            </div>
            <ul className="stage-list">
              {STAGES.slice(0, 6).map((stage) => {
                const count = journals.filter((j) => j.stage === stage).length
                const active = stageFilter === stage
                return (
                  <li key={stage}>
                    <button className={active ? 'is-active' : ''} onClick={() => setStageFilter(active ? 'all' : stage)}>
                      <span className="stage-list__bar" style={{ width: `${Math.max(8, (count / Math.max(1, journals.length)) * 100)}%` }} />
                      <span className="stage-list__label">{stage}</span>
                      <small>{count}</small>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="card card--pad tip-card">
            <div className="tip-card__mascot">
              <Mascot size={86} waving={false} look={potiLook} />
            </div>
            <div className="tip-card__body">
              <span className="eyebrow">Tips jurnal</span>
              <p>Ambil foto dari sudut yang sama setiap minggu — perubahannya jadi lebih mudah terlihat.</p>
            </div>
          </section>

          <section className="card card--pad journal-guide">
            <BookOpen size={18} />
            <strong>Bingung mau mencatat apa?</strong>
            <p>Mulai dari tiga hal: kondisi daun, kelembapan media, dan satu hal yang kamu perhatikan.</p>
            <Link to="/library" className="btn btn--outline btn--sm btn--block">
              Baca panduan jurnal
            </Link>
          </section>
        </aside>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah catatan pertumbuhan"
        subtitle="Tidak perlu panjang. Satu foto dan satu kalimat sudah berarti."
        size="lg"
      >
        <form className="form-grid" onSubmit={submit}>
          <div className="field">
            <label htmlFor="j-plant">Tanaman</label>
            <select id="j-plant" className="select" value={form.plantId} onChange={(e) => set('plantId', e.target.value)}>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="j-date">Tanggal</label>
            <input id="j-date" type="date" className="input" value={form.dateISO} onChange={(e) => set('dateISO', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="j-stage">Tahap pertumbuhan</label>
            <select id="j-stage" className="select" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
              {STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="j-activity">Aktivitas terkait</label>
            <select id="j-activity" className="select" value={form.activity} onChange={(e) => set('activity', e.target.value)}>
              {ACTIVITIES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor="j-title">Judul catatan</label>
            <input
              id="j-title"
              className="input"
              placeholder="Contoh: Daun baru pertama muncul!"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={80}
            />
          </div>
          <div className="field field--full">
            <label htmlFor="j-note">Ceritakan kondisinya</label>
            <textarea
              id="j-note"
              className="textarea"
              placeholder="Apa yang berubah? Bagaimana warna daun, kelembapan media, atau cuaca hari ini?"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              rows={4}
            />
          </div>
          <div className="field field--full">
            <span className="field-label">Foto (opsional)</span>
            {photo ? (
              <div className="photo-preview">
                <img src={photo} alt="Pratinjau foto jurnal" />
                <button type="button" className="photo-preview__remove" onClick={() => setPhoto(null)} aria-label="Hapus foto">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="photo-drop"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <span>
                  {uploading ? <Camera size={22} /> : <ImagePlus size={22} />}
                </span>
                <strong>{uploading ? 'Memproses foto…' : 'Pilih foto dari perangkat'}</strong>
                <small>JPG/PNG · otomatis dikompres agar ringan</small>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
          <div className="field field--full modal__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn--primary">
              <Plus size={16} /> Simpan catatan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
