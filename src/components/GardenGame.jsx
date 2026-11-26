import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Apple,
  ArrowLeft,
  Bath,
  BookOpen,
  Coins,
  Download,
  Droplets,
  Expand,
  Gamepad2,
  Heart,
  Leaf,
  LogOut,
  MapPin,
  Maximize2,
  MessageCircle,
  Minimize2,
  Moon,
  Move,
  Pause,
  Play,
  Plus,
  RotateCw,
  Send,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Store,
  Sun,
  Ticket,
  Trophy,
  Users,
  Utensils,
  Wheat,
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
  PixelHarvestStoreBuilding,
  PixelLamp,
  PixelMarketStall,
  PixelScarecrow,
  PixelShopBuilding,
  PixelTerrainCanvas,
  PixelTree,
  PixelWindmill,
  PotiCarryProp,
  PotiSleepBlanket,
  PotiSleepPillow,
} from './PixelGardenArt'
import { useApp } from '../store/AppStore'
import { useUI } from '../store/UIStore'
import { useGardenMultiplayer } from '../lib/useGardenMultiplayer'
import { downloadCuteVoucherImage } from '../lib/voucherDownload'
import { COSMETICS, PRODUCT_CATEGORIES, PRODUCTS, SPECIES, VOUCHER_CATALOG, formatIDR, levelFromXp } from '../data/appData'
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

// Plants fill Ladang Utama (12), Kebun Selatan (8), Kebun Timur & Rumah Kaca (8), and Kebun Lumbung (4) = 32 garden plots!
const PLANT_SLOTS = [
  // Ladang Utama (Tengah - 4 kuadran)
  { x: 1026, y: 786 },
  { x: 1112, y: 786 },
  { x: 1198, y: 786 },
  { x: 1426, y: 786 },
  { x: 1512, y: 786 },
  { x: 1598, y: 786 },
  { x: 1026, y: 1082 },
  { x: 1112, y: 1082 },
  { x: 1198, y: 1082 },
  { x: 1426, y: 1082 },
  { x: 1512, y: 1082 },
  { x: 1598, y: 1082 },
  // Kebun Selatan (Ladang baru selatan)
  { x: 1050, y: 1560 },
  { x: 1180, y: 1560 },
  { x: 1436, y: 1560 },
  { x: 1566, y: 1560 },
  { x: 1050, y: 1876 },
  { x: 1180, y: 1876 },
  { x: 1436, y: 1876 },
  { x: 1566, y: 1876 },
  // Kebun Timur & Halaman Rumah Kaca
  { x: 2790, y: 1115 },
  { x: 2950, y: 1115 },
  { x: 2790, y: 1405 },
  { x: 2950, y: 1405 },
  { x: 2260, y: 1790 },
  { x: 2410, y: 1790 },
  { x: 2790, y: 1790 },
  { x: 2950, y: 1790 },
  // Kebun Lumbung Barat Daya
  { x: 236, y: 1795 },
  { x: 372, y: 1795 },
  { x: 236, y: 1900 },
  { x: 372, y: 1900 },
]

const DEW_SEED = [
  { x: 280, y: 580 },
  { x: 840, y: 560 },
  { x: 1620, y: 510 },
  { x: 2120, y: 310 },
  { x: 2960, y: 460 },
  { x: 3140, y: 980 },
  { x: 2610, y: 1280 },
  { x: 1840, y: 940 },
  { x: 1960, y: 1540 },
  { x: 1310, y: 1700 },
  { x: 840, y: 1980 },
  { x: 2720, y: 2040 },
  { x: 360, y: 2060 },
  { x: 1020, y: 1360 },
]

const ZONES = [
  { id: 'hutan', name: 'Tebing Barat', hint: 'Padang bunga & anak tangga', x: 0, y: 0, w: 960, h: 760 },
  { id: 'padang', name: 'Halaman Rumah', hint: 'Rumah Poti & Toko POTIVA', x: 940, y: 0, w: 800, h: 580 },
  { id: 'kincir', name: 'Bukit Kincir & Sakura', hint: 'Jembatan, kincir & taman timur', x: 1740, y: 0, w: 1620, h: 680 },
  { id: 'gudang', name: 'Gudang Barat', hint: 'Jembatan kayu & gudang', x: 0, y: 760, w: 860, h: 760 },
  { id: 'lumbung_s', name: 'Kebun Lumbung', hint: 'Ladang subur barat daya', x: 0, y: 1520, w: 860, h: 720 },
  { id: 'ladang', name: 'Ladang Utama', hint: '12 petak tanaman berpagar', x: 860, y: 580, w: 880, h: 780 },
  { id: 'selatan', name: 'Kebun Selatan', hint: '8 petak sayur & kebun buah', x: 860, y: 1360, w: 880, h: 880 },
  { id: 'pasar', name: 'Stan Pasar', hint: 'Hasil panen & tepi sungai', x: 1740, y: 680, w: 820, h: 420 },
  { id: 'kaca', name: 'Rumah Kaca', hint: 'Kelinci, ayam & bibit', x: 1740, y: 1100, w: 820, h: 1140 },
  { id: 'timur', name: 'Kebun Timur', hint: 'Petak subur & padang bunga', x: 2560, y: 680, w: 800, h: 1560 },
]

const INTERACTIVE_SPOTS = [
  {
    id: 'kios_panen',
    name: 'Kios Panen',
    x: 582,
    y: 444,
    coins: 0,
    xp: 0,
    cooldown: 0,
    opensHarvestStore: true,
    message: 'Jual hasil panenmu & tukar poin menjadi voucher diskon POTIVA!',
  },
  {
    id: 'toko',
    name: 'Toko POTIVA',
    x: 880,
    y: 448,
    coins: 0,
    xp: 0,
    cooldown: 0,
    opensShop: true,
    message: 'Selamat datang di Toko POTIVA!',
  },
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
  {
    id: 'kebun_selatan',
    name: 'Kebun Selatan',
    x: 1312,
    y: 1712,
    coins: 5,
    xp: 4,
    cooldown: 25000,
    message: 'Ladang selatan subur melimpah! +5 koin · +4 XP',
  },
  {
    id: 'taman_timur',
    name: 'Taman Sakura Timur',
    x: 2980,
    y: 440,
    coins: 6,
    xp: 5,
    cooldown: 28000,
    message: 'Angin kelopak sakura menyegarkan! +6 koin · +5 XP',
  },
]

// Solid world footprints (buildings, fences, cliffs)
const OBSTACLES = [
  { x: 470, y: 204, w: 224, h: 198 }, // Kios Panen POTIVA
  { x: 756, y: 204, w: 248, h: 202 }, // Toko POTIVA
  { x: 1112, y: 120, w: 336, h: 268 }, // Main Farmhouse
  { x: 2266, y: 180, w: 128, h: 192 }, // Windmill tower
  { x: 88, y: 1220, w: 240, h: 168 }, // Barn / Tool shed
  { x: 2000, y: 760, w: 224, h: 140 }, // Market stall
  { x: 2188, y: 1140, w: 256, h: 220 }, // Greenhouse
  // Top-left & top-east cliff walls
  { x: 56, y: 136, w: 288, h: 72 },
  { x: 2720, y: 158, w: 536, h: 72 },
  // Mid-left cliff wall split around wooden stairs (x: 292..392)
  { x: 0, y: 882, w: 292, h: 78 },
  { x: 392, y: 882, w: 64, h: 78 },
  // Ladang Utama fenced outer rails with 4 wide gates
  { x: 920, y: 612, w: 312, h: 24 }, // North-west rail
  { x: 1384, y: 612, w: 320, h: 24 }, // North-east rail
  { x: 920, y: 1204, w: 312, h: 24 }, // South-west rail
  { x: 1384, y: 1204, w: 320, h: 24 }, // South-east rail
  { x: 916, y: 612, w: 24, h: 244 }, // West-north rail
  { x: 916, y: 984, w: 24, h: 244 }, // West-south rail
  { x: 1684, y: 612, w: 24, h: 244 }, // East-north rail
  { x: 1684, y: 984, w: 24, h: 244 }, // East-south rail
  // Kebun Selatan fenced outer rails with 4 wide gates
  { x: 936, y: 1412, w: 320, h: 24 },
  { x: 1368, y: 1412, w: 312, h: 24 },
  { x: 936, y: 1980, w: 320, h: 24 },
  { x: 1368, y: 1980, w: 312, h: 24 },
  { x: 932, y: 1412, w: 24, h: 252 },
  { x: 932, y: 1768, w: 24, h: 236 },
  { x: 1660, y: 1412, w: 24, h: 252 },
  { x: 1660, y: 1768, w: 24, h: 236 },
]

const WEST_RIVER_WORLD = [
  [-40, 536],
  [368, 544],
  [560, 584],
  [648, 680],
  [656, 848],
  [624, 1144],
  [584, 1440],
  [544, 1776],
  [496, 2304],
]

const EAST_RIVER_WORLD = [
  [1872, -40],
  [1872, 496],
  [1952, 632],
  [2176, 696],
  [2608, 712],
  [2992, 736],
  [3424, 792],
]

const BRIDGES = [
  { x: 528, y: 728, w: 240, h: 120 }, // West wooden bridge
  { x: 1748, y: 272, w: 248, h: 128 }, // East stone arch bridge
  { x: 2776, y: 644, w: 140, h: 180 }, // East-South wooden footbridge
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
  { x: 110, y: 190, v: 'oak', s: 1.05 },
  { x: 290, y: 185, v: 'pine', s: 0.92 },
  { x: 165, y: 400, v: 'oak', s: 1.02 },
  { x: 1530, y: 190, v: 'pine', s: 0.95 },
  // Near farmhouse & sakura
  { x: 1620, y: 160, v: 'sakura', s: 1.15 },
  { x: 1730, y: 220, v: 'pine', s: 0.92 },
  // Near windmill, east sakura valley & east river
  { x: 2140, y: 165, v: 'apple', s: 1.05 },
  { x: 2480, y: 520, v: 'oak', s: 1.08 },
  { x: 2790, y: 155, v: 'sakura', s: 1.16 },
  { x: 3060, y: 160, v: 'sakura', s: 1.12 },
  { x: 3220, y: 380, v: 'orange', s: 1.08 },
  { x: 3210, y: 1120, v: 'oak', s: 1.06 },
  { x: 3230, y: 1560, v: 'sakura', s: 1.14 },
  { x: 3190, y: 2040, v: 'apple', s: 1.1 },
  // West meadow
  { x: 110, y: 580, v: 'apple', s: 1.05 },
  { x: 420, y: 600, v: 'orange', s: 1.0 },
  { x: 105, y: 1030, v: 'oak', s: 1.02 },
  { x: 120, y: 2090, v: 'apple', s: 1.06 },
  { x: 740, y: 1940, v: 'oak', s: 1.04 },
  // Near greenhouse & market
  { x: 2490, y: 960, v: 'sakura', s: 1.12 },
  // South orchard & botanical meadow
  { x: 1050, y: 2140, v: 'apple', s: 1.12 },
  { x: 1560, y: 2140, v: 'orange', s: 1.12 },
  { x: 760, y: 1520, v: 'oak', s: 1.0 },
  { x: 1920, y: 1680, v: 'apple', s: 1.04 },
  { x: 1940, y: 2060, v: 'orange', s: 1.08 },
  { x: 2560, y: 2110, v: 'sakura', s: 1.1 },
]

const WORLD_LAMPS = [
  { x: 830, y: 660 },
  { x: 1740, y: 820 },
  { x: 1740, y: 1160 },
  { x: 1780, y: 240 },
  { x: 2050, y: 260 },
  { x: 820, y: 1210 },
  { x: 1240, y: 1380 },
  { x: 1700, y: 1680 },
  { x: 2610, y: 860 },
  { x: 2610, y: 1580 },
  { x: 2910, y: 610 },
]

const WORLD_BENCHES = [
  { x: 1080, y: 470 },
  { x: 2150, y: 260 },
  { x: 2060, y: 1150 },
  { x: 1840, y: 1820 },
  { x: 3040, y: 520 },
  { x: 800, y: 1720 },
]

const WORLD_BIRDHOUSES = [
  { x: 350, y: 660 },
  { x: 650, y: 100 },
  { x: 2240, y: 380 },
  { x: 2020, y: 1240 },
  { x: 2940, y: 310 },
  { x: 1180, y: 2090 },
]

const WORLD_CRITTERS = [
  { kind: 'chicken', x: 860, y: 440, d: '0s' },
  { kind: 'chicken', x: 910, y: 465, d: '1.1s' },
  { kind: 'chicken', x: 1730, y: 220, d: '0.6s' },
  { kind: 'chicken', x: 760, y: 1780, d: '0.4s' },
  { kind: 'rabbit', x: 2010, y: 1210, d: '0.3s' },
  { kind: 'rabbit', x: 2090, y: 1270, d: '1.4s' },
  { kind: 'rabbit', x: 240, y: 115, d: '0.9s' },
  { kind: 'rabbit', x: 3090, y: 480, d: '0.5s' },
  { kind: 'duck', x: 2040, y: 560, d: '0s' },
  { kind: 'duck', x: 2480, y: 690, d: '1.5s' },
  { kind: 'duck', x: 120, y: 440, d: '0.8s' },
  { kind: 'duck', x: 3120, y: 740, d: '1.2s' },
  { kind: 'duck', x: 520, y: 2040, d: '0.7s' },
]

const WORLD_BUTTERFLIES = [
  [1040, 460, 0, '#f6b7a3'],
  [1310, 860, 2.4, '#ffe6a6'],
  [1580, 1400, 5.1, '#c7e59c'],
  [780, 740, 1.8, '#bfe0f5'],
  [2160, 960, 4.2, '#f7b4c8'],
  [360, 1180, 6.3, '#ffe6a6'],
  [1310, 1720, 1.5, '#c7e59c'],
  [2880, 1340, 3.1, '#f7b4c8'],
  [2980, 450, 0.9, '#ffe6a6'],
  [290, 1840, 4.7, '#bfe0f5'],
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

function PixelMinimap({ plants, dew, peers, playerDotRef, peerDotsRef }) {
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
        <rect x="2776" y="644" width="140" height="180" fill="#c78c52" />
        {/* Fenced & Tilled Gardens */}
        <rect x="928" y="624" width="768" height="592" fill="#8d5935" stroke="#c88c58" strokeWidth="24" />
        <rect x="944" y="1424" width="728" height="568" fill="#8d5935" stroke="#c88c58" strokeWidth="24" />
        <rect x="2696" y="976" width="392" height="240" fill="#8d5935" />
        <rect x="2696" y="1264" width="392" height="240" fill="#8d5935" />
        <rect x="2176" y="1672" width="344" height="240" fill="#8d5935" />
        <rect x="2696" y="1672" width="392" height="240" fill="#8d5935" />
        <rect x="160" y="1696" width="288" height="272" fill="#8d5935" />
        {/* Buildings */}
        <rect x="470" y="204" width="224" height="198" fill="#d9793b" />
        <rect x="756" y="204" width="248" height="202" fill="#2f7e4d" />
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
        {/* Remote online players */}
        {peers.map((peer) => (
          <circle
            key={peer.peerId}
            ref={(el) => {
              if (el) peerDotsRef.current.set(peer.peerId, el)
              else peerDotsRef.current.delete(peer.peerId)
            }}
            cx={Math.round(peer.x)}
            cy={Math.round(peer.y)}
            r="56"
            fill="#ff7aa8"
            stroke="#3a2315"
            strokeWidth="18"
          />
        ))}
        {/* Local player dot updated directly in RAF */}
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
  if (kind === 'plant') {
    return (
      <span className="g-fx g-fx--plant" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
        <b>✦</b>
        <b>✦</b>
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

const getFsElement = () =>
  typeof document !== 'undefined'
    ? document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      null
    : null

const exitNativeFs = async () => {
  if (typeof document === 'undefined' || !getFsElement()) return
  try {
    if (document.exitFullscreen) await document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen()
    else if (document.msExitFullscreen) document.msExitFullscreen()
  } catch {
    /* ignore */
  }
}

const isIOSDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

export default function GardenGame({ plants, onClose }) {
  const {
    user,
    guest,
    wallet,
    actions,
    ownedCosmetics,
    potiLook,
    seedInventory = {},
    supplyInventory = {},
    harvestBasket = [],
    harvestPoints = 0,
    vouchers = [],
    cartCount = 0,
  } = useApp()
  const { isDark, toggleTheme } = useUI()
  const navigate = useNavigate()
  const [guestTag] = useState(() => Math.floor(10 + Math.random() * 89))
  const myPlayerName = user?.name && !guest ? user.name : `Tamu #${guestTag}`
  const [phase, setPhase] = useState('intro')
  const [portrait, setPortrait] = useState(
    () => typeof window !== 'undefined' && window.innerHeight > window.innerWidth,
  )
  const [allowPortrait, setAllowPortrait] = useState(false)
  const [nativeFs, setNativeFs] = useState(() => Boolean(getFsElement()))
  const [immersiveFs, setImmersiveFs] = useState(false)
  const isFs = nativeFs || immersiveFs
  const [viewport, setViewport] = useState({ w: 1280, h: 720 })
  const [activeId, setActiveId] = useState(null)
  const [activeSlot, setActiveSlot] = useState(null)
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
  const [stats, setStats] = useState({ care: 0, water: 0, dew: 0, pet: 0, harvest: 0 })
  const [wardrobeOpen, setWardrobeOpen] = useState(false)
  const [seedBagOpen, setSeedBagOpen] = useState(false)
  const [harvestOpen, setHarvestOpen] = useState(false)
  const [harvestStoreOpen, setHarvestStoreOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [shopCat, setShopCat] = useState('Semua')
  const [carrying, setCarrying] = useState(null)
  const [plantingAnim, setPlantingAnim] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatText, setChatText] = useState('')
  const [targetSlot, setTargetSlot] = useState(null)
  const [zone, setZone] = useState(() => zoneAt(START.x, START.y))
  const [spotCooldowns, setSpotCooldowns] = useState({})
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)

  const rootRef = useRef(null)
  const viewRef = useRef(null)
  const worldRef = useRef(null)
  const playerEl = useRef(null)
  const playerDotRef = useRef(null)
  const peerElsRef = useRef(new Map())
  const peerDotsRef = useRef(new Map())
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
  const activeSlotRef = useRef(null)
  const phaseRef = useRef(phase)
  const viewportRef = useRef(viewport)
  const plantsRef = useRef([])
  const emptySlotsRef = useRef([])
  const dewRef = useRef(dew)
  const needsRef = useRef(needs)
  const sleepingRef = useRef(sleeping)
  const wardrobeRef = useRef(false)
  const pendingSpot = useRef(null)
  const pendingPlotRef = useRef(null)
  const spotCooldownsRef = useRef(spotCooldowns)
  const spotFnRef = useRef(() => {})
  const zoneRef = useRef(zoneAt(START.x, START.y))
  const actRef = useRef(() => {})
  const careRef = useRef(() => {})
  const collectRef = useRef(() => {})
  const harvestFnRef = useRef(() => {})
  const openSeedFnRef = useRef(() => {})
  const openHarvestFnRef = useRef(() => {})
  const openHarvestStoreFnRef = useRef(() => {})
  const openShopFnRef = useRef(() => {})
  const fxTimer = useRef(null)
  const petFxTimer = useRef(null)
  const reactionTimer = useRef(null)
  const bubbleTimer = useRef(null)
  const sleepTimer = useRef(null)
  const markerTimer = useRef(null)
  const blinkTimer = useRef(null)
  const plantAnimTimer = useRef(null)
  const questAwarded = useRef(false)
  const allowPortraitRef = useRef(false)
  const wasNativeFsRef = useRef(false)
  const exitingFsRef = useRef(false)

  phaseRef.current = phase
  allowPortraitRef.current = allowPortrait
  viewportRef.current = viewport
  dewRef.current = dew
  needsRef.current = needs
  sleepingRef.current = sleeping
  wardrobeRef.current =
    wardrobeOpen || seedBagOpen || harvestOpen || harvestStoreOpen || shopOpen
  spotCooldownsRef.current = spotCooldowns

  const supportsFs = useMemo(
    () =>
      typeof document !== 'undefined' &&
      Boolean(
        document.fullscreenEnabled ||
          document.webkitFullscreenEnabled ||
          typeof document.documentElement?.requestFullscreen === 'function' ||
          typeof document.documentElement?.webkitRequestFullscreen === 'function',
      ),
    [],
  )

  const scale = clamp(viewport.h / 780, 0.62, 1.16)
  const minZoom = useMemo(
    () => clamp(Math.min(0.9, Math.max(viewport.w / WORLD.w, viewport.h / WORLD.h)), 0.36, 0.9),
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

  const { placed, emptySlots } = useMemo(() => {
    const used = new Set()
    const items = plants.map((plant, index) => {
      let sIdx = plant.slotIndex
      if (sIdx == null || used.has(sIdx)) {
        sIdx = Array.from({ length: PLANT_SLOTS.length }, (_, i) => i).find((i) => !used.has(i))
        if (sIdx == null) sIdx = index % PLANT_SLOTS.length
      }
      used.add(sIdx)
      const slot = PLANT_SLOTS[sIdx % PLANT_SLOTS.length]
      const lap = Math.floor(index / PLANT_SLOTS.length)
      return {
        ...plant,
        slotIndex: sIdx,
        x: clamp(slot.x + lap * 80, 120, WORLD.w - 120),
        y: clamp(slot.y + lap * 64, 240, WORLD.h - 90),
      }
    })
    const empties = PLANT_SLOTS
      .map((pos, idx) => ({ slotIndex: idx, ...pos }))
      .filter((s) => !used.has(s.slotIndex))
    return { placed: items, emptySlots: empties }
  }, [plants])
  plantsRef.current = placed
  emptySlotsRef.current = emptySlots

  const totalSeeds = useMemo(
    () => Object.values(seedInventory).reduce((sum, n) => sum + (n || 0), 0),
    [seedInventory],
  )
  const activeVouchers = useMemo(() => vouchers.filter((v) => !v.used), [vouchers])
  const seedProducts = useMemo(() => PRODUCTS.filter((p) => p.speciesId), [])

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

  const {
    status: mpStatus,
    peers,
    remoteMapRef,
    broadcastState,
  } = useGardenMultiplayer({
    enabled: phase === 'playing',
    playerName: myPlayerName,
    initialState: {
      x: player.current.x,
      y: player.current.y,
      facing: player.current.facing,
      look: potiLook,
      expression,
      carry: carrying?.kind || null,
      bubble: bubble?.text || null,
    },
  })
  const broadcastRef = useRef(broadcastState)
  broadcastRef.current = broadcastState

  useEffect(() => {
    broadcastRef.current(
      {
        name: myPlayerName,
        look: potiLook,
        expression,
        carry: carrying?.kind || null,
        bubble: bubble?.text || null,
      },
      true,
    )
  }, [myPlayerName, potiLook, expression, carrying, bubble])

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
    setSeedBagOpen(false)
    setHarvestOpen(false)
    setShopOpen(false)
    setWardrobeOpen(true)
  }, [])

  const closeWardrobe = useCallback(() => setWardrobeOpen(false), [])

  const openSeedBag = useCallback((slotIdx = null) => {
    if (phaseRef.current !== 'playing' || sleepingRef.current) return
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setWardrobeOpen(false)
    setHarvestOpen(false)
    setShopOpen(false)
    setTargetSlot(slotIdx ?? activeSlotRef.current)
    setSeedBagOpen(true)
  }, [])
  openSeedFnRef.current = openSeedBag

  const openHarvest = useCallback(() => {
    if (phaseRef.current !== 'playing' || sleepingRef.current) return
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setWardrobeOpen(false)
    setSeedBagOpen(false)
    setShopOpen(false)
    setHarvestStoreOpen(false)
    setHarvestOpen(true)
  }, [])
  openHarvestFnRef.current = openHarvest

  const openHarvestStore = useCallback(() => {
    if (phaseRef.current !== 'playing' || sleepingRef.current) return
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setWardrobeOpen(false)
    setSeedBagOpen(false)
    setShopOpen(false)
    setHarvestOpen(false)
    setHarvestStoreOpen(true)
  }, [])
  openHarvestStoreFnRef.current = openHarvestStore

  const openShop = useCallback((cat = 'Semua') => {
    if (phaseRef.current !== 'playing' || sleepingRef.current) return
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setWardrobeOpen(false)
    setSeedBagOpen(false)
    setHarvestOpen(false)
    setHarvestStoreOpen(false)
    if (typeof cat === 'string') setShopCat(cat)
    setShopOpen(true)
  }, [])
  openShopFnRef.current = openShop

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
      if (spot.opensHarvestStore) {
        openHarvestStoreFnRef.current()
        return
      }
      if (spot.opensShop) {
        openShopFnRef.current()
        return
      }
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
      if (
        phaseRef.current !== 'playing' ||
        (portrait && !allowPortraitRef.current) ||
        sleepingRef.current ||
        wardrobeRef.current
      )
        return
      pendingSpot.current = null
      pendingPlotRef.current = null
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

  const goToEmptyPlot = useCallback(
    (slot) => {
      if (phaseRef.current !== 'playing' || (portrait && !allowPortraitRef.current)) return
      const p = player.current
      if (Math.hypot(slot.x - p.x, slot.y - p.y) < REACH) {
        pendingPlotRef.current = null
        openSeedBag(slot.slotIndex)
        return
      }
      goTo(slot.x, slot.y + 30, `Menuju petak #${slot.slotIndex + 1}`)
      pendingPlotRef.current = slot.slotIndex
    },
    [goTo, openSeedBag, portrait],
  )

  const goToSpot = useCallback(
    (spot) => {
      if (phaseRef.current !== 'playing' || (portrait && !allowPortraitRef.current)) return
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
      if (phaseRef.current !== 'playing' || (portrait && !allowPortraitRef.current)) return
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
      window.clearTimeout(plantAnimTimer.current)
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
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', update)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (portrait && !allowPortrait && phaseRef.current === 'playing') setPhase('paused')
  }, [portrait, allowPortrait])

  useEffect(() => {
    document.documentElement.classList.toggle('g-fs-lock', isFs)
    document.body.classList.toggle('g-fs-lock', isFs)
    return () => {
      document.documentElement.classList.remove('g-fs-lock')
      document.body.classList.remove('g-fs-lock')
    }
  }, [isFs])

  useEffect(() => {
    if (phase === 'intro' && !portrait) introBtnRef.current?.focus?.()
  }, [phase, portrait])

  useEffect(() => {
    if (phase === 'playing') return
    setWardrobeOpen(false)
    setSeedBagOpen(false)
    setHarvestOpen(false)
    setHarvestStoreOpen(false)
    setShopOpen(false)
    setChatOpen(false)
    pendingSpot.current = null
    stick.current = { x: 0, y: 0 }
    waypoint.current = null
    keys.current.clear()
    setMarker(null)
    setSleeping(false)
    setBubble(null)
  }, [phase])

  const tryNativeFs = useCallback(async (target) => {
    if (!target) return false
    try {
      if (typeof target.requestFullscreen === 'function') {
        try {
          await target.requestFullscreen({ navigationUI: 'hide' })
        } catch {
          await target.requestFullscreen()
        }
        return Boolean(getFsElement())
      }
      if (typeof target.webkitRequestFullscreen === 'function') {
        await target.webkitRequestFullscreen()
        return Boolean(getFsElement())
      }
      if (typeof target.webkitRequestFullScreen === 'function') {
        await target.webkitRequestFullScreen()
        return Boolean(getFsElement())
      }
      if (typeof target.mozRequestFullScreen === 'function') {
        await target.mozRequestFullScreen()
        return Boolean(getFsElement())
      }
      if (typeof target.msRequestFullscreen === 'function') {
        await target.msRequestFullscreen()
        return Boolean(getFsElement())
      }
    } catch {
      /* ignore native fullscreen rejection (e.g. iOS Safari or in-app browser) */
    }
    return Boolean(getFsElement())
  }, [])

  const requestFullscreen = useCallback(
    async ({ notify = false } = {}) => {
      setImmersiveFs(true)
      let enteredNative = Boolean(getFsElement())
      if (!enteredNative) {
        enteredNative = await tryNativeFs(rootRef.current)
      }
      if (!enteredNative) {
        enteredNative = await tryNativeFs(document.documentElement)
      }
      if (enteredNative) {
        wasNativeFsRef.current = true
        setNativeFs(true)
      }
      try {
        if (screen.orientation?.lock) await screen.orientation.lock('landscape')
      } catch {
        /* ignore */
      }
      window.requestAnimationFrame(() => {
        try {
          window.scrollTo(0, 1)
        } catch {
          /* ignore */
        }
        const el = rootRef.current
        if (el) setViewport({ w: el.clientWidth || window.innerWidth, h: el.clientHeight || window.innerHeight })
      })
      if (notify) {
        if (enteredNative) {
          say('Mode layar penuh aktif! 📱✨', 2200)
        } else if (isIOSDevice()) {
          say('Layar diperluas! Untuk penuh 100% di iPhone: ketuk "AA" → Sembunyikan Toolbar atau Bagikan → Tambah ke Layar Utama.', 4200)
        } else {
          say('Mode layar penuh aktif!', 2200)
        }
      }
    },
    [say, tryNativeFs],
  )

  const close = useCallback(() => {
    exitingFsRef.current = true
    wasNativeFsRef.current = false
    setImmersiveFs(false)
    void exitNativeFs()
    try {
      screen.orientation?.unlock?.()
    } catch {
      /* ignore */
    }
    document.documentElement.classList.remove('g-fs-lock')
    document.body.classList.remove('g-fs-lock')
    onClose()
  }, [onClose])

  useEffect(() => {
    const onChange = () => {
      const activeFs = Boolean(getFsElement())
      setNativeFs(activeFs)
      if (activeFs) {
        wasNativeFsRef.current = true
        setImmersiveFs(true)
      }
      const el = rootRef.current
      if (el) setViewport({ w: el.clientWidth || window.innerWidth, h: el.clientHeight || window.innerHeight })
      if (!activeFs) {
        if (exitingFsRef.current) {
          exitingFsRef.current = false
          return
        }
        if (wasNativeFsRef.current) {
          wasNativeFsRef.current = false
          setImmersiveFs(false)
          if (phaseRef.current === 'playing') setPhase('paused')
        }
      }
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    document.addEventListener('mozfullscreenchange', onChange)
    document.addEventListener('MSFullscreenChange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
      document.removeEventListener('mozfullscreenchange', onChange)
      document.removeEventListener('MSFullscreenChange', onChange)
    }
  }, [])

  const start = async () => {
    setPhase('playing')
    say('Halo! Selamat datang di Kebun Pixel Poti 🌱', 3400)
    await requestFullscreen()
  }

  const toggleFullscreen = async () => {
    if (isFs) {
      exitingFsRef.current = true
      wasNativeFsRef.current = false
      setImmersiveFs(false)
      await exitNativeFs()
      try {
        screen.orientation?.unlock?.()
      } catch {
        /* ignore */
      }
      const el = rootRef.current
      if (el) setViewport({ w: el.clientWidth || window.innerWidth, h: el.clientHeight || window.innerHeight })
      say('Keluar dari mode layar penuh.', 1800)
      window.setTimeout(() => {
        exitingFsRef.current = false
      }, 250)
      return
    }
    await requestFullscreen({ notify: true })
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
      setReaction(null)
      showPetFx('sleep', 4200)
      say('Hop… zzz… tidur nyenyak dulu ya 🛏️', 3800)
      actions.collectBonus(0, 5)
      window.clearTimeout(sleepTimer.current)
      sleepTimer.current = window.setTimeout(() => {
        setSleeping(false)
        setPetFx(null)
        react('happy')
        say('Aku segar! 🌞', 2400)
      }, 4200)
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
      if (carrying?.kind === 'fertilizer' || carrying?.kind === 'care') {
        const applied = actions.useSupplyOnPlant(carrying.productId, active.id)
        if (applied) {
          burst(active.id, carrying.productId === 'sprayer' ? 'water' : 'feed')
          react('happy')
          say(`Memakai ${carrying.label} pada ${active.name}! +25 XP`, 2600)
          setCarrying(null)
          return
        }
      }
      if (feedCd > 0) return
      actions.feedPlant(active.id)
      burst(active.id, 'feed')
      say(`Pupuk ${active.name} · +20 XP · +15 koin`, 2600)
    }
  }
  actRef.current = act

  const harvestActive = useCallback(() => {
    if (phaseRef.current !== 'playing' || wardrobeRef.current) return
    if (sleepingRef.current) {
      wake()
      return
    }
    if (!active || active.growth < 85) {
      say(
        active
          ? `${active.name} masih ${active.growth}%. Rawat sampai 85%+ untuk panen!`
          : 'Dekati tanaman yang siap panen (85%+) dulu.',
        2400,
      )
      return
    }
    const result = actions.harvestPlant(active.id)
    if (!result) return
    setStats((s) => ({ ...s, harvest: s.harvest + 1 }))
    react('happy')
    cheerWorld()
    flash(`Panen ${result.emoji} ${result.name}! +35 XP · +25 koin · Tukar voucher di 🌾`, 'cheer')
  }, [actions, active, cheerWorld, flash, react, say, wake])
  harvestFnRef.current = harvestActive

  const triggerPlantingAnim = useCallback((plantId) => {
    setPlantingAnim(true)
    window.clearTimeout(plantAnimTimer.current)
    plantAnimTimer.current = window.setTimeout(() => setPlantingAnim(false), 850)
    if (plantId) burst(plantId, 'plant')
  }, [burst])

  const plantFromBag = useCallback((speciesId, overrideSlot = null) => {
    const slot = overrideSlot ?? targetSlot ?? activeSlotRef.current
    const newId = actions.plantSeedInGarden(speciesId, slot)
    if (!newId) return
    const sp = SPECIES.find((s) => s.id === speciesId)
    setSeedBagOpen(false)
    setTargetSlot(null)
    setCarrying((cur) => (cur?.kind === 'seed' && cur.speciesId === speciesId ? null : cur))
    triggerPlantingAnim(newId)
    react('happy')
    say(`Menanam ${sp?.name || 'tanaman baru'}! Siram & pupuk sampai panen 🌱`, 2800)
  }, [actions, react, say, targetSlot, triggerPlantingAnim])

  const buyShopWithCoins = (item) => {
    if (item.cosmetic) {
      if (ownedCosmetics.includes(item.id)) {
        actions.equipCosmetic(item.id)
        say(`${item.name} langsung dipakai Poti! ✨`, 2400)
      } else if (wallet.coins >= item.coinPrice) {
        actions.buyCosmeticWithCoins(item.id)
        say(`${item.name} terbuka dan langsung dipakai Poti! ✨`, 2600)
      }
      return
    }
    if (item.speciesId) {
      const ok = actions.buySeedWithCoins(item.id)
      if (!ok) return
      setShopOpen(false)
      setCarrying({
        kind: 'seed',
        productId: item.id,
        speciesId: item.speciesId,
        label: item.name,
      })
      react('happy')
      say(`Membawa ${item.name}! Dekati petak kosong lalu tekan T untuk tanam 🌱`, 3400)
      return
    }
    if (item.category === 'Perawatan' && item.coinPrice) {
      const ok = actions.buySupplyWithCoins(item.id)
      if (!ok) return
      setShopOpen(false)
      setCarrying({
        kind: item.id === 'pupuk-organik' || item.id === 'tanah-media' ? 'fertilizer' : 'care',
        productId: item.id,
        label: item.name,
      })
      react('happy')
      say(`Memikul ${item.name}! Dekati tanaman lalu tekan F untuk pakai`, 3400)
    }
  }

  const addShopToCart = (item) => {
    actions.addToCart(item.id)
    setShopOpen(false)
    const kind = item.speciesId
      ? 'seed'
      : item.category === 'Perawatan'
        ? 'fertilizer'
        : 'pot'
    setCarrying({
      kind,
      productId: item.id,
      speciesId: item.speciesId || null,
      label: item.name,
    })
    react('happy')
    say(`${item.name} masuk keranjang & dibawa Poti! 🛒`, 3000)
  }

  const redeemVoucher = (tplId) => {
    const vc = actions.redeemHarvestVoucher(tplId)
    if (!vc) return
    react('happy')
    say(`Voucher ${vc.code} (${vc.discount}% OFF) berhasil ditukar! 🎉`, 3000)
  }

  const sellHarvest = (harvestId) => {
    const sold = actions.sellHarvestItem(harvestId)
    if (!sold) return
    react('happy')
    flash(`Terjual ${sold.emoji} ${sold.name}! +${sold.points} Poin Panen · +10 koin ⭐`, 'cheer')
  }

  const sellAllHarvests = () => {
    const sum = actions.sellAllHarvest()
    if (!sum) return
    react('happy')
    cheerWorld()
    flash(
      `Terjual ${sum.count} hasil panen! +${sum.pointsEarned} Poin Panen · +${sum.coinsEarned} koin ⭐`,
      'cheer',
    )
  }

  const redeemPointsVoucher = (tplId) => {
    const vc = actions.redeemPointsForVoucher(tplId)
    if (!vc) return
    react('happy')
    cheerWorld()
    flash(`Voucher ${vc.code} (-${vc.discount}%) berhasil ditukar dengan Poin! 🎟️`, 'cheer')
  }

  const downloadVoucher = (vc) => {
    const ok = downloadCuteVoucherImage(vc, myPlayerName)
    if (ok) {
      say(`Gambar voucher ${vc.code} terunduh! Cek folder Downloadmu 🎀`, 2800)
    }
  }

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') setChatOpen(false)
        return
      }
      const k = e.key.toLowerCase()
      if (wardrobeRef.current) {
        if (k === 'g') setWardrobeOpen(false)
        if (k === 'b') setSeedBagOpen(false)
        if (k === 'v') setHarvestOpen(false)
        if (k === 'k') setHarvestStoreOpen(false)
        if (k === 'm') setShopOpen(false)
        return
      }
      const movement = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
      if (movement.includes(k) || k === ' ') e.preventDefault()
      if (movement.includes(k)) keys.current.add(k)
      if (phaseRef.current !== 'playing' || e.repeat) return
      if (k === 'g') openWardrobe()
      if (k === 'm') openShopFnRef.current()
      if (k === 'k') openHarvestStoreFnRef.current()
      if (k === 'b') openSeedFnRef.current(activeSlotRef.current)
      if (k === 't') {
        if (carrying?.kind === 'seed' && carrying.speciesId && activeSlotRef.current != null) {
          plantFromBag(carrying.speciesId, activeSlotRef.current)
        } else {
          openSeedFnRef.current(activeSlotRef.current)
        }
      }
      if (k === 'v') openHarvestFnRef.current()
      if (k === 'h') harvestFnRef.current()
      if (k === 'c') setChatOpen((o) => !o)
      if (k === 'n') toggleTheme()
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
        setSeedBagOpen(false)
        setHarvestOpen(false)
        setHarvestStoreOpen(false)
        setShopOpen(false)
        return
      }
      if (chatOpen) {
        setChatOpen(false)
        return
      }
      if (getFsElement()) return
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
            const plotSlot = pendingPlotRef.current
            if (plotSlot != null) {
              pendingPlotRef.current = null
              openSeedFnRef.current(plotSlot)
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

        let nearEmpty = null
        let bestEmpty = REACH
        if (!nearest) {
          for (const slot of emptySlotsRef.current) {
            const dist = Math.hypot(slot.x - p.x, slot.y - p.y)
            if (dist < bestEmpty) {
              bestEmpty = dist
              nearEmpty = slot.slotIndex
            }
          }
        }
        if (nearEmpty !== activeSlotRef.current) {
          activeSlotRef.current = nearEmpty
          setActiveSlot(nearEmpty)
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

      if (phaseRef.current === 'playing') {
        broadcastRef.current({
          x: p.x,
          y: p.y,
          facing: p.facing,
          moving: isMoving,
        })
      }

      // Smoothly interpolate all remote WebRTC players in the world
      const peerLerp = Math.min(1, dt * 12)
      remoteMapRef.current.forEach((rp, peerId) => {
        rp.curX += (rp.targetX - rp.curX) * peerLerp
        rp.curY += (rp.targetY - rp.curY) * peerLerp
        const el = peerElsRef.current.get(peerId)
        if (el) {
          el.style.transform = `translate3d(${rp.curX}px, ${rp.curY}px, 0)`
          el.style.setProperty('--flip', rp.facing)
          el.style.zIndex = String(Math.round(rp.curY))
          el.classList.toggle('is-moving', rp.moving)
        }
        const dot = peerDotsRef.current.get(peerId)
        if (dot) {
          dot.setAttribute('cx', String(Math.round(rp.curX)))
          dot.setAttribute('cy', String(Math.round(rp.curY)))
        }
      })

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
      className={`game game--pixel ${sleeping ? 'is-sleeping' : ''} ${
        isDark ? 'is-night' : ''
      } ${isFs ? 'is-fullscreen' : ''} ${portrait && allowPortrait ? 'is-portrait-play' : ''}`}
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
            <span style={{ left: 530, top: 1760 }} />
            <span style={{ left: 1870, top: 160 }} />
            <span style={{ left: 2150, top: 690 }} />
            <span style={{ left: 2990, top: 730 }} />
            <span style={{ left: 3250, top: 775 }} />
          </div>

          {/* Pixel-art Buildings */}
          <div
            className="g-px-building-wrap g-px-building-wrap--interactive"
            style={{ left: 448, top: 132, width: 268, height: 274, zIndex: 380 }}
            role="button"
            tabIndex={0}
            aria-label="Masuk ke Kios Panen POTIVA"
            onClick={(event) => {
              event.stopPropagation()
              const kiosSpot = INTERACTIVE_SPOTS.find((s) => s.id === 'kios_panen')
              if (kiosSpot) goToSpot(kiosSpot)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              event.stopPropagation()
              const kiosSpot = INTERACTIVE_SPOTS.find((s) => s.id === 'kios_panen')
              if (kiosSpot) goToSpot(kiosSpot)
            }}
          >
            <PixelHarvestStoreBuilding />
          </div>
          <div
            className="g-px-building-wrap g-px-building-wrap--interactive"
            style={{ left: 724, top: 132, width: 312, height: 296, zIndex: 380 }}
            role="button"
            tabIndex={0}
            aria-label="Masuk ke Toko POTIVA"
            onClick={(event) => {
              event.stopPropagation()
              const shopSpot = INTERACTIVE_SPOTS.find((s) => s.id === 'toko')
              if (shopSpot) goToSpot(shopSpot)
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              event.stopPropagation()
              const shopSpot = INTERACTIVE_SPOTS.find((s) => s.id === 'toko')
              if (shopSpot) goToSpot(shopSpot)
            }}
          >
            <PixelShopBuilding />
          </div>
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

          {/* Empty Fenced Garden Plots (ready for planting seeds from POTIVA Shop) */}
          {emptySlots.map((slot) => (
            <button
              key={`empty-${slot.slotIndex}`}
              type="button"
              className={`g-plot-empty ${activeSlot === slot.slotIndex ? 'is-active' : ''}`}
              style={{ left: slot.x, top: slot.y, zIndex: Math.round(slot.y) - 5 }}
              onClick={(event) => {
                event.stopPropagation()
                const p = player.current
                if (
                  carrying?.kind === 'seed' &&
                  carrying.speciesId &&
                  Math.hypot(slot.x - p.x, slot.y - p.y) < REACH
                ) {
                  plantFromBag(carrying.speciesId, slot.slotIndex)
                  return
                }
                goToEmptyPlot(slot)
              }}
              aria-label={`Petak kosong #${slot.slotIndex + 1}, klik untuk tanam benih`}
            >
              <span className="g-plot-empty__soil" />
              <span className="g-plot-empty__tag">
                <Plus size={11} /> {carrying?.kind === 'seed' ? 'Tanam disini' : 'Tanam'}
              </span>
            </button>
          ))}

          {/* POTIVA Plants inside Pixel Planter Beds */}
          {placed.map((plant) => {
            const readyHarvest = plant.growth >= 85
            return (
              <div
                key={plant.id}
                className={`g-plant g-plant--pixel ${activeId === plant.id ? 'is-active' : ''} ${
                  readyHarvest ? 'is-harvestable' : ''
                } ${fx?.plantId === plant.id && fx.kind === 'plant' ? 'is-just-planted' : ''} ${
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
                {readyHarvest && (
                  <span className="g-plant__harvest" aria-hidden="true">
                    <Wheat size={11} /> Panen!
                  </span>
                )}
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
                  <strong>
                    {plant.name} · {plant.growth}%
                  </strong>
                  {needsBars(plant)}
                  {activeId === plant.id && (
                    <em>
                      {readyHarvest
                        ? 'Siap panen! Tekan H'
                        : 'Tekan E siram · F pupuk'}
                    </em>
                  )}
                </div>
              </div>
            )
          })}

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

          {/* Remote Online Players (WebRTC P2P) */}
          {peers.map((peer) => (
            <div
              key={peer.peerId}
              className="g-player g-player--remote"
              ref={(el) => {
                if (el) peerElsRef.current.set(peer.peerId, el)
                else peerElsRef.current.delete(peer.peerId)
              }}
              style={{
                '--art': `${playerArt}px`,
                transform: `translate3d(${peer.x}px, ${peer.y}px, 0)`,
                zIndex: Math.round(peer.y),
              }}
              aria-label={`Pemain online: ${peer.name}`}
            >
              <span className="g-player__shadow" aria-hidden="true" />
              {peer.bubble && <span className="g-player__bubble">{peer.bubble}</span>}
              <div className="g-player__inner" style={{ width: playerArt }}>
                <div className="g-player__body">
                  <Mascot
                    size={playerArt}
                    expression={peer.expression || 'happy'}
                    blink={false}
                    waving={false}
                    look={peer.look || {}}
                  />
                  {peer.carry && (
                    <span className="g-player__carry" aria-hidden="true">
                      <PotiCarryProp kind={peer.carry} />
                    </span>
                  )}
                </div>
              </div>
              <span className="g-player__name g-player__name--remote">{peer.name}</span>
            </div>
          ))}

          {/* Poti Character */}
          <div
            className={`g-player ${sleeping ? 'is-sleeping' : ''}`}
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
              className={`g-player__inner ${sleeping ? 'is-sleeping' : reaction ? 'is-cheer' : ''} ${
                plantingAnim ? 'is-planting' : ''
              }`}
              key={sleeping ? 'sleep' : reaction ? reaction.key : 'idle'}
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
              {sleeping && (
                <span className="g-sleep-pillow" aria-hidden="true">
                  <PotiSleepPillow />
                </span>
              )}
              <div className="g-player__body">
                <Mascot
                  size={playerArt}
                  expression={expression}
                  blink={blink}
                  waving={false}
                  look={potiLook}
                />
                {carrying && !sleeping && (
                  <span className="g-player__carry" aria-hidden="true">
                    <PotiCarryProp kind={carrying.kind} />
                  </span>
                )}
              </div>
              {sleeping && (
                <span className="g-sleep-blanket" aria-hidden="true">
                  <PotiSleepBlanket />
                </span>
              )}
            </div>
            <span className="g-player__name">{myPlayerName}</span>
          </div>
        </div>
      </div>

      {!isDark && <div className="g-sunrays" aria-hidden="true" />}
      {isDark && (
        <div className="g-nightveil" aria-hidden="true">
          <div className="g-moon" aria-hidden="true">
            <span className="g-moon__halo" />
            <svg className="g-moon__svg" viewBox="0 0 64 64">
              <defs>
                <radialGradient id="potiMoonGrad" cx="38%" cy="34%" r="65%">
                  <stop offset="0%" stopColor="#fffbe4" />
                  <stop offset="68%" stopColor="#fae79c" />
                  <stop offset="100%" stopColor="#e5c86b" />
                </radialGradient>
              </defs>
              <circle cx="32" cy="32" r="22" fill="url(#potiMoonGrad)" />
              <circle cx="24" cy="24" r="3.4" fill="rgba(189, 152, 68, 0.28)" />
              <circle cx="39" cy="36" r="4.6" fill="rgba(189, 152, 68, 0.24)" />
              <circle cx="27" cy="40" r="2.2" fill="rgba(189, 152, 68, 0.22)" />
            </svg>
          </div>
          <span className="g-night-star g-night-star--1">✦</span>
          <span className="g-night-star g-night-star--2">✧</span>
          <span className="g-night-star g-night-star--3">✦</span>
          <span className="g-night-star g-night-star--4">·</span>
          <span className="g-night-star g-night-star--5">✦</span>
          <span className="g-night-star g-night-star--6">✧</span>
        </div>
      )}
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
            className="g-icon-btn g-icon-btn--shop"
            onClick={() => openShop('Semua')}
            aria-label="Buka Toko POTIVA"
            title="Toko POTIVA (M)"
          >
            <Store size={19} />
            {cartCount > 0 && <span className="g-hud-badge">{cartCount}</span>}
          </button>
          <button
            type="button"
            className="g-icon-btn g-icon-btn--kios"
            onClick={openHarvestStore}
            aria-label={`Buka Kios Panen & Poin (${harvestBasket.length} panen, ${harvestPoints} poin)`}
            title="Kios Panen & Tukar Poin (K)"
          >
            <Wheat size={19} />
            {harvestBasket.length > 0 && (
              <span className="g-hud-badge g-hud-badge--gold">{harvestBasket.length}</span>
            )}
          </button>
          <button
            type="button"
            className="g-icon-btn g-icon-btn--style"
            onClick={openWardrobe}
            aria-label="Buka lemari gaya Poti"
            title="Lemari Gaya (G)"
          >
            <Shirt size={19} />
          </button>
          <button
            type="button"
            className="g-icon-btn g-icon-btn--seed"
            onClick={() => openSeedBag(activeSlot)}
            aria-label={`Buka Tas Benih (${totalSeeds} benih)`}
            title="Tas Benih / Tanam (B)"
          >
            <Sprout size={19} />
            {totalSeeds > 0 && <span className="g-hud-badge">{totalSeeds}</span>}
          </button>
          <button
            type="button"
            className="g-icon-btn g-icon-btn--harvest"
            onClick={openHarvest}
            aria-label={`Keranjang Panen & Voucher (${harvestBasket.length} panen)`}
            title="Panen & Tukar Voucher (V)"
          >
            <Ticket size={19} />
            {(harvestBasket.length > 0 || activeVouchers.length > 0) && (
              <span className="g-hud-badge g-hud-badge--gold">
                {harvestBasket.length > 0 ? harvestBasket.length : activeVouchers.length}
              </span>
            )}
          </button>
        </div>
        <div className="g-hud__right">
          <span
            className={`g-chip g-online-chip is-${mpStatus}`}
            title="Multiplayer WebRTC P2P tanpa login"
          >
            <Users size={13} />
            <span>
              {mpStatus === 'online'
                ? `${peers.length + 1} online`
                : mpStatus === 'connecting'
                  ? 'Menghubungkan…'
                  : 'Mode solo'}
            </span>
          </span>
          <button
            type="button"
            className="g-icon-btn g-icon-btn--chat"
            onClick={() => setChatOpen((o) => !o)}
            aria-label="Buka sapa cepat"
            title="Sapa & Chat Singkat (C)"
          >
            <MessageCircle size={19} />
          </button>
          <button
            type="button"
            className={`g-icon-btn g-icon-btn--night ${isDark ? 'is-active' : ''}`}
            onClick={() => {
              toggleTheme()
              say(isDark ? 'Selamat pagi di Kebun Poti! ☀️' : 'Mode malam rembulan aktif 🌙✨', 2200)
            }}
            aria-pressed={isDark}
            aria-label={isDark ? 'Ganti ke mode siang' : 'Ganti ke mode malam'}
            title={isDark ? 'Mode Siang (N)' : 'Mode Malam Rembulan (N)'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="g-wallet">
            <Coins size={14} /> {wallet.coins}
          </span>
          <span className="g-wallet g-wallet--xp">
            <Zap size={14} /> {wallet.xp} XP
          </span>
          <span className={`g-chip g-chip--quest ${questDone ? 'is-done' : ''}`}>
            <Trophy size={14} /> {questProgress}/{QUEST.care + QUEST.water + QUEST.dew}
          </span>
          <button
            type="button"
            className={`g-icon-btn g-icon-btn--fs ${isFs ? 'is-active' : ''}`}
            onClick={toggleFullscreen}
            aria-pressed={isFs}
            aria-label={isFs ? 'Keluar dari layar penuh' : 'Masuk layar penuh'}
            title={isFs ? 'Keluar dari layar penuh' : 'Layar penuh (HP & Desktop)'}
          >
            {isFs ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
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
            <div className={`g-target ${active || activeSlot != null ? 'is-active' : ''}`} aria-live="polite">
              {active ? (
                <>
                  <span className="g-target__name">
                    <Leaf size={14} /> {active.name} ({active.growth}%)
                  </span>
                  <span className="g-target__stat">
                    <Droplets size={13} /> {active.needs.water}%
                  </span>
                  <span className="g-target__stat">
                    <Sprout size={13} /> {active.needs.nutrient}%
                  </span>
                  <span className="g-target__hint">
                    {active.growth >= 85
                      ? 'Siap panen!'
                      : waterCd > 0
                        ? `Siram siap ${waterCd}s`
                        : 'Siap dirawat'}
                  </span>
                </>
              ) : activeSlot != null ? (
                <span className="g-target__name">
                  <Sprout size={14} /> Petak kosong #{activeSlot + 1} · {totalSeeds} benih tersedia
                </span>
              ) : (
                <span className="g-target__hint">
                  <Move size={14} /> Dekati petak atau tanaman untuk tanam, siram, &amp; panen
                </span>
              )}
            </div>

            {active && active.growth >= 85 ? (
              <button type="button" className="g-quick-act g-quick-act--harvest" onClick={harvestActive}>
                <Wheat size={14} /> Panen Sekarang (H)
              </button>
            ) : active && (carrying?.kind === 'fertilizer' || carrying?.kind === 'care') ? (
              <button
                type="button"
                className="g-quick-act g-quick-act--plant"
                onClick={() => act('feed')}
              >
                <Sparkles size={14} /> Pakai {carrying.label} (F)
              </button>
            ) : activeSlot != null ? (
              <button
                type="button"
                className="g-quick-act g-quick-act--plant"
                onClick={() =>
                  carrying?.kind === 'seed' && carrying.speciesId
                    ? plantFromBag(carrying.speciesId, activeSlot)
                    : openSeedBag(activeSlot)
                }
              >
                <Plus size={14} />{' '}
                {carrying?.kind === 'seed' ? `Tanam ${carrying.label} (T)` : 'Tanam Benih di Petak (T)'}
              </button>
            ) : carrying ? (
              <div className="g-carry-chip">
                <Sprout size={12} />
                <span>
                  Poti membawa: <strong>{carrying.label}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setCarrying(null)}
                  title="Simpan barang ke tas"
                  aria-label="Simpan barang yang dibawa ke tas"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div className="g-zonechip" aria-live="polite">
                <MapPin size={12} />
                <strong>{zone.name}</strong>
                <span>{zone.hint}</span>
              </div>
            )}
          </div>

          <PixelMinimap
            plants={placed}
            dew={dew}
            peers={peers}
            playerDotRef={playerDotRef}
            peerDotsRef={peerDotsRef}
          />

          {chatOpen && (
            <div className="g-chatbar" role="dialog" aria-label="Sapa pemain lain">
              <div className="g-chatbar__quick">
                {['👋 Halo!', '🌱 Semangat!', '💧 Siram yuk!', '🌾 Panen!'].map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => {
                      say(msg, 3400)
                      setChatOpen(false)
                    }}
                  >
                    {msg}
                  </button>
                ))}
              </div>
              <form
                className="g-chatbar__form"
                onSubmit={(e) => {
                  e.preventDefault()
                  const trimmed = chatText.trim()
                  if (!trimmed) return
                  say(trimmed.slice(0, 60), 3600)
                  setChatText('')
                  setChatOpen(false)
                }}
              >
                <input
                  type="text"
                  maxLength={60}
                  placeholder="Tulis pesan singkat…"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  autoFocus
                />
                <button type="submit" aria-label="Kirim pesan">
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}

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
              disabled={
                (feedCd > 0 && carrying?.kind !== 'fertilizer' && carrying?.kind !== 'care') ||
                sleeping
              }
              badge={
                carrying?.kind === 'fertilizer' || carrying?.kind === 'care'
                  ? 'Siap'
                  : feedCd > 0
                    ? `${feedCd}s`
                    : null
              }
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
              Jelajahi kebun bergaya pixel art top-down secara multiplayer realtime tanpa login!
              Temui pemain lain di peta, tanam benih dari Shop, panen hasil kebunmu, dan tukar
              menjadi voucher diskon 10–15% semua produk POTIVA &amp; E-Book.
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
                <Maximize2 size={18} />
                Mulai &amp; layar penuh
              </button>
              <button type="button" className="g-cta g-cta--ghost" onClick={close}>
                <ArrowLeft size={18} /> Kembali ke kebun
              </button>
            </div>
            <p className="g-intro__note">
              {supportsFs
                ? 'Game otomatis masuk layar penuh. Di HP Android, aktifkan rotasi/landscape untuk sudut pandang terluas.'
                : 'Mode layar penuh adaptif aktif. Di iPhone Safari, putar landscape & pilih "Sembunyikan Toolbar" (ikon AA) agar penuh 100%.'}
            </p>
            <p className="g-intro__keys">
              Keyboard: <kbd>WASD</kbd>/panah gerak · <kbd>M</kbd> toko · <kbd>K</kbd> kios panen ·{' '}
              <kbd>E</kbd> siram · <kbd>F</kbd> pupuk · <kbd>B</kbd>/<kbd>T</kbd> tanam ·{' '}
              <kbd>H</kbd> panen · <kbd>V</kbd> voucher · <kbd>N</kbd> malam · <kbd>C</kbd> sapa ·{' '}
              <kbd>G</kbd> gaya
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
              <button type="button" className="g-cta g-cta--ghost" onClick={toggleFullscreen}>
                {isFs ? <Minimize2 size={18} /> : <Expand size={18} />}
                {isFs ? 'Keluar layar penuh' : 'Layar penuh'}
              </button>
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

      {seedBagOpen && (
        <div className="g-overlay g-overlay--wardrobe">
          <div className="g-card g-wardrobe" role="document" aria-label="Tas Benih Kebun Poti">
            <div className="g-wardrobe__head">
              <div>
                <span className="g-pause__eyebrow">Tanam di Kebun</span>
                <h2>Tas Benih {targetSlot != null ? `· Petak #${targetSlot + 1}` : ''}</h2>
                <p className="g-wardrobe__lead">
                  Tanam benih yang kamu beli dari POTIVA Shop ke petak kebun, lalu siram &amp;
                  pupuk sampai tumbuh 85%+ agar bisa dipanen!
                </p>
              </div>
              <button
                type="button"
                className="g-icon-btn"
                onClick={() => setSeedBagOpen(false)}
                aria-label="Tutup tas benih"
              >
                <X size={19} />
              </button>
            </div>

            <div className="g-bag-grid">
              {seedProducts.map((item) => {
                const sp = SPECIES.find((s) => s.id === item.speciesId)
                const owned = seedInventory[item.speciesId] || 0
                return (
                  <div key={item.id} className={`g-wardrobe__item ${owned > 0 ? 'is-owned' : ''}`}>
                    <span className="g-wardrobe__thumb">
                      <ProductArt type={item.art} />
                    </span>
                    <div className="g-wardrobe__meta">
                      <strong>
                        {sp?.emoji} {item.name}
                      </strong>
                      <small>
                        Milikmu: <b>{owned}</b> · {sp?.difficulty}
                      </small>
                    </div>
                    <div className="g-bag-actions">
                      {owned > 0 ? (
                        <button
                          type="button"
                          className="g-wardrobe__btn g-wardrobe__btn--plant"
                          onClick={() => plantFromBag(item.speciesId)}
                          disabled={emptySlots.length === 0 && placed.length >= PLANT_SLOTS.length}
                        >
                          <Sprout size={12} /> Tanam
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="g-wardrobe__btn g-wardrobe__btn--buy"
                          onClick={() => actions.buySeedWithCoins(item.id)}
                          disabled={wallet.coins < item.coinPrice}
                          title={
                            wallet.coins < item.coinPrice
                              ? `Butuh ${item.coinPrice - wallet.coins} koin lagi atau beli di POTIVA Shop`
                              : 'Beli benih dengan koin kebun'
                          }
                        >
                          <Coins size={12} /> {item.coinPrice}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="g-wardrobe__note">
              <ShoppingBag size={14} /> Beli benih di{' '}
              <button
                type="button"
                className="g-wardrobe__link"
                onClick={() => {
                  close()
                  navigate('/shop?kategori=Benih')
                }}
              >
                POTIVA Shop (Kategori Benih)
              </button>{' '}
              — setiap pembelian benih otomatis masuk ke Tas Benih Kebun Poti!
            </p>
          </div>
        </div>
      )}

      {harvestOpen && (
        <div className="g-overlay g-overlay--wardrobe">
          <div className="g-card g-wardrobe" role="document" aria-label="Panen dan Tukar Voucher">
            <div className="g-wardrobe__head">
              <div>
                <span className="g-pause__eyebrow">Hasil Panen</span>
                <h2>Panen &amp; Tukar Voucher Diskon</h2>
                <p className="g-wardrobe__lead">
                  Tukar hasil panenmu menjadi voucher diskon 10–15% untuk semua produk di POTIVA
                  Shop maupun e-book di E-Library!
                </p>
              </div>
              <button
                type="button"
                className="g-icon-btn"
                onClick={() => setHarvestOpen(false)}
                aria-label="Tutup keranjang panen"
              >
                <X size={19} />
              </button>
            </div>

            <div className="g-harvest-summary">
              <div className="g-harvest-count">
                <Wheat size={18} />
                <span>
                  Hasil panen tersedia: <strong>{harvestBasket.length}</strong>
                </span>
              </div>
              <div className="g-harvest-chips">
                {harvestBasket.length === 0 ? (
                  <small>Belum ada panen. Rawat tanaman sampai 85%+ lalu panen (H).</small>
                ) : (
                  harvestBasket.slice(0, 8).map((item) => (
                    <span key={item.id} className="g-harvest-chip">
                      {item.emoji} {item.name}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="g-voucher-grid">
              {VOUCHER_CATALOG.map((tpl) => {
                const canRedeem = harvestBasket.length >= tpl.costHarvest
                return (
                  <div key={tpl.id} className="g-voucher-card">
                    <div className="g-voucher-card__badge">-{tpl.discount}%</div>
                    <div className="g-voucher-card__body">
                      <strong>{tpl.title}</strong>
                      <small>{tpl.desc}</small>
                    </div>
                    <button
                      type="button"
                      className="g-wardrobe__btn g-wardrobe__btn--plant"
                      disabled={!canRedeem}
                      onClick={() => redeemVoucher(tpl.id)}
                    >
                      Tukar ({tpl.costHarvest} panen)
                    </button>
                  </div>
                )
              })}
            </div>

            {activeVouchers.length > 0 && (
              <div className="g-my-vouchers">
                <strong>Voucher Aktif Milikmu ({activeVouchers.length})</strong>
                <div className="g-my-vouchers__list">
                  {activeVouchers.map((vc) => (
                    <div key={vc.id} className="g-my-voucher">
                      <span>
                        <Ticket size={13} /> <b>{vc.code}</b> · Diskon {vc.discount}% (
                        {vc.target === 'shop' ? 'POTIVA Shop' : 'E-Book'})
                      </span>
                      <div className="g-my-voucher__acts">
                        <button
                          type="button"
                          className="g-wardrobe__btn g-wardrobe__btn--dl"
                          onClick={() => downloadVoucher(vc)}
                          title="Download gambar voucher lucu"
                        >
                          <Download size={12} /> Download PNG
                        </button>
                        <button
                          type="button"
                          className="g-wardrobe__link"
                          onClick={() => {
                            close()
                            navigate(vc.target === 'shop' ? '/shop' : '/library')
                          }}
                        >
                          Pakai di {vc.target === 'shop' ? 'Shop' : 'E-Library'} →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="g-wardrobe__note">
              <BookOpen size={14} /> Voucher Shop berlaku untuk semua produk POTIVA saat
              Checkout; Voucher E-Book berlaku untuk semua panduan di E-Library. Kamu juga bisa
              menjual panen menjadi Poin di <b>Kios Panen</b> (sebelah Toko POTIVA)!
            </p>
          </div>
        </div>
      )}

      {harvestStoreOpen && (
        <div className="g-overlay g-overlay--wardrobe">
          <div className="g-card g-wardrobe g-kios-modal" role="document" aria-label="Kios Panen POTIVA">
            <div className="g-wardrobe__head">
              <div>
                <span className="g-pause__eyebrow">Store Sebelah Toko POTIVA</span>
                <h2>Kios Panen &amp; Tukar Poin</h2>
                <p className="g-wardrobe__lead">
                  Jual hasil tanam kebunmu untuk mengumpulkan Poin Panen, lalu tukarkan menjadi
                  voucher diskon produk POTIVA &amp; download kartu vouchernya!
                </p>
              </div>
              <button
                type="button"
                className="g-icon-btn"
                onClick={() => setHarvestStoreOpen(false)}
                aria-label="Tutup Kios Panen"
              >
                <X size={19} />
              </button>
            </div>

            <div className="g-kios-stats">
              <span className="g-kios-points">
                <Star size={16} fill="currentColor" /> Poin Panenmu: <strong>{harvestPoints}</strong> poin
              </span>
              <span className="g-kios-basket">
                <Wheat size={15} /> Di keranjang panen: <strong>{harvestBasket.length}</strong> tanaman
              </span>
              {harvestBasket.length > 0 && (
                <button
                  type="button"
                  className="g-wardrobe__btn g-wardrobe__btn--buy"
                  onClick={sellAllHarvests}
                >
                  <Coins size={13} /> Jual Semua ({harvestBasket.length})
                </button>
              )}
            </div>

            <div className="g-kios-sec">
              <strong>1. Jual Hasil Tanam (+Poin &amp; +10 Koin per panen)</strong>
              {harvestBasket.length === 0 ? (
                <p className="g-kios-empty">
                  Belum ada hasil panen untuk dijual. Rawat tanamanmu hingga tumbuh 85%+ lalu
                  panen dengan tombol <b>Panen (H)</b>!
                </p>
              ) : (
                <div className="g-bag-grid">
                  {harvestBasket.map((item) => {
                    const sp = SPECIES.find((s) => s.id === item.speciesId)
                    const pts = item.points || sp?.harvestPoints || 40
                    return (
                      <div key={item.id} className="g-wardrobe__item is-owned">
                        <span className="g-kios-emoji" aria-hidden="true">{item.emoji}</span>
                        <div className="g-wardrobe__meta">
                          <strong>{item.name}</strong>
                          <small>Nilai jual: +{pts} Poin · +10 Koin</small>
                        </div>
                        <button
                          type="button"
                          className="g-wardrobe__btn g-wardrobe__btn--buy"
                          onClick={() => sellHarvest(item.id)}
                        >
                          Jual +{pts} Poin
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="g-kios-sec">
              <strong>2. Tukar Poin Jadi Voucher Diskon POTIVA</strong>
              <div className="g-voucher-grid">
                {VOUCHER_CATALOG.map((tpl) => {
                  const canRedeem = harvestPoints >= tpl.costPoints
                  return (
                    <div key={tpl.id} className="g-voucher-card">
                      <div className="g-voucher-card__badge">-{tpl.discount}%</div>
                      <div className="g-voucher-card__body">
                        <strong>{tpl.title}</strong>
                        <small>{tpl.desc}</small>
                      </div>
                      <button
                        type="button"
                        className="g-wardrobe__btn g-wardrobe__btn--plant"
                        disabled={!canRedeem}
                        onClick={() => redeemPointsVoucher(tpl.id)}
                      >
                        Tukar ({tpl.costPoints} poin)
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {activeVouchers.length > 0 && (
              <div className="g-my-vouchers">
                <strong>Voucher Aktif Milikmu ({activeVouchers.length}) — Siap Download Gambar Lucu!</strong>
                <div className="g-my-vouchers__list">
                  {activeVouchers.map((vc) => (
                    <div key={vc.id} className="g-my-voucher">
                      <span>
                        <Ticket size={13} /> <b>{vc.code}</b> · Diskon {vc.discount}% (
                        {vc.target === 'shop' ? 'POTIVA Shop' : 'E-Book'})
                      </span>
                      <div className="g-my-voucher__acts">
                        <button
                          type="button"
                          className="g-wardrobe__btn g-wardrobe__btn--dl"
                          onClick={() => downloadVoucher(vc)}
                        >
                          <Download size={12} /> Download PNG
                        </button>
                        <button
                          type="button"
                          className="g-wardrobe__link"
                          onClick={() => {
                            close()
                            navigate(vc.target === 'shop' ? '/shop' : '/library')
                          }}
                        >
                          Pakai →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {shopOpen && (
        <div className="g-overlay g-overlay--wardrobe">
          <div className="g-card g-wardrobe g-shop-modal" role="document" aria-label="Toko POTIVA">
            <div className="g-wardrobe__head">
              <div>
                <span className="g-pause__eyebrow">Bangunan Toko Kebun</span>
                <h2>Toko POTIVA</h2>
                <p className="g-wardrobe__lead">
                  Beli bibit tanaman, pupuk organik, media tanam, pot, dan gaya Poti langsung di
                  sini! Barang yang dibeli langsung dibawa Poti ke kebun.
                </p>
              </div>
              <button
                type="button"
                className="g-icon-btn"
                onClick={() => setShopOpen(false)}
                aria-label="Tutup Toko POTIVA"
              >
                <X size={19} />
              </button>
            </div>

            <div className="g-shop-cats">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`g-shop-cat ${shopCat === cat ? 'is-active' : ''}`}
                  onClick={() => setShopCat(cat)}
                >
                  {cat}
                </button>
              ))}
              <span className="g-shop-coins">
                <Coins size={13} /> {wallet.coins} koin
              </span>
            </div>

            <div className="g-bag-grid">
              {PRODUCTS.filter((p) => (shopCat === 'Semua' ? true : p.category === shopCat)).map(
                (item) => {
                  const isCosmetic = Boolean(item.cosmetic)
                  const ownedCosm = isCosmetic && ownedCosmetics.includes(item.id)
                  const equippedCosm = isCosmetic && potiLook[item.slot] === item.id
                  const ownedSeed = item.speciesId ? seedInventory[item.speciesId] || 0 : 0
                  const ownedSupply =
                    item.category === 'Perawatan' ? supplyInventory[item.id] || 0 : 0
                  return (
                    <div
                      key={item.id}
                      className={`g-wardrobe__item ${
                        equippedCosm || ownedSeed > 0 || ownedSupply > 0 ? 'is-owned' : ''
                      }`}
                    >
                      <span className="g-wardrobe__thumb">
                        <ProductArt type={item.art} />
                      </span>
                      <div className="g-wardrobe__meta">
                        <strong>{item.name}</strong>
                        <small>
                          {isCosmetic
                            ? `${item.coinPrice} koin · Gaya Poti`
                            : `${formatIDR(item.price)}${
                                item.coinPrice ? ` · ${item.coinPrice} koin` : ''
                              }`}
                        </small>
                        {(ownedSeed > 0 || ownedSupply > 0) && (
                          <small className="g-shop-stock">
                            Di tas: {ownedSeed || ownedSupply}
                          </small>
                        )}
                      </div>
                      <div className="g-shop-item-acts">
                        {isCosmetic ? (
                          ownedCosm ? (
                            <button
                              type="button"
                              className="g-wardrobe__btn"
                              onClick={() => buyShopWithCoins(item)}
                            >
                              {equippedCosm ? 'Dipakai' : 'Pakai'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="g-wardrobe__btn g-wardrobe__btn--buy"
                              disabled={wallet.coins < item.coinPrice}
                              onClick={() => buyShopWithCoins(item)}
                            >
                              <Coins size={11} /> {item.coinPrice}
                            </button>
                          )
                        ) : (
                          <>
                            {item.coinPrice && (
                              <button
                                type="button"
                                className="g-wardrobe__btn g-wardrobe__btn--buy"
                                disabled={wallet.coins < item.coinPrice}
                                onClick={() => buyShopWithCoins(item)}
                                title="Beli pakai koin & bawa Poti ke kebun"
                              >
                                <Coins size={11} /> {item.coinPrice}
                              </button>
                            )}
                            <button
                              type="button"
                              className="g-wardrobe__btn g-wardrobe__btn--plant"
                              onClick={() => addShopToCart(item)}
                              title="Tambah ke keranjang belanja & bawa sampel"
                            >
                              <ShoppingBag size={11} /> +Keranjang
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                },
              )}
            </div>

            <div className="g-shop-foot">
              <span className="g-shop-foot__info">
                <ShoppingBag size={14} /> Keranjangmu: <strong>{cartCount}</strong> item
                {activeVouchers.length > 0 && ` · ${activeVouchers.length} voucher diskon aktif`}
              </span>
              {cartCount > 0 && (
                <button
                  type="button"
                  className="g-wardrobe__btn g-wardrobe__btn--plant"
                  onClick={() => {
                    close()
                    navigate('/checkout')
                  }}
                >
                  Checkout sekarang →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {portrait && !allowPortrait && (
        <div className="g-overlay g-overlay--rotate">
          <div className="g-card g-rotate">
            <div className="g-rotate__phone" aria-hidden="true">
              <Smartphone size={64} />
              <span className="g-rotate__arrow"><RotateCw size={26} /></span>
            </div>
            <h2>Putar HP ke landscape</h2>
            <p>
              Game POTIVA paling nyaman di layar mendatar supaya joystick di kiri dan tombol aksi
              di kanan punya ruang lega.
            </p>
            <span className="g-rotate__hint">
              <RotateCw size={14} /> Tap tombol di bawah untuk langsung masuk layar penuh (Android)
              atau tetap bermain di layar HP.
            </span>
            <div className="g-rotate__actions">
              <button
                type="button"
                className="g-cta"
                onClick={async () => {
                  setAllowPortrait(true)
                  if (phaseRef.current !== 'playing') setPhase('playing')
                  await requestFullscreen({ notify: true })
                }}
                autoFocus
              >
                <Maximize2 size={18} /> Layar Penuh &amp; Main
              </button>
              <button
                type="button"
                className="g-cta g-cta--ghost"
                onClick={() => {
                  setAllowPortrait(true)
                  if (phaseRef.current !== 'playing') setPhase('playing')
                }}
              >
                <Play size={18} /> Main mode potret
              </button>
              <button type="button" className="g-cta g-cta--ghost" onClick={close}>
                <X size={18} /> Kembali ke kebun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
