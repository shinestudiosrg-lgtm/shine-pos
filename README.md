# ✨ SHINE POS - Sistem Kasir & Manajemen Toko Modern

Aplikasi Point of Sale (POS) Kasir modern berbasis Web yang lengkap dengan manajemen produk, transaksi kasir, struk thermal, laporan keuangan laba bersih, sistem approval pendaftaran karyawan, dan integrasi database Google Sheets secara *real-time*.

---

## 🌟 Fitur Utama

- **Dual-Role Access System**:
  - **Owner**: Akses penuh ke analytics omset & profit bersih, approval karyawan baru, laporan keuangan, dan pengaturan toko.
  - **Karyawan / Kasir**: Akses kasir checkout, pelanggan, dan riwayat transaksi.
- **Workflow Persetujuan Karyawan**: Karyawan mendaftar via aplikasi -> Status awal `Pending Approval` -> Owner menyetujui akun -> Karyawan dapat masuk.
- **Kasir Checkout Workspace**: Fitur pencarian cepat, scan barcode/SKU, diskon %, PPN 11%, pilih pelanggan/poin, multi-pembayaran (Tunai dengan kalkulator kembalian, QRIS, Transfer).
- **Struk Thermal Preview & Printer Simulator**: Preview cetak struk fisik 80mm.
- **Database Google Sheets**: Sinkronisasi data transaksi dan produk otomatis ke Google Sheets.
- **Offline First**: Menggunakan LocalStorage sebagai fallback jika koneksi internet terputus.

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Clone repository ini
git clone https://github.com/USERNAME/shine-pos-app.git

# 2. Masuk ke direktori proyek
cd shine-pos-app

# 3. Install dependensi
npm install

# 4. Jalankan dev server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173/`.

---

## 🔑 Akun Demo Default

- **Owner**: `owner@kasir.com` | `password123`
- **Karyawan**: `kasir@kasir.com` | `password123`

---

## 📄 Lisensi
Dilindungi di bawah lisensi MIT. Silakan gunakan dan kembangkan secara bebas.
