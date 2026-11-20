/**
 * KONFIGURASI APLIKASI SURAT KUASA ONLINE
 * Sesuai prinsip /gas-pro-api dan /gas-rahasia-script-properties:
 * File ini HANYA menyimpan URL Web App GAS dan parameter publik yang aman.
 * Semua token, API key (Fonnte, dll), dan kata sandi disimpan di Script Properties GAS.
 */

const CONFIG = {
  // Ganti nilai di bawah ini dengan URL Deployment Google Apps Script Anda (berakhiran /exec)
  // Contoh: 'https://script.google.com/macros/s/AKfycbyHx3kyOR5TkCPosyFOb_UnCY4-BaLJK6Jc_xtjyH1roL6FDEQBC3tYL0isF6Eg3BR3/exec'
  GAS_URL: '',

  // Informasi Instansi Peradilan
  APP_NAME: 'E-Surat Kuasa Pengadilan Negeri',
  COURT_NAME: 'PENGADILAN NEGERI KELAS I A KHUSUS',
  COURT_SUBTITLE: 'Layanan Mandiri Pendaftaran dan Legalisasi Surat Kuasa Elektronik',
  PTSP_HOTLINE: '(021) 8092-2345',
  PTSP_WHATSAPP: '628119283771',

  // Biaya Layanan Resmi
  BIAYA: {
    PNBP: 10000,
    EMETERAI: 10000,
    LEGALISASI: 0
  },

  // Versi Aplikasi
  VERSION: '2.4.0-Production'
};

// Deteksi mode demo / offline jika GAS_URL belum diatur
const IS_DEMO_MODE = !CONFIG.GAS_URL || CONFIG.GAS_URL.includes('AKfycb...');
if (IS_DEMO_MODE) {
  console.info('💡 Mode Demo Aktif: Aplikasi menggunakan simulasi data lokal berkinerja tinggi (0ms latency). Anda dapat langsung menguji seluruh fitur pendaftaran, verifikasi, pengesahan PIN, dan validasi QR.');
}
