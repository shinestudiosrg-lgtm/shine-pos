import React, { useState } from 'react';
import { Camera, User, Mail, Phone, Lock, ArrowLeft, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onGoToLogin }) {
  const { registerEmployee } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const res = registerEmployee({ name, email, phone, password });
    if (!res.success) setError(res.message);
    else setSuccessMsg(res.message);
  };

  return (
    <div className="min-h-screen bg-[#032653] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#ffd028] selection:text-[#032653]">
      {/* Playful Background Decorative Rings */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full border-[28px] border-[#063b7a]/40 pointer-events-none" />
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border-[32px] border-[#063b7a]/40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[3px_3px_0_#ffd028] mb-3">
            <Camera className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">SHINE STUDIO</h1>
            <Sparkles className="w-4 h-4 text-[#ffd028] fill-[#ffd028]" />
          </div>
          <p className="text-[10px] text-[#ffd028] font-black uppercase tracking-widest">
            Pendaftaran Akun Karyawan Kasir
          </p>
        </div>

        <div className="shine-card p-6 sm:p-8 relative">
          <div className="shine-accent-bar" />

          {successMsg ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#ffd028] border-2 border-[#032653] flex items-center justify-center mx-auto shadow-[3px_3px_0_#032653]">
                <Clock className="w-8 h-8 text-[#032653] stroke-[2.5] animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-[#032653]">Menunggu Persetujuan Owner</h3>
              <p className="text-xs text-[#101828] font-bold leading-relaxed bg-[#fff7cc] border-2 border-[#ffd028] p-4 rounded-xl">
                {successMsg}
              </p>
              <button
                onClick={onGoToLogin}
                className="w-full py-3 rounded-xl bg-[#032653] text-white border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#ffd028] hover:bg-[#063b7a]"
              >
                Kembali ke Halaman Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-[#032653] mb-1">Daftar Akun Karyawan</h2>
                <p className="text-xs text-[#5d6878] font-semibold mb-4">Akun baru akan diverifikasi dan disetujui langsung oleh Owner Studio.</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-800 text-xs font-black">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[#032653] mb-1">Nama Lengkap Karyawan</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#063b7a] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Febrian"
                    className="shine-input pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#032653] mb-1">Email / Username Karyawan</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#063b7a] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rian@kasir.com"
                    className="shine-input pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#032653] mb-1">No. WhatsApp / HP</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-[#063b7a] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="tel" 
                    required 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                    className="shine-input pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#032653] mb-1">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#063b7a] absolute left-3.5 pointer-events-none" />
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="shine-input pl-11"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#fff7cc] border-2 border-[#ffd028] rounded-xl text-[11px] text-[#032653] font-bold leading-relaxed">
                📌 <strong>Catatan:</strong> Setelah mendaftar, hubungi Owner untuk menyetujui akun di menu <strong>Manajemen Karyawan</strong>.
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-xs shadow-[3px_3px_0_#032653] hover:shadow-[4px_4px_0_#032653] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                Kirim Pendaftaran Karyawan
              </button>

              <button 
                type="button" 
                onClick={onGoToLogin}
                className="w-full py-2 text-xs font-black text-[#063b7a] hover:text-[#145ef3] flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
