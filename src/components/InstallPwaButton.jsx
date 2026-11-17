import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed as Android App)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        '📱 CARA INSTAL DI ANDROID (Bukan Pintasan):\n\n' +
        '1. Buka link ini di Google Chrome HP Anda.\n' +
        '2. Tekan menu titik tiga (⋮) di pojok kanan atas Chrome.\n' +
        '3. Pilih "Instal aplikasi" (atau "Tambahkan ke Layar Utama").\n' +
        '4. Tekan "Instal".\n\n' +
        'Aplikasi akan terpasang sebagai aplikasi mandiri (WebAPK) di menu HP Anda!'
      );
    }
  };

  if (isStandalone) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] text-xs font-black shadow-[2px_2px_0_#032653] hover:shadow-[3px_3px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all shrink-0"
      title="Instal aplikasi ke HP Android (Standalone App tanpa address bar)"
    >
      <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
      <span className="hidden sm:inline">Instal App</span>
    </button>
  );
}
