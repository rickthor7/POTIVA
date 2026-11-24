export const pad = (n) => String(n).padStart(2, '0')

export const toISO = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const addDays = (iso, days) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export const todayISO = () => toISO(new Date())

export const formatDateID = (iso, opts = {}) => {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: opts.year === false ? undefined : 'numeric',
  })
}

export const formatDateShort = (iso) => {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export const weekdayShort = (iso) => {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('id-ID', { weekday: 'short' })
}

export const dayNumber = (iso) => Number(iso.slice(8, 10))

export const relativeDay = (iso) => {
  const today = todayISO()
  if (iso === today) return 'Hari ini'
  if (iso === addDays(today, 1)) return 'Besok'
  if (iso === addDays(today, -1)) return 'Kemarin'
  return formatDateShort(iso)
}

export const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const secondsLeft = (timestamp, cooldownMs) => {
  if (!timestamp) return 0
  const left = cooldownMs - (Date.now() - timestamp)
  return left > 0 ? Math.ceil(left / 1000) : 0
}

export const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/** Downscale + compress an uploaded photo so it fits comfortably in localStorage. */
export const compressImage = async (file, maxSize = 900, quality = 0.78) => {
  const dataUrl = await readFileAsDataURL(file)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
