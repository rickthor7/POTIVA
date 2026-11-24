import { Check, Droplets, Sun, Search, Scissors, Sprout, SkipForward, Clock } from 'lucide-react'
import { TASK_TYPES } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useToast } from './Toast'
import { relativeDay } from '../lib/utils'

const ICONS = {
  water: Droplets,
  fertilize: Sprout,
  light: Sun,
  check: Search,
  prune: Scissors,
}

export default function TaskRow({ task, plant, showDate = false, compact = false }) {
  const { actions } = useApp()
  const toast = useToast()
  const meta = TASK_TYPES[task.type] || TASK_TYPES.check
  const Icon = ICONS[task.type] || Search
  const done = task.status === 'done'
  const skipped = task.status === 'skipped'

  const complete = () => {
    actions.completeTask(task.id)
    toast(`+${meta.xp} XP · +${meta.coins} koin untuk ${plant?.name || 'tanamanmu'}.`, {
      title: 'Perawatan tercatat ✅',
    })
  }

  const skip = () => {
    actions.skipTask(task.id)
    toast('Tugas dilewati. Kamu bisa mengatur ulang jadwal kapan saja.', {
      type: 'info',
      title: 'Dilewati',
    })
  }

  return (
    <div
      className={`task-row ${done ? 'is-done' : ''} ${skipped ? 'is-skipped' : ''} ${
        compact ? 'task-row--compact' : ''
      }`}
    >
      <span className="task-row__icon" style={{ '--tint': meta.color }}>
        <Icon size={19} />
      </span>
      <div className="task-row__info">
        <strong>{task.title}</strong>
        <span className="task-row__sub">
          {plant?.name || 'Tanaman'}
          <i>·</i>
          <Clock size={12} /> {task.time}
          {showDate && (
            <>
              <i>·</i>
              {relativeDay(task.date)}
            </>
          )}
        </span>
        <span className="task-row__repeat">{task.repeat}</span>
      </div>
      <div className="task-row__actions">
        {done ? (
          <span className="badge task-row__badge" style={{ background: 'var(--mint)', color: 'var(--leaf-dark)' }}>
            <Check size={13} /> Selesai
          </span>
        ) : skipped ? (
          <span className="badge badge--outline">
            <SkipForward size={13} /> Terlewat
          </span>
        ) : (
          <>
            <button className="btn btn--primary btn--sm" onClick={complete}>
              <Check size={14} /> <span className="task-row__done-label">Selesai</span>
            </button>
            <button className="btn btn--ghost btn--sm task-row__skip" onClick={skip} aria-label="Lewati tugas">
              <SkipForward size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
