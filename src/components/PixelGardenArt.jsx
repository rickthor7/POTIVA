import { useEffect, useRef } from 'react'

export const PIXEL_WORLD = {
  w: 2560,
  h: 1600,
  px: 4,
  cw: 640, // 2560 / 4
  ch: 400, // 1600 / 4
}

// Deterministic PRNG so the pixel meadow looks identical every load.
const mulberry32 = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// River path helpers (in logical 640x400 canvas coordinates)
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function distToPolyline(px, py, pts) {
  let best = Infinity
  for (let i = 0; i < pts.length - 1; i += 1) {
    const d = distToSegment(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])
    if (d < best) best = d
  }
  return best
}

const WEST_RIVER = [
  [-10, 108],
  [92, 110],
  [142, 124],
  [162, 158],
  [164, 212],
  [156, 286],
  [146, 360],
  [140, 412],
]

const EAST_RIVER = [
  [468, -10],
  [468, 124],
  [488, 158],
  [544, 174],
  [652, 178],
]

export function PixelTerrainCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const { cw, ch } = PIXEL_WORLD
    const rnd = mulberry32(20261126)

    const rect = (x, y, w, h, color) => {
      ctx.fillStyle = color
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
    }

    // 1. Base meadow grass tiles (16x16 logical tile variations)
    rect(0, 0, cw, ch, '#79b53d')
    for (let ty = 0; ty < ch; ty += 16) {
      for (let tx = 0; tx < cw; tx += 16) {
        const v = rnd()
        if (v < 0.28) rect(tx, ty, 16, 16, '#73ae38')
        else if (v > 0.78) rect(tx, ty, 16, 16, '#81bc44')

        // Grass blade clusters
        if (rnd() > 0.35) {
          const gx = tx + Math.floor(rnd() * 11) + 2
          const gy = ty + Math.floor(rnd() * 11) + 3
          rect(gx, gy, 1, 2, '#5a942b')
          rect(gx + 2, gy - 1, 1, 3, '#639e31')
          rect(gx + 4, gy, 1, 2, '#92cb53')
        }
        // Occasional clover / pebble
        if (rnd() > 0.84) {
          const cx = tx + Math.floor(rnd() * 10) + 3
          const cy = ty + Math.floor(rnd() * 10) + 3
          rect(cx, cy, 2, 2, '#558c28')
          rect(cx + 1, cy - 1, 2, 1, '#9cd35e')
        }
      }
    }

    // 2. Elevated Cliff Terraces (matching reference top-left & mid-left cliffs)
    const drawCliff = (x, y, w, h, capH = 12) => {
      // Grass plateau top
      rect(x, y, w, h - 18, '#83be46')
      for (let gx = x + 3; gx < x + w - 4; gx += 7) {
        if (rnd() > 0.4) rect(gx, y + 4 + Math.floor(rnd() * (h - 28)), 2, 2, '#69a433')
      }
      // Overhanging grass lip
      rect(x, y + h - 22, w, 4, '#5a942b')
      rect(x, y + h - 18, w, 1, '#2f2014')
      // Cliff vertical rock wall
      rect(x, y + h - 17, w, 14, '#9e663b')
      for (let bx = x; bx < x + w; bx += 8) {
        const bh = 5 + Math.floor(rnd() * 4)
        rect(bx, y + h - 17, 7, bh, '#b07647')
        rect(bx + 1, y + h - 17 + bh, 6, 14 - bh, '#83502b')
        rect(bx + 7, y + h - 17, 1, 14, '#6d4121')
      }
      rect(x, y + h - 3, w, 2, '#3a2416')
      // Soft ground shadow beneath cliff
      rect(x + 2, y + h - 1, w - 4, 3, 'rgba(30, 52, 20, 0.25)')
      // Top fence on cliff edge if wide
      if (capH > 0) {
        for (let fx = x + 6; fx < x + w - 8; fx += 10) {
          rect(fx, y + h - 28, 3, 9, '#6e4225')
          rect(fx + 1, y + h - 27, 1, 7, '#a56d42')
        }
        rect(x + 4, y + h - 25, w - 8, 2, '#8b5732')
      }
    }

    // Top-left elevated plateau
    drawCliff(96, -4, 152, 64, 1)
    // Mid-left cliff shelf (above barn)
    drawCliff(0, 198, 114, 48, 0)
    // Wooden stairs built into mid-left cliff (x: 74..98, y: 218..246)
    const sx = 74
    const sy = 218
    rect(sx - 2, sy, 26, 28, '#4a2e1a')
    for (let step = 0; step < 6; step += 1) {
      const py = sy + step * 4 + 1
      rect(sx, py, 22, 3, '#b87d4b')
      rect(sx, py + 3, 22, 1, '#754827')
    }
    // Side stair rails
    rect(sx - 2, sy, 2, 28, '#8b5732')
    rect(sx + 22, sy, 2, 28, '#8b5732')

    // 3. Cobblestone Paths
    const drawCobbleStrip = (x, y, w, h) => {
      rect(x, y, w, h, '#838b83')
      for (let py = y; py < y + h; py += 6) {
        const rowShift = ((py / 6) % 2) * 4
        for (let px = x + rowShift; px < x + w; px += 8) {
          const sw = Math.min(6, x + w - px - 1)
          const sh = Math.min(4, y + h - py - 1)
          if (sw <= 1 || sh <= 1) continue
          const shade = rnd()
          const c = shade < 0.3 ? '#9ea69e' : shade < 0.72 ? '#b1b8b0' : '#c4cbc2'
          rect(px + 1, py + 1, sw, sh, c)
          rect(px + 1, py + 1, sw, 1, '#d2d8cf')
        }
      }
    }

    // Farmhouse plaza & main cross-roads
    drawCobbleStrip(276, 86, 88, 36) // Farmhouse front patio
    drawCobbleStrip(308, 118, 28, 38) // Farmhouse to garden north gate
    drawCobbleStrip(206, 128, 240, 22) // Upper east-west main avenue
    drawCobbleStrip(186, 140, 28, 74) // West branch to wooden bridge
    drawCobbleStrip(104, 188, 108, 22) // West side path across wooden bridge
    drawCobbleStrip(74, 188, 32, 34) // Top of stairs landing
    drawCobbleStrip(72, 246, 30, 120) // Path down stairs to barn & lower meadow
    drawCobbleStrip(24, 346, 88, 24) // Barn front yard path
    drawCobbleStrip(426, 76, 84, 20) // East path across stone bridge to windmill
    drawCobbleStrip(502, 68, 76, 20) // Windmill approach
    drawCobbleStrip(434, 86, 26, 134) // North-south east avenue
    drawCobbleStrip(434, 198, 74, 24) // Market stall plaza
    drawCobbleStrip(478, 214, 30, 148) // Path south toward greenhouse & flower meadow
    drawCobbleStrip(508, 336, 74, 24) // Greenhouse front walkway
    drawCobbleStrip(220, 308, 264, 22) // South avenue below fenced garden
    drawCobbleStrip(314, 296, 26, 40) // South garden gate link

    // 4. Winding Rivers (West River & East River)
    const paintRiver = (polyline) => {
      for (let py = 0; py < ch; py += 1) {
        for (let px = 0; px < cw; px += 1) {
          const d = distToPolyline(px, py, polyline)
          if (d < 17.5) {
            if (d > 15.6) {
              ctx.fillStyle = '#385d24' // Outer bank shadow
            } else if (d > 13.8) {
              ctx.fillStyle = '#a98d5e' // Warm sandy bank
            } else if (d > 11.4) {
              ctx.fillStyle = '#6ec2e8' // Shallow water edge
            } else if (d > 9.4) {
              ctx.fillStyle = '#53addc'
            } else {
              ctx.fillStyle = '#4096cb' // Deep river center
            }
            ctx.fillRect(px, py, 1, 1)
          }
        }
      }
    }

    paintRiver(WEST_RIVER)
    paintRiver(EAST_RIVER)

    // Lilypads & reeds on rivers
    const lilypads = [
      [34, 108],
      [78, 114],
      [162, 152],
      [158, 244],
      [148, 326],
      [142, 376],
      [468, 34],
      [468, 114],
      [512, 168],
      [576, 178],
    ]
    for (const [lx, ly] of lilypads) {
      rect(lx - 4, ly - 3, 8, 5, '#4c9c3d')
      rect(lx - 3, ly - 2, 6, 3, '#6fc356')
      rect(lx, ly - 2, 2, 1, '#4096cb') // notch
      if (rnd() > 0.35) {
        rect(lx - 1, ly - 4, 3, 2, '#f9b8ca') // pink lotus
        rect(lx, ly - 4, 1, 1, '#fff4b8')
      }
    }

    // 5. Bridges over the rivers
    // West Wooden Plank Bridge (x: 136..190, y: 184..212)
    {
      const bx = 136
      const by = 184
      const bw = 54
      const bh = 28
      rect(bx, by + bh, bw, 4, 'rgba(20, 50, 75, 0.3)')
      rect(bx, by, bw, bh, '#4a2e1a')
      for (let px = bx + 2; px < bx + bw - 2; px += 4) {
        rect(px, by + 3, 3, bh - 6, '#c78c52')
        rect(px, by + 4, 3, 2, '#dba368')
        rect(px + 3, by + 3, 1, bh - 6, '#754827')
      }
      // Top & bottom bridge rails
      rect(bx - 1, by, bw + 2, 4, '#8b5732')
      rect(bx - 1, by + bh - 4, bw + 2, 4, '#8b5732')
      for (let px = bx; px <= bx + bw - 3; px += 12) {
        rect(px, by - 2, 4, 6, '#5c371d')
        rect(px, by + bh - 4, 4, 6, '#5c371d')
      }
    }

    // East Stone Arch Bridge (x: 440..496, y: 70..100)
    {
      const bx = 440
      const by = 70
      const bw = 56
      const bh = 30
      rect(bx + 2, by + bh, bw - 4, 5, 'rgba(20, 50, 75, 0.3)')
      // Stone deck
      rect(bx, by + 3, bw, bh - 6, '#626862')
      for (let py = by + 5; py < by + bh - 5; py += 5) {
        for (let px = bx + 2; px < bx + bw - 4; px += 7) {
          rect(px, py, 6, 4, '#afb6ae')
          rect(px, py, 6, 1, '#cfd5ce')
        }
      }
      // Curved stone parapets
      rect(bx - 2, by + 1, bw + 4, 5, '#7c847c')
      rect(bx, by + 2, bw, 3, '#c4cbc2')
      rect(bx - 2, by + bh - 6, bw + 4, 5, '#7c847c')
      rect(bx, by + bh - 5, bw, 3, '#c4cbc2')
      // Corner stone pillars
      for (const px of [bx - 2, bx + bw - 4]) {
        rect(px, by - 1, 6, 8, '#959d95')
        rect(px + 1, by, 4, 3, '#d0d6cf')
        rect(px, by + bh - 7, 6, 8, '#959d95')
        rect(px + 1, by + bh - 6, 4, 3, '#d0d6cf')
      }
    }

    // 6. Central Fenced Garden ("Ladang Utama") at x: 232..424, y: 156..304
    const gx = 232
    const gy = 156
    const gw = 192
    const gh = 148

    // Inner cross paths inside fenced garden
    drawCobbleStrip(gx + 8, gy + 64, gw - 16, 18) // Horizontal walkway
    drawCobbleStrip(gx + 84, gy + 6, 24, gh - 12) // Vertical walkway

    // 4 Tilled Soil Quadrants
    const quads = [
      { x: gx + 12, y: gy + 12, w: 68, h: 48, crop: 'carrot' },
      { x: gx + 112, y: gy + 12, w: 68, h: 48, crop: 'cabbage' },
      { x: gx + 12, y: gy + 86, w: 68, h: 48, crop: 'sprout' },
      { x: gx + 112, y: gy + 86, w: 68, h: 48, crop: 'pumpkin' },
    ]

    for (const q of quads) {
      rect(q.x - 1, q.y - 1, q.w + 2, q.h + 2, '#5a361e')
      rect(q.x, q.y, q.w, q.h, '#8d5935')
      // Furrows
      for (let fy = q.y + 4; fy < q.y + q.h - 4; fy += 10) {
        rect(q.x + 3, fy, q.w - 6, 7, '#754626')
        rect(q.x + 3, fy + 1, q.w - 6, 2, '#9e6740')
      }
      // Decorative pixel crops on outer rows (leaving center space clear for POTIVA plants)
      for (let cx = q.x + 7; cx < q.x + q.w - 6; cx += 11) {
        for (let cy = q.y + 6; cy < q.y + q.h - 4; cy += 12) {
          // Leave some clear tilled soil patches where user's POTIVA plant beds sit
          const midX = cx > q.x + 18 && cx < q.x + q.w - 18
          if (midX && cy > q.y + 10 && cy < q.y + q.h - 14) continue

          if (q.crop === 'carrot') {
            rect(cx, cy - 2, 5, 3, '#3c9638')
            rect(cx + 1, cy - 4, 3, 2, '#62c44d')
            rect(cx + 1, cy + 1, 3, 3, '#ee7828')
            rect(cx + 2, cy + 4, 1, 1, '#c75617')
          } else if (q.crop === 'cabbage') {
            rect(cx - 1, cy - 1, 7, 6, '#2f7438')
            rect(cx, cy, 5, 4, '#5eb857')
            rect(cx + 1, cy + 1, 3, 2, '#96de7b')
          } else if (q.crop === 'pumpkin') {
            rect(cx - 1, cy, 7, 6, '#964014')
            rect(cx, cy, 5, 5, '#eb7b23')
            rect(cx + 1, cy + 1, 3, 3, '#f89e3c')
            rect(cx + 2, cy - 2, 1, 2, '#458a34')
          } else {
            rect(cx + 1, cy, 3, 4, '#458f3d')
            rect(cx - 1, cy - 1, 3, 2, '#7fd160')
            rect(cx + 3, cy - 1, 3, 2, '#9ae374')
          }
        }
      }
    }

    // Wooden fence around the garden (with gates on N, S, E, W)
    const drawFencePost = (fx, fy) => {
      rect(fx - 2, fy - 7, 4, 10, '#3e2414')
      rect(fx - 1, fy - 6, 2, 8, '#a36b3e')
      rect(fx - 1, fy - 6, 2, 2, '#c88c58')
    }
    const drawFenceH = (x1, x2, y) => {
      rect(x1, y - 4, x2 - x1, 2, '#8b5732')
      rect(x1, y - 1, x2 - x1, 2, '#734424')
      for (let fx = x1; fx <= x2; fx += 10) drawFencePost(fx, y)
    }
    const drawFenceV = (x, y1, y2) => {
      rect(x - 1, y1, 2, y2 - y1, '#734424')
      for (let fy = y1; fy <= y2; fy += 10) drawFencePost(x, fy)
    }

    // North fence with gate gap (310..344)
    drawFenceH(gx, 308, gy)
    drawFenceH(346, gx + gw, gy)
    // South fence with gate gap (310..344)
    drawFenceH(gx, 308, gy + gh)
    drawFenceH(346, gx + gw, gy + gh)
    // West fence with gate gap (216..244)
    drawFenceV(gx, gy, 214)
    drawFenceV(gx, 246, gy + gh)
    // East fence with gate gap (216..244)
    drawFenceV(gx + gw, gy, 214)
    drawFenceV(gx + gw, 246, gy + gh)

    // Small animal pen fence near Greenhouse (x: 492..546, y: 266..312)
    drawFenceH(492, 546, 268)
    drawFenceV(492, 268, 310)
    drawFenceH(492, 520, 310)

    // 7. Hay Bales, Barrels, Crates & Flower Carpets
    const drawHay = (hx, hy) => {
      rect(hx, hy, 14, 10, '#6e4e18')
      rect(hx + 1, hy + 1, 12, 8, '#e8c454')
      rect(hx + 1, hy + 1, 12, 3, '#f5da78')
      rect(hx + 4, hy + 1, 1, 8, '#b9882c')
      rect(hx + 9, hy + 1, 1, 8, '#b9882c')
    }
    const drawBarrel = (bx, by) => {
      rect(bx, by, 10, 12, '#3d2415')
      rect(bx + 1, by + 1, 8, 10, '#965c34')
      rect(bx + 2, by + 1, 6, 2, '#b8794b')
      rect(bx + 1, by + 3, 8, 1, '#555b5e')
      rect(bx + 1, by + 8, 8, 1, '#555b5e')
    }

    drawHay(46, 166)
    drawHay(62, 166)
    drawHay(382, 84)
    drawHay(398, 84)
    drawBarrel(140, 56)
    drawBarrel(152, 56)
    drawBarrel(232, 62)
    drawBarrel(232, 76)
    drawBarrel(384, 62)
    drawBarrel(482, 186)
    drawBarrel(482, 199)
    drawBarrel(66, 336)
    drawBarrel(66, 350)

    // Wildflower carpets
    const flowerColors = ['#fff5d6', '#f47b7b', '#b88ae6', '#f7cf52', '#f7b4c8']
    const flowerZones = [
      [34, 34, 52, 46, 28], // Top-left meadow
      [34, 144, 64, 32, 20], // West meadow above cliff
      [34, 240, 38, 56, 22], // Left below cliff
      [256, 346, 94, 46, 36], // Bottom-center meadow
      [372, 346, 94, 46, 36], // Bottom-right meadow
      [536, 128, 72, 34, 18], // East river bank
    ]
    for (const [fx, fy, fw, fh, count] of flowerZones) {
      for (let i = 0; i < count; i += 1) {
        const px = fx + Math.floor(rnd() * fw)
        const py = fy + Math.floor(rnd() * fh)
        const col = flowerColors[Math.floor(rnd() * flowerColors.length)]
        rect(px, py + 2, 1, 2, '#3d7d29')
        rect(px - 1, py, 3, 2, col)
        rect(px, py - 1, 1, 3, col)
        rect(px, py, 1, 1, '#ffe57f')
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={PIXEL_WORLD.cw}
      height={PIXEL_WORLD.ch}
      className="g-pixel-canvas"
      aria-hidden="true"
    />
  )
}

/* ── Pixel-art Buildings (SVG with crispEdges) ─────────────────────────── */

export function PixelFarmhouse() {
  return (
    <svg
      className="g-px-building g-px-farmhouse"
      viewBox="0 0 112 96"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Drop shadow */}
      <rect x="8" y="86" width="96" height="8" fill="#1b3a22" opacity="0.28" />
      {/* Stone Chimney */}
      <rect x="26" y="8" width="12" height="22" fill="#5e6568" />
      <rect x="27" y="9" width="10" height="20" fill="#8e9699" />
      <rect x="25" y="7" width="14" height="3" fill="#464d50" />
      {/* Chimney pixel smoke */}
      <g className="g-px-smoke">
        <rect x="29" y="2" width="5" height="4" fill="#fffdf6" opacity="0.72" />
        <rect x="33" y="-3" width="6" height="4" fill="#fffdf6" opacity="0.52" />
      </g>
      {/* Main Timber Walls */}
      <rect x="14" y="42" width="84" height="46" fill="#3a2315" />
      <rect x="16" y="44" width="80" height="42" fill="#d9c6a3" />
      {/* Timber framing beams */}
      <rect x="16" y="44" width="6" height="42" fill="#8b5a36" />
      <rect x="90" y="44" width="6" height="42" fill="#8b5a36" />
      <rect x="42" y="44" width="4" height="42" fill="#8b5a36" />
      <rect x="66" y="44" width="4" height="42" fill="#8b5a36" />
      <rect x="16" y="64" width="80" height="3" fill="#8b5a36" />
      {/* Stone foundation */}
      <rect x="16" y="80" width="80" height="6" fill="#777e7b" />
      <rect x="18" y="81" width="76" height="2" fill="#9ea6a2" />

      {/* Teal-Slate Pitched Roof */}
      <rect x="10" y="26" width="92" height="20" fill="#1e3c3c" />
      <rect x="12" y="22" width="88" height="20" fill="#2c5858" />
      <rect x="16" y="18" width="80" height="10" fill="#386e6c" />
      <rect x="22" y="14" width="68" height="6" fill="#44827e" />
      {/* Roof tile texture */}
      <rect x="14" y="28" width="84" height="2" fill="#1e3c3c" />
      <rect x="12" y="36" width="88" height="2" fill="#1e3c3c" />
      {/* Center Gable Roof Peak */}
      <rect x="46" y="6" width="20" height="4" fill="#2c5858" />
      <rect x="42" y="10" width="28" height="6" fill="#386e6c" />
      <rect x="38" y="16" width="36" height="14" fill="#44827e" />
      <rect x="40" y="18" width="32" height="22" fill="#d9c6a3" />
      <rect x="38" y="18" width="4" height="22" fill="#704528" />
      <rect x="70" y="18" width="4" height="22" fill="#704528" />
      {/* Attic Window */}
      <rect x="50" y="22" width="12" height="12" fill="#4e301d" />
      <rect x="52" y="24" width="8" height="8" fill="#f7cb66" />
      <rect x="55" y="24" width="2" height="8" fill="#4e301d" />
      <rect x="52" y="27" width="8" height="2" fill="#4e301d" />

      {/* Left & Right Windows */}
      {[24, 74].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="56" width="14" height="14" fill="#4e301d" />
          <rect x={wx + 2} y="58" width="10" height="10" fill="#634532" />
          <rect x={wx + 3} y="59" width="8" height="8" fill="#f2bd57" />
          <rect x={wx + 6} y="58" width="2" height="10" fill="#4e301d" />
          <rect x={wx + 2} y="62" width="10" height="2" fill="#4e301d" />
          <rect x={wx - 1} y="70" width="16" height="3" fill="#8b5a36" />
        </g>
      ))}

      {/* Porch Roof & Arched Wooden Door */}
      <rect x="44" y="48" width="24" height="8" fill="#2c5858" />
      <rect x="42" y="53" width="28" height="4" fill="#1e3c3c" />
      <rect x="48" y="57" width="16" height="29" fill="#4e301d" />
      <rect x="50" y="59" width="12" height="27" fill="#9a623c" />
      <rect x="55" y="59" width="2" height="27" fill="#704528" />
      <rect x="59" y="72" width="2" height="2" fill="#f7d86b" />
      {/* Porch Lanterns */}
      <rect x="44" y="61" width="3" height="5" fill="#ffd973" />
      <rect x="65" y="61" width="3" height="5" fill="#ffd973" />
      {/* Front Stone Steps */}
      <rect x="46" y="86" width="20" height="4" fill="#a8b0aa" />
      <rect x="48" y="90" width="16" height="3" fill="#8a928c" />
      {/* Flower Boxes */}
      <rect x="24" y="82" width="12" height="5" fill="#704528" />
      <rect x="25" y="80" width="3" height="3" fill="#e8645a" />
      <rect x="29" y="79" width="3" height="4" fill="#65b84b" />
      <rect x="33" y="80" width="3" height="3" fill="#f7cf52" />
      <rect x="76" y="82" width="12" height="5" fill="#704528" />
      <rect x="77" y="80" width="3" height="3" fill="#b88ae6" />
      <rect x="81" y="79" width="3" height="4" fill="#65b84b" />
      <rect x="85" y="80" width="3" height="3" fill="#f7b4c8" />
    </svg>
  )
}

export function PixelWindmill() {
  return (
    <svg
      className="g-px-building g-px-windmill"
      viewBox="0 0 80 96"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="18" y="84" width="44" height="8" fill="#1b3a22" opacity="0.28" />
      {/* Tower Base */}
      <rect x="24" y="34" width="32" height="54" fill="#3a2315" />
      <rect x="26" y="36" width="28" height="50" fill="#c7b28f" />
      <rect x="26" y="36" width="5" height="50" fill="#b09b79" />
      <rect x="49" y="36" width="5" height="50" fill="#9a8564" />
      {/* Timber cross-braces */}
      <rect x="26" y="54" width="28" height="3" fill="#7c4e2b" />
      <rect x="26" y="70" width="28" height="3" fill="#7c4e2b" />
      {/* Stone base */}
      <rect x="24" y="80" width="32" height="6" fill="#7e8580" />
      {/* Door */}
      <rect x="34" y="68" width="12" height="18" fill="#4a2b18" />
      <rect x="36" y="70" width="8" height="16" fill="#8b5732" />
      {/* Conical Roof */}
      <rect x="36" y="14" width="8" height="6" fill="#5e371f" />
      <rect x="30" y="20" width="20" height="6" fill="#7c4928" />
      <rect x="24" y="26" width="32" height="10" fill="#965a33" />
      <rect x="22" y="34" width="36" height="3" fill="#4a2b18" />
      {/* Spinning 4 Wooden Sails */}
      <g className="g-px-windmill__sails" style={{ transformOrigin: '40px 34px' }}>
        <rect x="38" y="4" width="4" height="60" fill="#633a1e" />
        <rect x="10" y="32" width="60" height="4" fill="#633a1e" />
        {/* Sail canvases */}
        <rect x="32" y="6" width="6" height="20" fill="#f3e6c4" />
        <rect x="42" y="42" width="6" height="20" fill="#f3e6c4" />
        <rect x="12" y="36" width="20" height="6" fill="#f3e6c4" />
        <rect x="48" y="26" width="20" height="6" fill="#f3e6c4" />
        {/* Lattice lines */}
        <rect x="33" y="12" width="5" height="1" fill="#b89865" />
        <rect x="33" y="18" width="5" height="1" fill="#b89865" />
        <rect x="42" y="48" width="5" height="1" fill="#b89865" />
        <rect x="42" y="54" width="5" height="1" fill="#b89865" />
        <rect x="18" y="36" width="1" height="6" fill="#b89865" />
        <rect x="24" y="36" width="1" height="6" fill="#b89865" />
        <rect x="54" y="26" width="1" height="6" fill="#b89865" />
        <rect x="60" y="26" width="1" height="6" fill="#b89865" />
        {/* Center Hub */}
        <rect x="37" y="31" width="6" height="6" fill="#3d2211" />
        <rect x="38" y="32" width="4" height="4" fill="#c98e4e" />
      </g>
    </svg>
  )
}

export function PixelGreenhouse() {
  return (
    <svg
      className="g-px-building g-px-greenhouse"
      viewBox="0 0 88 96"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="8" y="86" width="72" height="8" fill="#1b3a22" opacity="0.26" />
      {/* Interior plants visible through glass */}
      <rect x="16" y="36" width="56" height="48" fill="#9cd8cf" opacity="0.86" />
      <rect x="18" y="54" width="16" height="22" fill="#469948" />
      <rect x="54" y="54" width="16" height="22" fill="#59b355" />
      <rect x="22" y="58" width="4" height="4" fill="#f47b7b" />
      <rect x="60" y="56" width="4" height="4" fill="#f7cf52" />
      {/* Glass Roof */}
      <rect x="34" y="10" width="20" height="8" fill="#bfe9e2" opacity="0.9" />
      <rect x="24" y="18" width="40" height="10" fill="#aadfd7" opacity="0.9" />
      <rect x="14" y="28" width="60" height="10" fill="#9cd8cf" opacity="0.9" />
      {/* Glass Shine Streaks */}
      <rect x="22" y="38" width="4" height="28" fill="#ffffff" opacity="0.45" />
      <rect x="60" y="42" width="3" height="22" fill="#ffffff" opacity="0.4" />
      {/* Timber / Copper Frame */}
      <rect x="12" y="34" width="64" height="3" fill="#5c3820" />
      <rect x="12" y="34" width="4" height="52" fill="#5c3820" />
      <rect x="72" y="34" width="4" height="52" fill="#5c3820" />
      <rect x="30" y="22" width="3" height="64" fill="#704528" />
      <rect x="55" y="22" width="3" height="64" fill="#704528" />
      <rect x="43" y="10" width="2" height="42" fill="#704528" />
      <rect x="14" y="56" width="60" height="2" fill="#704528" />
      {/* Roof frame slopes */}
      <rect x="32" y="8" width="24" height="3" fill="#5c3820" />
      <rect x="22" y="16" width="12" height="3" fill="#5c3820" />
      <rect x="54" y="16" width="12" height="3" fill="#5c3820" />
      <rect x="12" y="26" width="12" height="3" fill="#5c3820" />
      <rect x="64" y="26" width="12" height="3" fill="#5c3820" />
      {/* Brick & Wood Base */}
      <rect x="12" y="78" width="64" height="10" fill="#8b5a36" />
      <rect x="14" y="80" width="60" height="6" fill="#a87046" />
      {/* Double Glass Door */}
      <rect x="35" y="54" width="18" height="34" fill="#5c3820" />
      <rect x="37" y="56" width="14" height="30" fill="#c7efe8" />
      <rect x="43" y="56" width="2" height="30" fill="#704528" />
      {/* Front Planter Boxes */}
      <rect x="14" y="84" width="18" height="6" fill="#6b4125" />
      <rect x="16" y="81" width="4" height="4" fill="#e8645a" />
      <rect x="22" y="80" width="4" height="5" fill="#65b84b" />
      <rect x="27" y="81" width="4" height="4" fill="#f7cf52" />
      <rect x="56" y="84" width="18" height="6" fill="#6b4125" />
      <rect x="58" y="81" width="4" height="4" fill="#b88ae6" />
      <rect x="63" y="80" width="4" height="5" fill="#65b84b" />
      <rect x="68" y="81" width="4" height="4" fill="#f7b4c8" />
    </svg>
  )
}

export function PixelBarn() {
  return (
    <svg
      className="g-px-building g-px-barn"
      viewBox="0 0 80 76"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="6" y="66" width="68" height="7" fill="#1b3a22" opacity="0.28" />
      {/* Walls */}
      <rect x="10" y="30" width="60" height="38" fill="#3a2315" />
      <rect x="12" y="32" width="56" height="34" fill="#9a643d" />
      <rect x="12" y="32" width="5" height="34" fill="#6e4225" />
      <rect x="63" y="32" width="5" height="34" fill="#6e4225" />
      {/* Roof */}
      <rect x="22" y="8" width="36" height="8" fill="#2c5858" />
      <rect x="12" y="16" width="56" height="10" fill="#386e6c" />
      <rect x="6" y="26" width="68" height="8" fill="#1e3c3c" />
      {/* Open Barn Door */}
      <rect x="26" y="40" width="28" height="28" fill="#4e2e1a" />
      <rect x="29" y="43" width="22" height="25" fill="#22140c" />
      {/* Hay loft window */}
      <rect x="35" y="18" width="10" height="8" fill="#4e2e1a" />
      <rect x="37" y="20" width="6" height="4" fill="#e8c454" />
    </svg>
  )
}

export function PixelMarketStall() {
  return (
    <svg
      className="g-px-building g-px-stall"
      viewBox="0 0 72 64"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="6" y="54" width="60" height="7" fill="#1b3a22" opacity="0.24" />
      {/* Wooden posts */}
      <rect x="10" y="24" width="4" height="30" fill="#6b4125" />
      <rect x="58" y="24" width="4" height="30" fill="#6b4125" />
      {/* Counter */}
      <rect x="8" y="38" width="56" height="18" fill="#4a2c18" />
      <rect x="10" y="40" width="52" height="14" fill="#a86d42" />
      <rect x="10" y="38" width="52" height="4" fill="#c98e5b" />
      {/* Fresh produce on counter */}
      <rect x="14" y="34" width="8" height="5" fill="#e85848" />
      <rect x="24" y="34" width="8" height="5" fill="#f2a238" />
      <rect x="34" y="34" width="8" height="5" fill="#6bc24d" />
      <rect x="44" y="34" width="10" height="5" fill="#f5d45b" />
      {/* Striped Green & Cream Awning */}
      <rect x="6" y="10" width="60" height="16" fill="#2f663c" />
      {[8, 20, 32, 44, 56].map((ax) => (
        <rect key={ax} x={ax} y="10" width="6" height="14" fill="#5da65e" />
      ))}
      {[14, 26, 38, 50].map((ax) => (
        <rect key={ax} x={ax} y="10" width="6" height="14" fill="#f7eed2" />
      ))}
      <rect x="6" y="24" width="60" height="3" fill="#234d2c" />
    </svg>
  )
}

export function PixelScarecrow() {
  return (
    <svg
      className="g-px-scarecrow"
      viewBox="0 0 36 42"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="12" y="36" width="12" height="4" fill="#1b3a22" opacity="0.25" />
      {/* Wooden post & crossbar */}
      <rect x="16" y="16" width="4" height="22" fill="#6b4125" />
      <rect x="6" y="18" width="24" height="3" fill="#8b5732" />
      {/* Straw hands */}
      <rect x="3" y="17" width="4" height="5" fill="#e8c454" />
      <rect x="29" y="17" width="4" height="5" fill="#e8c454" />
      {/* Blue shirt / overalls */}
      <rect x="12" y="16" width="12" height="12" fill="#4f88ba" />
      <rect x="14" y="18" width="8" height="8" fill="#6ba6d6" />
      {/* Head */}
      <rect x="13" y="8" width="10" height="9" fill="#e8c454" />
      <rect x="15" y="12" width="2" height="2" fill="#2e1d10" />
      <rect x="19" y="12" width="2" height="2" fill="#2e1d10" />
      {/* Straw Hat */}
      <rect x="9" y="6" width="18" height="3" fill="#d9a841" />
      <rect x="12" y="2" width="12" height="5" fill="#ebd06c" />
      <rect x="12" y="5" width="12" height="2" fill="#c94b42" />
      {/* Cute Blue Watering Can beside scarecrow */}
      <rect x="26" y="30" width="8" height="7" fill="#4a9bd4" />
      <rect x="27" y="31" width="6" height="4" fill="#76c4f2" />
      <rect x="23" y="31" width="3" height="2" fill="#4a9bd4" />
      <rect x="34" y="31" width="2" height="4" fill="#3a7aa8" />
    </svg>
  )
}

export function PixelTree({ variant = 'oak' }) {
  const crown = {
    oak: ['#285c2d', '#3e873c', '#5eb34d', '#84cf62'],
    apple: ['#285c2d', '#3e873c', '#5eb34d', '#84cf62'],
    orange: ['#285c2d', '#3e873c', '#5eb34d', '#84cf62'],
    sakura: ['#8f3a5b', '#d86d94', '#f4a2be', '#ffd0e1'],
    pine: ['#1d4732', '#2b6643', '#3e8755', '#62b070'],
  }[variant] || ['#285c2d', '#3e873c', '#5eb34d', '#84cf62']

  return (
    <svg
      className="g-px-tree"
      viewBox="0 0 48 56"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="10" y="48" width="28" height="6" fill="#1b3a22" opacity="0.24" />
      {/* Trunk */}
      <rect x="20" y="32" width="8" height="19" fill="#59351e" />
      <rect x="22" y="32" width="4" height="18" fill="#8b5732" />
      <rect x="18" y="48" width="12" height="3" fill="#59351e" />

      {variant === 'pine' ? (
        <>
          <rect x="8" y="26" width="32" height="10" fill={crown[0]} />
          <rect x="10" y="24" width="28" height="9" fill={crown[1]} />
          <rect x="12" y="16" width="24" height="10" fill={crown[1]} />
          <rect x="14" y="14" width="20" height="8" fill={crown[2]} />
          <rect x="18" y="6" width="12" height="10" fill={crown[2]} />
          <rect x="20" y="4" width="8" height="6" fill={crown[3]} />
        </>
      ) : (
        <>
          {/* Rounded pixelated crown */}
          <rect x="6" y="14" width="36" height="20" fill={crown[0]} />
          <rect x="10" y="8" width="28" height="28" fill={crown[0]} />
          <rect x="8" y="12" width="32" height="20" fill={crown[1]} />
          <rect x="12" y="6" width="24" height="24" fill={crown[1]} />
          <rect x="10" y="10" width="26" height="16" fill={crown[2]} />
          <rect x="14" y="7" width="18" height="10" fill={crown[3]} />
          <rect x="28" y="12" width="8" height="8" fill={crown[2]} />
          {/* Fruits or blossoms */}
          {variant === 'apple' && (
            <>
              <rect x="14" y="16" width="3" height="3" fill="#e64e45" />
              <rect x="28" y="13" width="3" height="3" fill="#e64e45" />
              <rect x="21" y="24" width="3" height="3" fill="#e64e45" />
              <rect x="32" y="22" width="3" height="3" fill="#e64e45" />
            </>
          )}
          {variant === 'orange' && (
            <>
              <rect x="15" y="15" width="3" height="3" fill="#f2912b" />
              <rect x="27" y="14" width="3" height="3" fill="#f2912b" />
              <rect x="19" y="23" width="3" height="3" fill="#f2912b" />
              <rect x="31" y="21" width="3" height="3" fill="#f2912b" />
            </>
          )}
          {variant === 'sakura' && (
            <>
              <rect x="12" y="20" width="2" height="2" fill="#ffffff" />
              <rect x="25" y="11" width="2" height="2" fill="#ffffff" />
              <rect x="31" y="18" width="2" height="2" fill="#ffffff" />
            </>
          )}
        </>
      )}
    </svg>
  )
}

export function PixelLamp() {
  return (
    <svg className="g-px-lamp" viewBox="0 0 18 32" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="5" y="28" width="8" height="3" fill="#1b3a22" opacity="0.24" />
      <rect x="7" y="6" width="3" height="24" fill="#5c3820" />
      <rect x="7" y="6" width="8" height="2" fill="#5c3820" />
      <rect x="12" y="8" width="2" height="2" fill="#464d50" />
      <rect x="10" y="10" width="6" height="7" fill="#5c3820" />
      <rect x="11" y="11" width="4" height="5" fill="#ffe17d" className="g-px-lamp__glow" />
    </svg>
  )
}

export function PixelBench() {
  return (
    <svg className="g-px-bench" viewBox="0 0 32 18" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="14" width="28" height="3" fill="#1b3a22" opacity="0.22" />
      <rect x="3" y="2" width="26" height="4" fill="#a86d42" />
      <rect x="3" y="7" width="26" height="4" fill="#c78c52" />
      <rect x="5" y="11" width="3" height="5" fill="#5c3820" />
      <rect x="24" y="11" width="3" height="5" fill="#5c3820" />
    </svg>
  )
}

export function PixelBirdhouse() {
  return (
    <svg className="g-px-birdhouse" viewBox="0 0 16 24" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="7" y="12" width="2" height="11" fill="#6b4125" />
      <rect x="3" y="5" width="10" height="8" fill="#c98e5b" />
      <rect x="2" y="3" width="12" height="3" fill="#7c4928" />
      <rect x="5" y="1" width="6" height="2" fill="#7c4928" />
      <rect x="7" y="8" width="2" height="2" fill="#3a2315" />
    </svg>
  )
}

export function PixelCritter({ kind = 'chicken' }) {
  if (kind === 'rabbit') {
    return (
      <svg className="g-px-critter" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="4" y="13" width="8" height="2" fill="#1b3a22" opacity="0.22" />
        <rect x="5" y="2" width="2" height="5" fill="#fffdf6" />
        <rect x="9" y="2" width="2" height="5" fill="#fffdf6" />
        <rect x="4" y="6" width="8" height="6" fill="#fffdf6" />
        <rect x="3" y="9" width="2" height="3" fill="#f0e7d6" />
        <rect x="9" y="8" width="1" height="1" fill="#2e1d10" />
        <rect x="11" y="9" width="1" height="1" fill="#f497a9" />
      </svg>
    )
  }
  if (kind === 'duck') {
    return (
      <svg className="g-px-critter g-px-critter--duck" viewBox="0 0 18 16" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="3" y="12" width="12" height="2" fill="#89d6f4" opacity="0.65" />
        <rect x="4" y="7" width="8" height="5" fill="#fffdf6" />
        <rect x="9" y="3" width="5" height="5" fill="#fffdf6" />
        <rect x="12" y="4" width="1" height="1" fill="#20312a" />
        <rect x="14" y="5" width="3" height="2" fill="#f2992c" />
      </svg>
    )
  }
  return (
    <svg className="g-px-critter" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="4" y="13" width="8" height="2" fill="#1b3a22" opacity="0.22" />
      <rect x="6" y="3" width="2" height="2" fill="#e64e45" />
      <rect x="4" y="5" width="7" height="6" fill="#fff8e3" />
      <rect x="3" y="6" width="2" height="3" fill="#f0e0ba" />
      <rect x="9" y="6" width="1" height="1" fill="#2e1d10" />
      <rect x="11" y="7" width="2" height="1" fill="#f2992c" />
      <rect x="6" y="11" width="1" height="2" fill="#f2992c" />
      <rect x="9" y="11" width="1" height="2" fill="#f2992c" />
    </svg>
  )
}
