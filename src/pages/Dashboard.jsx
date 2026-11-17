import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  ShoppingCart, 
  UserCheck, 
  ShieldCheck, 
  Package,
  Layers,
  Sparkles,
  Receipt,
  Users,
  Camera,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function Dashboard({ setActiveTab, onOpenShiftModal }) {
  const { currentUser } = useAuth();
  const { invoices, products, currentShift } = useData();

  const isOwner = currentUser?.role === 'owner';

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  // Stats Calculations — pakai tanggal lokal (WIB)
  const todayStr = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const [dashboardPeriod, setDashboardPeriod] = React.useState('hari_ini'); // 'hari_ini' | 'bulan_ini'

  const todayInvoices = invoices.filter(inv => {
    if (!inv.date || inv.status !== 'Lunas') return false;
    const invDate = new Date(inv.date);
    const invLocal = `${invDate.getFullYear()}-${String(invDate.getMonth()+1).padStart(2,'0')}-${String(invDate.getDate()).padStart(2,'0')}`;
    return invLocal === todayStr;
  });

  const todayRevenue = todayInvoices.reduce((acc, inv) => acc + (Number(inv.grandTotal) || 0), 0);
  const todayTransactionsCount = todayInvoices.length;

  // Net Profit estimate for Owner Today
  const netProfit = todayInvoices.reduce((acc, inv) => {
    const items = Array.isArray(inv.items) ? inv.items : [];
    const cost = items.reduce((c, item) => {
      const prod = products.find(p => p.id === item.id);
      return c + ((prod?.buyPrice || 0) * (item.qty || 1));
    }, 0);
    return acc + ((Number(inv.subtotal) || 0) - cost);
  }, 0);

  // Month-to-date (MTD) Calculations
  const currentMonthPrefix = todayStr.slice(0, 7);
  const monthInvoices = invoices.filter(inv => {
    if (!inv.date || inv.status !== 'Lunas') return false;
    const invDate = new Date(inv.date);
    const invLocal = `${invDate.getFullYear()}-${String(invDate.getMonth()+1).padStart(2,'0')}-${String(invDate.getDate()).padStart(2,'0')}`;
    return invLocal.startsWith(currentMonthPrefix);
  });

  const monthRevenue = monthInvoices.reduce((acc, inv) => acc + (Number(inv.grandTotal) || 0), 0);
  const monthTransactionsCount = monthInvoices.length;
  const monthNetProfit = monthInvoices.reduce((acc, inv) => {
    const items = Array.isArray(inv.items) ? inv.items : [];
    const cost = items.reduce((c, item) => {
      const prod = products.find(p => p.id === item.id);
      return c + ((prod?.buyPrice || 0) * (item.qty || 1));
    }, 0);
    return acc + ((Number(inv.subtotal) || 0) - cost);
  }, 0);

  const activeRevenue = dashboardPeriod === 'hari_ini' ? todayRevenue : monthRevenue;
  const activeTransactionsCount = dashboardPeriod === 'hari_ini' ? todayTransactionsCount : monthTransactionsCount;
  const activeNetProfit = dashboardPeriod === 'hari_ini' ? netProfit : monthNetProfit;

  // Low stock products alert
  const lowStockProducts = products.filter(p => Number(p.stock) <= Number(p.minStock));

  return (
    <div className="space-y-6 pb-10">
      {/* Top Banner / Hero Card matching Shine Studio Navy & Yellow Hero */}
      <div className="relative rounded-2xl bg-[#032653] text-white border-3 border-[#032653] p-6 md:p-8 shadow-[5px_5px_0_#ffd028] overflow-hidden">
        {/* Playful background decorative ring circles like the website */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border-[18px] border-[#063b7a]/60 pointer-events-none" />
        <div className="absolute right-28 -bottom-20 w-44 h-44 rounded-full border-[14px] border-[#ffd028]/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full bg-[#ffd028] text-[#032653] border border-[#032653] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0_#032653]">
                {isOwner ? '👑 Owner Studio' : '💼 Kasir Studio'}
              </span>
              <span className="text-xs text-[#ffd028] font-black flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${currentShift?.isOpen ? 'bg-[#ffd028] animate-pulse' : 'bg-rose-400'}`} />
                Shift: {currentShift?.isOpen ? 'Aktif' : 'Tutup'}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Selamat Datang, {currentUser?.name}!</span>
              <Sparkles className="w-5 h-5 text-[#ffd028] fill-[#ffd028] hidden sm:inline" />
            </h1>
            <p className="text-xs md:text-sm text-[#e8f0ff] mt-1 font-medium leading-relaxed">
              {isOwner 
                ? 'Pantau ringkasan omset studio, laporan kasir, persetujuan staf, serta riwayat invoice secara real-time.' 
                : 'Siap melayani pelanggan sesi Photo Studio, Photo Box, dan Photobooth hari ini.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenShiftModal}
              className="px-4 py-2.5 rounded-xl bg-white text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653] hover:bg-[#f4f7fb] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              {currentShift?.isOpen ? 'Atur / Tutup Shift' : 'Buka Shift Baru'}
            </button>

            <button
              onClick={() => setActiveTab('kasir')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] hover:bg-[#ffda47] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
              <span>Buka Kasir POS</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Overview Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-base font-black text-[#032653] dark:text-white flex items-center gap-2">
            <span>Ringkasan Metrik Toko</span>
            <span className="text-xs font-bold text-[#5d6878] dark:text-white/60">
              ({dashboardPeriod === 'hari_ini' ? 'Hari Ini' : 'Bulan Ini'})
            </span>
          </h2>
          <p className="text-xs text-[#5d6878] dark:text-white/70">
            {dashboardPeriod === 'hari_ini' 
              ? 'Data penjualan dan laba khusus transaksi hari ini' 
              : 'Akumulasi penjualan dan laba sepanjang bulan berjalan'}
          </p>
        </div>

        {/* Toggle Button Hari Ini / Bulan Ini */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#06346b] border-2 border-[#032653] dark:border-white/20 shadow-[2px_2px_0_#032653] text-xs">
          <button
            onClick={() => setDashboardPeriod('hari_ini')}
            className={`px-3 py-1.5 rounded-lg font-black transition-all ${
              dashboardPeriod === 'hari_ini'
                ? 'bg-[#ffd028] text-[#032653] shadow-sm'
                : 'text-[#5d6878] dark:text-white/70 hover:text-[#032653]'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDashboardPeriod('bulan_ini')}
            className={`px-3 py-1.5 rounded-lg font-black transition-all ${
              dashboardPeriod === 'bulan_ini'
                ? 'bg-[#ffd028] text-[#032653] shadow-sm'
                : 'text-[#5d6878] dark:text-white/70 hover:text-[#032653]'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Omset Card */}
        <div className="shine-card shine-accent-bar p-5">
          <div className="flex items-center justify-between mb-3 mt-1">
            <span className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028] uppercase tracking-wider">
              {dashboardPeriod === 'hari_ini' ? 'Omset Hari Ini' : 'Omset Bulan Ini'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#ffd028] border-1.5 border-[#032653] flex items-center justify-center text-[#032653] shadow-[2px_2px_0_#032653]">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-white tracking-tight">{formatRp(activeRevenue)}</p>
          <div className="flex items-center gap-1.5 text-xs text-[#0e7036] font-bold mt-2 bg-[#e6f9ed] px-2.5 py-1 rounded-lg w-fit border border-[#a3e6be]">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{activeTransactionsCount} Transaksi Sukses</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="shine-card shine-accent-bar p-5">
          <div className="flex items-center justify-between mb-3 mt-1">
            <span className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028] uppercase tracking-wider">
              {dashboardPeriod === 'hari_ini' ? 'Faktur Hari Ini' : 'Faktur Bulan Ini'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#032653] text-[#ffd028] border-1.5 border-[#032653] flex items-center justify-center shadow-[2px_2px_0_#ffd028]">
              <Receipt className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-white tracking-tight">{activeTransactionsCount} Faktur</p>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold mt-2">
            Status: <span className="text-[#063b7a] dark:text-[#ffd028] font-black">Lunas</span>
          </p>
        </div>

        {/* Laba Bersih / Target Shift */}
        <div className="shine-card shine-accent-bar p-5">
          <div className="flex items-center justify-between mb-3 mt-1">
            <span className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028] uppercase tracking-wider">
              {isOwner 
                ? (dashboardPeriod === 'hari_ini' ? 'Profit Hari Ini' : 'Profit Bulan Ini') 
                : 'Shift Aktif'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#e8f0ff] text-[#063b7a] border-1.5 border-[#063b7a] flex items-center justify-center shadow-[2px_2px_0_#063b7a]">
              {isOwner ? <DollarSign className="w-4 h-4 stroke-[2.5]" /> : <Clock className="w-4 h-4 stroke-[2.5]" />}
            </div>
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-white tracking-tight">
            {isOwner ? formatRp(activeNetProfit) : (currentShift?.isOpen ? 'Shift Berjalan' : 'Shift Belum Buka')}
          </p>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold mt-2">
            {isOwner ? 'Subtotal - Modal HPP' : `Kasir: ${currentShift?.cashierName || '-'}`}
          </p>
        </div>

        {/* Layanan & Stok */}
        <div className="shine-card shine-accent-bar p-5">
          <div className="flex items-center justify-between mb-3 mt-1">
            <span className="text-[11px] font-black text-[#063b7a] dark:text-[#ffd028] uppercase tracking-wider">Layanan & Stok</span>
            <div className="w-9 h-9 rounded-xl bg-[#ffd028] border-1.5 border-[#032653] flex items-center justify-center text-[#032653] shadow-[2px_2px_0_#032653]">
              <Package className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#032653] dark:text-white tracking-tight">{products.length} Paket</p>
          <div className="mt-2">
            {lowStockProducts.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                <AlertTriangle className="w-3 h-3" />
                {lowStockProducts.length} Stok Menipis
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                <CheckCircle className="w-3 h-3" />
                Semua Stok Aman
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Access & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Quick Service Categories (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="shine-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#ffd028] text-[#032653] border border-[#032653] flex items-center justify-center font-black">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-[#032653] dark:text-white">Layanan Utama Studio</h3>
              </div>
              <button
                onClick={() => setActiveTab('produk')}
                className="text-xs font-black text-[#063b7a] dark:text-[#ffd028] hover:underline flex items-center gap-1"
              >
                <span>Kelola Layanan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Photo Studio Card */}
              <div 
                onClick={() => setActiveTab('kasir')}
                className="shine-card-interactive p-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#032653] text-[#ffd028] border-2 border-[#032653] flex items-center justify-center mb-3 shadow-[2px_2px_0_#ffd028]">
                  <Camera className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="font-black text-sm text-[#032653] dark:text-white group-hover:text-[#063b7a]">Photo Studio</h4>
                <p className="text-[11px] text-[#5d6878] dark:text-white/60 mt-0.5 font-medium">Basic, Premium, Gold & Family</p>
                <div className="mt-3 text-xs font-black text-[#063b7a] dark:text-[#ffd028] flex items-center gap-1">
                  <span>Mulai Rp 15.000</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Photo Box Card */}
              <div 
                onClick={() => setActiveTab('kasir')}
                className="shine-card-interactive p-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] flex items-center justify-center mb-3 shadow-[2px_2px_0_#032653]">
                  <Layers className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="font-black text-sm text-[#032653] dark:text-white group-hover:text-[#063b7a]">Photo Box</h4>
                <p className="text-[11px] text-[#5d6878] dark:text-white/60 mt-0.5 font-medium">5-17 Menit, Free All Softfile</p>
                <div className="mt-3 text-xs font-black text-[#063b7a] dark:text-[#ffd028] flex items-center gap-1">
                  <span>Mulai Rp 10.000</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Photobooth Card */}
              <div 
                onClick={() => setActiveTab('kasir')}
                className="shine-card-interactive p-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e8f0ff] text-[#063b7a] border-2 border-[#063b7a] flex items-center justify-center mb-3 shadow-[2px_2px_0_#063b7a]">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="font-black text-sm text-[#032653] dark:text-white group-hover:text-[#063b7a]">Photobooth Event</h4>
                <p className="text-[11px] text-[#5d6878] dark:text-white/60 mt-0.5 font-medium">Unlimited 3 Jam, Print & Frame</p>
                <div className="mt-3 text-xs font-black text-[#063b7a] dark:text-[#ffd028] flex items-center gap-1">
                  <span>Paket 2R, 4R & No Print</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="shine-card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10">
              <h3 className="font-black text-base text-[#032653] dark:text-white">Transaksi Terbaru Hari Ini</h3>
              <button
                onClick={() => setActiveTab('invoice')}
                className="text-xs font-black text-[#063b7a] dark:text-[#ffd028] hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua Invoice</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {todayInvoices.length === 0 ? (
              <div className="py-8 text-center text-[#5d6878] dark:text-white/60">
                <Receipt className="w-10 h-10 mx-auto text-[#063b7a] dark:text-[#ffd028] opacity-40 mb-2" />
                <p className="font-black text-sm">Belum ada transaksi hari ini</p>
                <p className="text-xs mt-1">Buka Kasir Workspace untuk memulai transaksi pertama</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-[#032653] text-[11px] font-black uppercase text-[#032653] dark:text-[#ffd028]">
                      <th className="pb-2.5">No. Faktur</th>
                      <th className="pb-2.5">Pelanggan</th>
                      <th className="pb-2.5">Metode</th>
                      <th className="pb-2.5 text-right">Grand Total</th>
                      <th className="pb-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 text-xs">
                    {todayInvoices.slice(0, 5).map(inv => (
                      <tr key={inv.id} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 font-bold text-[#032653] dark:text-white">{inv.invoiceNumber}</td>
                        <td className="py-3 font-medium text-[#5d6878] dark:text-white/80">{inv.customerName || 'Umum'}</td>
                        <td className="py-3 font-bold text-[#063b7a] dark:text-[#ffd028]">{inv.paymentMethod}</td>
                        <td className="py-3 text-right font-black text-[#032653] dark:text-white">{formatRp(inv.grandTotal)}</td>
                        <td className="py-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#e6f9ed] text-[#0e7036] border border-[#a3e6be]">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shift & Fast Links (1 col) */}
        <div className="space-y-5">
          {/* Shift Info Box */}
          <div className="shine-card p-5">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10">
              <div className="w-7 h-7 rounded-lg bg-[#ffd028] text-[#032653] border border-[#032653] flex items-center justify-center font-black">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-sm text-[#032653] dark:text-white">Informasi Shift Kasir</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#d9e1ec] dark:border-white/10">
                <span className="text-[#5d6878] dark:text-white/70 font-semibold">Status Shift</span>
                <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                  currentShift?.isOpen 
                    ? 'bg-[#e6f9ed] text-[#0e7036] border border-[#a3e6be]' 
                    : 'bg-rose-100 text-rose-700 border border-rose-300'
                }`}>
                  {currentShift?.isOpen ? 'Aktif' : 'Tutup'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#d9e1ec] dark:border-white/10">
                <span className="text-[#5d6878] dark:text-white/70 font-semibold">Kasir Bertugas</span>
                <span className="font-black text-[#032653] dark:text-white">{currentShift?.cashierName || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#d9e1ec] dark:border-white/10">
                <span className="text-[#5d6878] dark:text-white/70 font-semibold">Modal Awal Kas</span>
                <span className="font-black text-[#032653] dark:text-white">{formatRp(currentShift?.initialCash || 0)}</span>
              </div>
            </div>

            <button
              onClick={onOpenShiftModal}
              className="mt-4 w-full py-2.5 rounded-xl bg-white dark:bg-[#063b7a] border-2 border-[#032653] dark:border-[#ffd028] text-[#032653] dark:text-white font-black text-xs shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653] transition-all"
            >
              {currentShift?.isOpen ? 'Tutup Shift Sekarang' : 'Buka Shift Baru'}
            </button>
          </div>

          {/* Store Info Box */}
          <div className="shine-card p-5 bg-[#e8f0ff] dark:bg-[#06346b] border-2 border-[#063b7a]">
            <h4 className="font-black text-xs uppercase tracking-wider text-[#063b7a] dark:text-[#ffd028] mb-2">Shine Photo Studio & Photobooth</h4>
            <p className="text-xs text-[#101828] dark:text-white/90 font-medium leading-relaxed">
              Perum. Persada Banten Blok I1 No 5, Kel. Kepuren Kec. Walantaka Kota Serang
            </p>
            <div className="mt-3 pt-3 border-t border-[#c7d9f7] dark:border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-[#5d6878] dark:text-white/70">WhatsApp / Booking:</span>
              <span className="font-black text-[#032653] dark:text-[#ffd028]">085121809135</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
