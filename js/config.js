/**
 * =========================================================================
 * CONFIG.JS — KONFIGURASI PUBLIK FRONTEND E-KUASA (/gas-rahasia-script-properties)
 * =========================================================================
 * Aturan R11: File ini HANYA menyimpan URL Web App GAS dan parameter publik.
 * DILARANG menyimpan token Fonnte, password, atau secret apa pun di sini.
 */

const CONFIG = {
  // Tempelkan URL Web App Google Apps Script Anda (berakhiran /exec) di sini:
  // Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
  GAS_URL: 'https://script.google.com/macros/s/AKfycbxaH3a-VFet6m91u3UzLTPux89wfO5SEiqWSdOQX6TjX1nByAVbcV7T2l66PQC9I7w8/exec',

  APP_NAME: 'E-Kuasa | Pengadilan Negeri',
  COURT_NAME: 'PENGADILAN NEGERI KELAS I A',
  COURT_ADDRESS: 'Jl. Pengadilan No. 1 • Telp (021) 3843348 • Email: kepaniteraanhukum@pn-negeri.go.id',
  PTSP_WA: '628119283771',
  VERSION: '3.0.0-EKuasa-Turbo'
};

const IS_DEMO_MODE = !CONFIG.GAS_URL || CONFIG.GAS_URL.trim() === '';
