/**
 * SETUP ENVIRONMENT OTOMATIS (IDEMPOTEN)
 * Jalankan fungsi setupAppEnvironment() SEKALI melalui Google Apps Script Editor.
 * 
 * Sesuai prinsip /gas-pro-api & /gas-rahasia-script-properties:
 * - Menyiapkan folder Google Drive otomatis
 * - Menyiapkan Google Spreadsheet dengan seluruh skema header tabel PRD
 * - Menyimpan seluruh ID & rahasia ke Script Properties secara aman
 */

function setupAppEnvironment() {
  const APP_NAME = 'E-Surat Kuasa Pengadilan Negeri';
  Logger.log('🚀 Memulai inisialisasi lingkungan ' + APP_NAME + '...');

  const props = PropertiesService.getScriptProperties();

  // 1. Folder Google Drive
  let rootFolderId = props.getProperty('ROOT_FOLDER_ID');
  let rootFolder;
  if (!rootFolderId) {
    rootFolder = DriveApp.createFolder('📁 [Sistem] ' + APP_NAME);
    rootFolderId = rootFolder.getId();
    props.setProperty('ROOT_FOLDER_ID', rootFolderId);
    Logger.log('📁 Root Folder dibuat: ' + rootFolder.getName());
  } else {
    rootFolder = DriveApp.getFolderById(rootFolderId);
    Logger.log('📁 Root Folder sudah ada: ' + rootFolder.getName());
  }

  let uploadsFolderId = props.getProperty('UPLOADS_FOLDER');
  if (!uploadsFolderId) {
    const uploadsFolder = rootFolder.createFolder('📂 Berkas_Identitas');
    uploadsFolderId = uploadsFolder.getId();
    props.setProperty('UPLOADS_FOLDER', uploadsFolderId);
  }

  let exportsFolderId = props.getProperty('EXPORTS_FOLDER');
  if (!exportsFolderId) {
    const exportsFolder = rootFolder.createFolder('📂 Dokumen_Resmi_PDF');
    exportsFolderId = exportsFolder.getId();
    props.setProperty('EXPORTS_FOLDER', exportsFolderId);
  }

  // 2. Google Spreadsheet Database
  let ssId = props.getProperty('SPREADSHEET_ID');
  let ss;
  if (!ssId) {
    ss = SpreadsheetApp.create('🗃️ Database — ' + APP_NAME);
    ssId = ss.getId();
    props.setProperty('SPREADSHEET_ID', ssId);

    // Pindahkan file spreadsheet ke Root Folder
    DriveApp.getFileById(ssId).moveTo(rootFolder);
    Logger.log('🗃️ Spreadsheet baru dibuat: ' + ss.getName());
  } else {
    ss = SpreadsheetApp.openById(ssId);
    Logger.log('🗃️ Menggunakan Spreadsheet terdaftar: ' + ss.getName());
  }

  // 3. Setup Sheet "Pengajuan"
  let shPengajuan = ss.getSheetByName('Pengajuan');
  if (!shPengajuan) {
    shPengajuan = ss.insertSheet('Pengajuan');
    shPengajuan.appendRow([
      'id_pengajuan',
      'tanggal_daftar',
      'nomor_register_resmi',
      'kategori_pemohon',
      'nama_pemberi_kuasa',
      'nik_pemberi_kuasa',
      'pekerjaan_pemberi_kuasa',
      'alamat_pemberi_kuasa',
      'no_wa_pemohon',
      'email_pemohon',
      'nama_penerima_kuasa',
      'identitas_penerima_kuasa',
      'kantor_penerima_kuasa',
      'no_wa_penerima',
      'alamat_penerima_kuasa',
      'jenis_perkara',
      'nomor_perkara',
      'lingkup_wewenang',
      'url_ktp_pemberi',
      'url_kta_penerima',
      'status',
      'catatan_petugas',
      'petugas_verifikator',
      'pejabat_pengesah',
      'tanggal_pengesahan',
      'url_dokumen_pdf',
      'hash_verifikasi',
      'total_biaya'
    ]);

    // Format Header Baris 1
    shPengajuan.getRange(1, 1, 1, 28).setBackground('#0D5236').setFontColor('#FFFFFF').setFontWeight('bold');
    shPengajuan.setFrozenRows(1);

    // Seed Data Awal
    shPengajuan.appendRow([
      'REG-202611-0088',
      '2026-11-14T08:55:00.000Z',
      'W11-U1/241/HK.02/XI/2026',
      'Advokat',
      'Ir. Suryo Pratomo',
      '3175081905780003',
      'Direktur Utama',
      'Jl. Merdeka Barat No. 22, Gambir, Jakarta Pusat',
      '081688992211',
      'suryo.pratomo@ptkaryamandiri.co.id',
      'Denny Siregar, S.H., M.H.',
      '09.21841/PERADI',
      'Kantor Advokat Denny Siregar & Rekan',
      '081299001122',
      'Sudirman Tower Lt. 18, Jakarta Selatan',
      'Perdata Gugatan',
      '89/Pdt.G/2026/PN',
      'Mewakili secara penuh untuk menghadiri persidangan, perdamaian/mediasi, mengajukan replik, kesimpulan, hingga upaya hukum banding.',
      '',
      '',
      'Disahkan/Terdaftar',
      'Berkas lengkap dan absah.',
      'Ahmad Syafii, S.Kom.',
      'Dr. H. Sulaiman, S.H., M.H. (Panitera)',
      '14 Nov 2026, 11:42 WIB',
      '',
      'a8f4b23c91e56b8209dc47120fe817c0326e0802c61148e100f917208d7d91e0',
      20000
    ]);
  }

  // 4. Setup Sheet "Master_Pengguna"
  let shPengguna = ss.getSheetByName('Master_Pengguna');
  if (!shPengguna) {
    shPengguna = ss.insertSheet('Master_Pengguna');
    shPengguna.appendRow(['user_id', 'username', 'nama_lengkap', 'nip', 'jabatan', 'role', 'status_aktif']);
    shPengguna.getRange(1, 1, 1, 7).setBackground('#0D5236').setFontColor('#FFFFFF').setFontWeight('bold');
    shPengguna.setFrozenRows(1);

    shPengguna.appendRow(['USR-01', 'admin', 'Administrator IT Pengadilan', '19850101 201001 1 001', 'Pranata Komputer', 'ADMIN', true]);
    shPengguna.appendRow(['USR-02', 'petugas1', 'Ahmad Syafii, S.Kom.', '19920315 201602 1 003', 'Staf PTSP Meja 1', 'PETUGAS', true]);
    shPengguna.appendRow(['USR-03', 'panitera', 'Dr. H. Sulaiman, S.H., M.H.', '19740512 199903 1 002', 'Panitera Pengadilan Negeri', 'PEJABAT', true]);
  }

  // 5. Setup Sheet "AppConfig"
  let shConfig = ss.getSheetByName('AppConfig');
  if (!shConfig) {
    shConfig = ss.insertSheet('AppConfig');
    shConfig.appendRow(['key', 'value', 'keterangan']);
    shConfig.getRange(1, 1, 1, 3).setBackground('#0D5236').setFontColor('#FFFFFF').setFontWeight('bold');
    shConfig.setFrozenRows(1);

    shConfig.appendRow(['APP_NAME', APP_NAME, 'Nama Aplikasi']);
    shConfig.appendRow(['INSTANSI', 'Pengadilan Negeri Kelas I A Khusus', 'Nama Lembaga']);
    shConfig.appendRow(['HOTLINE_PTSP', '(021) 8092-2345', 'Hotline Bantuan PTSP']);
    shConfig.appendRow(['BIAYA_PNBP', '10000', 'Tarif PNBP Pendaftaran Kuasa']);
    shConfig.appendRow(['BIAYA_EMETERAI', '10000', 'Tarif Meterai Elektronik']);
    shConfig.appendRow(['CREATED_AT', new Date().toISOString(), 'Waktu Setup Awal']);
  }

  // 6. Setup Sheet "Log_Aktivitas"
  let shLog = ss.getSheetByName('Log_Aktivitas');
  if (!shLog) {
    shLog = ss.insertSheet('Log_Aktivitas');
    shLog.appendRow(['timestamp', 'user', 'aksi', 'id_ref', 'keterangan']);
    shLog.getRange(1, 1, 1, 5).setBackground('#0D5236').setFontColor('#FFFFFF').setFontWeight('bold');
    shLog.setFrozenRows(1);
    shLog.appendRow([new Date().toISOString(), 'SYSTEM', 'INITIAL_SETUP', 'SETUP', 'Lingkungan database berhasil diinisialisasi.']);
  }

  // 7. Setup Sheet "AntrianNotif" (Pola /gas-notifikasi-wa-crm)
  let shNotif = ss.getSheetByName('AntrianNotif');
  if (!shNotif) {
    shNotif = ss.insertSheet('AntrianNotif');
    shNotif.appendRow(['AntrianID', 'Kanal', 'Tujuan', 'NamaPenerima', 'Subjek', 'Pesan', 'Event', 'RefID', 'Status', 'DibuatPada']);
    shNotif.getRange(1, 1, 1, 10).setBackground('#0D5236').setFontColor('#FFFFFF').setFontWeight('bold');
    shNotif.setFrozenRows(1);
  }

  // 8. Hapus Sheet default bawaan Spreadsheet jika bernama "Sheet1"
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  // 9. Konfigurasi Default Script Properties Kritis
  if (!props.getProperty('SESSION_SECRET')) {
    props.setProperty('SESSION_SECRET', Utilities.getUuid() + '-' + Utilities.getUuid());
  }
  if (!props.getProperty('PEJABAT_PIN')) {
    props.setProperty('PEJABAT_PIN', '123456'); // Default PIN Pengesahan
  }

  Logger.log('=====================================================');
  Logger.log('✅ SETUP SUKSES!');
  Logger.log('🔗 URL Spreadsheet Database : ' + ss.getUrl());
  Logger.log('📁 URL Root Folder Google Drive: ' + rootFolder.getUrl());
  Logger.log('🔐 SPREADSHEET_ID            : ' + ssId);
  Logger.log('=====================================================');
  Logger.log('Langkah Berikutnya:');
  Logger.log('1. Buka Deploy > New deployment > Web app');
  Logger.log('2. Execute as: Me, Who has access: Anyone');
  Logger.log('3. Salin URL /exec dan tempelkan ke js/config.js di frontend');
}
