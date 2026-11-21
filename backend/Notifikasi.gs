/**
 * =========================================================================
 * NOTIFIKASI.GS — MODUL WHATSAPP (FONNTE) + EMAIL + CRM KONTAK
 * =========================================================================
 * Mematuhi standar /gas-notifikasi-wa-crm & /gas-rahasia-script-properties:
 * - Antrean non-blocking via sheet AntrianNotif
 * - Normalisasi nomor HP 3 titik (hp08_, hp62_, hpValid_)
 * - Saklar dua lapis (Global + Matriks per Event)
 * - Token Fonnte HANYA dari Script Properties (`FONNTE_TOKEN`)
 * - CRM Kontak terpadu dengan Opt-Out & validasi WA
 */

const NOTIF_EVENTS = {
  PERMOHONAN_MASUK: {
    label: 'Permohonan Surat Kuasa Masuk',
    wa: true,
    email: false,
    subjek: '[E-Kuasa] Tanda Terima Pengajuan {kode}',
    pesan: 'Yth. {nama},\n\nPermohonan pendaftaran surat kuasa Anda (*{kategori}*) telah kami terima dengan ID Permohonan *{kode}*.\n\nLacak progres verifikasi secara mandiri di:\n{link}\n\n— Kepaniteraan Hukum {institusi}'
  },
  PERMOHONAN_REVISI: {
    label: 'Permohonan Perlu Revisi Berkas',
    wa: true,
    email: false,
    subjek: '[E-Kuasa] Perlu Perbaikan Berkas {kode}',
    pesan: 'Yth. {nama},\n\nPermohonan *{kode}* berstatus *PERLU REVISI* oleh Petugas Kepaniteraan Hukum.\n\nCatatan perbaikan:\n"{catatan}"\n\nSilakan masuk ke portal E-Kuasa untuk memperbarui berkas Anda.\n— {institusi}'
  },
  PERMOHONAN_DISETUJUI: {
    label: 'Permohonan Disetujui & Terbit Register',
    wa: true,
    email: false,
    subjek: '[E-Kuasa] Surat Kuasa Disetujui — {register}',
    pesan: 'Yth. {nama},\n\nSelamat! Permohonan surat kuasa Anda (*{kode}*) telah *DISETUJUI*.\n\nNomor Register Resmi:\n*{register}*\n\nAnda kini dapat mengunduh & mencetak Tanda Terima Resmi melalui portal E-Kuasa:\n{link}\n\n— Kepaniteraan Hukum {institusi}'
  }
};

// =========================================================================
// NORMALISASI NOMOR HP 3 TITIK
// =========================================================================

function hp08_(raw) {
  let s = String(raw || '').replace(/[^\d]/g, '');
  if (!s) return '';
  if (s.indexOf('62') === 0) s = '0' + s.slice(2);
  else if (s.indexOf('8') === 0) s = '0' + s;
  return s;
}

function hp62_(raw) {
  let s = hp08_(raw);
  if (!s) return '';
  return s.indexOf('0') === 0 ? '62' + s.slice(1) : s;
}

function hpValid_(raw) {
  const s = hp08_(raw);
  return s.length >= 10 && s.length <= 15 && s.indexOf('08') === 0;
}

function emailValid_(raw) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw || '').trim());
}

// =========================================================================
// SAKLAR DUA LAPIS & TEMPLATE
// =========================================================================

function waAktif_() {
  return String(setting_('NOTIF_WA_AKTIF', 'TRUE')).toUpperCase() === 'TRUE' && !!prop_('FONNTE_TOKEN');
}

function emailAktif_() {
  return String(setting_('NOTIF_EMAIL_AKTIF', 'FALSE')).toUpperCase() === 'TRUE';
}

function matriksNotif_() {
  const raw = setting_('NOTIF_MATRIKS', '');
  const base = {};
  Object.keys(NOTIF_EVENTS).forEach(function (k) {
    base[k] = {
      wa: NOTIF_EVENTS[k].wa,
      email: NOTIF_EVENTS[k].email,
      subjek: NOTIF_EVENTS[k].subjek,
      pesan: NOTIF_EVENTS[k].pesan
    };
  });
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      Object.keys(parsed).forEach(function (k) {
        if (base[k]) {
          base[k].wa = !!parsed[k].wa;
          base[k].email = !!parsed[k].email;
        }
      });
    } catch (e) {}
  }
  return base;
}

function isiTemplate_(tpl, vars) {
  let out = String(tpl || '');
  Object.keys(vars || {}).forEach(function (k) {
    out = out.split('{' + k + '}').join(vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : '');
  });
  return out;
}

// =========================================================================
// ANTREAN NON-BLOCKING (TIDAK PERNAH MEMBLOKIR TRANSAKSI USER)
// =========================================================================

function kirimNotif_(event, penerima, vars, refId) {
  return kirimNotifBatch_(event, [{ penerima: penerima, vars: vars, refId: refId }]);
}

function kirimNotifBatch_(event, daftar, blastId) {
  try {
    const waOn = String(setting_('NOTIF_WA_AKTIF', 'TRUE')).toUpperCase() === 'TRUE';
    const emOn = emailAktif_();
    if (!waOn && !emOn) return 0;

    const m = matriksNotif_()[event];
    if (!m || (!m.wa && !m.email)) return 0;

    const dasar = {
      institusi: setting_('NAMA_INSTITUSI', 'Pengadilan Negeri Kelas I A'),
      link: setting_('APP_URL', 'Portal E-Kuasa')
    };
    const nowIso = new Date().toISOString();
    const rows = [];

    daftar.forEach(function (d) {
      const p = d.penerima || {};
      const v = Object.assign({}, dasar, { nama: p.nama || 'Bapak/Ibu' }, d.vars || {});
      if (waOn && m.wa && hpValid_(p.hp)) {
        rows.push([
          'ANT-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100),
          'WA',
          "'" + hp62_(p.hp),
          p.nama || '',
          '',
          isiTemplate_(m.pesan, v),
          event,
          d.refId || '',
          blastId || '',
          'Antri',
          0,
          '',
          nowIso,
          ''
        ]);
      }
      if (emOn && m.email && emailValid_(p.email)) {
        rows.push([
          'ANT-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100),
          'EMAIL',
          String(p.email).trim(),
          p.nama || '',
          isiTemplate_(m.subjek, v),
          isiTemplate_(m.pesan, v),
          event,
          d.refId || '',
          blastId || '',
          'Antri',
          0,
          '',
          nowIso,
          ''
        ]);
      }
    });

    if (!rows.length) return 0;
    const sh = getSheet_('AntrianNotif');
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    setProp_('ANTRIAN_ADA', '1');
    return rows.length;
  } catch (e) {
    Logger.log('kirimNotifBatch_ error: ' + e.message);
    return 0;
  }
}

/**
 * Worker latar belakang (dijalankan oleh Time-Driven Trigger setiap 5 menit)
 * Menggunakan pointer ANTRIAN_MULAI & flag ANTRIAN_ADA untuk hemat kuota eksekusi
 */
function prosesAntrianNotif() {
  if (prop_('ANTRIAN_ADA', '0') !== '1') return;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;

  try {
    const sh = getSheet_('AntrianNotif');
    const lastRow = sh.getLastRow();
    if (lastRow <= 1) {
      setProp_('ANTRIAN_ADA', '0');
      return;
    }

    const startRow = Math.max(2, Number(prop_('ANTRIAN_MULAI', '2')) || 2);
    if (startRow > lastRow) {
      setProps_({ ANTRIAN_ADA: '0', ANTRIAN_MULAI: String(lastRow + 1) });
      return;
    }

    const batchLimit = Math.min(30, lastRow - startRow + 1);
    const range = sh.getRange(startRow, 1, batchLimit, 14);
    const values = range.getValues();
    const token = prop_('FONNTE_TOKEN');
    const nowIso = new Date().toISOString();
    let sisaAntri = false;
    let firstPendingRow = null;

    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const status = String(row[9] || '');
      if (status !== 'Antri') continue;

      const kanal = String(row[1] || '');
      const tujuan = String(row[2] || '').replace(/^'/, '');
      const subjek = String(row[4] || '');
      const pesan = String(row[5] || '');
      const percobaan = Number(row[10] || 0) + 1;
      row[10] = percobaan;

      if (kanal === 'WA') {
        if (!token) {
          row[9] = 'Gagal';
          row[11] = 'FONNTE_TOKEN belum diatur di Script Properties';
          continue;
        }
        try {
          const resp = UrlFetchApp.fetch('https://api.fonnte.com/send', {
            method: 'post',
            headers: { Authorization: token },
            payload: { target: tujuan, message: pesan },
            muteHttpExceptions: true
          });
          const code = resp.getResponseCode();
          const bodyTxt = resp.getContentText().slice(0, 180);
          if (code >= 200 && code < 300) {
            row[9] = 'Terkirim';
            row[11] = bodyTxt;
            row[13] = nowIso;
          } else {
            row[9] = percobaan >= 3 ? 'Gagal' : 'Antri';
            row[11] = 'HTTP ' + code + ': ' + bodyTxt;
            if (row[9] === 'Antri') {
              sisaAntri = true;
              if (firstPendingRow === null) firstPendingRow = startRow + i;
            }
          }
        } catch (err) {
          row[9] = percobaan >= 3 ? 'Gagal' : 'Antri';
          row[11] = String(err.message).slice(0, 150);
          if (row[9] === 'Antri') {
            sisaAntri = true;
            if (firstPendingRow === null) firstPendingRow = startRow + i;
          }
        }
      } else if (kanal === 'EMAIL') {
        try {
          MailApp.sendEmail({ to: tujuan, subject: subjek || 'Notifikasi E-Kuasa', body: pesan });
          row[9] = 'Terkirim';
          row[11] = 'OK';
          row[13] = nowIso;
        } catch (err) {
          row[9] = percobaan >= 3 ? 'Gagal' : 'Antri';
          row[11] = String(err.message).slice(0, 150);
        }
      }
    }

    // Tulis ulang satu blok kontigu (hemat kuota Sheets)
    range.setValues(values);

    if (sisaAntri && firstPendingRow !== null) {
      setProps_({ ANTRIAN_ADA: '1', ANTRIAN_MULAI: String(firstPendingRow) });
    } else if (startRow + batchLimit - 1 < lastRow) {
      setProps_({ ANTRIAN_ADA: '1', ANTRIAN_MULAI: String(startRow + batchLimit) });
    } else {
      setProps_({ ANTRIAN_ADA: '0', ANTRIAN_MULAI: String(lastRow + 1) });
    }
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// CRM KONTAK & BLAST WA BER-BATCH
// =========================================================================

function sinkronCrmKontak_() {
  const shCrm = getSheet_('CRM_Kontak');
  const existingRows = readSheetObjects_(shCrm);
  const byWa = {};
  existingRows.forEach(function (r) {
    const wa = hp08_(r.NoWA);
    if (wa) byWa[wa] = true;
  });

  const users = readSheetObjects_(getSheet_('USERS'));
  const permohonan = readSheetObjects_(getSheet_('PERMOHONAN_KUASA'));
  const nowIso = new Date().toISOString();
  const toInsert = [];

  function addIfNew(nama, email, hp, segmen, sumber, refId) {
    const wa = hp08_(hp);
    if (!wa || byWa[wa]) return;
    byWa[wa] = true;
    toInsert.push([
      'KTK-' + Date.now() + '-' + (toInsert.length + 1),
      nama || 'Pemohon',
      email || '',
      "'" + wa,
      segmen || 'Pemohon',
      sumber || 'Sistem',
      refId || '',
      segmen || '',
      'Belum Dicek',
      '',
      emailValid_(email) ? 'YA' : 'TIDAK',
      'TIDAK',
      '',
      0,
      '',
      '',
      nowIso,
      nowIso
    ]);
  }

  users.forEach(function (u) {
    addIfNew(u.Nama_Lengkap, u.Username, u.No_HP_WA, u.Role || 'Pemohon', 'USERS', u.User_ID);
  });
  permohonan.forEach(function (p) {
    addIfNew(p.Nama_Pemohon, '', p.No_HP_WA, p.Kategori_Kuasa || 'Pemohon', 'PERMOHONAN', p.Permohonan_ID);
  });

  if (toInsert.length) {
    shCrm.getRange(shCrm.getLastRow() + 1, 1, toInsert.length, 18).setValues(toInsert);
  }
  return { inserted: toInsert.length, total: existingRows.length + toInsert.length };
}

function buatBlastWa_(body, actor) {
  const judul = String(body.judul || 'Pengumuman Kepaniteraan').trim();
  const pesan = String(body.pesan || '').trim();
  const sasaran = String(body.sasaran || 'Semua').trim();
  const ukuranBatch = Math.max(5, Math.min(50, Number(body.ukuranBatch || 20)));
  const jedaDetik = Math.max(3, Math.min(15, Number(body.jedaDetik || 5)));

  if (!pesan) return fail_('Isi pesan blast WhatsApp wajib diisi.');

  const kontak = readSheetObjects_(getSheet_('CRM_Kontak')).filter(function (k) {
    if (String(k.OptOut || '').toUpperCase() === 'YA') return false;
    if (!hpValid_(k.NoWA)) return false;
    if (sasaran !== 'Semua' && String(k.Segmen || '') !== sasaran) return false;
    return true;
  });

  if (!kontak.length) return fail_('Tidak ada kontak aktif (non-OptOut) yang sesuai sasaran.');

  const blastId = 'BLW-' + Date.now();
  const nowIso = new Date().toISOString();
  const shBlast = getSheet_('BlastWA');
  shBlast.getRange(shBlast.getLastRow() + 1, 1, 1, 13).setValues([[
    blastId, judul, pesan, sasaran, kontak.length, 0, 0,
    ukuranBatch, jedaDetik, 'Berjalan', actor || 'Admin', nowIso, ''
  ]]);

  // Antrekan non-blocking ke AntrianNotif
  const rows = kontak.map(function (k, idx) {
    const teks = isiTemplate_(pesan, { nama: k.Nama || 'Bapak/Ibu', institusi: setting_('NAMA_INSTITUSI', 'Pengadilan Negeri') });
    return [
      'ANT-' + Date.now() + '-' + idx,
      'WA',
      "'" + hp62_(k.NoWA),
      k.Nama || '',
      '',
      teks,
      'BLAST_WA',
      k.KontakID || '',
      blastId,
      'Antri',
      0,
      '',
      nowIso,
      ''
    ];
  });

  const shAntri = getSheet_('AntrianNotif');
  shAntri.getRange(shAntri.getLastRow() + 1, 1, rows.length, 14).setValues(rows);
  setProp_('ANTRIAN_ADA', '1');

  return {
    success: true,
    blastId: blastId,
    totalAntri: rows.length,
    message: 'Blast WA "' + judul + '" berhasil diantrekan untuk ' + rows.length + ' kontak.'
  };
}
