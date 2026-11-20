# DOKUMEN SPESIFIKASI KEBUTUHAN PRODUK (FINAL PRD)
## SISTEM E-SURAT KUASA ONLINE PENGADILAN NEGERI
### Versi 2.4.2 — Produksi Siap Pakai (Antigravity IDE & GAS Suite Edition)

---

## 1. INFORMASI DOKUMEN & RINGKASAN EKSEKUTIF

* **Nama Produk:** Aplikasi E-Surat Kuasa Online Pengadilan Negeri
* **Klasifikasi Sistem:** Decoupled Single Page Application (SPA) Web App & Progressive Web App (PWA)
* **Status Produk:** Selesai Diimplementasikan (Final Production Ready)
* **Tanggal Penyusunan:** November 2026
* **Dasar Hukum & Regulasi:**
  - Undang-Undang Nomor 11 Tahun 2008 jo. UU No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik (ITE).
  - Peraturan Mahkamah Agung (PERMA) tentang Administrasi Perkara dan Persidangan di Pengadilan Secara Elektronik.
  - Surat Edaran Mahkamah Agung (SEMA) No. 6 Tahun 1994 tentang Surat Kuasa Khusus.
  - Standar Operasional Prosedur (SOP) Pelayanan Terpadu Satu Pintu (PTSP) Mahkamah Agung RI.

### Ringkasan Eksekutif:
Aplikasi E-Surat Kuasa Online adalah sistem peradilan modern terpadu yang memfasilitasi pendaftaran, verifikasi identitas, pengesahan tanda tangan elektronik (TTE), serta penerbitan akta legalisasi surat kuasa secara daring. Sistem ini menggantikan 100% antrean fisik di loket Pelayanan Terpadu Satu Pintu (PTSP) Pengadilan Negeri, memungkinkan Advokat dan Masyarakat Umum mendaftarkan surat kuasa kapan saja secara mandiri, sekaligus memberikan ruang kerja digital yang aman dan terstruktur bagi Staf PTSP, Panitera Pengadilan, dan Administrator IT.

Setiap lembar akta yang diterbitkan secara otomatis dibubuhi nomor register resmi, stempel elektronik peradilan, serta **QR Code Validasi Keaslian Dokumen ber-HMAC SHA-256** yang dapat dipindai langsung oleh Majelis Hakim, Kuasa Lawan, maupun pihak ketiga dalam persidangan.

---

## 2. ARSITEKTUR SISTEM & TOPOLOGI DEPLOYMENT

Sistem menggunakan pola arsitektur **Decoupled Frontend-Backend** (sesuai standar `/gas-pro-api` dan `/github-pages-deploy-guide`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PENGGUNA / KLIEN                              │
│  (Advokat • Pemohon Insidentil • Staf PTSP • Panitera • Administrator) │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 FRONTEND STATIS (GITHUB PAGES / PWA)                   │
│  - SPA murni (HTML5, Tailwind CSS, Vanilla JS Modern, Material Icons) │
│  - Service Worker (sw.js v2 - Network First, Offline-Ready)            │
│  - Canvas Client-Side Image Compression (< 500 KB per berkas)          │
│  - Router Klien 0ms Instan & State Engine dengan Fallback Offline       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST API (POST text/plain - Bebas CORS)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 BACKEND GOOGLE APPS SCRIPT (GAS WEB APP)               │
│  - Endpoint Tunggal: doGet & doPost (JSON Response)                   │
│  - CacheX Chunking Engine (Batas 100 KB CacheService teratasi)         │
│  - Script Properties: Brankas Rahasia (Token Fonnte, PIN, Master Salt) │
│  - Non-Blocking Notification Dispatcher (Antrean background 5 menit)   │
└──────────────────┬─────────────────┬───────────────────┬───────────────┘
                   │                 │                   │
                   ▼                 ▼                   ▼
       ┌──────────────────────┐ ┌──────────────┐ ┌───────────────┐
       │   GOOGLE SHEETS      │ │ GOOGLE DRIVE │ │  FONNTE API   │
       │ (Database Relasional)│ │(Arsip Berkas)│ │(WhatsApp Notif│
       │  - Pengajuan (Data)  │ │ - Upload KTP │ │  & MailApp)   │
       │  - Pengguna (RBAC)   │ │ - Upload KTA │ └───────────────┘
       │  - AppConfig (Tarif) │ │ - Ekspor PDF │
       │  - Log_Aktivitas     │ └──────────────┘
       │  - AntrianNotif      │
       └──────────────────────┘
```

---

## 3. STANDAR KEPATUHAN KETERAMPILAN SISTEM (SKILLS STANDARD)

Aplikasi dibangun dengan mematuhi prinsip dari 7 keterampilan arsitektur utama:

1. **`/gas-pro-api`**:
   - Frontend terpisah 100% dari backend (tidak menggunakan `google.script.run` dan bebas iframe).
   - Seluruh request `POST` dikirim dengan `Content-Type: text/plain;charset=utf-8` untuk mencegah preflight CORS (`OPTIONS`) failure pada server Google.
2. **`/gas-scale-turbo`**:
   - Caching berlapis: *In-Flight Deduplication* (mencegah request ganda), *Stale-While-Revalidate* di klien, dan `CacheX` chunking di server Apps Script.
   - Operasi spreadsheet menggunakan *Batch Read/Write* (`getDataRange().getValues()` dan `setValues()`), mengeliminasi bottleneck kuota harian Google.
3. **`/gas-rahasia-script-properties`**:
   - Zero-literal secrets pada kode frontend maupun backend.
   - Token API Fonnte, salt hashing, dan ID folder disimpan terpusat di `PropertiesService.getScriptProperties()`.
4. **`/gas-pwa-github`**:
   - Dilengkapi `manifest.json`, icon maskable berstandar peradilan (192px & 512px), dan Service Worker `sw.js` (strategi *Network-First* dengan fallback cache offline).
   - Dapat diinstal langsung ke layar utama HP Android/iOS selayaknya aplikasi native.
5. **`/gas-notifikasi-wa-crm`**:
   - Pengiriman notifikasi WhatsApp otomatis melalui Fonnte API dan Email via `MailApp`.
   - Menggunakan tabel perantara `AntrianNotif` dan trigger latar belakang 5 menit non-blocking sehingga proses submit pemohon tidak pernah terhambat latensi gateway.
6. **`/github-pages-deploy-guide`**:
   - Struktur folder bersih (`index.html`, `css/`, `js/`, `backend/`, `manifest.json`, `sw.js`).
   - Ramah pemula, langsung siap di-push ke branch `main` GitHub Pages.
7. **`/gas-migrasi-database`**:
   - Skrip `Migrasi.gs` untuk sinkronisasi antar-spreadsheet lama ke skema baru berbasis nama header kolom dan upsert idempoten (bebas duplikasi data).

---

## 4. MATRIKS PERAN & KONTROL AKSES (RBAC)

Sistem menerapkan autentikasi aparatur pengadilan dengan pembagian hak akses (*Role-Based Access Control*):

| No | Peran (Role) | Username | Password Default | NIP | Hak Akses & Kewenangan |
|:---|:---|:---|:---|:---|:---|
| 1 | **Publik / Pemohon** | *Tanpa Login* | *Tanpa Login* | - | - Pendaftaran permohonan surat kuasa mandiri (Wizard 4 langkah).<br>- Melacak status pengajuan real-time.<br>- Memindai QR Code keaslian akta resmi. |
| 2 | **Petugas PTSP (Verifikator)** | `petugas1` *(atau `petugas`)* | `petugas123` | `19920315 201602 1 003` | - Akses Meja Verifikator PTSP di Dashboard Admin.<br>- Memeriksa kelengkapan berkas KTP & KTA di drawer inspeksi.<br>- Menyetujui (Lolos Verifikasi), meminta revisi, atau menolak berkas. |
| 3 | **Panitera (Pejabat Pengesah)** | `panitera` | `panitera123` | `19740512 199903 1 002` | - Akses Meja Pengesahan di Dashboard Admin.<br>- Pratinjau draf akta pendaftaran kuasa resmi.<br>- Otorisasi PIN 6-digit (`123456`) untuk pembubuhan stempel TTE & penerbitan nomor register resmi. |
| 4 | **Administrator IT** | `admin` | `admin123` | `19850101 201001 1 001` | - Akses penuh ke seluruh menu dan ruang kerja.<br>- Akses analitik peradilan, grafik tren, dan ekspor master data ke Excel/CSV.<br>- **Pengaturan Master Klasifikasi / Jenis Perkara** (CRUD opsi form).<br>- Pengaturan tarif PNBP & kontak hotline PTSP. |

---

## 5. STRUKTUR NAVIGASI & ALUR PENGGUNA

Untuk menjaga kenyamanan pengunjung publik sekaligus keamanan area internal pengadilan, navigasi dipisahkan secara cerdas:

### A. Navigasi Publik (Bilah Navbar Atas)
Bagi masyarakat umum dan advokat yang belum login, navbar atas hanya menampilkan menu publik yang bersih:
1. 🌐 **Beranda & Lacak**: Portal utama, metrik layanan, formulir pelacakan mandiri, dan ringkasan alur 4 tahap.
2. 📝 **Pendaftaran Kuasa**: Wizard formulir pendaftaran surat kuasa 4 tahap.
3. 🔍 **Validasi QR**: Alat pemindai dan validasi keaslian dokumen akta peradilan.
4. 🔑 **Login Pegawai**: Tombol masuk khusus aparatur pengadilan untuk membuka modal login.

### B. Pusat Kendali Terpadu (Dashboard Admin)
Setelah aparatur/admin login, di navbar akan muncul tautan **`Dashboard Admin`** dan badge profil lingkaran **`PN`**. Seluruh meja kerja internal dipusatkan di dalam Dashboard Admin melalui **4 Tab Navigasi Ruang Kerja**:
* **Tab 1: 📊 Ringkasan & Analitik**  
  * 4 Kartu KPI (*Total Masuk*, *Menunggu Verifikasi*, *Siap TTE*, *Kuasa Terdaftar Sah*).
  * Grafik SVG Tren Pendaftaran Bulanan & Diagram Demografi Pemohon (Advokat vs Insidentil).
  * Tabel Buku Induk Register Surat Kuasa lengkap dengan tombol *Ekspor ke Excel* dan *Cetak Register*.
* **Tab 2: 📋 Meja Verifikator PTSP**  
  * Tabel antrean permohonan masuk dengan filter status (*Semua*, *Menunggu*, *Perlu Revisi*, *Diteruskan*).
  * Lencana antrean real-time.
  * Tombol aksi pembuka *Slide-Over Document Inspection Drawer*.
* **Tab 3: ⚖️ Meja Pengesahan (TTE Panitera)**  
  * Antrean berkas yang telah lolos verifikasi PTSP.
  * Pratinjau akta pendaftaran kuasa (*live certificate view*).
  * Keypad PIN keamanan 6 digit (`123456`) untuk eksekusi penerbitan nomor register.
* **Tab 4: ⚙️ Pengaturan Jenis Perkara & Tarif**  
  * Master data klasifikasi jenis perkara: Tambah, edit, hapus, dan switch aktif/nonaktif.
  * Form konfigurasi tarif PNBP (Rp 10.000), tarif e-Meterai (Rp 10.000), dan hotline WhatsApp PTSP.

---

## 6. SPESIFIKASI KEBUTUHAN FUNGSIONAL

### 6.1. Modul Pelacak Status Mandiri (Real-Time Tracking)
* Pemohon memasukkan nomor registrasi (contoh: `REG-202611-0082`) atau nomor WhatsApp pada kolom pencarian.
* Sistem menampilkan kartu status lengkap dengan:
  - Header data perkara dan pihak terkait.
  - Progress stepper 4 tahap: `1. Pengajuan Masuk` ➔ `2. Verifikasi PTSP` ➔ `3. Pengesahan Pejabat` ➔ `4. Akta Terdaftar & QR`.
  - Catatan resmi petugas verifikator secara transparan.
  - Tombol unduh draf / salinan dokumen pendaftaran resmi.

### 6.2. Modul Pendaftaran Kuasa Terpadu 1 Halaman (Langkah 2, 3, 4 Dihapus Total)
1. **Pilihan 3 Kategori Kuasa & Input Identitas Minimalis (Nama & WhatsApp)**
   - **Kategori 1: Advokat / Kuasa Hukum**
     - Form Input: **Nama Pemohon** & **Nomor WhatsApp Aktif**.
     - Berkas yang diunggah (5 berkas):
       a. KTP Pemberi Kuasa
       b. KTP Penerima Kuasa
       c. KTA Penerima Kuasa
       d. Berita Acara Sumpah Advokat Penerima Kuasa
       e. Surat Kuasa
   - **Kategori 2: Kuasa Instansi Pemerintah**
     - Form Input: **Nama Pemohon** & **Nomor WhatsApp Aktif**.
     - Berkas yang diunggah (3 berkas):
       a. KTP Pemberi Kuasa
       b. KTP Penerima Kuasa
       c. Surat Kuasa
   - **Kategori 3: Kuasa Insidentil**
     - Form Input: **Nama Pemohon** & **Nomor WhatsApp Aktif**.
     - Berkas yang diunggah (4 berkas):
       a. KTP Pemberi Kuasa
       b. KTP Penerima Kuas
       c. Surat Kuasa
       d. Surat Keterangan Lurah / Desa terkait status hubungan
2. **Unggah Dokumen Berkas Pendukung Dinamis (*Canvas Compression & PDF Handler*)**
   - Kompresi gambar otomatis di sisi klien (maks 800px / 72% kualitas) dan dukungan file PDF.
   - Slot unggahan menyesuaikan secara instan dan reaktif saat kategori dipilih (5 slot untuk Advokat, 3 slot untuk Instansi, 4 slot untuk Insidentil).
3. **Pernyataan Kebenaran Data & Pengiriman Langsung**
   - Checklist konfirmasi keabsahan dokumen.
   - Tombol kirim pendaftaran langsung dengan penerbitan nomor agenda instan (`REG-YYYYMM-XXXX`) tanpa perlu melalui wizard multi-langkah.

### 6.3. Modul Meja Verifikator PTSP
* **Laci Inspeksi Berkas (*Document Inspection Drawer*):**
  - Slide-over panel dari sisi kanan layar tanpa meninggalkan halaman antrean.
  - Tab pengalih berkas dinamis sesuai kategori (KTP Pemberi, KTP Penerima, KTA, BAS, Surat Kuasa, atau Surat Keterangan Lurah).
  - Kontrol zoom dan rotasi gambar, serta penampil dokumen PDF terintegrasi.
  - Checklist Uji Kelayakan Formal & Material berkas.
* **Aksi Verifikator:**
  - `Lolos Verifikasi & Teruskan ke Pejabat`: Mengubah status berkas menjadi `Menunggu Pengesahan`.
  - `Minta Revisi`: Menginput catatan perbaikan berkas dan mengirim notifikasi WhatsApp ke pemohon.
  - `Tolak Berkas`: Menolak permohonan yang tidak memenuhi legalitas formal.

### 6.4. Modul Meja Pengesahan Panitera (TTE & PIN)
* Menampilkan daftar berkas yang berstatus `Menunggu Pengesahan`.
* Menampilkan pratinjau lembar akta resmi bersimbol garuda Mahkamah Agung, tabel pihak, klausul kuasa, dan barcode register.
* **Keypad Keamanan PIN:**
  - Mengharuskan Panitera memasukkan PIN otorisasi 6 digit (`123456`).
  - Setelah PIN valid, sistem menghasilkan nomor register resmi (contoh: `W11-U1/245/HK.02/XI/2026`), timestamp pengesahan, dan hash SHA-256 HMAC dokumen.

### 6.5. Modul Pengaturan Jenis Perkara & Tarif (Master Settings)
* Administrator dapat mengelola daftar opsi perkara secara visual:
  - **Tambah Jenis Perkara**: Nama perkara, kategori induk, kode singkatan, dan centang aktif/nonaktif.
  - **Edit & Hapus**: Memperbarui nama atau membuang opsi usang.
  - **1-Klik Toggle Status**: Mengaktifkan atau menonaktifkan opsi di formulir pendaftaran.
  - **Reset Standar MA**: Mengembalikan ke 5 opsi baku peradilan.
* Penyesuaian tarif PNBP, tarif meterai, dan nomor hotline kontak peradilan.

### 6.6. Modul Validasi Publik QR Code Dokumen
* Halaman responsif publik yang terbuka saat QR Code dokumen discan pihak ketiga di ruang sidang:
  - Menampilkan lencana hijau: **"DOKUMEN ASLI & TERDAFTAR RESMI"**.
  - Nomor Register Perkara, Kode Validasi, Nama Pemberi & Penerima Kuasa.
  - Pejabat Pengesah (Panitera Pengadilan) & Waktu Pencatatan Server.
  - Hash integritas digital SHA-256 HMAC dengan tombol *Salin Hash*.
  - Tombol unduh salinan dokumen PDF resmi.

### 6.7. Modul Notifikasi Otomatis (WhatsApp & Email)
* Setiap perubahan status memicu entri pada sheet `AntrianNotif`:
  - `PENDAFTARAN_BARU`: Mengirim nomor registrasi dan tautan lacak mandiri.
  - `MINTA_REVISI`: Mengirim rincian catatan petugas PTSP untuk diperbaiki pemohon.
  - `PENGESAHAN_SUKSES`: Mengirim kabar bahwa akta telah disahkan resmi lengkap dengan nomor register dan link download PDF.
* Diproses di latar belakang oleh trigger 5 menit `prosesAntrianNotif` via Fonnte Gateway.

---

## 7. SKEMA BASIS DATA SPREADSHEET (6 TABEL UTAMA)

Basis data disimpan pada Google Sheets dengan struktur relasional 6 sheet:

### 1. Sheet `Pengajuan` (Tabel Master Transaksi Pendaftaran)
| Kolom | Tipe Data | Deskripsi |
|:---|:---|:---|
| `id_pengajuan` | String (PK) | Kode agenda pendaftaran unik (contoh: `REG-202611-0082`) |
| `tanggal_daftar` | ISO DateTime | Waktu pendaftaran masuk |
| `nomor_register_resmi`| String | Nomor akta sah pengadilan (`W11-U1/245/HK.02/XI/2026`) |
| `kategori_pemohon` | Enum | `Advokat` / `Insidentil` |
| `nama_pemberi_kuasa` | String | Nama lengkap pihak pemberi kuasa |
| `nik_pemberi_kuasa` | String (16) | NIK KTP pemberi kuasa |
| `pekerjaan_pemberi` | String | Pekerjaan pemberi kuasa |
| `alamat_pemberi` | Text | Domisili lengkap pemberi kuasa |
| `no_wa_pemohon` | String | Nomor WhatsApp aktif untuk notifikasi |
| `email_pemohon` | String | Alamat email pemohon |
| `nama_penerima_kuasa` | String | Nama advokat / penerima kuasa |
| `identitas_penerima` | String | Nomor KTA Advokat / NIK penerima |
| `kantor_penerima` | String | Nama kantor hukum / firma advokat |
| `telepon_penerima` | String | Nomor telepon kantor penerima kuasa |
| `alamat_penerima` | Text | Alamat kantor hukum penerima |
| `jenis_perkara` | String | Klasifikasi perkara (dinamis dari master) |
| `nomor_perkara` | String | Nomor perkara SIPP terkait |
| `lingkup_wewenang` | Text | Uraian wewenang yang diberikan |
| `url_ktp_pemberi` | String (URL) | Link file KTP Pemberi Kuasa di Google Drive |
| `url_ktp_penerima` | String (URL) | Link file KTP Penerima Kuasa di Google Drive |
| `url_kta_penerima` | String (URL) | Link file KTA Advokat di Google Drive |
| `url_bas_penerima` | String (URL) | Link file Berita Acara Sumpah PT di Drive |
| `url_surat_kuasa` | String (URL) | Link file Naskah Asli Surat Kuasa di Drive |
| `url_bukti_pnbp` | String (URL) | Link file Bukti Setor PNBP Leges di Drive |
| `status` | Enum | `Menunggu Verifikasi`, `Perlu Revisi`, `Menunggu Pengesahan`, `Disahkan/Terdaftar`, `Ditolak` |
| `catatan_petugas` | Text | Catatan revisi / perbaikan dari staf loket |
| `petugas_verifikator`| String | Nama & NIP staf loket yang memeriksa |
| `pejabat_pengesah` | String | Nama & NIP Panitera yang mengesahkan |
| `tanggal_pengesahan` | String | Waktu pengesahan resmi |
| `url_dokumen_pdf` | String (URL) | Link file PDF akta resmi di Drive |
| `hash_verifikasi` | String (64) | SHA-256 HMAC digital signature |
| `total_biaya` | Number | Total biaya PNBP + Meterai (Rp 20.000) |

### 2. Sheet `Pengguna` (Tabel Hak Akses & Akun Aparatur)
| Kolom | Tipe Data | Deskripsi |
|:---|:---|:---|
| `user_id` | String (PK) | ID pengguna (contoh: `USR-01`) |
| `username` | String (Unique) | Username login (`admin`, `petugas1`, `panitera`) |
| `nama_lengkap` | String | Nama lengkap berserta gelar |
| `nip` | String | Nomor Induk Pegawai resmi |
| `jabatan` | String | Jabatan kedinasan di Pengadilan Negeri |
| `role` | Enum | `ADMIN`, `PETUGAS`, `PEJABAT` |
| `status_aktif` | Boolean | `TRUE` / `FALSE` |

### 3. Sheet `AppConfig` (Tabel Parameter & Konfigurasi Sistem)
Menyimpan pasangan `key`, `value`, dan `keterangan`:
- `APP_NAME`: Nama sistem aplikasi.
- `INSTANSI`: Nama satuan kerja pengadilan negeri.
- `HOTLINE_PTSP`: Nomor telepon loket informasi.
- `BIAYA_PNBP`: Besaran tarif PNBP (Rp 10.000).
- `BIAYA_EMETERAI`: Besaran tarif meterai elektronik (Rp 10.000).
- `JENIS_PERKARA`: Serialized JSON array opsi klasifikasi perkara.

### 4. Sheet `Log_Aktivitas` (Audit Trail)
Merekam jejak audit keamanan setiap transaksi: `timestamp`, `user`, `aksi` (LOGIN, VERIFIKASI, REVISI, PENGESAHAN_TTE), `id_ref`, dan `keterangan`.

### 5. Sheet `AntrianNotif` (Antrean Notifikasi Background)
Merekam antrean pesan WhatsApp dan email non-blocking: `id_antrian`, `kanal` (WA/EMAIL), `tujuan`, `nama`, `subjek`, `pesan`, `event`, `ref_id`, `status` (Antri/Terkirim), dan `created_at`.

---

## 8. SPESIFIKASI REST API BACKEND GOOGLE APPS SCRIPT

Seluruh komunikasi frontend-backend dilayani oleh endpoint tunggal Web App Apps Script:

### A. Endpoint `doGet(e)`
* `?action=listPengajuan`: Mengembalikan seluruh daftar permohonan (dioptimasi dengan `CacheX`).
* `?action=trackPengajuan&query=REG-XXXX`: Pencarian cepat status berdasarkan No. Registrasi atau WhatsApp.
* `?action=getMetrics`: Mengembalikan data agregat KPI statistik peradilan.
* `?action=getCaseTypes`: Mengembalikan daftar opsi klasifikasi perkara aktif.

### B. Endpoint `doPost(e)`
* `action: 'login'`: Verifikasi kredensial username & password aparatur pengadilan.
* `action: 'daftarSuratKuasa'`: Menerima berkas pendaftaran baru, menyimpan foto ke Google Drive, dan mengantrekan notifikasi WA tanda terima.
* `action: 'updateStatus'`: Update status verifikasi PTSP (Lolos / Minta Revisi / Tolak) beserta catatan petugas.
* `action: 'sahkanDokumen'`: Validasi PIN 6 digit Panitera, penerbitan nomor register resmi, stempel TTE, dan pembubuhan hash SHA-256.
* `action: 'saveCaseTypes'`: Menyimpan pembaruan daftar klasifikasi jenis perkara ke server.

---

## 9. DESAIN VISUAL, TEMA & IDENTITAS ANTARMUKA (UI/UX)

* **Prinsip Tampilan:** Clean, Elegan, Modern, dan Responsif (Mobile-First) sesuai standar desain peradilan modern.
* **Palet Warna Khas Peradilan Indonesia:**
  - **Dominan / Primary:** *Deep Court Green* (`#003923` / `#0d5236`) — Melambangkan keadilan, kepastian hukum, dan wibawa lembaga peradilan.
  - **Aksen / Secondary:** *Judicial Gold/Brass* (`#fdc668` / `#f4bd61`) — Melambangkan integritas dan keunggulan pelayanan publik.
  - **Latar Belakang / Surface:** `#ffffff` (Pure White) & `#f8fafc` (Slate Surface Low).
  - **Avatar Identitas Aparatur:** Lingkaran emas bertuliskan bold **`PN`** (Pengadilan Negeri) dengan bingkai hijau peradilan.
* **Tipografi:** Kombinasi modern Google Fonts `Plus Jakarta Sans` (headline/judul resmi) dan `Inter` (body text dokumen hukum).
* **Komponen Interaktif:** Modal pendaftaran sukses, dialog konfirmasi PIN otorisasi, slide-over drawer inspeksi identitas, toast notification corner, dan print layout khusus kertas akta resmi (`@media print`).

---

## 10. KETAHANAN SISTEM & MITIGASI LIMITASI GOOGLE APPS SCRIPT

| Limitasi Google Apps Script | Dampak Potensial | Solusi / Mitigasi yang Diterapkan |
|:---|:---|:---|
| **CORS Preflight (OPTIONS)** | Request POST browser gagal | Mengirim body POST bertipe `'Content-Type': 'text/plain;charset=utf-8'`. GAS memproses payload teks mentah menjadi JSON tanpa memicu preflight error. |
| **Batas Payload 10 MB** | Upload foto KTP/KTA gagal jika resolusi tinggi | Kompresi otomatis berbasis HTML5 Canvas di browser pemohon sebelum upload (< 500 KB per berkas). |
| **Batas CacheService 100 KB** | Error saat daftar permohonan sudah banyak | Modul `CacheX` memecah payload menjadi chunk-chunk 50 KB berpartisi otomatis saat disimpan dan digabung kembali saat dibaca. |
| **Kuota Waktu Eksekusi 6 Menit** | Timeout saat mengirim blast WA | Notifikasi dipisahkan ke antrean background non-blocking (`AntrianNotif`) yang diproses trigger berkala. |
| **Koneksi Internet Fluktuatif** | Halaman blank saat sinyal pemohon putus | PWA Service Worker Network-First dan fallback `localStorage` memastikan antarmuka tetap interaktif dan tidak kehilangan draf isian form. |

---

## 11. STRUKTUR BERKAS LENGKAP PROYEK

```
surat-kuasa-online/
├── index.html                 # Single Page Application (6 View Terpadu & Modal Dialog)
├── css/
│   └── style.css              # Custom Animations, Print Layout Akta, & Scrollbar Styling
├── js/
│   ├── config.js              # Konfigurasi Publik (GAS_URL, Identitas PN, Mode Demo)
│   └── app.js                 # Router SPA, State Engine, Auth, Canvas Comp, & CRUD
├── manifest.json              # Web App Manifest PWA Peradilan
├── sw.js                      # Service Worker v2 (Network-First Strategy)
├── icon-192.png               # Ikon PWA 192x192 Simbol Timbangan Pengadilan
├── icon-512.png               # Ikon PWA 512x512 Simbol Timbangan Pengadilan
├── PRD_FINAL.md               # Dokumen Spesifikasi Kebutuhan Produk (Final)
├── DEPLOYMENT_GUIDE.md        # Panduan Lengkap Instalasi & Cutover Produksi
├── panduan-instalasi.html     # Stasiun Salin Kode 1-Klik Interaktif untuk Orang Awam
└── backend/
    ├── appsscript.json        # Manifes Apps Script (Asia/Jakarta, Anyone Webapp)
    ├── Kode.gs                # REST API Controller, CacheX, Dispatcher, & Login Handler
    ├── Setup.gs               # Inisialisasi Otomatis Drive, Sheets, Hak Akses, & Properties
    ├── Notifikasi.gs          # Dispatcher Notifikasi WhatsApp (Fonnte API) & Email
    └── Migrasi.gs             # Utilitas Migrasi & Delta-Sync Database Antar-Spreadsheet
```

---

## 12. KESIMPULAN & STATUS KESIAPAN RILIS

Dokumen **PRD Final** ini mencerminkan 100% fungsionalitas, arsitektur teknis, dan antarmuka visual yang telah selesai dibangun dan diuji pada repositori proyek. Sistem telah memenuhi seluruh kriteria kelayakan peradilan modern:
1. **Zero-Paperwork & Zero-Queue:** Pendaftaran dan penelusuran mandiri 24/7 tanpa antrean loket fisik.
2. **Keabsahan Hukum & Keamanan Dokumen:** Validasi tanda tangan digital ber-PIN dan verifikasi keaslian publik via QR Code HMAC SHA-256.
3. **Keandalan Infrastruktur:** Tanpa biaya server bulanan, performa tinggi dengan *Client-Side SPA*, dan terlindungi dari limitasi kuota Google Apps Script.

**Status: SIAP PRODUKSI (PRODUCTION READY)** ⚖️🇮🇩
