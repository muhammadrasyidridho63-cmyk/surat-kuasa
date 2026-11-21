/**
 * =========================================================================
 * KODE.GS — BACKEND PURE REST API E-KUASA PENGADILAN NEGERI (v3.0-TURBO)
 * =========================================================================
 * Mematuhi seluruh standar:
 * - /gas-pro-api (Pure JSON REST API, bebas CORS via text/plain)
 * - /gas-rahasia-script-properties (R1–R13: Script Properties, HMAC, Salt, Masking)
 * - /gas-scale-turbo (CacheX chunking, scoped invalidation, batch Sheets, non-blocking)
 * - /gas-notifikasi-wa-crm (Fonnte WA, Email, Blast, CRM Kontak)
 * - /gas-migrasi-database (Dry-run & Delta-Sync)
 */

const APP_VERSION = '3.0.0-EKuasa-Turbo';
const SESI_JAM = 12;
const RAHASIA_DASHBOARD = ['FONNTE_TOKEN'];

// =========================================================================
// 1. AKSES SATU PINTU SCRIPT PROPERTIES (Aturan R2)
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
  if (_PROP_MEMO) {
    Object.keys(obj).forEach(function (k) { _PROP_MEMO[k] = String(obj[k]); });
  }
}

function delProp_(key) {
  PROPS.deleteProperty(key);
  if (_PROP_MEMO) delete _PROP_MEMO[key];
}

// =========================================================================
// 2. KRIPTOGRAFI, HASHING, MASKING & SESI HMAC (Aturan R3, R4, R8)
// =========================================================================

function acak_(n, huruf) {
  huruf = huruf || 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let s = '';
  while (s.length < n) {
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid())
      .forEach(function (b) { if (s.length < n) s += huruf[(b & 0xff) % huruf.length]; });
  }
  return s;
}

function sandiAcak_(n) {
  const s = acak_(n || 14);
  return /\d/.test(s) && /[A-Za-z]/.test(s) ? s : sandiAcak_(n);
}

function hashPass_(pass, salt) {
  let h = String(pass);
  for (let i = 0; i < 300; i++) {
    h = Utilities.base64Encode(Utilities.computeHmacSha256Signature(h + salt, salt));
  }
  return h;
}

function samaAman_(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function samarkan_(v) {
  v = String(v || '');
  return !v ? '' : v.length <= 8 ? '••••••' : v.slice(0, 4) + '••••••' + v.slice(-3);
}

function secret_() {
  let s = prop_('SESSION_SECRET');
  if (!s) { s = acak_(64); setProp_('SESSION_SECRET', s); }
  return s;
}

function b64url_(bytesOrStr) {
  return Utilities.base64EncodeWebSafe(bytesOrStr).replace(/=+$/, '');
}

function buatTokenSesi_(userObj) {
  const payload = {
    uid: userObj.userId,
    u: userObj.username,
    n: userObj.nama,
    r: userObj.role,
    wa: userObj.wa || '',
    exp: Date.now() + SESI_JAM * 3600 * 1000
  };
  const p64 = b64url_(JSON.stringify(payload));
  const sig = b64url_(Utilities.computeHmacSha256Signature(p64, secret_()));
  return p64 + '.' + sig;
}

function verifikasiTokenSesi_(token) {
  try {
    if (!token || token.indexOf('.') === -1) return null;
    const parts = String(token).split('.');
    if (parts.length !== 2) return null;
    const expectedSig = b64url_(Utilities.computeHmacSha256Signature(parts[0], secret_()));
    if (!samaAman_(parts[1], expectedSig)) return null;
    const raw = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
    const payload = JSON.parse(raw);
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function buatHashDokumen_(permohonanId, nomorRegister) {
  const bytes = Utilities.computeHmacSha256Signature(permohonanId + '|' + nomorRegister, secret_());
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

// =========================================================================
// 3. CACHEX CHUNKING ENGINE & SCOPED INVALIDATION (/gas-scale-turbo)
// =========================================================================

const CacheX = {
  SZ: 50000,
  c: function () { return CacheService.getScriptCache(); },
  get: function (key) {
    try {
      const c = this.c();
      const head = c.get(key);
      if (head == null) return null;
      if (head.indexOf('__chunks:') !== 0) return JSON.parse(head);
      const n = +head.slice(9);
      const keys = [];
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
  put: function (key, val, ttl) {
    try {
      const s = JSON.stringify(val);
      const c = this.c();
      if (s.length <= this.SZ) { c.put(key, s, ttl); return true; }
      const n = Math.ceil(s.length / this.SZ);
      if (n > 20) return false;
      const m = {};
      for (let i = 0; i < n; i++) m[key + '#' + i] = s.substr(i * this.SZ, this.SZ);
      c.putAll(m, ttl);
      c.put(key, '__chunks:' + n, ttl);
      return true;
    } catch (e) { return false; }
  }
};

function verScope_(scope) {
  return CacheService.getScriptCache().get('ver_' + scope) || '1';
}

function bump_(scope) {
  CacheService.getScriptCache().put('ver_' + scope, String(Date.now()), 21600);
}

// =========================================================================
// 4. SPREADSHEET & CONFIG HELPERS
// =========================================================================

let _SS_CACHE = null;
function getSpreadsheet_() {
  if (_SS_CACHE) return _SS_CACHE;
  const id = prop_('SPREADSHEET_ID');
  if (id) {
    _SS_CACHE = SpreadsheetApp.openById(id);
    return _SS_CACHE;
  }
  _SS_CACHE = SpreadsheetApp.getActiveSpreadsheet();
  if (!_SS_CACHE) throw new Error('SPREADSHEET_ID belum diatur. Jalankan setupAppEnvironment() terlebih dahulu.');
  return _SS_CACHE;
}

function getSheet_(name) {
  const sh = getSpreadsheet_().getSheetByName(name);
  if (!sh) throw new Error('Sheet "' + name + '" tidak ditemukan. Jalankan setupAppEnvironment().');
  return sh;
}

function readSheetObjects_(sh) {
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0].map(function (h) { return String(h || '').trim(); });
  return values.slice(1)
    .filter(function (r) { return r.join('').trim() !== ''; })
    .map(function (r, idx) {
      const o = { _row: idx + 2 };
      headers.forEach(function (h, i) { if (h) o[h] = r[i]; });
      return o;
    });
}

let _CFG_MEMO = null;
function setting_(key, def) {
  if (!_CFG_MEMO) {
    const cached = CacheX.get('app_cfg_' + verScope_('cfg'));
    if (cached) {
      _CFG_MEMO = cached;
    } else {
      _CFG_MEMO = {};
      try {
        readSheetObjects_(getSheet_('AppConfig')).forEach(function (r) {
          if (r.Key) _CFG_MEMO[String(r.Key)] = String(r.Value !== undefined ? r.Value : '');
        });
        CacheX.put('app_cfg_' + verScope_('cfg'), _CFG_MEMO, 900);
      } catch (e) {}
    }
  }
  return _CFG_MEMO[key] !== undefined && _CFG_MEMO[key] !== '' ? _CFG_MEMO[key] : (def || '');
}

function setSetting_(key, val) {
  const sh = getSheet_('AppConfig');
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(key)) {
      sh.getRange(i + 1, 2).setValue(String(val));
      _CFG_MEMO = null;
      bump_('cfg');
      return;
    }
  }
  sh.appendRow([String(key), String(val), 'Diperbarui dari Dashboard Admin']);
  _CFG_MEMO = null;
  bump_('cfg');
}

function catatLog_(user, aksi, refId, keterangan) {
  try {
    const sh = getSheet_('Log_Aktivitas');
    sh.appendRow([new Date().toISOString(), String(user || 'Sistem'), String(aksi), String(refId || ''), String(keterangan || '')]);
  } catch (e) {}
}

function fail_(msg) {
  return { success: false, message: String(msg || 'Terjadi kesalahan.') };
}

function buildJson_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// 5. ENTRY POINTS — doGet & doPost (PURE REST API JSON)
// =========================================================================

function doGet(e) {
  const t0 = Date.now();
  let res;
  try {
    const p = (e && e.parameter) || {};
    const action = String(p.action || 'ping');
    if (action === 'ping') {
      res = { success: true, app: 'E-Kuasa API', version: APP_VERSION };
    } else if (action === 'trackPermohonan') {
      res = trackPermohonan_(p.query || '');
    } else if (action === 'listPermohonan') {
      res = listPermohonan_(p.token || '');
    } else {
      res = fail_('Action GET tidak dikenal: ' + action);
    }
  } catch (err) {
    res = fail_(err && err.message ? err.message : String(err));
  }
  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildJson_(res);
}

function doPost(e) {
  const t0 = Date.now();
  let body = {};
  let res;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    res = dispatchPost_(body);
  } catch (err) {
    res = fail_(err && err.message ? err.message : String(err));
  }
  res.ms = Date.now() - t0;
  res.v = APP_VERSION;
  return buildJson_(res);
}

function dispatchPost_(body) {
  const action = String(body.action || '');
  const sesi = verifikasiTokenSesi_(body.token || '');

  // Endpoint Publik (tanpa sesi)
  if (action === 'login') return loginUser_(body);
  if (action === 'register') return registerPemohon_(body);
  if (action === 'trackPermohonan') return trackPermohonan_(body.query || '');

  // Endpoint Terproteksi (wajib sesi HMAC valid)
  if (!sesi) return fail_('Sesi login tidak valid atau telah kedaluwarsa. Silakan login kembali.');

  if (action === 'listPermohonan') return listPermohonanBySession_(sesi);
  if (action === 'daftarPermohonan') return daftarPermohonan_(body, sesi);
  if (action === 'revisiPermohonan') return revisiPermohonan_(body, sesi);

  // Endpoint Khusus Petugas & Admin
  if (action === 'verifikasiPermohonan') {
    if (sesi.r !== 'Petugas' && sesi.r !== 'Admin') return fail_('Akses ditolak. Hanya Petugas/Admin yang dapat memverifikasi.');
    return verifikasiPermohonan_(body, sesi);
  }

  // Endpoint Khusus Admin
  if (sesi.r !== 'Admin') return fail_('Akses ditolak. Hanya Administrator yang diizinkan.');
  if (action === 'getAdminData') return getAdminData_();
  if (action === 'saveUser') return saveUser_(body, sesi);
  if (action === 'toggleUserStatus') return toggleUserStatus_(body, sesi);
  if (action === 'resetUserPassword') return resetUserPassword_(body, sesi);
  if (action === 'saveSecrets') return saveSecrets_(body, sesi);
  if (action === 'saveNotifConfig') return saveNotifConfig_(body, sesi);
  if (action === 'sinkronCrm') return { success: true, data: sinkronCrmKontak_() };
  if (action === 'buatBlastWa') return buatBlastWa_(body, sesi.n);
  if (action === 'toggleOptOutCrm') return toggleOptOutCrm_(body);
  if (action === 'jalankanMigrasi') return jalankanMigrasiDatabase_(body.sourceUrl, !!body.dryRun);

  return fail_('Action POST tidak dikenal: ' + action);
}

// =========================================================================
// 6. AUTENTIKASI (LOGIN & REGISTRASI)
// =========================================================================

function loginUser_(body) {
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!username || !password) return fail_('Username/Email dan Password wajib diisi.');

  // Cek akses darurat (Script Properties — Aturan R9 lockout 15 menit)
  const emergencyUser = prop_('EMERGENCY_USER', 'admin').toLowerCase();
  const lockUntil = Number(prop_('DARURAT_KUNCI_SAMPAI', '0')) || 0;
  if (username === emergencyUser && Date.now() < lockUntil) {
    return fail_('Akses darurat sementara dikunci 15 menit karena terlalu banyak percobaan gagal.');
  }

  const users = readSheetObjects_(getSheet_('USERS'));
  const found = users.find(function (u) {
    return String(u.Username || '').trim().toLowerCase() === username;
  });

  if (found) {
    if (String(found.Status_Aktif).toUpperCase() === 'FALSE' || found.Status_Aktif === false) {
      return fail_('Akun Anda sedang dinonaktifkan oleh Admin.');
    }
    const computed = hashPass_(password, String(found.Password_Salt || ''));
    if (samaAman_(computed, String(found.Password_Hash || ''))) {
      const userObj = {
        userId: String(found.User_ID),
        username: String(found.Username),
        nama: String(found.Nama_Lengkap),
        wa: hp08_(found.No_HP_WA),
        role: String(found.Role || 'Pemohon')
      };
      catatLog_(userObj.username, 'LOGIN', userObj.userId, 'Login berhasil (' + userObj.role + ')');
      return { success: true, token: buatTokenSesi_(userObj), user: userObj };
    }
  }

  // Fallback sandi darurat Script Properties
  if (username === emergencyUser && prop_('EMERGENCY_PASS_HASH') && prop_('EMERGENCY_SALT')) {
    const eHash = hashPass_(password, prop_('EMERGENCY_SALT'));
    if (samaAman_(eHash, prop_('EMERGENCY_PASS_HASH'))) {
      setProp_('DARURAT_GAGAL', '0');
      const eUser = { userId: 'USR-EMERGENCY', username: emergencyUser, nama: 'Administrator Darurat', wa: '', role: 'Admin' };
      catatLog_(emergencyUser, 'LOGIN_DARURAT', 'EMERGENCY', 'Login via akses darurat Script Properties');
      return { success: true, token: buatTokenSesi_(eUser), user: eUser };
    } else {
      const fails = (Number(prop_('DARURAT_GAGAL', '0')) || 0) + 1;
      if (fails >= 5) {
        setProps_({ DARURAT_GAGAL: '0', DARURAT_KUNCI_SAMPAI: String(Date.now() + 15 * 60 * 1000) });
      } else {
        setProp_('DARURAT_GAGAL', String(fails));
      }
    }
  }

  return fail_('Username/Email atau Password tidak sesuai.');
}

function registerPemohon_(body) {
  const nama = String(body.nama || '').trim();
  const username = String(body.username || '').trim().toLowerCase();
  const wa = hp08_(body.wa || '');
  const password = String(body.password || '');

  if (!nama || !username || !wa || password.length < 6) {
    return fail_('Harap lengkapi Nama, Username/Email, Nomor WhatsApp, dan Password (minimal 6 karakter).');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getSheet_('USERS');
    const users = readSheetObjects_(sh);
    const exists = users.some(function (u) {
      return String(u.Username || '').trim().toLowerCase() === username;
    });
    if (exists) return fail_('Username/Email sudah terdaftar. Silakan gunakan tab Login.');

    const userId = 'USR-' + String(users.length + 1).padStart(3, '0');
    const salt = acak_(16);
    const nowIso = new Date().toISOString();
    sh.appendRow([userId, username, hashPass_(password, salt), salt, nama, "'" + wa, 'Pemohon', true, nowIso]);
    bump_('users');

    const userObj = { userId: userId, username: username, nama: nama, wa: wa, role: 'Pemohon' };
    catatLog_(username, 'REGISTRASI', userId, 'Registrasi akun Pemohon baru');
    return { success: true, token: buatTokenSesi_(userObj), user: userObj, message: 'Registrasi akun berhasil!' };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 7. PERMOHONAN KUASA, UPLOAD DRIVE, DATA LOCKING & VERIFIKASI
// =========================================================================

const WAJIB_BERKAS_KATEGORI = {
  'Advokat': ['ktp_pemberi', 'ktp_penerima', 'kta_advokat', 'bas_advokat', 'surat_kuasa'],
  'Instansi Pemerintah': ['ktp_pemberi', 'ktp_penerima', 'surat_kuasa'],
  'Insidentil': ['ktp_pemberi', 'ktp_penerima', 'surat_kuasa', 'surat_lurah']
};

function loadAllPermohonanJoined_() {
  const cacheKey = 'perm_all_' + verScope_('permohonan');
  const cached = CacheX.get(cacheKey);
  if (cached) return cached;

  const permRows = readSheetObjects_(getSheet_('PERMOHONAN_KUASA'));
  const berkasRows = readSheetObjects_(getSheet_('BERKAS_UNGGAHAN'));
  const berkasMap = {};
  berkasRows.forEach(function (b) { berkasMap[String(b.Permohonan_ID)] = b; });

  const list = permRows.map(function (p) {
    const b = berkasMap[String(p.Permohonan_ID)] || {};
    return {
      permohonanId: String(p.Permohonan_ID || ''),
      userId: String(p.User_ID || ''),
      tanggalPengajuan: String(p.Tanggal_Pengajuan || ''),
      kategoriKuasa: String(p.Kategori_Kuasa || 'Advokat'),
      namaPemohon: String(p.Nama_Pemohon || ''),
      noHpWa: hp08_(p.No_HP_WA || ''),
      status: String(p.Status || 'Menunggu Verifikasi'),
      nomorRegisterResmi: String(p.Nomor_Register_Resmi || ''),
      catatanPetugas: String(p.Catatan_Petugas || ''),
      petugasVerifikator: String(p.Petugas_Verifikator || ''),
      tanggalVerifikasi: String(p.Tanggal_Verifikasi || ''),
      hashVerifikasi: String(p.Hash_Verifikasi || ''),
      berkas: {
        ktp_pemberi: String(b.Url_KTP_Pemberi || ''),
        ktp_penerima: String(b.Url_KTP_Penerima || ''),
        kta_advokat: String(b.Url_KTA_Advokat || ''),
        bas_advokat: String(b.Url_BAS_Advokat || ''),
        surat_kuasa: String(b.Url_Surat_Kuasa || ''),
        surat_lurah: String(b.Url_Surat_Lurah || '')
      }
    };
  }).reverse();

  CacheX.put(cacheKey, list, 600);
  return list;
}

function trackPermohonan_(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return fail_('Masukkan ID Permohonan atau Nomor WhatsApp.');
  const qWa = hp08_(q);
  const all = loadAllPermohonanJoined_();
  const found = all.find(function (item) {
    return item.permohonanId.toLowerCase() === q || (qWa && item.noHpWa === qWa);
  });
  if (!found) return fail_('Permohonan dengan kode/nomor "' + query + '" tidak ditemukan.');
  // Kembalikan informasi publik yang aman (tanpa mengekspos tautan raw dokumen pribadi)
  return {
    success: true,
    data: {
      permohonanId: found.permohonanId,
      tanggalPengajuan: found.tanggalPengajuan,
      kategoriKuasa: found.kategoriKuasa,
      namaPemohon: found.namaPemohon,
      status: found.status,
      nomorRegisterResmi: found.nomorRegisterResmi,
      catatanPetugas: found.catatanPetugas,
      petugasVerifikator: found.petugasVerifikator,
      tanggalVerifikasi: found.tanggalVerifikasi,
      hashVerifikasi: found.hashVerifikasi
    }
  };
}

function listPermohonan_(token) {
  const sesi = verifikasiTokenSesi_(token);
  if (!sesi) return fail_('Sesi tidak valid.');
  return listPermohonanBySession_(sesi);
}

function listPermohonanBySession_(sesi) {
  const all = loadAllPermohonanJoined_();
  if (sesi.r === 'Petugas' || sesi.r === 'Admin') {
    return { success: true, data: all };
  }
  const mine = all.filter(function (item) {
    return item.userId === sesi.uid || (sesi.wa && item.noHpWa === hp08_(sesi.wa));
  });
  return { success: true, data: mine };
}

function simpanFileBase64KeDrive_(base64Data, permohonanId, jenisDokumen, namaPemohon) {
  if (!base64Data) return '';
  if (String(base64Data).indexOf('http') === 0) return String(base64Data);
  const match = String(base64Data).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return '';

  const mimeType = match[1];
  const bytes = Utilities.base64Decode(match[2]);
  if (bytes.length > 5.5 * 1024 * 1024) {
    throw new Error('Ukuran file ' + jenisDokumen + ' melebihi batas maksimal 5 MB.');
  }
  const ext = mimeType.indexOf('pdf') > -1 ? '.pdf' : (mimeType.indexOf('png') > -1 ? '.png' : '.jpg');
  const safeName = String(namaPemohon || 'Pemohon').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const fileName = permohonanId + '_' + jenisDokumen + '_' + safeName + ext;

  const folderId = prop_('FOLDER_BERKAS_ID');
  const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return 'https://drive.google.com/file/d/' + file.getId() + '/preview';
}

function daftarPermohonan_(body, sesi) {
  const kategori = String(body.kategoriKuasa || 'Advokat').trim();
  const namaPemohon = String(body.namaPemohon || '').trim();
  const noHpWa = hp08_(body.noHpWa || '');
  const berkasIn = body.berkas || {};

  if (!namaPemohon || !noHpWa) {
    return fail_('Nama Pemohon dan Nomor WhatsApp Aktif wajib diisi.');
  }

  const requiredKeys = WAJIB_BERKAS_KATEGORI[kategori] || WAJIB_BERKAS_KATEGORI['Advokat'];
  for (let i = 0; i < requiredKeys.length; i++) {
    if (!berkasIn[requiredKeys[i]]) {
      return fail_('Dokumen wajib (' + requiredKeys[i] + ') belum diunggah.');
    }
  }

  const now = new Date();
  const ym = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0');
  const permohonanId = 'REG-' + ym + '-' + String(Math.floor(Math.random() * 900 + 100));

  // Upload berkas ke Drive di luar LockService agar tidak menahan transaksi lain
  const urls = {
    ktp_pemberi: simpanFileBase64KeDrive_(berkasIn.ktp_pemberi, permohonanId, 'KTP_Pemberi', namaPemohon),
    ktp_penerima: simpanFileBase64KeDrive_(berkasIn.ktp_penerima, permohonanId, 'KTP_Penerima', namaPemohon),
    kta_advokat: simpanFileBase64KeDrive_(berkasIn.kta_advokat, permohonanId, 'KTA_Advokat', namaPemohon),
    bas_advokat: simpanFileBase64KeDrive_(berkasIn.bas_advokat, permohonanId, 'BAS_Advokat', namaPemohon),
    surat_kuasa: simpanFileBase64KeDrive_(berkasIn.surat_kuasa, permohonanId, 'Surat_Kuasa', namaPemohon),
    surat_lurah: simpanFileBase64KeDrive_(berkasIn.surat_lurah, permohonanId, 'Surat_Lurah', namaPemohon)
  };

  const nowIso = now.toISOString();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_('PERMOHONAN_KUASA').appendRow([
      permohonanId, sesi.uid, nowIso, kategori, namaPemohon, "'" + noHpWa,
      'Menunggu Verifikasi', '', '', '', '', ''
    ]);
    getSheet_('BERKAS_UNGGAHAN').appendRow([
      'DOC-' + Date.now(), permohonanId,
      urls.ktp_pemberi, urls.ktp_penerima, urls.kta_advokat,
      urls.bas_advokat, urls.surat_kuasa, urls.surat_lurah, nowIso
    ]);
    bump_('permohonan');
  } finally {
    lock.releaseLock();
  }

  // Non-blocking log & notifikasi WA di luar lock (/gas-scale-turbo)
  catatLog_(sesi.u, 'PERMOHONAN_BARU', permohonanId, 'Pengajuan ' + kategori + ' oleh ' + namaPemohon);
  kirimNotif_('PERMOHONAN_MASUK', { nama: namaPemohon, hp: noHpWa, email: sesi.u }, { kode: permohonanId, kategori: kategori }, permohonanId);

  return { success: true, permohonanId: permohonanId, message: 'Permohonan ' + permohonanId + ' berhasil dikirim!' };
}

function revisiPermohonan_(body, sesi) {
  const permohonanId = String(body.permohonanId || '').trim();
  const namaPemohon = String(body.namaPemohon || '').trim();
  const noHpWa = hp08_(body.noHpWa || '');
  const berkasIn = body.berkas || {};

  const shPerm = getSheet_('PERMOHONAN_KUASA');
  const perms = readSheetObjects_(shPerm);
  const target = perms.find(function (p) { return String(p.Permohonan_ID) === permohonanId; });
  if (!target) return fail_('Permohonan tidak ditemukan.');

  // DATA LOCKING: Hanya boleh diubah saat status === 'Perlu Revisi'
  if (String(target.Status) !== 'Perlu Revisi') {
    return fail_('Data terkunci! Permohonan hanya dapat diperbaiki ketika berstatus "Perlu Revisi".');
  }
  if (sesi.r === 'Pemohon' && String(target.User_ID) !== sesi.uid) {
    return fail_('Anda tidak memiliki izin mengubah permohonan ini.');
  }

  // Upload hanya berkas baru (base64) ke Drive
  const shBerkas = getSheet_('BERKAS_UNGGAHAN');
  const berkasList = readSheetObjects_(shBerkas);
  const bRow = berkasList.find(function (b) { return String(b.Permohonan_ID) === permohonanId; });

  const upd = {
    Url_KTP_Pemberi: berkasIn.ktp_pemberi ? simpanFileBase64KeDrive_(berkasIn.ktp_pemberi, permohonanId, 'KTP_Pemberi_Rev', namaPemohon || target.Nama_Pemohon) : (bRow ? bRow.Url_KTP_Pemberi : ''),
    Url_KTP_Penerima: berkasIn.ktp_penerima ? simpanFileBase64KeDrive_(berkasIn.ktp_penerima, permohonanId, 'KTP_Penerima_Rev', namaPemohon || target.Nama_Pemohon) : (bRow ? bRow.Url_KTP_Penerima : ''),
    Url_KTA_Advokat: berkasIn.kta_advokat ? simpanFileBase64KeDrive_(berkasIn.kta_advokat, permohonanId, 'KTA_Advokat_Rev', namaPemohon || target.Nama_Pemohon) : (bRow ? bRow.Url_KTA_Advokat : ''),
    Url_BAS_Advokat: berkasIn.bas_advokat ? simpanFileBase64KeDrive_(berkasIn.bas_advokat, permohonanId, 'BAS_Advokat_Rev', namaPemohon || target.Nama_Pemohon) : (bRow ? bRow.Url_BAS_Advokat : ''),
    Url_Surat_Kuasa: berkasIn.surat_kuasa ? simpanFileBase64KeDrive_(berkasIn.surat_kuasa, permohonanId, 'Surat_Kuasa_Rev', namaPemohon || target.Nama_Pemohon) : (bRow ? bRow.Url_Surat_Kuasa : ''),
    Url_Surat_Lurah: berkasIn.surat_lurah ? simpanFileBase64KeDrive_(berkasIn.surat_lurah, permohonanId, 'Surat_Lurah_Rev', namaPemohon || target.Nama_Pemohon) : (bRow ? bRow.Url_Surat_Lurah : '')
  };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (namaPemohon) shPerm.getRange(target._row, 5).setValue(namaPemohon);
    if (noHpWa) shPerm.getRange(target._row, 6).setValue("'" + noHpWa);
    shPerm.getRange(target._row, 7).setValue('Menunggu Verifikasi');
    if (bRow) {
      shBerkas.getRange(bRow._row, 3, 1, 7).setValues([[
        upd.Url_KTP_Pemberi, upd.Url_KTP_Penerima, upd.Url_KTA_Advokat,
        upd.Url_BAS_Advokat, upd.Url_Surat_Kuasa, upd.Url_Surat_Lurah, new Date().toISOString()
      ]]);
    }
    bump_('permohonan');
  } finally {
    lock.releaseLock();
  }

  catatLog_(sesi.u, 'REVISI_PEMOHON', permohonanId, 'Pemohon mengunggah perbaikan berkas');
  return { success: true, message: 'Perbaikan berkas berhasil dikirim ulang untuk diverifikasi.' };
}

function verifikasiPermohonan_(body, sesi) {
  const permohonanId = String(body.permohonanId || '').trim();
  const keputusan = String(body.keputusan || '').trim(); // 'Disetujui' | 'Perlu Revisi'
  const nomorRegister = String(body.nomorRegisterResmi || '').trim();
  const catatan = String(body.catatanPetugas || '').trim();

  if (keputusan === 'Disetujui' && !nomorRegister) {
    return fail_('Nomor Register Resmi wajib diisi untuk menyetujui permohonan.');
  }
  if (keputusan === 'Perlu Revisi' && !catatan) {
    return fail_('Catatan perbaikan wajib diisi saat memilih Minta Revisi.');
  }

  const sh = getSheet_('PERMOHONAN_KUASA');
  const perms = readSheetObjects_(sh);
  const target = perms.find(function (p) { return String(p.Permohonan_ID) === permohonanId; });
  if (!target) return fail_('Permohonan tidak ditemukan.');

  const nowIso = new Date().toISOString();
  const hashVerif = keputusan === 'Disetujui' ? buatHashDokumen_(permohonanId, nomorRegister) : '';

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sh.getRange(target._row, 7, 1, 6).setValues([[
      keputusan,
      keputusan === 'Disetujui' ? nomorRegister : target.Nomor_Register_Resmi,
      catatan || (keputusan === 'Disetujui' ? 'Berkas lengkap, sah, dan terdaftar resmi.' : ''),
      sesi.n,
      nowIso,
      hashVerif
    ]]);
    bump_('permohonan');
  } finally {
    lock.releaseLock();
  }

  catatLog_(sesi.u, 'VERIFIKASI_' + keputusan.toUpperCase().replace(/\s+/g, '_'), permohonanId, nomorRegister || catatan);

  const penerimaNotif = { nama: target.Nama_Pemohon, hp: target.No_HP_WA };
  if (keputusan === 'Disetujui') {
    kirimNotif_('PERMOHONAN_DISETUJUI', penerimaNotif, { kode: permohonanId, register: nomorRegister }, permohonanId);
  } else {
    kirimNotif_('PERMOHONAN_REVISI', penerimaNotif, { kode: permohonanId, catatan: catatan }, permohonanId);
  }

  return { success: true, hashVerifikasi: hashVerif, message: 'Status permohonan ' + permohonanId + ' diperbarui menjadi ' + keputusan + '.' };
}

// =========================================================================
// 8. ADMIN: MANAJEMEN USER, RAHASIA SCRIPT PROPERTIES, CRM & LOG
// =========================================================================

function getAdminData_() {
  const users = readSheetObjects_(getSheet_('USERS')).map(function (u) {
    return {
      userId: String(u.User_ID),
      username: String(u.Username),
      nama: String(u.Nama_Lengkap),
      wa: hp08_(u.No_HP_WA),
      role: String(u.Role),
      aktif: String(u.Status_Aktif).toUpperCase() !== 'FALSE' && u.Status_Aktif !== false,
      createdAt: String(u.Created_At || '')
    };
  });

  const logs = readSheetObjects_(getSheet_('Log_Aktivitas')).slice(-40).reverse();
  const crm = readSheetObjects_(getSheet_('CRM_Kontak')).slice(-100).reverse();
  const antrian = readSheetObjects_(getSheet_('AntrianNotif')).slice(-40).reverse();

  let driveInfo = { usedMb: 0, limitMb: 15360, percent: 0 };
  try {
    const used = DriveApp.getStorageUsed();
    const limit = DriveApp.getStorageLimit() || (15 * 1024 * 1024 * 1024);
    driveInfo = {
      usedMb: Math.round(used / (1024 * 1024)),
      limitMb: Math.round(limit / (1024 * 1024)),
      percent: Math.min(100, Math.round((used / limit) * 100))
    };
  } catch (e) {}

  return {
    success: true,
    users: users,
    logs: logs,
    crm: crm,
    antrian: antrian,
    drive: driveInfo,
    secrets: {
      FONNTE_TOKEN_ADA: !!prop_('FONNTE_TOKEN'),
      FONNTE_TOKEN_MASK: samarkan_(prop_('FONNTE_TOKEN'))
    },
    notifConfig: {
      waAktif: String(setting_('NOTIF_WA_AKTIF', 'TRUE')).toUpperCase() === 'TRUE',
      emailAktif: emailAktif_(),
      appUrl: setting_('APP_URL', ''),
      matriks: matriksNotif_()
    }
  };
}

function saveUser_(body, sesi) {
  const nama = String(body.nama || '').trim();
  const username = String(body.username || '').trim().toLowerCase();
  const wa = hp08_(body.wa || '');
  const role = String(body.role || 'Pemohon');
  const password = String(body.password || 'ekuasa123');
  if (!nama || !username) return fail_('Nama dan Username wajib diisi.');

  const sh = getSheet_('USERS');
  const users = readSheetObjects_(sh);
  if (users.some(function (u) { return String(u.Username).toLowerCase() === username; })) {
    return fail_('Username sudah digunakan.');
  }
  const userId = 'USR-' + String(users.length + 1).padStart(3, '0');
  const salt = acak_(16);
  sh.appendRow([userId, username, hashPass_(password, salt), salt, nama, "'" + wa, role, true, new Date().toISOString()]);
  bump_('users');
  catatLog_(sesi.u, 'TAMBAH_USER', userId, 'Tambah akun ' + username + ' (' + role + ')');
  return { success: true, message: 'Pengguna ' + nama + ' berhasil ditambahkan.' };
}

function toggleUserStatus_(body, sesi) {
  const sh = getSheet_('USERS');
  const users = readSheetObjects_(sh);
  const u = users.find(function (x) { return String(x.User_ID) === String(body.userId); });
  if (!u) return fail_('User tidak ditemukan.');
  const nextStatus = !(String(u.Status_Aktif).toUpperCase() !== 'FALSE' && u.Status_Aktif !== false);
  sh.getRange(u._row, 8).setValue(nextStatus);
  bump_('users');
  catatLog_(sesi.u, 'TOGGLE_USER', u.User_ID, 'Status diubah menjadi ' + (nextStatus ? 'Aktif' : 'Nonaktif'));
  return { success: true, aktif: nextStatus };
}

function resetUserPassword_(body, sesi) {
  const sh = getSheet_('USERS');
  const users = readSheetObjects_(sh);
  const u = users.find(function (x) { return String(x.User_ID) === String(body.userId); });
  if (!u) return fail_('User tidak ditemukan.');
  const newPass = String(body.newPassword || sandiAcak_(10));
  const salt = acak_(16);
  sh.getRange(u._row, 3, 1, 2).setValues([[hashPass_(newPass, salt), salt]]);
  catatLog_(sesi.u, 'RESET_PASSWORD', u.User_ID, 'Reset password akun ' + u.Username);
  return { success: true, newPassword: newPass, message: 'Password berhasil direset.' };
}

function saveSecrets_(body, sesi) {
  const data = body.secrets || {};
  Object.keys(data).forEach(function (k) {
    if (RAHASIA_DASHBOARD.indexOf(k) === -1) return;
    const v = String(data[k] || '').trim();
    if (v === '__HAPUS__') delProp_(k);
    else if (v) setProp_(k, v);
  });
  catatLog_(sesi.u, 'UPDATE_RAHASIA', 'SCRIPT_PROPS', 'Pembaruan kredensial via allowlist Script Properties');
  return {
    success: true,
    FONNTE_TOKEN_ADA: !!prop_('FONNTE_TOKEN'),
    FONNTE_TOKEN_MASK: samarkan_(prop_('FONNTE_TOKEN')),
    message: 'Kredensial rahasia tersimpan aman di Script Properties.'
  };
}

function saveNotifConfig_(body, sesi) {
  setSetting_('NOTIF_WA_AKTIF', body.waAktif ? 'TRUE' : 'FALSE');
  setSetting_('NOTIF_EMAIL_AKTIF', body.emailAktif ? 'TRUE' : 'FALSE');
  if (body.appUrl !== undefined) setSetting_('APP_URL', String(body.appUrl).trim());
  if (body.matriks) setSetting_('NOTIF_MATRIKS', JSON.stringify(body.matriks));
  catatLog_(sesi.u, 'UPDATE_NOTIF_CFG', 'AppConfig', 'Konfigurasi notifikasi WA/Email diperbarui');
  return { success: true, message: 'Pengaturan notifikasi berhasil disimpan.' };
}

function toggleOptOutCrm_(body) {
  const sh = getSheet_('CRM_Kontak');
  const rows = readSheetObjects_(sh);
  const k = rows.find(function (r) { return String(r.KontakID) === String(body.kontakId); });
  if (!k) return fail_('Kontak tidak ditemukan.');
  const nextVal = String(k.OptOut).toUpperCase() === 'YA' ? 'TIDAK' : 'YA';
  sh.getRange(k._row, 12).setValue(nextVal);
  return { success: true, optOut: nextVal };
}
