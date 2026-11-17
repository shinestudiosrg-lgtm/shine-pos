import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Store,
  Percent,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  RefreshCw,
  Zap,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  KeyRound,
  Sparkles,
  MessageCircle,
  Send
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_APPS_SCRIPT_CODE, syncToGoogleSheets } from '../services/googleSheets';
import { sendWhatsAppReceipt } from '../services/whatsappService';

export default function Settings() {
  const { settings, setSettings, resetDemoData, products, pullCloudData } = useData();
  const { currentUser, updateUserProfile } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const [activeTab, setActiveTab] = useState('account');

  const [accountForm, setAccountForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [accountMsg, setAccountMsg] = useState('');
  const [accountErr, setAccountErr] = useState('');

  const [storeForm, setStoreForm] = useState({
    storeName: settings?.storeName || 'Shine Self Photo & Photobooth',
    address: settings?.address || 'Perum. Persada Banten Blok I1 No 5, Kel. Kepuren Kec. Walantaka Kota Serang',
    phone: settings?.phone || '085121809135',
    taxRate: settings?.taxRate || 11,
    receiptFooter: settings?.receiptFooter || 'Terima kasih telah berfoto di Shine Self Photo & Photobooth! Abadikan setiap momen berharga Anda.',
    sheetsUrl: settings?.sheetsUrl || '',
    waApiUrl: settings?.waApiUrl || '',
    waApiKey: settings?.waApiKey || '',
    waAutoSend: settings?.waAutoSend || false
  });

  const [savedMsg, setSavedMsg] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');

  const [testWaPhone, setTestWaPhone] = useState('');
  const [testWaLoading, setTestWaLoading] = useState(false);
  const [testWaResult, setTestWaResult] = useState('');

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    setAccountMsg('');
    setAccountErr('');
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setAccountErr('Konfirmasi password baru tidak cocok!');
      return;
    }
    updateUserProfile(currentUser.id, {
      name: accountForm.name,
      email: accountForm.email,
      phone: accountForm.phone,
      password: accountForm.newPassword || undefined
    });
    setAccountMsg('Profil dan password akun Anda berhasil diperbarui!');
    setAccountForm(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    setTimeout(() => setAccountMsg(''), 4000);
  };

  const handleStoreSubmit = (e) => {
    e.preventDefault();
    setSettings(storeForm);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleTestSync = async () => {
    if (!storeForm.sheetsUrl) {
      alert('Masukkan URL Google Apps Script Web App terlebih dahulu!');
      return;
    }
    setSyncing(true);
    setSyncResult('Sedang menyinkronkan data dengan Google Sheets...');
    const res = await syncToGoogleSheets(storeForm.sheetsUrl, 'syncProducts', products);
    await pullCloudData();
    setSyncing(false);
    if (res.success) {
      setSyncResult('✅ Berhasil terhubung! Data produk dan cloud telah disinkronkan secara dua arah.');
    } else {
      setSyncResult(`⚠️ Status koneksi: ${res.message || 'Periksa kembali URL Web App Google Sheets Anda'}`);
    }
  };

  const handlePullCloud = async () => {
    if (!storeForm.sheetsUrl) {
      alert('Masukkan URL Google Apps Script Web App terlebih dahulu!');
      return;
    }
    setSyncing(true);
    setSyncResult('Sedang mengambil data terbaru dari Google Sheets...');
    await pullCloudData();
    setSyncing(false);
    setSyncResult('✅ Berhasil menarik data produk dan invoice terbaru dari Google Sheets!');
  };

  const handleTestWa = async () => {
    if (!storeForm.waApiUrl) {
      alert('Masukkan URL Endpoint API WhatsApp terlebih dahulu!');
      return;
    }
    if (!testWaPhone) {
      alert('Masukkan nomor WhatsApp tujuan untuk tes kirim (contoh: 085121809135)!');
      return;
    }
    setTestWaLoading(true);
    setTestWaResult('Sedang mengirim pesan tes ke WhatsApp...');
    const dummyInvoice = {
      invoiceNumber: 'INV-TES-WA',
      date: new Date().toISOString(),
      cashierName: currentUser?.name || 'Owner',
      customerName: 'Pelanggan Tes WhatsApp',
      items: [{ name: 'Studio Basic Package (Tes Struk)', qty: 1, price: 15000, total: 15000 }],
      subtotal: 15000,
      discount: 0,
      tax: 0,
      grandTotal: 15000,
      paymentMethod: 'Tunai',
      cashAmount: 15000,
      changeAmount: 0
    };
    const res = await sendWhatsAppReceipt(dummyInvoice, testWaPhone, storeForm);
    setTestWaLoading(false);
    if (res.success) {
      setTestWaResult(res.message);
    } else {
      setTestWaResult(`⚠️ Gagal: ${res.message}`);
    }
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin memulihkan seluruh data awal (Produk, Transaksi, Pengaturan)?')) {
      resetDemoData();
      alert('Data awal berhasil dipulihkan!');
      window.location.reload();
    }
  };

  const labelClass = "block font-black text-[#032653] dark:text-[#ffd028] text-xs mb-1.5";

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-[#032653] dark:text-white tracking-tight">Pengaturan Akun & Profil Studio</h1>
        <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold">Kelola informasi akun pengguna, ganti password, profil toko & integrasi database Google Sheets</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
            activeTab === 'account'
              ? 'bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[2px_2px_0_#032653]'
              : 'bg-white dark:bg-[#06346b] text-[#5d6878] dark:text-white/70 border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
          }`}
        >
          <User className="w-4 h-4 stroke-[2.5]" />
          <span>Pengaturan Akun & Password</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
              activeTab === 'store'
                ? 'bg-[#032653] text-white border-2 border-[#032653] shadow-[2px_2px_0_#ffd028]'
                : 'bg-white dark:bg-[#06346b] text-[#5d6878] dark:text-white/70 border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
            }`}
          >
            <Store className="w-4 h-4 stroke-[2.5]" />
            <span>Pengaturan Toko & Google Sheets</span>
          </button>
        )}
      </div>

      {/* Tab 1: Account & Password */}
      {activeTab === 'account' && (
        <form onSubmit={handleAccountSubmit} className="shine-card p-6 space-y-5 text-xs">
          <div className="flex items-center justify-between border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#032653] dark:text-[#ffd028]" />
              <h3 className="font-black text-[#032653] dark:text-white text-sm">Profil Pengguna & Keamanan Password</h3>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border border-[#032653] ${isOwner ? 'bg-[#ffd028] text-[#032653]' : 'bg-[#e8f0ff] text-[#063b7a]'}`}>
              Role: {currentUser?.role}
            </span>
          </div>

          {accountMsg && (
            <div className="p-3.5 rounded-xl bg-[#e6f9ed] border-2 border-[#a3e6be] text-[#0e7036] text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span>{accountMsg}</span>
            </div>
          )}
          {accountErr && (
            <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-800 text-xs font-black">
              {accountErr}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nama Lengkap Anda</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                <input 
                  type="text" 
                  required 
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="shine-input pl-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email / Username Login</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required 
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    className="shine-input pl-11"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>No. WhatsApp / HP</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="tel" 
                    required 
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                    className="shine-input pl-11"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-[#d9e1ec] dark:border-white/10 space-y-4">
              <p className="font-black text-[#032653] dark:text-white text-xs">Ubah Password Akun (Opsional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Password Baru</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                    <input 
                      type="password" 
                      value={accountForm.newPassword}
                      onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                      placeholder="Kosongkan jika tidak diubah"
                      className="shine-input pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Konfirmasi Password Baru</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                    <input 
                      type="password" 
                      value={accountForm.confirmPassword}
                      onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                      placeholder="Ketik ulang password baru"
                      className="shine-input pl-11"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end border-t-2 border-[#d9e1ec] dark:border-white/10">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Profil Akun</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Store & Google Sheets (Owner Only) */}
      {activeTab === 'store' && isOwner && (
        <form onSubmit={handleStoreSubmit} className="shine-card p-6 space-y-5 text-xs">
          {savedMsg && (
            <div className="p-4 rounded-xl bg-[#e6f9ed] border-2 border-[#a3e6be] text-[#0e7036] text-xs font-black flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5] shrink-0" />
              <span>Pengaturan toko berhasil diperbarui!</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nama Studio / Toko</label>
              <div className="relative flex items-center">
                <Store className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                <input 
                  type="text" 
                  required 
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  className="shine-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Alamat Lengkap Studio</label>
              <textarea 
                rows={2} 
                required 
                value={storeForm.address}
                onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                className="shine-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>No. Telepon / WhatsApp Studio</label>
                <input 
                  type="text" 
                  required 
                  value={storeForm.phone}
                  onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                  className="shine-input"
                />
              </div>
              <div>
                <label className={labelClass}>Default Tarif Pajak PPN (%)</label>
                <div className="relative flex items-center">
                  <Percent className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="number" 
                    required 
                    value={storeForm.taxRate}
                    onChange={(e) => setStoreForm({ ...storeForm, taxRate: Number(e.target.value) })}
                    className="shine-input pl-11"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Pesan Footer Pada Struk Thermal</label>
              <input 
                type="text" 
                required 
                value={storeForm.receiptFooter}
                onChange={(e) => setStoreForm({ ...storeForm, receiptFooter: e.target.value })}
                className="shine-input"
              />
            </div>
          </div>

          {/* Google Sheets Integration */}
          <div className="pt-4 border-t-2 border-[#d9e1ec] dark:border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#032653] text-[#ffd028] border-2 border-[#032653] flex items-center justify-center shadow-[2px_2px_0_#ffd028]">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-black text-[#032653] dark:text-white text-sm">Database Google Sheets Terhubung</h3>
                <p className="text-[11px] text-[#5d6878] dark:text-white/70 font-semibold">Sinkronisasi data penjualan kasir langsung ke Google Spreadsheet studio</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>URL Apps Script Web App Google Sheets</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={storeForm.sheetsUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, sheetsUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 shine-input font-mono text-xs"
                />
                <button 
                  type="button" 
                  onClick={handleTestSync} 
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-[#032653] text-white border-2 border-[#032653] font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0_#ffd028] hover:bg-[#063b7a] transition-all"
                  title="Upload produk lokal ke Sheets dan sinkronkan"
                >
                  <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Sinkron...' : 'Upload & Sync'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={handlePullCloud} 
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0_#032653] hover:bg-[#ffe066] transition-all"
                  title="Tarik produk & data terbaru dari Google Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${syncing ? 'animate-spin' : ''}`} />
                  <span>Tarik Data</span>
                </button>
              </div>
              {syncResult && (
                <p className="text-[11px] font-black text-[#032653] dark:text-[#ffd028] mt-2 p-2.5 rounded-xl bg-[#fff7cc] dark:bg-[#06346b] border border-[#ffd028]">
                  {syncResult}
                </p>
              )}
            </div>

            <div className="bg-[#f4f7fb] dark:bg-[#032653] border-2 border-[#d9e1ec] dark:border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-black text-[#032653] dark:text-[#ffd028] text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4 stroke-[2.5] text-[#ffd028]" />
                  Panduan Google Apps Script Backend:
                </span>
                <button 
                  type="button" 
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 rounded-lg bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-[11px] flex items-center gap-1 shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
                >
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{copiedCode ? '✅ Kode Tersalin!' : 'Salin Kode Backend Apps Script'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#5d6878] dark:text-white/70 leading-relaxed font-semibold">
                Kode backend Google Apps Script telah disesuaikan secara presisi dengan struktur kolom spreadsheet Anda. Jika membuat deployment baru, salin kode di atas lalu paste ke menu <strong>Ekstensi → Apps Script</strong>.
              </p>
            </div>
          </div>

          {/* WhatsApp Gateway API Integration */}
          <div className="pt-4 border-t-2 border-[#d9e1ec] dark:border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white border-2 border-emerald-800 flex items-center justify-center shadow-[2px_2px_0_#064e3b]">
                <MessageCircle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-black text-[#032653] dark:text-white text-sm">Integrasi WhatsApp Gateway API (Kirim Struk Otomatis)</h3>
                <p className="text-[11px] text-[#5d6878] dark:text-white/70 font-semibold">Kirim struk digital otomatis langsung ke WhatsApp pelanggan via API tanpa perlu buka WhatsApp Web/App</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>URL Endpoint API WhatsApp Gateway</label>
                <input 
                  type="url" 
                  value={storeForm.waApiUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, waApiUrl: e.target.value })}
                  placeholder="Contoh: https://api.fonnte.com/send atau https://starsender.online/api/send"
                  className="shine-input font-mono text-xs"
                />
                <p className="text-[10px] text-[#5d6878] dark:text-white/60 mt-1">
                  Mendukung semua provider WhatsApp Gateway (Fonnte, Starsender, Wablas, Whacenter, Waba, Node Webhook). Masukkan link API endpoint yang Anda miliki.
                </p>
              </div>

              <div>
                <label className={labelClass}>API Key / Token / Authorization Key</label>
                <input 
                  type="password" 
                  value={storeForm.waApiKey}
                  onChange={(e) => setStoreForm({ ...storeForm, waApiKey: e.target.value })}
                  placeholder="Masukkan Token / API Key dari provider WhatsApp Anda"
                  className="shine-input font-mono text-xs"
                />
              </div>

              {/* Auto Send Toggle */}
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[#06346b] border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-[#032653] dark:text-white">Kirim Otomatis Seketika Transaksi Selesai</p>
                  <p className="text-[10px] text-[#5d6878] dark:text-white/70">Bila aktif dan no. WhatsApp pelanggan terisi, sistem langsung menembak API struk ke WA pelanggan secara otomatis.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={storeForm.waAutoSend}
                    onChange={(e) => setStoreForm({ ...storeForm, waAutoSend: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Test WhatsApp API Sender */}
              <div className="p-3.5 rounded-xl bg-[#f4f7fb] dark:bg-[#032653] border-2 border-[#d9e1ec] dark:border-white/10 space-y-2">
                <p className="text-xs font-black text-[#032653] dark:text-[#ffd028] flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Uji Coba Kirim Struk WhatsApp:</span>
                </p>
                <div className="flex gap-2">
                  <input 
                    type="tel"
                    value={testWaPhone}
                    onChange={(e) => setTestWaPhone(e.target.value)}
                    placeholder="Nomor WA tujuan tes (085121809135)"
                    className="flex-1 shine-input text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestWa}
                    disabled={testWaLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-800 font-black text-xs shadow-[2px_2px_0_#064e3b] flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {testWaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{testWaLoading ? 'Mengirim...' : 'Tes Kirim'}</span>
                  </button>
                </div>
                {testWaResult && (
                  <p className="text-[11px] font-bold mt-1 text-[#032653] dark:text-[#ffd028]">
                    {testWaResult}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t-2 border-[#d9e1ec] dark:border-white/10">
            <button 
              type="button" 
              onClick={handleResetData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-100 border-2 border-rose-400 text-rose-700 font-black text-xs hover:bg-rose-500 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data Toko</span>
            </button>

            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Profil Toko</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
