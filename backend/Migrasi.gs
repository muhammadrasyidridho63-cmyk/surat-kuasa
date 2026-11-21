/**
 * =========================================================================
 * MIGRASI.GS — MIGRASI & DELTA-SYNC DATABASE ANTAR-SPREADSHEET (IDEMPOTEN)
 * =========================================================================
 * Mematuhi 8 Prinsip /gas-migrasi-database:
 * 1. Spreadsheet lama HANYA dibaca (tidak pernah ditulis/disentuh)
 * 2. Berbasis nama header kolom (bukan indeks posisi)
 * 3. Upsert idempoten berbasis kunci alami (User_ID/Username, Permohonan_ID, Berkas_ID)
 * 4. Dry-Run (mode pindai) sebelum menulis data nyata
 * 5. Batch di memori (1x getValues, 1x setValues — tanpa appendRow di loop)
 */

function openSourceSpreadsheet_(idOrUrl) {
  const m = String(idOrUrl || '').match(/\/d\/([A-Za-z0-9_-]{20,})/);
  const id = m ? m[1] : String(idOrUrl || '').trim();
  if (!id) throw new Error('ID atau URL Spreadsheet sumber belum diisi.');
  if (id === getSpreadsheet_().getId()) {
    throw new Error('Spreadsheet yang dimasukkan adalah database aktif saat ini. Masukkan ID spreadsheet LAMA.');
  }
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    throw new Error('Spreadsheet sumber tidak dapat dibuka. Pastikan ID benar dan berada di akun Google yang sama.');
  }
}

function readSourceByHeader_(ss, sheetName) {
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return null;
  const v = sh.getDataRange().getValues();
  if (v.length <= 1) return [];
  const h = v[0].map(function (c) { return String(c || '').trim(); });
  return v.slice(1)
    .filter(function (r) { return r.join('').trim() !== ''; })
    .map(function (r) {
      const o = {};
      h.forEach(function (k, i) { if (k) o[k] = r[i]; });
      return o;
    });
}

function upsertPlan_(plan, dryRun) {
  const sh = getSheet_(plan.target);
  const values = sh.getDataRange().getValues();
  const h = values[0].map(function (c) { return String(c || '').trim(); });
  const index = {};

  for (let r = 1; r < values.length; r++) {
    const o = {};
    h.forEach(function (k, i) { o[k] = values[r][i]; });
    const k = plan.key(o);
    if (k) index[k] = r;
  }

  const res = { target: plan.target, inserted: 0, updated: 0, skipped: 0 };
  const newRows = [];
  const seen = {};

  (plan.rows || []).forEach(function (src) {
    const k = plan.key(src);
    if (!k || seen[k]) { res.skipped++; return; }
    seen[k] = true;

    if (index[k] !== undefined) {
      const row = values[index[k]];
      if (plan.onlyIfPending) {
        const stIdx = h.indexOf('Status');
        if (stIdx > -1 && String(row[stIdx]) !== 'Menunggu Verifikasi') {
          res.skipped++;
          return;
        }
      }
      let changed = false;
      (plan.updatable || []).forEach(function (f) {
        const i = h.indexOf(f);
        if (i === -1 || src[f] === undefined || src[f] === '') return;
        if (String(row[i]) !== String(src[f])) {
          row[i] = src[f];
          changed = true;
        }
      });
      if (changed) res.updated++; else res.skipped++;
    } else {
      newRows.push(h.map(function (f) {
        return src[f] !== undefined ? src[f] : '';
      }));
      res.inserted++;
    }
  });

  if (!dryRun && (res.updated > 0 || newRows.length > 0)) {
    if (res.updated > 0 && values.length > 1) {
      sh.getRange(2, 1, values.length - 1, h.length).setValues(values.slice(1));
    }
    if (newRows.length > 0) {
      sh.getRange(sh.getLastRow() + 1, 1, newRows.length, h.length).setValues(newRows);
    }
  }
  return res;
}

/**
 * Jalankan Pindai (dryRun = true) atau Eksekusi Migrasi / Delta-Sync (dryRun = false)
 */
function jalankanMigrasiDatabase_(sourceIdOrUrl, dryRun) {
  const ssSrc = openSourceSpreadsheet_(sourceIdOrUrl);
  const summary = [];

  // 1. Migrasi Sheet USERS
  const srcUsers = readSourceByHeader_(ssSrc, 'USERS');
  if (srcUsers) {
    summary.push(upsertPlan_({
      target: 'USERS',
      rows: srcUsers,
      key: function (o) { return String(o.Username || o.User_ID || '').toLowerCase().trim(); },
      updatable: ['Nama_Lengkap', 'No_HP_WA']
    }, !!dryRun));
  }

  // 2. Migrasi Sheet PERMOHONAN_KUASA (mendukung juga nama sheet lama 'Pengajuan')
  const srcPerm = readSourceByHeader_(ssSrc, 'PERMOHONAN_KUASA') || readSourceByHeader_(ssSrc, 'Pengajuan');
  if (srcPerm) {
    const mappedPerm = srcPerm.map(function (o) {
      return {
        Permohonan_ID: o.Permohonan_ID || o.id_pengajuan || '',
        User_ID: o.User_ID || '',
        Tanggal_Pengajuan: o.Tanggal_Pengajuan || o.tanggal_daftar || new Date().toISOString(),
        Kategori_Kuasa: o.Kategori_Kuasa || o.kategori_pemohon || 'Advokat',
        Nama_Pemohon: o.Nama_Pemohon || o.nama_pemberi_kuasa || '',
        No_HP_WA: o.No_HP_WA || o.no_wa_pemohon || '',
        Status: o.Status || o.status || 'Menunggu Verifikasi',
        Nomor_Register_Resmi: o.Nomor_Register_Resmi || o.nomor_register_resmi || '',
        Catatan_Petugas: o.Catatan_Petugas || o.catatan_petugas || '',
        Petugas_Verifikator: o.Petugas_Verifikator || o.petugas_verifikator || '',
        Tanggal_Verifikasi: o.Tanggal_Verifikasi || o.tanggal_pengesahan || '',
        Hash_Verifikasi: o.Hash_Verifikasi || o.hash_verifikasi || ''
      };
    });
    summary.push(upsertPlan_({
      target: 'PERMOHONAN_KUASA',
      rows: mappedPerm,
      key: function (o) { return String(o.Permohonan_ID || '').trim(); },
      onlyIfPending: true,
      updatable: ['Nama_Pemohon', 'No_HP_WA', 'Kategori_Kuasa']
    }, !!dryRun));
  }

  // 3. Migrasi Sheet BERKAS_UNGGAHAN
  const srcBerkas = readSourceByHeader_(ssSrc, 'BERKAS_UNGGAHAN');
  if (srcBerkas) {
    summary.push(upsertPlan_({
      target: 'BERKAS_UNGGAHAN',
      rows: srcBerkas,
      key: function (o) { return String(o.Permohonan_ID || o.Berkas_ID || '').trim(); },
      updatable: ['Url_KTP_Pemberi', 'Url_KTP_Penerima', 'Url_KTA_Advokat', 'Url_BAS_Advokat', 'Url_Surat_Kuasa', 'Url_Surat_Lurah', 'Updated_At']
    }, !!dryRun));
  }

  if (!dryRun) {
    bump_('permohonan');
    bump_('users');
  }

  return {
    success: true,
    dryRun: !!dryRun,
    sourceName: ssSrc.getName(),
    summary: summary
  };
}
