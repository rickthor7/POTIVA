# POTIVA --- Product Design Document (Desain MD)

**Versi:** 1.0\
**Tanggal:** 24 November 2026\
**Acuan:** PRD POTIVA v1.0\
**Tagline:** Grow Beyond Nature.

## 1. Arah Desain

POTIVA dirancang sebagai platform berkebun digital yang terasa: -
**Fresh:** dominasi warna hijau dan nuansa alam. - **Friendly:**
ilustrasi tanaman dan karakter yang hangat. - **Playful:** elemen
gamifikasi yang menyenangkan, tanpa mengorbankan keterbacaan. -
**Trustworthy:** informasi perawatan dan transaksi ditampilkan jelas. -
**Simple:** alur utama mudah dipahami pengguna pemula.

Hindari tampilan yang terlalu ramai, penggunaan gradien berlebihan,
dekorasi yang tidak memiliki fungsi, dan teks panjang pada kartu.

## 2. Design Principles

1.  Mobile-first karena QR scan dan pengingat paling sering digunakan
    melalui ponsel.
2.  Satu layar memiliki satu tujuan utama yang jelas.
3.  Status tanaman, jadwal, dan aksi berikutnya mudah ditemukan.
4.  Visual game boleh playful; halaman transaksi dan pengaturan harus
    lebih tenang.
5.  Gunakan bahasa Indonesia yang sederhana dan instruksi yang spesifik.
6.  Jangan mengandalkan warna saja untuk menyampaikan status; sertakan
    teks atau ikon.

## 3. Design System

### 3.1 Palet warna

  Token            Hex         Penggunaan
  ---------------- ----------- ---------------------------------
  Forest Green     `#174D35`   Header, tombol utama, identitas
  Leaf Green       `#3F8F55`   Aksi positif, ikon aktif
  Fresh Green      `#A8D66D`   Highlight dan elemen dekoratif
  Soft Mint        `#EAF5E9`   Latar kartu dan section
  Cream            `#FFF8E8`   Latar hangat
  Soil Brown       `#8B5E3C`   Aksen pot/tanah
  Text Primary     `#20312A`   Teks utama
  Text Secondary   `#66756D`   Teks sekunder
  Border           `#DCE7DE`   Garis pembatas
  Danger           `#C84C4C`   Error dan kondisi kritis
  Warning          `#B7791F`   Peringatan

Gunakan latar putih atau cream untuk area baca. Forest Green menjadi
warna identitas, bukan warna untuk semua permukaan.

### 3.2 Tipografi

-   **Font utama:** Poppins.
-   **Alternatif:** Inter atau system sans-serif.
-   Heading: Poppins SemiBold/Bold.
-   Body: Poppins Regular atau Inter Regular.
-   Gunakan ukuran body minimum sekitar 14--16 px untuk pengalaman
    mobile.
-   Batasi jumlah ukuran font agar hierarki konsisten.

### 3.3 Bentuk dan komponen

-   Radius kartu: 16--20 px.
-   Radius tombol: 12--14 px.
-   Input: tinggi sentuh minimal 44 px.
-   Gunakan bayangan tipis dan border lembut.
-   Ikon menggunakan satu keluarga ikon yang konsisten.
-   Ilustrasi karakter POTIVA digunakan pada game, onboarding, empty
    state, dan reward.

## 4. Information Architecture

``` text
POTIVA
├── Beranda
├── Scan / Aktivasi QR
├── My Garden
│   ├── Daftar Tanaman
│   ├── Detail Tanaman
│   ├── Virtual Plant
│   └── Misi & Reward
├── Plant Care
│   ├── Jadwal
│   ├── Pengingat
│   └── Riwayat Perawatan
├── Plant Journal
│   ├── Timeline
│   ├── Tambah Catatan
│   └── Galeri Foto
├── Learning Center
│   ├── Artikel
│   ├── E-Book
│   └── Detail Materi
├── POTIVA Shop
│   ├── Katalog
│   ├── Detail Produk
│   ├── Keranjang
│   └── Checkout
├── Community (fase berikutnya)
└── Akun
    ├── Profil
    ├── Pengaturan Notifikasi
    └── Bantuan
```

## 5. Struktur Halaman dan Spesifikasi UI

### 5.1 Landing Page

**Tujuan:** memperkenalkan POTIVA dan mengarahkan pengunjung ke aksi
utama.

Komponen: - Navbar: logo, Beranda, Fitur, Shop, E-Library, Login. -
Hero: headline "Grow Something Amazing." - Deskripsi singkat manfaat
POTIVA. - CTA utama: "Mulai Sekarang". - CTA sekunder: "Jelajahi
Produk". - Ilustrasi pot dan maskot tanaman. - Section cara kerja: beli
produk → scan QR → rawat tanaman. - Kartu fitur: My Garden, Plant Care,
Journal, E-Library. - Produk unggulan dan testimoni. - Footer: kontak,
media sosial, kebijakan.

### 5.2 QR Scan dan Aktivasi

**Tujuan:** menghubungkan produk fisik dengan akun pengguna.

Komponen: - Instruksi "Pindai QR pada produk POTIVA". - Area kamera
dengan panduan framing. - Opsi input kode manual jika kamera tidak
tersedia. - State: izin kamera, sedang memindai, berhasil, QR tidak
valid, QR sudah diaktifkan. - Halaman konfirmasi jenis tanaman dan
tanggal mulai tanam.

UX penting: - Minta izin kamera hanya saat pengguna menekan tombol
scan. - Sediakan fallback manual. - Jangan menampilkan informasi pribadi
hanya karena seseorang mengetahui QR. - Tampilkan pesan error yang
memberi langkah pemulihan.

### 5.3 Dashboard / My Garden

**Tujuan:** menjadi pusat aktivitas pengguna.

Komponen: - Sapaan dan ringkasan akun. - Kartu tanaman aktif. -
Ringkasan tugas perawatan hari ini. - Shortcut scan tanaman dan tambah
tanaman. - Ringkasan level, XP, dan koin. - Aktivitas terakhir dari
Plant Journal.

Urutan prioritas konten: tugas hari ini → tanaman aktif → progres →
konten rekomendasi.

### 5.4 POTIVA Garden (Game)

**Tujuan:** membuat aktivitas merawat tanaman terasa menyenangkan.

Komponen: - Area utama karakter tanaman virtual. - Nama tanaman, level,
dan progress bar. - Indikator kebutuhan: air, nutrisi, cahaya. - Tombol
aksi: Siram, Pupuk, Hias, Misi. - Misi harian dan reward.

Aturan UX: - Aksi game harus memiliki batas dan jeda agar tidak
mendorong perawatan berlebihan. - Beri penjelasan bahwa status virtual
bukan pembacaan sensor tanaman asli. - Hubungkan progres dengan
aktivitas nyata yang dicatat pengguna. - Gunakan animasi singkat dan
tidak mengganggu.

### 5.5 Plant Care

**Tujuan:** membantu pengguna mengetahui tindakan berikutnya.

Komponen: - Agenda hari ini. - Kalender mingguan/bulanan. - Kartu tugas
dengan ikon, waktu, dan nama tanaman. - Tombol "Selesai" dan "Atur
ulang". - Pengaturan jam dan kanal notifikasi.

Status: - Terjadwal. - Segera. - Selesai. - Terlewat.

Konten rekomendasi harus menyertakan konteks tanaman dan dapat diedit
pengguna.

### 5.6 Plant Journal

**Tujuan:** menyimpan rekam jejak perkembangan tanaman.

Komponen: - Timeline berdasarkan tanggal. - Foto perkembangan. - Catatan
aktivitas dan kondisi. - Tombol tambah update. - Filter berdasarkan
tanaman.

Form tambah update: - Tanaman. - Tanggal. - Foto (opsional). - Tahap
pertumbuhan. - Catatan. - Aktivitas perawatan terkait.

### 5.7 E-Library

**Tujuan:** menemukan dan membeli materi edukasi.

Komponen: - Search. - Kategori: Pemula, Urban Farming, Perawatan,
Budidaya, Bisnis. - Kartu e-book dengan cover, judul, ringkasan,
harga. - Detail e-book: deskripsi, daftar isi, format, harga. - Status
akses: belum dibeli / sudah dimiliki.

### 5.8 POTIVA Shop

**Tujuan:** menjual produk fisik POTIVA.

Komponen: - Kategori pot kecil, pot besar, benih, dan perlengkapan. -
Foto produk, harga, stok. - Detail produk dan informasi isi paket. -
Keranjang dan checkout. - Status pesanan.

### 5.9 Community

**Tujuan:** membangun interaksi antarpengguna.

Komponen fase lanjutan: - Feed foto dan cerita. - Tantangan menanam. -
Komentar dan reaksi. - Pelaporan konten dan moderasi. - Aturan
komunitas.

## 6. Navigasi Responsif

### Desktop

-   Navbar horizontal di bagian atas.
-   Dashboard menggunakan sidebar atau top navigation.
-   Konten utama menggunakan grid 2--3 kolom sesuai kebutuhan.

### Mobile

-   Navigasi bawah maksimal 5 item: Beranda, Garden, Care, Shop, Profil.
-   Fitur lain dapat diakses melalui menu "Lainnya".
-   Tombol scan QR dapat menjadi shortcut yang mudah dijangkau.
-   Kartu ditampilkan satu kolom atau carousel yang tidak menghalangi
    konten utama.

## 7. Alur Pengguna

``` text
Produk POTIVA dibeli
        |
        v
Pengguna scan QR
        |
        v
Aktivasi / Login
        |
        v
Konfirmasi jenis tanaman
        |
        v
Profil tanaman dibuat
        |
        +---------------------+
        |                     |
        v                     v
  My Garden              Plant Care
  Game virtual           Jadwal & reminder
        |                     |
        +----------+----------+
                   |
                   v
              Plant Journal
                   |
          +--------+---------+
          |                  |
          v                  v
     E-Library           POTIVA Shop
    Belajar tanaman     Produk tambahan
```

## 8. UX Writing

Gunakan microcopy yang ramah dan jelas.

  -----------------------------------------------------------------------
  Situasi                             Contoh teks
  ----------------------------------- -----------------------------------
  Hero                                "Grow Something Amazing."

  Scan                                "Arahkan kamera ke QR Code pada
                                      produk POTIVA."

  Berhasil                            "Tanamanmu berhasil ditambahkan!"

  Pengingat                           "Saatnya cek kondisi tanaman Cabai
                                      Milo."

  Jurnal kosong                       "Perjalanan tumbuh tanamanmu
                                      dimulai di sini."

  Game                                "Yuk, rawat kebun virtualmu!"

  Error kamera                        "Kamera belum dapat diakses. Kamu
                                      bisa memasukkan kode secara
                                      manual."
  -----------------------------------------------------------------------

Hindari instruksi seperti "Siram sekarang" jika sistem tidak mengetahui
kondisi tanah. Lebih aman menggunakan "Periksa kelembapan tanah" lalu
memberikan rekomendasi.

## 9. State dan Feedback

Setiap fitur perlu memiliki: - Loading state. - Empty state. - Success
state. - Error state. - Disabled state. - Offline atau koneksi buruk
state jika relevan.

Contoh: halaman jurnal tanpa data menampilkan ilustrasi kecil,
penjelasan, dan CTA "Tambah catatan pertama".

## 10. Aksesibilitas

-   Kontras teks dan latar mengikuti WCAG AA sebagai target.
-   Semua tombol memiliki label yang jelas.
-   Status tidak disampaikan melalui warna saja.
-   Area sentuh nyaman untuk jari.
-   Form memiliki label dan pesan error.
-   Animasi dapat dikurangi untuk pengguna yang memilih reduced motion.
-   Foto memiliki alt text.

## 11. Aset Visual

Aset yang dibutuhkan: - Logo POTIVA. - Maskot tanaman utama. - Ilustrasi
pot kecil dan pot besar. - Ilustrasi benih, tunas, tanaman muda, dan
tanaman dewasa. - Ikon air, pupuk, cahaya, kalender, jurnal, buku, dan
keranjang. - Cover e-book. - Foto produk dengan latar konsisten. -
Empty-state illustration.

## 12. Rekomendasi Implementasi Desain

-   Bangun design tokens untuk warna, tipografi, spacing, radius, dan
    shadow.
-   Buat komponen reusable: Button, Input, ProductCard, PlantCard,
    ReminderCard, EbookCard, ProgressBar, Modal, Toast.
-   Uji alur scan QR dari perangkat mobile fisik.
-   Uji tampilan pada lebar 360 px, 390 px, 768 px, dan desktop.
-   Buat prototype interaktif untuk alur scan → aktivasi → dashboard →
    reminder sebelum implementasi penuh.

## 13. Kriteria Penerimaan Desain

-   Pengguna baru memahami fungsi POTIVA dari landing page.
-   Pengguna dapat menemukan tombol scan dengan mudah di mobile.
-   Setelah QR berhasil dipindai, pengguna memahami langkah berikutnya.
-   Jadwal perawatan menampilkan tanaman, aktivitas, dan waktu dengan
    jelas.
-   Game tidak membingungkan pengguna dengan kondisi tanaman asli.
-   Produk dan e-book memiliki harga serta status pembelian yang jelas.
-   Semua halaman inti memiliki tampilan mobile dan desktop.
