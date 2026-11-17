import React, { useState } from 'react';
import { Store, Lock, Mail, ArrowRight, Sparkles, Camera, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onGoToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) setError(res.message);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#032653] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#ffd028] selection:text-[#032653]">
      {/* Playful Background Decorative Rings (matching website hero & section-blue) */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full border-[28px] border-[#063b7a]/40 pointer-events-none" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border-[32px] border-[#063b7a]/40 pointer-events-none" />
      <div className="absolute right-12 top-16 w-36 h-36 rounded-full border-[14px] border-[#ffd028]/15 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[3px_3px_0_#ffd028] mb-3">
            <Camera className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">SHINE STUDIO</h1>
            <Sparkles className="w-4 h-4 text-[#ffd028] fill-[#ffd028]" />
          </div>
          <p className="text-[10px] text-[#ffd028] font-black uppercase tracking-widest">
            Aplikasi Kasir POS & Photobooth Studio
          </p>
        </div>

        {/* Login Card */}
        <div className="shine-card p-6 sm:p-8 relative">
          <div className="shine-accent-bar" />
          <h2 className="text-xl font-black text-[#032653] mb-1">Masuk ke Akun</h2>
          <p className="text-xs text-[#5d6878] font-semibold mb-5">Masukkan email/username dan password akun Anda untuk mengakses sistem kasir.</p>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-800 text-xs font-black leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#032653] mb-1.5">Email / Username Akun</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#063b7a] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email / username kasir"
                  className="shine-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#032653] mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#063b7a] absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="shine-input pl-11"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Memverifikasi Akun...' : 'Masuk ke Aplikasi Kasir'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t-2 border-[#d9e1ec] text-center">
            <p className="text-xs text-[#5d6878] font-semibold mb-2">Belum memiliki akun Karyawan?</p>
            <button
              onClick={onGoToRegister}
              className="text-xs font-black text-[#063b7a] hover:text-[#145ef3] underline underline-offset-4 transition-colors"
            >
              Daftar Sebagai Karyawan Baru (Butuh Approval Owner)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
