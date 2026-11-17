import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar, 
  ShoppingBag,
  Percent,
  FileSpreadsheet,
  UserCheck,
  Filter,
  CreditCard,
  Banknote,
  QrCode,
  Search,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FileText,
  Clock,
  ArrowUpRight,
  Layers,
  Award
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import ReportPrintModal from '../components/ReportPrintModal';

// Helper Date Formatters
const toLocalDateStr = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatIndonesianDate = (dateVal) => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getMonthNameIndo = (monthIndex) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex] || '';
};

export default function Laporan() {
  const { invoices, products } = useData();
  const { users, currentUser } = useAuth();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const defaultMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  // Filter States
  const [dateFilterType, setDateFilterType] = useState('bulan_ini');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonthStr);
  const [startDate, setStartDate] = useState(`${currentYear}-${String(currentMonthNum).padStart(2, '0')}-01`);
  const [endDate, setEndDate] = useState(toLocalDateStr(today));
  const [customDate, setCustomDate] = useState(toLocalDateStr(today));
  const [selectedCashier, setSelectedCashier] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Print Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  // List of Cashiers
  const cashierList = useMemo(() => {
    const names = new Set();
    users.forEach(u => names.add(u.name));
    invoices.forEach(i => i.cashierName && names.add(i.cashierName));
    return Array.from(names);
  }, [users, invoices]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  // Human Readable Period Label
  const periodLabel = useMemo(() => {
    const now = new Date();
    if (dateFilterType === 'bulan_ini') {
      return `Bulan Ini (${getMonthNameIndo(now.getMonth())} ${now.getFullYear()})`;
    }
    if (dateFilterType === 'bulan_lalu') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `Bulan Lalu (${getMonthNameIndo(lastMonth.getMonth())} ${lastMonth.getFullYear()})`;
    }
    if (dateFilterType === 'pilih_bulan') {
      if (!selectedMonth) return 'Bulan Pilihan';
      const [y, m] = selectedMonth.split('-').map(Number);
      return `Bulan ${getMonthNameIndo(m - 1)} ${y}`;
    }
    if (dateFilterType === 'rentang_tanggal') {
      return `${formatIndonesianDate(startDate)} s/d ${formatIndonesianDate(endDate)}`;
    }
    if (dateFilterType === 'hari_ini') {
      return `Hari Ini (${formatIndonesianDate(now)})`;
    }
    if (dateFilterType === 'kemarin') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return `Kemarin (${formatIndonesianDate(yesterday)})`;
    }
    if (dateFilterType === '7_hari') {
      const past = new Date(now);
      past.setDate(now.getDate() - 6);
      return `7 Hari Terakhir (${formatIndonesianDate(past)} - ${formatIndonesianDate(now)})`;
    }
    if (dateFilterType === '30_hari') {
      const past = new Date(now);
      past.setDate(now.getDate() - 29);
      return `30 Hari Terakhir (${formatIndonesianDate(past)} - ${formatIndonesianDate(now)})`;
    }
    if (dateFilterType === 'tanggal_spesifik') {
      return `Tanggal ${formatIndonesianDate(customDate)}`;
    }
    return 'Semua Waktu (All Time)';
  }, [dateFilterType, selectedMonth, startDate, endDate, customDate]);

  // Filter Invoices
  const filteredInvoices = useMemo(() => {
    const todayStr = toLocalDateStr(new Date());
    
    return invoices.filter(inv => {
      if (inv.status !== 'Lunas') return false;

      // Cashier Filter
      if (selectedCashier !== 'semua' && inv.cashierName !== selectedCashier) {
        return false;
      }

      // Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesInvoice = inv.invoiceNumber?.toLowerCase().includes(query);
        const matchesCustomer = inv.customerName?.toLowerCase().includes(query);
        const matchesCashier = inv.cashierName?.toLowerCase().includes(query);
        if (!matchesInvoice && !matchesCustomer && !matchesCashier) return false;
      }

      // Date Filtering
      if (!inv.date) return dateFilterType === 'semua';
      const invDateStr = toLocalDateStr(inv.date);

      if (dateFilterType === 'hari_ini') {
        return invDateStr === todayStr;
      }

      if (dateFilterType === 'kemarin') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        return invDateStr === toLocalDateStr(y);
      }

      if (dateFilterType === '7_hari') {
        const past = new Date();
        past.setDate(past.getDate() - 6);
        const pastStr = toLocalDateStr(past);
        return invDateStr >= pastStr && invDateStr <= todayStr;
      }

      if (dateFilterType === '30_hari') {
        const past = new Date();
        past.setDate(past.getDate() - 29);
        const pastStr = toLocalDateStr(past);
        return invDateStr >= pastStr && invDateStr <= todayStr;
      }

      if (dateFilterType === 'bulan_ini') {
        const currentMonthPrefix = todayStr.slice(0, 7);
        return invDateStr.startsWith(currentMonthPrefix);
      }

      if (dateFilterType === 'bulan_lalu') {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        const lastMonthPrefix = toLocalDateStr(d).slice(0, 7);
        return invDateStr.startsWith(lastMonthPrefix);
      }

      if (dateFilterType === 'pilih_bulan') {
        if (!selectedMonth) return true;
        return invDateStr.startsWith(selectedMonth);
      }

      if (dateFilterType === 'rentang_tanggal') {
        if (startDate && invDateStr < startDate) return false;
        if (endDate && invDateStr > endDate) return false;
        return true;
      }

      if (dateFilterType === 'tanggal_spesifik') {
        return invDateStr === customDate;
      }

      return true; // 'semua'
    });
  }, [invoices, selectedCashier, dateFilterType, selectedMonth, startDate, endDate, customDate, searchQuery]);

  // Financial Metrics
  const totalOmset = useMemo(() => filteredInvoices.reduce((a, c) => a + (Number(c.grandTotal) || 0), 0), [filteredInvoices]);
  const totalDiskon = useMemo(() => filteredInvoices.reduce((a, c) => a + (Number(c.discount) || 0), 0), [filteredInvoices]);
  const totalPajak = useMemo(() => filteredInvoices.reduce((a, c) => a + (Number(c.tax) || 0), 0), [filteredInvoices]);

  const omsetTunai = useMemo(() => filteredInvoices.filter(i => i.paymentMethod === 'Tunai').reduce((a, c) => a + (Number(c.grandTotal) || 0), 0), [filteredInvoices]);
  const omsetQRIS = useMemo(() => filteredInvoices.filter(i => i.paymentMethod === 'QRIS').reduce((a, c) => a + (Number(c.grandTotal) || 0), 0), [filteredInvoices]);
  const omsetTransfer = useMemo(() => filteredInvoices.filter(i => i.paymentMethod === 'Transfer').reduce((a, c) => a + (Number(c.grandTotal) || 0), 0), [filteredInvoices]);

  const tunaiCount = useMemo(() => filteredInvoices.filter(i => i.paymentMethod === 'Tunai').length, [filteredInvoices]);
  const qrisCount = useMemo(() => filteredInvoices.filter(i => i.paymentMethod === 'QRIS').length, [filteredInvoices]);
  const transferCount = useMemo(() => filteredInvoices.filter(i => i.paymentMethod === 'Transfer').length, [filteredInvoices]);

  const totalHPP = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      const items = Array.isArray(inv.items) ? inv.items : [];
      return acc + items.reduce((c, item) => {
        const prod = products.find(p => p.id === item.id);
        return c + ((prod?.buyPrice || 0) * (item.qty || 1));
      }, 0);
    }, 0);
  }, [filteredInvoices, products]);

  const labaBersih = totalOmset - totalHPP - totalPajak;
  const aov = filteredInvoices.length > 0 ? Math.round(totalOmset / filteredInvoices.length) : 0;

  // Cashier Breakdown
  const cashierBreakdown = useMemo(() => {
    const map = {};
    filteredInvoices.forEach(inv => {
      const cashier = inv.cashierName || 'Kasir Studio';
      if (!map[cashier]) {
        map[cashier] = {
          name: cashier,
          totalTx: 0,
          totalOmset: 0,
          tunai: 0,
          qris: 0,
          transfer: 0
        };
      }
      map[cashier].totalTx += 1;
      const amount = Number(inv.grandTotal) || 0;
      map[cashier].totalOmset += amount;
      if (inv.paymentMethod === 'Tunai') map[cashier].tunai += amount;
      if (inv.paymentMethod === 'QRIS') map[cashier].qris += amount;
      if (inv.paymentMethod === 'Transfer') map[cashier].transfer += amount;
    });
    return Object.values(map).sort((a, b) => b.totalOmset - a.totalOmset);
  }, [filteredInvoices]);

  // Top Products Breakdown
  const topProducts = useMemo(() => {
    const map = {};
    filteredInvoices.forEach(inv => {
      const items = Array.isArray(inv.items) ? inv.items : [];
      items.forEach(item => {
        const key = item.id || item.name;
        if (!map[key]) {
          map[key] = {
            id: key,
            name: item.name || 'Paket / Layanan',
            category: item.category || 'Studio',
            qty: 0,
            revenue: 0
          };
        }
        const qty = Number(item.qty) || 1;
        const price = Number(item.price || item.sellPrice) || 0;
        map[key].qty += qty;
        map[key].revenue += qty * price;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredInvoices]);

  // Daily Breakdown within Period
  const dailyBreakdown = useMemo(() => {
    const map = {};
    filteredInvoices.forEach(inv => {
      const dateStr = toLocalDateStr(inv.date);
      if (!dateStr) return;
      if (!map[dateStr]) {
        map[dateStr] = {
          dateStr,
          formattedDate: formatIndonesianDate(inv.date),
          txCount: 0,
          tunai: 0,
          nonTunai: 0,
          total: 0
        };
      }
      const amount = Number(inv.grandTotal) || 0;
      map[dateStr].txCount += 1;
      map[dateStr].total += amount;
      if (inv.paymentMethod === 'Tunai') {
        map[dateStr].tunai += amount;
      } else {
        map[dateStr].nonTunai += amount;
      }
    });
    return Object.values(map).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [filteredInvoices]);

  // Export CSV with full metadata headers
  const exportCSV = () => {
    let csv = `LAPORAN PENJUALAN & OMSET SHINE PHOTO STUDIO\n`;
    csv += `Periode: "${periodLabel}"\n`;
    csv += `Filter Kasir: "${selectedCashier === 'semua' ? 'Semua Kasir' : selectedCashier}"\n`;
    csv += `Waktu Unduh: "${new Date().toLocaleString('id-ID')}"\n`;
    csv += `Total Omset Lunas: ${totalOmset}\n`;
    csv += `Estimasi Laba Bersih: ${labaBersih}\n`;
    csv += `Total Transaksi: ${filteredInvoices.length}\n\n`;

    csv += 'No Faktur,Tanggal & Jam,Kasir Bertugas,Nama Pelanggan,Metode Bayar,Subtotal,Diskon,Total Omset,Status\n';
    filteredInvoices.forEach(i => {
      const formattedDate = i.date ? new Date(i.date).toLocaleString('id-ID') : '-';
      csv += `"${i.invoiceNumber}","${formattedDate}","${i.cashierName}","${i.customerName}","${i.paymentMethod}",${i.subtotal},${i.discount},${i.grandTotal},"${i.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanPeriodName = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    a.download = `Rekap_ShineStudio_${cleanPeriodName}_${toLocalDateStr(new Date())}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Printable Report Modal */}
      <ReportPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        periodLabel={periodLabel}
        filteredInvoices={filteredInvoices}
        totalOmset={totalOmset}
        labaBersih={labaBersih}
        totalHPP={totalHPP}
        totalDiskon={totalDiskon}
        omsetTunai={omsetTunai}
        omsetQRIS={omsetQRIS}
        omsetTransfer={omsetTransfer}
        cashierBreakdown={cashierBreakdown}
        topProducts={topProducts}
        dailyBreakdown={dailyBreakdown}
        selectedCashier={selectedCashier}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#032653] dark:text-white tracking-tight">
              Rekapitulasi Omset & Laporan Keuangan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffd028] text-[#032653] text-[10px] font-black border border-[#032653] shadow-sm uppercase">
              Bulanan & Range
            </span>
          </div>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold mt-0.5">
            Laporan bulanan, filter rentang tanggal bebas, rekap harian, omset per staf, dan cetak laporan PDF
          </p>
        </div>

        {/* Action Buttons: Cetak & Ekspor */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#06346b] text-[#032653] dark:text-white border-2 border-[#032653] dark:border-white/20 font-black text-xs shadow-[3px_3px_0_#032653] dark:shadow-[3px_3px_0_#ffd028] hover:bg-[#fff7cc] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2.5] text-[#063b7a] dark:text-[#ffd028]" />
            <span>Cetak Rekap PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Control Center */}
      <div className="shine-card p-5 space-y-4">
        {/* Top Header of Filter Box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
          <div className="flex items-center gap-2 text-[#063b7a] dark:text-[#ffd028] font-black text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 stroke-[2.5]" />
            <span>Pilih Periode Rekap & Filter Laporan</span>
          </div>

          {/* Active Period Display Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#e8f0ff] dark:bg-white/10 border border-[#c7d9f7] dark:border-white/15 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#063b7a] dark:text-[#ffd028]" />
            <span className="font-bold text-[#032653] dark:text-white">
              Periode Aktif: <strong className="text-[#145ef3] dark:text-[#ffd028] font-black">{periodLabel}</strong>
            </span>
          </div>
        </div>

        {/* Quick Period Buttons / Tabs */}
        <div>
          <label className="block text-[11px] font-black text-[#5d6878] dark:text-white/70 uppercase mb-2">
            Pilihan Periode Cepat:
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'bulan_ini', label: 'Bulan Ini' },
              { id: 'bulan_lalu', label: 'Bulan Lalu' },
              { id: 'pilih_bulan', label: '📅 Pilih Bulan (Bulanan)' },
              { id: 'rentang_tanggal', label: '📆 Rentang Tanggal (X s/d Y)' },
              { id: 'hari_ini', label: 'Hari Ini' },
              { id: 'kemarin', label: 'Kemarin' },
              { id: '7_hari', label: '7 Hari' },
              { id: '30_hari', label: '30 Hari' },
              { id: 'tanggal_spesifik', label: 'Tanggal Tertentu' },
              { id: 'semua', label: 'Semua Waktu' }
            ].map(tab => {
              const active = dateFilterType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDateFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all border-2 ${
                    active 
                      ? 'bg-[#ffd028] text-[#032653] border-[#032653] shadow-[2px_2px_0_#032653]' 
                      : 'bg-white dark:bg-[#032653] text-[#5d6878] dark:text-white/80 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653] hover:text-[#032653]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Controls based on selected period type */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#f4f7fb] dark:bg-white/5 p-4 rounded-xl border border-[#d9e1ec] dark:border-white/10">
          
          {/* A. If Pilih Bulan (Monthly Report) */}
          {dateFilterType === 'pilih_bulan' && (
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[#032653] dark:text-[#ffd028] font-black">
                Pilih Bulan & Tahun
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  title="Bulan Sebelumnya"
                  className="p-2 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#032653] text-[#032653] dark:text-white hover:bg-[#ffd028] transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="shine-input font-bold text-center"
                />
                <button
                  onClick={handleNextMonth}
                  title="Bulan Berikutnya"
                  className="p-2 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#032653] text-[#032653] dark:text-white hover:bg-[#ffd028] transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
                <button
                  onClick={() => setSelectedMonth(defaultMonthStr)}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#032653] text-[10px] font-black text-[#032653] dark:text-white hover:bg-[#ffd028] whitespace-nowrap shadow-sm"
                >
                  Bulan Ini
                </button>
              </div>
            </div>
          )}

          {/* B. If Rentang Tanggal (Custom Date Range) */}
          {dateFilterType === 'rentang_tanggal' && (
            <>
              <div>
                <label className="block text-[#032653] dark:text-[#ffd028] font-black mb-1">
                  Dari Tanggal (Mulai)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="shine-input font-bold"
                />
              </div>
              <div>
                <label className="block text-[#032653] dark:text-[#ffd028] font-black mb-1">
                  Sampai Tanggal (Selesai)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="shine-input font-bold"
                />
              </div>
            </>
          )}

          {/* C. If Tanggal Spesifik */}
          {dateFilterType === 'tanggal_spesifik' && (
            <div className="sm:col-span-2">
              <label className="block text-[#032653] dark:text-[#ffd028] font-black mb-1">
                Pilih Tanggal Tertentu
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="shine-input font-bold"
              />
            </div>
          )}

          {/* Cashier / Employee Filter */}
          <div>
            <label className="block text-[#032653] dark:text-[#ffd028] font-black mb-1">
              Filter Kasir / Staf
            </label>
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="shine-input font-semibold"
            >
              <option value="semua">Semua Kasir & Owner</option>
              {cashierList.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Search Query Filter */}
          <div>
            <label className="block text-[#032653] dark:text-[#ffd028] font-black mb-1">
              Cari No Faktur / Pelanggan
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="No Invoice / Nama..."
                className="shine-input shine-input-with-icon"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Omset */}
        <div className="shine-card shine-accent-bar p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black text-[#063b7a] dark:text-[#ffd028] uppercase tracking-wider">
              Total Omset Penjualan
            </p>
            <DollarSign className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028]" />
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-white">{formatRp(totalOmset)}</p>
          <div className="flex items-center justify-between text-[11px] text-[#5d6878] dark:text-white/70 font-bold mt-2 pt-2 border-t border-[#d9e1ec] dark:border-white/10">
            <span>{filteredInvoices.length} Faktur Lunas</span>
            <span>Rata-rata: {formatRp(aov)}</span>
          </div>
        </div>

        {/* 2. Estimasi Laba Bersih */}
        <div className="shine-card shine-accent-bar p-5 bg-[#fff7cc]/40 dark:bg-[#06346b]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black text-[#032653] dark:text-[#ffd028] uppercase tracking-wider">
              Estimasi Laba Bersih
            </p>
            <TrendingUp className="w-4 h-4 text-[#032653] dark:text-[#ffd028]" />
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-[#ffd028]">{formatRp(labaBersih)}</p>
          <div className="flex items-center justify-between text-[11px] text-[#5d6878] dark:text-white/70 font-bold mt-2 pt-2 border-t border-[#d9e1ec] dark:border-white/10">
            <span>Modal HPP Studio:</span>
            <span>{formatRp(totalHPP)}</span>
          </div>
        </div>

        {/* 3. Kas Tunai Fisik */}
        <div className="shine-card shine-accent-bar p-5 bg-[#e6f9ed]/50 dark:bg-[#06346b]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black text-[#0e7036] dark:text-emerald-400 uppercase tracking-wider">
              Kas Tunai Fisik (Cash)
            </p>
            <Banknote className="w-4 h-4 text-[#0e7036] dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-[#0e7036] dark:text-emerald-400">{formatRp(omsetTunai)}</p>
          <div className="flex items-center justify-between text-[11px] text-[#0e7036] dark:text-emerald-300 font-bold mt-2 pt-2 border-t border-emerald-200/50 dark:border-white/10">
            <span>{tunaiCount} Transaksi</span>
            <span>{totalOmset > 0 ? ((omsetTunai / totalOmset) * 100).toFixed(1) : 0}% Omset</span>
          </div>
        </div>

        {/* 4. Kas Digital Non-Tunai */}
        <div className="shine-card shine-accent-bar p-5 bg-[#e8f0ff]/50 dark:bg-[#06346b]">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black text-[#063b7a] dark:text-[#ffd028] uppercase tracking-wider">
              QRIS & Transfer BRI
            </p>
            <QrCode className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028]" />
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-white">{formatRp(omsetQRIS + omsetTransfer)}</p>
          <div className="flex items-center justify-between text-[11px] text-[#5d6878] dark:text-white/70 font-bold mt-2 pt-2 border-t border-[#d9e1ec] dark:border-white/10">
            <span>QRIS: {formatRp(omsetQRIS)}</span>
            <span>TF: {formatRp(omsetTransfer)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Rekap Harian (Daily Sales) & Layanan Terlaris (Top Services) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Rekapitulasi Harian dalam Periode (7 Cols) */}
        <div className="lg:col-span-7 shine-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#032653] dark:text-[#ffd028]" />
              <div>
                <h3 className="font-black text-[#032653] dark:text-white text-sm">Rekapitulasi Omset Harian</h3>
                <p className="text-[11px] text-[#5d6878] dark:text-white/70">Rincian pendapatan per hari pada {periodLabel}</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#063b7a] dark:text-[#ffd028]">
              {dailyBreakdown.length} Hari Aktif
            </span>
          </div>

          <div className="overflow-x-auto max-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#032653] text-white sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-black uppercase text-[10px]">Hari & Tanggal</th>
                  <th className="p-3 font-black uppercase text-[10px] text-center">Faktur</th>
                  <th className="p-3 font-black uppercase text-[10px] text-right">Tunai</th>
                  <th className="p-3 font-black uppercase text-[10px] text-right">Non-Tunai</th>
                  <th className="p-3 font-black uppercase text-[10px] text-right">Total Omset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 bg-white dark:bg-[#06346b] text-[#101828] dark:text-white">
                {dailyBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#5d6878] dark:text-white/60 font-bold">
                      Belum ada catatan transaksi harian pada periode ini.
                    </td>
                  </tr>
                ) : (
                  dailyBreakdown.map((row) => (
                    <tr key={row.dateStr} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-[#032653] dark:text-white">
                        {row.formattedDate}
                      </td>
                      <td className="p-3 text-center font-black text-[#063b7a] dark:text-[#ffd028]">
                        {row.txCount}
                      </td>
                      <td className="p-3 text-right font-bold text-[#0e7036] dark:text-emerald-400">
                        {formatRp(row.tunai)}
                      </td>
                      <td className="p-3 text-right font-bold text-[#145ef3] dark:text-blue-300">
                        {formatRp(row.nonTunai)}
                      </td>
                      <td className="p-3 text-right font-black text-[#032653] dark:text-[#ffd028]">
                        {formatRp(row.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top 5 Layanan & Paket Terlaris (5 Cols) */}
        <div className="lg:col-span-5 shine-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#032653] dark:text-[#ffd028]" />
              <div>
                <h3 className="font-black text-[#032653] dark:text-white text-sm">Layanan & Paket Terlaris</h3>
                <p className="text-[11px] text-[#5d6878] dark:text-white/70">Top revenue generator</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#063b7a] dark:text-[#ffd028]">
              {topProducts.length} Item
            </span>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {topProducts.length === 0 ? (
              <p className="p-6 text-center text-[#5d6878] dark:text-white/60 font-bold text-xs">
                Belum ada data paket terjual.
              </p>
            ) : (
              topProducts.slice(0, 6).map((prod, idx) => (
                <div 
                  key={prod.id} 
                  className="p-3 rounded-xl bg-[#f4f7fb] dark:bg-white/5 border border-[#d9e1ec] dark:border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#ffd028] text-[#032653] border border-[#032653] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-xs text-[#032653] dark:text-white line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-[#5d6878] dark:text-white/60 font-semibold">{prod.category} • Terjual {prod.qty}x</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-xs text-[#032653] dark:text-[#ffd028]">{formatRp(prod.revenue)}</p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {totalOmset > 0 ? ((prod.revenue / totalOmset) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Breakdown per Karyawan / Kasir */}
      <div className="shine-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#032653] dark:text-[#ffd028]" />
            <div>
              <h3 className="font-black text-[#032653] dark:text-white text-base">
                Rekapitulasi Omset per Karyawan / Kasir
              </h3>
              <p className="text-xs text-[#5d6878] dark:text-white/70">
                Performa penjualan dan kas masuk yang ditangani masing-masing staf pada periode ini
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-[#063b7a] dark:text-[#ffd028]">Total {cashierBreakdown.length} Staf</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#032653] text-white">
              <tr>
                <th className="p-3.5 font-black uppercase text-[11px]">Nama Kasir / Karyawan</th>
                <th className="p-3.5 font-black uppercase text-[11px] text-center">Jumlah Transaksi</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Omset Tunai</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Omset QRIS</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Omset Transfer</th>
                <th className="p-3.5 font-black uppercase text-[11px] text-right">Total Omset</th>
                <th className="p-3.5 font-black uppercase text-[11px] text-right">Porsi (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 bg-white dark:bg-[#06346b] text-[#101828] dark:text-white">
              {cashierBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#5d6878] dark:text-white/60 font-bold">
                    Belum ada data transaksi kasir pada periode filter ini.
                  </td>
                </tr>
              ) : (
                cashierBreakdown.map((row) => (
                  <tr key={row.name} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-black text-[#032653] dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#ffd028] text-[#032653] border border-[#032653] flex items-center justify-center font-black text-xs shadow-sm">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{row.name}</span>
                    </td>
                    <td className="p-3.5 text-center font-black text-[#063b7a] dark:text-[#ffd028]">{row.totalTx} Transaksi</td>
                    <td className="p-3.5 font-bold text-[#0e7036] dark:text-emerald-400">{formatRp(row.tunai)}</td>
                    <td className="p-3.5 font-bold text-[#063b7a] dark:text-[#ffd028]">{formatRp(row.qris)}</td>
                    <td className="p-3.5 font-bold text-[#145ef3] dark:text-blue-400">{formatRp(row.transfer)}</td>
                    <td className="p-3.5 text-right font-black text-[#032653] dark:text-[#ffd028] text-sm">{formatRp(row.totalOmset)}</td>
                    <td className="p-3.5 text-right font-bold text-[#5d6878] dark:text-white/80">
                      {totalOmset > 0 ? ((row.totalOmset / totalOmset) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rincian Transaksi Terfilter */}
      <div className="shine-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
          <div>
            <h3 className="font-black text-[#032653] dark:text-white text-base">Rincian Daftar Transaksi (Sesuai Filter)</h3>
            <p className="text-xs text-[#5d6878] dark:text-white/70">Daftar seluruh invoice yang masuk dalam perhitungan laporan di atas</p>
          </div>
          <span className="text-xs text-[#063b7a] dark:text-[#ffd028] font-black">
            {filteredInvoices.length} Faktur Ditemukan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#032653] text-white">
              <tr>
                <th className="p-3.5 font-black uppercase text-[11px]">No Invoice</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Tanggal & Jam</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Kasir Bertugas</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Pelanggan</th>
                <th className="p-3.5 font-black uppercase text-[11px]">Metode</th>
                <th className="p-3.5 font-black uppercase text-[11px] text-right">Total Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 bg-white dark:bg-[#06346b] text-[#101828] dark:text-white">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#5d6878] dark:text-white/60 font-bold">
                    Tidak ada transaksi ditemukan pada filter tanggal atau karyawan ini.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-black text-[#032653] dark:text-[#ffd028]">{inv.invoiceNumber}</td>
                    <td className="p-3.5 text-[#5d6878] dark:text-white/70 font-semibold">
                      {inv.date ? new Date(inv.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                    </td>
                    <td className="p-3.5 font-black text-[#032653] dark:text-white">{inv.cashierName || '-'}</td>
                    <td className="p-3.5 text-[#5d6878] dark:text-white/80 font-bold">{inv.customerName || 'Walk-in'}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-lg font-black text-[10px] bg-[#e8f0ff] dark:bg-white/10 text-[#063b7a] dark:text-[#ffd028] border border-[#c7d9f7] dark:border-white/10">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-[#032653] dark:text-[#ffd028]">{formatRp(inv.grandTotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
