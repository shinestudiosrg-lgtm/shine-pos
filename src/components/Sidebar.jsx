import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Receipt, 
  BarChart3, 
  UserCheck, 
  Settings, 
  LogOut, 
  Camera,
  ShieldCheck,
  User,
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, isOpenMobile, setIsOpenMobile }) {
  const { currentUser, pendingUsersCount, logout } = useAuth();
  const isOwner = currentUser?.role === 'owner';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'kasir', label: 'Kasir Checkout', icon: ShoppingCart, role: 'all', badge: 'POS' },
    { id: 'produk', label: 'Layanan & Stok', icon: Package, role: 'all' },
    { id: 'customer', label: 'Pelanggan Studio', icon: Users, role: 'all' },
    { id: 'invoice', label: 'Invoice & Struk', icon: Receipt, role: 'all' },
    { id: 'laporan', label: 'Rekap & Laporan', icon: BarChart3, role: 'owner', ownerOnly: true },
    { id: 'karyawan', label: 'Karyawan', icon: UserCheck, role: 'owner', ownerOnly: true, badgeCount: pendingUsersCount },
    { id: 'settings', label: 'Pengaturan & Akun', icon: Settings, role: 'all' }
  ];

  const handleSelect = (id, isRestricted) => {
    if (!isRestricted) {
      setActiveTab(id);
      if (setIsOpenMobile) setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-[#032653]/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#032653] text-white border-r-3 border-[#063b7a] flex flex-col justify-between select-none transition-all duration-200 shadow-2xl
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b-2 border-[#063b7a] flex items-center justify-between bg-[#021d3f]">
            <div className="flex items-center gap-3">
              {/* Brand Mark: Asymmetric playful yellow badge */}
              <div className="w-10 h-10 rounded-xl bg-[#ffd028] border-2 border-[#032653] flex items-center justify-center text-[#032653] shadow-[2px_2px_0_#ffd028]">
                <Camera className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-base text-white tracking-wider">SHINE STUDIO</h1>
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd028] fill-[#ffd028]" />
                </div>
                <p className="text-[9px] text-[#ffd028] font-black uppercase tracking-widest leading-none mt-0.5">
                  Self-Photo & Photobooth
                </p>
              </div>
            </div>

            {/* Close button on mobile */}
            <button 
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isRestricted = item.ownerOnly && !isOwner;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id, isRestricted)}
                  disabled={isRestricted}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[3px_3px_0_#063b7a] scale-[1.02]'
                      : isRestricted
                      ? 'text-white/30 opacity-40 cursor-not-allowed border-2 border-transparent'
                      : 'text-[#e8f0ff] hover:text-[#ffd028] hover:bg-[#063b7a]/60 border-2 border-transparent hover:border-[#063b7a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-[#032653]' : 'text-[#ffd028]'}`} />
                    <span className="tracking-wide text-[12.5px]">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && !isRestricted && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-[#032653] text-[#ffd028]' 
                          : 'bg-[#ffd028] text-[#032653] border border-[#032653]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.badgeCount > 0 && isOwner && (
                      <span className="bg-[#ffd028] text-[#032653] border-1.5 border-[#032653] text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-[2px_2px_0_#032653]">
                        {item.badgeCount} Baru
                      </span>
                    )}
                    {isRestricted && (
                      <span className="text-[9px] uppercase font-black text-white/40 bg-black/30 border border-white/10 px-1.5 py-0.5 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t-2 border-[#063b7a] bg-[#021d3f]">
          <div className="bg-[#063b7a] border-2 border-[#0a4fa0] rounded-xl p-3 mb-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border border-[#032653] ${
                  isOwner 
                    ? 'bg-[#ffd028] text-[#032653]' 
                    : 'bg-[#145ef3] text-white'
                }`}>
                  {isOwner ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-white truncate max-w-[110px]">{currentUser?.name}</p>
                  <p className="text-[10px] text-[#ffd028] capitalize font-black tracking-wide">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white font-black text-xs transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
