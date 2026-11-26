import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Droplets,
  Gamepad2,
  Info,
  Leaf,
  Palette,
  Play,
  Sun,
  Sparkles,
  Sprout,
  Trophy,
  Wind,
  Zap,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GardenGame from '../components/GardenGame'
import { EmptyArt, Mascot, PottedPlant } from '../components/illustrations'
import { MASCOT_TIPS, TASK_TYPES, levelFromXp } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import { formatDateID, secondsLeft, clamp } from '../lib/utils'

const STAGE = (g) =>
  g < 15 ? 'Benih' : g < 35 ? 'Kecambah' : g < 60 ? 'Tanaman muda' : g < 85 ? 'Tumbuh subur' : 'Siap panen'

function NeedBar({ icon: Icon, label, value, tone }) {
  return (
    <div className="need">
      <span className="need__icon" style={{ '--need-tone': tone }}>
        <Icon size={16} />
      </span>
      <div className="need__body">
        <div className="need__labels">
          <span>{label}</span>
          <strong>{value}%</strong>
        </div>
        <div className="progress progress--thin">
          <div
            className="progress__bar"
            style={{ width: `${value}%`, background: tone }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Garden() {
  usePageTitle('My Garden')
  const { plants, wallet, missions, getSpecies, potiLook, actions } = useApp()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [now, setNow] = useState(Date.now())
  const [fx, setFx] = useState(null)
  const [gameOpen, setGameOpen] = useState(() => params.has('play'))

  useEffect(() => {
    if (params.has('play')) setGameOpen(true)
  }, [params])

  const closeGame = () => {
    setGameOpen(false)
    if (params.has('play')) {
      const next = new URLSearchParams(params)
      next.delete('play')
      setParams(next, { replace: true })
    }
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const selected = useMemo(() => {
    const id = params.get('plant')
    return plants.find((p) => p.id === id) || plants[0] || null
  }, [params, plants])

  const species = selected ? getSpecies(selected) : null
  const level = levelFromXp(wallet.xp)
  const waterCooldown = selected ? secondsLeft(selected.lastWater, 15000) : 0
  const feedCooldown = selected ? secondsLeft(selected.lastFeed, 25000) : 0
  const days = selected
    ? Math.max(
        1,
        Math.round((new Date() - new Date(`${selected.plantedAt}T12:00:00`)) / 86400000) + 1,
      )
    : 0

  const playFx = (kind) => {
    setFx(kind)
    window.setTimeout(() => setFx(null), 1500)
  }

  const water = () => {
    if (!selected || waterCooldown > 0) return
    actions.waterPlant(selected.id)
    playFx('water')
    toast('+15 XP · +10 koin. Cek kelembapan dulu, ya — bukan sekadar rutinitas.', {
      title: 'Siram virtual tercatat 💧',
    })
  }

  const feed = () => {
    if (!selected || feedCooldown > 0) return
    actions.feedPlant(selected.id)
    playFx('feed')
    toast('+20 XP · +15 koin. Pupuk secukupnya, jangan berlebihan.', {
      title: 'Pupuk virtual ditambahkan 🌿',
    })
  }

  const decorate = () => {
    if (!selected) return
    actions.decoratePlant(selected.id)
    toast('Pot virtualmu berganti gaya. +5 XP.', { title: 'Ganti tampilan pot 🎨' })
  }

  if (!plants.length) {
    return (
      <div className="container page page--app">
        <PageHeader eyebrow="POTIVA Garden" title="Kebun virtualmu" subtitle="Tanam benih dari Shop dan rawat tanaman virtualmu di sini." />
        <section className="garden-play">
          <div className="garden-play__mascot" aria-hidden="true">
            <Mascot size={104} look={potiLook} />
          </div>
          <div className="garden-play__copy">
            <span className="garden-play__eyebrow">
              <Gamepad2 size={13} /> Mode petualangan Pixel 2D
            </span>
            <h2>Mainkan kebun Poti</h2>
            <p>
              Semua petak sedang siap ditanami! Buka game untuk menanam benih baru atau tukar hasil
              panenmu dengan voucher diskon POTIVA.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--fresh garden-play__cta"
            onClick={() => setGameOpen(true)}
          >
            <Play size={17} /> Mainkan game
          </button>
        </section>
        <div className="card card--pad empty">
          <EmptyArt variant="garden" />
          <h3>Belum ada tanaman yang sedang tumbuh</h3>
          <p>Beli benih di POTIVA Shop lalu tanam langsung di Kebun Poti 2D.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/shop?kategori=Benih" className="btn btn--primary">
              <Sprout size={17} /> Beli Benih di Shop
            </Link>
            <button type="button" className="btn btn--outline" onClick={() => setGameOpen(true)}>
              <Play size={17} /> Buka Kebun Poti
            </button>
          </div>
        </div>
        {gameOpen && <GardenGame plants={plants} onClose={closeGame} />}
      </div>
    )
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="POTIVA Garden"
        title="Rawat kebun virtualmu 🌱"
        subtitle="Setiap perawatan nyata yang kamu catat membuat taman ini bertumbuh. Status di sini adalah gamifikasi, bukan sensor tanaman asli."
        actions={
          <>
            <Link to="/journal" className="btn btn--outline">
              <Leaf size={17} /> Catat progres
            </Link>
            <button type="button" className="btn btn--primary" onClick={() => setGameOpen(true)}>
              <Sparkles size={17} /> Tanam di Kebun Poti
            </button>
          </>
        }
      />

      <section className="garden-play">
        <div className="garden-play__mascot" aria-hidden="true">
          <Mascot size={104} look={potiLook} />
        </div>
        <div className="garden-play__copy">
          <span className="garden-play__eyebrow">
            <Gamepad2 size={13} /> Mode petualangan Pixel 2D
          </span>
          <h2>Mainkan kebun Poti</h2>
          <p>
            Jelajahi kebun bergaya pixel art top-down! Seberangi jembatan sungai, kunjungi
            Rumah Kebun, Kincir Angin, Stan Pasar, &amp; Rumah Kaca, lalu rawat tanamanmu di
            petak ladang berpagar.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--fresh garden-play__cta"
          onClick={() => setGameOpen(true)}
        >
          <Play size={17} /> Mainkan game
        </button>
      </section>

      <div className="plant-switch scroll-x">
        {plants.map((plant) => (
          <button
            key={plant.id}
            className={`plant-switch__item ${selected?.id === plant.id ? 'is-active' : ''}`}
            onClick={() => setParams({ plant: plant.id }, { replace: true })}
          >
            <span className="plant-switch__dot" />
            <span>
              <strong>{plant.name}</strong>
              <small>{STAGE(plant.growth)} · {plant.growth}%</small>
            </span>
          </button>
        ))}
      </div>

      <div className="garden-layout">
        <div className="garden-main">
          <div className={`garden-stage ${fx ? `is-${fx}` : ''}`}>
            <div className="garden-stage__sky" />
            <div className="garden-stage__sun" />
            <div className="garden-stage__cloud garden-stage__cloud--1" />
            <div className="garden-stage__cloud garden-stage__cloud--2" />
            <div className="garden-stage__hill garden-stage__hill--back" />
            <div className="garden-stage__hill garden-stage__hill--front" />
            <div className="garden-stage__fence" />

            <div className="garden-stage__plate">
              <span className="garden-stage__stage">{STAGE(selected.growth)}</span>
              <strong>{selected.name}</strong>
              <span>
                {species?.latin} · Hari ke-{days}
              </span>
              <div className="garden-stage__growth">
                <div className="progress progress--thin">
                  <div className="progress__bar" style={{ width: `${selected.growth}%` }} />
                </div>
                <small>{selected.growth}% tumbuh</small>
              </div>
            </div>

            <div className="garden-stage__plant">
              <PottedPlant
                width={320}
                growth={selected.growth}
                pot={selected.pot}
                potTone={selected.potTone}
              />
              {fx === 'water' && (
                <span className="garden-fx garden-fx--water" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              )}
              {fx === 'feed' && (
                <span className="garden-fx garden-fx--feed" aria-hidden="true">
                  <i>✦</i>
                  <i>✦</i>
                  <i>✦</i>
                </span>
              )}
            </div>

            <div className="garden-stage__mascot">
              <Mascot size={150} look={potiLook} />
              <span className="garden-bubble">
                {selected.needs.water < 40
                  ? 'Media mungkin mulai kering. Cek dulu, ya!'
                  : fx
                    ? 'Terima kasih sudah merawat!'
                    : 'Yuk, rawat kebun virtualmu!'}
              </span>
            </div>

            <div className="garden-stage__ground" />
          </div>

          <div className="garden-actions">
            <button className="garden-action garden-action--water" onClick={water} disabled={waterCooldown > 0}>
              <span className="garden-action__icon">
                <Droplets size={22} />
              </span>
              <span className="garden-action__text">
                <strong>Siram</strong>
                <small>{waterCooldown > 0 ? `Jeda ${waterCooldown}s` : '+15 XP'}</small>
              </span>
            </button>
            <button className="garden-action garden-action--feed" onClick={feed} disabled={feedCooldown > 0}>
              <span className="garden-action__icon">
                <Sprout size={22} />
              </span>
              <span className="garden-action__text">
                <strong>Pupuk</strong>
                <small>{feedCooldown > 0 ? `Jeda ${feedCooldown}s` : '+20 XP'}</small>
              </span>
            </button>
            <button className="garden-action garden-action--deco" onClick={decorate}>
              <span className="garden-action__icon">
                <Palette size={22} />
              </span>
              <span className="garden-action__text">
                <strong>Hias</strong>
                <small>Ganti pot</small>
              </span>
            </button>
            <a href="#misi" className="garden-action garden-action--mission">
              <span className="garden-action__icon">
                <Trophy size={22} />
              </span>
              <span className="garden-action__text">
                <strong>Misi</strong>
                <small>{missions.filter((m) => m.progress >= m.target).length} siap klaim</small>
              </span>
            </a>
          </div>
          <p className="garden-hint">
            <Info size={14} /> Aksi game punya jeda agar tidak mendorong penyiraman atau
            pemupukan berlebihan. Gunakan kondisi media tanam asli sebagai acuan utama.
          </p>
        </div>

        <aside className="garden-side">
          <section className="card card--pad plant-detail">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>{selected.name}</h2>
                <p>
                  {species?.emoji} {species?.difficulty} · Tanam {formatDateID(selected.plantedAt, { year: false })}
                </p>
              </div>
              <span className="badge badge--fresh">{STAGE(selected.growth)}</span>
            </div>
            <div className="plant-detail__needs">
              <NeedBar icon={Droplets} label="Kebutuhan air" value={selected.needs.water} tone="#5BA8C8" />
              <NeedBar icon={Leaf} label="Nutrisi" value={selected.needs.nutrient} tone="#3F8F55" />
              <NeedBar icon={Sun} label="Paparan cahaya" value={selected.needs.light} tone="#E0A93A" />
            </div>
            <div className="plant-detail__meta">
              <span>
                <Wind size={14} /> {species?.light}
              </span>
              <span>
                <Droplets size={14} /> {species?.water}
              </span>
              <span>
                <Sprout size={14} /> Panen {species?.harvest}
              </span>
            </div>
            <Link to="/care" className="btn btn--outline btn--block btn--sm">
              Atur jadwal perawatan <CalendarArrow />
            </Link>
          </section>

          <section className="card card--pad wallet-compact">
            <div className="wallet-compact__top">
              <span className="wallet-compact__level">
                <Trophy size={15} /> Level {level.level}
              </span>
              <span className="wallet-compact__coins">
                <Coins size={14} /> {wallet.coins}
              </span>
            </div>
            <div className="progress progress--thin">
              <div className="progress__bar" style={{ width: `${level.percent}%` }} />
            </div>
            <div className="wallet-compact__foot">
              <span>{level.current}/{level.target} XP</span>
              <span>{wallet.xp} XP total</span>
            </div>
          </section>

          <section className="card card--pad" id="misi">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>Misi harian</h2>
                <p>Hadiah dari perawatan yang aman.</p>
              </div>
              <span className="badge">Hari ini</span>
            </div>
            <div className="mission-list">
              {missions.map((m) => {
                const complete = m.progress >= m.target
                return (
                  <div className={`mission ${complete ? 'is-complete' : ''}`} key={m.id}>
                    <span className="mission__icon">
                      {complete ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                    </span>
                    <div className="mission__body">
                      <span>{m.label}</span>
                      <div className="mission__row">
                        <div className="progress progress--thin">
                          <div
                            className="progress__bar"
                            style={{ width: `${(m.progress / m.target) * 100}%` }}
                          />
                        </div>
                        <small>
                          {m.progress}/{m.target}
                        </small>
                      </div>
                    </div>
                    {complete && !m.claimed ? (
                      <button
                        className="btn btn--sm btn--fresh"
                        onClick={() => {
                          actions.claimMission(m.id)
                          toast(`+${m.reward + 10} koin masuk dompetmu.`, { title: 'Misi selesai 🎉' })
                        }}
                      >
                        Klaim
                      </button>
                    ) : (
                      <span className={`mission__reward ${m.claimed ? 'is-claimed' : ''}`}>
                        {m.claimed ? <Check size={12} /> : <Coins size={12} />}
                        {m.claimed ? 'Klaim' : m.reward}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="garden-tip">
            <span className="garden-tip__icon">
              <Info size={16} />
            </span>
            <p>
              Progres virtual tidak mengukur kondisi tanaman asli. Catat perubahan nyata
              lewat foto di <Link to="/journal">Plant Journal</Link>.
            </p>
          </section>
        </aside>
      </div>

      {gameOpen && <GardenGame plants={plants} onClose={closeGame} />}
    </div>
  )
}

function CalendarArrow() {
  return <ArrowRight size={15} />
}
