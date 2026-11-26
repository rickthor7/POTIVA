import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Apple,
  ArrowLeft,
  Bath,
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
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Mascot, PottedPlant, ProductArt } from './illustrations'
import {
  PIXEL_WORLD,
  PixelBarn,
  PixelBench,
  PixelBirdhouse,
  PixelCritter,
  PixelFarmhouse,
  PixelGreenhouse,
  PixelLamp,
  PixelMarketStall,
  PixelScarecrow,
  PixelTerrainCanvas,
  PixelTree,
  PixelWindmill,
} from './PixelGardenArt'
import { useApp } from '../store/AppStore'
import { COSMETICS, levelFromXp } from '../data/appData'
import { clamp } from '../lib/utils'

const WORLD = { w: PIXEL_WORLD.w, h: PIXEL_WORLD.h }
const START = { x: 1312, y: 540 }
const SPEED = 340
const REACH = 175
const QUEST = { care: 3, water: 3, dew: 3 }
const DEFAULT_ZOOM = 1
const MAX_ZOOM = 1.75
const ZOOM_STEP = 0.15

const cameraTarget = (px, py, vw, vh, z) => {
  const sw = WORLD.w * z
  const sh = WORLD.h * z
  return {
    x: sw <= vw ? -(vw - sw) / 2 : clamp(px * z - vw / 2, 0, sw - vw),
    y: sh <= vh ? -(vh - sh) / 2 : clamp(py * z - vh * 0.58, 0, sh - vh),
  }
}

// Plants sit cleanly inside the 4 fenced garden quadrants first, then expand to greenhouse & meadow beds.
const PLANT_SLOTS = [
  { x: 1096, y: 786 },
  { x: 1496, y: 786 },
  { x: 1096, y: 1080 },
  { x: 1496, y: 1080 },
  { x: 1188, y: 786 },
  { x: 1588, y: 786 },
  { x: 1188, y: 1080 },
  { x: 1588, y: 1080 },
  { x: 2040, y: 1440 },
  { x: 1850, y: 1360 },
  { x: 810, y: 1420 },
  { x: 420, y: 690 },
]

const DEW_SEED = [
  { x: 280, y: 580 },
  { x: 840, y: 560 },
  { x: 1620, y: 510 },
  { x: 2120, y: 310 },
  { x: 2380, y: 560 },
  { x: 1840, y: 940 },
  { x: 1960, y: 1470 },
  { x: 980, y: 1460 },
]

const ZONES = [
  { id: 'hutan', name: 'Tebing Barat', hint: 'Padang bunga & anak tangga', x: 0, y: 0, w: 960, h: 760 },
  { id: 'padang', name: 'Halaman Rumah', hint: 'Rumah utama Poti', x: 940, y: 0, w: 800, h: 580 },
  { id: 'kincir', name: 'Bukit Kincir', hint: 'Jembatan batu & kincir angin', x: 1740, y: 0, w: 820, h: 660 },
  { id: 'gudang', name: 'Gudang Barat', hint: 'Jembatan kayu & gudang', x: 0, y: 760, w: 860, h: 840 },
  { id: 'ladang', name: 'Ladang Utama', hint: 'Petak tanaman berpagar', x: 860, y: 580, w: 880, h: 700 },
  { id: 'pasar', name: 'Stan Pasar', hint: 'Hasil panen & tepi sungai', x: 1740, y: 660, w: 820, h: 420 },
  { id: 'kaca', name: 'Rumah Kaca', hint: 'Kelinci, ayam & bibit', x: 1740, y: 1080, w: 820, h: 520 },
  { id: 'buah', name: 'Kebun Buah', hint: 'Pohon buah & bunga liar', x: 860, y: 1280, w: 880, h: 320 },
]

const INTERACTIVE_SPOTS = [
  {
    id: 'rumah',
    name: 'Rumah Kebun',
    x: 1280,
    y: 446,
    coins: 4,
    xp: 2,
    cooldown: 24000,
    message: 'Rumah hangat Poti! +4 koin · +2 XP',
  },
  {
    id: 'orangsawah',
    name: 'Orang-orangan',
    x: 1312,
    y: 924,
    coins: 2,
    xp: 2,
    cooldown: 20000,
    message: 'Tips: dekati tanaman di petak, lalu tekan E untuk menyiram 💧',
  },
  {
    id: 'kincir',
    name: 'Kincir Angin',
    x: 2330,
    y: 392,
    coins: 6,
    xp: 3,
    cooldown: 30000,
    message: 'Angin sepoi-sepoi memutar kincir! +6 koin · +3 XP',
  },
  {
    id: 'pasar',
    name: 'Stan Pasar',
    x: 2112,
    y: 926,
    coins: 5,
    xp: 3,
    cooldown: 28000,
    message: 'Panen segar siap dipajang! +5 koin · +3 XP',
  },
  {
    id: 'kaca',
    name: 'Rumah Kaca',
    x: 2316,
    y: 1404,
    coins: 4,
    xp: 4,
    cooldown: 26000,
    message: 'Bibit di rumah kaca tumbuh subur! +4 koin · +4 XP',
  },
  {
    id: 'gudang',
    name: 'Gudang Kebun',
    x: 208,
    y: 1418,
    coins: 3,
    xp: 4,
    cooldown: 24000,
    message: 'Alat berkebun rapi tersimpan! +3 koin · +4 XP',
  },
]

// Solid world footprints (buildings, fences, cliffs)
const OBSTACLES = [
  { x: 1112, y: 120, w: 336, h: 268 }, // Main Farmhouse
  { x: 2266, y: 180, w: 128, h: 192 }, // Windmill tower
  { x: 88, y: 1220, w: 240, h: 168 }, // Barn / Tool shed
  { x: 2000, y: 760, w: 224, h: 140 }, // Market stall
  { x: 2188, y: 1140, w: 256, h: 220 }, // Greenhouse
  // Top-left cliff wall
  { x: 384, y: 166, w: 608, h: 72 },
  // Mid-left cliff wall split around wooden stairs (x: 292..392)
  { x: 0, y: 882, w: 292, h: 78 },
  { x: 392, y: 882, w: 64, h: 78 },
  // Fenced garden outer rails with 4 wide gates
  { x: 920, y: 612, w: 312, h: 24 }, // North-west rail
  { x: 1384, y: 612, w: 320, h: 24 }, // North-east rail
  { x: 920, y: 1204, w: 312, h: 24 }, // South-west rail
  { x: 1384, y: 1204, w: 320, h: 24 }, // South-east rail
  { x: 916, y: 612, w: 24, h: 244 }, // West-north rail
  { x: 916, y: 984, w: 24, h: 244 }, // West-south rail
  { x: 1684, y: 612, w: 24, h: 244 }, // East-north rail
  { x: 1684, y: 984, w: 24, h: 244 }, // East-south rail
]

const WEST_RIVER_WORLD = [
  [-40, 432],
  [368, 440],
  [568, 496],
  [648, 632],
  [656, 848],
  [624, 1144],
  [584, 1440],
  [560, 1648],
]

const EAST_RIVER_WORLD = [
  [1872, -40],
  [1872, 496],
  [1952, 632],
  [2176, 696],
  [2608, 712],
]

const BRIDGES = [
  { x: 528, y: 728, w: 240, h: 120 }, // West wooden bridge
  { x: 1748, y: 272, w: 248, h: 128 }, // East stone arch bridge
]

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function insideRiver(x, y) {
  const onBridge = BRIDGES.some((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h)
  if (onBridge) return false
  for (const river of [WEST_RIVER_WORLD, EAST_RIVER_WORLD]) {
    for (let i = 0; i < river.length - 1; i += 1) {
      const d = distToSegment(x, y, river[i][0], river[i][1], river[i + 1][0], river[i + 1][1])
      if (d < 46) return true
    }
  }
  return false
}

const insideObstacle = (x, y) =>
  OBSTACLES.some((o) => x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h) || insideRiver(x, y)

const NEED_DECAY = { hunger: 0.9, fun: 1.05, energy: 0.7, clean: 0.6 }
const CARE_GAIN = {
  feed: { hunger: 34, fun: 4, energy: 2, clean: -4 },
  play: { fun: 34, energy: -10, hunger: -5, clean: -3 },
  bath: { clean: 42, fun: 6, energy: -2 },
  sleep: { energy: 46, fun: 2, hunger: -4 },
}

const MOOD_LINES = {
  happy: [
    'Hari yang cerah di kebun!',
    'Daunku segar sekali 🌿',
    'Ayo cek petak sayuran!',
    'Jembatan sungainya keren ya!',
    'Terima kasih sudah merawatku!',
  ],
  hungry: ['Aku lapar…', 'Ada apel kebun? 🍎', 'Perutku berbunyi…'],
  sleepy: ['Aku ngantuk…', 'Zzz…', 'Boleh aku tidur sebentar?'],
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

const makeDew = (x, y) => {
  if (x != null && y != null) {
    return {
      id: `dew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x,
      y,
    }
  }
  // Pick a walkable spot on land
  for (let tries = 0; tries < 20; tries += 1) {
    const cx = 160 + Math.random() * (WORLD.w - 320)
    const cy = 260 + Math.random() * (WORLD.h - 420)
    if (!insideObstacle(cx, cy)) {
      return {
        id: `dew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        x: cx,
        y: cy,
      }
    }
  }
  return {
    id: `dew_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    x: 1312,
    y: 540,
  }
}

const zoneAt = (x, y) =>
  [...ZONES].reverse().find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) ||
  ZONES[4]

const WORLD_TREES = [
  // Top-left & cliff trees
  { x: 140, y: 190, v: 'oak', s: 1.05 },
  { x: 470, y: 170, v: 'pine', s: 0.92 },
  { x: 840, y: 180, v: 'oak', s: 1.12 },
  { x: 1000, y: 240, v: 'pine', s: 0.95 },
  // Near farmhouse & sakura
  { x: 1620, y: 160, v: 'sakura', s: 1.15 },
  { x: 1730, y: 220, v: 'pine', s: 0.92 },
  // Near windmill & east river
  { x: 2140, y: 165, v: 'apple', s: 1.05 },
  { x: 2480, y: 520, v: 'oak', s: 1.08 },
  // West meadow
  { x: 110, y: 580, v: 'apple', s: 1.05 },
  { x: 420, y: 600, v: 'orange', s: 1.0 },
  { x: 105, y: 1030, v: 'oak', s: 1.02 },
  // Near greenhouse & market
  { x: 2490, y: 960, v: 'sakura', s: 1.12 },
  // Bottom fruit orchard
  { x: 1140, y: 1470, v: 'apple', s: 1.12 },
  { x: 1480, y: 1470, v: 'orange', s: 1.12 },
  { x: 740, y: 1480, v: 'oak', s: 1.0 },
  { x: 1960, y: 1520, v: 'apple', s: 1.04 },
]

const WORLD_LAMPS = [
  { x: 830, y: 660 },
  { x: 1740, y: 820 },
  { x: 1740, y: 1160 },
  { x: 1780, y: 240 },
  { x: 2050, y: 260 },
  { x: 820, y: 1210 },
]

const WORLD_BENCHES = [
  { x: 1080, y: 470 },
  { x: 2150, y: 260 },
  { x: 2060, y: 1150 },
]

const WORLD_BIRDHOUSES = [
  { x: 350, y: 660 },
  { x: 650, y: 100 },
  { x: 2240, y: 380 },
  { x: 2020, y: 1240 },
]

const WORLD_CRITTERS = [
  { kind: 'chicken', x: 860, y: 440, d: '0s' },
  { kind: 'chicken', x: 910, y: 465, d: '1.1s' },
  { kind: 'chicken', x: 1730, y: 220, d: '0.6s' },
  { kind: 'rabbit', x: 2010, y: 1210, d: '0.3s' },
  { kind: 'rabbit', x: 2090, y: 1270, d: '1.4s' },
  { kind: 'rabbit', x: 620, y: 88, d: '0.9s' },
  { kind: 'duck', x: 2040, y: 560, d: '0s' },
  { kind: 'duck', x: 2480, y: 690, d: '1.5s' },
  { kind: 'duck', x: 120, y: 440, d: '0.8s' },
]

const WORLD_BUTTERFLIES = [
  [1040, 460, 0, '#f6b7a3'],
  [1310, 860, 2.4, '#ffe6a6'],
  [1580, 1400, 5.1, '#c7e59c'],
  [780, 740, 1.8, '#bfe0f5'],
  [2160, 960, 4.2, '#f7b4c8'],
  [360, 1180, 6.3, '#ffe6a6'],
]

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

function PixelMinimap({ plants, dew, playerDotRef }) {
  return (
    <div className="g-minimap" aria-hidden="true">
      <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} shapeRendering="crispEdges">
        <rect width={WORLD.w} height={WORLD.h} fill="#79b53d" />
        {/* Rivers */}
        <polyline
          points={WEST_RIVER_WORLD.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#4fa4d8"
          strokeWidth="120"
          strokeLinejoin="round"
        />
        <polyline
          points={EAST_RIVER_WORLD.map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke="#4fa4d8"
          strokeWidth="120"
          strokeLinejoin="round"
        />
        {/* Bridges */}
        <rect x="528" y="728" width="240" height="120" fill="#c78c52" />
        <rect x="1748" y="272" width="248" height="128" fill="#b8beb8" />
        {/* Central Fenced Garden */}
        <rect x="928" y="624" width="768" height="592" fill="#8d5935" stroke="#c88c58" strokeWidth="24" />
        {/* Buildings */}
        <rect x="1112" y="120" width="336" height="268" fill="#2c5858" />
        <rect x="2266" y="180" width="128" height="192" fill="#965a33" />
        <rect x="88" y="1220" width="240" height="168" fill="#9a643d" />
        <rect x="2000" y="760" width="224" height="140" fill="#5da65e" />
        <rect x="2188" y="1140" width="256" height="220" fill="#9cd8cf" />
        {/* Dewdrops */}
        {dew.map((d) => (
          <circle key={d.id} cx={d.x} cy={d.y} r="36" fill="#89e4ff" />
        ))}
        {/* POTIVA Plants */}
        {plants.map((p) => (
          <circle key={p.id} cx={p.x} cy={p.y} r="52" fill="#a8d66d" stroke="#174d35" strokeWidth="18" />
        ))}
        {/* Player dot updated directly in RAF */}
        <circle
          ref={playerDotRef}
          cx={START.x}
          cy={START.y}
          r="66"
          fill="#ffdf5d"
          stroke="#3a2315"
          strokeWidth="22"
        />
      </svg>
    </div>
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
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const rootRef = useRef(null)
  const viewRef = useRef(null)
  const worldRef = useRef(null)
  const playerEl = useRef(null)
  const playerDotRef = useRef(null)
  const introBtnRef = useRef(null)
  const stick = useRef({ x: 0, y: 0 })
  const waypoint = useRef(null)
  const keys = useRef(new Set())
  const player = useRef({ ...START, facing: 1 })
  const cam = useRef({ x: 0, y: 0 })
  const targetZoomRef = useRef(DEFAULT_ZOOM)
  const smoothZoomRef = useRef(DEFAULT_ZOOM)
  const minZoomRef = useRef(0.45)
  const pinchedRef = useRef(false)
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

  const scale = clamp(viewport.h / 780, 0.62, 1.16)
  const minZoom = useMemo(
    () => clamp(Math.min(0.9, Math.max(viewport.w / WORLD.w, viewport.h / WORLD.h)), 0.42, 0.9),
    [viewport.w, viewport.h],
  )
  minZoomRef.current = minZoom

  const applyZoom = useCallback((next) => {
    const clamped = clamp(Math.round(next * 100) / 100, minZoomRef.current, MAX_ZOOM)
    targetZoomRef.current = clamped
    setZoom(clamped)
  }, [])

  const plantArt = Math.round(138 * scale)
  const playerArt = Math.round(126 * scale)
  const level = levelFromXp(wallet.xp)

  const placed = useMemo(
    () =>
      plants.map((plant, index) => {
        const slot = PLANT_SLOTS[index % PLANT_SLOTS.length]
        const lap = Math.floor(index / PLANT_SLOTS.length)
        return {
          ...plant,
          x: clamp(slot.x + lap * 80, 120, WORLD.w - 120),
          y: clamp(slot.y + lap * 64, 240, WORLD.h - 90),
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
      const tx = clamp(x, 70, WORLD.w - 70)
      const ty = clamp(y, 120, WORLD.h - 60)
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
      if (Math.hypot(spot.x - p.x, spot.y - p.y) < REACH + 40) {
        pendingSpot.current = null
        interactSpot(spot)
        return
      }
      goTo(spot.x, spot.y + 24, `Menuju ${spot.name}`)
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
      if (pinchedRef.current) {
        pinchedRef.current = false
        return
      }
      const rect = event.currentTarget.getBoundingClientRect()
      const z = smoothZoomRef.current || 1
      goTo(
        (cam.current.x + (event.clientX - rect.left)) / z,
        (cam.current.y + (event.clientY - rect.top)) / z,
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
      /* ignore */
    }
    try {
      if (screen.orientation?.lock) await screen.orientation.lock('landscape')
    } catch {
      /* ignore */
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
    say('Halo! Selamat datang di Kebun Pixel Poti 🌱', 3400)
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

  useEffect(() => {
    if (phase !== 'playing' || questAwarded.current || !questDone) return
    questAwarded.current = true
    actions.collectBonus(40, 30)
    cheerWorld()
    flash('Tantangan kebun selesai! +40 koin · +30 XP 🎉', 'cheer')
  }, [phase, questDone, actions, flash])

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

  useEffect(() => {
    if (phase !== 'playing' || sleeping) return undefined
    const id = setInterval(() => {
      if (document.hidden) return
      if (bubbleTimer.current && bubble) return
      say(pick(MOOD_LINES[moodFromNeeds(needsRef.current)] || MOOD_LINES.happy), 3600)
    }, 9500)
    return () => clearInterval(id)
  }, [phase, sleeping, say, bubble])

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
      wake()
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

  useEffect(() => {
    if (phase !== 'playing') return undefined
    const id = setInterval(() => {
      setDew((list) => (list.length >= 7 ? list : [...list, makeDew()]))
    }, 9000)
    return () => clearInterval(id)
  }, [phase])

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
      if (k === '+' || k === '=') applyZoom(targetZoomRef.current + ZOOM_STEP)
      if (k === '-' || k === '_') applyZoom(targetZoomRef.current - ZOOM_STEP)
      if (k === '0') applyZoom(DEFAULT_ZOOM)
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
  }, [openWardrobe, applyZoom])

  // Mouse-wheel & two-finger pinch zoom on the game viewport.
  useEffect(() => {
    const el = viewRef.current
    if (!el) return undefined
    const pointers = new Map()
    let pinchStartDist = 0
    let pinchStartZoom = DEFAULT_ZOOM

    const onWheel = (e) => {
      if (phaseRef.current !== 'playing' || wardrobeRef.current) return
      e.preventDefault()
      const delta = -Math.sign(e.deltaY) * 0.12
      applyZoom(targetZoomRef.current + delta)
    }

    const onPointerDown = (e) => {
      if (e.pointerType !== 'touch') return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchStartDist = Math.hypot(b.x - a.x, b.y - a.y)
        pinchStartZoom = targetZoomRef.current
        pinchedRef.current = true
        waypoint.current = null
      }
    }

    const onPointerMove = (e) => {
      if (!pointers.has(e.pointerId)) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2 && pinchStartDist > 10) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        applyZoom(pinchStartZoom * (dist / pinchStartDist))
      }
    }

    const onPointerEnd = (e) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchStartDist = 0
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerEnd)
    el.addEventListener('pointercancel', onPointerEnd)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerEnd)
      el.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [applyZoom])

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

  // Game loop: smooth 60fps player motion, bridge/river collision, and camera follow.
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
          const nextX = clamp(p.x + (ix / mag) * SPEED * strength * dt, 64, WORLD.w - 64)
          const nextY = clamp(p.y + (iy / mag) * SPEED * strength * dt, 100, WORLD.h - 48)
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

      if (playerDotRef.current) {
        playerDotRef.current.setAttribute('cx', String(Math.round(p.x)))
        playerDotRef.current.setAttribute('cy', String(Math.round(p.y)))
      }

      const vw = viewportRef.current.w
      const vh = viewportRef.current.h
      const zDiff = targetZoomRef.current - smoothZoomRef.current
      if (Math.abs(zDiff) > 0.0005) {
        smoothZoomRef.current += zDiff * Math.min(1, dt * 11)
      } else {
        smoothZoomRef.current = targetZoomRef.current
      }
      const z = smoothZoomRef.current
      const target = cameraTarget(p.x, p.y, vw, vh, z)
      cam.current.x += (target.x - cam.current.x) * Math.min(1, dt * 8)
      cam.current.y += (target.y - cam.current.y) * Math.min(1, dt * 8)
      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${-cam.current.x}px, ${-cam.current.y}px, 0) scale(${z})`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const clamped = clamp(targetZoomRef.current, minZoom, MAX_ZOOM)
    if (clamped !== targetZoomRef.current) {
      targetZoomRef.current = clamped
      smoothZoomRef.current = clamped
      setZoom(clamped)
    }
    const z = smoothZoomRef.current
    const target = cameraTarget(player.current.x, player.current.y, viewport.w, viewport.h, z)
    cam.current.x = target.x
    cam.current.y = target.y
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${-cam.current.x}px, ${-cam.current.y}px, 0) scale(${z})`
    }
  }, [viewport, minZoom])

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
      className={`game game--pixel ${sleeping ? 'is-sleeping' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mode petualangan Kebun Pixel POTIVA"
      data-phase={phase}
    >
      <div className="g-viewport" ref={viewRef} onClick={onViewClick}>
        <div
          className="g-world g-world--pixel"
          ref={worldRef}
          style={{ width: `${WORLD.w}px`, height: `${WORLD.h}px` }}
        >
          {/* Pixel-art base terrain: grass tiles, rivers, bridges, cliffs, cobblestones, crops & fences */}
          <PixelTerrainCanvas />

          {/* Animated water pixel sparkles */}
          <div className="g-px-ripples" aria-hidden="true">
            <span style={{ left: 260, top: 430 }} />
            <span style={{ left: 640, top: 620 }} />
            <span style={{ left: 610, top: 1080 }} />
            <span style={{ left: 565, top: 1410 }} />
            <span style={{ left: 1870, top: 160 }} />
            <span style={{ left: 2150, top: 690 }} />
            <span style={{ left: 2420, top: 710 }} />
          </div>

          {/* Pixel-art Buildings */}
          <div className="g-px-building-wrap" style={{ left: 1056, top: 44, width: 448, height: 384, zIndex: 380 }}>
            <PixelFarmhouse />
          </div>
          <div className="g-px-building-wrap" style={{ left: 2170, top: 24, width: 320, height: 384, zIndex: 370 }}>
            <PixelWindmill />
          </div>
          <div className="g-px-building-wrap" style={{ left: 48, top: 1120, width: 320, height: 304, zIndex: 1380 }}>
            <PixelBarn />
          </div>
          <div className="g-px-building-wrap" style={{ left: 1968, top: 688, width: 288, height: 256, zIndex: 900 }}>
            <PixelMarketStall />
          </div>
          <div className="g-px-building-wrap" style={{ left: 2140, top: 1020, width: 352, height: 384, zIndex: 1360 }}>
            <PixelGreenhouse />
          </div>

          {/* Central Scarecrow & Watering Can */}
          <div className="g-px-scarecrow-wrap" style={{ left: 1312, top: 916, zIndex: 916 }}>
            <PixelScarecrow />
          </div>

          {/* Pixel-art Trees (oak, apple, orange, sakura, pine) */}
          {WORLD_TREES.map((t, i) => (
            <div
              key={`ptree-${i}`}
              className="g-px-tree-wrap"
              style={{
                left: t.x,
                top: t.y,
                width: Math.round(192 * t.s),
                height: Math.round(224 * t.s),
                zIndex: Math.round(t.y),
              }}
            >
              <PixelTree variant={t.v} />
            </div>
          ))}

          {/* Wooden Lamps, Benches & Birdhouses */}
          {WORLD_LAMPS.map((l, i) => (
            <div
              key={`lamp-${i}`}
              className="g-px-prop"
              style={{ left: l.x, top: l.y, width: 54, height: 96, zIndex: Math.round(l.y) }}
            >
              <PixelLamp />
            </div>
          ))}
          {WORLD_BENCHES.map((b, i) => (
            <div
              key={`bench-${i}`}
              className="g-px-prop"
              style={{ left: b.x, top: b.y, width: 96, height: 54, zIndex: Math.round(b.y) }}
            >
              <PixelBench />
            </div>
          ))}
          {WORLD_BIRDHOUSES.map((bh, i) => (
            <div
              key={`bh-${i}`}
              className="g-px-prop"
              style={{ left: bh.x, top: bh.y, width: 48, height: 72, zIndex: Math.round(bh.y) }}
            >
              <PixelBirdhouse />
            </div>
          ))}

          {/* Animated Pixel Critters (chickens, bunnies, ducks) */}
          {WORLD_CRITTERS.map((c, i) => (
            <div
              key={`crit-${i}`}
              className="g-px-critter-wrap"
              style={{
                left: c.x,
                top: c.y,
                width: 48,
                height: 48,
                zIndex: Math.round(c.y),
                animationDelay: c.d,
              }}
            >
              <PixelCritter kind={c.kind} />
            </div>
          ))}

          {/* Interactive Landmark Signposts */}
          {INTERACTIVE_SPOTS.map((spot) => {
            const left = spotLeft(spot)
            return (
              <button
                key={spot.id}
                type="button"
                className={`g-px-spot ${left > 0 ? 'is-cooling' : ''}`}
                style={{ left: spot.x, top: spot.y, zIndex: Math.round(spot.y) + 20 }}
                onClick={(event) => {
                  event.stopPropagation()
                  goToSpot(spot)
                }}
                aria-label={`${spot.name}${left > 0 ? `, tersedia dalam ${left} detik` : ''}`}
              >
                <span className="g-px-spot__pin">
                  <Sparkles size={11} />
                </span>
                <span className="g-px-spot__name">{spot.name}</span>
                {left > 0 && <span className="g-px-spot__timer">{left}s</span>}
              </button>
            )
          })}

          {/* Collectible Dewdrops */}
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

          {/* POTIVA Plants inside Pixel Planter Beds */}
          {placed.map((plant) => (
            <div
              key={plant.id}
              className={`g-plant g-plant--pixel ${activeId === plant.id ? 'is-active' : ''} ${
                plant.x > WORLD.w * 0.6 ? 'is-left' : ''
              }`}
              style={{ left: plant.x, top: plant.y, zIndex: Math.round(plant.y) }}
              role="button"
              tabIndex={0}
              aria-label={`Menuju ${plant.name}`}
              onClick={(event) => {
                event.stopPropagation()
                goTo(plant.x, plant.y + 34, `Menuju ${plant.name}`)
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                event.stopPropagation()
                goTo(plant.x, plant.y + 34, `Menuju ${plant.name}`)
              }}
            >
              <span className="g-plant__bed g-plant__bed--pixel" aria-hidden="true" />
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
                {activeId === plant.id && <em>Tekan E siram · F pupuk</em>}
              </div>
            </div>
          ))}

          {/* Butterflies */}
          <div className="g-flies" aria-hidden="true">
            {WORLD_BUTTERFLIES.map(([bx, by, d, c], i) => (
              <span
                key={`fly-${i}`}
                className="g-fly"
                style={{ left: bx, top: by, '--d': `${d}s`, '--c': c }}
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

          {/* Poti Character */}
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

          <div className="g-center-hud">
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
                  <Move size={14} /> Dekati tanaman di petak untuk merawat
                </span>
              )}
            </div>

            <div className="g-zonechip" aria-live="polite">
              <MapPin size={12} />
              <strong>{zone.name}</strong>
              <span>{zone.hint}</span>
            </div>
          </div>

          <PixelMinimap plants={placed} dew={dew} playerDotRef={playerDotRef} />

          <div className="g-zoom" role="group" aria-label="Pengatur zoom layar kebun">
            <button
              type="button"
              className="g-zoom__btn"
              onClick={() => applyZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= minZoom + 0.01}
              aria-label="Perkecil tampilan"
              title="Perkecil (-)"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              className="g-zoom__pct"
              onClick={() => applyZoom(DEFAULT_ZOOM)}
              aria-label="Reset zoom ke 100%"
              title="Reset zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="g-zoom__btn"
              onClick={() => applyZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM - 0.01}
              aria-label="Perbesar tampilan"
              title="Perbesar (+)"
            >
              <ZoomIn size={15} />
            </button>
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
              <Gamepad2 size={14} /> Kebun Pixel 2D
            </span>
            <h2>Kebun Poti</h2>
            <p className="g-intro__lead">
              Jelajahi kebun bergaya pixel art top-down! Seberangi jembatan kayu &amp; batu,
              kunjungi Rumah Kebun, Kincir Angin, Stan Pasar, dan Rumah Kaca, lalu rawat
              tanamanmu di petak ladang berpagar.
            </p>
            <div className="g-intro__controls">
              <div>
                <span className="g-intro__ico g-intro__ico--stick"><Move size={18} /></span>
                <strong>Joystick kiri</strong>
                <small>Jelajahi kebun &amp; jembatan</small>
              </div>
              <div>
                <span className="g-intro__ico g-intro__ico--act"><Apple size={18} /></span>
                <strong>Tombol rawat</strong>
                <small>Makan, main, mandi, tidur</small>
              </div>
              <div>
                <span className="g-intro__ico g-intro__ico--dew"><Heart size={18} /></span>
                <strong>Siram &amp; elus</strong>
                <small>Rawat tanaman di ladang</small>
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
              <kbd>F</kbd> pupuk · <kbd>G</kbd> gaya · <kbd>+</kbd>/<kbd>-</kbd> zoom · klik peta atau penanda
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
