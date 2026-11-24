import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Droplets,
  Flame,
  Leaf,
  Plus,
  ScanLine,
  Sprout,
  Trophy,
  Zap,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import TaskRow from '../components/TaskRow'
import { JournalPhoto, Mascot, PottedPlant } from '../components/illustrations'
import { EBOOKS, MASCOT_TIPS, formatIDR, levelFromXp } from '../data/appData'
import { useApp } from '../store/AppStore'
import { usePageTitle } from '../lib/usePageTitle'
import { todayISO, formatDateID, addDays } from '../lib/utils'

const stageLabel = (growth) =>
  growth < 15
    ? 'Benih'
    : growth < 35
      ? 'Kecambah'
      : growth < 60
        ? 'Tanaman muda'
        : growth < 85
          ? 'Tumbuh subur'
          : 'Siap panen'

export default function Dashboard() {
  usePageTitle('Beranda')
  const {
    user,
    wallet,
    plants,
    tasks,
    journals,
    missions,
    getPlant,
    getProduct,
    ownedEbooks,
    actions,
  } = useApp()

  const today = todayISO()
  const todays = tasks.filter((t) => t.date === today)
  const todo = todays.filter((t) => t.status === 'todo')
  const doneCount = todays.filter((t) => t.status === 'done').length
  const progress = todays.length ? Math.round((doneCount / todays.length) * 100) : 0
  const level = levelFromXp(wallet.xp)
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'
  const dateLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const tip = MASCOT_TIPS[new Date().getDate() % MASCOT_TIPS.length]
  const recommended = EBOOKS.find((b) => !ownedEbooks.includes(b.id)) || EBOOKS[0]
  const nextTaskFor = (plantId) =>
    tasks.find((t) => t.plantId === plantId && t.status === 'todo' && t.date >= today)

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow={dateLabel}
        title={`${greeting}, ${user?.name || 'Sahabat'} 👋`}
        subtitle="Ini ringkasan kebunmu hari ini. Mulai dari yang paling kecil, ya."
        actions={
          <>
            <Link to="/scan" className="btn btn--outline">
              <ScanLine size={17} /> Scan QR
            </Link>
            <Link to="/garden" className="btn btn--primary">
              <Sprout size={17} /> Buka Garden
            </Link>
          </>
        }
      />

      <div className="dash-grid">
        <div className="dash-main">
          <section className="card card--pad today-card">
            <div className="panel-head">
              <div>
                <h2>
                  <CalendarCheck2 size={18} /> Tugas hari ini
                </h2>
                <p>
                  {doneCount} dari {todays.length} selesai · {todo.length} menunggu
                </p>
              </div>
              <Link to="/care" className="panel-head__link">
                Semua jadwal <ChevronRight size={15} />
              </Link>
            </div>

            <div className="today-card__progress">
              <div className="progress progress--thin">
                <div className="progress__bar" style={{ width: `${progress}%` }} />
              </div>
              <span>{progress}%</span>
            </div>

            <div className="task-list">
              {todo.length === 0 ? (
                <div className="today-card__done">
                  <CheckCircle2 size={28} />
                  <div>
                    <strong>Semua tugas hari ini beres!</strong>
                    <span>Tanamanmu berterima kasih. Waktunya mencatat progres di jurnal.</span>
                  </div>
                </div>
              ) : (
                todo.slice(0, 3).map((task) => (
                  <TaskRow key={task.id} task={task} plant={getPlant(task.plantId)} compact />
                ))
              )}
            </div>
          </section>

          <section className="dash-section">
            <div className="panel-head">
              <div>
                <h2>
                  <Leaf size={18} /> Tanaman aktif
                </h2>
                <p>{plants.length} tanaman sedang kamu rawat</p>
              </div>
              <Link to="/garden" className="panel-head__link">
                My Garden <ChevronRight size={15} />
              </Link>
            </div>
            <div className="dash-plants">
              {plants.map((plant) => {
                const task = nextTaskFor(plant.id)
                return (
                  <Link to={`/garden?plant=${plant.id}`} key={plant.id} className="plant-tile card card-hover">
                    <div className="plant-tile__art">
                      <PottedPlant width={116} growth={plant.growth} pot={plant.pot} potTone={plant.potTone} />
                      <span className="plant-tile__stage">{stageLabel(plant.growth)}</span>
                    </div>
                    <div className="plant-tile__body">
                      <strong>{plant.name}</strong>
                      <span className="plant-tile__loc">
                        <Sprout size={11} /> {plant.location} · {plant.growth}%
                      </span>
                      <div className="progress progress--thin plant-tile__bar">
                        <div className="progress__bar" style={{ width: `${plant.growth}%` }} />
                      </div>
                      <span className={`plant-tile__task ${!task ? 'is-free' : ''}`}>
                        {task ? (
                          <>
                            <Droplets size={11} /> {task.time} · {task.title}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={11} /> Tidak ada tugas mendesak
                          </>
                        )}
                      </span>
                    </div>
                  </Link>
                )
              })}
              <Link to="/scan" className="plant-tile plant-tile--add">
                <span className="plant-tile__plus">
                  <Plus size={22} />
                </span>
                <strong>Tambah tanaman</strong>
                <span>Scan QR produk POTIVA</span>
              </Link>
            </div>
          </section>

          <section className="dash-section">
            <div className="panel-head">
              <div>
                <h2>
                  <BookOpen size={18} /> Aktivitas terakhir
                </h2>
                <p>Cerita dari Plant Journal</p>
              </div>
              <Link to="/journal" className="panel-head__link">
                Lihat jurnal <ChevronRight size={15} />
              </Link>
            </div>
            <div className="dash-journal">
              {journals.slice(0, 2).map((entry) => {
                const plant = getPlant(entry.plantId)
                return (
                  <Link to="/journal" key={entry.id} className="dash-journal__item card card-hover">
                    <div className="dash-journal__photo">
                      {entry.image ? (
                        <img src={entry.image} alt={entry.title} />
                      ) : (
                        <JournalPhoto entry={entry} />
                      )}
                    </div>
                    <div className="dash-journal__body">
                      <span className="dash-journal__meta">
                        {plant?.name} · {entry.date}
                      </span>
                      <strong>{entry.title}</strong>
                      <p>{entry.note}</p>
                      <span className="badge">{entry.stage}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="dash-side">
          <section className="wallet-card">
            <div className="wallet-card__top">
              <span className="wallet-card__level">
                <Trophy size={15} /> Level {level.level}
              </span>
              <span className="wallet-card__streak">
                <Flame size={14} /> {wallet.streak} hari
              </span>
            </div>
            <div className="wallet-card__xp">
              <div className="wallet-card__labels">
                <span>Progres level</span>
                <span>
                  {level.current}/{level.target} XP
                </span>
              </div>
              <div className="progress wallet-card__bar">
                <div className="progress__bar" style={{ width: `${level.percent}%` }} />
              </div>
            </div>
            <div className="wallet-card__stats">
              <div>
                <Coins size={16} />
                <strong>{wallet.coins}</strong>
                <span>Koin</span>
              </div>
              <div>
                <Zap size={16} />
                <strong>{wallet.xp}</strong>
                <span>Total XP</span>
              </div>
              <div>
                <Leaf size={16} />
                <strong>{plants.length}</strong>
                <span>Tanaman</span>
              </div>
            </div>
            <Link to="/garden" className="wallet-card__link">
              Lihat kebun virtual <ArrowRight size={15} />
            </Link>
          </section>

          <section className="card card--pad mission-card">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Misi harian</h2>
                <p>Hadiah kecil untuk perawatan yang aman.</p>
              </div>
              <span className="badge badge--fresh">Reset 00.00</span>
            </div>
            <div className="mission-list">
              {missions.map((mission) => {
                const complete = mission.progress >= mission.target
                return (
                  <div className={`mission ${complete ? 'is-complete' : ''}`} key={mission.id}>
                    <span className="mission__icon">
                      {complete ? <CheckCircle2 size={16} /> : <Sprout size={16} />}
                    </span>
                    <div className="mission__body">
                      <span>{mission.label}</span>
                      <div className="mission__row">
                        <div className="progress progress--thin">
                          <div
                            className="progress__bar"
                            style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                          />
                        </div>
                        <small>
                          {mission.progress}/{mission.target}
                        </small>
                      </div>
                    </div>
                    {complete && !mission.claimed ? (
                      <button
                        className="btn btn--sm btn--fresh"
                        onClick={() => actions.claimMission(mission.id)}
                      >
                        Klaim
                      </button>
                    ) : (
                      <span className={`mission__reward ${mission.claimed ? 'is-claimed' : ''}`}>
                        <Coins size={12} /> {mission.claimed ? 'Klaim' : mission.reward}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="card card--pad tip-card">
            <div className="tip-card__mascot">
              <Mascot size={86} waving={false} />
            </div>
            <div className="tip-card__body">
              <span className="eyebrow">Kata Poti</span>
              <p>{tip}</p>
            </div>
          </section>

          <section className="card card--pad recommend-card">
            <span className="eyebrow">Rekomendasi</span>
            <div className="recommend-card__book">
              <div className="recommend-card__cover">
                <BookOpen size={22} />
              </div>
              <div>
                <strong>{recommended.title}</strong>
                <span>
                  {recommended.pages} halaman · {recommended.category}
                </span>
                <span className="recommend-card__price">{formatIDR(recommended.price)}</span>
              </div>
            </div>
            <Link to="/library" className="btn btn--outline btn--block btn--sm">
              Lihat E-Library <ArrowRight size={14} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
