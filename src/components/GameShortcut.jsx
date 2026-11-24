import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Gamepad2, Move, Play, Smartphone, Sparkles } from 'lucide-react'

export default function GameShortcut({ app = false }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const play = () => {
    setOpen(false)
    navigate('/garden?play=1')
  }

  return (
    <div
      ref={rootRef}
      className={`game-shortcut ${app ? 'game-shortcut--app' : ''}`}
    >
      {open && (
        <div className="game-shortcut__pop" role="dialog" aria-label="Pintasan game POTIVA">
          <span className="game-shortcut__eyebrow">
            <Sparkles size={12} /> Mode petualangan
          </span>
          <h3>Kebun Poti</h3>
          <p>
            Jelajahi kebun, rawat tanaman, dan kumpulkan embun. Progresnya langsung
            masuk ke kebun virtualmu.
          </p>
          <div className="game-shortcut__hints">
            <span><Move size={13} /> Joystick kiri</span>
            <span><Gamepad2 size={13} /> Aksi di kanan</span>
            <span><Smartphone size={13} /> Landscape</span>
          </div>
          <button type="button" className="game-shortcut__play" onClick={play} autoFocus>
            <Play size={17} fill="currentColor" /> Mainkan sekarang
          </button>
          <Link to="/garden" className="game-shortcut__link" onClick={() => setOpen(false)}>
            Buka My Garden <ArrowUpRight size={14} />
          </Link>
        </div>
      )}

      <button
        type="button"
        className="game-shortcut__fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Buka pintasan game POTIVA Garden"
      >
        <Gamepad2 size={25} strokeWidth={2.2} />
        <span>Game</span>
      </button>
    </div>
  )
}
