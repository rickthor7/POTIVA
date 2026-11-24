import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const toast = useCallback(
    (message, options = {}) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const item = {
        id,
        message,
        title: options.title,
        type: options.type || 'success',
        duration: options.duration ?? 3600,
      }
      setToasts((list) => [...list.slice(-2), item])
      timers.current[id] = setTimeout(() => dismiss(id), item.duration)
      return id
    },
    [dismiss],
  )

  const icons = {
    success: <CheckCircle2 />,
    info: <Info />,
    error: <AlertCircle />,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__icon">{icons[t.type]}</span>
            <div className="toast__body">
              {t.title && <strong>{t.title}</strong>}
              <span>{t.message}</span>
            </div>
            <button className="toast__close" onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
              <X />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
