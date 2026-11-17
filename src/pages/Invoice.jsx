import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  RotateCcw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle,
  X,
  Eye,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ReceiptModal from '../components/ReceiptModal';

export default function Invoice() {
  const { 
    invoices, 
    deleteTransaction, 
    requestDeleteTransaction, 
    approveDeleteTransaction, 
    rejectDeleteTransaction,
    refundTransaction
  } = useData();
  const { currentUser } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [filterPayment, setFilterPayment] = useState('Semua');

  // Date Filter States
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const defaultMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const [dateFilterType, setDateFilterType] = useState('Semua'); // 'Semua', 'Hari Ini', 'Bulan Ini', 'Pilih Bulan', 'Rentang Tanggal'
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);
  const [startDate, setStartDate] = useState(`${currentYear}-${String(currentMonthNum).padStart(2, '0')}-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Deletion Request Modal State (Karyawan)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [targetInvoiceForRequest, setTargetInvoiceForRequest] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.cashierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = filterPayment === 'Semua' || inv.paymentMethod === filterPayment;
    if (!matchesSearch || !matchesPayment) return false;

    if (!inv.date) return dateFilterType === 'Semua';
    const invDate = new Date(inv.date);
    const invDateStr = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}-${String(invDate.getDate()).padStart(2, '0')}`;
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (dateFilterType === 'Hari Ini') {
      return invDateStr === todayStr;
    }
    if (dateFilterType === 'Bulan Ini') {
      return invDateStr.startsWith(todayStr.slice(0, 7));
    }
    if (dateFilterType === 'Pilih Bulan') {
      if (!selectedMonth) return true;
      return invDateStr.startsWith(selectedMonth);
    }
    if (dateFilterType === 'Rentang Tanggal') {
      if (startDate && invDateStr < startDate) return false;
      if (endDate && invDateStr > endDate) return false;
      return true;
    }

    return true; // 'Semua'
  });

  const pendingDeleteInvoices = invoices.filter(inv => 
    inv.deleteRequest && 
    typeof inv.deleteRequest === 'object' && 
    Boolean(inv.deleteRequest.reason || inv.deleteRequest.requestedBy)
  );

  const handleOpenReceipt = (inv) => {
    setSelectedInvoice(inv);
    setShowReceiptModal(true);
  };

  const handleOwnerDelete = (inv) => {
    if (confirm(`[OWNER] Apakah Anda yakin ingin menghapus transaksi ${inv.invoiceNumber}? Stok produk akan otomatis dikembalikan.`)) {
      deleteTransaction(inv.id);
    }
  };

  const handleOpenRequestModal = (inv) => {
    setTargetInvoiceForRequest(inv);
    setDeleteReason('Salah input nominal / paket foto');
    setShowRequestModal(true);
  };

  const handleSendDeleteRequest = (e) => {
    e.preventDefault();
    if (targetInvoiceForRequest) {
      requestDeleteTransaction(targetInvoiceForRequest.id, deleteReason, currentUser?.name || 'Kasir');
      alert(`Permintaan hapus transaksi ${targetInvoiceForRequest.invoiceNumber} telah dikirim ke Owner untuk disetujui!`);
    }
    setShowRequestModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#032653] dark:text-white tracking-tight">Riwayat Invoice & Struk Transaksi</h1>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold">
            {isOwner 
              ? 'Arsip faktur kasir, cetak ulang struk, dan hapus transaksi salah input (dengan auto-restock).' 
              : 'Arsip faktur kasir. Jika terjadi kesalahan input, kirim permintaan hapus ke Owner untuk disetujui.'}
          </p>
        </div>
      </div>

      {/* Owner Alert Banner for Pending Deletion Requests - ONLY renders if pendingDeleteInvoices.length > 0 */}
      {isOwner && pendingDeleteInvoices.length > 0 && (
        <div className="rounded-2xl p-5 border-2 border-[#032653] bg-[#ffd028] text-[#032653] shadow-[4px_4px_0_#032653] space-y-3">
          <div className="flex items-center gap-2 font-black text-sm">
            <Clock className="w-5 h-5 stroke-[2.5] animate-pulse" />
            <span>{pendingDeleteInvoices.length} Permintaan Hapus Transaksi Menunggu Persetujuan Anda</span>
          </div>

          <div className="space-y-2">
            {pendingDeleteInvoices.map((inv) => (
              <div key={inv.id} className="p-3 bg-white border-2 border-[#032653] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-sm">
                <div>
                  <span className="font-mono font-black text-[#032653] bg-[#ffd028] px-2 py-0.5 rounded border border-[#032653]">{inv.invoiceNumber}</span>
                  <span className="font-black text-[#032653] ml-2">Total: {formatRp(inv.grandTotal)}</span>
                  <p className="text-[#5d6878] text-[11px] font-bold mt-1">
                    Diminta oleh: <strong className="text-[#032653]">{inv.deleteRequest?.requestedBy}</strong> — Alasan: <span className="font-black">"{inv.deleteRequest?.reason}"</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => rejectDeleteTransaction(inv.id)}
                    className="px-3 py-1.5 rounded-lg bg-white border-2 border-[#032653] text-[#032653] font-black text-[11px] hover:bg-[#f4f7fb]"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => approveDeleteTransaction(inv.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#032653] text-white border-2 border-[#032653] font-black text-[11px] shadow-[2px_2px_0_#ffd028]"
                  >
                    Setujui Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="shine-card p-5 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80 flex items-center">
            <Search className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no. faktur, nama kasir, atau pelanggan..."
              className="shine-input shine-input-with-icon pr-4 py-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-black text-[#032653] dark:text-[#ffd028] whitespace-nowrap">Metode:</span>
            {['Semua', 'Tunai', 'QRIS', 'Transfer'].map(m => (
              <button
                key={m}
                onClick={() => setFilterPayment(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  filterPayment === m
                    ? 'bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[2px_2px_0_#032653] scale-[1.02]'
                    : 'bg-white dark:bg-[#063b7a] text-[#5d6878] dark:text-[#e8f0ff] border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Date Period Filter Tabs */}
        <div className="pt-2 border-t border-[#d9e1ec] dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-black text-[#032653] dark:text-[#ffd028] mr-1">Periode:</span>
            {['Semua', 'Hari Ini', 'Bulan Ini', 'Pilih Bulan', 'Rentang Tanggal'].map(p => (
              <button
                key={p}
                onClick={() => setDateFilterType(p)}
                className={`px-3 py-1 rounded-lg text-xs font-black border transition-all ${
                  dateFilterType === p
                    ? 'bg-[#032653] text-[#ffd028] border-[#032653] shadow-sm'
                    : 'bg-[#f4f7fb] dark:bg-white/5 text-[#5d6878] dark:text-white/70 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-[#5d6878] dark:text-white/70">
            Ditemukan: <strong className="text-[#032653] dark:text-[#ffd028] font-black">{filteredInvoices.length} Faktur</strong>
          </span>
        </div>

        {/* Conditional Date Inputs */}
        {dateFilterType === 'Pilih Bulan' && (
          <div className="p-3 bg-[#f4f7fb] dark:bg-white/5 rounded-xl border border-[#d9e1ec] dark:border-white/10 flex items-center gap-3 text-xs">
            <span className="font-black text-[#032653] dark:text-[#ffd028]">Pilih Bulan & Tahun:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="shine-input font-bold max-w-xs"
            />
          </div>
        )}

        {dateFilterType === 'Rentang Tanggal' && (
          <div className="p-3 bg-[#f4f7fb] dark:bg-white/5 rounded-xl border border-[#d9e1ec] dark:border-white/10 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-[#032653] dark:text-[#ffd028]">Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="shine-input font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-[#032653] dark:text-[#ffd028]">Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="shine-input font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Invoice Table */}
      <div className="shine-table-wrap">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#032653] text-white">
              <tr>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">No. Faktur</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Waktu Transaksi</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Pelanggan</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Kasir</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Metode</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Grand Total</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider">Status</th>
                <th className="p-4 font-black text-[11px] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 bg-white dark:bg-[#06346b] text-[#101828] dark:text-white">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#5d6878] dark:text-white/60 font-bold">
                    Tidak ada faktur transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPendingDelete = Boolean(
                    inv.deleteRequest && 
                    typeof inv.deleteRequest === 'object' && 
                    (inv.deleteRequest.reason || inv.deleteRequest.requestedBy)
                  );

                  return (
                    <tr key={inv.id} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-black text-[#032653] dark:text-[#ffd028]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 text-[#5d6878] dark:text-white/70 font-semibold">
                        {new Date(inv.date).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 font-black text-[#032653] dark:text-white">{inv.customerName || 'Umum'}</td>
                      <td className="p-4 font-semibold text-[#5d6878] dark:text-white/80">{inv.cashierName}</td>
                      <td className="p-4 font-black text-[#063b7a] dark:text-[#ffd028] uppercase">{inv.paymentMethod}</td>
                      <td className="p-4 font-black text-[#032653] dark:text-white">{formatRp(inv.grandTotal)}</td>
                      <td className="p-4">
                        {isPendingDelete ? (
                          <span className="bg-[#ffd028] text-[#032653] border border-[#032653] px-2.5 py-1 rounded-lg text-[10px] font-black animate-pulse shadow-sm">
                            Menunggu Approval
                          </span>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase ${
                            inv.status === 'Lunas' 
                              ? 'bg-[#e6f9ed] text-[#0e7036] border border-[#a3e6be]' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {inv.status}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReceipt(inv)}
                            className="px-3 py-1.5 rounded-lg bg-[#032653] text-white border-2 border-[#032653] text-[11px] font-black flex items-center gap-1.5 shadow-[2px_2px_0_#ffd028] hover:bg-[#063b7a] transition-all"
                            title="Buka & Cetak Struk Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Buka Invoice</span>
                          </button>

                          {isOwner ? (
                            <button
                              onClick={() => handleOwnerDelete(inv)}
                              className="p-1.5 rounded-lg bg-rose-100 border-2 border-rose-400 text-rose-700 hover:bg-rose-500 hover:text-white transition-colors"
                              title="Hapus Transaksi (Owner)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            !isPendingDelete && (
                              <button
                                onClick={() => handleOpenRequestModal(inv)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#ffd028] text-[#032653] border-2 border-[#032653] text-[11px] font-black flex items-center gap-1 shadow-sm"
                                title="Minta Hapus Ke Owner"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>Minta Hapus</span>
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Karyawan Request Delete */}
      {showRequestModal && targetInvoiceForRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm shine-card p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10 mb-4">
              <h3 className="font-black text-[#032653] dark:text-white text-base">Permintaan Hapus Transaksi</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1.5 rounded-lg bg-[#f4f7fb] dark:bg-white/10 text-[#032653] dark:text-white">
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSendDeleteRequest} className="space-y-4 text-xs">
              <div className="p-3 bg-[#f4f7fb] dark:bg-[#06346b] rounded-xl border border-[#d9e1ec] dark:border-white/10 space-y-1">
                <p className="text-[#5d6878] dark:text-white/70 font-semibold">No. Faktur:</p>
                <p className="font-mono font-black text-[#032653] dark:text-[#ffd028] text-sm">{targetInvoiceForRequest.invoiceNumber}</p>
                <p className="text-[#032653] dark:text-white font-black">Total: {formatRp(targetInvoiceForRequest.grandTotal)}</p>
              </div>

              <div>
                <label className="block font-black text-[#032653] dark:text-white mb-1.5">Alasan Kesalahan Input Transaksi</label>
                <textarea
                  rows={3}
                  required
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Contoh: Salah pilih paket foto / salah input nominal uang"
                  className="shine-input"
                />
              </div>

              <p className="text-[11px] text-[#032653] dark:text-[#ffd028] leading-relaxed bg-[#fff7cc] dark:bg-[#06346b] border-2 border-[#ffd028] p-3 rounded-xl font-bold">
                📌 Permintaan hapus akan terkirim ke Owner. Setelah disetujui, transaksi akan dihapus dan stok produk otomatis dikembalikan.
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t-2 border-[#d9e1ec] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#063b7a] border-2 border-[#032653] text-[#032653] dark:text-white font-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black shadow-[2px_2px_0_#032653]"
                >
                  Kirim Ke Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReceiptModal
        invoice={selectedInvoice}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
}
