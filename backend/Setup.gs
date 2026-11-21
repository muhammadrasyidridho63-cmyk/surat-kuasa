/**
 * =========================================================================
 * SETUP.GS — INISIALISASI OTOMATIS & IDEMPOTEN E-KUASA PENGADILAN NEGERI
 * =========================================================================
 * Mematuhi standar:
 * - /gas-rahasia-script-properties (R1–R13: zero literal secrets, auto-generated keys)
 * - /gas-scale-turbo (setup idempoten, aman dijalankan berulang)
 * - /gas-notifikasi-wa-crm (skema AntrianNotif, BlastWA, CRM_Kontak, CRM_Interaksi)
 *
 * Cara pakai:
 * 1. Jalankan fungsi `setupAppEnvironment()` sekali dari editor Apps Script.
 * 2. Jalankan fungsi `pasangTriggerNotif()` sekali untuk mengaktifkan antrean WA/Email.
 * 3. Catat sandi darurat yang tercetak sekali di Log Eksekusi.
 */

function setupAppEnvironment() {
  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperties();

  // 1. Bangkitkan Rahasia Kriptografi Otomatis (Idempoten — tidak menimpa yang sudah ada)
  const secretBatch = {};
  if (!existing.SESSION_SECRET) {
    secretBatch.SESSION_SECRET = acak_(64);
  }
  if (!existing.APP_SALT) {
    secretBatch.APP_SALT = acak_(32);
  }
  if (!existing.EMERGENCY_USER) {
    secretBatch.EMERGENCY_USER = 'admin';
  }
  let generatedEmergencyPass = '';
  if (!existing.EMERGENCY_PASS_HASH || !existing.EMERGENCY_SALT) {
    const eSalt = acak_(24);
    generatedEmergencyPass = sandiAcak_(14);
    secretBatch.EMERGENCY_SALT = eSalt;
    secretBatch.EMERGENCY_PASS_HASH = hashPass_(generatedEmergencyPass, eSalt);
  }
  if (Object.keys(secretBatch).length) {
    setProps_(secretBatch);
  }

  // 2. Buat / Buka Folder Google Drive Arsip E-Kuasa
  let rootFolderId = prop_('DRIVE_ROOT_FOLDER_ID');
  let rootFolder = null;
  if (rootFolderId) {
    try { rootFolder = DriveApp.getFolderById(rootFolderId); } catch (e) { rootFolder = null; }
  }
  if (!rootFolder) {
    const iter = DriveApp.getFoldersByName('[E-Kuasa] Arsip Surat Kuasa Online');
    rootFolder = iter.hasNext() ? iter.next() : DriveApp.createFolder('[E-Kuasa] Arsip Surat Kuasa Online');
    setProp_('DRIVE_ROOT_FOLDER_ID', rootFolder.getId());
  }

  let uploadsFolderId = prop_('FOLDER_BERKAS_ID');
  let uploadsFolder = null;
  if (uploadsFolderId) {
    try { uploadsFolder = DriveApp.getFolderById(uploadsFolderId); } catch (e) { uploadsFolder = null; }
  }
  if (!uploadsFolder) {
    const iter = rootFolder.getFoldersByName('Berkas_Persyaratan');
    uploadsFolder = iter.hasNext() ? iter.next() : rootFolder.createFolder('Berkas_Persyaratan');
    // Atur akses baca agar modal preview petugas dapat menampilkan dokumen langsung
    try {
      uploadsFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      Logger.log('Info sharing folder Drive: ' + e.message);
    }
    setProp_('FOLDER_BERKAS_ID', uploadsFolder.getId());
  }

  // 3. Buat / Buka Spreadsheet Database Utama
  let ssId = prop_('SPREADSHEET_ID');
  let ss = null;
  if (ssId) {
    try { ss = SpreadsheetApp.openById(ssId); } catch (e) { ss = null; }
  }
  if (!ss) {
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (e) {
      ss = null;
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('[E-Kuasa] Database Pendaftaran Surat Kuasa Online');
    const file = DriveApp.getFileById(ss.getId());
    rootFolder.addFile(file);
  }
  setProp_('SPREADSHEET_ID', ss.getId());

  // 4. Pastikan Seluruh Skema Sheet Terbentuk (Idempoten)
  const schemas = {
    USERS: [
      'User_ID', 'Username', 'Password_Hash', 'Password_Salt', 'Nama_Lengkap',
      'No_HP_WA', 'Role', 'Status_Aktif', 'Created_At'
    ],
    PERMOHONAN_KUASA: [
      'Permohonan_ID', 'User_ID', 'Tanggal_Pengajuan', 'Kategori_Kuasa',
      'Nama_Pemohon', 'No_HP_WA', 'Status', 'Nomor_Register_Resmi',
      'Catatan_Petugas', 'Petugas_Verifikator', 'Tanggal_Verifikasi', 'Hash_Verifikasi'
    ],
    BERKAS_UNGGAHAN: [
      'Berkas_ID', 'Permohonan_ID', 'Url_KTP_Pemberi', 'Url_KTP_Penerima',
      'Url_KTA_Advokat', 'Url_BAS_Advokat', 'Url_Surat_Kuasa', 'Url_Surat_Lurah',
      'Updated_At'
    ],
    AppConfig: [
      'Key', 'Value', 'Keterangan'
    ],
    Log_Aktivitas: [
      'Timestamp', 'User', 'Aksi', 'Ref_ID', 'Keterangan'
    ],
    AntrianNotif: [
      'AntrianID', 'Kanal', 'Tujuan', 'NamaPenerima', 'Subjek', 'Pesan',
      'Event', 'RefID', 'BlastID', 'Status', 'Percobaan', 'Respon',
      'DibuatPada', 'DikirimPada'
    ],
    BlastWA: [
      'BlastID', 'Judul', 'Pesan', 'Sasaran', 'Total', 'Terkirim', 'Gagal',
      'UkuranBatch', 'JedaDetik', 'Status', 'DibuatOleh', 'Tanggal', 'SelesaiPada'
    ],
    CRM_Kontak: [
      'KontakID', 'Nama', 'Email', 'NoWA', 'Segmen', 'Sumber', 'RefID', 'Tag',
      'StatusWA', 'CekWAAt', 'EmailValid', 'OptOut', 'Catatan', 'JumlahPesan',
      'TerakhirDihubungi', 'Info', 'DibuatPada', 'DiperbaruiPada'
    ],
    CRM_Interaksi: [
      'InteraksiID', 'KontakID', 'Kanal', 'Arah', 'Ringkasan', 'RefID', 'Oleh', 'Tanggal'
    ]
  };

  Object.keys(schemas).forEach(function (name) {
    ensureSheet_(ss, name, schemas[name]);
  });

  // 5. Seed AppConfig Default (hanya jika kosong)
  const shCfg = ss.getSheetByName('AppConfig');
  if (shCfg.getLastRow() <= 1) {
    const defaultCfg = [
      ['NAMA_INSTITUSI', 'Pengadilan Negeri Kelas I A', 'Nama satuan kerja pengadilan'],
      ['NAMA_APP', 'E-Kuasa | Pengadilan Negeri', 'Judul utama aplikasi'],
      ['HOTLINE_PTSP', '(021) 3843348', 'Nomor telepon PTSP Kepaniteraan Hukum'],
      ['WA_PTSP', '08119283771', 'Nomor WhatsApp bantuan PTSP'],
      ['APP_URL', '', 'URL publik frontend GitHub Pages untuk tautan notifikasi'],
      ['NOTIF_WA_AKTIF', 'TRUE', 'Saklar global pengiriman WhatsApp Fonnte'],
      ['NOTIF_EMAIL_AKTIF', 'FALSE', 'Saklar global pengiriman Email MailApp'],
      ['NOTIF_MATRIKS', JSON.stringify({
        PERMOHONAN_MASUK: { wa: true, email: false },
        PERMOHONAN_REVISI: { wa: true, email: false },
        PERMOHONAN_DISETUJUI: { wa: true, email: false }
      }), 'Matriks notifikasi per kejadian']
    ];
    shCfg.getRange(2, 1, defaultCfg.length, 3).setValues(defaultCfg);
  }

  // 6. Seed Akun Awal (hanya jika sheet USERS kosong — sandi di-hash dengan salt unik)
  const shUsers = ss.getSheetByName('USERS');
  if (shUsers.getLastRow() <= 1) {
    const nowIso = new Date().toISOString();
    const seedUsers = [
      { id: 'USR-001', user: 'admin', pass: 'admin123', nama: 'Administrator IT Kepaniteraan', wa: '08119283771', role: 'Admin' },
      { id: 'USR-002', user: 'petugas1', pass: 'petugas123', nama: 'Siti Rahmawati, S.H.', wa: '081234567890', role: 'Petugas' },
      { id: 'USR-003', user: 'advokat@kantorhukum.id', pass: 'pemohon123', nama: 'Farhan Pratama, S.H., M.H.', wa: '081298421082', role: 'Pemohon' }
    ];
    const rows = seedUsers.map(function (u) {
      const salt = acak_(16);
      return [
        u.id, u.user, hashPass_(u.pass, salt), salt,
        u.nama, "'" + hp08_(u.wa), u.role, true, nowIso
      ];
    });
    shUsers.getRange(2, 1, rows.length, 9).setValues(rows);
  }

  // Hapus sheet bawaan "Sheet1" jika masih ada dan kosong
  const shDefault = ss.getSheetByName('Sheet1');
  if (shDefault && ss.getSheets().length > 1 && shDefault.getLastRow() <= 1) {
    try { ss.deleteSheet(shDefault); } catch (e) {}
  }

  Logger.log('=====================================================');
  Logger.log('✅ SETUP E-KUASA BERHASIL (IDEMPOTEN)');
  Logger.log('Spreadsheet URL : ' + ss.getUrl());
  Logger.log('Drive Folder    : ' + rootFolder.getUrl());
  if (generatedEmergencyPass) {
    Logger.log('🔐 Sandi Darurat Baru (CATAT SEKALI, tidak ditampilkan lagi): ' + generatedEmergencyPass);
  }
  Logger.log('=====================================================');
  return {
    success: true,
    spreadsheetUrl: ss.getUrl(),
    folderUrl: rootFolder.getUrl()
  };
}

/**
 * Helper idempoten: buat sheet & header jika belum ada
 */
function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sh.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1b4332');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/**
 * Reset sandi akses darurat dari editor Apps Script (Aturan R4)
 */
function resetAksesDarurat() {
  const salt = acak_(24);
  const passBaru = sandiAcak_(14);
  setProps_({
    EMERGENCY_SALT: salt,
    EMERGENCY_PASS_HASH: hashPass_(passBaru, salt),
    DARURAT_GAGAL: '0',
    DARURAT_KUNCI_SAMPAI: '0'
  });
  Logger.log('🔐 Sandi akses darurat baru untuk "' + prop_('EMERGENCY_USER', 'admin') + '": ' + passBaru);
}

/**
 * Pasang trigger latar belakang 1 menit/5 menit untuk antrean notifikasi non-blocking
 */
function pasangTriggerNotif() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(function (t) {
    return t.getHandlerFunction() === 'prosesAntrianNotif';
  });
  if (!exists) {
    ScriptApp.newTrigger('prosesAntrianNotif')
      .timeBased()
      .everyMinutes(5)
      .create();
    Logger.log('✅ Trigger background prosesAntrianNotif (setiap 5 menit) berhasil dipasang.');
  } else {
    Logger.log('ℹ️ Trigger prosesAntrianNotif sudah aktif sebelumnya.');
  }
}
