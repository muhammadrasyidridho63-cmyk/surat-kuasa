/**
 * MODUL NOTIFIKASI WHATSAPP (FONNTE) & EMAIL
 * Sesuai prinsip /gas-notifikasi-wa-crm:
 * - Antrean non-blocking (0ms delay pada transaksi utama pendaftaran)
 * - Pemrosesan batch berkala via Trigger (prosesAntrianNotif)
 * - Token Fonnte disimpan aman di Script Properties (FONNTE_TOKEN)
 * - Normalisasi nomor telepon otomatis (08... -> 62...)
 */

// =========================================================================
// 1. HELPER NORMALISASI NOMOR TELEPON
// =========================================================================

function hp62_(hp) {
  let s = String(hp || '').replace(/[^0-9]/g, '');
  if (s.startsWith('0')) s = '62' + s.slice(1);
  else if (s.startsWith('8')) s = '62' + s;
  return s;
}

function hp08_(hp) {
  let s = String(hp || '').replace(/[^0-9]/g, '');
  if (s.startsWith('62')) s = '0' + s.slice(2);
  else if (s.startsWith('8')) s = '0' + s;
  return s;
}

// =========================================================================
// 2. PEMROSESAN ANTREAN NOTIFIKASI (TRIGGER BACKGROUND RUNNER)
// =========================================================================

function prosesAntrianNotif(opsi) {
  opsi = opsi || {};
  const props = PropertiesService.getScriptProperties();
  if (!opsi.paksa && props.getProperty('ANTRIAN_ADA') !== '1') return;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(8000)) return;

  try {
    const ss = getSpreadsheet();
    const sh = ss.getSheetByName('AntrianNotif');
    if (!sh) return;

    const values = sh.getDataRange().getValues();
    if (values.length <= 1) {
      props.setProperty('ANTRIAN_ADA', '0');
      return;
    }

    const headers = values[0];
    const statusIdx = headers.indexOf('Status');
    const kanalIdx = headers.indexOf('Kanal');
    const tujuanIdx = headers.indexOf('Tujuan');
    const subjekIdx = headers.indexOf('Subjek');
    const pesanIdx = headers.indexOf('Pesan');

    const fonnteToken = props.getProperty('FONNTE_TOKEN');
    let hasPending = false;

    for (let r = 1; r < values.length; r++) {
      const status = values[r][statusIdx];
      if (status !== 'Antri') continue;

      const kanal = values[r][kanalIdx];
      const tujuan = values[r][tujuanIdx];
      const subjek = values[r][subjekIdx];
      const pesan = values[r][pesanIdx];

      let success = false;

      // 1. Kirim via WhatsApp (Fonnte API)
      if (kanal === 'WA' && fonnteToken && tujuan) {
        try {
          const res = UrlFetchApp.fetch('https://api.fonnte.com/send', {
            method: 'post',
            headers: { 'Authorization': fonnteToken },
            payload: {
              target: hp62_(tujuan),
              message: pesan,
              countryCode: '62'
            },
            muteHttpExceptions: true
          });
          const resCode = res.getResponseCode();
          if (resCode >= 200 && resCode < 300) success = true;
        } catch (e) {
          Logger.log('WA Send Error: ' + e.message);
        }
      }

      // 2. Kirim via Email (MailApp)
      if (kanal === 'EMAIL' && tujuan && tujuan.includes('@')) {
        try {
          MailApp.sendEmail({
            to: tujuan,
            subject: subjek || 'Pemberitahuan E-Surat Kuasa Pengadilan Negeri',
            body: pesan
          });
          success = true;
        } catch (e) {
          Logger.log('Email Send Error: ' + e.message);
        }
      }

      // Update status antrean
      sh.getRange(r + 1, statusIdx + 1).setValue(success ? 'Terkirim' : 'Gagal');
      Utilities.sleep(1500); // Jeda aman antar pesan
    }

    props.setProperty('ANTRIAN_ADA', hasPending ? '1' : '0');
  } catch (err) {
    Logger.log('prosesAntrianNotif Exception: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 3. PASANG TRIGGER WAKTU OTOMATIS (SETIAP 1-5 MENIT)
// =========================================================================

function pasangTriggerNotifikasi() {
  // Hapus trigger lama agar tidak dobel
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'prosesAntrianNotif') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Buat trigger waktu baru per 5 menit
  ScriptApp.newTrigger('prosesAntrianNotif')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('✅ Trigger otomatis prosesAntrianNotif (setiap 5 menit) berhasil dipasang.');
}
