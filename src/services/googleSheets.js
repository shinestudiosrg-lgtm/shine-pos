/**
 * Service to sync POS data with Google Sheets via Google Apps Script Web App URL
 */

export const fetchFromGoogleSheets = async (webAppUrl) => {
  if (!webAppUrl) return null;
  try {
    const response = await fetch(`${webAppUrl}?action=getAllData`);
    if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google Sheets Sync Fetch Error:', error);
    return null;
  }
};

export const syncToGoogleSheets = async (webAppUrl, actionType, payload) => {
  if (!webAppUrl) return { success: false, message: 'URL Google Sheets belum diatur' };
  try {
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: actionType, data: payload })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Google Sheets Sync Post Error:', error);
    return { success: false, message: error.message };
  }
};

export const GOOGLE_APPS_SCRIPT_CODE = `
// ============================================================
// GOOGLE APPS SCRIPT BACKEND & DATABASE — SHINE PHOTO STUDIO
// SESUAI PERSIS DENGAN SPREADSHEET (ID: 1ARIDZ9JBjkYlHPZ5wqjg0dPsenLZUJwC1nn1JYJAulw)
// ============================================================

var SPREADSHEET_ID = '1ARIDZ9JBjkYlHPZ5wqjg0dPsenLZUJwC1nn1JYJAulw';

var SHEET_NAMES = {
  PRODUCTS: 'Products',
  INVOICES: 'Invoices',
  CUSTOMERS: 'Customers',
  USERS: 'Users',
  SHIFTS: 'Shifts',
  DASHBOARD: 'DASHBOARD'
};

var HEADERS = {
  INVOICES: ['id', 'invoiceNumber', 'date', 'cashierName', 'customerName', 'items', 'subtotal', 'discount', 'tax', 'grandTotal', 'paymentMethod', 'status'],
  PRODUCTS: ['id', 'sku', 'name', 'category', 'buyPrice', 'sellPrice', 'stock', 'minStock', 'image'],
  CUSTOMERS: ['id', 'name', 'phone', 'points', 'totalSpend'],
  USERS: ['id', 'name', 'email', 'password', 'role', 'status', 'phone', 'registeredAt'],
  SHIFTS: ['id', 'cashierName', 'openedAt', 'closedAt', 'initialCash', 'expectedCash', 'actualCash', 'notes']
};

// 17 PRODUK RESMI SHINE PHOTO STUDIO & PHOTOBOOTH
var PRODUK_17_DATA = [
  { id: 'prd-ps-01', sku: 'PS-BSC', name: 'Studio Basic Package (15k/org)', category: 'Photo Studio', buyPrice: 3000, sellPrice: 15000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-02', sku: 'PS-PRM', name: 'Studio Premium Package (25k/org)', category: 'Photo Studio', buyPrice: 5000, sellPrice: 25000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-03', sku: 'PS-GLD', name: 'Studio Gold Package (35k/org)', category: 'Photo Studio', buyPrice: 8000, sellPrice: 35000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-04', sku: 'PS-GRP', name: 'Studio Group Package (Max 5 Org)', category: 'Photo Studio', buyPrice: 30000, sellPrice: 150000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-05', sku: 'PS-FML', name: 'Studio Family Package (Max 5 Org)', category: 'Photo Studio', buyPrice: 45000, sellPrice: 200000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-06', sku: 'PS-BDL', name: 'Bundling Package (Studio + Photobox 2 Org)', category: 'Photo Studio', buyPrice: 15000, sellPrice: 80000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-07', sku: 'PS-ADD-ORG', name: 'Penambahan Orang Studio/Bundling', category: 'Photo Studio', buyPrice: 5000, sellPrice: 35000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-08', sku: 'PS-ADD-WKT', name: 'Tambahan Waktu Studio (400k/jam)', category: 'Photo Studio', buyPrice: 50000, sellPrice: 400000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-ps-09', sku: 'PS-ADD-HRH', name: 'Tambahan Waktu Studio Hari H (500k/jam)', category: 'Photo Studio', buyPrice: 60000, sellPrice: 500000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pb-01', sku: 'PB-BSC', name: 'Photobox Basic Package (10k/org)', category: 'Photo Box', buyPrice: 2000, sellPrice: 10000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pb-02', sku: 'PB-PRM', name: 'Photobox Premium Package (20k/org)', category: 'Photo Box', buyPrice: 4000, sellPrice: 20000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pb-03', sku: 'PB-GLD', name: 'Photobox Gold Package (25k/org)', category: 'Photo Box', buyPrice: 5000, sellPrice: 25000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pbt-01', sku: 'PBT-2R', name: 'Photobooth 2R Package (Unlimited 3 Jam)', category: 'Photobooth', buyPrice: 500000, sellPrice: 1900000, stock: 100, minStock: 2, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pbt-02', sku: 'PBT-4R', name: 'Photobooth 4R Package (Unlimited 3 Jam)', category: 'Photobooth', buyPrice: 600000, sellPrice: 2300000, stock: 100, minStock: 2, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pbt-03', sku: 'PBT-NOPRINT', name: 'Photobooth No Print Package (Unlimited 3 Jam)', category: 'Photobooth', buyPrice: 300000, sellPrice: 1000000, stock: 100, minStock: 2, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pbt-04', sku: 'PBT-ADD-WKT', name: 'Tambahan Waktu Photobooth (400k/jam)', category: 'Photobooth', buyPrice: 50000, sellPrice: 400000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80' },
  { id: 'prd-pbt-05', sku: 'PBT-ADD-HRH', name: 'Tambahan Waktu Photobooth Hari H (500k/jam)', category: 'Photobooth', buyPrice: 60000, sellPrice: 500000, stock: 100, minStock: 5, image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80' }
];

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch(e) {
      Logger.log('Gagal openById: ' + e);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

// ============================================================
// JALANKAN FUNGSI INI SEKALI UNTUK MENGISI 17 PRODUK OTOMATIS
// ============================================================
function isi17Produk() {
  var ss = getSpreadsheet();
  saveSheetData(ss, SHEET_NAMES.PRODUCTS, HEADERS.PRODUCTS, PRODUK_17_DATA);
  updateDashboard(ss);
  Logger.log('✅ BERHASIL: 17 Produk resmi telah dimasukkan ke sheet Products!');
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action ? e.parameter.action : '';
  var ss = getSpreadsheet();

  if (action === 'getAllData') {
    var result = {
      products: getSheetData(ss, SHEET_NAMES.PRODUCTS),
      invoices: getSheetData(ss, SHEET_NAMES.INVOICES),
      customers: getSheetData(ss, SHEET_NAMES.CUSTOMERS),
      users: getSheetData(ss, SHEET_NAMES.USERS),
      shifts: getSheetData(ss, SHEET_NAMES.SHIFTS)
    };
    return responseJSON(result);
  }

  // Tampilkan antarmuka Web App jika file template index.html ada
  try {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('SHINE PHOTO STUDIO - Kasir & Photobooth')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return responseJSON({ 
      status: 'ok', 
      app: 'SHINE POS Database & Backend', 
      message: 'Google Sheets API Aktif & Terhubung ke Spreadsheet',
      note: 'Tambahkan file HTML bernama "index" di Apps Script Editor untuk membuka antarmuka aplikasi kasir langsung di URL ini.'
    });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ success: false, message: 'Data POST tidak ditemukan' });
    }

    var postData = JSON.parse(e.postData.contents);
    var action = postData.action || '';
    var data = postData.data || {};
    var ss = getSpreadsheet();

    // ── 1. TRANSAKSI BARU (Append ke Invoices) ──
    if (action === 'createTransaction') {
      var sheet = getOrCreateSheet(ss, SHEET_NAMES.INVOICES, HEADERS.INVOICES);
      var row = [
        data.id || '',
        data.invoiceNumber || '',
        data.date || new Date().toISOString(),
        data.cashierName || 'Owner Studio',
        data.customerName || 'Umum / Walk-in Customer',
        typeof data.items === 'string' ? data.items : JSON.stringify(data.items || []),
        toNumber(data.subtotal),
        toNumber(data.discount),
        toNumber(data.tax),
        toNumber(data.grandTotal),
        data.paymentMethod || 'Tunai',
        data.status || 'Lunas'
      ];
      sheet.appendRow(row);
      updateDashboard(ss);
      return responseJSON({ success: true, message: 'Transaksi berhasil disimpan ke Google Sheets' });
    }

    // ── 2. SINKRONISASI INVOICES (Setelah Hapus/Edit Transaksi) ──
    if (action === 'syncInvoices') {
      saveSheetData(ss, SHEET_NAMES.INVOICES, HEADERS.INVOICES, data);
      updateDashboard(ss);
      return responseJSON({ success: true, message: 'Data seluruh invoice berhasil disinkronkan' });
    }

    // ── 3. SINKRONISASI PRODUK & STOK ──
    if (action === 'syncProducts') {
      saveSheetData(ss, SHEET_NAMES.PRODUCTS, HEADERS.PRODUCTS, data);
      updateDashboard(ss);
      return responseJSON({ success: true, message: 'Data produk berhasil disinkronkan' });
    }

    // ── 4. SINKRONISASI PENGGUNA / KARYAWAN ──
    if (action === 'syncUsers') {
      saveSheetData(ss, SHEET_NAMES.USERS, HEADERS.USERS, data);
      return responseJSON({ success: true, message: 'Data karyawan berhasil disinkronkan' });
    }

    // ── 5. SINKRONISASI PELANGGAN & POIN ──
    if (action === 'syncCustomers') {
      saveSheetData(ss, SHEET_NAMES.CUSTOMERS, HEADERS.CUSTOMERS, data);
      return responseJSON({ success: true, message: 'Data pelanggan berhasil disinkronkan' });
    }

    // ── 6. SINKRONISASI SHIFT KASIR ──
    if (action === 'syncShifts') {
      saveSheetData(ss, SHEET_NAMES.SHIFTS, HEADERS.SHIFTS, data);
      return responseJSON({ success: true, message: 'Data shift kasir berhasil disinkronkan' });
    }

    // ── 7. REBUILD DASHBOARD (Perbaiki Formula DASHBOARD) ──
    if (action === 'rebuildDashboard') {
      updateDashboard(ss);
      return responseJSON({ success: true, message: 'Dashboard berhasil di-rebuild dengan formula terbaru' });
    }

    return responseJSON({ success: false, message: 'Aksi tidak dikenal: ' + action });
  } catch (err) {
    return responseJSON({ success: false, message: err.toString() });
  }
}

// ── FUNGSI BANTUAN DATABASE ──

function responseJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, sheetName, defaultHeaders) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      styleHeader(sheet);
    }
  } else if (sheet.getLastRow() === 0 && defaultHeaders && defaultHeaders.length > 0) {
    sheet.appendRow(defaultHeaders);
    styleHeader(sheet);
  }
  return sheet;
}

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0];
  var result = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var isRowEmpty = row.every(function(val) { return val === '' || val === null || val === undefined; });
    if (isRowEmpty) continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val instanceof Date) {
        val = val.toISOString();
      }
      obj[headers[j]] = val;
    }
    result.push(obj);
  }
  return result;
}

function saveSheetData(ss, sheetName, headers, dataArray) {
  var sheet = getOrCreateSheet(ss, sheetName, headers);
  sheet.clearContents();
  sheet.appendRow(headers);

  if (!Array.isArray(dataArray)) dataArray = [];

  for (var i = 0; i < dataArray.length; i++) {
    var item = dataArray[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = item[headers[j]];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      row.push(val === undefined ? '' : val);
    }
    sheet.appendRow(row);
  }

  styleHeader(sheet);
}

function styleHeader(sheet) {
  if (sheet.getLastRow() >= 1 && sheet.getLastColumn() >= 1) {
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange
      .setBackground('#4F46E5')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
}

function updateDashboard(ss) {
  var dashSheet = ss.getSheetByName(SHEET_NAMES.DASHBOARD);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(SHEET_NAMES.DASHBOARD, 0);
  }

  // Bersihkan seluruh isi sheet DASHBOARD
  dashSheet.clearContents();
  dashSheet.clearFormats();

  // Hitung angka riil langsung dari data Invoices agar 100% akurat tanpa error formula/locale
  var invData = getSheetData(ss, SHEET_NAMES.INVOICES);
  var totalOmset = 0;
  var totalTransaksi = 0;
  var totalDiskon = 0;
  var totalPajak = 0;
  var kasTunai = 0;
  var kasQRIS = 0;
  var kasTransfer = 0;

  for (var i = 0; i < invData.length; i++) {
    var inv = invData[i];
    var status = String(inv.status || '').toLowerCase().trim();
    if (status === 'lunas') {
      var grandTotal = toNumber(inv.grandTotal);
      totalOmset += grandTotal;
      totalTransaksi += 1;
      totalDiskon += toNumber(inv.discount);
      totalPajak += toNumber(inv.tax);

      var method = String(inv.paymentMethod || '').toLowerCase().trim();
      if (method.indexOf('tunai') !== -1 || method.indexOf('cash') !== -1) {
        kasTunai += grandTotal;
      } else if (method.indexOf('qris') !== -1) {
        kasQRIS += grandTotal;
      } else if (method.indexOf('transfer') !== -1 || method.indexOf('bri') !== -1 || method.indexOf('bank') !== -1) {
        kasTransfer += grandTotal;
      } else {
        kasTunai += grandTotal;
      }
    }
  }

  dashSheet.getRange('A1:E1').merge()
    .setValue('✨ SHINE PHOTO STUDIO - RINGKASAN PENJUALAN TOKO ✨')
    .setFontWeight('bold').setFontSize(14)
    .setBackground('#032653').setFontColor('#FFFFFF')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  dashSheet.setRowHeight(1, 45);

  dashSheet.getRange('A3').setValue('Ringkasan Finansial Utama').setFontWeight('bold').setFontSize(12).setFontColor('#063B7A');

  dashSheet.getRange('A4').setValue('Total Omset Penjualan (Lunas):');
  dashSheet.getRange('B4').setValue(totalOmset).setFontWeight('bold').setNumberFormat('"Rp "#,##0');

  dashSheet.getRange('A5').setValue('Total Transaksi Sukses:');
  dashSheet.getRange('B5').setValue(totalTransaksi).setFontWeight('bold');

  dashSheet.getRange('A6').setValue('Total Diskon Diberikan:');
  dashSheet.getRange('B6').setValue(totalDiskon).setFontWeight('bold').setNumberFormat('"Rp "#,##0');

  dashSheet.getRange('A7').setValue('Total Pajak Terkumpul:');
  dashSheet.getRange('B7').setValue(totalPajak).setFontWeight('bold').setNumberFormat('"Rp "#,##0');

  dashSheet.getRange('A9').setValue('Rincian Metode Pembayaran').setFontWeight('bold').setFontSize(12).setFontColor('#063B7A');

  dashSheet.getRange('A10').setValue('Kas Tunai (Cash di Kasir):');
  dashSheet.getRange('B10').setValue(kasTunai).setFontWeight('bold').setNumberFormat('"Rp "#,##0');

  dashSheet.getRange('A11').setValue('Kas Masuk QRIS:');
  dashSheet.getRange('B11').setValue(kasQRIS).setFontWeight('bold').setNumberFormat('"Rp "#,##0');

  dashSheet.getRange('A12').setValue('Kas Masuk Transfer Bank BRI:');
  dashSheet.getRange('B12').setValue(kasTransfer).setFontWeight('bold').setNumberFormat('"Rp "#,##0');

  dashSheet.getRange('A4:A7').setFontWeight('bold').setFontColor('#334155');
  dashSheet.getRange('A10:A12').setFontWeight('bold').setFontColor('#334155');
  dashSheet.setColumnWidth(1, 280);
  dashSheet.setColumnWidth(2, 200);

  // Waktu pembaruan otomatis
  dashSheet.getRange('A14').setValue('Terakhir diperbarui otomatis: ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss') + ' WIB')
    .setFontSize(9).setFontColor('#666666').setFontStyle('italic');
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  var cleaned = String(value).replace(/[^\\d.-]/g, '');
  var number = Number(cleaned);
  return isNaN(number) ? 0 : number;
}
`;
