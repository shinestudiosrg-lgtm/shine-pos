import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CalculatorModal from './components/CalculatorModal';
import ShiftModal from './components/ShiftModal';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Kasir from './pages/Kasir';
import Produk from './pages/Produk';
import Customer from './pages/Customer';
import Invoice from './pages/Invoice';
import Laporan from './pages/Laporan';
import Karyawan from './pages/Karyawan';
import Settings from './pages/Settings';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('shine_pos_active_tab');
    return saved || 'dashboard';
  });
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    localStorage.setItem('shine_pos_active_tab', activeTab);
  }, [activeTab]);

  // Mobile menu drawer state
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Modals
  const [showCalculator, setShowCalculator] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);

  // If user is not logged in, show Login or Register view
  if (!currentUser) {
    if (authView === 'register') {
      return <Register onGoToLogin={() => setAuthView('login')} />;
    }
    return <Login onGoToRegister={() => setAuthView('register')} />;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'kasir': return 'Kasir Workspace';
      case 'produk': return 'Layanan & Stok Studio';
      case 'customer': return 'Database Pelanggan';
      case 'invoice': return 'Riwayat Transaksi';
      case 'laporan': return 'Laporan Keuangan';
      case 'karyawan': return 'Manajemen Karyawan';
      case 'settings': return 'Pengaturan Toko & Akun';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] dark:bg-[#021833] text-[#101828] dark:text-[#f8fafc] font-sans selection:bg-[#ffd028] selection:text-[#032653]">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header Bar */}
        <Header 
          activeTabTitle={getTabTitle()} 
          onOpenCalculator={() => setShowCalculator(true)} 
          onOpenMobileMenu={() => setIsOpenMobile(true)}
        />

        {/* Page Views Container */}
        <main className="p-4 md:p-6 lg:p-7 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onOpenShiftModal={() => setShowShiftModal(true)} 
            />
          )}
          {activeTab === 'kasir' && <Kasir />}
          {activeTab === 'produk' && <Produk />}
          {activeTab === 'customer' && <Customer />}
          {activeTab === 'invoice' && <Invoice />}
          {activeTab === 'laporan' && <Laporan />}
          {activeTab === 'karyawan' && <Karyawan />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Modals */}
      <CalculatorModal 
        isOpen={showCalculator} 
        onClose={() => setShowCalculator(false)} 
      />

      <ShiftModal 
        isOpen={showShiftModal} 
        onClose={() => setShowShiftModal(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
