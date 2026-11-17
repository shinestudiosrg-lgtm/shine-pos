import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function ReportPrintModal({ 
  isOpen, 
  onClose, 
  periodLabel, 
  filteredInvoices, 
  totalOmset, 
  labaBersih, 
  totalHPP,
  totalDiskon,
  omsetTunai, 
  omsetQRIS, 
  omsetTransfer, 
  cashierBreakdown,
  topProducts,
  dailyBreakdown,
  selectedCashier
}) {
  const { settings } = useData();
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl shine-card overflow-hidden my-auto max-h-[92vh] flex flex-col bg-white">
        
        {/* Modal Controls - Hidden during print */}
        <div className="p-4 bg-[#032653] text-white border-b-2 border-[#032653] flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#ffd028]" />
            <div>
              <h3 className="font-black text-white text-sm">Pratinjau Cetak Rekap Laporan</h3>
              <p className="text-[11px] text-[#e8f0ff]">Format resmi siap cetak ke printer A4 atau simpan sebagai file PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#063b7a] hover:shadow-[3px_3px_0_#063b7a] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-rose-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto font-sans text-slate-800 text-xs print-document" id="printable-report">
          {/* Studio Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h1 className="text-xl font-black text-[#032653] tracking-wider uppercase">
              {settings?.storeName || 'SHINE PHOTO STUDIO'}
            </h1>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Self Photo Studio • Photobox • Unlimited Photobooth Souvenir
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {settings?.address || 'Perum. Persada Banten Blok I1 No 5, Kel. Kepuren Kec. Walantaka Kota Serang'} | WhatsApp: {settings?.phone || '085121809135'}
            </p>
          </div>

          {/* Title & Metadata */}
          <div className="my-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <h2 className="text-sm font-black text-[#032653] uppercase tracking-wide">
                LAPORAN REKAPITULASI PENJUALAN & OMSET
              </h2>
              <p className="text-xs font-bold text-slate-700 mt-0.5">
                Periode: <span className="font-black text-[#063b7a]">{periodLabel}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Filter Staf: <span className="font-semibold">{selectedCashier === 'semua' ? 'Semua Kasir & Owner' : selectedCashier}</span>
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>Waktu Cetak: <span className="font-semibold">{printDateStr}</span></p>
              <p>Dicetak Oleh: <span className="font-bold text-slate-800">{currentUser?.name || 'Owner'}</span></p>
            </div>
          </div>

          {/* 1. Ringkasan Finansial Utama */}
          <div className="mb-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-300">
              I. Ringkasan Utama Finansial
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Omset (Lunas)</span>
                <span className="text-base font-black text-[#032653]">{formatRp(totalOmset)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{filteredInvoices.length} Faktur Sukses</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Estimasi Laba Bersih</span>
                <span className="text-base font-black text-emerald-700">{formatRp(labaBersih)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">HPP Studio: {formatRp(totalHPP)}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Rata-rata Transaksi (AOV)</span>
                <span className="text-base font-black text-[#063b7a]">
                  {formatRp(filteredInvoices.length ? Math.round(totalOmset / filteredInvoices.length) : 0)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">per transaksi</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Diskon Diberikan</span>
                <span className="text-base font-black text-rose-600">{formatRp(totalDiskon)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Promosi / Member</span>
              </div>
            </div>
          </div>

          {/* 2. Rekapitulasi Metode Pembayaran */}
          <div className="mb-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-300">
              II. Rekonsiliasi Kas & Metode Pembayaran
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="p-2 border border-slate-300 font-black">Metode Pembayaran</th>
                  <th className="p-2 border border-slate-300 font-black text-center">Jumlah Transaksi</th>
                  <th className="p-2 border border-slate-300 font-black text-right">Nominal Omset</th>
                  <th className="p-2 border border-slate-300 font-black text-right">Porsi (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300 font-bold text-emerald-800">1. Tunai (Kas Fisik Kasir)</td>
                  <td className="p-2 border border-slate-300 text-center">
                    {filteredInvoices.filter(i => i.paymentMethod === 'Tunai').length}
                  </td>
                  <td className="p-2 border border-slate-300 text-right font-black text-emerald-800">{formatRp(omsetTunai)}</td>
                  <td className="p-2 border border-slate-300 text-right">
                    {totalOmset > 0 ? ((omsetTunai / totalOmset) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-bold text-blue-800">2. QRIS (Digital Settlement)</td>
                  <td className="p-2 border border-slate-300 text-center">
                    {filteredInvoices.filter(i => i.paymentMethod === 'QRIS').length}
                  </td>
                  <td className="p-2 border border-slate-300 text-right font-black text-blue-800">{formatRp(omsetQRIS)}</td>
                  <td className="p-2 border border-slate-300 text-right">
                    {totalOmset > 0 ? ((omsetQRIS / totalOmset) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-bold text-indigo-800">3. Transfer Bank BRI</td>
                  <td className="p-2 border border-slate-300 text-center">
                    {filteredInvoices.filter(i => i.paymentMethod === 'Transfer').length}
                  </td>
                  <td className="p-2 border border-slate-300 text-right font-black text-indigo-800">{formatRp(omsetTransfer)}</td>
                  <td className="p-2 border border-slate-300 text-right">
                    {totalOmset > 0 ? ((omsetTransfer / totalOmset) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr className="bg-slate-100 font-black">
                  <td className="p-2 border border-slate-300">TOTAL PEMASUKAN</td>
                  <td className="p-2 border border-slate-300 text-center">{filteredInvoices.length}</td>
                  <td className="p-2 border border-slate-300 text-right text-[#032653] font-black">{formatRp(totalOmset)}</td>
                  <td className="p-2 border border-slate-300 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Rekapitulasi Per Karyawan / Kasir */}
          <div className="mb-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-300">
              III. Rekapitulasi Performa Kasir / Karyawan
            </h3>
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="p-2 border border-slate-300 font-black">Nama Kasir</th>
                  <th className="p-2 border border-slate-300 font-black text-center">Jml Transaksi</th>
                  <th className="p-2 border border-slate-300 font-black text-right">Tunai</th>
                  <th className="p-2 border border-slate-300 font-black text-right">QRIS</th>
                  <th className="p-2 border border-slate-300 font-black text-right">Transfer</th>
                  <th className="p-2 border border-slate-300 font-black text-right">Total Omset</th>
                  <th className="p-2 border border-slate-300 font-black text-right">Kontribusi</th>
                </tr>
              </thead>
              <tbody>
                {cashierBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-slate-500 italic">Tidak ada data transaksi.</td>
                  </tr>
                ) : (
                  cashierBreakdown.map((row) => (
                    <tr key={row.name}>
                      <td className="p-2 border border-slate-300 font-bold">{row.name}</td>
                      <td className="p-2 border border-slate-300 text-center">{row.totalTx}</td>
                      <td className="p-2 border border-slate-300 text-right">{formatRp(row.tunai)}</td>
                      <td className="p-2 border border-slate-300 text-right">{formatRp(row.qris)}</td>
                      <td className="p-2 border border-slate-300 text-right">{formatRp(row.transfer)}</td>
                      <td className="p-2 border border-slate-300 text-right font-black text-[#032653]">{formatRp(row.totalOmset)}</td>
                      <td className="p-2 border border-slate-300 text-right">
                        {totalOmset > 0 ? ((row.totalOmset / totalOmset) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Rekap Harian (Daily Breakdown) if multi-day */}
          {dailyBreakdown && dailyBreakdown.length > 1 && (
            <div className="mb-6">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-300">
                IV. Rekapitulasi Omset Harian
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="p-2 border border-slate-300 font-black">Tanggal</th>
                    <th className="p-2 border border-slate-300 font-black text-center">Transaksi</th>
                    <th className="p-2 border border-slate-300 font-black text-right">Tunai</th>
                    <th className="p-2 border border-slate-300 font-black text-right">Non-Tunai (QRIS/TF)</th>
                    <th className="p-2 border border-slate-300 font-black text-right">Total Omset Harian</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.map(day => (
                    <tr key={day.dateStr}>
                      <td className="p-2 border border-slate-300 font-semibold">{day.formattedDate}</td>
                      <td className="p-2 border border-slate-300 text-center">{day.txCount}</td>
                      <td className="p-2 border border-slate-300 text-right">{formatRp(day.tunai)}</td>
                      <td className="p-2 border border-slate-300 text-right">{formatRp(day.nonTunai)}</td>
                      <td className="p-2 border border-slate-300 text-right font-bold">{formatRp(day.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black">
                    <td className="p-2 border border-slate-300">TOTAL</td>
                    <td className="p-2 border border-slate-300 text-center">{filteredInvoices.length}</td>
                    <td className="p-2 border border-slate-300 text-right">{formatRp(omsetTunai)}</td>
                    <td className="p-2 border border-slate-300 text-right">{formatRp(omsetQRIS + omsetTransfer)}</td>
                    <td className="p-2 border border-slate-300 text-right font-black text-[#032653]">{formatRp(totalOmset)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Layanan & Produk Terlaris */}
          {topProducts && topProducts.length > 0 && (
            <div className="mb-6">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-300">
                V. Top 5 Layanan & Produk Terlaris
              </h3>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="p-2 border border-slate-300 font-black text-center w-10">No</th>
                    <th className="p-2 border border-slate-300 font-black">Nama Layanan / Produk</th>
                    <th className="p-2 border border-slate-300 font-black">Kategori</th>
                    <th className="p-2 border border-slate-300 font-black text-center">Terjual (Qty)</th>
                    <th className="p-2 border border-slate-300 font-black text-right">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 5).map((prod, idx) => (
                    <tr key={prod.name}>
                      <td className="p-2 border border-slate-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border border-slate-300 font-bold">{prod.name}</td>
                      <td className="p-2 border border-slate-300 text-slate-600">{prod.category}</td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{prod.qty}x</td>
                      <td className="p-2 border border-slate-300 text-right font-black">{formatRp(prod.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="text-slate-600">Dibuat Oleh,</p>
              <div className="h-16" />
              <p className="font-black text-slate-900 underline">{currentUser?.name || 'Kasir Bertugas'}</p>
              <p className="text-[11px] text-slate-500 capitalize">Staf / Kasir Shine Studio</p>
            </div>
            <div>
              <p className="text-slate-600">Mengetahui & Menyetujui,</p>
              <div className="h-16" />
              <p className="font-black text-slate-900 underline">Owner Studio</p>
              <p className="text-[11px] text-slate-500">Pimpinan Shine Photo Studio</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
