import React, { useState } from 'react';
import { Users, Plus, Search, Award, Phone, X, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Customer() {
  const { customers, addCustomer } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addCustomer({ name, phone });
    setName('');
    setPhone('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#032653] dark:text-white tracking-tight">Database Pelanggan & Poin Loyalty</h1>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold">Kelola member studio, riwayat akumulasi poin foto, dan kontak WhatsApp</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="shine-card p-4 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="w-4 h-4 text-[#063b7a] dark:text-[#ffd028] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau no. telepon pelanggan..."
            className="shine-input shine-input-with-icon pr-4 py-2 text-xs"
          />
        </div>
        <span className="text-xs text-[#063b7a] dark:text-[#ffd028] font-black whitespace-nowrap bg-[#e8f0ff] dark:bg-white/10 px-3 py-1.5 rounded-xl border border-[#c7d9f7] dark:border-white/10">
          {filteredCustomers.length} Pelanggan Terdaftar
        </span>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-3 shine-card p-12 text-center text-[#5d6878] dark:text-white/60 text-xs font-bold">
            <Users className="w-12 h-12 text-[#063b7a] dark:text-[#ffd028] opacity-30 mx-auto mb-3" />
            <p className="font-black text-sm text-[#032653] dark:text-white">Belum ada pelanggan ditemukan</p>
            <p className="mt-1">Klik "Tambah Pelanggan Baru" untuk mendaftarkan kontak pelanggan</p>
          </div>
        ) : filteredCustomers.map((cust) => (
          <div key={cust.id} className="shine-card-interactive p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-sm flex items-center justify-center shadow-[2px_2px_0_#032653]">
                    {cust.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#032653] dark:text-white">{cust.name}</h3>
                    <p className="text-[11px] text-[#5d6878] dark:text-white/60 flex items-center gap-1 font-bold">
                      <Phone className="w-3 h-3 text-[#145ef3]" />
                      <span>{cust.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffd028] text-[#032653] border border-[#032653] font-black text-xs shadow-sm">
                  <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{cust.points} Poin</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-[#d9e1ec] dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-[#5d6878] dark:text-white/70 font-semibold">Total Belanja:</span>
              <span className="font-black text-[#032653] dark:text-[#ffd028] text-sm">{formatRp(cust.totalSpend)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm shine-card p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#d9e1ec] dark:border-white/10 mb-4">
              <h3 className="font-black text-[#032653] dark:text-white text-base">Tambah Pelanggan Baru</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1 rounded-lg bg-[#f4f7fb] dark:bg-white/10 text-[#032653] dark:text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-[#032653] dark:text-[#ffd028] mb-1.5">Nama Lengkap Pelanggan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shine-input font-bold"
                  placeholder="Contoh: Anita Rahayu"
                />
              </div>

              <div>
                <label className="block font-black text-[#032653] dark:text-[#ffd028] mb-1.5">No. Handphone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="shine-input font-bold"
                  placeholder="08123456789"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t-2 border-[#d9e1ec] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#063b7a] border-2 border-[#032653] text-[#032653] dark:text-white text-xs font-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] text-xs font-black shadow-[2px_2px_0_#032653]"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
