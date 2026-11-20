# PANDUAN LENGKAP DEPLOYMENT & INSTALASI
## Aplikasi E-Surat Kuasa Online Pengadilan Negeri (Full-Stack)

Dokumen ini memandu Anda langkah-demi-langkah memasang backend Google Apps Script (GAS) dan mempublikasikan frontend statis Progressive Web App (PWA) ke **GitHub Pages**.

---

## 🏗️ Struktur Berkas Proyek

```text
surat kuasa online/
├── index.html                   ← Tampilan Single Page Application (SPA) utama
├── manifest.json                ← Identitas PWA (Dapat diinstal di layar HP/Desktop)
├── sw.js                        ← PWA Service Worker (Cache offline & instan)
├── icon-192.png                 ← Ikon PWA 192x192 px
├── icon-512.png                 ← Ikon PWA 512x512 px
├── css/
│   └── style.css                ← Gaya kustom & cetak akta PDF resmi
├── js/
│   ├── config.js                ← Konfigurasi URL backend GAS & parameter publik
│   └── app.js                   ← Mesin SPA, router 0ms, form wizard & offline cache
├── backend/
│   ├── Kode.gs                  ← REST API JSON murni (doGet & doPost) + CacheX
│   ├── Setup.gs                 ← Auto-setup folder Drive & Spreadsheet idempoten
│   ├── Notifikasi.gs            ← Integrasi WA Fonnte, Email, & antrean non-blocking
│   └── Migrasi.gs               ← Utilitas sinkronisasi & migrasi database lama
└── DEPLOYMENT_GUIDE.md          ← Panduan instalasi ini
```

---

## 🚀 BAGIAN 1: SETUP BACKEND (GOOGLE APPS SCRIPT)

### Langkah 1.1: Buat Proyek Google Apps Script Baru
1. Buka peramban Anda dan kunjungi: [script.google.com](https://script.google.com).
2. Klik tombol **+ Proyek Baru (New Project)**.
3. Beri nama proyek di kiri atas: `Backend E-Surat Kuasa Online`.

### Langkah 1.2: Salin Berkas Backend
Di editor Apps Script, buat berkas skrip (`.gs`) sesuai struktur folder `backend/`:
1. Berkas `Code.gs` bawaan: Hapus isinya, salin seluruh isi dari file lokal [backend/Kode.gs](file:///d:/rasyid/Aplikasi/master-aplikasi/surat%20kuasa%20online/backend/Kode.gs), lalu tempelkan.
2. Klik tanda **+** di sebelah *Files* > Pilih **Script**:
   - Beri nama: `Setup` -> Tempelkan seluruh isi dari [backend/Setup.gs](file:///d:/rasyid/Aplikasi/master-aplikasi/surat%20kuasa%20online/backend/Setup.gs).
3. Klik tanda **+** lagi > Pilih **Script**:
   - Beri nama: `Notifikasi` -> Tempelkan seluruh isi dari [backend/Notifikasi.gs](file:///d:/rasyid/Aplikasi/master-aplikasi/surat%20kuasa%20online/backend/Notifikasi.gs).
4. Klik tanda **+** lagi > Pilih **Script**:
   - Beri nama: `Migrasi` -> Tempelkan seluruh isi dari [backend/Migrasi.gs](file:///d:/rasyid/Aplikasi/master-aplikasi/surat%20kuasa%20online/backend/Migrasi.gs).
5. Klik ikon **Simpan (Save)** (ikon disket).

### Langkah 1.3: Jalankan Inisialisasi Otomatis (`setupAppEnvironment`)
1. Pada bilah atas editor, pada menu dropdown fungsi di samping tombol "Debug", pilih fungsi **`setupAppEnvironment`**.
2. Klik tombol **Jalankan (Run)**.
3. Saat Google meminta izin:
   - Klik **Tinjau Izin (Review Permissions)**.
   - Pilih akun Google Anda.
   - Klik **Advanced (Lanjutan)** > Klik **Buka Backend E-Surat Kuasa Online (tidak aman)**.
   - Klik **Izinkan (Allow)**.
4. Periksa panel *Log Eksekusi* di bagian bawah. Anda akan melihat pesan sukses dengan tautan Google Spreadsheet dan Folder Drive yang dibuat otomatis!

### Langkah 1.4: Deploy Sebagai Web App (REST API)
1. Di pojok kanan atas, klik tombol biru **Terapkan (Deploy)** > **Penerapan Baru (New deployment)**.
2. Klik ikon roda gigi ⚙️ di sebelah kiri > Pilih **Aplikasi web (Web app)**.
3. Masukkan konfigurasi wajib berikut:
   - **Deskripsi**: `Versi 1 Produksi REST API`
   - **Jalankan sebagai (Execute as)**: `Saya (email@gmail.com)` *(Me)*
   - **Yang memiliki akses (Who has access)**: `Siapa saja (Anyone)` *(Wajib Anyone agar frontend GitHub Pages bebas akses tanpa login akun Google instansi)*.
4. Klik **Terapkan (Deploy)**.
5. Salin string **URL Aplikasi Web** yang berakhiran `/exec`.  
   *(Contoh: `https://script.google.com/macros/s/AKfycbz1234567890/exec`)*.

---

## 🌐 BAGIAN 2: HUBUNGKAN FRONTEND KE BACKEND

Buka berkas lokal [js/config.js](file:///d:/rasyid/Aplikasi/master-aplikasi/surat%20kuasa%20online/js/config.js):
Ganti baris `GAS_URL: ''` dengan URL deployment yang baru saja Anda salin:

```javascript
const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbz_URL_ANDA_DI_SINI/exec',
  // ...
};
```
Simpan file `js/config.js`.

---

## 🐙 BAGIAN 3: DEPLOY FRONTEND KE GITHUB PAGES

Sesuai panduan ramah pemula di `/github-pages-deploy-guide`:

### Langkah 3.1: Buat Repositori di GitHub
1. Masuk ke akun [GitHub](https://github.com).
2. Klik tanda **+** di pojok kanan atas > **New repository**.
3. Beri nama repositori, misalnya: `surat-kuasa-online`.
4. Pilih **Public** (wajib untuk GitHub Pages gratis).
5. **JANGAN** centang *Add a README file*, *.gitignore*, atau *license*.
6. Klik tombol hijau **Create repository**.

### Langkah 3.2: Eksekusi Perintah Git di Terminal (PowerShell)
Buka terminal PowerShell di folder proyek ini (`d:\rasyid\Aplikasi\master-aplikasi\surat kuasa online`), lalu jalankan baris perintah berikut secara berurutan:

```powershell
# 1. Inisialisasi Git lokal
git init

# 2. Tambahkan seluruh berkas frontend & dokumentasi
git add .

# 3. Buat commit pertama
git commit -m "Rilis awal E-Surat Kuasa Online Pengadilan PWA"

# 4. Ganti branch utama menjadi main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda (Ganti USERNAME & NAMA-REPO dengan milik Anda)
git remote add origin https://github.com/USERNAME/surat-kuasa-online.git

# 6. Kirim berkas ke GitHub
git push -u origin main
```

> **Catatan Autentikasi Password:**  
> Jika terminal meminta password GitHub, gunakan **Personal Access Token (PAT)** Anda, bukan kata sandi akun biasa.  
> Buat token PAT di: `github.com/settings/tokens` > *Generate new token (classic)* > Centang cakupan **repo** > Salin token `ghp_...`.

### Langkah 3.3: Aktifkan Fitur GitHub Pages
1. Di halaman repositori GitHub Anda, klik tab **Settings** (ikon roda gigi).
2. Di bilah menu samping kiri, klik **Pages**.
3. Di bagian **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: Pilih `main` dan folder `/ (root)`
   - Klik **Save**.
4. Centang **Enforce HTTPS**.
5. Tunggu 1–2 menit, lalu refresh halaman sampai muncul kotak notifikasi hijau:  
   `Your site is live at https://USERNAME.github.io/surat-kuasa-online/`

---

## 📱 BAGIAN 4: PENGUJIAN PWA DI SMARTPHONE & DESKTOP

1. Buka tautan GitHub Pages di Google Chrome smartphone Android atau Safari iPhone.
2. **Android**: Klik menu titik tiga > Pilih **"Tambahkan ke Layar Utama" (Add to Home screen)** atau klik tombol *"Pasang Aplikasi"* di bilah atas.
3. **iPhone**: Klik tombol *Share* (kotak dengan panah atas) > Pilih **"Add to Home Screen"**.
4. Aplikasi kini beroperasi seperti aplikasi native: bebas bilah browser, dapat dibuka cepat (0ms), dan data tetap tersimpan saat koneksi terputus.

---

## 🔔 BAGIAN 5: AKTIVASI NOTIFIKASI WA (FONNTE - OPSIONAL)

1. Daftar akun di [fonnte.com](https://fonnte.com) dan tautkan nomor WhatsApp resmi pengadilan.
2. Salin token API Fonnte Anda.
3. Buka editor Google Apps Script > Klik ikon roda gigi ⚙️ **Project Settings** di bilah kiri.
4. Gulir ke bawah ke bagian **Script Properties** > Klik **Add script property**:
   - Property: `FONNTE_TOKEN`
   - Value: `tempelkan_token_fonnte_anda`
5. Klik **Save script properties**.
6. Buka berkas `Notifikasi.gs` > Jalankan fungsi **`pasangTriggerNotifikasi`** sekali saja untuk menyalakan background dispatcher otomatis setiap 5 menit.

---

## 🔑 KREDENSIAL LOGIN & DEMO INTERNAL

### Daftar Akun Default Aparatur Pengadilan:

| No | Peran / Jabatan | Username | Password | NIP | Akses Menu |
|:---|:---|:---|:---|:---|:---|
| 1 | **Administrator IT** | `admin` | `admin123` | `19850101 201001 1 001` | **Semua Menu** (Dashboard Admin, Verifikator, Pengesahan, dsb.) |
| 2 | **Petugas Loket PTSP** | `petugas1` *(atau `petugas`)* | `petugas123` | `19920315 201602 1 003` | **Meja Verifikator PTSP** & Verifikasi Berkas |
| 3 | **Panitera Pengadilan** | `panitera` | `panitera123` | `19740512 199903 1 002` | **Meja Pengesahan (TTE)** & Dashboard |

* **PIN Keamanan Pengesahan Pejabat (Panitera)**: `123456`
* **Nomor Registrasi Contoh untuk Pelacakan**: `REG-202611-0082` atau `REG-202611-0088`
* **Pencarian Telepon Contoh**: `081298457721` atau `081688992211`
