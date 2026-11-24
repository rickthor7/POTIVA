# POTIVA --- Product Requirements Document (PRD)

**Versi:** 1.0\
**Tanggal:** 24 November 2026\
**Status:** Draft untuk validasi dan pengembangan MVP

## 1. Ringkasan Produk

POTIVA adalah platform digital pendamping aktivitas menanam yang
menghubungkan produk fisik POTIVA (pot dan benih) dengan pengalaman
digital berupa permainan virtual plant, panduan perawatan, jurnal
pertumbuhan, edukasi, dan toko online.

**Tagline:** Grow Beyond Nature.

**Proposisi nilai:** Membantu pengguna memulai dan merawat tanaman
dengan cara yang lebih mudah, edukatif, interaktif, dan menyenangkan.

## 2. Latar Belakang dan Masalah

Calon pengguna yang baru mulai berkebun sering menghadapi beberapa
kendala: - Tidak mengetahui langkah awal setelah membeli pot atau
benih. - Lupa atau keliru melakukan perawatan tanaman. - Sulit memantau
perkembangan tanaman dari waktu ke waktu. - Materi belajar berkebun
tersebar di berbagai sumber. - Aktivitas menanam terasa kurang
interaktif bagi sebagian pengguna.

POTIVA menjawab masalah tersebut melalui satu pengalaman digital yang
terhubung dengan produk fisik.

## 3. Tujuan Produk

1.  Menghubungkan setiap produk POTIVA dengan panduan dan profil tanaman
    digital melalui QR Code.
2.  Mendorong kebiasaan merawat tanaman melalui jadwal, pengingat, dan
    gamifikasi.
3.  Membantu pengguna mendokumentasikan pertumbuhan tanaman.
4.  Menyediakan edukasi berkebun melalui artikel dan e-book.
5.  Menjadi kanal penjualan produk fisik dan digital.
6.  Membangun komunitas pengguna POTIVA.

## 4. Target Pengguna

### Persona utama

-   Pemula yang ingin mulai menanam di rumah.
-   Pengguna yang membeli pot atau benih POTIVA.
-   Keluarga dan anak muda yang menyukai aktivitas interaktif.
-   Pelajar/mahasiswa yang tertarik pada urban farming.

### Kebutuhan pengguna

-   Panduan yang sederhana dan mudah dipahami.
-   Pengingat yang relevan dengan jenis tanaman.
-   Cara melihat perkembangan tanaman.
-   Konten edukasi dan perlengkapan yang mudah ditemukan.

## 5. Ruang Lingkup Produk

### MVP --- Prioritas tahap pertama

1.  **Landing Page**
    -   Menjelaskan manfaat POTIVA.
    -   CTA untuk mulai, scan produk, dan melihat toko.
    -   Menampilkan fitur utama dan produk unggulan.
2.  **Akun dan Profil Pengguna**
    -   Registrasi, login, logout.
    -   Profil pengguna dan daftar tanaman milik pengguna.
3.  **QR Code dan Plant ID**
    -   Setiap produk atau kemasan memiliki QR Code unik.
    -   QR mengarahkan pengguna ke halaman aktivasi produk.
    -   Pengguna memilih atau mengonfirmasi jenis tanaman.
    -   Sistem membuat profil tanaman dengan tanggal mulai tanam.
    -   QR tidak boleh menjadi satu-satunya mekanisme autentikasi atau
        akses data privat.
4.  **My Garden / Virtual Plant**
    -   Menampilkan tanaman virtual yang tumbuh berdasarkan progres
        perawatan.
    -   Aksi sederhana: siram, beri pupuk, dan rawat.
    -   Level, XP, koin, misi harian, dan achievement.
    -   Progres game tidak boleh mengklaim sebagai pengukuran ilmiah
        kondisi tanaman asli.
5.  **Plant Care**
    -   Jadwal penyiraman, pemupukan, paparan cahaya, dan pemeriksaan.
    -   Pengingat dapat disesuaikan per tanaman.
    -   Pengguna dapat menandai aktivitas selesai atau melewatkan.
    -   Jadwal harus berupa rekomendasi yang dapat disesuaikan, bukan
        aturan mutlak.
6.  **Plant Journal**
    -   Catatan tanggal dan aktivitas.
    -   Unggah foto perkembangan.
    -   Timeline perkembangan tanaman.
    -   Catatan kendala dan hasil panen.
7.  **POTIVA Shop**
    -   Katalog pot kecil, pot besar, benih, dan produk terkait.
    -   Detail produk, harga, stok, dan foto.
    -   Keranjang dan alur checkout.
    -   Integrasi pembayaran dan pengiriman dapat masuk fase
        implementasi berikutnya.

### Fitur tahap kedua

-   E-Library untuk e-book dan panduan.
-   Pembelian e-book dan akses konten digital.
-   POTIVA Rewards dan voucher.
-   Tantangan komunitas dan galeri pengguna.
-   Notifikasi web push/PWA.

### Fitur tahap lanjutan

-   Plant Doctor berbasis AI untuk analisis foto.
-   Rekomendasi perawatan berdasarkan cuaca.
-   Komunitas dengan moderasi.
-   Integrasi sensor kelembapan atau perangkat IoT.

## 6. User Journey Utama

1.  Pengguna membeli pot atau benih POTIVA.
2.  Pengguna memindai QR Code pada produk.
3.  Website membuka halaman aktivasi Plant ID.
4.  Pengguna login atau membuat akun.
5.  Pengguna mengonfirmasi jenis tanaman dan tanggal tanam.
6.  Sistem membuat profil tanaman dan rekomendasi perawatan awal.
7.  Pengguna membuka My Garden untuk merawat tanaman virtual.
8.  Pengguna menerima pengingat dan mencatat aktivitas.
9.  Pengguna mengunggah foto ke Plant Journal.
10. Pengguna dapat membaca e-book atau membeli produk tambahan.

## 7. Persyaratan Fungsional

  -----------------------------------------------------------------------
  ID                      Persyaratan             Prioritas
  ----------------------- ----------------------- -----------------------
  FR-01                   Pengguna dapat          Must
                          mendaftar dan login     

  FR-02                   QR Code membuka halaman Must
                          aktivasi produk         

  FR-03                   Pengguna dapat membuat  Must
                          dan mengelola profil    
                          tanaman                 

  FR-04                   Pengguna dapat melihat  Must
                          virtual garden          

  FR-05                   Pengguna dapat          Must
                          menyelesaikan aksi      
                          perawatan virtual       

  FR-06                   Sistem menampilkan      Must
                          jadwal perawatan        

  FR-07                   Pengguna dapat menandai Must
                          aktivitas selesai       

  FR-08                   Pengguna dapat mencatat Must
                          dan mengunggah foto     
                          pertumbuhan             

  FR-09                   Pengguna dapat melihat  Must
                          katalog produk          

  FR-10                   Admin dapat mengelola   Must
                          produk dan stok         

  FR-11                   Pengguna dapat          Should
                          menelusuri e-book       

  FR-12                   Pengguna dapat membeli  Should
                          dan mengakses e-book    

  FR-13                   Sistem mengirim         Should
                          notifikasi pengingat    

  FR-14                   Pengguna dapat          Could
                          mengikuti tantangan     
                          komunitas               

  FR-15                   Sistem memberi saran    Later
                          dari foto tanaman       
                          dengan AI               
  -----------------------------------------------------------------------

## 8. Persyaratan Non-Fungsional

-   **Responsif:** nyaman digunakan pada ponsel, tablet, dan desktop.
-   **Performa:** halaman inti dioptimalkan agar cepat dimuat pada
    koneksi seluler.
-   **Aksesibilitas:** kontras warna memadai, ukuran teks terbaca,
    navigasi jelas, dan elemen interaktif memiliki label.
-   **Keamanan:** autentikasi aman, validasi input, otorisasi berbasis
    peran, dan akses file privat dibatasi.
-   **Privasi:** foto dan data tanaman hanya dapat diakses sesuai izin
    pengguna.
-   **Keandalan:** jadwal dan zona waktu disimpan konsisten; notifikasi
    yang gagal dapat dicoba ulang.
-   **SEO:** landing page, katalog, dan artikel memiliki metadata yang
    baik.

## 9. Peran Pengguna

-   **Guest:** melihat landing page, katalog publik, dan informasi
    produk.
-   **Member:** mengelola tanaman, jurnal, game, jadwal, pesanan, dan
    konten yang dibeli.
-   **Admin:** mengelola produk, stok, pesanan, e-book, konten edukasi,
    dan QR produk.
-   **Content Editor (opsional):** mengelola artikel dan materi edukasi
    tanpa akses ke pengaturan sensitif.

## 10. Aturan Bisnis Penting

-   Satu QR produk mengidentifikasi produk atau batch/seri, sedangkan
    data tanaman pribadi dimiliki akun pengguna.
-   Pengguna dapat memiliki lebih dari satu tanaman.
-   Jadwal perawatan ditentukan berdasarkan jenis tanaman, fase
    pertumbuhan, dan preferensi pengguna; pengguna dapat mengubahnya.
-   Sistem harus menghindari notifikasi berlebihan dan menyediakan
    pengaturan frekuensi.
-   Reward tidak boleh mendorong penyiraman atau pemupukan berlebihan.
    Aktivitas yang aman seperti mencatat, memeriksa media tanam, atau
    membaca panduan juga dapat memberi poin.
-   Pembelian e-book harus memiliki status akses yang jelas setelah
    pembayaran terkonfirmasi.
-   Konten diagnosis tanaman berbasis AI harus menyatakan bahwa hasilnya
    berupa kemungkinan, bukan diagnosis pasti.

## 11. Metrik Keberhasilan

-   Persentase pembeli yang mengaktifkan QR.
-   Jumlah tanaman yang dibuat per pengguna.
-   Pengguna aktif mingguan/bulanan.
-   Persentase pengingat yang ditindaklanjuti.
-   Retensi pengguna hari ke-7 dan hari ke-30.
-   Jumlah jurnal/foto pertumbuhan yang dibuat.
-   Konversi kunjungan katalog menjadi pembelian.
-   Penjualan e-book dan tingkat penyelesaian pembelian.

## 12. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Pengguna lupa membuka website       PWA, notifikasi opt-in, dan
                                      pengalaman mobile yang ringkas

  Pengingat tidak sesuai kebutuhan    Jadwal berbasis jenis tanaman dan
  tanaman                             dapat diedit

  Game tidak mencerminkan kondisi     Jelaskan bahwa progres game adalah
  tanaman asli                        gamifikasi, gunakan jurnal/foto
                                      untuk progres nyata

  QR disalin orang lain               QR hanya untuk
                                      aktivasi/identifikasi; gunakan akun
                                      dan token aktivasi bila perlu

  Foto menghabiskan penyimpanan       Kompresi, batas ukuran, dan
                                      kebijakan retensi

  Fitur terlalu banyak untuk tim      Bangun MVP secara bertahap dan
  kecil                               validasi sebelum ekspansi
  -----------------------------------------------------------------------

## 13. Batasan MVP

MVP tidak perlu langsung mencakup AI, sensor IoT, marketplace komunitas
kompleks, atau aplikasi native. Fokus awal adalah QR activation, profil
tanaman, virtual garden sederhana, plant care, journal, dan katalog
produk.

## 14. Asumsi yang Perlu Divalidasi

-   Jenis tanaman/benih apa saja yang dijual pada peluncuran awal.
-   Apakah QR ditempel pada pot, kemasan benih, atau keduanya.
-   Apakah pengguna perlu membuat akun sebelum atau sesudah scan.
-   Kebijakan reward dan apakah koin dapat ditukar.
-   Metode pembayaran, pengiriman, dan pengelolaan stok.
-   Apakah notifikasi awal menggunakan email, web push, atau keduanya.
