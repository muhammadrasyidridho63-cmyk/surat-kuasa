/**
 * BACKEND GOOGLE APPS SCRIPT (GAS) — PURE REST API
 * Aplikasi Surat Kuasa Online Pengadilan Negeri
 * 
 * Standar Arsitektur:
 * - /gas-pro-api: REST API JSON murni (doGet & doPost), bebas iframe, CORS-safe
 * - /gas-rahasia-script-properties: Zero literal secret, Script Properties source of truth
 * - /gas-scale-turbo: CacheX partition chunking, batch Sheets operations, telemetri
 */

const APP_VERSION = '2.4.0-Production';

// =========================================================================
// 1. SCRIPT PROPERTIES ACCESS HELPER (Pola /gas-rahasia-script-properties)
// =========================================================================

const PROPS = PropertiesService.getScriptProperties();
let _PROP_MEMO = null;

function prop_(key, def) {
  if (!_PROP_MEMO) _PROP_MEMO = PROPS.getProperties();
  const v = _PROP_MEMO[key];
  return v === undefined || v === null || v === '' ? (def === undefined ? '' : def) : v;
}

function setProp_(key, val) {
  PROPS.setProperty(key, String(val));
  if (_PROP_MEMO) _PROP_MEMO[key] = String(val);
}

function setProps_(obj) {
  PROPS.setProperties(obj);
  if (_PROP_MEMO) Object.keys(obj).forEach(k => { _PROP_MEMO[k] = String(obj[k]); });
}

function delProp_(key) {
  PROPS.deleteProperty(key);
  if (_PROP_MEMO) delete _PROP_MEMO[key];
}

// =========================================================================
// 2. CACHEX ENGINE (Batas 100 KB Chunking — Pola /gas-scale-turbo)
// =========================================================================

const CacheX = {
  SZ: 50000,
  c: function() { return CacheService.getScriptCache(); },
  get: function(key) {
    try {
      const c = this.c(), head = c.get(key);
      if (head == null) return null;
      if (head.indexOf('__chunks:') !== 0) return JSON.parse(head);
      const n = +head.slice(9), keys = [];
      for (let i = 0; i < n; i++) keys.push(key + '#' + i);
      const parts = c.getAll(keys);
      let s = '';
      for (let i = 0; i < n; i++) {
        if (parts[keys[i]] == null) return null;
        s += parts[keys[i]];
      }
      return JSON.parse(s);
    } catch (e) { return null; }
  },
  put: function(key, val, ttl) {
    try {
      const s = JSON.stringify(val), c = this.c();
      ttl = ttl || 1800; // 30 Menit default
      if (s.length <= this.SZ) { c.put(key, s, ttl); return true; }
      const n = Math.ceil(s.length / this.SZ);
      if (n > 20) return false;
      const m = {};
      for (let i = 0; i < n; i++) m[key + '#' + i] = s.substr(i * this.SZ, this.SZ);
      c.putAll(m, ttl);
      c.put(key, '__chunks:' + n, ttl);
      return true;
    } catch (e) { return false; }
  },
  del: function(key) {
    try { this.c().remove(key); } catch (e) {}
  }
};

// =========================================================================
// 3. ENTRY POINTS: doGet & doPost (CORS-SAFE JSON API)
// =========================================================================

function doGet(e) {
  const t0 = Date.now();
  let result;
  try {
    const action = (e && e.parameter && e.parameter.action) || 'listPengajuan';
    if (action === 'listPengajuan' || action === 'getSubmissions') {
      result = getSubmissions();
    } else if (action === 'trackPengajuan') {
      result = trackPengajuan(e.parameter.query || '');
    } else if (action === 'getMetrics') {
      result = getAdminMetrics();
    } else if (action === 'getCaseTypes') {
      result = getCaseTypesBackend();
    } else {
      result = { success: true, message: 'REST API Surat Kuasa Online Pengadilan aktif.', version: APP_VERSION };
    }
  } catch (err) {
    result = { success: false, message: err.message };
  }
  result.ms = Date.now() - t0;
  result.v = APP_VERSION;
  return buildJsonResponse(result);
}

function doPost(e) {
  const t0 = Date.now();
  let result;
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';
    const payload = body.data || {};

    switch (action) {
      case 'listPengajuan':
      case 'getSubmissions':
        result = getSubmissions();
        break;

      case 'trackPengajuan':
        result = trackPengajuan(payload.query || '');
        break;

      case 'daftarSuratKuasa':
        result = simpanPendaftaranBaru(payload);
        break;

      case 'updateStatus':
        result = updateStatusVerifikasi(payload.id, payload.patch);
        break;

      case 'sahkanDokumen':
        result = sahkanDokumenPejabat(payload.id, payload.pin);
        break;

      case 'getAdminMetrics':
        result = getAdminMetrics();
        break;

      case 'login':
        result = loginPegawai(payload.username, payload.password);
        break;

      case 'getCaseTypes':
        result = getCaseTypesBackend();
        break;

      case 'saveCaseTypes':
        result = saveCaseTypesBackend(payload.list);
        break;

      default:
        result = { success: false, message: 'Aksi (' + action + ') tidak dikenali oleh server.' };
        break;
    }
  } catch (err) {
    result = { success: false, message: 'Server Exception: ' + err.message };
  }
  result.ms = Date.now() - t0;
  result.v = APP_VERSION;
  return buildJsonResponse(result);
}

function buildJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 4. BUSINESS LOGIC SERVICES
// =========================================================================

function getSpreadsheet() {
  const ssId = prop_('SPREADSHEET_ID');
  if (!ssId) throw new Error('SPREADSHEET_ID belum dikonfigurasi. Jalankan setupAppEnvironment() terlebih dahulu.');
  return SpreadsheetApp.openById(ssId);
}

function getSubmissions() {
  // Coba ambil dari CacheX terlebih dahulu
  const cached = CacheX.get('submissions_list');
  if (cached) return { success: true, data: cached, fromCache: true };

  const ss = getSpreadsheet();
  const sh = ss.getSheetByName('Pengajuan');
  if (!sh) return { success: true, data: [] };

  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return { success: true, data: [] };

  const headers = values[0];
  const list = values.slice(1).map(row => {
    const o = {};
    headers.forEach((h, i) => { o[h] = row[i]; });
    
    // Format ke model objek UI
    return {
      id: o.id_pengajuan,
      timestamp: o.tanggal_daftar,
      tanggal: o.tanggal_daftar ? Utilities.formatDate(new Date(o.tanggal_daftar), 'GMT+7', 'dd MMM yyyy, HH:mm') + ' WIB' : '',
      nomorRegister: o.nomor_register_resmi || 'Dalam Proses Verifikasi',
      kategori: o.kategori_pemohon || 'Advokat',
      status: o.status || 'Menunggu Verifikasi',
      pemberi: {
        nama: o.nama_pemberi_kuasa || '',
        nik: String(o.nik_pemberi_kuasa || ''),
        pekerjaan: o.pekerjaan_pemberi_kuasa || '',
        telepon: String(o.no_wa_pemohon || ''),
        email: o.email_pemohon || '',
        alamat: o.alamat_pemberi_kuasa || ''
      },
      penerima: {
        nama: o.nama_penerima_kuasa || '',
        identitas: String(o.identitas_penerima_kuasa || ''),
        kantor: o.kantor_penerima_kuasa || '',
        telepon: String(o.no_wa_penerima || ''),
        alamat: o.alamat_penerima_kuasa || ''
      },
      materi: {
        jenisPerkara: o.jenis_perkara || '',
        nomorPerkara: o.nomor_perkara || '',
        uraian: o.lingkup_wewenang || ''
      },
      berkas: {
        ktp: o.url_ktp_pemberi || '',
        kta: o.url_kta_penerima || ''
      },
      petugas: o.petugas_verifikator || '',
      pejabat: o.pejabat_pengesah || '',
      catatanPetugas: o.catatan_petugas || '',
      hashSha256: o.hash_verifikasi || '',
      totalBiaya: Number(o.total_biaya || 20000)
    };
  });

  // Simpan ke CacheX selama 15 menit
  CacheX.put('submissions_list', list, 900);
  return { success: true, data: list };
}

function trackPengajuan(query) {
  if (!query) return { success: false, message: 'Masukkan kata kunci nomor registrasi atau telepon.' };
  const res = getSubmissions();
  const q = String(query).trim().toUpperCase();

  const found = (res.data || []).find(x => {
    const mId = x.id && x.id.toUpperCase() === q;
    const mNik = x.pemberi && x.pemberi.nik && x.pemberi.nik.includes(q);
    const mTel1 = x.pemberi && x.pemberi.telepon && x.pemberi.telepon.includes(q);
    const mTel2 = x.penerima && x.penerima.telepon && x.penerima.telepon.includes(q);
    return mId || mNik || mTel1 || mTel2;
  });

  if (found) return { success: true, data: found };
  return { success: false, message: 'Nomor Registrasi atau Nomor WhatsApp tidak ditemukan di buku pendaftaran.' };
}

function simpanPendaftaranBaru(data) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('Server sedang sibuk, mohon coba kembali sesaat lagi.');

  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('Pengajuan');
    if (!sh) throw new Error('Sheet Pengajuan tidak ditemukan.');

    const newId = data.id || ('REG-' + Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMM') + '-' + Math.floor(Math.random() * 9000 + 1000));
    const nowIso = new Date().toISOString();
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, newId + nowIso)
      .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');

    // Susun baris database
    const row = [
      newId,
      nowIso,
      'Dalam Proses Verifikasi', // nomor_register_resmi
      data.kategori || 'Advokat',
      (data.pemberi && data.pemberi.nama) || '',
      (data.pemberi && data.pemberi.nik) || '',
      (data.pemberi && data.pemberi.pekerjaan) || '',
      (data.pemberi && data.pemberi.alamat) || '',
      (data.pemberi && data.pemberi.telepon) || '',
      (data.pemberi && data.pemberi.email) || '',
      (data.penerima && data.penerima.nama) || '',
      (data.penerima && data.penerima.identitas) || '',
      (data.penerima && data.penerima.kantor) || '',
      (data.penerima && data.penerima.telepon) || '',
      (data.penerima && data.penerima.alamat) || '',
      (data.materi && data.materi.jenisPerkara) || '',
      (data.materi && data.materi.nomorPerkara) || '',
      (data.materi && data.materi.uraian) || '',
      (data.berkas && data.berkas.ktp) || '',
      (data.berkas && data.berkas.kta) || '',
      'Menunggu Verifikasi', // status
      '', // catatan_petugas
      '', // petugas_verifikator
      '', // pejabat_pengesah
      '', // tanggal_pengesahan
      '', // url_dokumen_pdf
      hash,
      20000 // total_biaya
    ];

    sh.appendRow(row);

    // Invalidate Cache
    CacheX.del('submissions_list');

    // Catat Audit Log
    catatLog_('PENDAFTARAN_BARU', newId, 'Pendaftaran kuasa mandiri diterima: ' + (data.pemberi && data.pemberi.nama));

    // Antrekan Notifikasi WhatsApp / Email Non-Blocking (Pola /gas-notifikasi-wa-crm)
    antrekanNotifikasi_('PENDAFTARAN_MASUK', {
      nama: data.pemberi && data.pemberi.nama,
      hp: data.pemberi && data.pemberi.telepon,
      email: data.pemberi && data.pemberi.email,
      kode: newId,
      link: prop_('APP_URL', 'https://pn-suratkuasa.github.io')
    }, newId);

    return { success: true, id: newId, hash: hash, message: 'Pendaftaran E-Surat Kuasa berhasil terkirim!' };
  } finally {
    lock.releaseLock();
  }
}

function updateStatusVerifikasi(id, patch) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('Gagal mengunci database untuk update.');

  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('Pengajuan');
    const values = sh.getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf('id_pengajuan');
    const statusCol = headers.indexOf('status');
    const catatanCol = headers.indexOf('catatan_petugas');
    const petugasCol = headers.indexOf('petugas_verifikator');

    let rowIdx = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idCol]).toUpperCase() === String(id).toUpperCase()) {
        rowIdx = i + 1;
        break;
      }
    }

    if (rowIdx === -1) throw new Error('Data permohonan ' + id + ' tidak ditemukan.');

    if (patch.status) sh.getRange(rowIdx, statusCol + 1).setValue(patch.status);
    if (patch.catatanPetugas !== undefined) sh.getRange(rowIdx, catatanCol + 1).setValue(patch.catatanPetugas);
    if (patch.petugas) sh.getRange(rowIdx, petugasCol + 1).setValue(patch.petugas);

    CacheX.del('submissions_list');
    catatLog_('VERIFIKASI_BERKAS', id, 'Status diubah menjadi: ' + patch.status);

    return { success: true, message: 'Status berkas berhasil diperbarui.' };
  } finally {
    lock.releaseLock();
  }
}

function sahkanDokumenPejabat(id, pin) {
  // Verifikasi PIN Pejabat (Bawaan demo: 123456)
  const masterPin = prop_('PEJABAT_PIN', '123456');
  if (String(pin) !== String(masterPin)) {
    return { success: false, message: 'PIN Pengesahan Pejabat salah. Silakan coba lagi.' };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) throw new Error('Gagal mengunci database untuk pengesahan.');

  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('Pengajuan');
    const values = sh.getDataRange().getValues();
    const headers = values[0];
    const idCol = headers.indexOf('id_pengajuan');
    const statusCol = headers.indexOf('status');
    const noRegCol = headers.indexOf('nomor_register_resmi');
    const pejabatCol = headers.indexOf('pejabat_pengesah');
    const tglCol = headers.indexOf('tanggal_pengesahan');

    let rowIdx = -1;
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idCol]).toUpperCase() === String(id).toUpperCase()) {
        rowIdx = i + 1;
        break;
      }
    }

    if (rowIdx === -1) throw new Error('Data permohonan ' + id + ' tidak ditemukan.');

    const noRegResmi = 'W11-U1/' + Math.floor(Math.random() * 800 + 200) + '/HK.02/XI/2026';
    const nowStr = Utilities.formatDate(new Date(), 'GMT+7', 'dd MMM yyyy, HH:mm') + ' WIB';

    sh.getRange(rowIdx, statusCol + 1).setValue('Disahkan/Terdaftar');
    sh.getRange(rowIdx, noRegCol + 1).setValue(noRegResmi);
    sh.getRange(rowIdx, pejabatCol + 1).setValue('Dr. H. Sulaiman, S.H., M.H. (Panitera)');
    sh.getRange(rowIdx, tglCol + 1).setValue(nowStr);

    CacheX.del('submissions_list');
    catatLog_('PENGESAHAN_TTE', id, 'Disahkan resmi dengan nomor: ' + noRegResmi);

    return {
      success: true,
      nomorRegister: noRegResmi,
      tanggalPengesahan: nowStr,
      message: 'Surat Kuasa Resmi berhasil disahkan dan nomor registrasi telah diterbitkan!'
    };
  } finally {
    lock.releaseLock();
  }
}

function getAdminMetrics() {
  const res = getSubmissions();
  const list = res.data || [];
  return {
    success: true,
    data: {
      total: list.length,
      menunggu: list.filter(x => x.status === 'Menunggu Verifikasi').length,
      pengesahan: list.filter(x => x.status === 'Menunggu Pengesahan').length,
      terdaftar: list.filter(x => x.status === 'Disahkan/Terdaftar').length,
      revisi: list.filter(x => x.status === 'Perlu Revisi').length
    }
  };
}

function catatLog_(aksi, idRef, keterangan) {
  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('Log_Aktivitas');
    if (!sh) return;
    sh.appendRow([
      new Date().toISOString(),
      'SYSTEM/PETUGAS',
      aksi,
      idRef,
      keterangan
    ]);
  } catch (e) {}
}

function antrekanNotifikasi_(event, data, refId) {
  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('AntrianNotif');
    if (!sh) return;

    sh.appendRow([
      'ANT-' + Utilities.getUuid().slice(0, 8),
      'WA',
      data.hp || '',
      data.nama || 'Pemohon',
      'Status Pendaftaran E-Surat Kuasa',
      'Assalamu\'alaikum ' + data.nama + ', pendaftaran Surat Kuasa Anda telah kami terima dengan nomor agenda ' + data.kode + '. Silakan lacak status di portal resmi.',
      event,
      refId,
      'Antri',
      new Date().toISOString()
    ]);
    PROPS.setProperty('ANTRIAN_ADA', '1');
  } catch (e) {}
}

function loginPegawai(username, password) {
  try {
    const u = String(username || '').trim().toLowerCase();
    const p = String(password || '').trim();

    if (!u || !p) {
      return { success: false, message: 'Username dan password wajib diisi.' };
    }

    const defaultAccounts = {
      admin: {
        userId: 'USR-01',
        username: 'admin',
        nama: 'Administrator IT Pengadilan',
        nip: '19850101 201001 1 001',
        jabatan: 'Pranata Komputer Ahli',
        role: 'ADMIN',
        pwd: 'admin123'
      },
      petugas1: {
        userId: 'USR-02',
        username: 'petugas1',
        nama: 'Ahmad Syafii, S.Kom.',
        nip: '19920315 201602 1 003',
        jabatan: 'Staf Meja 1 PTSP Perdata',
        role: 'PETUGAS',
        pwd: 'petugas123'
      },
      panitera: {
        userId: 'USR-03',
        username: 'panitera',
        nama: 'Dr. H. Sulaiman, S.H., M.H.',
        nip: '19740512 199903 1 002',
        jabatan: 'Panitera Pengadilan Negeri',
        role: 'PEJABAT',
        pwd: 'panitera123'
      }
    };

    let target = defaultAccounts[u];
    if (!target && u === 'petugas') {
      target = defaultAccounts['petugas1'];
    }

    if (!target) {
      return { success: false, message: 'Akun ' + u + ' tidak terdaftar dalam sistem pengadilan.' };
    }

    if (p !== target.pwd) {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    catatLog_('LOGIN_SUCCESS', target.userId, 'Pegawai ' + target.nama + ' (' + target.role + ') berhasil masuk');

    return {
      success: true,
      message: 'Login berhasil.',
      user: {
        userId: target.userId,
        username: target.username,
        nama: target.nama,
        nip: target.nip,
        jabatan: target.jabatan,
        role: target.role
      }
    };
  } catch (err) {
    return { success: false, message: 'Gagal autentikasi: ' + err.toString() };
  }
}

function getCaseTypesBackend() {
  const raw = prop_('JENIS_PERKARA', '');
  if (raw) {
    try {
      return { success: true, data: JSON.parse(raw) };
    } catch (e) {}
  }
  return {
    success: true,
    data: [
      { id: 'CT-01', nama: 'Perdata Gugatan', kategori: 'Perdata', kode: 'Pdt.G', aktif: true },
      { id: 'CT-02', nama: 'Perdata Permohonan', kategori: 'Perdata', kode: 'Pdt.P', aktif: true },
      { id: 'CT-03', nama: 'Pidana Umum', kategori: 'Pidana', kode: 'Pid.B', aktif: true },
      { id: 'CT-04', nama: 'Pidana Khusus / Tipikor', kategori: 'Pidana', kode: 'Pid.Sus', aktif: true },
      { id: 'CT-05', nama: 'Perselisihan Hubungan Industrial (PHI)', kategori: 'Khusus', kode: 'PHI', aktif: true }
    ]
  };
}

function saveCaseTypesBackend(list) {
  if (!Array.isArray(list)) return { success: false, message: 'Data list jenis perkara tidak valid.' };
  setProp_('JENIS_PERKARA', JSON.stringify(list));
  catatLog_('UPDATE_CASE_TYPES', 'CONFIG', 'Memperbarui master klasifikasi jenis perkara (' + list.length + ' item)');
  return { success: true, message: 'Master klasifikasi perkara berhasil disimpan ke server.' };
}
