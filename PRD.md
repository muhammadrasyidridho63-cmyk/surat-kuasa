# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Aplikasi Surat Kuasa Online Berbasis Google Apps Script (GAS)

---

### 1. Judul & Ringkasan Eksekutif
* **Nama Produk:** Aplikasi Surat Kuasa Online Pengadilan
* **Tipe Aplikasi:** Single Page Application (SPA) Web App berbasis Google Apps Script & Google Sheets
* **Status Proyek:** Siap Implementasi (Ready for Prototyping)
* **Ringkasan Eksekutif:**  
  Aplikasi Surat Kuasa Online adalah sistem layanan pendaftaran dan legalisasi surat kuasa elektronik mandiri untuk lingkungan peradilan/lembaga hukum. Aplikasi ini memfasilitasi advokat dan masyarakat umum (pemberi kuasa perorangan) untuk mendaftarkan surat kuasa secara daring tanpa perlu mengantre di loket Pelayanan Terpadu Satu Pintu (PTSP). Sistem ini mengintegrasikan alur verifikasi berkas oleh staf/petugas loket, penandatanganan elektronik/pengesahan berkas oleh Pejabat Berwenang (Panitera/Ketua Pengadilan), serta penerbitan akta/lembar surat kuasa terdaftar berformat PDF yang dilengkapi QR Code Validasi Keaslian publik ber-HMAC.

---

### 2. Tujuan Produk & Nilai Bisnis
* **Eliminasi Antrean Fisik:** Menghilangkan antrean manual di loket PTSP dengan memindahkan 100% proses pendaftaran dan pelacakan ke platform digital yang dapat diakses 24/7 dari ponsel atau komputer.
* **Transparansi & Akuntabilitas:** Pemohon dapat memantau status registrasi secara *real-time* menggunakan kode registrasi / nomor telepon.
* **Efisiensi Kerja Lembaga:** Memangkas waktu verifikasi berkas dan penerbitan nomor pendaftaran dari hitungan jam/hari menjadi hanya beberapa menit.
* **Autentikasi Dokumen Hukum Terpercaya:** Menjamin keaslian lembar registrasi kuasa melalui QR Code verifikasi publik yang memuat hash integritas dokumen dan riwayat pengesahan pejabat.
* **Hemat Anggaran Infrastruktur:** Memanfaatkan ekosistem gratis namun tangguh dari Google Workspace (Google Sheets sebagai basis data, Google Drive sebagai media penyimpanan, dan Google Apps Script sebagai komputasi server).

---

### 3. Pengguna Target & Matriks Hak Akses (RBAC)

Aplikasi memiliki 4 tingkatan hak akses (Role-Based Access Control):

| Peran (Role) | Target Pengguna | Hak Akses & Kewenangan |
| :--- | :--- | :--- |
| **Publik / Pemohon** | Advokat & Masyarakat Umum | - Mengakses formulir pendaftaran surat kuasa mandiri.<br>- Mengunggah kelengkapan identitas (KTP/KTA Advokat).<br>- Melacak status pengajuan dengan nomor resi pendaftaran.<br>- Mengunduh bukti pendaftaran / draf surat kuasa terdaftar ber-QR Code. |
| **Petugas / Staf Loket** | Staf PTSP / Bagian Hukum | - Login ke portal verifikasi.<br>- Meninjau antrean pendaftaran surat kuasa yang masuk.<br>- Memeriksa kelengkapan identitas dan dokumen pemohon.<br>- Memberikan catatan perbaikan/revisi jika berkas tidak lengkap.<br>- Meneruskan berkas yang valid ke meja pengesahan Pejabat. |
| **Pejabat Penanda Tangan** | Panitera / Pejabat Berwenang | - Login ke meja pengesahan dengan proteksi PIN keamanan.<br>- Memeriksa draf pendaftaran kuasa yang telah diverifikasi staf.<br>- Memberikan pengesahan/persetujuan digital (*1-Click Approval*).<br>- Menyetujui penerbitan nomor registrasi resmi & membubuhkan stempel/QR Code pengesahan. |
| **Administrator** | Tim IT / Pengelola Sistem | - Manajemen pengguna (tambah, edit, nonaktifkan staf/pejabat).<br>- Konfigurasi format nomor pendaftaran surat kuasa.<br>- Akses ke seluruh rekapitulasi data, audit log, dan ekspor database (Excel/Sheets). |

---

### 4. Arsitektur Data & Integrasi Ekosistem Google Workspace

Sistem memanfaatkan Google Sheets sebagai database relasional, Google Drive untuk arsip berkas, dan layanan inti Google Apps Script:

#### A. Skema Tabel Google Sheets
1. **`Sheet Pengajuan`** (Penyimpanan Data Pendaftaran):
   - `id_pengajuan`: UUID unik (contoh: `REG-202611-0001`)
   - `tanggal_daftar`: Timestamp pengajuan (format ISO/WIB)
   - `nomor_register_resmi`: Nomor surat register pengadilan (contoh: `W11-U1/123/HK.02/XI/2026`)
   - `kategori_pemohon`: `Advokat` / `Masyarakat Umum`
   - `nama_pemberi_kuasa`: Nama lengkap pihak pemberi kuasa
   - `nik_pemberi_kuasa`: NIK KTP pemberi kuasa
   - `pekerjaan_pemberi_kuasa`: Profesi pemberi kuasa
   - `alamat_pemberi_kuasa`: Domisili lengkap
   - `no_wa_pemohon`: Nomor WhatsApp aktif
   - `email_pemohon`: Email aktif pemohon
   - `nama_penerima_kuasa`: Nama advokat atau penerima kuasa
   - `identitas_penerima_kuasa`: No. KTA Advokat / NIK Penerima Kuasa
   - `alamat_penerima_kuasa`: Alamat kantor hukum / domisili
   - `perihal_kuasa`: Perihal perkara/keperluan kuasa
   - `lingkup_wewenang`: Rincian hak/wewenang yang diberikan
   - `url_ktp_pemberi`: Tautan file Google Drive KTP Pemberi
   - `url_kta_penerima`: Tautan file Google Drive KTA Advokat / KTP Penerima
   - `status`: `Menunggu Verifikasi` | `Perlu Revisi` | `Menunggu Pengesahan` | `Disahkan/Terdaftar` | `Ditolak`
   - `catatan_petugas`: Alasan perbaikan / catatan verifikasi staf
   - `petugas_verifikator`: Nama staf yang memverifikasi
   - `pejabat_pengesah`: Nama pejabat penanda tangan
   - `tanggal_pengesahan`: Timestamp pengesahan oleh pejabat
   - `url_dokumen_pdf`: Tautan file PDF resmi hasil pengesahan di Google Drive
   - `hash_verifikasi`: Kode hash/token verifikasi QR Code keaslian dokumen

2. **`Sheet Master_Pengguna`** (Autentikasi Internal):
   - `user_id`: UUID
   - `username`: Username login
   - `password_hash`: SHA-256 + Salt hash kata sandi
   - `nama_lengkap`: Nama lengkap berserta gelar
   - `nip`: NIP pejabat/staf
   - `jabatan`: Panitera, Panitera Muda Hukum, Staf PTSP, Administrator
   - `role`: `ADMIN` | `PEJABAT` | `PETUGAS`
   - `pin_pengesahan`: Hash PIN rahasia untuk pejabat penanda tangan
   - `status_aktif`: `TRUE` / `FALSE`

3. **`Sheet Pengaturan`** (Konfigurasi Aplikasi):
   - Format penomoran otomatis registrasi peradilan.
   - Nama instansi pengadilan, logo pengadilan, dan teks kop surat.
   - Folder ID Google Drive untuk upload berkas.

4. **`Sheet Log_Aktivitas`** (Audit Trail):
   - `timestamp`, `user`, `aksi` (Verifikasi, Revisi, Pengesahan, Login), `id_pengajuan`, `keterangan`.

#### B. Integrasi Google Drive
* Folder Utama: `[Arsip] Surat Kuasa Online`
  * Subfolder: `Upload_Identitas/` (KTP & KTA pemohon)
  * Subfolder: `Dokumen_Disahkan_PDF/` (Surat kuasa terdaftar ber-QR siap unduh)

#### C. Integrasi Dokumen & Notifikasi
* **Google Docs Template & PDF Generator:** Menyusun lembar pendaftaran/akta kuasa otomatis dengan menyisipkan logo pengadilan, teks nomor perkara/registrasi, dan stempel QR Code keaslian.
* **GmailApp / MailApp:** Notifikasi email otomatis bukti tanda terima pendaftaran dan pemberitahuan saat surat kuasa selesai disahkan.

---

### 5. Persyaratan Fungsional

#### A. Modul Pemohon (Publik)
1. **Formulir Pendaftaran Multi-Step:**
   - Langkah 1: Kategori Pemohon & Identitas Pemberi Kuasa.
   - Langkah 2: Identitas Penerima Kuasa (Advokat/Keluarga) + Unggah Berkas Persyaratan (KTP/KTA).
   - Langkah 3: Rincian Keperluan Kuasa & Ringkasan Wewenang.
   - Langkah 4: Tinjauan Akhir (Review) & Persetujuan Pernyataan Kebenaran Data.
2. **Nomor Tanda Terima Instan:** Pemohon langsung mendapatkan Nomor Agenda Pendaftaran dan tautan cek status.
3. **Pencarian / Cek Status (*Tracking*):** Pencarian instan menggunakan Nomor Pendaftaran atau NIK/Nomor WA.
4. **Validasi Publik QR Code:** Halaman verifikasi publik terbuka saat QR Code pada dokumen PDF dipindai oleh pihak ketiga (hakim/lawan perkara/instansi lain) untuk membuktikan dokumen sah terdaftar di buku register pengadilan.

#### B. Modul Petugas (Staf Verifikator)
1. **Meja Verifikasi Antrean:** Tampilan tabel pendaftaran baru dengan penanda status warna visual.
2. **Inspeksi Berkas Terintegrasi:** Membuka berkas unggahan KTP/KTA langsung di modal pratinjau tanpa perlu berpindah tab browser.
3. **Aksi Verifikasi:**
   - Tombol **"Lolos Verifikasi"**: Mengirim berkas ke daftar tunggu Pejabat.
   - Tombol **"Minta Perbaikan / Revisi"**: Mengirimkan catatan kekurangan berkas ke pemohon.
   - Tombol **"Tolak"**: Menolak pengajuan yang tidak memenuhi syarat hukum dengan alasan formal.

#### C. Modul Pejabat Penanda Tangan
1. **Antrean Pengesahan:** Menampilkan berkas yang telah dinyatakan lengkap oleh verifikator.
2. **Pratinjau Dokumen Cetak:** Melihat tata letak lembar pendaftaran surat kuasa resmi sebelum disahkan.
3. **Eksekusi Pengesahan (TTE Ber-QR):** Pejabat memasukkan PIN keamanan untuk membubuhkan stempel digital dan menerbitkan nomor register pengadilan resmi.

#### D. Modul Administrator & Pelaporan
1. **Dashboard Statistik:** Diagram tren pendaftaran harian/bulanan, perbandingan pemohon advokat vs masyarakat umum, dan persentase kelulusan berkas.
2. **Tabel Data & Filter Lanjutan:** Filter rentang tanggal, filter status, filter nama instansi.
3. **Ekspor Data:** Fitur ekspor ke format Excel (.xlsx) / CSV / cetak buku register PDF.
4. **Manajemen Akun Internal:** Tambah staf loket baru dan pembaruan pejabat penanda tangan aktif.

---

### 6. Batasan Teknis & Mitigasi Kuota GAS

| Parameter GAS | Batasan Bawaan | Strategi Mitigasi Aplikasi |
| :--- | :--- | :--- |
| **Batas Waktu Eksekusi** | Maksimum 6 menit per fungsi | Menggunakan arsitektur Client-Side SPA; pemanggilan server dilakukan modular (*lightweight calls*), rendering UI 100% di browser pengguna. |
| **Kuota Baca/Tulis Sheets** | Rentan lambat jika per sel | Menggunakan *Batch Processing* (`getValues()` / `setValues()` dalam satu panggilan array utuh). Pemanfaatan `CacheService` untuk menyimpan data master & referensi. |
| **Payload Ukuran Unggah** | ~10 MB batas payload Apps Script | Berkas foto KTP/KTA dikompresi otomatis di sisi browser (*Client-Side Image Compression*) sebelum diubah menjadi base64 dan dikirim ke Google Drive. |
| **Akses Pengguna Publik** | Pemohon tidak memiliki email institusi | Model deployment: `Execute as: Me`, `Who has access: Anyone`. Autentikasi staf/pejabat dikelola di lapisan aplikasi via token sesi aman. |

---

### 7. Spesifikasi Tampilan & Antarmuka (UI/UX)

* **Tema Visual & Identitas Desain:**
  - **Gaya Desain:** Clean, Modern, Elegan, dan Responsif (Mobile-First).
  - **Palet Warna Utama Khas Pengadilan Indonesia:**
    - **Primary / Dominan:** Hijau Khas Peradilan (*Deep Court Green* - `#0d5236` / `#0f5e3d`) melambangkan keadilan, integritas, dan kewibawaan lembaga hukum.
    - **Secondary / Aksen:** Emas Peradilan (*Judicial Gold/Brass* - `#c8963e` / `#e5a93c`) melambangkan kehormatan dan keunggulan pelayanan publik.
    - **Background / Latar:** Putih Bersih (*Pure White* - `#ffffff`) dan Abu-Abu Muda Terang (*Soft Slate Gray* - `#f8fafc`).
    - **Permukaan Kartu (Card Surface):** Putih dengan bayangan halus (*subtle shadow*) untuk nuansa modern dan mewah.
    - **Warna Status:** 
      - Menunggu Verifikasi: Amber/Kuning (#f59e0b)
      - Perlu Revisi: Biru Informasi (#0284c7)
      - Disahkan: Hijau Emerald (#10b981)
      - Ditolak: Merah Karmin (#ef4444)
  - **Tipografi:** Sans-serif modern dan tegas seperti `Inter` atau `Plus Jakarta Sans` untuk kenyamanan membaca dokumen resmi.
  - **Komponen UI:**
    - Step-indicator pendaftaran dengan animasi halus.
    - Dialog modal interaktif untuk pratinjau KTP dan lembar PDF.
    - Kartu ringkasan data yang tertata proporsional dan mudah diisi di layar smartphone.
  - **Pelaporan & Visualisasi:**
    - Grafik batang & garis interaktif untuk visualisasi jumlah permohonan.
    - Kartu indikator KPI utama: Total Pengajuan, Surat Kuasa Terdaftar, Menunggu Verifikasi, Rata-rata Waktu Layanan.

---

### 8. Rencana Deployment & Tahapan Pengujian

1. **Fase 1: Persiapan Database & Lingkungan GAS**
   - Menyiapkan Spreadsheet induk dengan header kolom terstruktur.
   - Membuat Google Drive Folder ID untuk penampung berkas.
   - Mengatur `Script Properties` (penyimpanan parameter konfigurasi).
2. **Fase 2: Pengujian Alur Fungsional (End-to-End)**
   - *Test Case 1:* Pendaftaran pemohon dari sisi publik melalui smartphone dan penerimaan nomor resi.
   - *Test Case 2:* Proses peninjauan berkas oleh staf verifikator (skenario lulus dan skenario minta revisi).
   - *Test Case 3:* Pengesahan dengan PIN oleh pejabat penanda tangan dan terbitnya nomor surat resmi.
   - *Test Case 4:* Pengujian pemindaian QR Code dari dokumen cetak untuk validasi keaslian di peramban publik.
3. **Fase 3: Rilis Produksi (Cutover)**
   - Deploy versi baru Web App Google Apps Script.
   - Pemasangan tautan layanan di portal resmi pengadilan atau spanduk informasi loket PTSP.

---

🎨 **Tahapan Khusus: Penentuan Visual UI/UX**
1. Unggah Referensi: Silakan unggah referensi tangkapan layar, warna, dan gaya antarmuka yang diinginkan.
2. Jika Belum Ada Referensi Visual:
   - Salin seluruh teks dokumen PRD Final di atas.
   - Buka Google Stitch, lalu tempelkan teks PRD ke dalamnya.
   - Unduh hasil pratinjau desain visual yang dihasilkan oleh Google Stitch.
   - Unggah gambar hasil desain tersebut ke percakapan ini untuk diimplementasikan ke dalam kode HTML/CSS.
