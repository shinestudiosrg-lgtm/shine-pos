import React, { useState } from 'react';
import { X, Lock, Unlock, DollarSign, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function ShiftModal({ isOpen, onClose }) {
  const { currentShift, setCurrentShift } = useData();
  const { currentUser } = useAuth();

  const [cashAmount, setCashAmount] = useState(500000);

  if (!isOpen) return null;

  const handleToggleShift = () => {
    if (currentShift.isOpen) {
      // Close shift
      setCurrentShift({
        isOpen: false,
        closedAt: new Date().toISOString(),
        finalCash: Number(cashAmount),
        cashierName: currentUser?.name || 'Kasir'
      });
    } else {
      // Open shift
      setCurrentShift({
        isOpen: true,
        openedAt: new Date().toISOString(),
        initialCash: Number(cashAmount),
        cashierName: currentUser?.name || 'Kasir'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#032653]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm shine-card p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#d9e1ec] dark:border-white/10 mb-4">
          <div className="flex items-center gap-2">
            {currentShift.isOpen ? (
              <Lock className="w-5 h-5 text-rose-500 stroke-[2.5]" />
            ) : (
              <Unlock className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
            )}
            <h3 className="font-black text-[#032653] dark:text-white text-base">
              {currentShift.isOpen ? 'Tutup Shift Kasir' : 'Buka Shift Kasir Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-[#f4f7fb] dark:bg-white/10 text-[#032653] dark:text-white hover:bg-[#ffd028] hover:text-[#032653] transition-colors">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#e8f0ff] dark:bg-[#032653] border-2 border-[#063b7a] rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ffd028] text-[#032653] border border-[#032653] flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[11px] text-[#5d6878] dark:text-white/70 font-semibold">Kasir Bertugas:</p>
              <p className="text-sm font-black text-[#032653] dark:text-white">{currentUser?.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#032653] dark:text-[#ffd028] mb-1.5">
              {currentShift.isOpen ? 'Jumlah Uang Kas di Laci Saat Ini (Rp)' : 'Modal Awal Kas Laci (Rp)'}
            </label>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="shine-input font-black text-base"
              placeholder="500000"
            />
          </div>

          {currentShift.isOpen && (
            <div className="p-3 bg-[#fff7cc] dark:bg-[#06346b] border-2 border-[#ffd028] rounded-xl flex items-start gap-2 text-[#032653] dark:text-[#ffd028] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 stroke-[2.5] text-[#032653] dark:text-[#ffd028] shrink-0 mt-0.5" />
              <span>Menutup shift akan menyelesaikan rekap shift kasir saat ini. Buka shift baru untuk melanjutkan kasir berikutnya.</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t-2 border-[#d9e1ec] dark:border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-white dark:bg-[#063b7a] border-2 border-[#032653] text-[#032653] dark:text-white"
            >
              Batal
            </button>
            <button
              onClick={handleToggleShift}
              className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-[2px_2px_0_#032653] transition-all ${
                currentShift.isOpen
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-2 border-[#032653]'
                  : 'bg-[#ffd028] hover:bg-[#ffda47] text-[#032653] border-2 border-[#032653]'
              }`}
            >
              {currentShift.isOpen ? 'Konfirmasi Tutup Shift' : 'Konfirmasi Buka Shift'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
