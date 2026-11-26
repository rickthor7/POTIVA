/**
 * Generate and download a cute illustrated PNG voucher ticket for POTIVA discounts.
 */
export function downloadCuteVoucherImage(voucher, ownerName = 'Sahabat POTIVA') {
  if (typeof document === 'undefined' || !voucher) return false

  const W = 1200
  const H = 680
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  const isShop = voucher.target === 'shop'
  const accent = isShop ? '#2F7443' : '#2C7A8C'
  const accentDark = isShop ? '#174D35' : '#194F5C'
  const pastelBg = isShop ? '#F2FAE8' : '#ECF8FC'
  const badgeTint = isShop ? '#A8D66D' : '#8AD3E6'

  const roundRect = (x, y, w, h, r) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
  }

  // Soft pastel outer backdrop
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, pastelBg)
  grad.addColorStop(1, '#FFF7DF')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Floating decorative pastel polka dots
  const dots = [
    [95, 86, 26, '#DDF0C4'],
    [1105, 92, 34, '#FCE4AE'],
    [140, 602, 22, '#F7D2C4'],
    [1085, 594, 28, '#D2ECF7'],
    [520, 44, 14, '#E2F2CA'],
    [820, 636, 16, '#FAD4C0'],
  ]
  for (const [dx, dy, dr, col] of dots) {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(dx, dy, dr, 0, Math.PI * 2)
    ctx.fill()
  }

  // Soft ticket drop shadow
  ctx.save()
  ctx.shadowColor = 'rgba(23, 77, 53, 0.16)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 12
  roundRect(56, 56, W - 112, H - 112, 38)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.restore()

  // Ticket silhouette with left & right semi-circle punch notches
  ctx.save()
  roundRect(56, 56, W - 112, H - 112, 38)
  ctx.clip()

  // Left cute mascot panel tint
  ctx.fillStyle = isShop ? '#F6FBE9' : '#EFF9FD'
  ctx.fillRect(56, 56, 360, H - 112)

  // Bottom warm ribbon footer strip
  ctx.fillStyle = accentDark
  ctx.fillRect(56, H - 108, W - 112, 52)
  ctx.restore()

  // Outer dashed cute stitching border inside ticket
  ctx.save()
  ctx.strokeStyle = badgeTint
  ctx.lineWidth = 4
  ctx.setLineDash([12, 9])
  roundRect(74, 74, W - 148, H - 148, 28)
  ctx.stroke()
  ctx.restore()

  // Perforation circles on left/right edges
  for (const cx of [56, W - 56]) {
    ctx.beginPath()
    ctx.arc(cx, H / 2 - 12, 28, 0, Math.PI * 2)
    ctx.fillStyle = pastelBg
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = badgeTint
    ctx.stroke()
  }

  // Vertical coupon tear line
  ctx.save()
  ctx.strokeStyle = '#CFE0C8'
  ctx.lineWidth = 3
  ctx.setLineDash([10, 10])
  ctx.beginPath()
  ctx.moveTo(416, 86)
  ctx.lineTo(416, H - 122)
  ctx.stroke()
  ctx.restore()

  // Kawaii Poti Mascot Illustration on the left panel
  const mx = 236
  const my = 310

  // Soft glow halo behind Poti
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(mx, my - 10, 128, 0, Math.PI * 2)
  ctx.fill()

  // Sparkles & hearts around Poti
  const drawStar = (sx, sy, sr, color) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx, sy - sr)
    ctx.quadraticCurveTo(sx, sy, sx + sr, sy)
    ctx.quadraticCurveTo(sx, sy, sx, sy + sr)
    ctx.quadraticCurveTo(sx, sy, sx - sr, sy)
    ctx.quadraticCurveTo(sx, sy, sx, sy - sr)
    ctx.fill()
  }
  drawStar(132, 185, 16, '#F5B841')
  drawStar(342, 198, 13, '#F48F7E')
  drawStar(145, 424, 12, '#8CCB57')
  drawStar(338, 412, 14, '#F5B841')

  // Poti stem & cute sprout leaves
  ctx.strokeStyle = '#2F7443'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(mx, my - 92)
  ctx.lineTo(mx, my - 130)
  ctx.stroke()

  ctx.fillStyle = '#A8D66D'
  ctx.beginPath()
  ctx.ellipse(mx + 26, my - 134, 28, 15, -0.45, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#3F8F55'
  ctx.beginPath()
  ctx.ellipse(mx - 24, my - 122, 24, 13, 0.45, 0, Math.PI * 2)
  ctx.fill()

  // Cute round cream pot head
  ctx.fillStyle = '#FFF9EA'
  ctx.strokeStyle = '#174D35'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(mx, my - 26, 70, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Mini happy waving hands
  ctx.strokeStyle = '#174D35'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(mx - 64, my - 16)
  ctx.quadraticCurveTo(mx - 90, my - 34, mx - 82, my - 58)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(mx + 64, my - 16)
  ctx.quadraticCurveTo(mx + 90, my - 34, mx + 82, my - 58)
  ctx.stroke()

  // Happy kawaii eyes (curved smiling crescents)
  ctx.strokeStyle = '#174D35'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(mx - 22, my - 32, 9, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(mx + 22, my - 32, 9, Math.PI * 1.1, Math.PI * 1.9)
  ctx.stroke()

  // Rosy cheeks
  ctx.fillStyle = 'rgba(240, 140, 122, 0.65)'
  ctx.beginPath()
  ctx.ellipse(mx - 36, my - 14, 12, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(mx + 36, my - 14, 12, 7, 0, 0, Math.PI * 2)
  ctx.fill()

  // Cute cat-smile mouth
  ctx.strokeStyle = '#174D35'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(mx - 7, my - 10, 7, 0.1 * Math.PI, 0.9 * Math.PI)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(mx + 7, my - 10, 7, 0.1 * Math.PI, 0.9 * Math.PI)
  ctx.stroke()

  // Terracotta pot bottom body
  ctx.fillStyle = '#D58454'
  ctx.strokeStyle = '#8F4D29'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(mx - 58, my + 24)
  ctx.lineTo(mx + 58, my + 24)
  ctx.lineTo(mx + 42, my + 102)
  ctx.lineTo(mx - 42, my + 102)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Pot rim
  roundRect(mx - 68, my + 10, 136, 22, 10)
  ctx.fillStyle = '#E69B6C'
  ctx.fill()
  ctx.stroke()

  // Tiny heart emblem on pot
  ctx.fillStyle = '#FFF7DF'
  ctx.beginPath()
  ctx.arc(mx - 6, my + 58, 7, 0, Math.PI * 2)
  ctx.arc(mx + 6, my + 58, 7, 0, Math.PI * 2)
  ctx.moveTo(mx - 12, my + 61)
  ctx.lineTo(mx, my + 75)
  ctx.lineTo(mx + 12, my + 61)
  ctx.fill()

  // Mascot caption
  ctx.fillStyle = accentDark
  ctx.font = '700 22px Ubuntu, "Noto Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Yay! Hadiah Panenmu 🎉', mx, my + 148)

  // Right Panel: Voucher Details
  const rx = 468
  ctx.textAlign = 'left'

  // Top Eyebrow Pill
  roundRect(rx, 106, 290, 42, 21)
  ctx.fillStyle = badgeTint
  ctx.fill()
  ctx.fillStyle = accentDark
  ctx.font = '700 18px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText(
    isShop ? 'VOUCHER POTIVA SHOP' : 'VOUCHER E-LIBRARY',
    rx + 24,
    133,
  )

  // Date/Recipient Tag
  ctx.fillStyle = '#6A7B70'
  ctx.font = '600 18px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText(`Untuk: ${ownerName}`, rx + 308, 133)

  // Big Discount Headline
  ctx.fillStyle = accentDark
  ctx.font = '800 84px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText(`DISKON ${voucher.discount}%`, rx, 246)

  // Subtitle
  ctx.fillStyle = accent
  ctx.font = '700 28px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText(voucher.title, rx, 294)

  ctx.fillStyle = '#53685B'
  ctx.font = '400 21px Ubuntu, "Noto Sans", sans-serif'
  const subtitle = isShop
    ? 'Berlaku untuk semua produk POTIVA (pot, benih, media & perawatan).'
    : 'Berlaku untuk membeli panduan berkebun & e-book di E-Library POTIVA.'
  ctx.fillText(subtitle, rx, 332)

  // Code Ticket Box
  roundRect(rx, 372, 626, 108, 22)
  ctx.fillStyle = pastelBg
  ctx.fill()
  ctx.save()
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.setLineDash([8, 6])
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = '#5C7263'
  ctx.font = '700 16px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText('KODE VOUCHER (MASUKKAN SAAT CHECKOUT)', rx + 26, 408)

  ctx.fillStyle = accentDark
  ctx.font = '800 44px "DejaVu Sans Mono", monospace'
  ctx.fillText(voucher.code, rx + 26, 458)

  // Status badge on right of code box
  roundRect(rx + 452, 404, 146, 44, 22)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.fillStyle = accent
  ctx.font = '700 18px Ubuntu, "Noto Sans", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('✓ AKTIF', rx + 525, 432)

  // Bottom strip branding
  ctx.textAlign = 'left'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 20px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText('🌱 POTIVA — Grow Beyond Nature', 88, H - 75)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#DCEEC6'
  ctx.font = '600 20px Ubuntu, "Noto Sans", sans-serif'
  ctx.fillText('www.potiva.web.id', W - 88, H - 75)

  const triggerDownload = (href) => {
    const link = document.createElement('a')
    link.href = href
    link.download = `voucher-${voucher.code.toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (typeof canvas.toBlob === 'function') {
    canvas.toBlob((blob) => {
      if (!blob) {
        triggerDownload(canvas.toDataURL('image/png'))
        return
      }
      const url = URL.createObjectURL(blob)
      triggerDownload(url)
      window.setTimeout(() => URL.revokeObjectURL(url), 4000)
    }, 'image/png')
  } else {
    triggerDownload(canvas.toDataURL('image/png'))
  }
  return true
}
