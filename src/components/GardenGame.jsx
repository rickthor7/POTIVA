import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Apple,
  ArrowLeft,
  Bath,
  Check,
  Coins,
  Droplets,
  Expand,
  Gamepad2,
  Heart,
  Leaf,
  LogOut,
  MapPin,
  Maximize2,
  Minimize2,
  Moon,
  Move,
  Pause,
  Play,
  RotateCw,
  Shirt,
  Smartphone,
  Sparkles,
  Sprout,
  Trophy,
  Utensils,
  X,
  Zap,
} from 'lucide-react'
import { Mascot, PottedPlant, ProductArt } from './illustrations'
import { useApp } from '../store/AppStore'
import { COSMETICS, levelFromXp } from '../data/appData'
import { clamp } from '../lib/utils'

const WORLD = { w: 2600, h: 1680 }
const START = { x: 1300, y: 1260 }
const SPEED = 350
const REACH = 180
const QUEST = { care: 3, water: 3, dew: 3 }

// Every plant gets its own patch of the world so each biome feels alive.
const PLANT_SLOTS = [
  { x: 1120, y: 1210 },
  { x: 1390, y: 1170 },
  { x: 1640, y: 1250 },
  { x: 940, y: 1390 },
  { x: 1760, y: 1420 },
  { x: 1240, y: 1430 },
  { x: 1500, y: 1450 },
  { x: 2070, y: 900 },
  { x: 620, y: 1150 },
  { x: 1500, y: 580 },
  { x: 880, y: 500 },
  { x: 2310, y: 840 },
]

const DEW_SEED = [
  { x: 1000, y: 760 },
  { x: 1440, y: 540 },
  { x: 2160, y: 900 },
  { x: 700, y: 1320 },
  { x: 1880, y: 1500 },
  { x: 520, y: 380 },
  { x: 2320, y: 1580 },
  { x: 1100, y: 980 },
]

// Distinct neighbourhoods of the garden. x/y/w/h are world coordinates.
const ZONES = [
  { id: 'hutan', name: 'Hutan Lumut', hint: 'Jamur & embun', x: 0, y: 0, w: 920, h: 760 },
  { id: 'padang', name: 'Padang Bunga', hint: 'Sarang lebah', x: 860, y: 0, w: 1000, h: 680 },
  { id: 'kaca', name: 'Rumah Kaca', hint: 'Benih & bunga', x: 1840, y: 0, w: 760, h: 820 },
  { id: 'rumah', name: 'Halaman Rumah', hint: 'Tempat Poti istirahat', x: 0, y: 700, w: 900, h: 620 },
  { id: 'ladang', name: 'Ladang Utama', hint: 'Tanaman Poti', x: 820, y: 660, w: 1080, h: 850 },
  { id: 'kolam', name: 'Kolam Senja', hint: 'Air & bebek', x: 1820, y: 800, w: 780, h: 880 },
  { id: 'kompos', name: 'Kebun Kompos', hint: 'Nutrisi tanaman', x: 0, y: 1290, w: 900, h: 390 },
]

// Winding footpaths connect every neighbourhood.
const PATHS = [
  'M 520 970 C 720 1000 860 1130 1140 1210 S 1660 1190 1870 1010 S 2110 830 2190 790',
  'M 1140 1210 C 1180 990 1180 720 1300 520 S 1510 330 1540 220',
  'M 520 970 C 450 790 510 590 640 420 S 780 230 830 150',
  'M 1870 1010 C 1990 1130 2110 1280 2190 1450',
  'M 1140 1210 C 990 1370 760 1450 520 1500',
  'M 640 420 C 820 360 1060 300 1290 330 S 1640 430 1830 530',
]

// Tap a landmark and Poti walks there to interact.
const INTERACTIVE_SPOTS = [
  {
    id: 'sumur',
    name: 'Sumur Embun',
    type: 'well',
    x: 980,
    y: 720,
    coins: 4,
    xp: 2,
    cooldown: 24000,
    message: 'Air sumurnya segar! +4 koin · +2 XP',
  },
  {
    id: 'sarang',
    name: 'Sarang Lebah',
    type: 'hive',
    x: 1650,
    y: 430,
    coins: 6,
    xp: 3,
    cooldown: 30000,
    message: 'Madu manis! +6 koin · +3 XP',
  },
  {
    id: 'kompos',
    name: 'Tempat Kompos',
    type: 'compost',
    x: 640,
    y: 1450,
    coins: 3,
    xp: 5,
    cooldown: 26000,
    message: 'Komposnya subur! +3 koin · +5 XP',
  },
  {
    id: 'papan',
    name: 'Papan Petunjuk',
    type: 'sign',
    x: 1260,
    y: 990,
    coins: 2,
    xp: 1,
    cooldown: 20000,
    message: 'Tips: dekati tanaman, lalu tekan E untuk menyiram 💧',
  },
  {
    id: 'air',
    name: 'Mata Air',
    type: 'fountain',
    x: 2160,
    y: 1010,
    coins: 5,
    xp: 2,
    cooldown: 28000,
    message: 'Bebek-bek senang! +5 koin · +2 XP',
  },
]

// Blocks that Poti cannot walk through (x/y is the top-left of the footprint).
const OBSTACLES = [
  { x: 180, y: 560, w: 620, h: 440 }, // cottage
  { x: 1980, y: 300, w: 440, h: 390 }, // greenhouse
  { x: 1980, y: 1160, w: 560, h: 300 }, // pond
  { x: 120, y: 1310, w: 380, h: 280 }, // tool shed
]

const NEED_DECAY = { hunger: 0.9, fun: 1.05, energy: 0.7, clean: 0.6 }
const CARE_GAIN = {
  feed: { hunger: 34, fun: 4, energy: 2, clean: -4 },
  play: { fun: 34, energy: -10, hunger: -5, clean: -3 },
  bath: { clean: 42, fun: 6, energy: -2 },
  sleep: { energy: 46, fun: 2, hunger: -4 },
}

const MOOD_LINES = {
  happy: [
    'Hari yang cerah!',
    'Daunku segar sekali 🌿',
    'Aku suka kebun ini!',
    'Mau main bola?',
    'Terima kasih sudah merawatku!',
  ],
  hungry: ['Aku lapar…', 'Ada camilan? 🍎', 'Perutku berbunyi…'],
  sleepy: ['Aku ngantuk…', 'Zzz…', 'Boleh aku tidur?'],
  dirty: ['Daunku berdebu…', 'Waktunya mandi? 🫧', 'Aku ingin bersih lagi…'],
  sad: ['Aku bosan…', 'Temani aku main?', 'Kapan kita main lagi?'],
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

const moodFromNeeds = (needs) => {
  if (needs.energy < 24) return 'sleepy'
  if (needs.hunger < 24) return 'hungry'
  if (needs.clean < 24) return 'dirty'
  if (needs.fun < 24) return 'sad'
  return 'happy'
}

const expressionFor = (kind) => {
  if (kind === 'feed' || kind === 'pet') return 'love'
  if (kind === 'sleep') return 'sleepy'
  return 'happy'
}

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
  y: y ?? 300 + Math.random() * (WORLD.h - 440),
})

const zoneAt = (x, y) =>
  [...ZONES].reverse().find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) ||
  ZONES[4]

const buildDecor = () => {
  const rnd = mulberry32(20261126)
  const palette = ['#f6b7a3', '#fff3d0', '#c7e59c', '#e9b6d3', '#f7d98a', '#bfe0f5']
  const spread = (count, insetX, insetY) =>
    Array.from({ length: count }, () => ({
      x: insetX + rnd() * (WORLD.w - insetX * 2),
      y: insetY + rnd() * (WORLD.h - insetY * 2),
    }))

  const tufts = spread(320, 40, 100).map((p) => ({ ...p, s: 0.65 + rnd() * 0.8, d: rnd() * 4 }))
  const flowers = spread(90, 70, 150).map((p) => ({
    ...p,
    c: palette[Math.floor(rnd() * palette.length)],
    s: 0.65 + rnd() * 0.65,
  }))
  const stones = spread(46, 90, 170).map((p) => ({ ...p, s: 0.55 + rnd() * 0.95 }))

  // Dense flower carpets mark the meadow and the greenhouse garden.
  const flowerBeds = [
    { x: 1300, y: 480, n: 26 },
    { x: 1740, y: 520, n: 22 },
    { x: 2220, y: 730, n: 18 },
    { x: 1160, y: 1340, n: 20 },
    { x: 1560, y: 1320, n: 18 },
    { x: 740, y: 1180, n: 16 },
    { x: 1980, y: 1560, n: 14 },
  ]
  for (const bed of flowerBeds) {
    for (let i = 0; i < bed.n; i += 1) {
      const angle = rnd() * Math.PI * 2
      const radius = 18 + rnd() * 96
      flowers.push({
        x: bed.x + Math.cos(angle) * radius,
        y: bed.y + Math.sin(angle) * radius * 0.65,
        c: palette[Math.floor(rnd() * palette.length)],
        s: 0.55 + rnd() * 0.55,
      })
    }
  }

  // Forest canopy hugs the left/top edge; a few trees frame the other zones.
  const trees = [
    [70, 520, 1.12], [90, 760, 1], [110, 1010, 1.18], [80, 1220, 1.05],
    [210, 300, 0.95], [330, 180, 1.08], [470, 120, 1], [620, 220, 0.9],
    [760, 130, 1.12], [900, 240, 0.92], [1030, 350, 0.82], [1180, 160, 0.96],
    [1420, 130, 0.88], [1680, 180, 0.94], [1840, 280, 0.86], [2520, 260, 1.14],
    [2540, 620, 1], [2510, 980, 1.08], [2540, 1320, 1.12], [2500, 1600, 1.16],
    [2220, 1620, 1], [1840, 1640, 1.08], [1500, 1620, 0.95], [1120, 1640, 1.02],
    [760, 1640, 1.1], [420, 1600, 0.95], [1080, 420, 0.72], [1810, 780, 0.78],
  ].map(([x, y, s]) => ({ x, y, s }))

  const bushes = [
    [250, 860, 1.05], [190, 1150, 1.1], [360, 1240, 0.9], [620, 950, 0.85],
    [880, 700, 0.95], [1040, 540, 0.82], [1260, 640, 0.78], [1520, 700, 0.9],
    [1780, 660, 0.92], [1940, 860, 0.84], [2260, 820, 0.88], [2420, 1020, 0.95],
    [2300, 1520, 1.05], [1980, 1540, 0.9], [1660, 1520, 0.86], [1320, 1540, 0.94],
    [980, 1520, 0.88], [740, 1540, 1], [520, 1240, 0.8], [1380, 1080, 0.72],
    [1560, 1160, 0.76], [960, 1360, 0.74], [2070, 1000, 0.78], [590, 460, 0.9],
  ].map(([x, y, s]) => ({ x, y, s }))

  const mushrooms = [
    [330, 560, 1], [520, 420, 0.82], [280, 720, 0.9], [700, 340, 0.76],
    [820, 620, 0.86], [420, 980, 0.8], [640, 1340, 0.92], [360, 1480, 0.84],
    [880, 1460, 0.78], [1080, 600, 0.72], [1420, 360, 0.8], [1720, 620, 0.74],
    [1960, 1560, 0.9], [2280, 1480, 0.82], [2420, 1280, 0.88], [1860, 940, 0.76],
    [740, 1080, 0.8], [1280, 760, 0.7], [1600, 1380, 0.82], [540, 260, 0.86],
  ].map(([x, y, s]) => ({ x, y, s }))

  const reeds = [
    [2010, 1240], [2100, 1290], [2190, 1250], [2290, 1290], [2380, 1230],
    [2020, 1480], [2140, 1510], [2260, 1490], [2380, 1470], [2480, 1380],
    [1960, 1380], [2320, 1580],
  ].map(([x, y], i) => ({ x, y, s: 0.8 + (i % 4) * 0.12 }))

  const crates = [
    [300, 1180, 0.9], [390, 1210, 0.7], [2150, 700, 0.85], [2230, 730, 0.7],
    [1730, 1220, 0.8], [980, 1120, 0.72],
  ].map(([x, y, s]) => ({ x, y, s }))

  const lanterns = [
    [720, 900], [1160, 1060], [1560, 1060], [1900, 920], [2180, 820],
    [1080, 700], [1420, 480], [620, 1280],
  ].map(([x, y]) => ({ x, y }))

  const flies = [
    [980, 900, 0, '#f6b7a3'], [1260, 1160, 3.5, '#ffe6a6'], [820, 1280, 6.2, '#c7e59c'],
    [1580, 1080, 2.2, '#ffe6a6'], [640, 1120, 4.4, '#bfe0f5'], [2120, 1180, 7.1, '#f6b7a3'],
    [1440, 500, 5.2, '#fff3d0'], [480, 480, 8.4, '#c7e59c'], [2280, 760, 1.6, '#ffe6a6'],
  ].map(([x, y, d, c]) => ({ x, y, d, c }))

  return { tufts, flowers, stones, trees, flies, bushes, mushrooms, reeds, crates, lanterns }
}

const cooldownLeft = (timestamp, ms, now) =>
  timestamp ? Math.max(0, Math.ceil((ms - (now - timestamp)) / 1000)) : 0

const insideObstacle = (x, y) =>
  OBSTACLES.some((o) => x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h)

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

function ActionButton({ tone, icon: Icon, label, onClick, disabled, badge }) {
  return (
    <button
      type="button"
      className={`g-act g-act--${tone}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={badge ? `${label}, ${badge}` : label}
    >
      <span className="g-act__ico">
        <Icon size={22} />
      </span>
      <strong>{label}</strong>
      {badge && <span className="g-act__badge">{badge}</span>}
    </button>
  )
}

function NeedMeter({ icon: Icon, label, value, tone }) {
  const pct = Math.round(value)
  return (
    <div className="g-need" title={`${label}: ${pct}%`} aria-label={`${label} ${pct} persen`}>
      <span className="g-need__icon" style={{ color: tone }}>
        <Icon size={12} />
      </span>
      <span className="g-need__track">
        <i style={{ width: `${value}%`, background: tone }} />
      </span>
      <b>{pct}</b>
    </div>
  )
}

function MiniAvatar() {
  return (
    <span className="g-avatar" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M24 13V7" stroke="#3F8F55" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 10c0-4 3-7 8-7 0 4-3 7-8 7Z" fill="#A8D66D" />
        <circle cx="24" cy="28" r="16" fill="#FBF5E6" />
        <circle cx="18" cy="26" r="2.5" fill="#20312A" />
        <circle cx="30" cy="26" r="2.5" fill="#20312A" />
        <circle cx="18.8" cy="25.2" r="0.9" fill="#fff" />
        <circle cx="30.8" cy="25.2" r="0.9" fill="#fff" />
        <path d="M19 33q5 4 10 0" stroke="#20312A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="13" cy="31" rx="3" ry="1.8" fill="#F0A58E" opacity="0.6" />
        <ellipse cx="35" cy="31" rx="3" ry="1.8" fill="#F0A58E" opacity="0.6" />
      </svg>
    </span>
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
  return (
    <span className="g-fx g-fx--cheer" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <i key={i} style={{ '--i': i }}>✦</i>
      ))}
    </span>
  )
}

function PetFx({ kind }) {
  if (kind === 'feed') {
    return (
      <span className="g-petfx g-petfx--feed" aria-hidden="true">
        <svg viewBox="0 0 40 44">
          <path d="M20 40c-8 0-14-6-14-15S13 8 20 8s14 8 14 17-6 15-14 15Z" fill="#E4635A" />
          <path d="M20 12c-5 0-9 4-10 9 4-3 9-4 14-2-1-4-2-7-4-7Z" fill="#F08A7E" />
          <path d="M20 8c1-4 4-6 7-6-1 4-4 6-7 6Z" fill="#3F8F55" />
          <path d="M20 8V3" stroke="#3F8F55" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
    )
  }
  if (kind === 'play') {
    return (
      <span className="g-petfx g-petfx--ball" aria-hidden="true">
        <i />
      </span>
    )
  }
  if (kind === 'bath') {
    return (
      <span className="g-petfx g-petfx--bubbles" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </span>
    )
  }
  if (kind === 'sleep') {
    return (
      <span className="g-petfx g-petfx--sleep" aria-hidden="true">
        <i>z</i>
        <i>z</i>
        <i>Z</i>
      </span>
    )
  }
  return (
    <span className="g-petfx g-petfx--hearts" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <i key={i} style={{ '--i': i }}>
          <Heart size={16} fill="currentColor" />
        </i>
      ))}
    </span>
  )
}

function CottageArt() {
  return (
    <svg className="g-cottage" viewBox="0 0 620 440" aria-hidden="true">
      <defs>
        <linearGradient id="cottageWall" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFF7E6" />
          <stop offset="1" stopColor="#F1E1C3" />
        </linearGradient>
        <linearGradient id="cottageRoof" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#4B9A60" />
          <stop offset="1" stopColor="#256B41" />
        </linearGradient>
        <linearGradient id="cottageGlow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFEDB6" />
          <stop offset="1" stopColor="#F7C96B" />
        </linearGradient>
      </defs>
      <ellipse cx="310" cy="420" rx="282" ry="20" fill="#174D35" opacity="0.18" />
      <rect x="452" y="66" width="46" height="120" rx="9" fill="#C97A50" />
      <rect x="444" y="58" width="62" height="18" rx="7" fill="#A85E38" />
      <g className="g-smoke" fill="#FFF8E8">
        <circle cx="475" cy="44" r="9" opacity="0.55" />
        <circle cx="486" cy="26" r="12" opacity="0.38" />
        <circle cx="472" cy="8" r="15" opacity="0.22" />
      </g>
      <rect x="62" y="176" width="496" height="240" rx="20" fill="url(#cottageWall)" />
      <rect x="62" y="176" width="496" height="14" rx="7" fill="#E7D5B4" />
      <path d="M28 190 310 34l282 156-20 30-262-142L48 220Z" fill="url(#cottageRoof)" />
      <path d="M48 220 310 78l262 142" stroke="#174D35" strokeWidth="6" opacity="0.22" fill="none" />

      <g>
        <rect x="112" y="244" width="108" height="94" rx="14" fill="#6E4A34" />
        <rect x="120" y="252" width="92" height="78" rx="10" fill="url(#cottageGlow)" />
        <path d="M166 252v78M120 291h92" stroke="#FFF8E8" strokeWidth="6" opacity="0.85" />
        <rect x="104" y="334" width="124" height="18" rx="8" fill="#A85E38" />
        <g fill="#A8D66D">
          <circle cx="128" cy="332" r="8" />
          <circle cx="150" cy="328" r="9" />
          <circle cx="172" cy="332" r="8" />
          <circle cx="194" cy="328" r="9" />
        </g>
      </g>

      <g>
        <rect x="400" y="244" width="108" height="94" rx="14" fill="#6E4A34" />
        <rect x="408" y="252" width="92" height="78" rx="10" fill="url(#cottageGlow)" />
        <path d="M454 252v78M408 291h92" stroke="#FFF8E8" strokeWidth="6" opacity="0.85" />
        <rect x="392" y="334" width="124" height="18" rx="8" fill="#A85E38" />
        <g fill="#F6B7A3">
          <circle cx="416" cy="332" r="8" />
          <circle cx="438" cy="328" r="9" />
          <circle cx="460" cy="332" r="8" />
          <circle cx="482" cy="328" r="9" />
        </g>
      </g>

      <path d="M258 416V316c0-28 23-50 52-50s52 22 52 50v100Z" fill="#8A5A3A" />
      <path d="M268 416V318c0-22 19-42 42-42s42 20 42 42v98Z" fill="#A16B45" />
      <circle cx="336" cy="368" r="5" fill="#F2C572" />
      <rect x="248" y="408" width="124" height="12" rx="6" fill="#B7A184" />

      <g transform="translate(214 196)">
        <rect width="192" height="46" rx="14" fill="#174D35" />
        <path d="M34 32V18" stroke="#A8D66D" strokeWidth="3" strokeLinecap="round" />
        <path d="M34 23c0-6 4-10 11-10 0 6-4 10-11 10Z" fill="#A8D66D" />
        <text x="56" y="30" fontFamily="Poppins, sans-serif" fontSize="19" fontWeight="700" fill="#EAF5E9">
          Kebun Poti
        </text>
      </g>

      <path d="M92 190c-8 26 6 44 24 52M528 190c8 26-6 44-24 52" stroke="#3F8F55" strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />
      <g fill="#7CBB58" opacity="0.8">
        <ellipse cx="104" cy="218" rx="10" ry="6" transform="rotate(-28 104 218)" />
        <ellipse cx="518" cy="222" rx="10" ry="6" transform="rotate(28 518 222)" />
      </g>
    </svg>
  )
}

function GreenhouseArt() {
  return (
    <svg className="g-greenhouse" viewBox="0 0 440 390" aria-hidden="true">
      <ellipse cx="220" cy="372" rx="196" ry="16" fill="#174D35" opacity="0.16" />
      <rect x="52" y="140" width="336" height="224" rx="18" fill="#DFF3E8" opacity="0.75" />
      <path d="M52 150 220 42l168 108" fill="#CDEBDD" opacity="0.6" />
      <path d="M52 150 220 42l168 108" stroke="#3F8F55" strokeWidth="8" fill="none" strokeLinejoin="round" />
      <path d="M52 140v224M388 140v224M220 42v322M52 230h336" stroke="#3F8F55" strokeWidth="6" opacity="0.8" />
      <rect x="52" y="352" width="336" height="18" rx="9" fill="#8FBF77" />
      <g fill="#4F9A5D">
        <ellipse cx="112" cy="318" rx="34" ry="26" />
        <ellipse cx="150" cy="326" rx="24" ry="18" />
        <ellipse cx="316" cy="316" rx="30" ry="24" />
        <ellipse cx="278" cy="326" rx="22" ry="16" />
      </g>
      <g fill="#A8D66D">
        <ellipse cx="120" cy="300" rx="16" ry="12" />
        <ellipse cx="308" cy="300" rx="14" ry="11" />
      </g>
      <rect x="184" y="238" width="72" height="118" rx="12" fill="#B7E0C9" stroke="#3F8F55" strokeWidth="5" />
      <circle cx="242" cy="300" r="4" fill="#3F8F55" />
      <path d="M80 160 170 300" stroke="#fff" strokeWidth="10" opacity="0.25" strokeLinecap="round" />
    </svg>
  )
}

function ShedArt() {
  return (
    <svg className="g-shed" viewBox="0 0 380 280" aria-hidden="true">
      <ellipse cx="190" cy="264" rx="172" ry="13" fill="#174D35" opacity="0.16" />
      <path d="M24 96 190 18l166 78-16 24-150-64-150 64Z" fill="#2F7443" />
      <rect x="34" y="98" width="312" height="160" rx="12" fill="#E6C99B" />
      <path d="M34 98h312v14H34Z" fill="#C9A87C" />
      <path d="M44 110h292M44 150h292M44 190h292" stroke="#B9946B" strokeWidth="3" opacity="0.55" />
      <rect x="140" y="146" width="100" height="112" rx="8" fill="#9E6B47" />
      <path d="M150 158h80v88h-80Z" fill="#B4835A" />
      <path d="M190 158v88" stroke="#7A5337" strokeWidth="4" />
      <circle cx="182" cy="206" r="4" fill="#F2C572" />
      <circle cx="198" cy="206" r="4" fill="#F2C572" />
      <g transform="translate(250 178)">
        <rect width="54" height="62" rx="6" fill="#B86B41" />
        <path d="M4 12h46M4 30h46M4 48h46" stroke="#8B5E3C" strokeWidth="4" />
      </g>
      <g transform="translate(70 188)">
        <circle cx="18" cy="18" r="18" fill="#8FC96E" />
        <circle cx="42" cy="18" r="18" fill="#6BAF5B" />
        <circle cx="30" cy="4" r="16" fill="#A8D66D" />
      </g>
      <rect x="20" y="250" width="340" height="10" rx="5" fill="#A88459" />
    </svg>
  )
}

function SpotArt({ type }) {
  if (type === 'well') {
    return (
      <svg viewBox="0 0 140 130" aria-hidden="true">
        <ellipse cx="70" cy="118" rx="56" ry="9" fill="#174D35" opacity="0.15" />
        <path d="M34 44h72l-8 64H42Z" fill="#B9B2A3" />
        <path d="M34 44h72l-2 16H36Z" fill="#D4CEC0" />
        <ellipse cx="70" cy="46" rx="36" ry="12" fill="#5B8FA0" />
        <ellipse cx="70" cy="46" rx="27" ry="8" fill="#A8DCE8" />
        <path d="M26 46V18h88v28" stroke="#9E6B47" strokeWidth="9" fill="none" strokeLinejoin="round" />
        <path d="M20 20 70 2l50 18" stroke="#5F8F55" strokeWidth="11" fill="none" strokeLinejoin="round" />
        <path d="M70 8v34" stroke="#9E6B47" strokeWidth="4" />
        <rect x="54" y="40" width="32" height="24" rx="5" fill="#C9794D" />
        <path d="M62 40v24M78 40v24" stroke="#8B5E3C" strokeWidth="3" />
      </svg>
    )
  }
  if (type === 'hive') {
    return (
      <svg viewBox="0 0 130 120" aria-hidden="true">
        <ellipse cx="65" cy="108" rx="50" ry="8" fill="#174D35" opacity="0.15" />
        <path d="M34 96c0-38 10-66 31-66s31 28 31 66Z" fill="#E5B96B" />
        <path d="M38 80h54M40 64h50M44 48h42M50 34h30" stroke="#B9863E" strokeWidth="5" />
        <ellipse cx="65" cy="96" rx="24" ry="7" fill="#6E4A34" />
        <circle cx="65" cy="96" r="4" fill="#2F231A" />
        <g fill="#F2C572">
          <circle cx="24" cy="76" r="4" /><circle cx="30" cy="54" r="3.5" />
          <circle cx="104" cy="70" r="4" /><circle cx="98" cy="48" r="3.5" />
        </g>
        <g stroke="#2F3E36" strokeWidth="2.2" fill="none">
          <path d="M18 74q-8-6-12 2M18 74q-8 4-12-2" />
          <path d="M110 68q8-6 12 2M110 68q8 4 12-2" />
        </g>
      </svg>
    )
  }
  if (type === 'compost') {
    return (
      <svg viewBox="0 0 140 120" aria-hidden="true">
        <ellipse cx="70" cy="108" rx="56" ry="9" fill="#174D35" opacity="0.15" />
        <path d="M24 46h92l-8 56H32Z" fill="#8B5E3C" />
        <path d="M24 46h92l-2 14H26Z" fill="#A87550" />
        <ellipse cx="70" cy="48" rx="46" ry="12" fill="#4E3826" />
        <ellipse cx="70" cy="48" rx="37" ry="8" fill="#6B4A30" />
        <g fill="#7CBB58">
          <ellipse cx="52" cy="44" rx="10" ry="5" transform="rotate(-18 52 44)" />
          <ellipse cx="88" cy="50" rx="9" ry="5" transform="rotate(14 88 50)" />
        </g>
        <path d="M44 68l-8 20M96 68l8 20" stroke="#C9A87C" strokeWidth="4" opacity="0.7" />
        <path d="M58 30V14M80 30V10" stroke="#3F8F55" strokeWidth="3" strokeLinecap="round" />
        <path d="M58 20c0-6 4-10 10-10 0 6-4 10-10 10Z" fill="#A8D66D" />
        <path d="M80 16c0-6-4-10-10-10 0 6 4 10 10 10Z" fill="#3F8F55" />
      </svg>
    )
  }
  if (type === 'sign') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <ellipse cx="60" cy="110" rx="40" ry="7" fill="#174D35" opacity="0.14" />
        <rect x="54" y="40" width="12" height="66" rx="5" fill="#8B5E3C" />
        <path d="M16 20h88l-8 46H24Z" fill="#C9794D" stroke="#8B5E3C" strokeWidth="4" />
        <path d="M38 34h44M38 46h34M38 58h40" stroke="#FFF3D0" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <path d="M60 20c0-10 6-16 16-16 0 10-6 16-16 16Z" fill="#A8D66D" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 150 120" aria-hidden="true">
      <ellipse cx="75" cy="108" rx="62" ry="9" fill="#174D35" opacity="0.14" />
      <path d="M14 92h122l-12 14H26Z" fill="#A9A297" />
      <ellipse cx="75" cy="90" rx="61" ry="16" fill="#D9EEF1" />
      <ellipse cx="75" cy="90" rx="48" ry="11" fill="#9FD3DE" />
      <path d="M75 90V32" stroke="#9E6B47" strokeWidth="11" strokeLinecap="round" />
      <path d="M75 30c0-14 9-24 22-24 0 14-9 24-22 24Z" fill="#A8D66D" />
      <path d="M75 42c0-10-7-17-17-17 0 10 7 17 17 17Z" fill="#3F8F55" />
      <path d="M62 62q13 8 26 0" stroke="#FFF" strokeWidth="5" fill="none" opacity="0.7" strokeLinecap="round" />
      <g fill="#FFF8E8" opacity="0.85">
        <circle cx="52" cy="60" r="3" /><circle cx="98" cy="54" r="3.5" /><circle cx="110" cy="68" r="2.6" />
      </g>
    </svg>
  )
}

const COSMETIC_SLOTS = [
  { id: 'hat', label: 'Kepala' },
  { id: 'face', label: 'Mata' },
  { id: 'neck', label: 'Leher' },
  { id: 'body', label: 'Pakaian' },
  { id: 'back', label: 'Punggung' },
]

export default function GardenGame({ plants, onClose }) {
  const { wallet, actions, ownedCosmetics, potiLook } = useApp()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('intro')
  const [portrait, setPortrait] = useState(
    () => typeof window !== 'undefined' && window.innerHeight > window.innerWidth,
  )
  const [isFs, setIsFs] = useState(false)
  const [viewport, setViewport] = useState({ w: 1280, h: 720 })
  const [activeId, setActiveId] = useState(null)
  const [fx, setFx] = useState(null)
  const [petFx, setPetFx] = useState(null)
  const [reaction, setReaction] = useState(null)
  const [bubble, setBubble] = useState(null)
  const [marker, setMarker] = useState(null)
  const [sleeping, setSleeping] = useState(false)
  const [blink, setBlink] = useState(false)
  const [needs, setNeeds] = useState({ hunger: 82, fun: 68, energy: 86, clean: 90 })
  const [now, setNow] = useState(Date.now())
  const [dew, setDew] = useState(() => DEW_SEED.map((d) => makeDew(d.x, d.y)))
  const [stats, setStats] = useState({ care: 0, water: 0, dew: 0, pet: 0 })
  const [wardrobeOpen, setWardrobeOpen] = useState(false)
  const [zone, setZone] = useState(() => zoneAt(START.x, START.y))
  const [spotCooldowns, setSpotCooldowns] = useState({})

  const rootRef = useRef(null)
  const worldRef = useRef(null)
  const playerEl = useRef(null)
  const introBtnRef = useRef(null)
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
  const needsRef = useRef(needs)
  const sleepingRef = useRef(sleeping)
  const wardrobeRef = useRef(false)
  const pendingSpot = useRef(null)
  const spotCooldownsRef = useRef(spotCooldowns)
  const spotFnRef = useRef(() => {})
  const zoneRef = useRef(zoneAt(START.x, START.y))
  const actRef = useRef(() => {})
  const careRef = useRef(() => {})
  const collectRef = useRef(() => {})
  const fxTimer = useRef(null)
  const petFxTimer = useRef(null)
  const reactionTimer = useRef(null)
  const bubbleTimer = useRef(null)
  const sleepTimer = useRef(null)
  const markerTimer = useRef(null)
  const blinkTimer = useRef(null)
  const questAwarded = useRef(false)

  phaseRef.current = phase
  viewportRef.current = viewport
  dewRef.current = dew
  needsRef.current = needs
  sleepingRef.current = sleeping
  wardrobeRef.current = wardrobeOpen
  spotCooldownsRef.current = spotCooldowns

  const supportsFs = useMemo(
    () =>
      typeof document !== 'undefined' &&
      (document.fullscreenEnabled ||
        typeof document.documentElement.requestFullscreen === 'function'),
    [],
  )

  const scale = clamp(viewport.h / 780, 0.62, 1.18)
  const plantArt = Math.round(168 * scale)
  const playerArt = Math.round(150 * scale)
  const level = levelFromXp(wallet.xp)

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

  const mood = moodFromNeeds(needs)
  const expression = reaction ? expressionFor(reaction.kind) : sleeping ? 'sleepy' : mood
  const questProgress =
    Math.min(stats.care, QUEST.care) +
    Math.min(stats.water, QUEST.water) +
    Math.min(stats.dew, QUEST.dew)
  const questDone =
    stats.care >= QUEST.care && stats.water >= QUEST.water && stats.dew >= QUEST.dew

  const flash = useCallback((text, tone = 'info') => {
    setBubble({ text, tone, id: Date.now() })
    window.clearTimeout(bubbleTimer.current)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 3000)
  }, [])

  const say = useCallback((text, ms = 2800) => {
    setBubble({ text, id: Date.now() })
    window.clearTimeout(bubbleTimer.current)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), ms)
  }, [])

  const spotLeft = useCallback(
    (spot) => cooldownLeft(spotCooldowns[spot.id], spot.cooldown, now),
    [spotCooldowns, now],
  )

  const openWardrobe = useCallback(() => {
    if (phaseRef.current !== 'playing' || sleepingRef.current) return
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setWardrobeOpen(true)
  }, [])

  const closeWardrobe = useCallback(() => setWardrobeOpen(false), [])

  const burst = useCallback((plantId, kind) => {
    setFx({ plantId, kind, key: Date.now() })
    window.clearTimeout(fxTimer.current)
    fxTimer.current = window.setTimeout(() => setFx(null), 1400)
  }, [])

  const showPetFx = useCallback((kind, ms = 1600) => {
    setPetFx({ kind, key: Date.now() })
    window.clearTimeout(petFxTimer.current)
    petFxTimer.current = window.setTimeout(() => setPetFx(null), ms)
  }, [])

  const react = useCallback((kind) => {
    setReaction({ kind, key: Date.now() })
    window.clearTimeout(reactionTimer.current)
    reactionTimer.current = window.setTimeout(() => setReaction(null), 1700)
  }, [])

  // Tap/touch navigation: Poti walks to the tapped spot or plant.
  const interactSpot = useCallback(
    (spot) => {
      if (phaseRef.current !== 'playing') return
      const left = cooldownLeft(spotCooldownsRef.current[spot.id], spot.cooldown, Date.now())
      if (left > 0) {
        say(`${spot.name} lagi istirahat ${left} detik.`, 2200)
        return
      }
      setSpotCooldowns((c) => ({ ...c, [spot.id]: Date.now() }))
      actions.collectBonus(spot.coins, spot.xp)
      setNeeds((n) => ({ ...n, fun: clamp(n.fun + 5, 0, 100) }))
      react('happy')
      flash(spot.message, 'cheer')
    },
    [actions, flash, react, say],
  )
  spotFnRef.current = interactSpot

  const goTo = useCallback(
    (x, y, text) => {
      if (phaseRef.current !== 'playing' || portrait || sleepingRef.current || wardrobeRef.current)
        return
      pendingSpot.current = null
      const tx = clamp(x, 80, WORLD.w - 80)
      const ty = clamp(y, 150, WORLD.h - 60)
      waypoint.current = insideObstacle(tx, ty) ? null : { x: tx, y: ty }
      if (!waypoint.current) return
      setMarker({ ...waypoint.current, id: Date.now() })
      window.clearTimeout(markerTimer.current)
      markerTimer.current = window.setTimeout(() => setMarker(null), 1300)
      if (text) say(text, 1800)
    },
    [portrait, say],
  )

  const goToSpot = useCallback(
    (spot) => {
      if (phaseRef.current !== 'playing' || portrait) return
      const p = player.current
      if (Math.hypot(spot.x - p.x, spot.y - p.y) < REACH + 30) {
        pendingSpot.current = null
        interactSpot(spot)
        return
      }
      goTo(spot.x, spot.y + 26, `Menuju ${spot.name}`)
      pendingSpot.current = spot
    },
    [goTo, interactSpot, portrait],
  )

  const onStick = useCallback((v) => {
    if (Math.hypot(v.x, v.y) > 0.14) {
      waypoint.current = null
      pendingSpot.current = null
    }
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
      window.clearTimeout(petFxTimer.current)
      window.clearTimeout(reactionTimer.current)
      window.clearTimeout(bubbleTimer.current)
      window.clearTimeout(sleepTimer.current)
      window.clearTimeout(markerTimer.current)
      window.clearTimeout(blinkTimer.current)
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
    setWardrobeOpen(false)
    pendingSpot.current = null
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setSleeping(false)
    setBubble(null)
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
    say('Halo! Aku Poti 🌱 Rawat aku ya!', 3400)
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

  const wake = useCallback(() => {
    window.clearTimeout(sleepTimer.current)
    setSleeping(false)
    setPetFx(null)
    react('happy')
    say('Aku bangun! 🌞', 2200)
  }, [react, say])

  // Session challenge: care for Poti, water plants and collect dew.
  useEffect(() => {
    if (phase !== 'playing' || questAwarded.current || !questDone) return
    questAwarded.current = true
    actions.collectBonus(40, 30)
    cheerWorld()
    flash('Tantangan kebun selesai! +40 koin · +30 XP 🎉', 'cheer')
  }, [phase, questDone, actions, flash])

  // Needs slowly decay so caring for Poti keeps mattering.
  useEffect(() => {
    if (phase !== 'playing') return undefined
    const id = setInterval(() => {
      setNeeds((n) => ({
        hunger: clamp(n.hunger - NEED_DECAY.hunger, 0, 100),
        fun: clamp(n.fun - NEED_DECAY.fun, 0, 100),
        energy: clamp(n.energy - NEED_DECAY.energy, 0, 100),
        clean: clamp(n.clean - NEED_DECAY.clean, 0, 100),
      }))
    }, 4000)
    return () => clearInterval(id)
  }, [phase])

  // Idle chatter keeps Poti feeling alive.
  useEffect(() => {
    if (phase !== 'playing' || sleeping) return undefined
    const id = setInterval(() => {
      if (document.hidden) return
      if (bubbleTimer.current && bubble) return
      say(pick(MOOD_LINES[moodFromNeeds(needsRef.current)] || MOOD_LINES.happy), 3600)
    }, 9500)
    return () => clearInterval(id)
  }, [phase, sleeping, say, bubble])

  // Blinking eyes.
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true)
      blinkTimer.current = window.setTimeout(() => setBlink(false), 170)
    }, 4200)
    return () => {
      clearInterval(id)
      window.clearTimeout(blinkTimer.current)
    }
  }, [])

  const care = (kind) => {
    if (phaseRef.current !== 'playing' || wardrobeRef.current) return
    if (sleepingRef.current) {
      if (kind === 'sleep') wake()
      else wake()
      return
    }
    if (kind === 'sleep') {
      if (needs.energy > 96) {
        say('Aku belum ngantuk!', 2000)
        return
      }
      setNeeds((n) => ({
        hunger: clamp(n.hunger + (CARE_GAIN.sleep.hunger || 0), 0, 100),
        fun: clamp(n.fun + (CARE_GAIN.sleep.fun || 0), 0, 100),
        energy: clamp(n.energy + CARE_GAIN.sleep.energy, 0, 100),
        clean: clamp(n.clean + (CARE_GAIN.sleep.clean || 0), 0, 100),
      }))
      setStats((s) => ({ ...s, care: s.care + 1 }))
      setSleeping(true)
      react('sleep')
      showPetFx('sleep', 2900)
      say('Zzz… aku tidur dulu ya', 3200)
      actions.collectBonus(0, 5)
      window.clearTimeout(sleepTimer.current)
      sleepTimer.current = window.setTimeout(() => {
        setSleeping(false)
        setPetFx(null)
        react('happy')
        say('Aku segar! 🌞', 2400)
      }, 2900)
      return
    }

    if (kind === 'feed' && needs.hunger > 96) {
      say('Aku kenyang sekali! 😋', 2000)
      return
    }
    if (kind === 'bath' && needs.clean > 96) {
      say('Aku sudah bersih! ✨', 2000)
      return
    }
    if (kind === 'play' && needs.energy < 12) {
      say('Aku terlalu lelah untuk main…', 2200)
      return
    }

    const gain = CARE_GAIN[kind]
    if (!gain) return
    setNeeds((n) => ({
      hunger: clamp(n.hunger + (gain.hunger || 0), 0, 100),
      fun: clamp(n.fun + (gain.fun || 0), 0, 100),
      energy: clamp(n.energy + (gain.energy || 0), 0, 100),
      clean: clamp(n.clean + (gain.clean || 0), 0, 100),
    }))
    setStats((s) => ({
      ...s,
      care: s.care + 1,
      pet: s.pet + (kind === 'pet' ? 1 : 0),
    }))
    react(kind)
    showPetFx(kind === 'pet' ? 'hearts' : kind)
    if (kind === 'feed') {
      actions.collectBonus(1, 3)
      say('Nyam nyam! Enak sekali 🍎', 2400)
    } else if (kind === 'play') {
      actions.collectBonus(2, 6)
      say('Yeay! Main bola! ⚽', 2400)
    } else if (kind === 'bath') {
      actions.collectBonus(2, 4)
      say('Byur! Aku bersih lagi 🫧', 2400)
    } else {
      say('Hihi, geli! 💚', 2000)
    }
  }
  careRef.current = care

  const act = (kind) => {
    if (phaseRef.current !== 'playing' || wardrobeRef.current) return
    if (sleepingRef.current) {
      wake()
      return
    }
    if (!active) {
      say('Dekati tanaman dulu, lalu tekan tombolnya.', 2400)
      return
    }
    if (kind === 'water') {
      if (waterCd > 0) return
      actions.waterPlant(active.id)
      burst(active.id, 'water')
      setStats((s) => ({ ...s, water: s.water + 1 }))
      say(`Siram ${active.name} · +15 XP · +10 koin`, 2600)
    } else if (kind === 'feed') {
      if (feedCd > 0) return
      actions.feedPlant(active.id)
      burst(active.id, 'feed')
      say(`Pupuk ${active.name} · +20 XP · +15 koin`, 2600)
    }
  }
  actRef.current = act

  const petPoti = () => {
    if (phaseRef.current !== 'playing' || wardrobeRef.current) return
    if (sleepingRef.current) {
      wake()
      return
    }
    care('pet')
  }

  collectRef.current = (drop) => {
    if (!dewRef.current.some((d) => d.id === drop.id)) return
    actions.collectBonus(2, 1)
    setDew((list) => list.filter((d) => d.id !== drop.id))
    setStats((s) => ({ ...s, dew: s.dew + 1 }))
    say('Embun terkumpul · +2 koin · +1 XP', 2200)
  }

  // Respawn a few dew drops while playing so exploring stays rewarding.
  useEffect(() => {
    if (phase !== 'playing') return undefined
    const id = setInterval(() => {
      setDew((list) => (list.length >= 7 ? list : [...list, makeDew()]))
    }, 9000)
    return () => clearInterval(id)
  }, [phase])

  // Keyboard support: WASD/arrows to move, 1-4 to care, E/F for plants.
  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase()
      if (wardrobeRef.current) {
        if (k === 'g') setWardrobeOpen(false)
        return
      }
      const movement = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
      if (movement.includes(k) || k === ' ') e.preventDefault()
      if (movement.includes(k)) keys.current.add(k)
      if (phaseRef.current !== 'playing' || e.repeat) return
      if (k === 'g') openWardrobe()
      if (k === '1') careRef.current('feed')
      if (k === '2') careRef.current('play')
      if (k === '3') careRef.current('bath')
      if (k === '4') careRef.current('sleep')
      if (k === 'p' || k === ' ') careRef.current('pet')
      if (k === 'e') actRef.current('water')
      if (k === 'f') actRef.current('feed')
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
      if (wardrobeRef.current) {
        setWardrobeOpen(false)
        return
      }
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

      if (phaseRef.current === 'playing' && !sleepingRef.current && !wardrobeRef.current) {
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
            const spot = pendingSpot.current
            if (spot) {
              pendingSpot.current = null
              spotFnRef.current(spot)
            }
          } else {
            ix = dx / dist
            iy = dy / dist
            mag = 1
          }
        }
        if (mag > 0.14) {
          const strength = Math.min(1, mag)
          const nextX = clamp(p.x + (ix / mag) * SPEED * strength * dt, 80, WORLD.w - 80)
          const nextY = clamp(p.y + (iy / mag) * SPEED * strength * dt, 150, WORLD.h - 60)
          if (!insideObstacle(nextX, p.y)) p.x = nextX
          if (!insideObstacle(p.x, nextY)) p.y = nextY
          if (Math.abs(ix) > 0.22) p.facing = ix > 0 ? 1 : -1
          isMoving = true
        }

        for (const drop of dewRef.current) {
          if (Math.hypot(drop.x - p.x, drop.y - p.y) < 62) {
            collectRef.current(drop)
            break
          }
        }

        const currentZone = zoneAt(p.x, p.y)
        if (currentZone.id !== zoneRef.current.id) {
          zoneRef.current = currentZone
          setZone(currentZone)
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
      className={`game ${sleeping ? 'is-sleeping' : ''}`}
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
          {ZONES.map((z) => (
            <div
              key={z.id}
              className={`g-zone g-zone--${z.id}`}
              style={{ left: z.x, top: z.y, width: z.w, height: z.h }}
              aria-hidden="true"
            >
              <span className="g-zone__label">
                <Leaf size={11} /> {z.name}
              </span>
            </div>
          ))}
          <span className="g-hill g-hill--1" aria-hidden="true" />
          <span className="g-hill g-hill--2" aria-hidden="true" />
          <span className="g-cloudshadow g-cloudshadow--1" aria-hidden="true" />
          <span className="g-cloudshadow g-cloudshadow--2" aria-hidden="true" />
          <span className="g-cloudshadow g-cloudshadow--3" aria-hidden="true" />

          <svg
            className="g-path"
            viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {PATHS.map((d, i) => (
              <g key={`path-${i}`}>
                <path
                  d={d}
                  fill="none"
                  stroke="#a99168"
                  strokeWidth="132"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.3"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="#dcc79e"
                  strokeWidth="116"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.92"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="#f5e9cd"
                  strokeWidth="5"
                  strokeDasharray="16 28"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </g>
            ))}
          </svg>

          <CottageArt />
          <GreenhouseArt />
          <ShedArt />

          <svg className="g-lights" viewBox="0 0 700 160" aria-hidden="true">
            <rect x="12" y="30" width="12" height="120" rx="5" fill="#9E6B47" />
            <rect x="676" y="20" width="12" height="130" rx="5" fill="#9E6B47" />
            <path d="M18 38C150 132 470 132 682 28" stroke="#7C5A3C" strokeWidth="4" fill="none" />
            {[
              [80, 66],
              [170, 94],
              [265, 110],
              [350, 116],
              [440, 112],
              [530, 100],
              [610, 78],
              [662, 52],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                className="g-bulb"
                cx={cx}
                cy={cy}
                r="7"
                fill="#FFE6A6"
                style={{ animationDelay: `${i * 0.22}s` }}
              />
            ))}
          </svg>

          <div className="g-pond" aria-hidden="true">
            <span className="g-pond__pad g-pond__pad--1" />
            <span className="g-pond__pad g-pond__pad--2" />
            <span className="g-pond__pad g-pond__pad--3" />
            <span className="g-duck">
              <i />
              <b />
              <em />
            </span>
          </div>

          <span className="g-bench" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>

          <div className="g-dock" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <div className="g-arch" aria-hidden="true">
            <i /><i /><span />
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
          {decor.bushes.map((bush, i) => (
            <span
              key={`bush-${i}`}
              className="g-bush"
              aria-hidden="true"
              style={{ left: bush.x, top: bush.y, '--s': bush.s, zIndex: Math.round(bush.y) }}
            />
          ))}
          {decor.mushrooms.map((mushroom, i) => (
            <span
              key={`mushroom-${i}`}
              className="g-mushroom"
              aria-hidden="true"
              style={{ left: mushroom.x, top: mushroom.y, '--s': mushroom.s }}
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

          {decor.reeds.map((reed, i) => (
            <span
              key={`reed-${i}`}
              className="g-reed"
              aria-hidden="true"
              style={{ left: reed.x, top: reed.y, '--s': reed.s, zIndex: Math.round(reed.y) }}
            >
              <i /><i /><i />
            </span>
          ))}
          {decor.crates.map((crate, i) => (
            <span
              key={`crate-${i}`}
              className="g-crate"
              aria-hidden="true"
              style={{ left: crate.x, top: crate.y, '--s': crate.s, zIndex: Math.round(crate.y) }}
            />
          ))}
          {decor.lanterns.map((lantern, i) => (
            <span
              key={`lantern-${i}`}
              className="g-lantern"
              aria-hidden="true"
              style={{ left: lantern.x, top: lantern.y, zIndex: Math.round(lantern.y) }}
            >
              <i />
            </span>
          ))}

          <div className="g-fence" aria-hidden="true" />

          {INTERACTIVE_SPOTS.map((spot) => {
            const left = spotLeft(spot)
            return (
              <button
                key={spot.id}
                type="button"
                className={`g-spot g-spot--${spot.type} ${left > 0 ? 'is-cooling' : ''}`}
                style={{ left: spot.x, top: spot.y, zIndex: Math.round(spot.y) }}
                onClick={(event) => {
                  event.stopPropagation()
                  goToSpot(spot)
                }}
                aria-label={`${spot.name}${left > 0 ? `, tersedia dalam ${left} detik` : ''}`}
              >
                <span className="g-spot__art"><SpotArt type={spot.type} /></span>
                <span className="g-spot__name">{spot.name}</span>
                {left > 0 && <span className="g-spot__timer">{left}s</span>}
                {left === 0 && <span className="g-spot__hint">Klik untuk menjelajah</span>}
              </button>
            )
          })}

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

          <div
            className="g-player"
            ref={playerEl}
            style={{ '--art': `${playerArt}px` }}
          >
            <span className="g-player__shadow" aria-hidden="true" />
            {bubble && (
              <span key={bubble.id} className="g-player__bubble">
                {bubble.text}
              </span>
            )}
            {petFx && <PetFx key={petFx.key} kind={petFx.kind} />}
            <div
              className={`g-player__inner ${reaction ? 'is-cheer' : ''}`}
              key={reaction ? reaction.key : 'idle'}
              style={{ width: playerArt }}
              role="button"
              tabIndex={0}
              aria-label="Elus Poti"
              onClick={(event) => {
                event.stopPropagation()
                petPoti()
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                event.stopPropagation()
                petPoti()
              }}
            >
              <div className="g-player__body">
                <Mascot
                  size={playerArt}
                  expression={expression}
                  blink={blink}
                  waving={false}
                  look={potiLook}
                />
              </div>
            </div>
            <span className="g-player__name">Poti</span>
          </div>
        </div>
      </div>

      <div className="g-sunrays" aria-hidden="true" />
      <div className="g-pollen" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </div>
      {sleeping && (
        <div className="g-sleepveil" aria-hidden="true">
          <span className="g-sleepveil__star g-sleepveil__star--1">✦</span>
          <span className="g-sleepveil__star g-sleepveil__star--2">✦</span>
          <span className="g-sleepveil__star g-sleepveil__star--3">✦</span>
        </div>
      )}

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
          <span className="g-petcard">
            <MiniAvatar />
            <span className="g-petcard__info">
              <strong>
                Poti <em>Lv {level.level}</em>
              </strong>
              <span className="g-xpbar">
                <i style={{ width: `${level.percent}%` }} />
              </span>
            </span>
          </span>
          <button
            type="button"
            className="g-icon-btn g-icon-btn--style"
            onClick={openWardrobe}
            aria-label="Buka lemari gaya Poti"
            title="Lemari Gaya (G)"
          >
            <Shirt size={19} />
          </button>
        </div>
        <div className="g-hud__right">
          <span className="g-wallet">
            <Coins size={14} /> {wallet.coins}
          </span>
          <span className="g-wallet g-wallet--xp">
            <Zap size={14} /> {wallet.xp} XP
          </span>
          <span className={`g-chip g-chip--quest ${questDone ? 'is-done' : ''}`}>
            <Trophy size={14} /> {questProgress}/{QUEST.care + QUEST.water + QUEST.dew}
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
          <div className="g-needs" aria-label="Kebutuhan Poti">
            <NeedMeter icon={Utensils} label="Makan" value={needs.hunger} tone="#E8A24B" />
            <NeedMeter icon={Gamepad2} label="Senang" value={needs.fun} tone="#7CBB58" />
            <NeedMeter icon={Zap} label="Energi" value={needs.energy} tone="#5BA8C8" />
            <NeedMeter icon={Sparkles} label="Bersih" value={needs.clean} tone="#C58BD8" />
          </div>

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

          <div className="g-zonechip" aria-live="polite">
            <MapPin size={13} />
            <strong>{zone.name}</strong>
            <span>{zone.hint}</span>
          </div>

          <Joystick onChange={onStick} disabled={portrait || sleeping} />

          <div className="g-pad" aria-label="Tombol aksi perawatan">
            <ActionButton
              tone="feed"
              icon={Apple}
              label="Makan"
              onClick={() => care('feed')}
              disabled={sleeping}
            />
            <ActionButton
              tone="play"
              icon={Gamepad2}
              label="Main"
              onClick={() => care('play')}
              disabled={sleeping}
            />
            <ActionButton
              tone="bath"
              icon={Bath}
              label="Mandi"
              onClick={() => care('bath')}
              disabled={sleeping}
            />
            <ActionButton
              tone="sleep"
              icon={Moon}
              label="Tidur"
              onClick={() => care('sleep')}
              disabled={sleeping}
            />
            <ActionButton
              tone="water"
              icon={Droplets}
              label="Siram"
              onClick={() => act('water')}
              disabled={waterCd > 0 || sleeping}
              badge={waterCd > 0 ? `${waterCd}s` : null}
            />
            <ActionButton
              tone="plant"
              icon={Sprout}
              label="Pupuk"
              onClick={() => act('feed')}
              disabled={feedCd > 0 || sleeping}
              badge={feedCd > 0 ? `${feedCd}s` : null}
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
              Poti sekarang punya kebutuhan! Beri makan, ajak main, mandikan, dan
              tidurkan. Jelajahi tujuh area kebun lewat jalur setapak, klik penanda
              seru, siram tanaman, dan kumpulkan embun. Buka aksesori Poti di Lemari Gaya.
            </p>
            <div className="g-intro__controls">
              <div>
                <span className="g-intro__ico g-intro__ico--stick"><Move size={18} /></span>
                <strong>Joystick kiri</strong>
                <small>Jalan keliling kebun</small>
              </div>
              <div>
                <span className="g-intro__ico g-intro__ico--act"><Apple size={18} /></span>
                <strong>Tombol rawat</strong>
                <small>Makan, main, mandi, tidur</small>
              </div>
              <div>
                <span className="g-intro__ico g-intro__ico--dew"><Heart size={18} /></span>
                <strong>Elus Poti</strong>
                <small>Ketuk Poti untuk bermanja</small>
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
              Keyboard: <kbd>WASD</kbd>/panah gerak · <kbd>1</kbd> makan · <kbd>2</kbd> main ·{' '}
              <kbd>3</kbd> mandi · <kbd>4</kbd> tidur · <kbd>P</kbd> elus · <kbd>E</kbd> siram ·{' '}
              <kbd>F</kbd> pupuk · <kbd>G</kbd> gaya · klik tanaman atau penanda untuk berjalan
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
              Tantangan sesi: {questProgress}/{QUEST.care + QUEST.water + QUEST.dew}
              {questDone
                ? ' selesai! 🎉'
                : ' — rawat Poti 3×, siram 3 tanaman, kumpulkan 3 embun.'}
            </p>
            <div className="g-pause__stats">
              <div><Heart size={16} /><strong>{stats.care}</strong><small>rawat</small></div>
              <div><Droplets size={16} /><strong>{stats.water}</strong><small>siram</small></div>
              <div><Coins size={16} /><strong>{stats.dew}</strong><small>embun</small></div>
              <div><Sparkles size={16} /><strong>{stats.pet}</strong><small>elus</small></div>
            </div>
            <div className="g-pause__actions">
              <button type="button" className="g-cta" onClick={() => setPhase('playing')} autoFocus>
                <Play size={18} /> Lanjutkan
              </button>
              <button
                type="button"
                className="g-cta g-cta--ghost"
                onClick={() => {
                  setPhase('playing')
                  setWardrobeOpen(true)
                }}
              >
                <Shirt size={18} /> Gaya Poti
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


      {wardrobeOpen && (
        <div className="g-overlay g-overlay--wardrobe">
          <div className="g-card g-wardrobe" role="document" aria-label="Lemari gaya Poti">
            <div className="g-wardrobe__head">
              <div>
                <span className="g-pause__eyebrow">Lemari Poti</span>
                <h2>Gaya Poti</h2>
                <p className="g-wardrobe__lead">
                  Buka aksesori dengan koin kebun, lalu padukan sesukamu. Gaya tersimpan
                  otomatis di akun.
                </p>
              </div>
              <button
                type="button"
                className="g-icon-btn"
                onClick={closeWardrobe}
                aria-label="Tutup lemari gaya"
              >
                <X size={19} />
              </button>
            </div>

            <div className="g-wardrobe__body">
              <div className="g-wardrobe__preview">
                <div className="g-wardrobe__stage">
                  <Mascot size={150} waving={false} look={potiLook} />
                </div>
                <span className="g-wardrobe__coins">
                  <Coins size={14} /> {wallet.coins} koin
                </span>
                <div className="g-wardrobe__slots">
                  {COSMETIC_SLOTS.map((slot) => {
                    const item = COSMETICS.find((c) => c.id === potiLook[slot.id])
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        className={`g-wardrobe__slot ${item ? 'is-on' : ''}`}
                        onClick={() => item && actions.unequipCosmetic(slot.id)}
                        disabled={!item}
                        title={item ? `Lepas ${item.name}` : `Belum ada ${slot.label.toLowerCase()}`}
                      >
                        {slot.label}
                        {item && <X size={11} />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="g-wardrobe__grid">
                {COSMETICS.map((item) => {
                  const owned = ownedCosmetics.includes(item.id)
                  const equipped = potiLook[item.slot] === item.id
                  return (
                    <div
                      key={item.id}
                      className={`g-wardrobe__item ${equipped ? 'is-equipped' : ''} ${
                        owned ? 'is-owned' : ''
                      }`}
                    >
                      <span className="g-wardrobe__thumb">
                        <ProductArt type={item.art} />
                      </span>
                      <div className="g-wardrobe__meta">
                        <strong>{item.name}</strong>
                        <small>{COSMETIC_SLOTS.find((s) => s.id === item.slot)?.label}</small>
                      </div>
                      {owned ? (
                        <button
                          type="button"
                          className="g-wardrobe__btn"
                          onClick={() =>
                            equipped
                              ? actions.unequipCosmetic(item.slot)
                              : actions.equipCosmetic(item.id)
                          }
                        >
                          {equipped ? 'Lepas' : 'Pakai'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="g-wardrobe__btn g-wardrobe__btn--buy"
                          onClick={() => actions.buyCosmeticWithCoins(item.id)}
                          disabled={wallet.coins < item.coinPrice}
                          title={
                            wallet.coins < item.coinPrice
                              ? `Butuh ${item.coinPrice - wallet.coins} koin lagi`
                              : 'Buka dengan koin'
                          }
                        >
                          <Coins size={12} /> {item.coinPrice}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="g-wardrobe__note">
              <Shirt size={14} /> Butuh koin? Rawat tanaman, kumpulkan embun, atau selesaikan
              tantangan. Bisa juga beli di{' '}
              <button
                type="button"
                className="g-wardrobe__link"
                onClick={() => {
                  close()
                  navigate('/shop?kategori=Gaya%20Poti')
                }}
              >
                POTIVA Shop
              </button>
              .
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
