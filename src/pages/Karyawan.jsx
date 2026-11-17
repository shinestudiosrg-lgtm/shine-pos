import React, { useState } from 'react';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Karyawan() {
  const { users, approveEmployee, rejectEmployee, deleteEmployee, toggleUserRole, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'approved');

  const handleDeleteResigned = (user) => {
    if (confirm(`Apakah Anda yakin ingin menghapus karyawan "${user.name}" dari sistem karena sudah resign?`)) {
      deleteEmployee(user.id);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black text-[#032653] dark:text-white tracking-tight">Manajemen Karyawan Studio & Resign</h1>
            {pendingUsers.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffd028] text-[#032653] border border-[#032653] font-black text-xs animate-bounce shadow-sm">
                {pendingUsers.length} Permintaan Baru
              </span>
            )}
          </div>
          <p className="text-xs text-[#5d6878] dark:text-white/70 font-semibold">
            Setujui pendaftaran akun karyawan baru kasir atau hapus akses karyawan yang sudah resign.
          </p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-3 border-b-2 border-[#d9e1ec] dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
            activeTab === 'pending'
              ? 'bg-[#ffd028] text-[#032653] border-2 border-[#032653] shadow-[2px_2px_0_#032653]'
              : 'bg-white dark:bg-[#06346b] text-[#5d6878] dark:text-white/70 border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
          }`}
        >
          <Clock className="w-4 h-4 stroke-[2.5]" />
          <span>Menunggu Persetujuan ({pendingUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
            activeTab === 'active'
              ? 'bg-[#032653] text-white border-2 border-[#032653] shadow-[2px_2px_0_#ffd028]'
              : 'bg-white dark:bg-[#06346b] text-[#5d6878] dark:text-white/70 border-2 border-[#d9e1ec] dark:border-white/10 hover:border-[#032653]'
          }`}
        >
          <UserCheck className="w-4 h-4 stroke-[2.5]" />
          <span>Karyawan Aktif Terdaftar ({activeUsers.length})</span>
        </button>
      </div>

      {/* Tab Content: Pending Approval */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="shine-card p-12 text-center text-[#5d6878] dark:text-white/60 text-xs font-bold">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-70" />
              <p className="font-black text-base text-[#032653] dark:text-white">Tidak Ada Antrean Pendaftaran Karyawan</p>
              <p className="mt-1">Semua pendaftaran akun kasir telah diproses dan disetujui oleh Owner.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="shine-card p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ffd028] text-[#032653] border-2 border-[#032653] font-black text-sm flex items-center justify-center shadow-[2px_2px_0_#032653]">
                        <User className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-[#032653] dark:text-white">{user.name}</h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#ffd028] text-[#032653] border border-[#032653] uppercase shadow-sm">
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#5d6878] dark:text-white/80 bg-[#f4f7fb] dark:bg-[#032653] border border-[#d9e1ec] dark:border-white/10 p-3 rounded-xl font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#063b7a] dark:text-[#ffd028]" />
                      <span className="truncate font-bold text-[#032653] dark:text-white">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#063b7a] dark:text-[#ffd028]" />
                      <span className="font-bold text-[#032653] dark:text-white">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#5d6878] dark:text-white/60">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(user.registeredAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => rejectEmployee(user.id)}
                      className="flex-1 py-2 rounded-xl bg-white dark:bg-[#06346b] border-2 border-rose-400 text-rose-700 font-black text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                    <button
                      onClick={() => approveEmployee(user.id)}
                      className="flex-1 py-2 rounded-xl bg-[#032653] text-white border-2 border-[#032653] font-black text-xs shadow-[2px_2px_0_#ffd028] flex items-center justify-center gap-1.5 hover:bg-[#063b7a] transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Setujui</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Active Employees */}
      {activeTab === 'active' && (
        <div className="shine-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#032653] text-white">
                <tr>
                  <th className="p-4 font-black uppercase text-[11px]">Nama Karyawan</th>
                  <th className="p-4 font-black uppercase text-[11px]">Email</th>
                  <th className="p-4 font-black uppercase text-[11px]">No. HP</th>
                  <th className="p-4 font-black uppercase text-[11px]">Role Akses</th>
                  <th className="p-4 font-black uppercase text-[11px]">Status</th>
                  <th className="p-4 font-black uppercase text-[11px] text-right">Aksi Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d9e1ec] dark:divide-white/10 bg-white dark:bg-[#06346b] text-[#101828] dark:text-white">
                {activeUsers.map((user) => {
                  const isUserOwner = user.role === 'owner';
                  const isCurrentLoggedUser = user.id === currentUser?.id;

                  return (
                    <tr key={user.id} className="hover:bg-[#f4f7fb] dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 font-black text-[#032653] dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border border-[#032653] ${
                            isUserOwner ? 'bg-[#ffd028] text-[#032653]' : 'bg-[#e8f0ff] text-[#063b7a]'
                          }`}>
                            {isUserOwner ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <span>{user.name}</span>
                          {isCurrentLoggedUser && (
                            <span className="text-[10px] bg-[#ffd028] text-[#032653] border border-[#032653] px-1.5 py-0.5 rounded font-black">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-[#5d6878] dark:text-white/70 font-semibold">{user.email}</td>
                      <td className="p-4 text-[#5d6878] dark:text-white/70 font-semibold">{user.phone}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase border ${
                          isUserOwner 
                            ? 'bg-[#ffd028] text-[#032653] border-[#032653]' 
                            : 'bg-[#e8f0ff] text-[#063b7a] border-[#c7d9f7]'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#e6f9ed] text-[#0e7036] border border-[#a3e6be] text-[10px] font-black">
                          Aktif Terverifikasi
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {!isCurrentLoggedUser && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleUserRole(user.id, isUserOwner ? 'karyawan' : 'owner')}
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#032653] border-2 border-[#032653] text-[#032653] dark:text-white text-[11px] font-black hover:bg-[#ffd028] hover:text-[#032653] transition-colors"
                            >
                              Ubah ke {isUserOwner ? 'Karyawan' : 'Owner'}
                            </button>
                            <button
                              onClick={() => handleDeleteResigned(user)}
                              className="px-3 py-1.5 rounded-lg bg-rose-100 border-2 border-rose-400 text-rose-700 text-[11px] font-black flex items-center gap-1 hover:bg-rose-500 hover:text-white transition-colors"
                              title="Hapus Karyawan Resign"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Resign</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
