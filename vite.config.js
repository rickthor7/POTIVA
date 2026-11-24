import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Makes OG/Twitter image URLs absolute on Vercel, relative in local dev.
function siteUrl() {
  return {
    name: 'potiva-site-url',
    transformIndexHtml(html) {
      const host =
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL ||
        process.env.SITE_URL ||
        ''
      const base = host ? `https://${host.replace(/^https?:\/\//, '')}` : ''
      return html.replaceAll('__SITE_URL__', base)
    },
  }
}

export default defineConfig({
  plugins: [react(), siteUrl()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
