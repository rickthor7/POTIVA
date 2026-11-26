import { useMemo, useState } from 'react'
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  History,
  Info,
  Plus,
  Sun,
  Sprout,
  Settings2,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import TaskRow from '../components/TaskRow'
import Modal from '../components/Modal'
import { TASK_TYPES, MASCOT_TIPS } from '../data/appData'
import { useApp } from '../store/AppStore'
import { useToast } from '../components/Toast'
import { usePageTitle } from '../lib/usePageTitle'
import {
  addDays,
  dayNumber,
  formatDateID,
  relativeDay,
  todayISO,
  weekdayShort,
} from '../lib/utils'
import { Mascot } from '../components/illustrations'

const REPEATS = ['Sekali', 'Harian', 'Setiap 2 hari', 'Mingguan', '2 minggu sekali', 'Bulanan']

export default function Care() {
  usePageTitle('Plant Care')
  const { plants, tasks, settings, careHistory, getPlant, potiLook, actions } = useApp()
  const toast = useToast()
  const today = todayISO()
  const [selectedDate, setSelectedDate] = useState(today)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    plantId: plants[0]?.id || '',
    type: 'water',
    title: '',
    date: addDays(today, 1),
    time: '08:00',
    repeat: 'Setiap 2 hari',
  })

  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i - 1)),
    [today],
  )

  const tasksByDate = (date) => tasks.filter((t) => t.date === date)
  const dayTasks = tasksByDate(selectedDate)
  const todayTasks = tasksByDate(today)
  const doneToday = todayTasks.filter((t) => t.status === 'done').length
  const progress = todayTasks.length ? Math.round((doneToday / todayTasks.length) * 100) : 0

  const upcoming = tasks
    .filter((t) => t.date > today && t.status === 'todo')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submitTask = (e) => {
    e.preventDefault()
    if (!form.plantId) {
      toast('Pilih tanaman terlebih dahulu.', { type: 'error' })
      return
    }
    actions.addTask(form)
    toast(`${TASK_TYPES[form.type]?.label || 'Perawatan'} dijadwalkan ${relativeDay(form.date)} pukul ${form.time}.`, {
      title: 'Jadwal ditambahkan 📅',
    })
    setModalOpen(false)
    setForm((f) => ({ ...f, title: '' }))
  }

  const updateSetting = (key, value) => {
    actions.updateSettings({ [key]: value })
  }

  return (
    <div className="container page page--app">
      <PageHeader
        eyebrow="Plant Care"
        title="Perawatan yang menemani, bukan menghakimi."
        subtitle="Jadwal di POTIVA adalah rekomendasi. Sesuaikan dengan kondisi media tanam dan ritme harianmu."
        actions={
          <button className="btn btn--primary" onClick={() => setModalOpen(true)}>
            <Plus size={17} /> Tambah jadwal
          </button>
        }
      />

      <div className="care-grid">
        <div className="care-main">
          <section className="card card--pad care-calendar">
            <div className="panel-head">
              <div>
                <h2>
                  <CalendarDays size={18} /> Agenda perawatan
                </h2>
                <p>{formatDateID(selectedDate)}</p>
              </div>
              <div className="care-calendar__nav">
                <button
                  className="icon-btn"
                  aria-label="Hari sebelumnya"
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                >
                  <ChevronLeft size={18} />
                </button>
                <button className="btn btn--sm btn--outline" onClick={() => setSelectedDate(today)}>
                  Hari ini
                </button>
                <button
                  className="icon-btn"
                  aria-label="Hari berikutnya"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="week-strip">
              {week.map((date) => {
                const items = tasksByDate(date)
                const pending = items.filter((t) => t.status === 'todo').length
                const active = date === selectedDate
                return (
                  <button
                    key={date}
                    className={`week-day ${active ? 'is-active' : ''} ${date === today ? 'is-today' : ''}`}
                    onClick={() => setSelectedDate(date)}
                    aria-label={`${weekdayShort(date)} ${dayNumber(date)}`}
                  >
                    <span>{weekdayShort(date)}</span>
                    <strong>{dayNumber(date)}</strong>
                    <span className="week-day__dots">
                      {items.slice(0, 3).map((t) => (
                        <i key={t.id} className={t.status === 'done' ? 'is-done' : ''} />
                      ))}
                      {items.length === 0 && <em>–</em>}
                    </span>
                    {pending > 0 && date === today && <span className="week-day__badge">{pending}</span>}
                  </button>
                )
              })}
            </div>

            {selectedDate === today && (
              <div className="care-progress">
                <div className="care-progress__ring" style={{ '--p': `${progress}%` }}>
                  <span>{progress}%</span>
                </div>
                <div>
                  <strong>
                    {doneToday} dari {todayTasks.length} tugas selesai
                  </strong>
                  <p>
                    {progress === 100
                      ? 'Semua beres! Istirahat dan biarkan tanaman bernapas.'
                      : 'Tidak perlu buru-buru. Selesaikan yang paling mendesak dulu.'}
                  </p>
                </div>
              </div>
            )}

            <div className="task-list">
              {dayTasks.length === 0 ? (
                <div className="care-empty">
                  <span>
                    <Sun size={22} />
                  </span>
                  <div>
                    <strong>Hari yang tenang.</strong>
                    <p>Tidak ada jadwal untuk tanggal ini. Kamu bisa menambah perawatan baru.</p>
                  </div>
                  <button className="btn btn--sm btn--outline" onClick={() => setModalOpen(true)}>
                    Tambah
                  </button>
                </div>
              ) : (
                dayTasks.map((task) => (
                  <TaskRow key={task.id} task={task} plant={getPlant(task.plantId)} />
                ))
              )}
            </div>
          </section>

          <section className="card card--pad care-upcoming">
            <div className="panel-head">
              <div>
                <h2>
                  <Clock size={18} /> Selanjutnya
                </h2>
                <p>Rencana perawatan beberapa hari ke depan.</p>
              </div>
              <span className="badge">{upcoming.length} jadwal</span>
            </div>
            {upcoming.length === 0 ? (
              <p className="care-upcoming__empty">Belum ada jadwal berikutnya. Tambahkan agar tidak lupa.</p>
            ) : (
              <div className="upcoming-list">
                {upcoming.map((task) => {
                  const plant = getPlant(task.plantId)
                  const meta = TASK_TYPES[task.type] || TASK_TYPES.check
                  return (
                    <div className="upcoming-row" key={task.id}>
                      <span className="upcoming-row__date">
                        <strong>{dayNumber(task.date)}</strong>
                        <small>{weekdayShort(task.date)}</small>
                      </span>
                      <span className="upcoming-row__icon" style={{ '--tint': meta.color }}>
                        {task.type === 'water' ? <Droplets size={16} /> : task.type === 'light' ? <Sun size={16} /> : <Sprout size={16} />}
                      </span>
                      <div className="upcoming-row__info">
                        <strong>{task.title}</strong>
                        <span>
                          {plant?.name} · {task.time}
                        </span>
                      </div>
                      <span className="upcoming-row__when">{relativeDay(task.date)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="care-side">
          <section className="card card--pad care-settings">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <Settings2 size={18} /> Pengingat
                </h2>
                <p>Atur kapan dan bagaimana kami mengingatkan.</p>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <strong>Pengingat perawatan</strong>
                <span>Notifikasi untuk tugas yang jatuh tempo.</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.reminderOn}
                  onChange={(e) => {
                    updateSetting('reminderOn', e.target.checked)
                    toast(e.target.checked ? 'Pengingat perawatan aktif.' : 'Pengingat perawatan dimatikan.', {
                      type: 'info',
                    })
                  }}
                  aria-label="Pengingat perawatan"
                />
                <span className="toggle-track" />
              </label>
            </div>
            <div className="setting-row">
              <div>
                <strong>Jurnal & catatan</strong>
                <span>Ajakan mencatat setelah beberapa hari.</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.journalOn}
                  onChange={(e) => updateSetting('journalOn', e.target.checked)}
                  aria-label="Pengingat jurnal"
                />
                <span className="toggle-track" />
              </label>
            </div>
            <div className="setting-row">
              <div>
                <strong>Web push</strong>
                <span>Butuh izin browser saat pertama dipakai.</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.pushOn}
                  onChange={(e) => {
                    updateSetting('pushOn', e.target.checked)
                    if (e.target.checked)
                      toast('Web push diaktifkan (demo). Di produksi, izin browser akan diminta.', {
                        type: 'info',
                      })
                  }}
                  aria-label="Web push"
                />
                <span className="toggle-track" />
              </label>
            </div>
            <div className="care-settings__time">
              <label htmlFor="reminder-time">
                <Bell size={15} /> Jam pengingat utama
              </label>
              <input
                id="reminder-time"
                type="time"
                className="input"
                value={settings.reminderTime}
                onChange={(e) => updateSetting('reminderTime', e.target.value)}
              />
            </div>
            <p className="care-settings__note">
              <Info size={13} /> Kami membatasi frekuensi notifikasi agar tidak mengganggu.
            </p>
          </section>

          <section className="card card--pad">
            <div className="panel-head panel-head--tight">
              <div>
                <h2>
                  <History size={18} /> Riwayat
                </h2>
                <p>Perawatan yang sudah tercatat.</p>
              </div>
            </div>
            <ul className="history-list">
              {careHistory.slice(0, 5).map((h) => {
                const plant = getPlant(h.plantId)
                return (
                  <li key={h.id}>
                    <span className="history-list__icon">
                      <Check size={13} />
                    </span>
                    <div>
                      <strong>{h.label}</strong>
                      <span>
                        {plant?.name} ·{' '}
                        {new Date(h.at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="card card--pad tip-card tip-card--care">
            <div className="tip-card__mascot">
              <Mascot size={82} waving={false} look={potiLook} />
            </div>
            <div className="tip-card__body">
              <span className="eyebrow">Kata Poti</span>
              <p>{MASCOT_TIPS[new Date().getDay() % MASCOT_TIPS.length]}</p>
            </div>
          </section>
        </aside>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah jadwal perawatan" subtitle="Buat pengingat yang realistis dengan rutinitasmu.">
        <form className="form-grid" onSubmit={submitTask}>
          <div className="field field--full">
            <label htmlFor="task-plant">Tanaman</label>
            <select id="task-plant" className="select" value={form.plantId} onChange={(e) => set('plantId', e.target.value)}>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-type">Jenis perawatan</label>
            <select id="task-type" className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {Object.entries(TASK_TYPES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-repeat">Ulangi</label>
            <select id="task-repeat" className="select" value={form.repeat} onChange={(e) => set('repeat', e.target.value)}>
              {REPEATS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor="task-title">Catatan tugas (opsional)</label>
            <input
              id="task-title"
              className="input"
              placeholder="Contoh: Cek kelembapan 2 cm dari permukaan"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="task-date">Tanggal</label>
            <input id="task-date" type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="task-time">Jam</label>
            <input id="task-time" type="time" className="input" value={form.time} onChange={(e) => set('time', e.target.value)} />
          </div>
          <div className="field field--full modal__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn--primary">
              <Plus size={16} /> Simpan jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
