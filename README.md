# POTIVA — Grow Beyond Nature 🌱

Website **POTIVA**, platform digital pendamping aktivitas menanam. Proyek ini adalah
implementasi front-end MVP berdasarkan `POTIVA_PRD.md` dan `POTIVA_DESAIN.md`, dengan
arah visual dari `contoh-prototype.png`.

Seluruh antarmuka menggunakan Bahasa Indonesia, ilustrasi SVG buatan sendiri, dan
simulasi data yang tersimpan di browser — tanpa backend.

---

## ✨ Fitur

| Area | Ringkasan |
| --- | --- |
| **Landing** | Hero, alur produk, manfaat, testimoni, CTA daftar/masuk, footer. |
| **Autentikasi** | Masuk & daftar (mode demo), validasi form, tampilan error, status masuk. |
| **Dashboard** | Sapaan personal, ringkasan kebun, tugas hari ini, progres misi, rekomendasi. |
| **Scan & aktivasi** | Simulasi pemindaian QR produk POTIVA, aktivasi tanaman ke kebun virtual. |
| **My Garden** | Daftar tanaman, filter, detail tanaman, progres pertumbuhan, dan **mode game petualangan**. |
| **Mode game** | Kebun virtual interaktif layar penuh: analog stick, tombol aksi, embun bonus. |
| **Plant Care** | Jadwal perawatan, checklist tugas, pengingat, panduan per tanaman. |
| **Plant Journal** | Catatan pertumbuhan, filter tanaman, tambah entri, galeri foto (ilustrasi). |
| **E-Library** | Katalog e-book & artikel, pencarian, filter kategori, detail bacaan. |
| **Shop** | Katalog produk, filter kategori, detail produk, keranjang (drawer), checkout. |
| **Community** | Feed komunitas (fase 2), topik diskusi, kontributor. |
| **Akun** | Profil, statistik, pengaturan, keluar akun. |

### 🎮 Mode game POTIVA Garden

Dibuka dari tombol **Game** melayang di kanan bawah (tersedia di semua halaman), lalu
pilih **Mainkan sekarang** di popup pintasan. Bisa juga dari halaman **My Garden** →
tombol **Mainkan game**.

- Wajib **landscape** di ponsel; muncul gerbang "Putar HP ke landscape" bila masih portrait.
- Otomatis meminta **layar penuh** dan **orientation lock** (best-effort; iOS memakai overlay penuh sebagai fallback).
- **Analog stick** di kiri untuk bergerak bebas di dunia kebun.
- **Tombol aksi** di kanan: **Siram** (+15 XP, +10 koin), **Pupuk** (+20 XP, +15 koin),
  **Hias** (ganti pot), **Semangat** (animasi ceria).
- **Ketuk tanah atau tanaman** untuk berjalan otomatis ke tujuan (joystick membatalkan rute).
- **Embun bonus** tersebar di kebun untuk dikumpulkan (+koin).
- **Tantangan sesi**: siram 3 tanaman + kumpulkan 3 embun → bonus +30 koin dan +25 XP.
- Target tanaman terdekat muncul otomatis, lengkap dengan status air, nutrisi, dan cahaya.
- Jeda/lanjutkan, keluar, serta ringkasan sesi (XP, koin, aksi).
- Kontrol keyboard untuk desktop: `WASD`/panah untuk bergerak, `E` siram, `F` pupuk,
  `G` hias, `C` semangat, `Esc` jeda.

---

## 🧱 Tech stack

- **React 18** + **Vite 6**
- **react-router-dom 6** (SPA routing)
- **lucide-react** untuk ikon
- CSS murni dengan design token (tanpa framework CSS)
- Ilustrasi & maskot **SVG** buatan sendiri (`src/components/illustrations.jsx`)

### Design token utama

| Token | Nilai |
| --- | --- |
| Forest | `#174D35` |
| Leaf | `#3F8F55` |
| Fresh | `#A8D66D` |
| Mint | `#EAF5E9` |
| Cream | `#FFF8E8` |
| Font | Poppins |
| Radius | 16–34px |

---

## 🚀 Menjalankan secara lokal

Prasyarat: **Node.js 18+** dan npm.

```bash
# 1. Install dependensi
npm install

# 2. Jalankan dev server
npm run dev
# → http://localhost:5173

# 3. Build produksi
npm run build

# 4. Pratinjau hasil build
npm run preview
```

### Mode demo

Tidak ada backend. Gunakan **email apa pun** dan **kata sandi minimal 6 karakter**
untuk masuk atau mendaftar. Anda juga bisa menjelajah sebagai **tamu**.

Semua progres (tanaman, jurnal, keranjang, koin, XP) disimpan di `localStorage`
dengan kunci `potiva.state.v1`. Hapus kunci tersebut di DevTools untuk mengulang
dari awal.

---

## 📁 Struktur proyek

```
POTIVA/
├── public/                 # favicon, og-image
├── src/
│   ├── components/         # Navbar, Footer, kartu, modal, ilustrasi, GardenGame
│   ├── data/appData.js     # data seed tanaman, produk, e-book, komunitas
│   ├── lib/                # util & hook kecil
│   ├── pages/              # satu file per halaman
│   ├── store/              # AppStore (state + localStorage), UIStore
│   ├── styles/             # token, base, komponen, dan CSS per area
│   ├── App.jsx             # definisi route
│   └── main.jsx            # entry point + provider
├── POTIVA_PRD.md
├── POTIVA_DESAIN.md
├── contoh-prototype.png
├── index.html
├── vercel.json             # SPA rewrite
└── package.json
```

### Peta route

| Route | Halaman |
| --- | --- |
| `/` | Landing |
| `/masuk`, `/daftar` | Autentikasi |
| `/app` | Dashboard |
| `/scan` | Scan & aktivasi QR |
| `/garden` | My Garden (+ game) |
| `/care` | Plant Care |
| `/journal` | Plant Journal |
| `/library` | E-Library |
| `/shop`, `/shop/:id` | Shop & detail produk |
| `/checkout` | Checkout |
| `/community` | Community |
| `/account` | Akun |
| `*` | 404 |

---

## ☁️ Deploy ke GitHub + Vercel

### 1. Unggah ke GitHub

```bash
git init
git add .
git commit -m "POTIVA — MVP front-end"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 2. Impor ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
2. Pilih repo POTIVA.
3. Vercel mendeteksi Vite otomatis:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Klik **Deploy**.

`vercel.json` sudah berisi rewrite SPA agar rute seperti `/garden` atau `/shop/basil-lemon`
tetap bekerja saat di-refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Setiap `git push` ke `main` akan memicu deploy otomatis. Preview URL dibuat untuk
setiap pull request.

### Thumbnail / link preview

`public/og-image.png` (1200×630) dipakai untuk preview tautan di WhatsApp, X, dan
Facebook. Tag Open Graph dan Twitter sudah ada di `index.html`. Saat build di Vercel,
placeholder `__SITE_URL__` otomatis diganti dengan domain produksi; untuk host lain,
set environment variable `SITE_URL=https://domainmu.com`.

---

## ♿ Catatan aksesibilitas & responsif

- Mobile-first: navigasi bawah di ponsel, sidebar/topbar di desktop.
- Fokus keyboard terlihat, label ARIA pada kontrol penting, `inert` pada konten di
  belakang game agar fokus tidak bocor.
- Menghormati `prefers-reduced-motion` untuk animasi dekoratif.
- Kontras teks mengikuti palet desain; ukuran sentuh tombol minimal 44px.

---

## 📌 Status

MVP front-end selesai untuk seluruh permukaan produk pada PRD (Community masih
tahap fase 2 sesuai dokumen). Data bersifat simulasi dan disimpan lokal; integrasi
backend, pembayaran, dan QR asli belum termasuk.
