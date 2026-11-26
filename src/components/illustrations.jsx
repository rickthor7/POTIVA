import { useId } from 'react'

/* ─────────────────────────────────────────────────────────
   POTIVA illustration system
   Hand-built SVG art: mascot, plants, pots, products, covers.
   ───────────────────────────────────────────────────────── */

export function LeafMark({ size = 34, variant = 'green' }) {
  const bg = variant === 'green' ? '#174D35' : '#FFF8E8'
  const leaf = variant === 'green' ? '#A8D66D' : '#174D35'
  const leaf2 = variant === 'green' ? '#EAF5E9' : '#3F8F55'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="17" fill={bg} />
      <path d="M32 49V30" stroke={leaf2} strokeWidth="4" strokeLinecap="round" />
      <path d="M32 34c0-9 6.5-15.5 16-15.5C48 27.5 41.5 34 32 34Z" fill={leaf} />
      <path d="M32 42c0-7.5-5.5-13-13-13 0 7.5 5.5 13 13 13Z" fill={leaf2} />
    </svg>
  )
}

export function Logo({ light = false, compact = false }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`}>
      <LeafMark size={36} variant={light ? 'cream' : 'green'} />
      {!compact && (
        <span className="logo__word">
          POTIVA
          <span className="logo__tag">Grow Beyond Nature</span>
        </span>
      )}
    </span>
  )
}

/* ── Sprout accent ─────────────────────────────── */
export function Sprout({ size = 28, color = '#3F8F55' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 34V19" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 22c0-6 4.5-11 11-11 0 6-4.5 11-11 11Z" fill={color} />
      <path d="M20 28c0-5-3.5-9-9-9 0 5 3.5 9 9 9Z" fill="#A8D66D" />
    </svg>
  )
}

/* ── Mascot: Poti ───────────────────────────────── */
export function Mascot({
  size = 180,
  className = '',
  waving = true,
  expression = 'happy',
  blink = false,
  look = {},
}) {
  const uid = useId().replace(/:/g, '')
  const body = `mascotBody-${uid}`
  const apron = `mascotApron-${uid}`
  const leaf = `mascotLeaf-${uid}`
  return (
    <svg
      width={size}
      height={(size * 230) / 200}
      viewBox="0 0 200 230"
      className={`mascot ${className}`}
      role="img"
      aria-label="Poti, maskot tanaman POTIVA"
    >
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFFEF8" />
          <stop offset="0.65" stopColor="#FBF5E6" />
          <stop offset="1" stopColor="#EFE6D1" />
        </linearGradient>
        <linearGradient id={apron} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4B9A60" />
          <stop offset="1" stopColor="#2F7443" />
        </linearGradient>
        <linearGradient id={leaf} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C7E59C" />
          <stop offset="1" stopColor="#7CBB58" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="215" rx="52" ry="9" fill="#174D35" opacity="0.12" />

      <g className="mascot__body">
        {/* sprout */}
        <path d="M100 46V18" stroke="#3F8F55" strokeWidth="7" strokeLinecap="round" />
        <path d="M100 34c0-15 11-26 27-28 0 16-11 27-27 28Z" fill={`url(#${leaf})`} />
        <path d="M100 42c0-12-9-21-22-22 0 13 9 21 22 22Z" fill="#3F8F55" />
        <path d="M115 13c-5 5-9 9-12 15" stroke="#5E9B45" strokeWidth="1.4" opacity="0.55" fill="none" />

        {/* feet */}
        <ellipse cx="80" cy="191" rx="16" ry="8" fill="#F4ECDA" stroke="#E3D9C4" strokeWidth="1.6" />
        <ellipse cx="120" cy="191" rx="16" ry="8" fill="#F4ECDA" stroke="#E3D9C4" strokeWidth="1.6" />

        {/* arms */}
        <path
          d="M50 120C32 121 23 133 30 143c7 9 22 4 26-11Z"
          fill={`url(#${body})`}
          stroke="#E7DDC8"
          strokeWidth="1.6"
        />
        <g className={waving ? 'mascot__arm' : ''}>
          <path d="M150 114c15-7 21-21 20-31" stroke="#E7DDC8" strokeWidth="20" strokeLinecap="round" />
          <path d="M150 114c15-7 21-21 20-31" stroke="#FBF5E6" strokeWidth="16" strokeLinecap="round" />
          <circle cx="170" cy="79" r="11" fill="#FBF5E6" stroke="#E7DDC8" strokeWidth="1.6" />
        </g>

        {/* backpack (behind the body) */}
        {look.back === 'gaya-tas' && (
          <g>
            <rect x="142" y="116" width="32" height="50" rx="13" fill="#C9794D" stroke="#A85E38" strokeWidth="2" />
            <rect x="147" y="128" width="22" height="17" rx="6" fill="#A85E38" />
            <path d="M149 119c0-9 5-15 11-15s11 6 11 15" stroke="#8B5E3C" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M155 149v10M161 149v10" stroke="#F2D79B" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M151 132h14" stroke="#F2D79B" strokeWidth="2" strokeLinecap="round" opacity=".8" />
          </g>
        )}

        {/* body */}
        <path
          d="M100 34c31 0 54 27 54 70 0 48-19 88-54 88s-54-40-54-88c0-43 23-70 54-70Z"
          fill={`url(#${body})`}
        />
        <ellipse cx="76" cy="82" rx="22" ry="30" fill="#FFFFFF" opacity="0.5" />

        {/* face */}
        <g>
          {expression === 'love' ? (
            <>
              <path d="M81 97c-3-4-9-3-9 2 0 4 5 7 9 10 4-3 9-6 9-10 0-5-6-6-9-2Z" fill="#E4635A" />
              <path d="M119 97c-3-4-9-3-9 2 0 4 5 7 9 10 4-3 9-6 9-10 0-5-6-6-9-2Z" fill="#E4635A" />
            </>
          ) : blink || expression === 'sleepy' ? (
            <>
              <path d="M74 101q7 6 14 0" stroke="#20312A" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <path d="M112 101q7 6 14 0" stroke="#20312A" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            </>
          ) : expression === 'surprised' ? (
            <>
              <circle cx="81" cy="101" r="8" fill="#20312A" />
              <circle cx="119" cy="101" r="8" fill="#20312A" />
              <circle cx="83.4" cy="98.2" r="2.6" fill="#FFFFFF" />
              <circle cx="121.4" cy="98.2" r="2.6" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <circle cx="81" cy="101" r="6.2" fill="#20312A" />
              <circle cx="119" cy="101" r="6.2" fill="#20312A" />
              <circle cx="83" cy="98.6" r="2.1" fill="#FFFFFF" />
              <circle cx="121" cy="98.6" r="2.1" fill="#FFFFFF" />
            </>
          )}

          <ellipse cx="68" cy="114" rx="7.5" ry="4.2" fill="#F0A58E" opacity="0.55" />
          <ellipse cx="132" cy="114" rx="7.5" ry="4.2" fill="#F0A58E" opacity="0.55" />

          {expression === 'hungry' ? (
            <ellipse cx="100" cy="119" rx="6" ry="7.5" fill="#20312A" />
          ) : expression === 'sad' ? (
            <path d="M91 121q9-8 18 0" stroke="#20312A" strokeWidth="4" strokeLinecap="round" fill="none" />
          ) : expression === 'dirty' ? (
            <>
              <path d="M91 118q5 5 9 0t9 0" stroke="#20312A" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <circle cx="70" cy="107" r="3.4" fill="#B9A98A" opacity="0.8" />
              <circle cx="134" cy="109" r="2.6" fill="#B9A98A" opacity="0.7" />
            </>
          ) : expression === 'sleepy' ? (
            <ellipse cx="100" cy="119" rx="4.2" ry="3.2" fill="#20312A" />
          ) : expression === 'surprised' ? (
            <circle cx="100" cy="119" r="4.6" fill="#20312A" />
          ) : (
            <path d="M90 115q10 10 20 0" stroke="#20312A" strokeWidth="4" strokeLinecap="round" fill="none" />
          )}
        </g>

        {/* apron */}
        <path
          d="M100 131c-16 0-28 12-30 31-2 18 12 30 30 30s32-12 30-30c-2-19-14-31-30-31Z"
          fill={`url(#${apron})`}
        />
        <path d="M83 137c5-11 29-11 34 0" stroke="#174D35" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="86" y="155" width="28" height="19" rx="6" fill="#FFFFFF" opacity="0.14" />
        <path d="M100 164c0-6 4-10 10-10 0 6-4 10-10 10Z" fill="#EAF5E9" />

        {/* gardener vest */}
        {look.body === 'gaya-rompi' && (
          <g>
            <path
              d="M58 118c-9 26-7 64 5 80 8 2 14-3 16-11l-6-62Z"
              fill="#C9794D"
              stroke="#A85E38"
              strokeWidth="2"
            />
            <path
              d="M142 118c9 26 7 64-5 80-8 2-14-3-16-11l6-62Z"
              fill="#C9794D"
              stroke="#A85E38"
              strokeWidth="2"
            />
            <path d="M70 128l3 52M130 128l-3 52" stroke="#F2D79B" strokeWidth="2" strokeDasharray="4 5" />
            <circle cx="73" cy="150" r="2.4" fill="#FFF8E8" />
            <circle cx="127" cy="150" r="2.4" fill="#FFF8E8" />
          </g>
        )}

        {/* leaf scarf */}
        {look.neck === 'gaya-syal-daun' && (
          <g>
            <path
              d="M68 128c18 12 46 12 64 0l5 14c-22 13-52 13-74 0Z"
              fill="#A8D66D"
              stroke="#3F8F55"
              strokeWidth="2"
            />
            <path d="M95 141l-5 30 13 4 7-30" fill="#7CBB58" stroke="#3F8F55" strokeWidth="2" />
            <path d="M100 148c0-5 3-8 8-8 0 5-3 8-8 8Z" fill="#EAF5E9" />
          </g>
        )}

        {/* round glasses */}
        {look.face === 'gaya-kacamata' && (
          <g>
            <circle cx="81" cy="101" r="12.5" fill="rgba(255,255,255,0.3)" stroke="#2F3E36" strokeWidth="3" />
            <circle cx="119" cy="101" r="12.5" fill="rgba(255,255,255,0.3)" stroke="#2F3E36" strokeWidth="3" />
            <path d="M93.5 101h13" stroke="#2F3E36" strokeWidth="3" />
            <path d="M68.5 99l-10-3M131.5 99l10-3" stroke="#2F3E36" strokeWidth="3" strokeLinecap="round" />
            <path d="M75 96c2-2 5-2 7-1M113 96c2-2 5-2 7-1" stroke="#FFFFFF" strokeWidth="2" opacity=".85" strokeLinecap="round" />
          </g>
        )}

        {/* straw hat */}
        {look.hat === 'gaya-topi-jerami' && (
          <g>
            <ellipse cx="100" cy="62" rx="48" ry="13" fill="#E8C27A" stroke="#C99A4E" strokeWidth="2" />
            <path d="M66 60c0-24 14-38 34-38s34 14 34 38Z" fill="#F2D79B" />
            <path d="M66 60h68" stroke="#C99A4E" strokeWidth="5" strokeLinecap="round" />
            <path d="M80 40c5 9 12 13 20 13s15-4 20-13" stroke="#D8B36A" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M74 64c8 5 18 8 26 8s18-3 26-8" stroke="#C99A4E" strokeWidth="2" fill="none" opacity=".6" />
          </g>
        )}

        {/* flower crown */}
        {look.hat === 'gaya-mahkota-bunga' && (
          <g>
            <path d="M62 62q38 16 76 0" stroke="#3F8F55" strokeWidth="5" fill="none" strokeLinecap="round" />
            {[68, 84, 100, 116, 132].map((x, i) => (
              <g key={x} transform={`translate(${x} ${56 + (i % 2) * 4})`}>
                <circle cx="0" cy="-6" r="5" fill={i % 2 ? '#F6B7A3' : '#FFF3D0'} />
                <circle cx="6" cy="0" r="5" fill={i % 2 ? '#FFF3D0' : '#F6B7A3'} />
                <circle cx="0" cy="6" r="5" fill={i % 2 ? '#F6B7A3' : '#FFF3D0'} />
                <circle cx="-6" cy="0" r="5" fill={i % 2 ? '#FFF3D0' : '#F6B7A3'} />
                <circle r="3.2" fill="#F2B84B" />
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  )
}

/* ── Leaf used inside plants ───────────────────── */
function Leaf({ x, y, rotate = 0, scale = 1, fill = '#3F8F55', vein = true }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0 0C17-23 45-25 58-4 44 19 16 22 0 0Z"
        fill={fill}
      />
      {vein && (
        <path d="M2-1C19-4 38-7 53-5" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.28" fill="none" />
      )}
    </g>
  )
}

/* ── Potted plant ──────────────────────────────── */
const POT_TONES = {
  terra: { body: '#C9794D', bodyDark: '#B86B41', rim: '#D98B60', rimTop: '#E29B72', soil: '#6B4630' },
  cream: { body: '#EFE2C6', bodyDark: '#DECBAA', rim: '#F6EBD4', rimTop: '#FBF3E4', soil: '#6B4630' },
  sage: { body: '#9DB79B', bodyDark: '#87A286', rim: '#B3C8AF', rimTop: '#C2D4BE', soil: '#5E4534' },
}

export function PottedPlant({
  growth = 60,
  pot = 'pot-mini',
  potTone = 'terra',
  className = '',
  width = 220,
  showPot = true,
}) {
  const uid = useId().replace(/:/g, '')
  const gid = `pot-${uid}`
  const tone = POT_TONES[potTone] || POT_TONES.terra
  const big = pot === 'pot-large'
  const g = Math.max(4, Math.min(100, growth))
  const stemTop = 168 - g * 1.18
  const leafScale = 0.5 + g / 145
  const levels = g < 14 ? 1 : g < 32 ? 2 : g < 56 ? 3 : g < 78 ? 4 : 5

  return (
    <svg
      width={width}
      height={(width * 300) / 240}
      viewBox="0 0 240 300"
      className={`potted ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={tone.rimTop} />
          <stop offset="1" stopColor={tone.bodyDark} />
        </linearGradient>
      </defs>

      <ellipse cx="120" cy="282" rx={big ? 88 : 72} ry="12" fill="#174D35" opacity="0.1" />

      {/* plant */}
      <g>
        <path
          d={`M120 205C120 180 ${g > 40 ? 112 : 118} ${stemTop + 40} 120 ${stemTop}`}
          stroke="#3F8F55"
          strokeWidth={g > 55 ? 6 : 4.5}
          strokeLinecap="round"
          fill="none"
        />
        <Leaf x={120} y={stemTop + 8} rotate={-18} scale={leafScale * 0.8} fill="#A8D66D" />
        <Leaf x={120} y={stemTop + 22} rotate={198} scale={leafScale * 0.85} fill="#3F8F55" />
        {levels > 1 && (
          <>
            <Leaf x={119} y={stemTop + 44} rotate={-32} scale={leafScale} fill="#4B9A60" />
            <Leaf x={121} y={stemTop + 60} rotate={212} scale={leafScale * 1.02} fill="#2F7443" />
          </>
        )}
        {levels > 2 && (
          <>
            <Leaf x={118} y={stemTop + 84} rotate={-42} scale={leafScale * 1.05} fill="#3F8F55" />
            <Leaf x={122} y={stemTop + 104} rotate={222} scale={leafScale * 1.02} fill="#6FAE5B" />
          </>
        )}
        {levels > 3 && (
          <>
            <Leaf x={116} y={stemTop + 128} rotate={-50} scale={leafScale * 1.06} fill="#2F7443" />
            <Leaf x={124} y={stemTop + 146} rotate={230} scale={leafScale * 1.05} fill="#4B9A60" />
          </>
        )}
        {levels > 4 && (
          <>
            <Leaf x={114} y={stemTop + 166} rotate={-58} scale={leafScale * 1.02} fill="#7CBB58" />
            <Leaf x={126} y={stemTop + 178} rotate={238} scale={leafScale} fill="#3F8F55" />
          </>
        )}
      </g>

      {showPot && (
        <g>
          <path
            d={
              big
                ? 'M70 220h100l-12 54c-1 6-6 9-12 9H94c-6 0-11-3-12-9Z'
                : 'M78 220h84l-10 48c-1 5-5 8-10 8H98c-5 0-9-3-10-8Z'
            }
            fill={`url(#${gid})`}
          />
          <path
            d={big ? 'M70 220h100l-3 13H73Z' : 'M78 220h84l-3 12H81Z'}
            fill={tone.bodyDark}
            opacity="0.55"
          />
          <path
            d={big ? 'M82 232c-3 16-4 30-4 41' : 'M88 232c-2 14-3 26-3 35'}
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.18"
            fill="none"
          />
          <rect
            x={big ? 62 : 70}
            y={207}
            width={big ? 116 : 100}
            height={22}
            rx="10"
            fill={`url(#${gid})`}
          />
          <rect
            x={big ? 62 : 70}
            y={207}
            width={big ? 116 : 100}
            height={9}
            rx="4.5"
            fill={tone.rimTop}
            opacity="0.65"
          />
          <ellipse cx="120" cy="211" rx={big ? 48 : 41} ry="8" fill={tone.soil} />
          <ellipse cx="109" cy="210" rx="16" ry="3.5" fill="#7D5238" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}

/* ── Hero garden scene ─────────────────────────── */
export function HeroScene({ className = '' }) {
  const uid = useId().replace(/:/g, '')
  const terra = `heroTerra-${uid}`
  const sky = `heroSky-${uid}`
  return (
    <svg
      viewBox="0 0 640 560"
      className={`hero-scene ${className}`}
      role="img"
      aria-label="Ilustrasi taman POTIVA: Poti berdiri di samping pot besar berisi tanaman hijau"
    >
      <defs>
        <linearGradient id={terra} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#DA8A5C" />
          <stop offset="0.55" stopColor="#C9794D" />
          <stop offset="1" stopColor="#AE6139" />
        </linearGradient>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* sun + halo */}
      <circle cx="512" cy="92" r="72" fill="#F7D98B" opacity="0.28" />
      <circle cx="512" cy="92" r="44" fill="#F6D57E" />
      <circle cx="512" cy="92" r="44" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />

      {/* clouds */}
      <g fill="#FFFFFF" opacity="0.9">
        <path d="M96 104c6-18 32-20 40-4 14-12 36-2 34 16h-80c-6 0-8-8 6-12Z" />
        <path d="M420 168c5-14 26-16 33-3 12-9 29-1 27 13h-65c-5 0-6-7 5-10Z" opacity="0.75" />
        <path d="M250 72c4-11 20-13 25-2 9-7 22-1 21 10h-50c-4 0-5-5 4-8Z" opacity="0.6" />
      </g>

      {/* floating leaves */}
      <g opacity="0.55">
        <Leaf x={92} y={206} rotate={26} scale={0.55} fill="#7CBB58" />
        <Leaf x={548} y={300} rotate={-134} scale={0.5} fill="#A8D66D" />
        <Leaf x={188} y={158} rotate={-40} scale={0.38} fill="#3F8F55" />
      </g>

      {/* hills */}
      <path d="M0 410c90-58 176-52 250-20 62 27 112 25 170-2 76-35 146-30 220 22v150H0Z" fill="#D6EBC9" />
      <path d="M0 452c86-46 158-38 226-8 66 29 128 24 196-8 76-36 148-30 218 10v114H0Z" fill="#B9DEA5" />
      <path d="M0 498c100-34 190-24 268 6 74 28 158 20 232-10 56-23 102-22 140-8v74H0Z" fill="#8FC77A" />

      {/* grass tufts */}
      <g stroke="#5FA34E" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M70 506c-2-14 2-22 8-28M78 506c2-13 8-20 14-24M62 506c-5-10-10-15-16-17" />
        <path d="M560 500c-2-13 2-21 7-27M568 500c2-12 8-19 13-23" />
        <path d="M270 528c-2-10 1-17 6-22M277 528c2-10 6-15 11-18" />
      </g>

      {/* daisies */}
      <g>
        <g transform="translate(110 520)">
          <circle r="6" fill="#FFF8E8" />
          <circle r="6" fill="#FFF8E8" opacity="0" />
          <g fill="#FFF8E8">
            <circle cx="0" cy="-9" r="4.4" />
            <circle cx="8.5" cy="-3" r="4.4" />
            <circle cx="5" cy="7" r="4.4" />
            <circle cx="-5" cy="7" r="4.4" />
            <circle cx="-8.5" cy="-3" r="4.4" />
          </g>
          <circle r="4" fill="#F2B84B" />
        </g>
        <g transform="translate(524 540) scale(0.85)">
          <g fill="#FFF8E8">
            <circle cx="0" cy="-9" r="4.4" />
            <circle cx="8.5" cy="-3" r="4.4" />
            <circle cx="5" cy="7" r="4.4" />
            <circle cx="-5" cy="7" r="4.4" />
            <circle cx="-8.5" cy="-3" r="4.4" />
          </g>
          <circle r="4" fill="#F2B84B" />
        </g>
        <circle cx="250" cy="508" r="4" fill="#F6D57E" />
        <circle cx="586" cy="470" r="3.4" fill="#FFF8E8" />
      </g>

      {/* small pot left */}
      <g transform="translate(46 436) scale(0.9)">
        <ellipse cx="42" cy="96" rx="38" ry="6" fill="#174D35" opacity="0.12" />
        <path d="M18 58h48l-7 34c-1 4-4 6-8 6H33c-4 0-7-2-8-6Z" fill="#EFE2C6" />
        <rect x="12" y="48" width="60" height="14" rx="7" fill="#F6EBD4" />
        <ellipse cx="42" cy="51" rx="22" ry="5" fill="#6B4630" />
        <path d="M42 50V24" stroke="#3F8F55" strokeWidth="4" strokeLinecap="round" />
        <path d="M42 32c0-10 7-17 18-17 0 10-8 17-18 17Z" fill="#A8D66D" />
        <path d="M42 40c0-8-6-14-14-14 0 8 6 14 14 14Z" fill="#3F8F55" />
      </g>

      {/* big pot + plant */}
      <g>
        <ellipse cx="392" cy="512" rx="150" ry="20" fill="#174D35" opacity="0.12" />
        <path
          d="M298 424h188l-24 82c-2 8-9 13-17 13H339c-8 0-15-5-17-13Z"
          fill={`url(#${terra})`}
        />
        <path d="M298 424h188l-5 22H303Z" fill="#B86B41" opacity="0.5" />
        <path
          d="M330 446c-5 24-7 46-6 62"
          stroke="#FFFFFF"
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.2"
          fill="none"
        />
        <rect x="282" y="400" width="220" height="34" rx="16" fill="#C9794D" />
        <rect x="282" y="400" width="220" height="14" rx="7" fill="#E29B72" />
        <ellipse cx="392" cy="408" rx="94" ry="15" fill="#6B4630" />
        <ellipse cx="362" cy="405" rx="32" ry="6" fill="#7D5238" opacity="0.8" />

        {/* main plant */}
        <path d="M392 408V130" stroke="#2F7443" strokeWidth="9" strokeLinecap="round" />
        <path d="M392 300c-14-16-30-24-46-28" stroke="#3F8F55" strokeWidth="5" strokeLinecap="round" />
        <path d="M392 240c16-14 32-20 48-22" stroke="#3F8F55" strokeWidth="5" strokeLinecap="round" />
        <path d="M392 350c16-12 30-16 44-18" stroke="#3F8F55" strokeWidth="4" strokeLinecap="round" />
        <Leaf x={392} y={158} rotate={-12} scale={1.18} fill="#A8D66D" />
        <Leaf x={392} y={200} rotate={192} scale={1.12} fill="#3F8F55" />
        <Leaf x={348} y={274} rotate={-32} scale={1.22} fill="#4B9A60" />
        <Leaf x={440} y={222} rotate={28} scale={1.2} fill="#2F7443" />
        <Leaf x={438} y={334} rotate={22} scale={1.05} fill="#6FAE5B" />
        <Leaf x={344} y={354} rotate={-20} scale={1.0} fill="#3F8F55" />
        <Leaf x={392} y={266} rotate={-8} scale={1.06} fill="#7CBB58" />
        <Leaf x={374} y={382} rotate={-36} scale={0.82} fill="#2F7443" />
        <g>
          <circle cx="446" cy="286" r="6" fill="#E86A4E" />
          <circle cx="458" cy="300" r="5" fill="#D9553F" />
          <path d="M446 280c0-6 3-9 7-10" stroke="#3F8F55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      </g>

      {/* mascot */}
      <g transform="translate(96 296)">
        <Mascot size={180} />
      </g>

      {/* sparkles */}
      <g fill="#FFF8E8">
        <path d="M480 196l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" opacity="0.9" />
        <path d="M226 240l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.7" />
      </g>
    </svg>
  )
}

/* ── QR pattern (decorative demo code) ─────────── */
export function QRPattern({ size = 156, className = '' }) {
  const modules = []
  const n = 21
  const finder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
  const isFinderDark = (r, c) => {
    const rr = r < 7 ? r : r - (n - 7)
    const cc = c < 7 ? c : c - (n - 7)
    if (rr < 0 || cc < 0 || rr > 6 || cc > 6) return false
    const ring = Math.max(Math.abs(rr - 3), Math.abs(cc - 3))
    return ring === 3 || ring <= 1
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (finder(r, c)) continue
      const on = (r * 7 + c * 13 + r * c * 3 + (r % 3) * (c % 5)) % 5 < 2
      if (on) modules.push([r, c])
    }
  }
  const cell = 6
  const pad = 14
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-label="Contoh QR Plant ID">
      <rect width="160" height="160" rx="18" fill="#FFFFFF" />
      {[
        [0, 0],
        [0, n - 7],
        [n - 7, 0],
      ].map(([r, c]) => (
        <g key={`${r}-${c}`} transform={`translate(${pad + c * cell} ${pad + r * cell})`}>
          <rect width={cell * 7} height={cell * 7} rx="3" fill="#174D35" />
          <rect x={cell} y={cell} width={cell * 5} height={cell * 5} rx="2" fill="#FFFFFF" />
          <rect x={cell * 2} y={cell * 2} width={cell * 3} height={cell * 3} rx="1.5" fill="#174D35" />
        </g>
      ))}
      {modules.map(([r, c]) => (
        <rect
          key={`${r}-${c}`}
          x={pad + c * cell}
          y={pad + r * cell}
          width={cell - 1}
          height={cell - 1}
          rx="1.4"
          fill="#174D35"
        />
      ))}
      <g transform="translate(80 80)">
        <circle r="14" fill="#FFFFFF" />
        <path d="M0 8V-2" stroke="#3F8F55" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 1c0-5 3-8 8-8 0 5-3 8-8 8Z" fill="#A8D66D" />
        <path d="M0 5c0-4-3-7-7-7 0 4 3 7 7 7Z" fill="#3F8F55" />
      </g>
    </svg>
  )
}

/* ── Product illustrations ─────────────────────── */
const COSMETIC_SLOT_BY_ART = {
  'gaya-topi-jerami': 'hat',
  'gaya-mahkota-bunga': 'hat',
  'gaya-kacamata': 'face',
  'gaya-syal-daun': 'neck',
  'gaya-rompi': 'body',
  'gaya-tas': 'back',
}

export function ProductArt({ type, className = '' }) {
  const cosmeticSlot = COSMETIC_SLOT_BY_ART[type]
  if (cosmeticSlot) {
    return (
      <span className={`cosmetic-art ${className}`.trim()} aria-hidden="true">
        <Mascot size={140} waving={false} look={{ [cosmeticSlot]: type }} />
      </span>
    )
  }

  const common = (children, bg = '#EAF5E9') => (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill={bg} />
      <ellipse cx="100" cy="168" rx="46" ry="8" fill="#174D35" opacity="0.08" />
      {children}
    </svg>
  )

  switch (type) {
    case 'pot-mini':
      return common(
        <>
          <path d="M72 102h56l-7 52c-1 5-4 8-9 8h-24c-5 0-8-3-9-8Z" fill="#C9794D" />
          <path d="M72 102h56l-2 14H74Z" fill="#B86B41" />
          <path d="M82 116c-2 16-2 26-1 34" stroke="#FFF" strokeWidth="5" strokeLinecap="round" opacity="0.2" />
          <rect x="66" y="90" width="68" height="16" rx="8" fill="#D98B60" />
          <ellipse cx="100" cy="93" rx="26" ry="5" fill="#6B4630" />
          <path d="M100 90V50" stroke="#3F8F55" strokeWidth="5" strokeLinecap="round" />
          <path d="M100 62c0-13 9-22 24-22 0 13-10 22-24 22Z" fill="#A8D66D" />
          <path d="M100 76c0-10-7-17-18-17 0 11 8 18 18 17Z" fill="#3F8F55" />
          <path d="M54 98c12-6 22-6 30-2" stroke="#EAF5E9" strokeWidth="4" strokeLinecap="round" opacity=".8" />
        </>,
      )
    case 'pot-large':
      return common(
        <>
          <path d="M62 96h76l-10 60c-1 5-5 8-10 8H82c-5 0-9-3-10-8Z" fill="#C9794D" />
          <path d="M62 96h76l-3 16H65Z" fill="#B86B41" opacity=".65" />
          <rect x="55" y="83" width="90" height="18" rx="9" fill="#D98B60" />
          <ellipse cx="100" cy="86" rx="34" ry="6" fill="#6B4630" />
          <path d="M100 84V36" stroke="#2F7443" strokeWidth="6" strokeLinecap="round" />
          <path d="M100 52c0-15 11-25 27-25 0 15-11 25-27 25Z" fill="#A8D66D" />
          <path d="M100 68c0-12-9-21-21-21 0 13 9 21 21 21Z" fill="#3F8F55" />
          <path d="M100 46c0-10-6-16-14-17" stroke="#2F7443" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".6" />
          <path d="M50 114c8-10 14-14 20-15" stroke="#FFF8E8" strokeWidth="5" strokeLinecap="round" opacity=".7" />
        </>,
      )
    case 'seed-chili':
      return common(
        <>
          <path d="M60 46h80v108a8 8 0 0 1-8 8H68a8 8 0 0 1-8-8Z" fill="#FFF8E8" stroke="#E7DCC5" strokeWidth="2" />
          <path d="M60 46h80v30H60Z" fill="#174D35" />
          <path d="M60 46h80v8H60Z" fill="#A8D66D" opacity=".7" />
          <text x="100" y="65" textAnchor="middle" fontFamily="Poppins" fontSize="10" fontWeight="700" fill="#EAF5E9" letterSpacing="1.5">POTIVA SEED</text>
          <g transform="translate(100 112)">
            <path d="M-10-22c12-8 26 0 26 16 0 18-13 28-26 30-6-8-8-38 0-46Z" fill="#E86A4E" />
            <path d="M-4-20c6-2 10 2 9 8" stroke="#D9553F" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M-8-22c-1-8 5-13 11-12" stroke="#3F8F55" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M3-34c0-6 4-10 10-10 0 6-4 10-10 10Z" fill="#A8D66D" />
          </g>
          <text x="100" y="160" textAnchor="middle" fontFamily="Poppins" fontSize="12" fontWeight="700" fill="#174D35">CABAI MILO</text>
          <text x="100" y="174" textAnchor="middle" fontFamily="Poppins" fontSize="7" fill="#66756D">10 BENIH · MUDAH DITANAM</text>
        </>,
        '#F5EBDA',
      )
    case 'seed-tomato':
      return common(
        <>
          <path d="M60 46h80v108a8 8 0 0 1-8 8H68a8 8 0 0 1-8-8Z" fill="#FFF8E8" stroke="#E7DCC5" strokeWidth="2" />
          <path d="M60 46h80v30H60Z" fill="#8B5E3C" />
          <path d="M60 46h80v8H60Z" fill="#E8C99B" opacity=".8" />
          <text x="100" y="65" textAnchor="middle" fontFamily="Poppins" fontSize="10" fontWeight="700" fill="#FFF8E8" letterSpacing="1.5">POTIVA SEED</text>
          <g transform="translate(100 115)">
            <circle r="27" fill="#D9553F" />
            <circle cx="-8" cy="-7" r="7" fill="#E86A4E" opacity=".65" />
            <path d="M0-27l-8-9 8 3 8-3Z" fill="#3F8F55" />
            <path d="M0-27c-6-9-15-11-22-10 2 8 10 13 22 10Z" fill="#6FAE5B" />
          </g>
          <text x="100" y="160" textAnchor="middle" fontFamily="Poppins" fontSize="12" fontWeight="700" fill="#174D35">TOMAT CERI</text>
          <text x="100" y="174" textAnchor="middle" fontFamily="Poppins" fontSize="7" fill="#66756D">12 BENIH · MANIS</text>
        </>,
        '#F5EBDA',
      )
    case 'fertilizer':
      return common(
        <>
          <path d="M64 66h72l6 90a8 8 0 0 1-8 9H66a8 8 0 0 1-8-9Z" fill="#8B5E3C" />
          <path d="M64 66h72l2 26H62Z" fill="#6B4630" />
          <path d="M76 57h48v14H76Z" fill="#A87550" rx="4" />
          <path d="M82 52c0-6 5-10 10-10M118 52c0-6-5-10-10-10" stroke="#A87550" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="72" y="102" width="56" height="46" rx="10" fill="#EAF5E9" />
          <path d="M100 138v-18" stroke="#3F8F55" strokeWidth="4" strokeLinecap="round" />
          <path d="M100 126c0-8 5-13 13-13 0 8-5 13-13 13Z" fill="#A8D66D" />
          <path d="M100 132c0-6-4-10-10-10 0 6 4 10 10 10Z" fill="#3F8F55" />
          <text x="100" y="96" textAnchor="middle" fontFamily="Poppins" fontSize="11" fontWeight="700" fill="#FFF8E8">ORGANIK</text>
          <text x="100" y="166" textAnchor="middle" fontFamily="Poppins" fontSize="8" fill="#FFF8E8" opacity=".85">250 g · MEDIA &amp; TANAMAN</text>
        </>,
        '#F3E8D3',
      )
    case 'sprayer':
      return common(
        <>
          <rect x="78" y="82" width="44" height="78" rx="14" fill="#EAF5E9" stroke="#CFE3D0" strokeWidth="2" />
          <rect x="84" y="104" width="32" height="38" rx="6" fill="#FFFFFF" opacity=".7" />
          <path d="M78 96h44" stroke="#A8D66D" strokeWidth="6" opacity=".8" />
          <path d="M90 82V66h20v16" fill="#3F8F55" />
          <path d="M110 66h20v10h-20Z" fill="#2F7443" />
          <path d="M126 72c12 2 16 10 10 18" stroke="#2F7443" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M138 90l-3 10M133 92l-2 8M128 93l-1 7" stroke="#BFE6F0" strokeWidth="3" strokeLinecap="round" />
          <path d="M88 128h24M88 138h16" stroke="#AEC9B2" strokeWidth="3" strokeLinecap="round" />
        </>,
        '#E4F2F4',
      )
    case 'soil':
      return common(
        <>
          <path d="M62 74h76l8 84a8 8 0 0 1-8 9H62a8 8 0 0 1-8-9Z" fill="#8B5E3C" />
          <path d="M62 74h76l2 20H60Z" fill="#6B4630" />
          <path d="M74 74c-2-12 6-20 26-20s28 8 26 20" fill="#A87550" />
          <text x="100" y="122" textAnchor="middle" fontFamily="Poppins" fontSize="10" fontWeight="700" fill="#FFF8E8">MEDIA</text>
          <text x="100" y="136" textAnchor="middle" fontFamily="Poppins" fontSize="10" fontWeight="700" fill="#FFF8E8">TANAM</text>
          <path d="M88 150c4 3 8 4 12 4s9-1 13-4" stroke="#FFF8E8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".8" />
          <path d="M120 60l16-12M126 62l18-4" stroke="#3F8F55" strokeWidth="3" strokeLinecap="round" />
          <path d="M136 48c6-4 12-3 16 1-4 5-10 6-16 2Z" fill="#A8D66D" />
        </>,
        '#EFE5D2',
      )
    case 'hanging-pot':
      return common(
        <>
          <path d="M100 40v22M68 62l32-18 32 18" stroke="#C9A87C" strokeWidth="3" fill="none" />
          <path d="M68 62l20 40M132 62l-20 40" stroke="#C9A87C" strokeWidth="3" />
          <path d="M76 96h48l-6 40c-1 5-5 8-10 8h-16c-5 0-9-3-10-8Z" fill="#9DB79B" />
          <rect x="70" y="88" width="60" height="14" rx="7" fill="#B3C8AF" />
          <ellipse cx="100" cy="91" rx="22" ry="5" fill="#5E4534" />
          <path d="M100 88V64" stroke="#3F8F55" strokeWidth="4" strokeLinecap="round" />
          <path d="M100 72c0-10 7-17 18-17 0 10-8 17-18 17Z" fill="#A8D66D" />
          <path d="M100 82c0-8-6-13-14-13 0 8 6 13 14 13Z" fill="#3F8F55" />
          <path d="M100 110c-8 8-9 16-6 24M100 110c8 8 9 16 6 24" stroke="#3F8F55" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
        </>,
        '#EAF5E9',
      )
    default:
      return common(
        <>
          <PottedPlant width={150} growth={55} />
        </>,
      )
  }
}

/* ── E-Book cover ──────────────────────────────── */
export function EbookCover({ ebook, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const gid = `book-${uid}`
  const [from, to] = ebook.palette
  const words = ebook.title.split(' ')
  const lines = []
  let line = ''
  words.forEach((word) => {
    if ((line + ' ' + word).trim().length > 13 && line) {
      lines.push(line)
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  })
  if (line) lines.push(line)
  return (
    <svg
      viewBox="0 0 300 400"
      className={`ebook-cover ${className}`}
      role="img"
      aria-label={`Sampul e-book ${ebook.title}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${gid})`} />
      <circle cx="252" cy="70" r="86" fill="#FFF8E8" opacity="0.12" />
      <circle cx="278" cy="330" r="104" fill="#174D35" opacity="0.12" />
      <g fill="none" stroke="#FFF8E8" strokeWidth="1.6" opacity="0.28">
        <path d="M-10 330c60-44 108-42 160-12s100 26 160-8" />
        <path d="M-10 356c60-44 108-42 160-12s100 26 160-8" />
        <path d="M-10 382c60-44 108-42 160-12s100 26 160-8" />
      </g>
      <g opacity="0.9" transform="translate(240 154) rotate(18)">
        <path d="M0 0c0-26 19-45 46-45 0 26-19 45-46 45Z" fill="#FFF8E8" opacity="0.2" />
        <path d="M0 14c0-20-15-35-35-35 0 21 15 35 35 35Z" fill="#FFF8E8" opacity="0.14" />
      </g>
      <rect x="0" y="0" width="12" height="400" fill="#000" opacity="0.14" />
      <rect x="300" y="0" width="5" height="400" fill="#FFFFFF" opacity="0.12" />

      <text x="38" y="58" fontFamily="Poppins" fontSize="10" fontWeight="600" letterSpacing="3" fill="#FFF8E8" opacity=".85">
        POTIVA E-LIBRARY
      </text>
      <rect x="38" y="72" width="42" height="3" rx="1.5" fill="#FFF8E8" opacity=".6" />
      <text x="38" y="112" fontFamily="Poppins" fontSize="10" fontWeight="600" letterSpacing="1.4" fill="#FFF8E8" opacity=".75">
        {ebook.category.toUpperCase()}
      </text>

      <g fontFamily="Poppins" fontWeight="700" fill="#FFFDF5">
        {lines.slice(0, 4).map((text, i) => (
          <text key={i} x="38" y={172 + i * 42} fontSize="29" letterSpacing="-1">
            {text}
          </text>
        ))}
      </g>

      <g transform="translate(38 322)">
        <path d="M0 26c0-8 5-14 14-14 0 8-6 14-14 14Z" fill="#FFF8E8" opacity=".8" />
        <path d="M0 26V10" stroke="#FFF8E8" strokeWidth="2" opacity=".6" />
        <text x="24" y="26" fontFamily="Poppins" fontSize="11" fontWeight="500" fill="#FFF8E8" opacity=".9">
          {ebook.author}
        </text>
      </g>
      <g transform="translate(38 356)" opacity=".6">
        <rect width="18" height="18" rx="5" fill="#FFF8E8" opacity=".2" />
        <path d="M9 14V6" stroke="#FFF8E8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 8c0-3 2-4.5 4.5-4.5 0 3-2 4.5-4.5 4.5Z" fill="#FFF8E8" />
      </g>
      <text x="62" y="370" fontFamily="Poppins" fontSize="9" fontWeight="600" letterSpacing="2" fill="#FFF8E8" opacity=".6">
        POTIVA
      </text>
    </svg>
  )
}

/* ── Journal “photo” illustration ──────────────── */
export function JournalPhoto({ entry, className = '' }) {
  const palette = [
    ['#EAF5E9', '#B9DEA5'],
    ['#FFF3DC', '#E8C99B'],
    ['#E4F2F4', '#B9DDE4'],
    ['#F3E8D3', '#D9BE9A'],
  ]
  const [bg, ground] = palette[(entry.photo || 1) % palette.length]
  const stage = [10, 32, 55, 78][(entry.photo || 1) % 4]
  return (
    <svg viewBox="0 0 400 260" className={`journal-photo ${className}`} aria-hidden="true">
      <rect width="400" height="260" fill={bg} />
      <circle cx="320" cy="60" r="46" fill="#FFF8E8" opacity=".55" />
      <circle cx="70" cy="52" r="26" fill="#FFFFFF" opacity=".35" />
      <path d="M0 200c70-30 130-28 196-6 60 20 132 18 204-10v76H0Z" fill={ground} opacity=".65" />
      <ellipse cx="200" cy="216" rx="86" ry="12" fill="#174D35" opacity=".1" />
      <g transform="translate(80 34)">
        <PottedPlant width={240} growth={stage} pot={entry.photo >= 4 ? 'pot-large' : 'pot-mini'} />
      </g>
      <g fill="#FFFFFF" opacity=".5">
        <circle cx="46" cy="150" r="5" />
        <circle cx="58" cy="170" r="3" />
        <circle cx="352" cy="188" r="4" />
      </g>
      <rect x="16" y="16" width="64" height="20" rx="10" fill="#FFF8E8" opacity=".8" />
      <text x="30" y="30" fontFamily="Poppins" fontSize="9" fontWeight="600" fill="#3F5F4D">
        POTIVA
      </text>
    </svg>
  )
}

/* ── Empty state art ───────────────────────────── */
export function EmptyArt({ variant = 'journal', className = '' }) {
  const list = {
    journal: '📔',
    cart: '🛒',
    garden: '🌱',
    ebook: '📚',
    search: '🔎',
    tasks: '✅',
  }
  return (
    <svg viewBox="0 0 200 170" className={`empty-art ${className}`} aria-hidden="true">
      <ellipse cx="100" cy="146" rx="62" ry="10" fill="#174D35" opacity=".08" />
      <circle cx="100" cy="78" r="58" fill="#EAF5E9" />
      <circle cx="100" cy="78" r="58" fill="none" stroke="#A8D66D" strokeWidth="2" strokeDasharray="5 7" opacity=".7" />
      <path d="M100 118V74" stroke="#3F8F55" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 88c0-15 11-26 27-26 0 15-11 26-27 26Z" fill="#A8D66D" />
      <path d="M100 102c0-12-9-21-21-21 0 13 9 21 21 21Z" fill="#3F8F55" />
      <text x="100" y="150" textAnchor="middle" fontFamily="Poppins" fontSize="13" fontWeight="600" fill="#174D35" opacity=".7">
        {variant === 'search' ? 'Belum ketemu' : 'Masih kosong'}
      </text>
      <text x="100" y="164" textAnchor="middle" fontFamily="Poppins" fontSize="20">
        {list[variant] || '🌿'}
      </text>
    </svg>
  )
}

/* ── Decorative leaf backdrop for CTA/footer ───── */
export function LeafPattern({ className = '' }) {
  return (
    <svg viewBox="0 0 600 400" className={className} aria-hidden="true">
      <g fill="none" stroke="#FFF8E8" strokeWidth="1.6" opacity=".18">
        <path d="M0 330c100-70 180-66 260-20s180 46 340-30" />
        <path d="M0 370c100-70 180-66 260-20s180 46 340-30" />
        <path d="M0 290c100-70 180-66 260-20s180 46 340-30" />
      </g>
      <g fill="#A8D66D" opacity=".2">
        <path d="M60 120C60 60 105 20 170 16c0 62-46 102-110 104Z" />
        <path d="M520 250c0-48 36-80 88-84 0 50-37 82-88 84Z" />
        <path d="M300 90c0-30 22-50 54-52 0 31-23 51-54 52Z" opacity=".5" />
      </g>
    </svg>
  )
}
