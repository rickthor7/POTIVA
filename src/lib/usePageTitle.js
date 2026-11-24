import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · POTIVA` : 'POTIVA — Grow Beyond Nature'
    return () => {
      document.title = 'POTIVA — Grow Beyond Nature'
    }
  }, [title])
}
