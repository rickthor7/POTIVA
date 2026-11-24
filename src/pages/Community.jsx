import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Heart,
  ImagePlus,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { JournalPhoto, Mascot } from '../components/illustrations'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'

const TABS = ['Semua', 'Diskusi', 'Galeri']

const CONTRIBUTORS = [
  { name: 'GreenGrower', initial: 'G', points: 1240, tone: '#3F8F55' },
  { name: 'Rio Balkon', initial: 'R', points: 980, tone: '#2C7A8C' },
  { name: 'Mira Tanam', initial: 'M', points: 865, tone: '#B7791F' },
  { name: 'Dapur Hijau', initial: 'D', points: 720, tone: '#8B5E3C' },
]

const RULES = [
  'Ramah pada pemula — tidak ada pertanyaan yang terlalu dasar.',
  'Sertakan konteks: jenis tanaman, cahaya, dan media tanam.',
  'Jangan menyarankan penyiraman atau pupuk berlebihan.',
  'Hormati privasi: minta izin sebelum membagikan foto orang lain.',
]

export default function Community() {
  usePageTitle('Komunitas')
  const { user, guest, posts, actions } = useApp()
  const toast = useToast()
  const [tab, setTab] = useState('Semua')
  const [joined, setJoined] = useState(false)
  const [draft, setDraft] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)
  const [localPosts, setLocalPosts] = useState([])
  const [localLikes, setLocalLikes] = useState([])

  const visible = useMemo(() => {
    const all = [...localPosts, ...posts]
    if (tab === 'Semua') return all
    return all.filter((p) => p.tag === tab)
  }, [posts, tab, localPosts])

  const toggleLike = (post) => {
    if (post.local) {
      setLocalLikes((list) =>
        list.includes(post.id) ? list.filter((id) => id !== post.id) : [...list, post.id],
      )
      return
    }
    actions.toggleLike(post.id)
  }

  const isLiked = (post) =>
    post.local ? localLikes.includes(post.id) : post.liked

  const submitPost = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    const post = {
      id: `local_${Date.now()}`,
      author: guest ? 'Tamu POTIVA' : user?.name || 'Sahabat',
      initial: guest ? 'T' : user?.initials || 'SP',
      tone: '#3F8F55',
      time: 'Baru saja',
      text: draft.trim(),
      likes: 0,
      comments: 0,
      photo: false,
      tag: 'Diskusi',
      local: true,
    }
    setLocalPosts((list) => [post, ...list])
    setDraft('')
    setComposerOpen(false)
    setTab('Semua')
    toast('Ceritamu sudah tampil di feed komunitas (demo).', { title: 'Terima kasih sudah berbagi 🌿' })
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="Komunitas POTIVA · Beta"
        title="Tumbuh lebih baik kalau tidak sendiri."
        subtitle="Tempat bertanya, merayakan daun pertama, dan belajar dari kegagalan orang lain — tanpa takut dihakimi."
        actions={
          <button className="btn btn--primary" onClick={() => setComposerOpen(true)}>
            <Send size={16} /> Bagikan cerita
          </button>
        }
      />

      <div className="community-layout">
        <div className="community-main">
          <section className="challenge-card">
            <div className="challenge-card__copy">
              <span className="challenge-card__eyebrow">
                <Trophy size={14} /> Tantangan komunitas
              </span>
              <h2>30 Days Growing Challenge</h2>
              <p>
                Rawat satu tanaman selama 30 hari dan bagikan foto perkembangannya. Bukan
                soal hasil sempurna — soal konsistensi kecil setiap hari.
              </p>
              <div className="challenge-card__progress">
                <div className="progress">
                  <div className="progress__bar" style={{ width: joined ? '10%' : '0%' }} />
                </div>
                <span>{joined ? 'Hari 1 dari 30' : 'Belum dimulai'}</span>
              </div>
              <div className="challenge-card__actions">
                <button
                  className="btn btn--cream"
                  onClick={() => {
                    setJoined((v) => !v)
                    if (!joined)
                      toast('Tantangan dimulai! Catat perkembanganmu di jurnal setiap minggu.', {
                        title: 'Kamu ikut tantangan 🌱',
                      })
                  }}
                >
                  {joined ? 'Ikut tantangan ✓' : 'Ikut sekarang'} <ArrowRight size={16} />
                </button>
                <span className="challenge-card__people">
                  <span className="challenge-card__avatars">
                    <i style={{ background: '#A8D66D' }}>G</i>
                    <i style={{ background: '#BFE6F0' }}>R</i>
                    <i style={{ background: '#F2DCA8' }}>M</i>
                    <i style={{ background: '#E8C99B' }}>+</i>
                  </span>
                  324 peserta
                </span>
              </div>
            </div>
            <Mascot size={150} className="challenge-card__mascot" />
          </section>

          <div className="community-tabs">
            {TABS.map((t) => (
              <button key={t} className={`chip ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
            <span className="community-tabs__note">Beta · moderasi masih manual</span>
          </div>

          {composerOpen && (
            <form className="composer card" onSubmit={submitPost}>
              <span className="avatar">{guest ? 'T' : user?.initials || 'SP'}</span>
              <div className="composer__body">
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Apa yang tumbuh di kebunmu hari ini?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <div className="composer__foot">
                  <span>
                    <ImagePlus size={16} /> Foto hadir di versi lengkap
                  </span>
                  <div>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setComposerOpen(false)}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={!draft.trim()}>
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          <div className="feed">
            {visible.length === 0 ? (
              <div className="card card--pad empty">
                <Sparkles size={36} className="text-leaf" />
                <h3>Belum ada cerita di kategori ini</h3>
                <p>Jadilah yang pertama berbagi. Cerita kecilmu bisa membantu pemula lain.</p>
                <button className="btn btn--primary" onClick={() => setComposerOpen(true)}>
                  Tulis cerita
                </button>
              </div>
            ) : (
              visible.map((post) => (
                <article className="post card" key={post.id}>
                  <header className="post__head">
                    <span className="post__avatar" style={{ background: post.tone }}>
                      {post.initial}
                    </span>
                    <div>
                      <strong>{post.author}</strong>
                      <span>
                        {post.time} · <em>{post.tag}</em>
                      </span>
                    </div>
                    <button
                      className="icon-btn"
                      aria-label="Opsi postingan"
                      onClick={() => toast('Menu postingan tersedia di versi lengkap.', { type: 'info' })}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </header>
                  <p className="post__text">{post.text}</p>
                  {post.photo && (
                    <div className="post__photo">
                      <JournalPhoto entry={{ photo: post.id === 'c1' ? 4 : 3 }} />
                    </div>
                  )}
                  <footer className="post__actions">
                    <button
                      className={isLiked(post) ? 'is-liked' : ''}
                      onClick={() => toggleLike(post)}
                      aria-pressed={isLiked(post)}
                    >
                      <Heart size={16} fill={isLiked(post) ? 'currentColor' : 'none'} />
                      {post.likes + (isLiked(post) ? 1 : 0)}
                    </button>
                    <button onClick={() => toast('Komentar tersedia di versi lengkap.', { type: 'info' })}>
                      <MessageCircle size={16} /> {post.comments}
                    </button>
                    <button
                      onClick={() => {
                        toast('Tautan cerita disalin (demo).', { type: 'info' })
                      }}
                    >
                      <Share2 size={15} /> Bagikan
                    </button>
                  </footer>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="community-side">
          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <Users size={17} /> Paling aktif
                </h2>
                <p>Minggu ini</p>
              </div>
            </div>
            <ol className="contributors">
              {CONTRIBUTORS.map((c, i) => (
                <li key={c.name}>
                  <span className="contributors__rank">{i + 1}</span>
                  <span className="contributors__avatar" style={{ background: c.tone }}>
                    {c.initial}
                  </span>
                  <strong>{c.name}</strong>
                  <span className="contributors__points">{c.points.toLocaleString('id-ID')} poin</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Aturan komunitas</h2>
                <p>Supaya semua nyaman bertanya.</p>
              </div>
            </div>
            <ol className="rules-list">
              {RULES.map((rule, i) => (
                <li key={rule}>
                  <span>{i + 1}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </section>

          <section className="card card--pad community-tip">
            <span className="eyebrow">Etika bertanya</span>
            <p>
              Sertakan foto daun, lokasi, dan rutinitas perawatan. Semakin lengkap
              konteksnya, semakin tepat saran yang kamu dapat.
            </p>
            <button className="btn btn--outline btn--sm btn--block" onClick={() => setComposerOpen(true)}>
              Mulai diskusi
            </button>
          </section>
        </aside>
      </div>
    </div>
  )
}
