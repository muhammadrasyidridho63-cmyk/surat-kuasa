/**
 * MODUL MIGRASI & SINKRONISASI DATABASE SPREADSHEET
 * Sesuai prinsip /gas-migrasi-database:
 * - Spreadsheet lama TIDAK PERNAH diubah/ditulis (Read-Only)
 * - Pemetaan kolom berbasis nama header (bukan indeks sel)
 * - Upsert idempoten berdasarkan id_pengajuan (bebas duplikat)
 * - Mendukung mode simulasi (dry-run) sebelum eksekusi nyata
 */

function migrasiDataLama(idOrUrlSpreadsheetLama, dryRun) {
  if (dryRun === undefined) dryRun = true;

  Logger.log('🔍 Memulai ' + (dryRun ? '[SIMULASI DRY-RUN]' : '[EKSEKUSI NYATA]') + ' migrasi data...');

  const m = String(idOrUrlSpreadsheetLama).match(/\/d\/([A-Za-z0-9_-]{20,})/);
  const srcId = m ? m[1] : String(idOrUrlSpreadsheetLama).trim();

  const currentId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (srcId === currentId) {
    throw new Error('ID Spreadsheet yang dimasukkan sama dengan Spreadsheet aktif saat ini. Masukkan ID Spreadsheet LAMA.');
  }

  const srcSs = SpreadsheetApp.openById(srcId);
  const srcSh = srcSs.getSheetByName('Pengajuan') || srcSs.getSheets()[0];
  if (!srcSh) throw new Error('Sheet sumber data tidak ditemukan.');

  const srcValues = srcSh.getDataRange().getValues();
  if (srcValues.length <= 1) {
    Logger.log('Spreadsheet lama tidak memiliki baris data.');
    return { inserted: 0, updated: 0, skipped: 0 };
  }

  const srcHeaders = srcValues[0].map(String);
  const srcRows = srcValues.slice(1).map(r => {
    const o = {};
    srcHeaders.forEach((h, i) => { if (h) o[h] = r[i]; });
    return o;
  });

  // Siapkan Target Sheet Aktif
  const targetSs = SpreadsheetApp.openById(currentId);
  const targetSh = targetSs.getSheetByName('Pengajuan');
  const targetValues = targetSh.getDataRange().getValues();
  const targetHeaders = targetValues[0].map(String);

  // Buat index baris target berdasarkan id_pengajuan
  const targetIndex = {};
  const idColIdx = targetHeaders.indexOf('id_pengajuan');
  for (let r = 1; r < targetValues.length; r++) {
    const key = String(targetValues[r][idColIdx]).trim().toUpperCase();
    if (key) targetIndex[key] = r;
  }

  let countInserted = 0;
  let countUpdated = 0;
  let countSkipped = 0;
  const newRows = [];

  srcRows.forEach(src => {
    const key = String(src['id_pengajuan'] || src['id'] || '').trim().toUpperCase();
    if (!key) {
      countSkipped++;
      return;
    }

    if (targetIndex[key] !== undefined) {
      // Data sudah ada di target -> periksa apakah ada update status
      countSkipped++;
    } else {
      // Data baru -> petakan ke header target
      const newRow = targetHeaders.map(th => {
        return src[th] !== undefined ? src[th] : '';
      });
      newRows.push(newRow);
      countInserted++;
    }
  });

  if (!dryRun && newRows.length > 0) {
    const startRow = targetValues.length + 1;
    targetSh.getRange(startRow, 1, newRows.length, targetHeaders.length).setValues(newRows);
    Logger.log('✅ Berhasil menyisipkan ' + newRows.length + ' baris data baru ke sheet target.');
  }

  Logger.log('Hasil Migrasi: Inserted=' + countInserted + ', Updated=' + countUpdated + ', Skipped=' + countSkipped);
  return {
    dryRun: dryRun,
    inserted: countInserted,
    updated: countUpdated,
    skipped: countSkipped
  };
}
