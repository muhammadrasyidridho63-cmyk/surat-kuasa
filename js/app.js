/**
 * =========================================================================
 * APP.JS — MESIN SPA 0MS INSTAN E-KUASA PENGADILAN NEGERI (v3.0-TURBO)
 * =========================================================================
 * - Arsitektur /gas-pro-api (Pure REST POST text/plain;charset=utf-8 — Bebas CORS)
 * - Performa /gas-scale-turbo (0ms view switch, SWR localStorage cache,
 *   In-Flight Request Deduplication, Optimistic UI, Client Canvas Compression)
 * - Mode Demo Instan 0ms otomatis saat CONFIG.GAS_URL belum diisi.
 */

// =========================================================================
// 1. KONFIGURASI 3 KATEGORI & DOKUMEN RESMI (SESUAI PRD.md)
// =========================================================================

const CATEGORY_DOCS = {
  'Advokat': {
    badge: 'Wajib 5 Dokumen Persyaratan',
    docs: [
      { key: 'ktp_pemberi', code: 'a', title: 'Kartu Tanda Penduduk Pemberi Kuasa', desc: 'Maks 5 MB • PDF/JPG/PNG', icon: 'badge', tone: 'primary' },
      { key: 'ktp_penerima', code: 'b', title: 'Kartu Tanda Penduduk Penerima Kuasa', desc: 'Maks 5 MB • PDF/JPG/PNG', icon: 'contact_emergency', tone: 'primary' },
      { key: 'kta_advokat', code: 'c', title: 'Kartu Tanda Advokat Penerima Kuasa', desc: 'KTA Advokat Aktif • Maks 5 MB', icon: 'contact_mail', tone: 'gold' },
      { key: 'bas_advokat', code: 'd', title: 'Berita Acara Sumpah Advokat', desc: 'BAS Pengadilan Tinggi • Maks 5 MB', icon: 'history_edu', tone: 'gold' },
      { key: 'surat_kuasa', code: 'e', title: 'Surat Kuasa', desc: 'Asli Ditandatangani • PDF/JPG/PNG', icon: 'article', tone: 'primary' }
    ]
  },
  'Instansi Pemerintah': {
    badge: 'Wajib 3 Dokumen Persyaratan',
    docs: [
      { key: 'ktp_pemberi', code: 'a', title: 'Kartu Tanda Penduduk Pemberi Kuasa', desc: 'Maks 5 MB • PDF/JPG/PNG', icon: 'badge', tone: 'primary' },
      { key: 'ktp_penerima', code: 'b', title: 'Kartu Tanda Penduduk Penerima Kuasa', desc: 'Maks 5 MB • PDF/JPG/PNG', icon: 'contact_emergency', tone: 'primary' },
      { key: 'surat_kuasa', code: 'c', title: 'Surat Kuasa', desc: 'Surat Kuasa / Tugas Kedinasan • PDF/JPG', icon: 'article', tone: 'primary' }
    ]
  },
  'Insidentil': {
    badge: 'Wajib 4 Dokumen Persyaratan',
    docs: [
      { key: 'ktp_pemberi', code: 'a', title: 'Kartu Tanda Penduduk Pemberi Kuasa', desc: 'Maks 5 MB • PDF/JPG/PNG', icon: 'badge', tone: 'primary' },
      { key: 'ktp_penerima', code: 'b', title: 'Kartu Tanda Penduduk Penerima Kuasa', desc: 'Maks 5 MB • PDF/JPG/PNG', icon: 'contact_emergency', tone: 'primary' },
      { key: 'surat_kuasa', code: 'c', title: 'Surat Kuasa', desc: 'Asli Ditandatangani • PDF/JPG/PNG', icon: 'article', tone: 'primary' },
      { key: 'surat_lurah', code: 'd', title: 'Surat Keterangan Lurah / Desa terkait status hubungan', desc: 'Keterangan Hubungan Keluarga • PDF/JPG', icon: 'family_restroom', tone: 'gold' }
    ]
  }
};

const DOC_LABEL_MAP = {
  ktp_pemberi: 'Kartu Tanda Penduduk Pemberi Kuasa',
  ktp_penerima: 'Kartu Tanda Penduduk Penerima Kuasa',
  kta_advokat: 'Kartu Tanda Advokat Penerima Kuasa',
  bas_advokat: 'Berita Acara Sumpah Advokat',
  surat_kuasa: 'Surat Kuasa',
  surat_lurah: 'Surat Keterangan Lurah / Desa terkait status hubungan'
};

const DEMO_SAMPLE_IMG = {
  ktp_pemberi: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
  ktp_penerima: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  kta_advokat: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  bas_advokat: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
  surat_kuasa: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  surat_lurah: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80'
};

// =========================================================================
// 2. STATE ENGINE & SWR LOCALSTORAGE CACHE (0MS INSTANT UX)
// =========================================================================

const STORE_KEY = 'ekuasa_v3_store';
const SESSION_KEY = 'ekuasa_v3_session';

const SEED_DATA = {
  users: [
    { userId: 'USR-001', username: 'admin', password: 'admin123', nama: 'Administrator IT Kepaniteraan', wa: '08119283771', role: 'Admin', aktif: true, createdAt: '2026-11-01T08:00:00Z' },
    { userId: 'USR-002', username: 'petugas1', password: 'petugas123', nama: 'Siti Rahmawati, S.H.', wa: '081234567890', role: 'Petugas', aktif: true, createdAt: '2026-11-02T08:00:00Z' },
    { userId: 'USR-003', username: 'advokat@kantorhukum.id', password: 'pemohon123', nama: 'Farhan Pratama, S.H., M.H.', wa: '081298421082', role: 'Pemohon', aktif: true, createdAt: '2026-11-05T09:30:00Z' }
  ],
  permohonan: [
    {
      permohonanId: 'REG-202611-001',
      userId: 'USR-003',
      tanggalPengajuan: '2026-11-12T09:30:00+07:00',
      kategoriKuasa: 'Advokat',
      namaPemohon: 'H. Ahmad Subardjo',
      noHpWa: '081298421082',
      status: 'Disetujui',
      nomorRegisterResmi: 'W10.U1/142/SK/HK.01/XI/2026',
      catatanPetugas: 'Berkas lengkap, sah, dan telah tercatat dalam Buku Register Elektronik.',
      petugasVerifikator: 'Siti Rahmawati, S.H.',
      tanggalVerifikasi: '2026-11-13T10:00:00+07:00',
      hashVerifikasi: '7f2a8c91e56b8209dc47120fe817c0326e0802c61148e100f917208d9c14b8',
      berkas: { ...DEMO_SAMPLE_IMG }
    },
    {
      permohonanId: 'REG-202611-002',
      userId: 'USR-003',
      tanggalPengajuan: '2026-11-14T11:15:00+07:00',
      kategoriKuasa: 'Insidentil',
      namaPemohon: 'Siti Aminah',
      noHpWa: '085712349090',
      status: 'Perlu Revisi',
      nomorRegisterResmi: '',
      catatanPetugas: 'Surat Keterangan Lurah / Desa buram pada bagian stempel. Mohon unggah ulang dengan scan yang jelas.',
      petugasVerifikator: 'Siti Rahmawati, S.H.',
      tanggalVerifikasi: '2026-11-14T14:20:00+07:00',
      hashVerifikasi: '',
      berkas: {
        ktp_pemberi: DEMO_SAMPLE_IMG.ktp_pemberi,
        ktp_penerima: DEMO_SAMPLE_IMG.ktp_penerima,
        surat_kuasa: DEMO_SAMPLE_IMG.surat_kuasa,
        surat_lurah: DEMO_SAMPLE_IMG.surat_lurah
      }
    },
    {
      permohonanId: 'REG-202611-003',
      userId: 'USR-003',
      tanggalPengajuan: '2026-11-15T13:40:00+07:00',
      kategoriKuasa: 'Instansi Pemerintah',
      namaPemohon: 'Biro Hukum Kementerian ATR/BPN',
      noHpWa: '081288776655',
      status: 'Menunggu Verifikasi',
      nomorRegisterResmi: '',
      catatanPetugas: '',
      petugasVerifikator: '',
      tanggalVerifikasi: '',
      hashVerifikasi: '',
      berkas: {
        ktp_pemberi: DEMO_SAMPLE_IMG.ktp_pemberi,
        ktp_penerima: DEMO_SAMPLE_IMG.ktp_penerima,
        surat_kuasa: DEMO_SAMPLE_IMG.surat_kuasa
      }
    }
  ],
  logs: [
    { Timestamp: '2026-11-15T13:40:00+07:00', User: 'advokat@kantorhukum.id', Aksi: 'PERMOHONAN_BARU', Ref_ID: 'REG-202611-003', Keterangan: 'Pengajuan Kuasa Instansi Pemerintah' },
    { Timestamp: '2026-11-14T14:20:00+07:00', User: 'petugas1', Aksi: 'VERIFIKASI_PERLU_REVISI', Ref_ID: 'REG-202611-002', Keterangan: 'Minta perbaikan Surat Keterangan Lurah' },
    { Timestamp: '2026-11-13T10:00:00+07:00', User: 'petugas1', Aksi: 'VERIFIKASI_DISETUJUI', Ref_ID: 'REG-202611-001', Keterangan: 'Terbit Register W10.U1/142/SK/HK.01/XI/2026' }
  ],
  crm: [
    { KontakID: 'KTK-001', Nama: 'Farhan Pratama, S.H., M.H.', NoWA: '081298421082', Segmen: 'Advokat', OptOut: 'TIDAK' },
    { KontakID: 'KTK-002', Nama: 'Siti Aminah', NoWA: '085712349090', Segmen: 'Insidentil', OptOut: 'TIDAK' },
    { KontakID: 'KTK-003', Nama: 'Biro Hukum Kementerian ATR/BPN', NoWA: '081288776655', Segmen: 'Instansi Pemerintah', OptOut: 'TIDAK' }
  ],
  drive: { usedMb: 1840, limitMb: 15360, percent: 12 },
  secrets: { FONNTE_TOKEN_ADA: false, FONNTE_TOKEN_MASK: '' },
  notifConfig: { waAktif: true, emailAktif: false }
};

let APP_STATE = loadLocalState();
let CURRENT_SESSION = loadSession();
let CURRENT_ROUTE = 'portal-publik-dan-lacak';
let SELECTED_KATEGORI = 'Advokat';
let FORM_UPLOADS = {};
let REVISION_TARGET_ID = null;
let DRAWER_ITEM = null;
let DRAWER_ZOOM = 100;
let DRAWER_ROTATE = 0;

// In-Flight Deduplication Map (/gas-scale-turbo)
const _inFlight = new Map();

function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORE_KEY, JSON.stringify(SEED_DATA));
  return JSON.parse(JSON.stringify(SEED_DATA));
}

function saveLocalState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(APP_STATE)); } catch (e) {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function saveSession(sesi) {
  CURRENT_SESSION = sesi;
  try {
    if (sesi) localStorage.setItem(SESSION_KEY, JSON.stringify(sesi));
    else localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

// =========================================================================
// 3. CLIENT REST API (PURE POST text/plain — ZERO CORS PREFLIGHT)
// =========================================================================

async function callApi(action, payload = {}) {
  if (IS_DEMO_MODE) {
    return { _demo: true, success: true };
  }
  const dedupeKey = action + ':' + JSON.stringify(payload).slice(0, 120);
  if (_inFlight.has(dedupeKey)) return _inFlight.get(dedupeKey);

  const req = fetch(CONFIG.GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action,
      token: CURRENT_SESSION ? CURRENT_SESSION.token : '',
      ...payload
    })
  })
    .then(r => r.json())
    .catch(err => ({ success: false, message: 'Koneksi ke server GAS gagal: ' + err.message }))
    .finally(() => _inFlight.delete(dedupeKey));

  _inFlight.set(dedupeKey, req);
  return req;
}

async function syncPermohonanFromServer() {
  if (IS_DEMO_MODE || !CURRENT_SESSION) return;
  const res = await callApi('listPermohonan');
  if (res && res.success && Array.isArray(res.data)) {
    APP_STATE.permohonan = res.data;
    saveLocalState();
    refreshActiveViewData();
  }
}

async function syncAdminFromServer() {
  if (IS_DEMO_MODE || !CURRENT_SESSION || CURRENT_SESSION.user.role !== 'Admin') return;
  const res = await callApi('getAdminData');
  if (res && res.success) {
    APP_STATE.users = res.users || [];
    APP_STATE.logs = res.logs || [];
    APP_STATE.crm = res.crm || [];
    APP_STATE.drive = res.drive || APP_STATE.drive;
    APP_STATE.secrets = res.secrets || APP_STATE.secrets;
    APP_STATE.notifConfig = res.notifConfig || APP_STATE.notifConfig;
    saveLocalState();
    renderAdminPanel();
  }
}

// =========================================================================
// 4. 0MS INSTANT SPA ROUTER & ROLE ACCESS GUARD
// =========================================================================

const VALID_ROUTES = [
  'portal-publik-dan-lacak',
  'permohonan-baru',
  'riwayat-berkas',
  'antrean-verifikasi-petugas',
  'buku-register-kuasa',
  'admin-dan-log'
];

const ROUTE_ROLES = {
  'portal-publik-dan-lacak': null,
  'permohonan-baru': ['Pemohon', 'Petugas', 'Admin'],
  'riwayat-berkas': ['Pemohon', 'Petugas', 'Admin'],
  'antrean-verifikasi-petugas': ['Petugas', 'Admin'],
  'buku-register-kuasa': ['Petugas', 'Admin'],
  'admin-dan-log': ['Admin']
};

function navigateTo(route, updateHash = true) {
  if (!VALID_ROUTES.includes(route)) route = 'portal-publik-dan-lacak';

  const allowed = ROUTE_ROLES[route];
  if (allowed) {
    if (!CURRENT_SESSION) {
      showToast('Silakan masuk (login) terlebih dahulu untuk mengakses menu ini.', 'warning');
      route = 'portal-publik-dan-lacak';
    } else if (!allowed.includes(CURRENT_SESSION.user.role)) {
      showToast('Akses ditolak untuk peran ' + CURRENT_SESSION.user.role + '.', 'error');
      return;
    }
  }

  CURRENT_ROUTE = route;
  if (updateHash && window.location.hash !== '#' + route) {
    window.location.hash = route;
  }

  // Toggle views instantaneously (0ms)
  document.querySelectorAll('.app-view').forEach(el => el.classList.add('hidden'));
  const activeView = document.getElementById('view-' + route);
  if (activeView) activeView.classList.remove('hidden');

  // Show/hide persistent sidebar (hidden on Public Portal, shown on dashboard views)
  const sidebar = document.getElementById('appSidebar');
  const mainShell = document.getElementById('mainShell');
  const isDashboard = route !== 'portal-publik-dan-lacak' && !!CURRENT_SESSION;

  if (sidebar && mainShell) {
    if (isDashboard) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('md:flex');
      mainShell.classList.add('md:pl-64');
    } else {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('md:flex');
      mainShell.classList.remove('md:pl-64');
    }
  }

  // Highlight active nav links
  document.querySelectorAll('.nav-link').forEach(a => {
    const isAct = a.getAttribute('data-route') === route;
    a.className = isAct
      ? 'nav-link px-3 py-2 rounded-lg text-[13px] font-bold bg-primary text-on-primary shadow-sm transition-all whitespace-nowrap'
      : 'nav-link px-3 py-2 rounded-lg text-[13px] font-medium text-on-primary-container hover:bg-primary/50 hover:text-on-primary transition-all whitespace-nowrap';
  });

  document.querySelectorAll('.side-link').forEach(a => {
    const isAct = a.getAttribute('data-route') === route;
    a.className = isAct
      ? 'side-link flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold bg-primary-container text-on-primary shadow-sm transition-all'
      : 'side-link flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all';
  });

  toggleMobileDrawer(false);
  refreshActiveViewData();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function refreshActiveViewData() {
  updateRoleNavigationVisibility();
  updatePendingBadges();

  if (CURRENT_ROUTE === 'portal-publik-dan-lacak') {
    handlePublicTrack(true);
  } else if (CURRENT_ROUTE === 'permohonan-baru') {
    renderPemohonKpis();
    selectKategoriKuasa(SELECTED_KATEGORI);
  } else if (CURRENT_ROUTE === 'riwayat-berkas') {
    renderRiwayatTable();
  } else if (CURRENT_ROUTE === 'antrean-verifikasi-petugas') {
    renderVerifikatorTable();
  } else if (CURRENT_ROUTE === 'buku-register-kuasa') {
    renderBukuRegisterTable();
  } else if (CURRENT_ROUTE === 'admin-dan-log') {
    renderAdminPanel();
  }
}

function toggleMobileDrawer(force) {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('mobileDrawerBackdrop');
  if (!sidebar || !backdrop) return;
  const open = typeof force === 'boolean' ? force : sidebar.classList.contains('hidden');
  if (open && CURRENT_SESSION) {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('flex');
    backdrop.classList.remove('hidden');
  } else if (window.innerWidth < 768) {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('flex');
    backdrop.classList.add('hidden');
  }
}

function updateRoleNavigationVisibility() {
  const role = CURRENT_SESSION ? CURRENT_SESSION.user.role : null;
  document.querySelectorAll('[data-roles]').forEach(el => {
    const allowed = el.getAttribute('data-roles').split(',');
    if (role && allowed.includes(role)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  const btnLogin = document.getElementById('btnNavLogin');
  const userBox = document.getElementById('navUserBox');
  const demoBadge = document.getElementById('demoModeBadge');
  if (demoBadge) demoBadge.classList.toggle('hidden', !IS_DEMO_MODE);

  if (CURRENT_SESSION) {
    if (btnLogin) btnLogin.classList.add('hidden');
    if (userBox) userBox.classList.remove('hidden');
    const nameEl = document.getElementById('navUserName');
    const roleEl = document.getElementById('navUserRole');
    const avEl = document.getElementById('navUserAvatar');
    if (nameEl) nameEl.textContent = CURRENT_SESSION.user.nama;
    if (roleEl) roleEl.textContent = CURRENT_SESSION.user.role;
    if (avEl) avEl.textContent = (CURRENT_SESSION.user.nama || 'PN').slice(0, 2).toUpperCase();
  } else {
    if (btnLogin) btnLogin.classList.remove('hidden');
    if (userBox) userBox.classList.add('hidden');
  }
}

function updatePendingBadges() {
  const pendingCount = APP_STATE.permohonan.filter(p => p.status === 'Menunggu Verifikasi').length;
  const badge = document.getElementById('sidebarPendingBadge');
  if (badge) badge.textContent = pendingCount;
}

// =========================================================================
// 5. AUTHENTICATION (LOGIN, REGISTRASI & QUICK DEMO ROLE)
// =========================================================================

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('formLogin').classList.toggle('hidden', !isLogin);
  document.getElementById('formRegister').classList.toggle('hidden', isLogin);
  document.getElementById('tabBtnLogin').className = isLogin
    ? 'py-2 rounded-lg text-xs font-bold bg-primary-container text-on-primary shadow-sm transition-all cursor-pointer'
    : 'py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary transition-all cursor-pointer';
  document.getElementById('tabBtnRegister').className = !isLogin
    ? 'py-2 rounded-lg text-xs font-bold bg-primary-container text-on-primary shadow-sm transition-all cursor-pointer'
    : 'py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary transition-all cursor-pointer';
}

function quickLoginRole(role) {
  if (role === 'Pemohon') {
    document.getElementById('loginUsername').value = 'advokat@kantorhukum.id';
    document.getElementById('loginPassword').value = 'pemohon123';
  } else if (role === 'Petugas') {
    document.getElementById('loginUsername').value = 'petugas1';
    document.getElementById('loginPassword').value = 'petugas123';
  } else {
    document.getElementById('loginUsername').value = 'admin';
    document.getElementById('loginPassword').value = 'admin123';
  }
  handleLoginSubmit();
}

async function handleLoginSubmit() {
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  if (!username || !password) {
    showToast('Masukkan Username/Email dan Password.', 'warning');
    return;
  }

  if (IS_DEMO_MODE) {
    const found = APP_STATE.users.find(u => u.username.toLowerCase() === username && (u.password === password || !u.password));
    if (!found) {
      showToast('Username atau Password tidak cocok.', 'error');
      return;
    }
    if (!found.aktif) {
      showToast('Akun Anda sedang dinonaktifkan oleh Admin.', 'error');
      return;
    }
    saveSession({ token: 'demo-token-' + Date.now(), user: { userId: found.userId, username: found.username, nama: found.nama, wa: found.wa, role: found.role } });
    showToast('Selamat datang, ' + found.nama + ' (' + found.role + ')', 'success');
    routeAfterLogin(found.role);
    return;
  }

  const btn = document.getElementById('btnLoginSubmit');
  btn.disabled = true;
  const res = await callApi('login', { username, password });
  btn.disabled = false;

  if (res.success) {
    saveSession({ token: res.token, user: res.user });
    showToast('Login berhasil! Selamat datang, ' + res.user.nama, 'success');
    syncPermohonanFromServer();
    if (res.user.role === 'Admin') syncAdminFromServer();
    routeAfterLogin(res.user.role);
  } else {
    showToast(res.message || 'Login gagal.', 'error');
  }
}

async function handleRegisterSubmit() {
  const nama = document.getElementById('regNama').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const wa = normalizeHp08(document.getElementById('regWa').value);
  const password = document.getElementById('regPassword').value;

  if (!nama || !username || !wa || password.length < 6) {
    showToast('Lengkapi semua kolom dan gunakan password minimal 6 karakter.', 'warning');
    return;
  }

  if (IS_DEMO_MODE) {
    if (APP_STATE.users.some(u => u.username.toLowerCase() === username)) {
      showToast('Username/Email sudah terdaftar.', 'error');
      return;
    }
    const newUser = {
      userId: 'USR-' + String(APP_STATE.users.length + 1).padStart(3, '0'),
      username, password, nama, wa, role: 'Pemohon', aktif: true, createdAt: new Date().toISOString()
    };
    APP_STATE.users.push(newUser);
    saveLocalState();
    saveSession({ token: 'demo-token-' + Date.now(), user: newUser });
    showToast('Registrasi berhasil! Anda langsung masuk sebagai Pemohon.', 'success');
    routeAfterLogin('Pemohon');
    return;
  }

  const res = await callApi('register', { nama, username, wa, password });
  if (res.success) {
    saveSession({ token: res.token, user: res.user });
    showToast(res.message || 'Registrasi berhasil!', 'success');
    routeAfterLogin('Pemohon');
  } else {
    showToast(res.message || 'Registrasi gagal.', 'error');
  }
}

function routeAfterLogin(role) {
  if (role === 'Petugas') navigateTo('antrean-verifikasi-petugas');
  else if (role === 'Admin') navigateTo('admin-dan-log');
  else navigateTo('permohonan-baru');
}

function logoutUser() {
  saveSession(null);
  showToast('Anda telah keluar dari sistem.', 'info');
  navigateTo('portal-publik-dan-lacak');
}

// =========================================================================
// 6. VIEW 1: PUBLIC TRACKING (TANPA LOGIN)
// =========================================================================

function quickTrack(val) {
  document.getElementById('trackQueryInput').value = val;
  handlePublicTrack(false);
}

async function handlePublicTrack(silent = false) {
  const query = (document.getElementById('trackQueryInput')?.value || '').trim();
  const container = document.getElementById('trackResultContainer');
  if (!container) return;

  if (!query) {
    container.innerHTML = '';
    return;
  }

  let found = null;
  const qLow = query.toLowerCase();
  const qWa = normalizeHp08(query);

  if (IS_DEMO_MODE) {
    found = APP_STATE.permohonan.find(p => p.permohonanId.toLowerCase() === qLow || (qWa && normalizeHp08(p.noHpWa) === qWa));
  } else {
    const res = await callApi('trackPermohonan', { query });
    if (res.success) found = res.data;
  }

  if (!found) {
    container.innerHTML = `
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-6 text-center shadow-sm">
        <span class="material-symbols-outlined text-4xl text-outline mb-2 block">search_off</span>
        <p class="text-sm font-bold text-on-surface">Permohonan "${escapeHtml(query)}" tidak ditemukan</p>
        <p class="text-xs text-on-surface-variant mt-1">Pastikan ID Permohonan (contoh: REG-202611-001) atau Nomor WhatsApp sudah sesuai.</p>
      </div>
    `;
    if (!silent) showToast('Data permohonan tidak ditemukan.', 'warning');
    return;
  }

  const step2Done = found.status === 'Disetujui' || found.status === 'Perlu Revisi';
  const step3Done = found.status === 'Disetujui';
  const progressWidth = step3Done ? '100%' : (step2Done ? '50%' : '15%');

  container.innerHTML = `
    <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 overflow-hidden animate-fade-fast">
      <div class="px-5 py-3.5 bg-surface-container-low/60 border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="font-display text-base font-extrabold text-primary tabular-nums">${escapeHtml(found.permohonanId)}</span>
          <span class="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-primary text-[11px] font-bold">${escapeHtml(found.kategoriKuasa)}</span>
        </div>
        ${statusPillHtml(found.status)}
      </div>

      <div class="p-5 space-y-5">
        <!-- 3-Step Judicial Milestone Stepper -->
        <div class="relative flex items-center justify-between px-2">
          <div class="absolute left-8 right-8 top-4 h-1 bg-surface-container-high -z-0">
            <div class="h-full bg-primary-container transition-all duration-500" style="width:${progressWidth}"></div>
          </div>
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-sm">check</span></div>
            <span class="text-xs font-bold text-primary mt-1.5">Pengajuan</span>
            <span class="text-[10px] text-outline tabular-nums">${formatShortDate(found.tanggalPengajuan)}</span>
          </div>
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-8 h-8 rounded-full ${step2Done ? (found.status === 'Perlu Revisi' ? 'bg-error text-white' : 'bg-primary-container text-on-primary') : 'bg-surface-container-high text-outline'} flex items-center justify-center shadow-sm">
              <span class="material-symbols-outlined text-sm">${found.status === 'Perlu Revisi' ? 'priority_high' : (step2Done ? 'check' : 'schedule')}</span>
            </div>
            <span class="text-xs font-bold ${step2Done ? 'text-primary' : 'text-outline'} mt-1.5">${found.status === 'Perlu Revisi' ? 'Perlu Revisi' : 'Verifikasi'}</span>
            <span class="text-[10px] text-outline tabular-nums">${found.tanggalVerifikasi ? formatShortDate(found.tanggalVerifikasi) : 'Dalam antrean'}</span>
          </div>
          <div class="relative z-10 flex flex-col items-center text-center">
            <div class="w-8 h-8 rounded-full ${step3Done ? 'bg-primary text-secondary-container ring-4 ring-secondary-container/60' : 'bg-surface-container-high text-outline'} flex items-center justify-center shadow-sm">
              <span class="material-symbols-outlined text-sm">${step3Done ? 'stars' : 'verified'}</span>
            </div>
            <span class="text-xs font-bold ${step3Done ? 'text-primary' : 'text-outline'} mt-1.5">Terdaftar Sah</span>
            <span class="text-[10px] text-outline">${step3Done ? 'Aktif & Resmi' : 'Menunggu'}</span>
          </div>
        </div>

        <!-- Legalization Identity Box -->
        <div class="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-2.5 text-xs">
          <div class="flex items-center gap-1.5 text-primary font-bold uppercase tracking-wider text-[11px]">
            <span class="material-symbols-outlined text-base">gavel</span>
            <span>Identitas Legalisasi Kepaniteraan Hukum</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <span class="text-outline block">Nomor Register Resmi</span>
              <strong class="text-primary tabular-nums">${escapeHtml(found.nomorRegisterResmi || 'Belum diterbitkan')}</strong>
            </div>
            <div>
              <span class="text-outline block">Petugas Verifikator</span>
              <strong class="text-on-surface">${escapeHtml(found.petugasVerifikator || 'Menunggu penugasan')}</strong>
            </div>
            <div>
              <span class="text-outline block">Nama Pemohon / Pemberi Kuasa</span>
              <strong class="text-on-surface">${escapeHtml(found.namaPemohon)}</strong>
            </div>
            <div>
              <span class="text-outline block">Catatan Petugas</span>
              <span class="${found.status === 'Perlu Revisi' ? 'text-error font-semibold' : 'text-on-surface-variant'}">${escapeHtml(found.catatanPetugas || '-')}</span>
            </div>
          </div>
        </div>

        ${step3Done ? `
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/30">
            <button onclick="openReceiptModal('${escapeHtml(found.permohonanId)}')" class="px-4 py-2 rounded-lg border border-primary-container text-primary hover:bg-primary-fixed/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-base">print</span>
              <span>Cetak Bukti Tanda Terima Resmi</span>
            </button>
            <span class="text-[11px] text-outline flex items-center gap-1"><span class="material-symbols-outlined text-sm text-primary-container">verified_user</span> Tercatat sah dalam Buku Register Elektronik</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  if (!silent) showToast('Status Permohonan ' + found.permohonanId + ' ditemukan!', 'success');
}

// =========================================================================
// 7. VIEW 2: FORMULIR PERMOHONAN BARU (3 KATEGORI DINAMIS + CANVAS COMPRESS)
// =========================================================================

function renderPemohonKpis() {
  const mine = getVisiblePermohonan();
  document.getElementById('kpiPemohonTotal').textContent = mine.length;
  document.getElementById('kpiPemohonMenunggu').textContent = mine.filter(x => x.status === 'Menunggu Verifikasi').length;
  document.getElementById('kpiPemohonRevisi').textContent = mine.filter(x => x.status === 'Perlu Revisi').length;
  document.getElementById('kpiPemohonDisetujui').textContent = mine.filter(x => x.status === 'Disetujui').length;
}

function selectKategoriKuasa(kat) {
  SELECTED_KATEGORI = kat;
  const map = {
    'Advokat': 'catCardAdvokat',
    'Instansi Pemerintah': 'catCardInstansi',
    'Insidentil': 'catCardInsidentil'
  };

  Object.keys(map).forEach(k => {
    const el = document.getElementById(map[k]);
    if (!el) return;
    const active = k === kat;
    el.className = active
      ? 'text-left p-4 rounded-xl border border-primary-container bg-primary-container text-on-primary shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2'
      : 'text-left p-4 rounded-xl border border-outline-variant/50 bg-surface-container-low/50 text-on-surface hover:bg-surface-container-low transition-all cursor-pointer flex flex-col justify-between gap-2';
    const chk = el.querySelector('.cat-check');
    if (chk) {
      chk.textContent = active ? 'check_circle' : 'radio_button_unchecked';
      chk.className = 'cat-check material-symbols-outlined text-[18px] ' + (active ? 'text-secondary-container' : 'text-outline');
    }
  });

  renderDynamicUploadGrid();
}

function renderDynamicUploadGrid() {
  const cfg = CATEGORY_DOCS[SELECTED_KATEGORI] || CATEGORY_DOCS['Advokat'];
  const badge = document.getElementById('formUploadCountBadge');
  if (badge) badge.textContent = cfg.badge;

  const grid = document.getElementById('dynamicUploadGrid');
  if (!grid) return;

  grid.innerHTML = cfg.docs.map(doc => {
    const fileVal = FORM_UPLOADS[doc.key];
    const isSet = !!fileVal;
    const isGold = doc.tone === 'gold';
    const btnCls = isGold
      ? 'bg-secondary hover:bg-secondary/90 text-white'
      : 'bg-primary-container hover:bg-primary text-on-primary';

    return `
      <div class="p-4 rounded-xl border-[1.5px] border-dashed ${isSet ? 'border-primary-container bg-primary-fixed/15' : 'border-outline-variant bg-surface'} flex flex-col items-center text-center transition-all hover:border-primary-container">
        <div class="w-10 h-10 rounded-full ${isGold ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container text-primary'} flex items-center justify-center mb-2">
          <span class="material-symbols-outlined text-[22px]">${doc.icon}</span>
        </div>
        <span class="font-bold text-xs text-on-surface leading-snug min-h-[34px] flex items-center justify-center">${doc.code}. ${doc.title}</span>
        <span class="text-[10px] text-outline mt-0.5 mb-3">${doc.desc}</span>
        <label class="px-3.5 py-1.5 rounded-lg ${btnCls} text-xs font-semibold cursor-pointer shadow-sm transition-colors">
          ${isSet ? 'Ganti Berkas' : 'Pilih Berkas'}
          <input type="file" accept="image/jpeg,image/png,application/pdf" class="hidden" onchange="handleFormFileSelect(this, '${doc.key}')"/>
        </label>
        <span id="uploadStatus_${doc.key}" class="mt-2 text-[10px] font-semibold ${isSet ? 'text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-1' : 'text-outline'}">
          ${isSet ? '<span class="material-symbols-outlined text-xs">check_circle</span> Berkas Siap Diunggah' : 'Wajib diunggah'}
        </span>
      </div>
    `;
  }).join('');
}

// Client-Side HTML5 Canvas Compression (< 500 KB) + PDF Base64 Validation (< 5 MB)
function handleFormFileSelect(input, key) {
  const file = input.files && input.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran file melebihi batas maksimal 5 MB.', 'error');
    input.value = '';
    return;
  }

  const badge = document.getElementById('uploadStatus_' + key);
  if (badge) badge.textContent = 'Memproses file...';

  const reader = new FileReader();
  reader.onload = function (e) {
    const raw = e.target.result;
    if (file.type === 'application/pdf') {
      FORM_UPLOADS[key] = raw;
      renderDynamicUploadGrid();
      showToast('PDF berhasil dilampirkan (' + Math.round(file.size / 1024) + ' KB).', 'success');
      return;
    }

    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const maxDim = 1000;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = Math.round(h * maxDim / w); w = maxDim; }
      else if (h > maxDim) { w = Math.round(w * maxDim / h); h = maxDim; }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      FORM_UPLOADS[key] = canvas.toDataURL('image/jpeg', 0.72);
      renderDynamicUploadGrid();
      showToast('Gambar dikompresi otomatis (' + Math.round(FORM_UPLOADS[key].length / 1024) + ' KB).', 'success');
    };
    img.src = raw;
  };
  reader.readAsDataURL(file);
}

function resetPermohonanForm() {
  document.getElementById('formNamaPemohon').value = '';
  document.getElementById('formWaPemohon').value = '';
  FORM_UPLOADS = {};
  cancelRevisionMode();
  renderDynamicUploadGrid();
}

function startRevisionMode(permohonanId) {
  const item = APP_STATE.permohonan.find(p => p.permohonanId === permohonanId);
  if (!item || item.status !== 'Perlu Revisi') {
    showToast('Data terkunci! Hanya berkas berstatus Perlu Revisi yang dapat diperbaiki.', 'warning');
    return;
  }
  REVISION_TARGET_ID = permohonanId;
  SELECTED_KATEGORI = item.kategoriKuasa;
  FORM_UPLOADS = { ...(item.berkas || {}) };

  navigateTo('permohonan-baru');
  document.getElementById('formNamaPemohon').value = item.namaPemohon;
  document.getElementById('formWaPemohon').value = item.noHpWa;
  document.getElementById('revisionTargetId').textContent = permohonanId;
  document.getElementById('revisionOfficerNote').textContent = 'Catatan Petugas: ' + (item.catatanPetugas || '-');
  document.getElementById('revisionModeBanner').classList.remove('hidden');
  document.getElementById('formHeadingTitle').textContent = 'Perbaikan Berkas Permohonan (' + permohonanId + ')';
  document.getElementById('btnSubmitLabel').textContent = 'Kirim Ulang Perbaikan Berkas';
  selectKategoriKuasa(SELECTED_KATEGORI);
}

function cancelRevisionMode() {
  REVISION_TARGET_ID = null;
  document.getElementById('revisionModeBanner')?.classList.add('hidden');
  const titleEl = document.getElementById('formHeadingTitle');
  if (titleEl) titleEl.textContent = 'Formulir Pendaftaran Surat Kuasa Baru';
  const btnLbl = document.getElementById('btnSubmitLabel');
  if (btnLbl) btnLbl.textContent = 'Kirim Permohonan Pendaftaran Kuasa';
}

async function submitPermohonanForm() {
  const namaPemohon = document.getElementById('formNamaPemohon').value.trim();
  const noHpWa = normalizeHp08(document.getElementById('formWaPemohon').value);
  const agreed = document.getElementById('formAgreeCheck').checked;

  if (!namaPemohon || !noHpWa) {
    showToast('Nama Pemohon dan Nomor WhatsApp Aktif wajib diisi.', 'warning');
    return;
  }
  if (!agreed) {
    showToast('Centang pernyataan kebenaran data terlebih dahulu.', 'warning');
    return;
  }

  const cfg = CATEGORY_DOCS[SELECTED_KATEGORI] || CATEGORY_DOCS['Advokat'];
  const missing = cfg.docs.filter(d => !FORM_UPLOADS[d.key]);
  if (missing.length > 0) {
    if (IS_DEMO_MODE) {
      // Di Mode Demo, izinkan auto-lampirkan berkas contoh agar mudah diuji
      missing.forEach(d => { FORM_UPLOADS[d.key] = DEMO_SAMPLE_IMG[d.key] || DEMO_SAMPLE_IMG.surat_kuasa; });
    } else {
      showToast('Berkas wajib belum lengkap: ' + missing.map(m => m.title).join(', '), 'error');
      return;
    }
  }

  const btn = document.getElementById('btnSubmitPermohonan');
  btn.disabled = true;

  if (REVISION_TARGET_ID) {
    // MODE PERBAIKAN REVISI
    if (IS_DEMO_MODE) {
      const idx = APP_STATE.permohonan.findIndex(p => p.permohonanId === REVISION_TARGET_ID);
      if (idx > -1) {
        APP_STATE.permohonan[idx].namaPemohon = namaPemohon;
        APP_STATE.permohonan[idx].noHpWa = noHpWa;
        APP_STATE.permohonan[idx].status = 'Menunggu Verifikasi';
        APP_STATE.permohonan[idx].berkas = { ...FORM_UPLOADS };
        saveLocalState();
      }
      btn.disabled = false;
      showToast('Perbaikan berkas ' + REVISION_TARGET_ID + ' berhasil dikirim ulang!', 'success');
      resetPermohonanForm();
      navigateTo('riwayat-berkas');
      return;
    }
    const res = await callApi('revisiPermohonan', { permohonanId: REVISION_TARGET_ID, namaPemohon, noHpWa, berkas: FORM_UPLOADS });
    btn.disabled = false;
    if (res.success) {
      showToast(res.message || 'Perbaikan berkas berhasil dikirim!', 'success');
      resetPermohonanForm();
      await syncPermohonanFromServer();
      navigateTo('riwayat-berkas');
    } else {
      showToast(res.message || 'Gagal mengirim perbaikan.', 'error');
    }
    return;
  }

  // MODE PENDAFTARAN BARU (Optimistic UI)
  const now = new Date();
  const ym = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0');
  const tempId = 'REG-' + ym + '-' + String(Math.floor(Math.random() * 900 + 100));

  if (IS_DEMO_MODE) {
    const newItem = {
      permohonanId: tempId,
      userId: CURRENT_SESSION ? CURRENT_SESSION.user.userId : 'USR-003',
      tanggalPengajuan: now.toISOString(),
      kategoriKuasa: SELECTED_KATEGORI,
      namaPemohon,
      noHpWa,
      status: 'Menunggu Verifikasi',
      nomorRegisterResmi: '',
      catatanPetugas: '',
      petugasVerifikator: '',
      tanggalVerifikasi: '',
      hashVerifikasi: '',
      berkas: { ...FORM_UPLOADS }
    };
    APP_STATE.permohonan.unshift(newItem);
    APP_STATE.logs.unshift({ Timestamp: now.toISOString(), User: CURRENT_SESSION?.user.username || 'pemohon', Aksi: 'PERMOHONAN_BARU', Ref_ID: tempId, Keterangan: 'Pengajuan ' + SELECTED_KATEGORI + ' — ' + namaPemohon });
    saveLocalState();
    btn.disabled = false;
    showToast('Permohonan ' + tempId + ' berhasil dikirim! Status: Menunggu Verifikasi.', 'success');
    resetPermohonanForm();
    navigateTo('riwayat-berkas');
    return;
  }

  const res = await callApi('daftarPermohonan', { kategoriKuasa: SELECTED_KATEGORI, namaPemohon, noHpWa, berkas: FORM_UPLOADS });
  btn.disabled = false;
  if (res.success) {
    showToast(res.message || 'Permohonan berhasil dikirim!', 'success');
    resetPermohonanForm();
    await syncPermohonanFromServer();
    navigateTo('riwayat-berkas');
  } else {
    showToast(res.message || 'Gagal mengirim permohonan.', 'error');
  }
}

// =========================================================================
// 8. VIEW 3: RIWAYAT BERKAS & DATA LOCKING
// =========================================================================

function getVisiblePermohonan() {
  if (!CURRENT_SESSION) return [];
  if (CURRENT_SESSION.user.role === 'Petugas' || CURRENT_SESSION.user.role === 'Admin') {
    return APP_STATE.permohonan;
  }
  return APP_STATE.permohonan.filter(p => p.userId === CURRENT_SESSION.user.userId || normalizeHp08(p.noHpWa) === normalizeHp08(CURRENT_SESSION.user.wa));
}

function renderRiwayatTable() {
  const tbody = document.getElementById('riwayatTableBody');
  if (!tbody) return;

  const q = (document.getElementById('riwayatSearch')?.value || '').trim().toLowerCase();
  const st = document.getElementById('riwayatStatusFilter')?.value || 'ALL';

  const rows = getVisiblePermohonan().filter(item => {
    const matchQ = !q || item.permohonanId.toLowerCase().includes(q) || item.namaPemohon.toLowerCase().includes(q) || (item.nomorRegisterResmi || '').toLowerCase().includes(q);
    const matchSt = st === 'ALL' || item.status === st;
    return matchQ && matchSt;
  });

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-xs text-outline">Belum ada permohonan surat kuasa yang sesuai filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(item => {
    let actionHtml = '';
    if (item.status === 'Disetujui') {
      actionHtml = `
        <button onclick="openReceiptModal('${escapeHtml(item.permohonanId)}')" class="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer">
          <span class="material-symbols-outlined text-sm">print</span>
          <span>Cetak Tanda Terima</span>
        </button>`;
    } else if (item.status === 'Perlu Revisi') {
      actionHtml = `
        <button onclick="startRevisionMode('${escapeHtml(item.permohonanId)}')" class="px-3 py-1.5 rounded-lg bg-secondary-container hover:bg-secondary-fixed text-on-secondary-fixed text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer">
          <span class="material-symbols-outlined text-sm">edit_document</span>
          <span>Perbaiki &amp; Unggah Ulang</span>
        </button>`;
    } else {
      actionHtml = `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#475569] text-[11px] font-semibold" title="Data terkunci saat diverifikasi petugas">
          <span class="material-symbols-outlined text-xs">lock</span> Terkunci
        </span>`;
    }

    return `
      <tr class="hover:bg-surface-container-low/40 transition-colors">
        <td class="py-3.5 px-4 align-top">
          <span class="font-bold text-primary tabular-nums block">${escapeHtml(item.permohonanId)}</span>
          <span class="text-[11px] text-outline tabular-nums">${formatShortDate(item.tanggalPengajuan)}</span>
        </td>
        <td class="py-3.5 px-4 align-top">
          <span class="font-semibold text-on-surface block">${escapeHtml(item.namaPemohon)}</span>
          <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-container text-primary text-[10px] font-bold">${escapeHtml(item.kategoriKuasa)}</span>
        </td>
        <td class="py-3.5 px-4 align-top">
          ${statusPillHtml(item.status)}
          ${item.nomorRegisterResmi ? `<span class="block mt-1 text-[11px] font-bold text-primary tabular-nums">${escapeHtml(item.nomorRegisterResmi)}</span>` : ''}
        </td>
        <td class="py-3.5 px-4 align-top text-xs ${item.status === 'Perlu Revisi' ? 'text-error font-medium' : 'text-on-surface-variant'} max-w-xs">
          ${escapeHtml(item.catatanPetugas || '-')}
        </td>
        <td class="py-3.5 px-4 align-top text-right whitespace-nowrap">${actionHtml}</td>
      </tr>
    `;
  }).join('');
}

// =========================================================================
// 9. VIEW 4: ANTREAN VERIFIKASI PETUGAS & SLIDE-OVER DRAWER
// =========================================================================

function renderVerifikatorTable() {
  const all = APP_STATE.permohonan;
  document.getElementById('kpiPetugasTotal').textContent = all.length;
  document.getElementById('kpiPetugasPending').textContent = all.filter(x => x.status === 'Menunggu Verifikasi').length;
  document.getElementById('kpiPetugasDone').textContent = all.filter(x => x.status === 'Disetujui').length;

  const q = (document.getElementById('verifSearch')?.value || '').trim().toLowerCase();
  const st = document.getElementById('verifStatusFilter')?.value || 'ALL';
  const kat = document.getElementById('verifKatFilter')?.value || 'ALL';

  const rows = all.filter(item => {
    const matchQ = !q || item.permohonanId.toLowerCase().includes(q) || item.namaPemohon.toLowerCase().includes(q) || item.noHpWa.includes(q);
    const matchSt = st === 'ALL' || item.status === st;
    const matchKat = kat === 'ALL' || item.kategoriKuasa === kat;
    return matchQ && matchSt && matchKat;
  });

  const tbody = document.getElementById('verifTableBody');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-xs text-outline">Tidak ada berkas dalam antrean yang sesuai filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(item => `
    <tr class="hover:bg-surface-container-low/40 transition-colors">
      <td class="py-3.5 px-4">
        <span class="font-bold text-primary tabular-nums block">${escapeHtml(item.permohonanId)}</span>
        <span class="text-[11px] text-outline tabular-nums">${formatShortDate(item.tanggalPengajuan)}</span>
      </td>
      <td class="py-3.5 px-4">
        <span class="font-semibold text-on-surface block">${escapeHtml(item.namaPemohon)}</span>
        <span class="text-[11px] text-outline tabular-nums">${escapeHtml(item.noHpWa)}</span>
      </td>
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">${escapeHtml(item.kategoriKuasa)}</span>
      </td>
      <td class="py-3.5 px-4">${statusPillHtml(item.status)}</td>
      <td class="py-3.5 px-4 text-right">
        <button onclick="openVerifDrawer('${escapeHtml(item.permohonanId)}')" class="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer">
          <span class="material-symbols-outlined text-sm">visibility</span>
          <span>Periksa Berkas</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function openVerifDrawer(permohonanId) {
  const item = APP_STATE.permohonan.find(p => p.permohonanId === permohonanId);
  if (!item) return;
  DRAWER_ITEM = item;
  DRAWER_ZOOM = 100;
  DRAWER_ROTATE = 0;

  document.getElementById('drawerTitleId').textContent = 'Verifikasi: ' + item.permohonanId;
  document.getElementById('drawerKategoriPill').textContent = item.kategoriKuasa;
  document.getElementById('drawerNamaPemohon').textContent = item.namaPemohon;
  document.getElementById('drawerWaPemohon').textContent = item.noHpWa;
  document.getElementById('drawerRegisterInput').value = item.nomorRegisterResmi || '';
  document.getElementById('drawerNoteInput').value = item.catatanPetugas || '';

  const cfg = CATEGORY_DOCS[item.kategoriKuasa] || CATEGORY_DOCS['Advokat'];
  const tabsEl = document.getElementById('drawerDocTabs');
  tabsEl.innerHTML = cfg.docs.map(d => `
    <button type="button" id="dtab_${d.key}" onclick="switchDrawerDoc('${d.key}')" class="px-2.5 py-1 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high cursor-pointer">
      ${d.code}. ${d.title.length > 22 ? d.title.slice(0, 20) + '…' : d.title}
    </button>
  `).join('');

  switchDrawerDoc(cfg.docs[0].key);
  document.getElementById('verifDrawerOverlay').classList.remove('hidden');
  document.getElementById('verifDrawer').classList.remove('hidden');
  document.getElementById('verifDrawer').classList.add('flex');
}

function closeVerifDrawer() {
  document.getElementById('verifDrawerOverlay').classList.add('hidden');
  document.getElementById('verifDrawer').classList.add('hidden');
  document.getElementById('verifDrawer').classList.remove('flex');
  DRAWER_ITEM = null;
}

function switchDrawerDoc(docKey) {
  if (!DRAWER_ITEM) return;
  document.querySelectorAll('#drawerDocTabs button').forEach(btn => {
    const act = btn.id === 'dtab_' + docKey;
    btn.className = act
      ? 'px-2.5 py-1 rounded text-[10px] font-bold bg-primary-container text-on-primary shadow-sm cursor-pointer'
      : 'px-2.5 py-1 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant hover:bg-surface-container-high cursor-pointer';
  });

  document.getElementById('drawerDocTitle').textContent = DOC_LABEL_MAP[docKey] || docKey;
  const url = (DRAWER_ITEM.berkas && DRAWER_ITEM.berkas[docKey]) || '';
  const img = document.getElementById('drawerDocImg');
  const iframe = document.getElementById('drawerDocIframe');
  const empty = document.getElementById('drawerDocEmpty');

  img.classList.add('hidden');
  iframe.classList.add('hidden');
  empty.classList.add('hidden');

  if (!url) {
    empty.classList.remove('hidden');
    return;
  }
  if (url.includes('/preview') || url.startsWith('data:application/pdf') || url.endsWith('.pdf')) {
    iframe.src = url;
    iframe.classList.remove('hidden');
  } else {
    DRAWER_ZOOM = 100;
    DRAWER_ROTATE = 0;
    img.src = url;
    img.style.transform = 'scale(1) rotate(0deg)';
    img.classList.remove('hidden');
  }
}

function zoomDrawerDoc(delta) {
  DRAWER_ZOOM = Math.max(60, Math.min(200, DRAWER_ZOOM + delta));
  const img = document.getElementById('drawerDocImg');
  if (img) img.style.transform = `scale(${DRAWER_ZOOM / 100}) rotate(${DRAWER_ROTATE}deg)`;
}

function rotateDrawerDoc() {
  DRAWER_ROTATE = (DRAWER_ROTATE + 90) % 360;
  const img = document.getElementById('drawerDocImg');
  if (img) img.style.transform = `scale(${DRAWER_ZOOM / 100}) rotate(${DRAWER_ROTATE}deg)`;
}

async function submitVerifikasi(keputusan) {
  if (!DRAWER_ITEM) return;
  const nomorRegisterResmi = document.getElementById('drawerRegisterInput').value.trim();
  const catatanPetugas = document.getElementById('drawerNoteInput').value.trim();

  if (keputusan === 'Disetujui' && !nomorRegisterResmi) {
    showToast('Nomor Register Resmi wajib diisi untuk menyetujui permohonan!', 'warning');
    document.getElementById('drawerRegisterInput').focus();
    return;
  }
  if (keputusan === 'Perlu Revisi' && !catatanPetugas) {
    showToast('Catatan perbaikan wajib diisi saat memilih Minta Revisi!', 'warning');
    document.getElementById('drawerNoteInput').focus();
    return;
  }

  const targetId = DRAWER_ITEM.permohonanId;

  if (IS_DEMO_MODE) {
    const idx = APP_STATE.permohonan.findIndex(p => p.permohonanId === targetId);
    if (idx > -1) {
      APP_STATE.permohonan[idx].status = keputusan;
      APP_STATE.permohonan[idx].nomorRegisterResmi = keputusan === 'Disetujui' ? nomorRegisterResmi : '';
      APP_STATE.permohonan[idx].catatanPetugas = catatanPetugas || 'Berkas lengkap, sah, dan terdaftar resmi.';
      APP_STATE.permohonan[idx].petugasVerifikator = CURRENT_SESSION ? CURRENT_SESSION.user.nama : 'Siti Rahmawati, S.H.';
      APP_STATE.permohonan[idx].tanggalVerifikasi = new Date().toISOString();
      APP_STATE.permohonan[idx].hashVerifikasi = keputusan === 'Disetujui' ? ('sha256-' + Math.random().toString(16).slice(2) + Date.now().toString(16)) : '';
      APP_STATE.logs.unshift({ Timestamp: new Date().toISOString(), User: CURRENT_SESSION?.user.username || 'petugas', Aksi: 'VERIFIKASI_' + keputusan.toUpperCase(), Ref_ID: targetId, Keterangan: nomorRegisterResmi || catatanPetugas });
      saveLocalState();
    }
    closeVerifDrawer();
    updatePendingBadges();
    renderVerifikatorTable();
    showToast('Status ' + targetId + ' berhasil diperbarui menjadi ' + keputusan + '!', 'success');
    return;
  }

  const res = await callApi('verifikasiPermohonan', { permohonanId: targetId, keputusan, nomorRegisterResmi, catatanPetugas });
  if (res.success) {
    closeVerifDrawer();
    showToast(res.message || 'Verifikasi berhasil disimpan.', 'success');
    await syncPermohonanFromServer();
  } else {
    showToast(res.message || 'Gagal menyimpan verifikasi.', 'error');
  }
}

// =========================================================================
// 10. VIEW 5: BUKU REGISTER KUASA & EKSPOR CSV
// =========================================================================

function renderBukuRegisterTable() {
  const tbody = document.getElementById('bukuRegisterBody');
  if (!tbody) return;

  const q = (document.getElementById('regSearch')?.value || '').trim().toLowerCase();
  const kat = document.getElementById('regKatFilter')?.value || 'ALL';
  const ym = document.getElementById('regDateFilter')?.value || '';

  const rows = APP_STATE.permohonan.filter(p => {
    if (p.status !== 'Disetujui') return false;
    const matchQ = !q || (p.nomorRegisterResmi || '').toLowerCase().includes(q) || p.namaPemohon.toLowerCase().includes(q) || p.permohonanId.toLowerCase().includes(q);
    const matchKat = kat === 'ALL' || p.kategoriKuasa === kat;
    const matchYm = !ym || (p.tanggalVerifikasi || p.tanggalPengajuan || '').startsWith(ym);
    return matchQ && matchKat && matchYm;
  });

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-xs text-outline">Belum ada surat kuasa terdaftar pada filter ini.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(item => `
    <tr class="hover:bg-surface-container-low/40 transition-colors">
      <td class="py-3.5 px-4 font-bold text-primary tabular-nums">${escapeHtml(item.nomorRegisterResmi)}</td>
      <td class="py-3.5 px-4">
        <span class="font-semibold text-on-surface tabular-nums block">${escapeHtml(item.permohonanId)}</span>
        <span class="text-[11px] text-outline tabular-nums">${formatShortDate(item.tanggalVerifikasi)}</span>
      </td>
      <td class="py-3.5 px-4 font-semibold">${escapeHtml(item.namaPemohon)}</td>
      <td class="py-3.5 px-4"><span class="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">${escapeHtml(item.kategoriKuasa)}</span></td>
      <td class="py-3.5 px-4 text-xs text-on-surface-variant">${escapeHtml(item.petugasVerifikator || '-')}</td>
      <td class="py-3.5 px-4 text-right">
        <button onclick="openReceiptModal('${escapeHtml(item.permohonanId)}')" class="px-3 py-1.5 rounded-lg border border-primary-container text-primary hover:bg-primary-fixed/40 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-sm">receipt_long</span> Tanda Terima
        </button>
      </td>
    </tr>
  `).join('');
}

function exportRegisterCsv() {
  const approved = APP_STATE.permohonan.filter(p => p.status === 'Disetujui');
  if (!approved.length) { showToast('Belum ada data disetujui untuk diekspor.', 'warning'); return; }
  let csv = 'Nomor_Register_Resmi,Permohonan_ID,Tanggal_Verifikasi,Kategori_Kuasa,Nama_Pemohon,No_HP_WA,Petugas_Verifikator\n';
  approved.forEach(p => {
    csv += `"${p.nomorRegisterResmi}","${p.permohonanId}","${p.tanggalVerifikasi}","${p.kategoriKuasa}","${p.namaPemohon}","${p.noHpWa}","${p.petugasVerifikator}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Buku_Register_E-Kuasa_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  showToast('Buku Register berhasil diekspor ke CSV.', 'success');
}

// =========================================================================
// 11. VIEW 6: ADMIN (USER, DRIVE, WA CRM, SCRIPT PROPERTIES & MIGRASI DB)
// =========================================================================

function switchAdminSubTab(tab) {
  ['users', 'wa_crm', 'log_migrasi'].forEach(t => {
    document.getElementById('adminPane_' + t)?.classList.toggle('hidden', t !== tab);
    const btn = document.getElementById('adminTab_' + t);
    if (btn) {
      btn.className = t === tab
        ? 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary-container text-on-primary cursor-pointer'
        : 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary cursor-pointer';
    }
  });
}

function renderAdminPanel() {
  // Drive & Users
  const d = APP_STATE.drive || { usedMb: 0, limitMb: 15360, percent: 0 };
  document.getElementById('drivePercentLabel').textContent = d.percent + '% terpakai';
  document.getElementById('driveProgressBar').style.width = d.percent + '%';
  document.getElementById('driveUsageDesc').textContent = `${d.usedMb.toLocaleString('id-ID')} MB dari ${d.limitMb.toLocaleString('id-ID')} MB • Folder Berkas_Persyaratan aktif`;
  document.getElementById('adminTotalUsers').textContent = APP_STATE.users.length;

  const uBody = document.getElementById('adminUsersBody');
  if (uBody) {
    uBody.innerHTML = APP_STATE.users.map(u => `
      <tr class="hover:bg-surface-container-low/40">
        <td class="py-3 px-4">
          <strong class="text-primary block">${escapeHtml(u.nama)}</strong>
          <span class="text-[11px] text-outline tabular-nums">${escapeHtml(u.userId)}</span>
        </td>
        <td class="py-3 px-4">
          <span class="block text-xs font-medium">${escapeHtml(u.username)}</span>
          <span class="text-[11px] text-outline tabular-nums">${escapeHtml(u.wa || '-')}</span>
        </td>
        <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[10px] font-bold">${escapeHtml(u.role)}</span></td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.aktif ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}">${u.aktif ? 'Aktif' : 'Nonaktif'}</span>
        </td>
        <td class="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
          <button onclick="resetUserPw('${escapeHtml(u.userId)}')" class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary text-[11px] font-bold cursor-pointer">Reset PW</button>
          <button onclick="toggleUserAktif('${escapeHtml(u.userId)}')" class="px-2.5 py-1 rounded border border-outline-variant text-[11px] font-bold hover:bg-surface-container-low cursor-pointer">${u.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
        </td>
      </tr>
    `).join('');
  }

  // WA & CRM
  const s = APP_STATE.secrets || {};
  const fPill = document.getElementById('fonnteStatusPill');
  if (fPill) {
    fPill.textContent = s.FONNTE_TOKEN_ADA ? ('Tersimpan: ' + (s.FONNTE_TOKEN_MASK || '••••••')) : 'Belum Diatur';
    fPill.className = s.FONNTE_TOKEN_ADA
      ? 'px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[10px] font-bold'
      : 'px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-[10px] font-bold';
  }
  if (APP_STATE.notifConfig) {
    document.getElementById('cfgWaAktif').checked = !!APP_STATE.notifConfig.waAktif;
    document.getElementById('cfgEmailAktif').checked = !!APP_STATE.notifConfig.emailAktif;
  }

  const crmBody = document.getElementById('adminCrmBody');
  if (crmBody) {
    crmBody.innerHTML = (APP_STATE.crm || []).map(c => `
      <tr class="hover:bg-surface-container-low/40">
        <td class="py-2.5 px-4 font-semibold">${escapeHtml(c.Nama)}</td>
        <td class="py-2.5 px-4 tabular-nums">${escapeHtml(c.NoWA)}</td>
        <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[10px] font-bold">${escapeHtml(c.Segmen)}</span></td>
        <td class="py-2.5 px-4">
          <button onclick="toggleCrmOptOut('${escapeHtml(c.KontakID)}')" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${c.OptOut === 'YA' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#DCFCE7] text-[#166534]'}">
            ${c.OptOut === 'YA' ? 'Opt-Out (YA)' : 'Aktif Blast'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  // Logs
  const logBody = document.getElementById('adminLogsBody');
  if (logBody) {
    logBody.innerHTML = (APP_STATE.logs || []).map(l => `
      <tr class="hover:bg-surface-container-low/40">
        <td class="py-2.5 px-4 tabular-nums text-outline">${formatShortDate(l.Timestamp)}</td>
        <td class="py-2.5 px-4 font-semibold">${escapeHtml(l.User)}</td>
        <td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded bg-surface-container text-primary text-[10px] font-bold">${escapeHtml(l.Aksi)}</span></td>
        <td class="py-2.5 px-4 tabular-nums">${escapeHtml(l.Ref_ID)}</td>
        <td class="py-2.5 px-4 text-on-surface-variant">${escapeHtml(l.Keterangan)}</td>
      </tr>
    `).join('');
  }
}

function openAddUserModal() { document.getElementById('addUserModal').classList.remove('hidden'); document.getElementById('addUserModal').classList.add('flex'); }
function closeAddUserModal() { document.getElementById('addUserModal').classList.add('hidden'); document.getElementById('addUserModal').classList.remove('flex'); }

async function submitNewUser() {
  const nama = document.getElementById('newUserNama').value.trim();
  const username = document.getElementById('newUserUsername').value.trim().toLowerCase();
  const wa = normalizeHp08(document.getElementById('newUserWa').value);
  const role = document.getElementById('newUserRole').value;
  const password = document.getElementById('newUserPass').value || 'ekuasa123';

  if (IS_DEMO_MODE) {
    APP_STATE.users.push({ userId: 'USR-' + String(APP_STATE.users.length + 1).padStart(3, '0'), username, password, nama, wa, role, aktif: true, createdAt: new Date().toISOString() });
    saveLocalState();
    closeAddUserModal();
    renderAdminPanel();
    showToast('Pengguna ' + nama + ' berhasil ditambahkan.', 'success');
    return;
  }
  const res = await callApi('saveUser', { nama, username, wa, role, password });
  if (res.success) { closeAddUserModal(); showToast(res.message, 'success'); syncAdminFromServer(); }
  else showToast(res.message || 'Gagal menambah user.', 'error');
}

async function toggleUserAktif(userId) {
  if (IS_DEMO_MODE) {
    const u = APP_STATE.users.find(x => x.userId === userId);
    if (u) u.aktif = !u.aktif;
    saveLocalState();
    renderAdminPanel();
    showToast('Status akun diperbarui.', 'info');
    return;
  }
  const res = await callApi('toggleUserStatus', { userId });
  if (res.success) { showToast('Status akun diperbarui.', 'success'); syncAdminFromServer(); }
}

async function resetUserPw(userId) {
  if (IS_DEMO_MODE) {
    const u = APP_STATE.users.find(x => x.userId === userId);
    if (u) u.password = 'ekuasa123';
    saveLocalState();
    showToast('Password akun ' + userId + ' direset menjadi: ekuasa123', 'success');
    return;
  }
  const res = await callApi('resetUserPassword', { userId });
  if (res.success) showToast('Password baru: ' + res.newPassword, 'success');
}

async function saveFonnteToken() {
  const token = document.getElementById('inputFonnteToken').value.trim();
  if (!token) { showToast('Masukkan token Fonnte terlebih dahulu.', 'warning'); return; }
  if (IS_DEMO_MODE) {
    APP_STATE.secrets = { FONNTE_TOKEN_ADA: true, FONNTE_TOKEN_MASK: token.slice(0, 4) + '••••••' + token.slice(-3) };
    saveLocalState();
    document.getElementById('inputFonnteToken').value = '';
    renderAdminPanel();
    showToast('Token Fonnte disimulasikan tersimpan aman di Script Properties.', 'success');
    return;
  }
  const res = await callApi('saveSecrets', { secrets: { FONNTE_TOKEN: token } });
  if (res.success) {
    document.getElementById('inputFonnteToken').value = '';
    showToast(res.message, 'success');
    syncAdminFromServer();
  } else showToast(res.message || 'Gagal menyimpan token.', 'error');
}

async function saveNotifSettings() {
  const waAktif = document.getElementById('cfgWaAktif').checked;
  const emailAktif = document.getElementById('cfgEmailAktif').checked;
  if (IS_DEMO_MODE) {
    APP_STATE.notifConfig = { waAktif, emailAktif };
    saveLocalState();
    showToast('Saklar notifikasi berhasil disimpan.', 'success');
    return;
  }
  const res = await callApi('saveNotifConfig', { waAktif, emailAktif });
  if (res.success) showToast(res.message, 'success');
}

async function syncCrmContacts() {
  if (IS_DEMO_MODE) { showToast('CRM Kontak sudah tersinkronisasi (' + APP_STATE.crm.length + ' kontak).', 'success'); return; }
  const res = await callApi('sinkronCrm');
  if (res.success) { showToast('Sinkronisasi selesai: +' + res.data.inserted + ' kontak baru.', 'success'); syncAdminFromServer(); }
}

async function toggleCrmOptOut(kontakId) {
  if (IS_DEMO_MODE) {
    const c = APP_STATE.crm.find(x => x.KontakID === kontakId);
    if (c) c.OptOut = c.OptOut === 'YA' ? 'TIDAK' : 'YA';
    saveLocalState();
    renderAdminPanel();
    return;
  }
  const res = await callApi('toggleOptOutCrm', { kontakId });
  if (res.success) syncAdminFromServer();
}

async function submitBlastWa() {
  const judul = document.getElementById('blastJudul').value.trim();
  const pesan = document.getElementById('blastPesan').value.trim();
  const sasaran = document.getElementById('blastSasaran').value;
  const ukuranBatch = Number(document.getElementById('blastBatchSize').value || 20);
  if (!pesan) { showToast('Isi pesan blast wajib diisi.', 'warning'); return; }
  if (IS_DEMO_MODE) {
    const target = APP_STATE.crm.filter(c => c.OptOut !== 'YA' && (sasaran === 'Semua' || c.Segmen === sasaran));
    showToast('Blast "' + (judul || 'Pengumuman') + '" diantrekan non-blocking untuk ' + target.length + ' kontak (Batch ' + ukuranBatch + ').', 'success');
    document.getElementById('blastPesan').value = '';
    return;
  }
  const res = await callApi('buatBlastWa', { judul, pesan, sasaran, ukuranBatch });
  if (res.success) { showToast(res.message, 'success'); document.getElementById('blastPesan').value = ''; }
  else showToast(res.message || 'Gagal membuat blast WA.', 'error');
}

async function runMigration(dryRun) {
  const sourceUrl = document.getElementById('migrasiSourceUrl').value.trim();
  const box = document.getElementById('migrasiResultBox');
  if (!sourceUrl) { showToast('Masukkan ID atau URL Spreadsheet lama terlebih dahulu.', 'warning'); return; }
  if (IS_DEMO_MODE) {
    box.classList.remove('hidden');
    box.textContent = (dryRun ? '[DRY-RUN PINDAI] ' : '[DELTA-SYNC SELESAI] ') + 'USERS: +2 baru, 0 duplikat | PERMOHONAN_KUASA: +5 baru, 1 dilewati | BERKAS_UNGGAHAN: +5 baru.';
    showToast(dryRun ? 'Simulasi pindai migrasi selesai.' : 'Delta-Sync migrasi selesai.', 'success');
    return;
  }
  const res = await callApi('jalankanMigrasi', { sourceUrl, dryRun });
  if (res.success) {
    box.classList.remove('hidden');
    box.textContent = (dryRun ? '[DRY-RUN] ' : '[TEREKSEKUSI] ') + res.sourceName + ' -> ' + res.summary.map(s => `${s.target}: +${s.inserted} baru, ${s.updated} update, ${s.skipped} lewati`).join(' | ');
    showToast(dryRun ? 'Pindai selesai!' : 'Migrasi Delta-Sync berhasil!', 'success');
  } else {
    showToast(res.message || 'Migrasi gagal.', 'error');
  }
}

// =========================================================================
// 12. MODAL TANDA TERIMA RESMI (PRINT READY)
// =========================================================================

function openReceiptModal(permohonanId) {
  const item = APP_STATE.permohonan.find(p => p.permohonanId === permohonanId);
  if (!item || item.status !== 'Disetujui') {
    showToast('Tanda terima hanya dapat dicetak untuk permohonan berstatus Disetujui.', 'warning');
    return;
  }
  document.getElementById('rcptNomorRegister').textContent = 'NOMOR REGISTER RESMI: ' + item.nomorRegisterResmi;
  document.getElementById('rcptId').textContent = item.permohonanId;
  document.getElementById('rcptTglPengajuan').textContent = formatShortDate(item.tanggalPengajuan);
  document.getElementById('rcptTglVerif').textContent = formatShortDate(item.tanggalVerifikasi);
  document.getElementById('rcptKategori').textContent = item.kategoriKuasa;
  document.getElementById('rcptNama').textContent = item.namaPemohon;
  document.getElementById('rcptHash').textContent = 'SHA256: ' + (item.hashVerifikasi || 'VERIFIED-EKUASA').slice(0, 32) + '…';
  document.getElementById('rcptPetugas').textContent = item.petugasVerifikator || 'Siti Rahmawati, S.H.';

  const modal = document.getElementById('receiptModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeReceiptModal() {
  const modal = document.getElementById('receiptModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// =========================================================================
// 13. HELPERS & TOAST
// =========================================================================

let _toastTimer = null;
function showToast(msg, type = 'success') {
  const box = document.getElementById('toastBox');
  const icon = document.getElementById('toastIcon');
  const title = document.getElementById('toastTitle');
  const msgEl = document.getElementById('toastMsg');
  if (!box) return;

  const map = {
    success: { icon: 'check_circle', title: 'Berhasil', border: 'border-primary-container', color: 'text-primary-container' },
    error: { icon: 'error', title: 'Perhatian', border: 'border-error', color: 'text-error' },
    warning: { icon: 'warning', title: 'Peringatan', border: 'border-secondary-container', color: 'text-secondary' },
    info: { icon: 'info', title: 'Informasi', border: 'border-primary', color: 'text-primary' }
  };
  const cfg = map[type] || map.info;

  box.className = `fixed top-20 right-4 md:right-6 z-[70] flex items-center gap-3 bg-surface-container-lowest px-4 py-3 rounded-xl shadow-xl border-l-4 ${cfg.border} max-w-sm animate-fade-fast no-print`;
  icon.textContent = cfg.icon;
  icon.className = 'material-symbols-outlined ' + cfg.color;
  title.textContent = cfg.title;
  title.className = 'text-[11px] uppercase font-bold tracking-wider ' + cfg.color;
  msgEl.textContent = msg;

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(hideToast, 4000);
}

function hideToast() {
  document.getElementById('toastBox')?.classList.add('hidden');
}

function statusPillHtml(status) {
  if (status === 'Disetujui') {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>Disetujui</span>`;
  }
  if (status === 'Perlu Revisi') {
    return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-[#991B1B]"></span>Perlu Revisi</span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-[11px] font-bold"><span class="w-1.5 h-1.5 rounded-full bg-[#854D0E]"></span>Menunggu Verifikasi</span>`;
}

function normalizeHp08(raw) {
  let s = String(raw || '').replace(/[^\d]/g, '');
  if (!s) return '';
  if (s.startsWith('62')) s = '0' + s.slice(2);
  else if (s.startsWith('8')) s = '0' + s;
  return s;
}

function formatShortDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
  } catch (e) { return String(iso); }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// =========================================================================
// 14. INITIALIZATION ON DOM READY
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Delegated 0ms navigation click handler
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute('data-route'));
    }
  });

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (h && h !== CURRENT_ROUTE) navigateTo(h, false);
  });

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Initial route
  const initialHash = window.location.hash.replace('#', '');
  navigateTo(VALID_ROUTES.includes(initialHash) ? initialHash : 'portal-publik-dan-lacak', false);

  // Silent background sync if live GAS_URL configured
  if (!IS_DEMO_MODE && CURRENT_SESSION) {
    syncPermohonanFromServer();
    if (CURRENT_SESSION.user.role === 'Admin') syncAdminFromServer();
  }
});
