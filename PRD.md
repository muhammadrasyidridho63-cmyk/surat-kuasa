# PRD Aplikasi Pendaftaran Surat Kuasa Online (E-Kuasa)

## Deskripsi Aplikasi
Aplikasi berbasis web Google Apps Script (GAS) dengan database Google Sheets untuk memfasilitasi permohonan pendaftaran surat kuasa secara mandiri oleh pemohon (Advokat / Kuasa Hukum, Kuasa Instansi Pemerintah, maupun Kuasa Insidentil), pengelolaan berkas persyaratan digital di Google Drive, serta proses verifikasi dan pencatatan buku register oleh petugas kepaniteraan hukum secara efisien, akuntabel, dan transparan.

## Role Akses
1. **Pemohon (Advokat / Kuasa Instansi Pemerintah / Kuasa Insidentil):** Registrasi, login, membuat permohonan pendaftaran kuasa baru dalam 1 halaman terpadu, mengunggah dokumen persyaratan wajib sesuai kategori, memantau progres verifikasi, melakukan perbaikan berkas jika berstatus revisi, dan mencetak tanda terima resmi.
2. **Petugas (Kepaniteraan Hukum):** Melihat antrean pengajuan, memeriksa data dan preview dokumen digital secara dinamis sesuai kategori, memverifikasi permohonan (setujui / minta revisi dengan catatan perbaikan), menginput nomor registrasi resmi, dan mengelola buku register surat kuasa.
3. **Admin:** Mengelola data pengguna (tambah, edit, reset password, aktivasi/nonaktif akun), memantau kapasitas penyimpanan Google Drive, memantau log aktivitas sistem, dan mencetak laporan rekapitulasi berkas.

## Menu & Fitur Utama

### Menu Publik
- **Halaman Login & Registrasi:** Autentikasi akun pemohon, petugas, dan admin dengan validasi username/email dan password.
- **Halaman Cek Status Mandiri:** Pelacakan cepat status permohonan menggunakan ID Permohonan atau Nomor WhatsApp tanpa wajib login.

### Dashboard Pemohon
- **Ringkasan Berkas:** Menampilkan total permohonan, status menunggu verifikasi, perlu revisi, dan disetujui.
- **Formulir Permohonan Baru (1 Halaman Terpadu):**
  - Pilihan **3 Kategori Kuasa** dengan input identitas ringkas (**Nama Pemohon** dan **Nomor WhatsApp Aktif**) serta slot unggah berkas dinamis (format PDF/JPG/PNG, otomatis tersimpan ke Google Drive):
    1. **Advokat / Kuasa Hukum** (5 berkas wajib):
       - Kartu Tanda Penduduk Pemberi Kuasa
       - Kartu Tanda Penduduk Penerima Kuasa
       - Kartu Tanda Advokat Penerima Kuasa
       - Berita Acara Sumpah Advokat
       - Surat Kuasa
    2. **Kuasa Instansi Pemerintah** (3 berkas wajib):
       - Kartu Tanda Penduduk Pemberi Kuasa
       - Kartu Tanda Penduduk Penerima Kuasa
       - Surat Kuasa
    3. **Kuasa Insidentil** (4 berkas wajib):
       - Kartu Tanda Penduduk Pemberi Kuasa
       - Kartu Tanda Penduduk Penerima Kuasa
       - Surat Kuasa
       - Surat Keterangan Lurah / Desa terkait status hubungan
- **Riwayat & Status Permohonan:** Tabel daftar permohonan dengan status real-time, catatan revisi petugas, fitur edit/unggah ulang dokumen jika status *Perlu Revisi*, dan tombol cetak **Tanda Terima Permohonan** jika status *Disetujui*.

### Dashboard Petugas
- **Statistik Pelayanan:** Metrik total berkas masuk, terverifikasi hari ini, dan antrean pending.
- **Antrean Verifikasi:**
  - Tabel berkas masuk terurut berdasarkan tanggal pengajuan dengan badge kategori kuasa.
  - Modal verifikasi berkas: preview langsung dokumen unggahan secara dinamis sesuai kategori tanpa keluar halaman.
  - Aksi verifikasi: tombol **Setujui** (wajib input `Nomor_Register_Resmi`) atau **Minta Revisi** (wajib menyertakan `Catatan_Petugas`).
- **Buku Register Kuasa:** Tabel rekapitulasi seluruh surat kuasa yang telah berstatus *Disetujui*, dilengkapi filter periode tanggal, filter kategori, pencarian nama pemohon/nomor register, dan ekspor data.

### Dashboard Admin
- **Manajemen User:** Kelola akun pemohon dan petugas (tambah, edit, reset password, serta status akun aktif/nonaktif).
- **Rekapitulasi & Log Sistem:** Monitoring kapasitas folder Google Drive penyimpanan berkas, log aktivitas sistem, dan rekapitulasi berkas.

## Struktur Data (Google Sheets)

**Sheet: USERS**

| Kolom | Tipe | Keterangan |
|---|---|---|
| User_ID | String | ID unik user (contoh: USR-001) |
| Username | String | Username login / Email |
| Password | String | Password akun |
| Nama_Lengkap | String | Nama lengkap pengguna |
| No_HP_WA | String | Nomor WhatsApp aktif untuk koordinasi |
| Role | String | Role: Pemohon / Petugas / Admin |
| Status_Aktif | Boolean | TRUE jika aktif, FALSE jika nonaktif |
| Created_At | Date | Tanggal dan waktu registrasi akun |

**Sheet: PERMOHONAN_KUASA**

| Kolom | Tipe | Keterangan |
|---|---|---|
| Permohonan_ID | String | ID registrasi unik (contoh: REG-202611-001) |
| User_ID | String | Relasi ke sheet USERS (Pemohon) |
| Tanggal_Pengajuan | Date | Tanggal dan jam pengajuan |
| Kategori_Kuasa | String | Advokat / Instansi Pemerintah / Insidentil |
| Nama_Pemohon | String | Nama lengkap pemohon / pemberi kuasa |
| No_HP_WA | String | Nomor WhatsApp aktif pemohon |
| Status | String | Menunggu Verifikasi / Perlu Revisi / Disetujui |
| Nomor_Register_Resmi | String | Nomor register surat kuasa yang diinput petugas |
| Catatan_Petugas | String | Alasan penolakan atau catatan perbaikan berkas |
| Petugas_Verifikator | String | Nama/ID petugas yang memproses |
| Tanggal_Verifikasi | Date | Tanggal dan waktu verifikasi dilakukan |

**Sheet: BERKAS_UNGGAHAN**

| Kolom | Tipe | Keterangan |
|---|---|---|
| Berkas_ID | String | ID unik berkas (contoh: DOC-001) |
| Permohonan_ID | String | Relasi ke sheet PERMOHONAN_KUASA |
| Url_KTP_Pemberi | String | Tautan file Google Drive Kartu Tanda Penduduk Pemberi Kuasa |
| Url_KTP_Penerima | String | Tautan file Google Drive Kartu Tanda Penduduk Penerima Kuasa |
| Url_KTA_Advokat | String | Tautan file Google Drive Kartu Tanda Advokat Penerima Kuasa (khusus Advokat) |
| Url_BAS_Advokat | String | Tautan file Google Drive Berita Acara Sumpah Advokat (khusus Advokat) |
| Url_Surat_Kuasa | String | Tautan file Google Drive dokumen Surat Kuasa |
| Url_Surat_Lurah | String | Tautan file Google Drive Surat Keterangan Lurah / Desa terkait status hubungan (khusus Insidentil) |
| Updated_At | Date | Waktu terakhir unggahan berkas diperbarui |

## Catatan Khusus & Business Logic

1. **Penyimpanan Berkas ke Google Drive:**
   - Script backend GAS menerima file dalam format base64 dari form frontend, menyimpannya ke folder Google Drive, lalu mencatat tautan URL file ke sheet `BERKAS_UNGGAHAN`.
   - Nama file di Drive distandardisasi otomatis dengan pola: `[Permohonan_ID]_[JenisDokumen]_[NamaPemohon]`.
2. **Validasi Wajib Berkas Dinamis Sesuai Kategori:**
   - Form pengajuan tidak dapat disubmit jika salah satu berkas wajib sesuai kategori yang dipilih masih kosong (5 berkas untuk *Advokat / Kuasa Hukum*, 3 berkas untuk *Kuasa Instansi Pemerintah*, dan 4 berkas untuk *Kuasa Insidentil*).
   - Ukuran masing-masing file dibatasi maksimal 5 MB dengan format yang diizinkan: PDF, JPG, JPEG, PNG.
3. **Penguncian Data (Data Locking):**
   - Permohonan dengan status *Menunggu Verifikasi* dan *Disetujui* terkunci secara otomatis sehingga pemohon tidak dapat mengubah isi data maupun mengganti file.
   - Pemohon hanya diizinkan memperbarui data dan mengunggah ulang dokumen pengganti apabila status permohonan diubah oleh Petugas menjadi *Perlu Revisi*.
4. **Verifikasi dan Penomoran Register:**
   - Tombol **Setujui** pada dashboard petugas memvalidasi input wajib `Nomor_Register_Resmi`. Status tidak dapat diubah menjadi *Disetujui* sebelum nomor register terisi.
   - Jika petugas memilih **Minta Revisi**, kolom `Catatan_Petugas` wajib diisi agar pemohon mengetahui dokumen atau data mana yang harus diperbaiki.
5. **Akses Preview Dokumen Drive:**
   - Folder Google Drive sistem diatur izin aksesnya agar tautan file dapat ditampilkan secara langsung pada modal preview viewer di dashboard Petugas, dengan tab dokumen menyesuaikan kategori permohonan.
6. **Pencetakan Bukti Tanda Terima:**
   - Tombol cetak tanda terima hanya aktif apabila permohonan telah berstatus *Disetujui*, menghasilkan layout cetak tanda terima formal yang mencantumkan ID Permohonan, Kategori Kuasa, Nomor Register Resmi, tanggal pengesahan, dan nama pemohon.
