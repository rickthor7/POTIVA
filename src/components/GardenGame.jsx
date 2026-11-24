import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  Coins,
  Droplets,
  Expand,
  Gamepad2,
  Leaf,
  LogOut,
  Maximize2,
  Minimize2,
  Move,
  Pause,
  Play,
  RotateCw,
  Smartphone,
  Sparkles,
  Sprout,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { Mascot, PottedPlant } from './illustrations'
import { useApp } from '../store/AppStore'
import { clamp } from '../lib/utils'

const WORLD = { w: 1960, h: 1280 }
const START = { x: 1000, y: 1040 }
const SPEED = 315
const REACH = 170
const QUEST = { water: 3, dew: 3 }
const PLANT_SLOTS = [
  { x: 790, y: 985 },
  { x: 1040, y: 900 },
  { x: 1290, y: 995 },
  { x: 700, y: 1130 },
  { x: 1400, y: 1125 },
  { x: 880, y: 700 },
  { x: 1210, y: 720 },
]
const DEW_SEED = [
  { x: 880, y: 840 },
  { x: 1150, y: 730 },
  { x: 640, y: 930 },
  { x: 1420, y: 900 },
  { x: 1180, y: 1150 },
  { x: 1270, y: 500 },
]

const mulberry32 = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const makeDew = (x, y) => ({
  id: `dew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  x: x ?? 180 + Math.random() * (WORLD.w - 360),
  y: y ?? 280 + Math.random() * (WORLD.h - 420),
})

const buildDecor = () => {
  const rnd = mulberry32(20261124)
  const tufts = Array.from({ length: 110 }, () => ({
    x: 40 + rnd() * (WORLD.w - 80),
    y: 80 + rnd() * (WORLD.h - 120),
    s: 0.7 + rnd() * 0.7,
    d: rnd() * 4,
  }))
  const flowers = Array.from({ length: 34 }, () => ({
    x: 60 + rnd() * (WORLD.w - 120),
    y: 120 + rnd() * (WORLD.h - 180),
    c: ['#f6b7a3', '#fff3d0', '#c7e59c', '#e9b6d3'][Math.floor(rnd() * 4)],
    s: 0.7 + rnd() * 0.6,
  }))
  const stones = Array.from({ length: 14 }, () => ({
    x: 80 + rnd() * (WORLD.w - 160),
    y: 120 + rnd() * (WORLD.h - 200),
    s: 0.6 + rnd() * 0.9,
  }))
  const trees = [
    { x: 120, y: 300, s: 1.05 },
    { x: 180, y: 820, s: 0.9 },
    { x: 90, y: 1190, s: 1.15 },
    { x: 1840, y: 260, s: 1.1 },
    { x: 1890, y: 760, s: 0.95 },
    { x: 1780, y: 1200, s: 1.2 },
    { x: 560, y: 190, s: 0.85 },
    { x: 1490, y: 200, s: 0.9 },
  ]
  const flies = [
    { x: 520, y: 640, d: 0, c: '#f6b7a3' },
    { x: 1210, y: 880, d: 3.5, c: '#ffe6a6' },
    { x: 1580, y: 520, d: 6.2, c: '#c7e59c' },
  ]
  return { tufts, flowers, stones, trees, flies }
}

const cooldownLeft = (timestamp, ms, now) =>
  timestamp ? Math.max(0, Math.ceil((ms - (now - timestamp)) / 1000)) : 0

function Joystick({ onChange, disabled }) {
  const baseRef = useRef(null)
  const pointer = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const update = (event) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const max = rect.width * 0.33
    let dx = event.clientX - (rect.left + rect.width / 2)
    let dy = event.clientY - (rect.top + rect.height / 2)
    const dist = Math.hypot(dx, dy)
    if (dist > max) {
      dx = (dx / dist) * max
      dy = (dy / dist) * max
    }
    setKnob({ x: dx, y: dy })
    onChange({ x: dx / max, y: dy / max })
  }

  const release = () => {
    pointer.current = null
    setKnob({ x: 0, y: 0 })
    onChange({ x: 0, y: 0 })
  }

  return (
    <div className="g-stick-zone">
      <div
        ref={baseRef}
        className="g-stick"
        role="group"
        aria-label="Joystick gerak Poti. Di keyboard gunakan WASD atau tombol panah."
        onPointerDown={(e) => {
          if (disabled) return
          pointer.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          update(e)
        }}
        onPointerMove={(e) => {
          if (pointer.current !== e.pointerId) return
          update(e)
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span className="g-stick__ring" aria-hidden="true" />
        <span className="g-stick__arrows" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="g-stick__knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}>
          <Move size={20} />
        </span>
      </div>
      <span className="g-stick__label">Gerak</span>
    </div>
  )
}

function ActionButton({ tone, icon: Icon, label, sub, disabled, onClick, primary }) {
  return (
    <button
      type="button"
      className={`g-act g-act--${tone} ${primary ? 'g-act--primary' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label}${sub ? `, ${sub}` : ''}`}
    >
      <Icon size={primary ? 28 : 22} />
      <strong>{label}</strong>
      <small>{sub}</small>
    </button>
  )
}

function PlantFx({ kind }) {
  if (kind === 'water') {
    return (
      <span className="g-fx g-fx--water" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </span>
    )
  }
  if (kind === 'feed') {
    return (
      <span className="g-fx g-fx--feed" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} style={{ '--i': i }}>✦</i>
        ))}
      </span>
    )
  }
  if (kind === 'deco') {
    return (
      <span className="g-fx g-fx--deco" aria-hidden="true">
        <i />
      </span>
    )
  }
  return (
    <span className="g-fx g-fx--cheer" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} style={{ '--i': i }}>✦</i>
      ))}
    </span>
  )
}

export default function GardenGame({ plants, onClose }) {
  const { wallet, actions } = useApp()
  const [phase, setPhase] = useState('intro')
  const [portrait, setPortrait] = useState(
    () => typeof window !== 'undefined' && window.innerHeight > window.innerWidth,
  )
  const [isFs, setIsFs] = useState(false)
  const [viewport, setViewport] = useState({ w: 1280, h: 720 })
  const [activeId, setActiveId] = useState(null)
  const [fx, setFx] = useState(null)
  const [message, setMessage] = useState(null)
  const [cheerKey, setCheerKey] = useState(0)
  const [marker, setMarker] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [dew, setDew] = useState(() => DEW_SEED.map((d) => makeDew(d.x, d.y)))
  const [stats, setStats] = useState({ water: 0, feed: 0, deco: 0, cheer: 0, dew: 0 })

  const rootRef = useRef(null)
  const worldRef = useRef(null)
  const introBtnRef = useRef(null)
  const playerEl = useRef(null)
  const stick = useRef({ x: 0, y: 0 })
  const waypoint = useRef(null)
  const keys = useRef(new Set())
  const player = useRef({ ...START, facing: 1 })
  const cam = useRef({ x: 0, y: 0 })
  const activeRef = useRef(null)
  const phaseRef = useRef(phase)
  const viewportRef = useRef(viewport)
  const plantsRef = useRef([])
  const dewRef = useRef(dew)
  const actRef = useRef(() => {})
  const collectRef = useRef(() => {})
  const fxTimer = useRef(null)
  const msgTimer = useRef(null)
  const markerTimer = useRef(null)
  const questAwarded = useRef(false)

  phaseRef.current = phase
  viewportRef.current = viewport
  dewRef.current = dew

  const supportsFs = useMemo(
    () =>
      typeof document !== 'undefined' &&
      (document.fullscreenEnabled ||
        typeof document.documentElement.requestFullscreen === 'function'),
    [],
  )

  const scale = clamp(viewport.h / 780, 0.62, 1.18)
  const plantArt = Math.round(168 * scale)
  const playerArt = Math.round(124 * scale)

  const decor = useMemo(buildDecor, [])

  const placed = useMemo(
    () =>
      plants.map((plant, index) => {
        const slot = PLANT_SLOTS[index % PLANT_SLOTS.length]
        const lap = Math.floor(index / PLANT_SLOTS.length)
        return {
          ...plant,
          x: clamp(slot.x + lap * 90, 120, WORLD.w - 120),
          y: clamp(slot.y + lap * 70, 260, WORLD.h - 90),
        }
      }),
    [plants],
  )
  plantsRef.current = placed

  const active = placed.find((p) => p.id === activeId) || null
  const waterCd = active ? cooldownLeft(active.lastWater, 15000, now) : 0
  const feedCd = active ? cooldownLeft(active.lastFeed, 25000, now) : 0
  const questDone =
    stats.water >= QUEST.water && stats.dew >= QUEST.dew
  const questProgress =
    Math.min(stats.water, QUEST.water) + Math.min(stats.dew, QUEST.dew)

  const flash = useCallback((text, tone = 'info') => {
    setMessage({ text, tone, id: Date.now() })
    window.clearTimeout(msgTimer.current)
    msgTimer.current = window.setTimeout(() => setMessage(null), 2800)
  }, [])

  const burst = useCallback((plantId, kind) => {
    setFx({ plantId, kind, key: Date.now() })
    window.clearTimeout(fxTimer.current)
    fxTimer.current = window.setTimeout(() => setFx(null), 1400)
  }, [])

  // Tap/touch navigation: Poti walks to the tapped spot or plant.
  const goTo = useCallback(
    (x, y, text) => {
      if (phaseRef.current !== 'playing' || portrait) return
      waypoint.current = {
        x: clamp(x, 80, WORLD.w - 80),
        y: clamp(y, 150, WORLD.h - 60),
      }
      setMarker({ ...waypoint.current, id: Date.now() })
      window.clearTimeout(markerTimer.current)
      markerTimer.current = window.setTimeout(() => setMarker(null), 1300)
      if (text) flash(text, 'info')
    },
    [flash, portrait],
  )

  const onStick = useCallback((v) => {
    if (Math.hypot(v.x, v.y) > 0.14) waypoint.current = null
    stick.current = v
  }, [])

  const onViewClick = useCallback(
    (event) => {
      if (phaseRef.current !== 'playing' || portrait) return
      const rect = event.currentTarget.getBoundingClientRect()
      goTo(
        cam.current.x + (event.clientX - rect.left),
        cam.current.y + (event.clientY - rect.top),
      )
    },
    [goTo, portrait],
  )

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    const prevFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    const site = document.querySelector('.site')
    site?.setAttribute('inert', '')
    return () => {
      document.body.style.overflow = prev
      site?.removeAttribute('inert')
      if (prevFocus instanceof HTMLElement) prevFocus.focus?.()
      window.clearTimeout(fxTimer.current)
      window.clearTimeout(msgTimer.current)
      window.clearTimeout(markerTimer.current)
    }
  }, [])

  // Track container size and decide whether the rotate gate is needed.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const touch =
      window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
    const update = () => {
      const w = el.clientWidth || window.innerWidth
      const h = el.clientHeight || window.innerHeight
      setViewport({ w, h })
      setPortrait(h > w && (touch || Math.min(w, h) < 520))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('orientationchange', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  useEffect(() => {
    if (portrait && phaseRef.current === 'playing') setPhase('paused')
  }, [portrait])

  useEffect(() => {
    if (phase === 'intro' && !portrait) introBtnRef.current?.focus?.()
  }, [phase, portrait])

  useEffect(() => {
    if (phase === 'playing') return
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
  }, [phase])

  const requestFullscreen = useCallback(async () => {
    const el = rootRef.current
    try {
      if (!document.fullscreenElement) {
        if (el?.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' })
        else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen()
      }
    } catch {
      /* iOS Safari and embedded browsers may refuse — the overlay still fills the screen. */
    }
    try {
      if (screen.orientation?.lock) await screen.orientation.lock('landscape')
    } catch {
      /* Orientation lock needs fullscreen support; the rotate gate handles the rest. */
    }
  }, [])

  const close = useCallback(() => {
    try {
      if (document.fullscreenElement) document.exitFullscreen()
    } catch {
      /* ignore */
    }
    try {
      screen.orientation?.unlock?.()
    } catch {
      /* ignore */
    }
    onClose()
  }, [onClose])

  useEffect(() => {
    const onChange = () => {
      const activeFs = Boolean(document.fullscreenElement)
      setIsFs(activeFs)
      const el = rootRef.current
      if (el) setViewport({ w: el.clientWidth, h: el.clientHeight })
      if (!activeFs && phaseRef.current === 'playing') setPhase('paused')
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const start = async () => {
    setPhase('playing')
    flash('Dekati tanaman, lalu rawat dengan tombol di kanan.', 'info')
    await requestFullscreen()
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        /* ignore */
      }
      return
    }
    await requestFullscreen()
  }

  const cheerWorld = () => {
    const el = worldRef.current
    if (!el) return
    el.classList.remove('is-cheering')
    void el.offsetWidth
    el.classList.add('is-cheering')
    window.setTimeout(() => el.classList.remove('is-cheering'), 900)
  }

  // Session challenge: water 3 plants and collect 3 dew drops.
  useEffect(() => {
    if (phase !== 'playing' || questAwarded.current || !questDone) return
    questAwarded.current = true
    actions.collectBonus(30, 25)
    cheerWorld()
    flash('Tantangan kebun selesai! +30 koin · +25 XP 🎉', 'cheer')
  }, [phase, questDone, actions, flash])

  const act = (kind) => {
    if (phaseRef.current !== 'playing') return
    if (kind === 'cheer') {
      setCheerKey((k) => k + 1)
      cheerWorld()
      setStats((s) => ({ ...s, cheer: s.cheer + 1 }))
      flash('Semangat! Poti dan tanaman ikut bergoyang 🎉', 'cheer')
      return
    }
    if (!active) {
      flash('Dekati tanaman dulu, lalu tekan tombolnya.', 'warn')
      return
    }
    if (kind === 'water') {
      if (waterCd > 0) return
      actions.waterPlant(active.id)
      burst(active.id, 'water')
      setCheerKey((k) => k + 1)
      setStats((s) => ({ ...s, water: s.water + 1 }))
      flash(`Siram ${active.name} · +15 XP · +10 koin`, 'water')
    } else if (kind === 'feed') {
      if (feedCd > 0) return
      actions.feedPlant(active.id)
      burst(active.id, 'feed')
      setCheerKey((k) => k + 1)
      setStats((s) => ({ ...s, feed: s.feed + 1 }))
      flash(`Pupuk ${active.name} · +20 XP · +15 koin`, 'feed')
    } else if (kind === 'deco') {
      actions.decoratePlant(active.id)
      burst(active.id, 'deco')
      setStats((s) => ({ ...s, deco: s.deco + 1 }))
      flash(`Pot ${active.name} berganti gaya · +5 XP`, 'deco')
    }
  }
  actRef.current = act

  collectRef.current = (drop) => {
    if (!dewRef.current.some((d) => d.id === drop.id)) return
    actions.collectBonus(2, 1)
    setDew((list) => list.filter((d) => d.id !== drop.id))
    setStats((s) => ({ ...s, dew: s.dew + 1 }))
    flash('Embun terkumpul · +2 koin · +1 XP', 'dew')
  }

  // Respawn a few dew drops while playing so exploring stays rewarding.
  useEffect(() => {
    if (phase !== 'playing') return undefined
    const id = setInterval(() => {
      setDew((list) => (list.length >= 7 ? list : [...list, makeDew()]))
    }, 9000)
    return () => clearInterval(id)
  }, [phase])

  // Keyboard support: WASD/arrows to move, E/F/G/C for actions.
  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase()
      const movement = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
      if (movement.includes(k) || k === ' ') e.preventDefault()
      if (movement.includes(k)) keys.current.add(k)
      if (phaseRef.current !== 'playing' || e.repeat) return
      if (k === 'e' || k === '1') actRef.current('water')
      if (k === 'f' || k === '2') actRef.current('feed')
      if (k === 'g' || k === '3') actRef.current('deco')
      if (k === 'c' || k === ' ') actRef.current('cheer')
    }
    const up = (e) => {
      keys.current.delete(e.key.toLowerCase())
    }
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (document.fullscreenElement) return
      setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Game loop. Movement and camera are written straight to the DOM for smoothness.
  useEffect(() => {
    let raf
    let last = performance.now()
    let moving = false

    const tick = (t) => {
      const dt = Math.min(0.045, Math.max(0.001, (t - last) / 1000))
      last = t
      const p = player.current
      let isMoving = false

      if (phaseRef.current === 'playing') {
        let ix = stick.current.x
        let iy = stick.current.y
        const held = keys.current
        if (held.has('w') || held.has('arrowup')) iy -= 1
        if (held.has('s') || held.has('arrowdown')) iy += 1
        if (held.has('a') || held.has('arrowleft')) ix -= 1
        if (held.has('d') || held.has('arrowright')) ix += 1
        if (held.size) waypoint.current = null

        let mag = Math.hypot(ix, iy)
        const wp = waypoint.current
        if (mag <= 0.14 && wp) {
          const dx = wp.x - p.x
          const dy = wp.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < 22) {
            waypoint.current = null
            setMarker(null)
          } else {
            ix = dx / dist
            iy = dy / dist
            mag = 1
          }
        }
        if (mag > 0.14) {
          const strength = Math.min(1, mag)
          p.x = clamp(p.x + (ix / mag) * SPEED * strength * dt, 80, WORLD.w - 80)
          p.y = clamp(p.y + (iy / mag) * SPEED * strength * dt, 150, WORLD.h - 60)
          if (Math.abs(ix) > 0.22) p.facing = ix > 0 ? 1 : -1
          isMoving = true
        }

        for (const drop of dewRef.current) {
          if (Math.hypot(drop.x - p.x, drop.y - p.y) < 62) {
            collectRef.current(drop)
            break
          }
        }

        let nearest = null
        let best = REACH
        for (const item of plantsRef.current) {
          const dist = Math.hypot(item.x - p.x, item.y - p.y)
          if (dist < best) {
            best = dist
            nearest = item
          }
        }
        const nextId = nearest ? nearest.id : null
        if (nextId !== activeRef.current) {
          activeRef.current = nextId
          setActiveId(nextId)
        }
      }

      if (isMoving !== moving) {
        moving = isMoving
        playerEl.current?.classList.toggle('is-moving', isMoving)
      }

      if (playerEl.current) {
        playerEl.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
        playerEl.current.style.setProperty('--flip', p.facing)
        playerEl.current.style.zIndex = String(Math.round(p.y))
      }

      const vw = viewportRef.current.w
      const vh = viewportRef.current.h
      const targetX = clamp(p.x - vw / 2, 0, Math.max(0, WORLD.w - vw))
      const targetY = clamp(p.y - vh * 0.66, 0, Math.max(0, WORLD.h - vh))
      cam.current.x += (targetX - cam.current.x) * Math.min(1, dt * 7)
      cam.current.y += (targetY - cam.current.y) * Math.min(1, dt * 7)
      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${-cam.current.x}px, ${-cam.current.y}px, 0)`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Place the camera on the player as soon as the container is measured.
  useEffect(() => {
    const vw = viewport.w
    const vh = viewport.h
    cam.current.x = clamp(player.current.x - vw / 2, 0, Math.max(0, WORLD.w - vw))
    cam.current.y = clamp(player.current.y - vh * 0.66, 0, Math.max(0, WORLD.h - vh))
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${-cam.current.x}px, ${-cam.current.y}px, 0)`
    }
  }, [viewport])

  const needsBars = (plant) => (
    <span className="g-plant__needs" aria-hidden="true">
      <i><span style={{ width: `${plant.needs.water}%`, background: '#5ba8c8' }} /></i>
      <i><span style={{ width: `${plant.needs.nutrient}%`, background: '#3f8f55' }} /></i>
      <i><span style={{ width: `${plant.needs.light}%`, background: '#e0a93a' }} /></i>
    </span>
  )

  return createPortal(
    <div
      ref={rootRef}
      className="game"
      role="dialog"
      aria-modal="true"
      aria-label="Mode petualangan POTIVA Garden"
      data-phase={phase}
    >
      <div className="g-viewport" onClick={onViewClick}>
        <div
          className="g-world"
          ref={worldRef}
          style={{ width: `${WORLD.w}px`, height: `${WORLD.h}px` }}
        >
          <div className="g-ground" aria-hidden="true" />
          <svg
            className="g-path"
            viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M-100 930C260 830 430 1080 780 980S1280 780 1580 900s340 140 500 20"
              fill="none"
              stroke="#cdb98f"
              strokeWidth="188"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M-100 930C260 830 430 1080 780 980S1280 780 1580 900s340 140 500 20"
              fill="none"
              stroke="#e2d1ac"
              strokeWidth="156"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M-100 930C260 830 430 1080 780 980S1280 780 1580 900s340 140 500 20"
              fill="none"
              stroke="#f4ead3"
              strokeWidth="6"
              strokeDasharray="18 30"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          <div className="g-pond" aria-hidden="true">
            <span className="g-pond__pad g-pond__pad--1" />
            <span className="g-pond__pad g-pond__pad--2" />
            <span className="g-pond__pad g-pond__pad--3" />
          </div>

          {decor.stones.map((stone, i) => (
            <span
              key={`stone-${i}`}
              className="g-stone"
              aria-hidden="true"
              style={{ left: stone.x, top: stone.y, '--s': stone.s }}
            />
          ))}
          {decor.tufts.map((tuft, i) => (
            <span
              key={`tuft-${i}`}
              className="g-tuft"
              aria-hidden="true"
              style={{ left: tuft.x, top: tuft.y, '--s': tuft.s, '--d': `${tuft.d}s` }}
            />
          ))}
          {decor.flowers.map((flower, i) => (
            <span
              key={`flower-${i}`}
              className="g-flower"
              aria-hidden="true"
              style={{ left: flower.x, top: flower.y, '--s': flower.s, '--c': flower.c }}
            />
          ))}
          {decor.trees.map((tree, i) => (
            <span
              key={`tree-${i}`}
              className="g-tree"
              aria-hidden="true"
              style={{ left: tree.x, top: tree.y, '--s': tree.s, zIndex: Math.round(tree.y) }}
            >
              <span className="g-tree__shadow" />
              <span className="g-tree__trunk" />
              <span className="g-tree__crown g-tree__crown--1" />
              <span className="g-tree__crown g-tree__crown--2" />
              <span className="g-tree__crown g-tree__crown--3" />
            </span>
          ))}

          <div className="g-fence" aria-hidden="true" />

          {dew.map((drop) => (
            <button
              key={drop.id}
              type="button"
              className="g-dew"
              style={{ left: drop.x, top: drop.y }}
              onClick={(event) => {
                event.stopPropagation()
                collectRef.current(drop)
              }}
              aria-label="Ambil embun bonus: 2 koin"
            >
              <span />
            </button>
          ))}

          {placed.map((plant) => (
            <div
              key={plant.id}
              className={`g-plant ${activeId === plant.id ? 'is-active' : ''} ${
                plant.x > WORLD.w * 0.6 ? 'is-left' : ''
              }`}
              style={{ left: plant.x, top: plant.y, zIndex: Math.round(plant.y) }}
              role="button"
              tabIndex={0}
              aria-label={`Menuju ${plant.name}`}
              onClick={(event) => {
                event.stopPropagation()
                goTo(plant.x, plant.y + 30, `Menuju ${plant.name}`)
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                event.stopPropagation()
                goTo(plant.x, plant.y + 30, `Menuju ${plant.name}`)
              }}
            >
              <span className="g-plant__bed" aria-hidden="true" />
              <span className="g-plant__ring" aria-hidden="true" />
              <div className="g-plant__art" style={{ width: plantArt }}>
                <PottedPlant
                  width={plantArt}
                  growth={plant.growth}
                  pot={plant.pot}
                  potTone={plant.potTone}
                />
                {fx?.plantId === plant.id && <PlantFx key={fx.key} kind={fx.kind} />}
              </div>
              <div className="g-plant__label">
                <strong>{plant.name}</strong>
                {needsBars(plant)}
                {activeId === plant.id && <em>Tekan tombol aksi</em>}
              </div>
            </div>
          ))}

          <div className="g-flies" aria-hidden="true">
            {decor.flies.map((fly, i) => (
              <span
                key={`fly-${i}`}
                className="g-fly"
                style={{ left: fly.x, top: fly.y, '--d': `${fly.d}s`, '--c': fly.c }}
              >
                <i />
                <i />
              </span>
            ))}
          </div>

          {marker && (
            <span
              key={marker.id}
              className="g-marker"
              style={{ left: marker.x, top: marker.y }}
              aria-hidden="true"
            >
              <i />
              <i />
            </span>
          )}

          <div className="g-player" ref={playerEl}>
            <span className="g-player__shadow" aria-hidden="true" />
            <div className={`g-player__inner ${cheerKey ? 'is-cheer' : ''}`} key={cheerKey} style={{ width: playerArt }}>
              <div className="g-player__body">
                <Mascot size={playerArt} />
              </div>
            </div>
            <span className="g-player__name">Poti</span>
          </div>
        </div>
      </div>

      <header className="g-hud">
        <div className="g-hud__left">
          <button
            type="button"
            className="g-icon-btn"
            onClick={() => setPhase('paused')}
            aria-label="Jeda permainan"
          >
            <Pause size={19} />
          </button>
          <span className="g-chip">
            <Sprout size={14} /> {placed.length} tanaman
          </span>
          <span className={`g-chip g-chip--quest ${questDone ? 'is-done' : ''}`}>
            <Trophy size={14} /> Tantangan {questProgress}/{QUEST.water + QUEST.dew}
          </span>
        </div>
        <div className="g-hud__right">
          <span className="g-wallet">
            <Coins size={14} /> {wallet.coins}
          </span>
          <span className="g-wallet">
            <Zap size={14} /> {wallet.xp} XP
          </span>
          {supportsFs && (
            <button
              type="button"
              className="g-icon-btn"
              onClick={toggleFullscreen}
              aria-label={isFs ? 'Keluar dari layar penuh' : 'Masuk layar penuh'}
            >
              {isFs ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
            </button>
          )}
        </div>
      </header>

      {phase === 'playing' && (
        <>
          <div className={`g-target ${active ? 'is-active' : ''}`} aria-live="polite">
            {active ? (
              <>
                <span className="g-target__name">
                  <Leaf size={14} /> {active.name}
                </span>
                <span className="g-target__stat">
                  <Droplets size={13} /> {active.needs.water}%
                </span>
                <span className="g-target__stat">
                  <Sprout size={13} /> {active.needs.nutrient}%
                </span>
                <span className="g-target__hint">
                  {waterCd > 0 ? `Siram siap ${waterCd}s` : 'Siap dirawat'}
                </span>
              </>
            ) : (
              <span className="g-target__hint">
                <Move size={14} /> Dekati tanaman untuk merawat
              </span>
            )}
          </div>

          {message && (
            <div key={message.id} className={`g-msg g-msg--${message.tone}`} role="status">
              {message.text}
            </div>
          )}

          <Joystick onChange={onStick} disabled={portrait} />

          <div className="g-pad" aria-label="Tombol aksi perawatan">
            <ActionButton
              tone="feed"
              icon={Sprout}
              label="Pupuk"
              sub={feedCd > 0 ? `${feedCd}s` : '+20 XP'}
              disabled={feedCd > 0}
              onClick={() => act('feed')}
            />
            <ActionButton
              tone="deco"
              icon={Sparkles}
              label="Hias"
              sub="Ganti pot"
              onClick={() => act('deco')}
            />
            <ActionButton
              tone="cheer"
              icon={Sparkles}
              label="Semangat"
              sub="Ceria"
              onClick={() => act('cheer')}
            />
            <ActionButton
              tone="water"
              icon={Droplets}
              label="Siram"
              sub={waterCd > 0 ? `${waterCd}s` : '+15 XP'}
              disabled={waterCd > 0}
              onClick={() => act('water')}
              primary
            />
          </div>
        </>
      )}

      {phase === 'intro' && (
        <div className="g-overlay">
          <div className="g-card g-intro" role="document">
            <span className="g-intro__badge">
              <Gamepad2 size={14} /> Mode petualangan
            </span>
            <h2>Kebun Poti</h2>
            <p className="g-intro__lead">
              Jelajahi kebun dengan joystick atau ketuk tanah untuk berjalan otomatis.
              Dekati tanaman, lalu rawat dengan tombol aksi di kanan. Selesaikan
              tantangan: siram 3 tanaman dan kumpulkan 3 embun!
            </p>
            <div className="g-intro__controls">
              <div>
                <span className="g-intro__ico g-intro__ico--stick"><Move size={18} /></span>
                <strong>Joystick kiri</strong>
                <small>Jalan keliling kebun</small>
              </div>
              <div>
                <span className="g-intro__ico g-intro__ico--act"><Droplets size={18} /></span>
                <strong>Tombol kanan</strong>
                <small>Siram, pupuk, hias</small>
              </div>
              <div>
                <span className="g-intro__ico g-intro__ico--dew"><Coins size={18} /></span>
                <strong>Embun</strong>
                <small>Kumpulkan koin bonus</small>
              </div>
            </div>
            <div className="g-intro__actions">
              <button type="button" className="g-cta" onClick={start} ref={introBtnRef}>
                {supportsFs ? <Maximize2 size={18} /> : <Play size={18} />}
                {supportsFs ? 'Mulai & layar penuh' : 'Mulai bermain'}
              </button>
              <button type="button" className="g-cta g-cta--ghost" onClick={close}>
                <ArrowLeft size={18} /> Kembali ke kebun
              </button>
            </div>
            <p className="g-intro__note">
              {supportsFs
                ? 'Game akan membuka layar penuh. Di HP, putar perangkat ke landscape terlebih dahulu.'
                : 'Layar penuh tidak tersedia di browser ini, tetapi game tetap memenuhi layar. Di HP, gunakan posisi landscape.'}
            </p>
            <p className="g-intro__keys">
              Keyboard: <kbd>WASD</kbd>/panah untuk gerak · <kbd>E</kbd> siram ·{' '}
              <kbd>F</kbd> pupuk · <kbd>G</kbd> hias · <kbd>C</kbd> semangat
            </p>
          </div>
        </div>
      )}

      {phase === 'paused' && (
        <div className="g-overlay">
          <div className="g-card g-pause" role="document">
            <span className="g-pause__eyebrow">Jeda</span>
            <h2>Kebun dijeda</h2>
            <p className="g-pause__lead">
              Poti menunggu di tengah kebun. Tantangan sesi: {questProgress}/6
              {questDone ? ' selesai! 🎉' : ' — siram 3 tanaman & kumpulkan 3 embun.'}
            </p>
            <div className="g-pause__stats">
              <div><Droplets size={16} /><strong>{stats.water}</strong><small>disiram</small></div>
              <div><Sprout size={16} /><strong>{stats.feed}</strong><small>dipupuk</small></div>
              <div><Sparkles size={16} /><strong>{stats.deco}</strong><small>dihias</small></div>
              <div><Coins size={16} /><strong>{stats.dew}</strong><small>embun</small></div>
            </div>
            <div className="g-pause__actions">
              <button type="button" className="g-cta" onClick={() => setPhase('playing')} autoFocus>
                <Play size={18} /> Lanjutkan
              </button>
              {supportsFs && (
                <button type="button" className="g-cta g-cta--ghost" onClick={toggleFullscreen}>
                  {isFs ? <Minimize2 size={18} /> : <Expand size={18} />}
                  {isFs ? 'Keluar layar penuh' : 'Layar penuh'}
                </button>
              )}
              <button type="button" className="g-cta g-cta--ghost" onClick={close}>
                <LogOut size={18} /> Keluar ke kebun
              </button>
            </div>
            <p className="g-intro__keys">
              <kbd>Esc</kbd> untuk lanjut atau jeda saat tidak di layar penuh
            </p>
          </div>
        </div>
      )}

      {portrait && (
        <div className="g-overlay g-overlay--rotate">
          <div className="g-card g-rotate">
            <div className="g-rotate__phone" aria-hidden="true">
              <Smartphone size={64} />
              <span className="g-rotate__arrow"><RotateCw size={26} /></span>
            </div>
            <h2>Putar HP ke landscape</h2>
            <p>
              Game POTIVA dibuat untuk layar mendatar supaya joystick di kiri dan tombol aksi
              di kanan punya ruang cukup.
            </p>
            <span className="g-rotate__hint">
              <RotateCw size={14} /> Aktifkan rotasi otomatis jika layar tidak ikut berputar.
            </span>
            <button type="button" className="g-cta g-cta--ghost" onClick={close} autoFocus>
              <X size={18} /> Kembali ke kebun
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
