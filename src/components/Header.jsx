import React, { useState, useEffect } from 'react';
import { Menu, Calculator, Clock, Store, ShieldCheck, UserCheck, Bell, Sun, Moon, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import InstallPwaButton from './InstallPwaButton';

export default function Header({ onOpenCalculator, activeTabTitle, onOpenMobileMenu }) {
  const { currentUser, pendingUsersCount } = useAuth();
  const { currentShift, settings, cloudSyncing, pullCloudData } = useData();
  const { themeMode, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#032653] border-b-2 border-[#d9e1ec] dark:border-[#063b7a] sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between shadow-sm transition-colors">
      {/* Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#e8f0ff] dark:bg-[#063b7a] text-[#032653] dark:text-white border border-[#d9e1ec] dark:border-[#0a4fa0] hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-black text-[#032653] dark:text-white tracking-tight capitalize">
              {activeTabTitle}
            </h2>
          </div>
          <p className="text-[10px] md:text-xs text-[#5d6878] dark:text-white/60 font-bold">
            Studio: <span className="text-[#063b7a] dark:text-[#ffd028] font-black">{settings?.storeName}</span>
          </p>
        </div>

        {/* Shift Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f7fb] dark:bg-[#063b7a] border-1.5 border-[#d9e1ec] dark:border-[#0a4fa0] text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${currentShift?.isOpen ? 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="font-black text-[#032653] dark:text-white">
            {currentShift?.isOpen ? 'Shift Aktif' : 'Shift Tutup'}
          </span>
          <span className="text-[#145ef3] dark:text-[#ffd028] font-bold">| {currentShift?.cashierName}</span>
        </div>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Install Native Android PWA Button */}
        <InstallPwaButton />

        {/* Real-Time Cloud Sync Trigger Button */}
        <button
          onClick={pullCloudData}
          disabled={cloudSyncing}
          className="px-3 py-1.5 rounded-xl bg-[#e8f0ff] dark:bg-[#063b7a] border-2 border-[#063b7a] text-[#063b7a] dark:text-[#ffd028] text-xs font-black flex items-center gap-1.5 hover:bg-[#ffd028] hover:text-[#032653] transition-all shadow-sm"
          title="Sinkronisasi Data Real-Time dari Google Sheets"
        >
          <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${cloudSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{cloudSyncing ? 'Memperbarui...' : 'Sinkron Cloud'}</span>
        </button>

        {/* Real-time Clock (Shine Signature Yellow Badge) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] text-xs font-black shadow-[2px_2px_0_#032653]">
          <Clock className="w-4 h-4 stroke-[2.5]" />
          <span className="font-mono tracking-tight">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
          </span>
        </div>

        {/* Light / Dark Mode Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white dark:bg-[#063b7a] border-2 border-[#032653] dark:border-[#ffd028] text-xs font-black transition-all flex items-center gap-1.5 shadow-[2px_2px_0_#032653] dark:shadow-[2px_2px_0_#ffd028] text-[#032653] dark:text-white"
          title={themeMode === 'dark' ? 'Ganti ke Tema Terang (Light Mode)' : 'Ganti ke Tema Gelap (Dark Mode)'}
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-[#ffd028]" />
              <span className="text-white hidden sm:inline">Terang</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#063b7a]" />
              <span className="text-[#032653] hidden sm:inline">Gelap</span>
            </>
          )}
        </button>

        {/* Calculator Button (Signature Yellow) */}
        <button
          onClick={onOpenCalculator}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black transition-all shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 text-xs"
          title="Buka Kalkulator Kasir"
        >
          <Calculator className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Kalkulator</span>
        </button>

        {/* Pending Employee Notification Alert for Owner */}
        {currentUser?.role === 'owner' && pendingUsersCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] text-xs font-black animate-bounce shadow-[3px_3px_0_#032653]">
            <Bell className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{pendingUsersCount} Approval Karyawan</span>
            <span className="sm:hidden">{pendingUsersCount}</span>
          </div>
        )}
      </div>
    </header>
  );
}
