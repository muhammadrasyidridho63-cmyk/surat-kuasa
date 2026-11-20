/**
 * APLIKASI SURAT KUASA ONLINE PENGADILAN NEGERI
 * Client-Side SPA Controller & High-Performance State Engine
 * Mengimplementasikan prinsip:
 * - /gas-pro-api (REST API decoupled, no iframe, text/plain POST)
 * - /gas-scale-turbo (In-flight deduplication, SWR caching, instant 0ms switching)
 * - /gas-pwa-github (Offline-first caching, PWA installation)
 */

// =========================================================================
// 1. STATE MANAGEMENT & DEMO SEED DATA
// =========================================================================

const INITIAL_SUBMISSIONS = [
  {
    id: 'REG-202611-0082',
    timestamp: '2026-11-12T09:15:00.000Z',
    tanggal: '12 Nov 2026, 09:15 WIB',
    nomorRegister: 'W11-U1/242/HK.02/XI/2026',
    kategori: 'Advokat',
    status: 'Menunggu Pengesahan',
    pemberi: {
      nama: 'Bambang Sudarmono, S.T.',
      nik: '3174082209840002',
      pekerjaan: 'Wiraswasta / Direktur',
      telepon: '081298457721',
      email: 'bambang.sudarmono@gmail.com',
      alamat: 'Jl. Melati Indah No. 14, RT 03/05, Kebayoran Baru, Jakarta Selatan'
    },
    penerima: {
      nama: 'Dewi Kartika, S.H., M.H. & Partners',
      identitas: '16.0452/ADV-JKT',
      kantor: 'Kartika & Associates Law Office',
      telepon: '08119283771',
      alamat: 'Gedung Menara Batavia Lt. 12, Jl. KH Mas Mansyur Kav. 126, Jakarta Pusat'
    },
    materi: {
      jenisPerkara: 'Perdata Gugatan',
      nomorPerkara: '89/Pdt.G/2026/PN.Jkt.Pst',
      uraian: 'Mewakili, mendampingi, dan membela hak hukum Pemberi Kuasa dalam perkara gugatan Perbuatan Melawan Hukum (PMH) atas sengketa tanah dan bangunan di wilayah hukum Pengadilan Negeri.'
    },
    berkas: {
      ktp: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      kta: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
    },
    petugas: 'Ahmad Syafii, S.Kom. (Staf Meja 1 PTSP)',
    pejabat: 'Dr. H. Sulaiman, S.H., M.H. (Panitera Pengadilan Negeri)',
    catatanPetugas: 'Berkas KTP Prinsipal, Berita Acara Sumpah (BAS), dan KTA Peradi Pemohon telah diverifikasi valid dan memenuhi syarat PERMA. Dokumen diteruskan ke Panitera untuk pembubuhan Pengesahan Elektronik (TTE).',
    hashSha256: 'a8f4b23c91e56b8209dc47120fe817c0326e0802c61148e100f917208d7d91e0',
    totalBiaya: 20000
  },
  {
    id: 'REG-202611-0091',
    timestamp: '2026-11-14T10:15:00.000Z',
    tanggal: '14 Nov 2026, 10:15 WIB',
    nomorRegister: 'W11-U1/245/HK.02/XI/2026',
    kategori: 'Advokat',
    status: 'Menunggu Verifikasi',
    pemberi: {
      nama: 'Hendra Wijaya',
      nik: '3578201204880003',
      pekerjaan: 'Pengusaha',
      telepon: '081330998812',
      email: 'hendra.w@wjayagroup.id',
      alamat: 'Jl. Raya Darmo Permai III No. 8, Surabaya, Jawa Timur'
    },
    penerima: {
      nama: 'Aulia Rahma, S.H., M.H.',
      identitas: '14.02981/DPC PERADI Surabaya',
      kantor: 'Aulia Rahma & Co Advocates',
      telepon: '081234567890',
      alamat: 'Wisma Intiland Suite 502, Jl. Panglima Sudirman No. 101, Surabaya'
    },
    materi: {
      jenisPerkara: 'Perdata Gugatan',
      nomorPerkara: '112/Pdt.G/2026/PN',
      uraian: 'Mewakili kepentingan hukum Pemberi Kuasa dalam mediasi dan persidangan perkara wanprestasi perjanjian sewa beli alat berat.'
    },
    berkas: {
      ktp: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      kta: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
    },
    petugas: '',
    pejabat: 'Dr. H. Sulaiman, S.H., M.H.',
    catatanPetugas: '',
    hashSha256: 'f5e6d7c8b9a0123456789abcdef0123456789abcdef0123456789abcdef01234',
    totalBiaya: 20000
  },
  {
    id: 'REG-202611-0090',
    timestamp: '2026-11-14T09:40:00.000Z',
    tanggal: '14 Nov 2026, 09:40 WIB',
    nomorRegister: 'W11-U1/244/HK.02/XI/2026',
    kategori: 'Insidentil',
    status: 'Perlu Revisi',
    pemberi: {
      nama: 'Siti Aminah',
      nik: '3201085501720004',
      pekerjaan: 'Ibu Rumah Tangga',
      telepon: '085712349090',
      email: 'siti.aminah@gmail.com',
      alamat: 'Kp. Babakan Tengah RT 02/01, Cibinong, Bogor'
    },
    penerima: {
      nama: 'M. Rizky (Anak Kandung)',
      identitas: '3201081406980001',
      kantor: 'Kuasa Insidentil Keluarga',
      telepon: '085712349091',
      alamat: 'Kp. Babakan Tengah RT 02/01, Cibinong, Bogor'
    },
    materi: {
      jenisPerkara: 'Permohonan',
      nomorPerkara: '45/Pdt.P/2026/PN',
      uraian: 'Mengurus permohonan penetapan ahli waris dan pembetulan akta kelahiran anak di Pengadilan Negeri.'
    },
    berkas: {
      ktp: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      kta: ''
    },
    petugas: 'Ahmad Syafii, S.Kom.',
    pejabat: '',
    catatanPetugas: 'Lampiran Kartu Keluarga (KK) dan Surat Keterangan Hubungan Keluarga dari Kelurahan belum diunggah. Mohon lengkapi berkas insidentil.',
    hashSha256: '99887766554433221100aabbccddeeff99887766554433221100aabbccddeeff',
    totalBiaya: 20000
  },
  {
    id: 'REG-202611-0088',
    timestamp: '2026-11-14T08:55:00.000Z',
    tanggal: '14 Nov 2026, 08:55 WIB',
    nomorRegister: 'W11-U1/241/HK.02/XI/2026',
    kategori: 'Advokat',
    status: 'Disahkan/Terdaftar',
    pemberi: {
      nama: 'Ir. Suryo Pratomo',
      nik: '3175081905780003',
      pekerjaan: 'Direktur Utama',
      telepon: '081688992211',
      email: 'suryo.pratomo@ptkaryamandiri.co.id',
      alamat: 'Jl. Merdeka Barat No. 22, Gambir, Jakarta Pusat'
    },
    penerima: {
      nama: 'Denny Siregar, S.H., M.H.',
      identitas: '09.21841/PERADI',
      kantor: 'Kantor Advokat Denny Siregar & Rekan',
      telepon: '081299001122',
      alamat: 'Sudirman Tower Lt. 18, Jl. Jend. Sudirman Kav. 50, Jakarta Selatan'
    },
    materi: {
      jenisPerkara: 'Perdata Gugatan',
      nomorPerkara: '89/Pdt.G/2026/PN',
      uraian: 'Mewakili secara penuh untuk menghadiri persidangan, perdamaian/mediasi, mengajukan replik, kesimpulan, hingga upaya hukum banding.'
    },
    berkas: {
      ktp: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
      kta: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
    },
    petugas: 'Ahmad Syafii, S.Kom.',
    pejabat: 'Dr. H. Sulaiman, S.H., M.H.',
    tanggalPengesahan: '14 Nov 2026, 11:42 WIB',
    catatanPetugas: 'Berkas lengkap dan absah.',
    hashSha256: 'a8f4b23c91e56b8209dc47120fe817c0326e0802c61148e100f917208d7d91e0',
    totalBiaya: 20000
  }
];

// App Local Database Engine (LocalStorage-backed with SWR Cache)
const Storage = {
  KEY: 'esuratkuasa_db_v1',
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) {
        this.save(INITIAL_SUBMISSIONS);
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_SUBMISSIONS;
    }
  },
  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },
  add(item) {
    const list = this.load();
    list.unshift(item);
    this.save(list);
    return item;
  },
  update(id, patch) {
    const list = this.load();
    const idx = list.findIndex(x => x.id === id);
    if (idx > -1) {
      list[idx] = Object.assign({}, list[idx], patch);
      this.save(list);
      return list[idx];
    }
    return null;
  },
  findById(id) {
    const list = this.load();
    return list.find(x => x.id.toUpperCase() === id.toUpperCase());
  },
  findByPhoneOrId(query) {
    const list = this.load();
    const q = query.trim().toUpperCase();
    return list.find(x => {
      const matchId = x.id.toUpperCase() === q;
      const matchPhone1 = x.pemberi && x.pemberi.telepon && x.pemberi.telepon.includes(q);
      const matchPhone2 = x.penerima && x.penerima.telepon && x.penerima.telepon.includes(q);
      return matchId || matchPhone1 || matchPhone2;
    });
  }
};

// =========================================================================
// 2. NETWORK & GAS REST API ADAPTER (Pola /gas-pro-api & /gas-scale-turbo)
// =========================================================================

const _inflight = {};
let _writeEpoch = 0;

async function gasApi(action, data = {}) {
  // Jika URL GAS belum disetel, gunakan Local Database (0ms offline mode)
  if (IS_DEMO_MODE) {
    await new Promise(r => setTimeout(r, 120)); // Simulasi micro-delay responsif
    return handleDemoLocalApi(action, data);
  }

  // Deduplikasi in-flight requests untuk operasi GET/read
  const isRead = /^(get|list|fetch|track|verify)/i.test(action);
  if (!isRead) {
    _writeEpoch++;
  } else {
    const cacheKey = `${_writeEpoch}|${action}|${JSON.stringify(data)}`;
    if (_inflight[cacheKey]) return _inflight[cacheKey];
  }

  const promise = (async () => {
    try {
      const res = await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // WAJIB text/plain agar bebas CORS
        body: JSON.stringify({ action, data })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('GAS Network failed, falling back to local cache:', err);
      return handleDemoLocalApi(action, data);
    }
  })();

  if (isRead) {
    const cacheKey = `${_writeEpoch}|${action}|${JSON.stringify(data)}`;
    _inflight[cacheKey] = promise;
    promise.then(() => delete _inflight[cacheKey], () => delete _inflight[cacheKey]);
  }

  return promise;
}

function handleDemoLocalApi(action, data) {
  switch (action) {
    case 'getSubmissions':
    case 'listPengajuan':
      return { success: true, data: Storage.load() };
    case 'trackPengajuan':
      const found = Storage.findByPhoneOrId(data.query || '');
      return found ? { success: true, data: found } : { success: false, message: 'Nomor Registrasi atau Telepon tidak ditemukan.' };
    case 'daftarSuratKuasa':
      const newItem = Storage.add(data);
      return { success: true, data: newItem, message: 'Pendaftaran E-Surat Kuasa berhasil terkirim!' };
    case 'updateStatus':
      const updated = Storage.update(data.id, data.patch);
      return { success: true, data: updated, message: 'Status pengajuan berhasil diperbarui.' };
    case 'sahkanDokumen':
      const approved = Storage.update(data.id, {
        status: 'Disahkan/Terdaftar',
        nomorRegister: data.nomorRegister || `W11-U1/${Math.floor(Math.random() * 800 + 200)}/HK.02/XI/2026`,
        tanggalPengesahan: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        pejabat: 'Dr. H. Sulaiman, S.H., M.H.',
        hashSha256: generateMockSha256()
      });
      return { success: true, data: approved, message: 'Surat Kuasa Resmi berhasil disahkan dan ber-QR code aktif!' };
    default:
      return { success: true, data: Storage.load() };
  }
}

function generateMockSha256() {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 64; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// =========================================================================
// 2.5. APARATUR AUTHENTICATION & SESSION MANAGEMENT
// =========================================================================

const DEFAULT_USERS = {
  admin: {
    userId: 'USR-01',
    username: 'admin',
    password: 'admin123',
    nama: 'Administrator IT Pengadilan',
    nip: '19850101 201001 1 001',
    jabatan: 'Pranata Komputer Ahli',
    role: 'ADMIN'
  },
  petugas1: {
    userId: 'USR-02',
    username: 'petugas1',
    password: 'petugas123',
    nama: 'Ahmad Syafii, S.Kom.',
    nip: '19920315 201602 1 003',
    jabatan: 'Staf Meja 1 PTSP Perdata',
    role: 'PETUGAS'
  },
  panitera: {
    userId: 'USR-03',
    username: 'panitera',
    password: 'panitera123',
    nama: 'Dr. H. Sulaiman, S.H., M.H.',
    nip: '19740512 199903 1 002',
    jabatan: 'Panitera Pengadilan Negeri',
    role: 'PEJABAT'
  }
};

let currentUser = null;
let redirectAfterLogin = null;

function initAuth() {
  try {
    const saved = localStorage.getItem('court_active_user');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Gagal memuat sesi akun:', e);
  }
  updateAuthUI();
}

function updateAuthUI() {
  const loggedOutNav = document.getElementById('navLoggedOutArea');
  const loggedInNav = document.getElementById('navLoggedInArea');
  const drawerLoggedOut = document.getElementById('mobileDrawerLoggedOut');
  const drawerLoggedIn = document.getElementById('mobileDrawerLoggedIn');
  const drawerLogoutWrapper = document.getElementById('mobileDrawerLogoutWrapper');

  if (currentUser) {
    if (loggedOutNav) loggedOutNav.classList.add('hidden');
    if (loggedInNav) loggedInNav.classList.remove('hidden');

    const navAdmin = document.getElementById('navAdminLink');
    if (navAdmin) navAdmin.classList.remove('hidden');

    const drawerAdmin = document.getElementById('drawerAdminSection');
    if (drawerAdmin) drawerAdmin.classList.remove('hidden');

    const navName = document.getElementById('navUserName');
    const navRole = document.getElementById('navUserRole');
    if (navName) navName.textContent = currentUser.nama.split(',')[0];
    if (navRole) navRole.textContent = `${currentUser.role} • NIP. ${currentUser.nip.slice(0, 8)}...`;

    const dropFullName = document.getElementById('dropdownFullName');
    const dropNip = document.getElementById('dropdownNip');
    const dropRole = document.getElementById('dropdownRoleBadge');
    if (dropFullName) dropFullName.textContent = currentUser.nama;
    if (dropNip) dropNip.textContent = `NIP. ${currentUser.nip}`;
    if (dropRole) dropRole.textContent = currentUser.role;

    if (drawerLoggedOut) drawerLoggedOut.classList.add('hidden');
    if (drawerLoggedIn) drawerLoggedIn.classList.remove('hidden');
    if (drawerLogoutWrapper) drawerLogoutWrapper.classList.remove('hidden');

    const mName = document.getElementById('mobileDrawerUserName');
    const mRole = document.getElementById('mobileDrawerUserRole');
    if (mName) mName.textContent = currentUser.nama;
    if (mRole) mRole.textContent = `${currentUser.role} • ${currentUser.jabatan}`;
  } else {
    if (loggedOutNav) loggedOutNav.classList.remove('hidden');
    if (loggedInNav) loggedInNav.classList.add('hidden');

    const navAdmin = document.getElementById('navAdminLink');
    if (navAdmin) navAdmin.classList.add('hidden');

    const drawerAdmin = document.getElementById('drawerAdminSection');
    if (drawerAdmin) drawerAdmin.classList.add('hidden');

    if (drawerLoggedOut) drawerLoggedOut.classList.remove('hidden');
    if (drawerLoggedIn) drawerLoggedIn.classList.add('hidden');
    if (drawerLogoutWrapper) drawerLogoutWrapper.classList.add('hidden');

    toggleUserDropdown(false);
  }
}

function toggleUserDropdown(force) {
  const menu = document.getElementById('userDropdownMenu');
  if (!menu) return;
  if (typeof force === 'boolean') {
    if (force) menu.classList.remove('hidden');
    else menu.classList.add('hidden');
  } else {
    menu.classList.toggle('hidden');
  }
}

// Tutup dropdown jika klik di luar
document.addEventListener('click', (e) => {
  const btn = document.getElementById('btnUserMenu');
  const menu = document.getElementById('userDropdownMenu');
  if (menu && !menu.classList.contains('hidden')) {
    if (btn && !btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  }
});

function openLoginModal(noticeMessage = '') {
  const modal = document.getElementById('loginModal');
  const banner = document.getElementById('loginNoticeBanner');
  const bannerText = document.getElementById('loginNoticeText');
  const errBox = document.getElementById('loginErrorBox');

  if (errBox) errBox.classList.add('hidden');

  if (banner && bannerText) {
    if (noticeMessage) {
      bannerText.textContent = noticeMessage;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  if (modal) {
    modal.classList.remove('hidden');
    const uInput = document.getElementById('loginUsername');
    if (uInput) setTimeout(() => uInput.focus(), 100);
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
  const banner = document.getElementById('loginNoticeBanner');
  if (banner) banner.classList.add('hidden');
}

function selectQuickUser(roleKey) {
  const uInput = document.getElementById('loginUsername');
  const pInput = document.getElementById('loginPassword');
  const errBox = document.getElementById('loginErrorBox');
  if (errBox) errBox.classList.add('hidden');

  const preset = DEFAULT_USERS[roleKey];
  if (preset && uInput && pInput) {
    uInput.value = preset.username;
    pInput.value = preset.password;
    showToast(`Akun ${preset.role} (${preset.username}) dipilih. Klik Masuk.`, 'info');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  const icon = btn.querySelector('.material-symbols-outlined');
  if (icon) {
    icon.textContent = isPass ? 'visibility_off' : 'visibility';
  }
}

async function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  const u = (document.getElementById('loginUsername')?.value || '').trim().toLowerCase();
  const p = (document.getElementById('loginPassword')?.value || '').trim();
  const errBox = document.getElementById('loginErrorBox');
  const errMsg = document.getElementById('loginErrorMsg');
  const submitBtn = document.getElementById('btnLoginSubmit');

  if (!u || !p) {
    if (errBox && errMsg) {
      errMsg.textContent = 'Username dan kata sandi wajib diisi.';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span><span>Memverifikasi...</span>';
  }

  let matchedUser = DEFAULT_USERS[u];
  if (!matchedUser && u === 'petugas') {
    matchedUser = DEFAULT_USERS['petugas1'];
  }

  let isVerified = false;

  // Verifikasi ke server GAS jika online
  if (typeof CONFIG !== 'undefined' && CONFIG.GAS_URL && !CONFIG.DEMO_MODE) {
    try {
      const res = await callGasApi('login', { username: u, password: p });
      if (res && res.success && res.user) {
        matchedUser = res.user;
        isVerified = true;
      } else if (res && !res.success) {
        if (errBox && errMsg) {
          errMsg.textContent = res.message || 'Kredensial login tidak cocok.';
          errBox.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg">login</span><span>Masuk ke Sistem</span>';
        }
        return;
      }
    } catch (errApi) {
      console.warn('API login offline, menggunakan verifikasi lokal:', errApi);
    }
  }

  // Verifikasi password lokal (offline / demo)
  if (!isVerified) {
    if (matchedUser && matchedUser.password === p) {
      isVerified = true;
    }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg">login</span><span>Masuk ke Sistem</span>';
  }

  if (isVerified && matchedUser) {
    currentUser = {
      userId: matchedUser.userId,
      username: matchedUser.username,
      nama: matchedUser.nama,
      nip: matchedUser.nip,
      jabatan: matchedUser.jabatan,
      role: matchedUser.role,
      token: 'SESSION-' + Date.now()
    };
    localStorage.setItem('court_active_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeLoginModal();
    showToast(`Berhasil masuk! Selamat datang, ${currentUser.nama}.`, 'success');

    // Alihkan ke halaman yang dituju sebelumnya jika ada
    if (redirectAfterLogin) {
      const target = redirectAfterLogin;
      redirectAfterLogin = null;
      navigateTo(target);
    } else {
      if (currentUser.role === 'ADMIN') navigateTo('dashboard-admin');
      else if (currentUser.role === 'PETUGAS') navigateTo('meja-verifikator');
      else if (currentUser.role === 'PEJABAT') navigateTo('meja-pengesahan');
      else navigateTo('beranda-dan-lacak');
    }
  } else {
    if (errBox && errMsg) {
      errMsg.textContent = 'Username atau kata sandi tidak cocok. Silakan gunakan tombol akun demo di atas.';
      errBox.classList.remove('hidden');
    }
  }
}

function handleLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari sesi aparatur pengadilan?')) {
    currentUser = null;
    localStorage.removeItem('court_active_user');
    updateAuthUI();
    showToast('Sesi Anda telah diakhiri.', 'info');

    const internalViews = ['meja-verifikator', 'meja-pengesahan', 'dashboard-admin'];
    if (internalViews.includes(currentView)) {
      navigateTo('beranda-dan-lacak');
    }
  }
}

// =========================================================================
// 3. SPA ROUTER & VIEW SWITCHER (0ms INSTANT NAVIGATION)
// =========================================================================

const VALID_VIEWS = [
  'beranda-dan-lacak',
  'pendaftaran-kuasa',
  'meja-verifikator',
  'meja-pengesahan',
  'dashboard-admin',
  'validasi-qr-dokumen'
];

const PROTECTED_VIEWS = [
  'meja-verifikator',
  'meja-pengesahan',
  'dashboard-admin'
];

let currentView = 'beranda-dan-lacak';
let currentAdminTab = 'analitik';

function switchAdminTab(tabName) {
  const tabs = ['analitik', 'verifikator', 'pengesahan'];
  if (!tabs.includes(tabName)) tabName = 'analitik';
  currentAdminTab = tabName;

  // Toggle visual pane
  tabs.forEach(t => {
    const pane = document.getElementById(
      t === 'analitik' ? 'adminPaneAnalitik' : (t === 'verifikator' ? 'adminPaneVerifikator' : 'adminPanePengesahan')
    );
    const btn = document.getElementById(
      t === 'analitik' ? 'tabBtnAnalitik' : (t === 'verifikator' ? 'tabBtnVerifikator' : 'tabBtnPengesahan')
    );
    if (pane) {
      if (t === tabName) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (btn) {
      if (t === tabName) {
        btn.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary text-on-primary shadow-sm transition-all cursor-pointer flex-shrink-0';
      } else {
        btn.className = 'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-surface-container-low text-on-surface hover:bg-surface-container transition-all cursor-pointer flex-shrink-0';
      }
    }
  });

  // Update badge counter di tab
  try {
    const list = Storage.load();
    const pendingVerif = list.filter(x => x.status === 'Menunggu Verifikasi').length;
    const pendingSah = list.filter(x => x.status === 'Menunggu Pengesahan').length;
    const bVerif = document.getElementById('tabBadgeVerif');
    const bSah = document.getElementById('tabBadgeSah');
    if (bVerif) bVerif.textContent = pendingVerif;
    if (bSah) bSah.textContent = pendingSah;
  } catch (e) {}

  // Jalankan lifecycle data per tab
  if (tabName === 'analitik') {
    renderAdminDashboard();
  } else if (tabName === 'verifikator') {
    renderVerifikatorTable();
  } else if (tabName === 'pengesahan') {
    renderPengesahanQueue();
  }
}

function navigateTo(viewId, triggerHistory = true) {
  if (!VALID_VIEWS.includes(viewId)) {
    viewId = 'beranda-dan-lacak';
  }

  // Route Guard: Proteksi akses area kerja internal pengadilan
  if (PROTECTED_VIEWS.includes(viewId) && !currentUser) {
    redirectAfterLogin = viewId;
    const viewLabels = {
      'dashboard-admin': 'Dashboard Admin',
      'meja-verifikator': 'Meja Verifikator PTSP',
      'meja-pengesahan': 'Meja Pengesahan Panitera'
    };
    openLoginModal('Akses ' + (viewLabels[viewId] || 'menu ini') + ' memerlukan login akun aparatur pengadilan.');
    return;
  }

  // Meja Verifikator & Meja Pengesahan terintegrasi ke dalam Dashboard Admin
  if (viewId === 'meja-verifikator') {
    navigateTo('dashboard-admin', triggerHistory);
    switchAdminTab('verifikator');
    return;
  }
  if (viewId === 'meja-pengesahan') {
    navigateTo('dashboard-admin', triggerHistory);
    switchAdminTab('pengesahan');
    return;
  }

  currentView = viewId;

  // Sembunyikan semua views
  VALID_VIEWS.forEach(id => {
    const el = document.getElementById(`view-${id}`);
    if (el) el.classList.add('hidden');
  });

  // Tampilkan active view
  const activeEl = document.getElementById(`view-${viewId}`);
  if (activeEl) {
    activeEl.classList.remove('hidden');
    activeEl.classList.add('animate-fade-in');
  }

  // Update navbar links active styling
  document.querySelectorAll('[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === viewId) {
      link.classList.add('text-secondary-container', 'font-semibold');
      link.classList.remove('text-on-primary-container');
    } else {
      link.classList.remove('text-secondary-container', 'font-semibold');
      link.classList.add('text-on-primary-container');
    }
  });

  // Update sidebar links active styling (untuk meja kerja internal)
  document.querySelectorAll('aside nav a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === viewId) {
      link.classList.add('bg-primary-container', 'text-on-primary', 'font-semibold', 'shadow-sm');
      link.classList.remove('text-on-surface-variant');
    } else {
      link.classList.remove('bg-primary-container', 'text-on-primary', 'font-semibold', 'shadow-sm');
      link.classList.add('text-on-surface-variant');
    }
  });

  // Set URL hash
  if (triggerHistory && window.location.hash.slice(1) !== viewId) {
    window.location.hash = viewId;
  }

  // Jalankan lifecycle hook per view
  onViewActivated(viewId);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function onViewActivated(viewId) {
  switch (viewId) {
    case 'beranda-dan-lacak':
      break;
    case 'pendaftaran-kuasa':
      break;
    case 'dashboard-admin':
      switchAdminTab(currentAdminTab || 'analitik');
      break;
    case 'validasi-qr-dokumen':
      renderQrValidationPage();
      break;
  }
}

// Inisialisasi Event Listener Routing
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && VALID_VIEWS.includes(hash)) {
    navigateTo(hash, false);
  }
});

// Toggle Mobile Navigation Drawer
function toggleMobileMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  const drawer = document.getElementById('mobileMenuDrawer');
  if (overlay && drawer) {
    const isHidden = overlay.classList.contains('hidden');
    if (isHidden) {
      overlay.classList.remove('hidden');
      drawer.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
      drawer.classList.add('hidden');
    }
  }
}

// =========================================================================
// 4. TOAST NOTIFICATIONS & MODALS
// =========================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-primary text-on-primary border-primary-fixed-dim',
    error: 'bg-error text-on-error border-error-container',
    warning: 'bg-secondary text-on-secondary border-secondary-container',
    info: 'bg-surface-container-high text-on-surface border-surface-container-highest'
  };
  const icons = {
    success: 'check_circle',
    error: 'cancel',
    warning: 'warning',
    info: 'info'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-fade-in ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-xl">${icons[type] || 'info'}</span>
    <span class="flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100 transition-opacity">
      <span class="material-symbols-outlined text-lg">close</span>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// =========================================================================
// 5. MODUL 1: BERANDA & LACAK MANDIRI
// =========================================================================

function initTracking() {
  const form = document.getElementById('trackingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('regIdInput').value.trim();
    if (!query) {
      showToast('Masukkan Nomor Registrasi atau Nomor WhatsApp.', 'warning');
      return;
    }

    const res = await gasApi('trackPengajuan', { query });
    const resultBox = document.getElementById('searchResultBox');
    if (!resultBox) return;

    if (res.success && res.data) {
      renderTrackingResult(res.data);
      resultBox.classList.remove('hidden');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      showToast(res.message || 'Data pendaftaran tidak ditemukan.', 'error');
    }
  });
}

function renderTrackingResult(item) {
  const box = document.getElementById('searchResultBox');
  if (!box) return;

  // Status mapping ke 4 tahapan alur
  const steps = [
    { title: '1. Pengajuan Masuk', desc: 'Formulir & dokumen kuasa berhasil diunggah secara daring.', time: item.tanggal || '12 Nov, 09:15' },
    { title: '2. Verifikasi PTSP', desc: 'Pemeriksaan kelengkapan KTP, BAS, & validitas meterai.', time: item.status !== 'Menunggu Verifikasi' ? '12 Nov, 11:20' : 'Sedang diverifikasi' },
    { title: '3. Pengesahan Pejabat', desc: 'Pemeriksaan substantif dan tanda tangan digital oleh Panitera.', time: item.status === 'Disahkan/Terdaftar' ? '12 Nov, 14:00' : 'Menunggu antrean TTE' },
    { title: '4. Akta Terdaftar & QR', desc: 'Penerbitan akta registrasi resmi dengan QR verifikasi publik.', time: item.status === 'Disahkan/Terdaftar' ? 'Selesai & Aktif' : 'Estimasi 1-2 Jam' }
  ];

  let currentStepIdx = 0;
  if (item.status === 'Menunggu Verifikasi') currentStepIdx = 1;
  else if (item.status === 'Perlu Revisi') currentStepIdx = 1;
  else if (item.status === 'Menunggu Pengesahan') currentStepIdx = 2;
  else if (item.status === 'Disahkan/Terdaftar') currentStepIdx = 4;

  box.innerHTML = `
    <div class="p-space-lg rounded-xl bg-surface-container-lowest shadow-md border border-surface-container relative">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-container text-secondary-container flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-headline-sm text-headline-sm font-bold text-on-surface">${item.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}">${item.status}</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Kategori: Surat Kuasa ${item.kategori} • Terdaftar pada ${item.tanggal}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="downloadTandaTerima('${item.id}')" class="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 transition-colors">
            <span class="material-symbols-outlined text-lg">download</span>
            <span>Tanda Terima</span>
          </button>
          <a href="https://wa.me/${CONFIG.PTSP_WHATSAPP}?text=Halo%20PTSP,%20saya%20ingin%20menanyakan%20status%20Surat%20Kuasa%20${item.id}" target="_blank" class="px-3.5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 hover:bg-primary-container transition-colors">
            <span class="material-symbols-outlined text-lg">support_agent</span>
            <span>Bantuan WA PTSP</span>
          </a>
        </div>
      </div>

      <!-- Ringkasan Pihak -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-surface-container">
        <div class="p-3 rounded-lg bg-surface-container-low">
          <span class="block text-xs uppercase font-bold text-outline">Pemberi Kuasa (Prinsipal)</span>
          <span class="font-semibold text-on-surface">${item.pemberi.nama}</span>
          <p class="text-xs text-on-surface-variant">NIK: ${maskNik(item.pemberi.nik)} • ${item.pemberi.alamat}</p>
        </div>
        <div class="p-3 rounded-lg bg-surface-container-low">
          <span class="block text-xs uppercase font-bold text-outline">Penerima Kuasa (Advokat/Keluarga)</span>
          <span class="font-semibold text-on-surface">${item.penerima.nama}</span>
          <p class="text-xs text-on-surface-variant">ID/KTA: ${item.penerima.identitas} • ${item.penerima.kantor}</p>
        </div>
      </div>

      <!-- 4 Langkah Alur Pengesahan -->
      <div class="py-6">
        <h4 class="font-label-lg text-label-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-lg">timeline</span>
          Progres Alur Pengesahan Dokumen
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${steps.map((st, i) => {
            const isDone = i < currentStepIdx;
            const isCurrent = i === currentStepIdx;
            return `
              <div class="p-3 rounded-xl border ${isDone ? 'bg-primary-container/10 border-primary/30 text-primary' : isCurrent ? 'bg-secondary-container/20 border-secondary text-secondary' : 'bg-surface-container-low/50 border-surface-container text-outline'}">
                <div class="flex items-center justify-between mb-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-primary text-on-primary' : isCurrent ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high text-on-surface-variant'}">
                    ${isDone ? '<span class="material-symbols-outlined text-sm">check</span>' : i + 1}
                  </div>
                  <span class="text-[11px] font-medium opacity-80">${st.time}</span>
                </div>
                <h5 class="font-semibold text-sm leading-tight">${st.title}</h5>
                <p class="text-xs text-on-surface-variant mt-1 leading-normal">${st.desc}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Catatan Petugas / Status Info -->
      ${item.catatanPetugas ? `
        <div class="p-4 rounded-xl ${item.status === 'Perlu Revisi' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface'} flex items-start gap-3">
          <span class="material-symbols-outlined text-xl mt-0.5">${item.status === 'Perlu Revisi' ? 'error' : 'info'}</span>
          <div>
            <h6 class="font-bold text-sm">Catatan Petugas Pemeriksa [${item.petugas || 'PTSP Perdata'}]:</h6>
            <p class="text-sm mt-0.5">${item.catatanPetugas}</p>
          </div>
        </div>
      ` : ''}

      ${item.status === 'Disahkan/Terdaftar' ? `
        <div class="mt-4 p-4 rounded-xl bg-primary-container text-on-primary flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-3xl text-secondary-container">verified_user</span>
            <div>
              <h5 class="font-bold text-base">Surat Kuasa Resmi Telah Disahkan!</h5>
              <p class="text-xs text-primary-fixed-dim">Nomor Register: ${item.nomorRegister} • Dilengkapi QR Code HMAC Keaslian.</p>
            </div>
          </div>
          <button onclick="openCertificateModal('${item.id}')" class="px-4 py-2.5 rounded-lg bg-secondary text-on-secondary font-semibold text-sm hover:bg-secondary-fixed transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">visibility</span>
            <span>Buka Lembar Akta PDF</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// =========================================================================
// 6. MODUL 2: MULTI-STEP REGISTRATION WIZARD (FORM MANDIRI)
// =========================================================================

let wizardStep = 1;
const wizardData = {
  kategori: 'Advokat',
  pemberi: {},
  penerima: {},
  materi: {},
  berkas: { ktp: '', kta: '' }
};

function setWizardCategory(cat) {
  wizardData.kategori = cat;
  const btnAdvokat = document.getElementById('btnCatAdvokat');
  const btnInsidentil = document.getElementById('btnCatInsidentil');
  const labelKta = document.getElementById('labelKtaField');

  if (cat === 'Advokat') {
    if (btnAdvokat) btnAdvokat.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-on-primary shadow-sm transition-all';
    if (btnInsidentil) btnInsidentil.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all';
    if (labelKta) labelKta.textContent = 'Nomor KTA Advokat *';
  } else {
    if (btnAdvokat) btnAdvokat.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all';
    if (btnInsidentil) btnInsidentil.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold bg-secondary text-on-secondary shadow-sm transition-all';
    if (labelKta) labelKta.textContent = 'Nomor NIK Penerima Kuasa Insidentil *';
  }
}

function goWizardStep(step) {
  // Validasi langkah sebelum lanjut
  if (step > wizardStep) {
    if (wizardStep === 1 && !validateWizardStep1()) return;
    if (wizardStep === 2 && !validateWizardStep2()) return;
    if (wizardStep === 3 && !validateWizardStep3()) return;
  }

  wizardStep = step;

  // Toggle view langkah
  for (let i = 1; i <= 4; i++) {
    const pane = document.getElementById(`wizardStepPane${i}`);
    if (pane) {
      if (i === step) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
  }

  // Update stepper indicator header
  updateWizardStepperUI(step);

  // Jika langkah 4, render preview ringkasan
  if (step === 4) {
    renderWizardStep4Review();
  }

  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function updateWizardStepperUI(step) {
  const progressBar = document.getElementById('wizardProgressBar');
  if (progressBar) {
    const percentages = { 1: '25%', 2: '50%', 3: '75%', 4: '100%' };
    progressBar.style.width = percentages[step] || '25%';
  }

  for (let i = 1; i <= 4; i++) {
    const stepBadge = document.getElementById(`stepBadge${i}`);
    if (stepBadge) {
      if (i < step) {
        stepBadge.className = 'w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shadow-sm';
        stepBadge.innerHTML = '<span class="material-symbols-outlined text-lg">check</span>';
      } else if (i === step) {
        stepBadge.className = 'w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-sm font-bold shadow-md ring-4 ring-secondary-container/40';
        stepBadge.textContent = `0${i}`;
      } else {
        stepBadge.className = 'w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center text-sm font-bold';
        stepBadge.textContent = `0${i}`;
      }
    }
  }
}

function validateWizardStep1() {
  const nama = document.getElementById('wzNamaPemberi').value.trim();
  const nik = document.getElementById('wzNikPemberi').value.trim();
  const wa = document.getElementById('wzWaPemberi').value.trim();
  const alamat = document.getElementById('wzAlamatPemberi').value.trim();

  if (!nama || !nik || !wa || !alamat) {
    showToast('Harap lengkapi semua kolom identitas pemberi kuasa.', 'warning');
    return false;
  }
  if (nik.length < 16) {
    showToast('Nomor NIK harus 16 digit.', 'warning');
    return false;
  }

  wizardData.pemberi = {
    nama,
    nik,
    pekerjaan: document.getElementById('wzPekerjaanPemberi').value.trim() || 'Wiraswasta',
    telepon: wa,
    email: document.getElementById('wzEmailPemberi').value.trim() || `${nik}@mail.com`,
    alamat
  };
  return true;
}

function validateWizardStep2() {
  const nama = document.getElementById('wzNamaPenerima').value.trim();
  const kta = document.getElementById('wzKtaPenerima').value.trim();
  const kantor = document.getElementById('wzKantorPenerima').value.trim();
  const alamat = document.getElementById('wzAlamatPenerima').value.trim();

  if (!nama || !kta) {
    showToast('Harap isi Nama dan Nomor KTA/Identitas Penerima Kuasa.', 'warning');
    return false;
  }

  wizardData.penerima = {
    nama,
    identitas: kta,
    kantor: kantor || 'Kantor Advokat / Mandiri',
    telepon: document.getElementById('wzWaPenerima').value.trim() || wizardData.pemberi.telepon,
    alamat: alamat || wizardData.pemberi.alamat
  };

  // Pastikan berkas diisi atau gunakan mock jika demo
  if (!wizardData.berkas.ktp) {
    wizardData.berkas.ktp = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
  }
  if (!wizardData.berkas.kta) {
    wizardData.berkas.kta = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
  }

  return true;
}

function validateWizardStep3() {
  const jenis = document.getElementById('wzJenisPerkara').value;
  const noPerkara = document.getElementById('wzNoPerkara').value.trim();
  const uraian = document.getElementById('wzUraianKuasa').value.trim();

  if (!uraian) {
    showToast('Harap uraikan keperluan dan ruang lingkup kuasa.', 'warning');
    return false;
  }

  wizardData.materi = {
    jenisPerkara: jenis,
    nomorPerkara: noPerkara || 'Belum Terdaftar (Perkara Baru)',
    uraian
  };
  return true;
}

function renderWizardStep4Review() {
  const container = document.getElementById('wizardStep4Summary');
  if (!container) return;

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 rounded-xl bg-surface-container-low border border-surface-container">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-sm text-label-sm uppercase font-bold text-outline">Identitas Pemberi Kuasa</span>
          <button onclick="goWizardStep(1)" class="text-xs text-primary font-semibold hover:underline">Ubah</button>
        </div>
        <p class="font-bold text-on-surface">${wizardData.pemberi.nama}</p>
        <p class="text-xs text-on-surface-variant">NIK: ${wizardData.pemberi.nik}</p>
        <p class="text-xs text-on-surface-variant">WhatsApp: ${wizardData.pemberi.telepon}</p>
        <p class="text-xs text-on-surface-variant mt-1">${wizardData.pemberi.alamat}</p>
      </div>

      <div class="p-4 rounded-xl bg-surface-container-low border border-surface-container">
        <div class="flex items-center justify-between mb-2">
          <span class="font-label-sm text-label-sm uppercase font-bold text-outline">Identitas Penerima Kuasa (${wizardData.kategori})</span>
          <button onclick="goWizardStep(2)" class="text-xs text-primary font-semibold hover:underline">Ubah</button>
        </div>
        <p class="font-bold text-on-surface">${wizardData.penerima.nama}</p>
        <p class="text-xs text-on-surface-variant">KTA/ID: ${wizardData.penerima.identitas}</p>
        <p class="text-xs text-on-surface-variant">${wizardData.penerima.kantor}</p>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-surface-container-low border border-surface-container">
      <div class="flex items-center justify-between mb-2">
        <span class="font-label-sm text-label-sm uppercase font-bold text-outline">Perihal & Ruang Lingkup Kuasa</span>
        <button onclick="goWizardStep(3)" class="text-xs text-primary font-semibold hover:underline">Ubah</button>
      </div>
      <p class="text-xs font-semibold text-primary">Klasifikasi: ${wizardData.materi.jenisPerkara} • No. Perkara: ${wizardData.materi.nomorPerkara}</p>
      <p class="text-xs text-on-surface-variant mt-1">${wizardData.materi.uraian}</p>
    </div>
  `;
}

// Client-Side Image Compression (Pola /gas-scale-turbo)
function handleFileUpload(input, type) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Kompresi via HTML5 Canvas ke resolusi ramah payload (~800px max, 0.7 quality)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
      wizardData.berkas[type] = compressedBase64;

      const badge = document.getElementById(`uploadBadge_${type}`);
      if (badge) {
        badge.innerHTML = `<span class="material-symbols-outlined text-xs">check_circle</span> Terunggah (~${Math.round(compressedBase64.length / 1024)} KB)`;
        badge.className = 'px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold flex items-center gap-1';
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function submitWizardRegistration() {
  const agree = document.getElementById('wzAgreeCheck');
  if (agree && !agree.checked) {
    showToast('Silakan centang pernyataan kebenaran data terlebih dahulu.', 'warning');
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitWizard');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span> Mengirim Permohonan...';
  }

  // Buat ID baru
  const newId = `REG-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000 + 1000))}`;
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB';

  const payload = {
    id: newId,
    timestamp: new Date().toISOString(),
    tanggal: nowStr,
    nomorRegister: 'Dalam Proses Verifikasi',
    kategori: wizardData.kategori,
    status: 'Menunggu Verifikasi',
    pemberi: wizardData.pemberi,
    penerima: wizardData.penerima,
    materi: wizardData.materi,
    berkas: wizardData.berkas,
    petugas: '',
    pejabat: '',
    catatanPetugas: '',
    hashSha256: generateMockSha256(),
    totalBiaya: 20000
  };

  const res = await gasApi('daftarSuratKuasa', payload);

  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Kirim Permohonan Pendaftaran <span class="material-symbols-outlined text-lg">arrow_forward</span>';
  }

  if (res.success) {
    // Tampilkan modal sukses
    openSuccessModal(newId);
  } else {
    showToast(res.message || 'Gagal mengirim pendaftaran.', 'error');
  }
}

function openSuccessModal(regId) {
  const modal = document.getElementById('successRegisterModal');
  const codeEl = document.getElementById('successRegCode');
  if (codeEl) codeEl.textContent = regId;
  if (modal) modal.classList.remove('hidden');
}

function closeSuccessModal() {
  const modal = document.getElementById('successRegisterModal');
  if (modal) modal.classList.add('hidden');
  // Kembali ke beranda dan lacak langsung
  navigateTo('beranda-dan-lacak');
}

// =========================================================================
// 7. MODUL 3: MEJA VERIFIKATOR (STAF PTSP KEPANITERAAN HUKUM)
// =========================================================================

let verifikatorFilter = 'Semua';

function setVerifikatorFilter(filter) {
  verifikatorFilter = filter;
  renderVerifikatorTable();
}

function renderVerifikatorTable() {
  const tableBody = document.getElementById('verifikatorTableBody');
  if (!tableBody) return;

  const list = Storage.load();

  // Hitung KPI
  const countTotal = list.length;
  const countMenunggu = list.filter(x => x.status === 'Menunggu Verifikasi').length;
  const countRevisi = list.filter(x => x.status === 'Perlu Revisi').length;
  const countPejabat = list.filter(x => x.status === 'Menunggu Pengesahan' || x.status === 'Disahkan/Terdaftar').length;

  const elTotal = document.getElementById('kpiVerifTotal');
  const elMenunggu = document.getElementById('kpiVerifMenunggu');
  const elRevisi = document.getElementById('kpiVerifRevisi');
  const elPejabat = document.getElementById('kpiVerifPejabat');

  if (elTotal) elTotal.textContent = String(countTotal).padStart(2, '0');
  if (elMenunggu) elMenunggu.textContent = String(countMenunggu).padStart(2, '0');
  if (elRevisi) elRevisi.textContent = String(countRevisi).padStart(2, '0');
  if (elPejabat) elPejabat.textContent = String(countPejabat).padStart(2, '0');

  // Filter list
  let filtered = list;
  if (verifikatorFilter === 'Menunggu') {
    filtered = list.filter(x => x.status === 'Menunggu Verifikasi');
  } else if (verifikatorFilter === 'Revisi') {
    filtered = list.filter(x => x.status === 'Perlu Revisi');
  } else if (verifikatorFilter === 'Lolos') {
    filtered = list.filter(x => x.status === 'Menunggu Pengesahan' || x.status === 'Disahkan/Terdaftar');
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-on-surface-variant font-medium">
          <span class="material-symbols-outlined text-4xl text-outline mb-2 block">task_alt</span>
          Tidak ada berkas dalam antrean filter ini.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(item => `
    <tr class="hover:bg-surface-container-low transition-colors border-b border-surface-container">
      <td class="px-space-md py-4">
        <div class="flex flex-col">
          <span class="font-bold text-on-surface text-sm">${item.id}</span>
          <span class="text-xs text-on-surface-variant">${item.tanggal || '14 Nov 2026'}</span>
        </div>
      </td>
      <td class="px-space-md py-4">
        <div class="flex flex-col">
          <span class="font-semibold text-on-surface text-sm">${item.pemberi.nama}</span>
          <span class="text-xs text-on-surface-variant">Advokat: ${item.penerima.nama}</span>
        </div>
      </td>
      <td class="px-space-md py-4">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${item.kategori === 'Advokat' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-secondary-fixed text-on-secondary-fixed-variant'}">
          ${item.kategori}
        </span>
      </td>
      <td class="px-space-md py-4">
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}">
          ${item.status}
        </span>
      </td>
      <td class="px-space-md py-4 text-right">
        <button onclick="openInspectDrawer('${item.id}')" class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 inline-flex transition-colors">
          <span class="material-symbols-outlined text-sm">visibility</span>
          <span>Periksa Berkas</span>
        </button>
      </td>
    </tr>
  `).join('');
}

// Slide-Over Drawer Inspeksi Berkas
let currentInspectedItem = null;
let currentPreviewZoom = 100;
let currentPreviewRotate = 0;

function openInspectDrawer(id) {
  const item = Storage.findById(id);
  if (!item) return;

  currentInspectedItem = item;
  currentPreviewZoom = 100;
  currentPreviewRotate = 0;

  const drawer = document.getElementById('inspectDrawer');
  const overlay = document.getElementById('inspectOverlay');
  if (!drawer || !overlay) return;

  document.getElementById('insId').textContent = item.id;
  document.getElementById('insStatus').textContent = item.status;
  document.getElementById('insStatus').className = `px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.status)}`;
  document.getElementById('insPemohonNama').textContent = item.pemberi.nama;
  document.getElementById('insPemohonNik').textContent = maskNik(item.pemberi.nik);
  document.getElementById('insPenerimaNama').textContent = item.penerima.nama;
  document.getElementById('insPenerimaKta').textContent = item.penerima.identitas;
  document.getElementById('insPerkara').textContent = `${item.materi.jenisPerkara} • ${item.materi.nomorPerkara}`;
  document.getElementById('insCatatanInput').value = item.catatanPetugas || '';

  const imgEl = document.getElementById('inspectDocImage');
  if (imgEl) {
    imgEl.src = item.berkas.ktp || item.berkas.kta || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
    imgEl.style.transform = `scale(1) rotate(0deg)`;
  }

  overlay.classList.remove('hidden');
  drawer.classList.remove('hidden');
}

function closeInspectDrawer() {
  const drawer = document.getElementById('inspectDrawer');
  const overlay = document.getElementById('inspectOverlay');
  if (drawer) drawer.classList.add('hidden');
  if (overlay) overlay.classList.add('hidden');
  currentInspectedItem = null;
}

function zoomInspectDoc(delta) {
  currentPreviewZoom = Math.min(200, Math.max(60, currentPreviewZoom + delta));
  applyDocTransform();
}

function rotateInspectDoc() {
  currentPreviewRotate = (currentPreviewRotate + 90) % 360;
  applyDocTransform();
}

function applyDocTransform() {
  const imgEl = document.getElementById('inspectDocImage');
  if (imgEl) {
    imgEl.style.transform = `scale(${currentPreviewZoom / 100}) rotate(${currentPreviewRotate}deg)`;
  }
}

async function actionVerifikator(actionType) {
  if (!currentInspectedItem) return;

  const catatan = document.getElementById('insCatatanInput').value.trim();

  let newStatus = '';
  if (actionType === 'lolos') {
    newStatus = 'Menunggu Pengesahan';
  } else if (actionType === 'revisi') {
    if (!catatan) {
      showToast('Wajib isi catatan kekurangan berkas sebelum meminta revisi.', 'warning');
      return;
    }
    newStatus = 'Perlu Revisi';
  } else if (actionType === 'tolak') {
    if (!catatan) {
      showToast('Wajib isi alasan penolakan berkas.', 'warning');
      return;
    }
    newStatus = 'Ditolak';
  }

  const res = await gasApi('updateStatus', {
    id: currentInspectedItem.id,
    patch: {
      status: newStatus,
      catatanPetugas: catatan,
      petugas: 'Ahmad Syafii, S.Kom. (Staf Meja 1)'
    }
  });

  if (res.success) {
    showToast(`Berkas ${currentInspectedItem.id} berhasil diupdate: ${newStatus}`, 'success');
    closeInspectDrawer();
    renderVerifikatorTable();
  }
}

// =========================================================================
// 8. MODUL 4: MEJA PENGESAHAN PEJABAT (PANITERA / TTE DENGAN PIN)
// =========================================================================

let activeApprovalItem = null;
let currentPin = '';

function renderPengesahanQueue() {
  const queueContainer = document.getElementById('pengesahanQueueContainer');
  if (!queueContainer) return;

  const list = Storage.load();
  const pendingApproval = list.filter(x => x.status === 'Menunggu Pengesahan');

  const countBadge = document.getElementById('pengesahanCountBadge');
  if (countBadge) countBadge.textContent = `${pendingApproval.length} Berkas Memerlukan TTE`;

  if (pendingApproval.length === 0) {
    queueContainer.innerHTML = `
      <div class="p-8 text-center bg-surface-container-lowest rounded-xl border border-surface-container text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-primary mb-2 block">task_alt</span>
        <p class="font-bold text-on-surface">Semua Berkas Telah Disahkan</p>
        <p class="text-xs text-on-surface-variant mt-1">Tidak ada berkas yang menunggu tanda tangan elektronik saat ini.</p>
      </div>
    `;
    selectItemForApproval(null);
    return;
  }

  // Pilih item pertama jika belum ada yang dipilih
  if (!activeApprovalItem || !pendingApproval.find(x => x.id === activeApprovalItem.id)) {
    activeApprovalItem = pendingApproval[0];
  }

  queueContainer.innerHTML = pendingApproval.map(item => {
    const isSelected = activeApprovalItem && activeApprovalItem.id === item.id;
    return `
      <div onclick="selectItemForApproval('${item.id}')" class="p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-primary-container text-on-primary border-primary shadow-md' : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'}">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-sm ${isSelected ? 'text-on-primary' : 'text-on-surface'}">${item.id}</span>
          <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-secondary text-on-secondary' : 'bg-secondary-container text-on-secondary-container'}">Siap TTE</span>
        </div>
        <p class="text-xs font-semibold truncate ${isSelected ? 'text-primary-fixed-dim' : 'text-on-surface'}">${item.pemberi.nama}</p>
        <p class="text-xs opacity-80 truncate">Advokat: ${item.penerima.nama}</p>
        <div class="flex items-center justify-between mt-2 pt-2 border-t ${isSelected ? 'border-primary/30' : 'border-surface-container'} text-[11px] opacity-75">
          <span>${item.materi.jenisPerkara}</span>
          <span>${item.tanggal || '14 Nov'}</span>
        </div>
      </div>
    `;
  }).join('');

  renderCertificatePreview(activeApprovalItem);
}

function selectItemForApproval(id) {
  if (!id) {
    activeApprovalItem = null;
    renderCertificatePreview(null);
    return;
  }
  activeApprovalItem = Storage.findById(id);
  renderPengesahanQueue();
}

function renderCertificatePreview(item) {
  const container = document.getElementById('certificatePreviewPane');
  if (!container) return;

  if (!item) {
    container.innerHTML = `
      <div class="h-96 flex flex-col items-center justify-center text-on-surface-variant">
        <span class="material-symbols-outlined text-5xl text-outline mb-2">article</span>
        <p class="font-medium text-sm">Pilih berkas dari antrean untuk pratinjau lembar akta.</p>
      </div>
    `;
    return;
  }

  const regNo = item.nomorRegister && item.nomorRegister !== 'Dalam Proses Verifikasi'
    ? item.nomorRegister
    : 'W11-U1/245/HK.02/XI/2026';

  container.innerHTML = `
    <!-- Formal Court Header -->
    <div class="text-center pb-4 border-b-2 border-primary/40 mb-6">
      <div class="w-14 h-14 mx-auto mb-2 rounded-full bg-primary text-secondary-container flex items-center justify-center shadow-md">
        <span class="material-symbols-outlined text-3xl">balance</span>
      </div>
      <h3 class="font-display text-lg font-bold uppercase tracking-wider text-primary">PENGADILAN NEGERI KELAS I A KHUSUS</h3>
      <p class="text-xs text-on-surface-variant font-medium">Kepaniteraan Perdata • Layanan Terpadu Satu Pintu (PTSP) E-Surat Kuasa</p>
      <p class="text-[11px] text-outline">Gedung Pengadilan Negeri, Jl. Merdeka Kehakiman No. 12 • Laman Resmi: pn.mahkamahagung.go.id</p>
    </div>

    <!-- Title & Register Number -->
    <div class="text-center mb-6">
      <h4 class="font-headline-sm text-base font-bold uppercase tracking-wide text-on-surface underline decoration-primary decoration-2 underline-offset-4">SURAT TANDA PENDAFTARAN SURAT KUASA</h4>
      <p class="font-mono text-xs font-bold text-primary mt-1">Nomor Register: ${regNo}</p>
    </div>

    <!-- Clauses -->
    <div class="text-xs text-on-surface space-y-3 leading-relaxed mb-6">
      <p>Pada hari ini, tanggal <strong>${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>, bertempat di Kepaniteraan Pengadilan Negeri, telah didaftarkan dalam Buku Register Surat Kuasa Khusus Perdata oleh Panitera Pengadilan Negeri:</p>

      <div class="grid grid-cols-12 gap-2 pl-4 py-2 bg-surface-container-low/50 rounded-lg">
        <div class="col-span-4 font-semibold text-outline">Pemberi Kuasa</div>
        <div class="col-span-8 font-bold text-on-surface">: ${item.pemberi.nama} (NIK: ${maskNik(item.pemberi.nik)})</div>

        <div class="col-span-4 font-semibold text-outline">Penerima Kuasa</div>
        <div class="col-span-8 font-bold text-on-surface">: ${item.penerima.nama} (${item.kategori === 'Advokat' ? 'Advokat/Penasihat Hukum' : 'Kuasa Insidentil'})</div>

        <div class="col-span-4 font-semibold text-outline">Maksud Kuasa</div>
        <div class="col-span-8 text-on-surface">: ${item.materi.uraian}</div>

        <div class="col-span-4 font-semibold text-outline">Status PNBP & Meterai</div>
        <div class="col-span-8 text-primary font-bold">: LUNAS & TERVERIFIKASI SIMPONI (NTPN: 20261114098231)</div>
      </div>

      <p class="text-[11px] text-on-surface-variant italic">Pendaftaran ini dicatat secara resmi melalui sistem otomasi E-Katalog Surat Kuasa Pengadilan dan mempunyai kekuatan pembuktian pendaftaran hukum sesuai peraturan perundang-undangan di Lingkungan Mahkamah Agung Republik Indonesia.</p>
    </div>

    <!-- Signature & HMAC QR Code Section -->
    <div class="pt-4 border-t border-surface-container flex items-center justify-between">
      <div class="p-2.5 rounded-lg bg-surface-container text-xs font-mono text-outline">
        <span class="block text-[10px] uppercase font-bold text-primary">SHA-256 HMAC Seal:</span>
        <span class="text-[10px] break-all">${item.hashSha256 || generateMockSha256()}</span>
      </div>

      <div class="flex flex-col items-center text-center">
        <span class="text-[11px] font-semibold text-on-surface">A.n. KETUA PENGADILAN NEGERI<br>PANITERA,</span>
        <div class="w-20 h-20 my-1 bg-surface-container-high rounded-lg p-1.5 flex items-center justify-center border border-dashed border-primary">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://pengadilan.go.id/validasi?reg=${item.id}" alt="QR Seal" class="w-full h-full object-contain">
        </div>
        <span class="text-xs font-bold text-primary underline">Dr. H. Sulaiman, S.H., M.H.</span>
        <span class="text-[10px] text-outline">NIP. 19740512 199903 1 002</span>
      </div>
    </div>
  `;
}

// PIN Keypad Logic
function pressPin(digit) {
  if (currentPin.length < 6) {
    currentPin += digit;
    updatePinDots();
  }
}

function clearPin() {
  currentPin = '';
  updatePinDots();
}

function updatePinDots() {
  for (let i = 1; i <= 6; i++) {
    const dot = document.getElementById(`pinDot${i}`);
    if (dot) {
      if (i <= currentPin.length) {
        dot.className = 'w-3 h-3 rounded-full bg-primary transition-all scale-125';
      } else {
        dot.className = 'w-3 h-3 rounded-full bg-surface-container-highest transition-all';
      }
    }
  }
}

async function executeOfficialApproval() {
  if (!activeApprovalItem) {
    showToast('Pilih berkas dari antrean terlebih dahulu.', 'warning');
    return;
  }
  if (currentPin.length < 6) {
    showToast('Masukkan 6-digit PIN Pengesahan Pejabat (Contoh Demo: 123456).', 'warning');
    return;
  }

  const btnApprove = document.getElementById('btnExecuteApproval');
  if (btnApprove) {
    btnApprove.disabled = true;
    btnApprove.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span> Membubuhkan TTE...';
  }

  const res = await gasApi('sahkanDokumen', {
    id: activeApprovalItem.id,
    pin: currentPin
  });

  if (btnApprove) {
    btnApprove.disabled = false;
    btnApprove.innerHTML = '<span class="material-symbols-outlined text-lg">verified</span> Sahkan & Terbitkan Surat Kuasa Terdaftar';
  }

  if (res.success) {
    showToast(`Dokumen ${activeApprovalItem.id} berhasil disahkan secara resmi!`, 'success');
    clearPin();
    renderPengesahanQueue();
  }
}

// =========================================================================
// 9. MODUL 5: EXECUTIVE ADMIN DASHBOARD & ANALYTICS
// =========================================================================

function renderAdminDashboard() {
  const list = Storage.load();

  // Metrics
  const total = list.length;
  const menunggu = list.filter(x => x.status === 'Menunggu Verifikasi').length;
  const pengesahan = list.filter(x => x.status === 'Menunggu Pengesahan').length;
  const terdaftar = list.filter(x => x.status === 'Disahkan/Terdaftar').length;

  const m1 = document.getElementById('admMetricTotal');
  const m2 = document.getElementById('admMetricMenunggu');
  const m3 = document.getElementById('admMetricPengesahan');
  const m4 = document.getElementById('admMetricTerdaftar');

  if (m1) m1.textContent = total;
  if (m2) m2.textContent = menunggu;
  if (m3) m3.textContent = pengesahan;
  if (m4) m4.textContent = terdaftar;

  // Render Table
  const table = document.getElementById('adminMasterTableBody');
  if (table) {
    table.innerHTML = list.map(item => `
      <tr class="hover:bg-surface-container-low transition-colors border-b border-surface-container">
        <td class="px-4 py-3 font-mono font-bold text-xs text-primary">${item.id}</td>
        <td class="px-4 py-3 text-xs text-on-surface-variant">${item.tanggal || '14 Nov 2026'}</td>
        <td class="px-4 py-3 font-semibold text-xs text-on-surface">${item.pemberi.nama}</td>
        <td class="px-4 py-3 text-xs text-on-surface">${item.penerima.nama}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${item.kategori === 'Advokat' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-secondary-fixed text-on-secondary-fixed-variant'}">${item.kategori}</span>
        </td>
        <td class="px-4 py-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(item.status)}">${item.status}</span>
        </td>
        <td class="px-4 py-3 text-right">
          <button onclick="openInspectDrawer('${item.id}')" class="p-1 rounded text-on-surface-variant hover:text-primary transition-colors" title="Lihat Detail">
            <span class="material-symbols-outlined text-base">visibility</span>
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function exportDataToExcel() {
  const list = Storage.load();
  let csv = 'ID,Tanggal,Kategori,Status,Nama Pemberi,NIK Pemberi,Nama Penerima,KTA/ID Penerima,Jenis Perkara,Nomor Register\n';

  list.forEach(item => {
    csv += `"${item.id}","${item.tanggal}","${item.kategori}","${item.status}","${item.pemberi.nama}","${item.pemberi.nik}","${item.penerima.nama}","${item.penerima.identitas}","${item.materi.jenisPerkara}","${item.nomorRegister || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Buku_Register_Surat_Kuasa_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Data berhasil diekspor ke format Excel/CSV.', 'success');
}

// =========================================================================
// 10. MODUL 6: VALIDASI QR DOKUMEN PUBLIK
// =========================================================================

function renderQrValidationPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const regParam = urlParams.get('reg') || 'REG-202611-0088';

  const item = Storage.findById(regParam) || Storage.load()[0];
  if (!item) return;

  const regNoEl = document.getElementById('qrValidRegNo');
  const codeEl = document.getElementById('qrValidCode');
  const pemberiEl = document.getElementById('qrValidPemberi');
  const penerimaEl = document.getElementById('qrValidPenerima');
  const perkaraEl = document.getElementById('qrValidPerkara');
  const pejabatEl = document.getElementById('qrValidPejabat');
  const hashEl = document.getElementById('qrValidHash');

  if (regNoEl) regNoEl.textContent = item.nomorRegister || 'W11-U1/245/HK.02/XI/2026';
  if (codeEl) codeEl.textContent = item.id;
  if (pemberiEl) pemberiEl.innerHTML = `<span class="font-bold text-on-surface">${item.pemberi.nama}</span><br><span class="text-xs text-outline">NIK: ${maskNik(item.pemberi.nik)}</span>`;
  if (penerimaEl) penerimaEl.innerHTML = `<span class="font-bold text-on-surface">${item.penerima.nama}</span><br><span class="text-xs text-outline">KTA: ${item.penerima.identitas}</span>`;
  if (perkaraEl) perkaraEl.innerHTML = `<span class="font-bold text-on-surface">${item.materi.jenisPerkara}</span><br><span class="text-xs text-outline">No. ${item.materi.nomorPerkara}</span>`;
  if (pejabatEl) pejabatEl.innerHTML = `<span class="font-bold text-on-surface">Dr. H. Sulaiman, S.H., M.H.</span><br><span class="text-xs text-outline">Panitera Pengadilan Negeri</span>`;
  if (hashEl) hashEl.textContent = item.hashSha256 || generateMockSha256();
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Teks berhasil disalin ke papan klip!', 'info');
  });
}

// =========================================================================
// 11. MODAL CERTIFICATE PRINT & PREVIEW
// =========================================================================

function openCertificateModal(id) {
  const item = Storage.findById(id);
  if (!item) return;

  const modal = document.getElementById('certificateModal');
  const content = document.getElementById('certificateModalContent');
  if (!modal || !content) return;

  const regNo = item.nomorRegister && item.nomorRegister !== 'Dalam Proses Verifikasi'
    ? item.nomorRegister
    : 'W11-U1/245/HK.02/XI/2026';

  content.innerHTML = `
    <div id="printableCertificate" class="p-8 bg-surface-container-lowest rounded-xl max-w-3xl mx-auto shadow-sm border border-surface-container">
      <div class="text-center pb-4 border-b-2 border-primary/40 mb-6">
        <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-primary text-secondary-container flex items-center justify-center shadow-md">
          <span class="material-symbols-outlined text-4xl">balance</span>
        </div>
        <h3 class="font-display text-xl font-bold uppercase tracking-wider text-primary">PENGADILAN NEGERI KELAS I A KHUSUS</h3>
        <p class="text-xs text-on-surface-variant font-medium">Kepaniteraan Perdata • Layanan Terpadu Satu Pintu (PTSP) E-Surat Kuasa</p>
        <p class="text-[11px] text-outline">Gedung Pengadilan Negeri, Jl. Merdeka Kehakiman No. 12</p>
      </div>

      <div class="text-center mb-6">
        <h4 class="font-headline-sm text-lg font-bold uppercase tracking-wide text-on-surface underline decoration-primary decoration-2 underline-offset-4">SURAT TANDA PENDAFTARAN SURAT KUASA</h4>
        <p class="font-mono text-sm font-bold text-primary mt-1">Nomor Register: ${regNo}</p>
      </div>

      <div class="text-sm text-on-surface space-y-4 leading-relaxed mb-8">
        <p>Pada hari ini, tanggal <strong>${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>, bertempat di Kepaniteraan Pengadilan Negeri, telah didaftarkan dalam Buku Register Surat Kuasa Khusus Perdata oleh Panitera Pengadilan Negeri:</p>

        <div class="p-4 bg-surface-container-low rounded-lg space-y-2 text-xs">
          <div class="grid grid-cols-12"><span class="col-span-4 font-bold text-outline">Pemberi Kuasa</span><span class="col-span-8 font-bold text-on-surface">: ${item.pemberi.nama} (NIK: ${maskNik(item.pemberi.nik)})</span></div>
          <div class="grid grid-cols-12"><span class="col-span-4 font-bold text-outline">Penerima Kuasa</span><span class="col-span-8 font-bold text-on-surface">: ${item.penerima.nama} (${item.kategori})</span></div>
          <div class="grid grid-cols-12"><span class="col-span-4 font-bold text-outline">Perihal / Ruang Lingkup</span><span class="col-span-8 text-on-surface">: ${item.materi.uraian}</span></div>
          <div class="grid grid-cols-12"><span class="col-span-4 font-bold text-outline">Status PNBP & Meterai</span><span class="col-span-8 text-primary font-bold">: LUNAS & TERVERIFIKASI PERURI</span></div>
        </div>

        <p class="text-xs text-on-surface-variant italic">Akta pendaftaran ini adalah dokumen resmi yang diterbitkan secara elektronik dan dilindungi dengan segel kriptografi HMAC SHA-256. Verifikasi keabsahan dokumen dapat dilakukan langsung oleh Majelis Hakim atau Pihak Lawan dengan memindai kode QR di bawah.</p>
      </div>

      <div class="pt-4 border-t border-surface-container flex items-center justify-between">
        <div class="text-xs font-mono text-outline">
          <span class="block text-[10px] uppercase font-bold text-primary">Kode Validasi HMAC:</span>
          <span class="text-[10px] break-all">${item.hashSha256 || generateMockSha256()}</span>
        </div>

        <div class="flex flex-col items-center text-center">
          <span class="text-xs font-semibold text-on-surface">PANITERA PENGADILAN NEGERI,</span>
          <div class="w-24 h-24 my-2 bg-white rounded-lg p-1 flex items-center justify-center border border-dashed border-primary">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://pengadilan.go.id/validasi?reg=${item.id}" alt="QR Seal" class="w-full h-full object-contain">
          </div>
          <span class="text-xs font-bold text-primary underline">Dr. H. Sulaiman, S.H., M.H.</span>
          <span class="text-[10px] text-outline">NIP. 19740512 199903 1 002</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeCertificateModal() {
  const modal = document.getElementById('certificateModal');
  if (modal) modal.classList.add('hidden');
}

function printCertificate() {
  window.print();
}

function downloadTandaTerima(id) {
  openCertificateModal(id);
}

// =========================================================================
// 12. HELPER UTILITIES
// =========================================================================

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Disahkan/Terdaftar':
      return 'bg-primary-fixed text-on-primary-fixed-variant';
    case 'Menunggu Verifikasi':
    case 'Menunggu Pengesahan':
      return 'bg-secondary-fixed text-on-secondary-fixed-variant';
    case 'Perlu Revisi':
      return 'bg-surface-container-high text-tertiary';
    case 'Ditolak':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container text-on-surface-variant';
  }
}

function maskNik(nik) {
  if (!nik || nik.length < 8) return nik;
  return nik.slice(0, 4) + '************' + nik.slice(-2);
}

// =========================================================================
// 13. PWA INSTALLATION & SERVICE WORKER LIFECYCLE
// =========================================================================

let pwaInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pwaInstallPrompt = e;
  const pwaBtn = document.getElementById('btnPwaInstall');
  if (pwaBtn) pwaBtn.classList.remove('hidden');
});

function triggerPwaInstall() {
  if (pwaInstallPrompt) {
    pwaInstallPrompt.prompt();
    pwaInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        const pwaBtn = document.getElementById('btnPwaInstall');
        if (pwaBtn) pwaBtn.classList.add('hidden');
      }
      pwaInstallPrompt = null;
    });
  }
}

// Daftarkan Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('✅ PWA Service Worker Aktif:', reg.scope))
      .catch(err => console.warn('PWA Service Worker Registrasi Gagal:', err));
  });
}

// =========================================================================
// 14. APP INITIALIZATION ON DOM READY
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi sesi autentikasi pengguna
  initAuth();

  // Setup routing awal berdasarkan hash URL
  const hash = window.location.hash.replace('#', '');
  if (hash && VALID_VIEWS.includes(hash)) {
    navigateTo(hash, false);
  } else {
    navigateTo('beranda-dan-lacak', false);
  }

  // Setup tracker form
  initTracking();

  // Setup category button wizard
  setWizardCategory('Advokat');

  // Bind click navigation untuk semua elemen dengan attribute data-path
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('[data-path]');
    if (targetLink) {
      e.preventDefault();
      const path = targetLink.getAttribute('data-path');
      navigateTo(path);
    }
  });
});
