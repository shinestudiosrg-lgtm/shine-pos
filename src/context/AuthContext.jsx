import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncToGoogleSheets, fetchFromGoogleSheets } from '../services/googleSheets';

const AuthContext = createContext();

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyKs5hVq7jfuQqDdsBvTb_g1I-vDCwmes_bhT049Bdl1gdAYn-vTRA4kJt4U0XjeMUp/exec';

// Initial Owner Account
const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Owner Studio',
    email: 'owner',
    password: 'owner123',
    role: 'owner',
    status: 'approved',
    phone: '081234567890',
    registeredAt: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('shine_pos_users');
    if (!saved) return INITIAL_USERS;
    const parsed = JSON.parse(saved);
    return parsed.map(u => u.role === 'owner' ? { ...u, email: 'owner', password: 'owner123' } : u);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('shine_pos_current_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.role === 'owner') {
      return { ...parsed, email: 'owner', password: 'owner123' };
    }
    return parsed;
  });

  // Pull latest users (pending registrations & approvals) from Google Sheets in background
  const pullCloudUsers = async () => {
    if (!SHEETS_URL) return;
    const cloudData = await fetchFromGoogleSheets(SHEETS_URL);
    if (cloudData && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
      setUsers(cloudData.users);
    }
  };

  useEffect(() => {
    pullCloudUsers();
    const interval = setInterval(() => {
      pullCloudUsers();
    }, 10000); // 10 seconds auto-pull for pending registration approvals
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('shine_pos_users', JSON.stringify(users));
  }, [users]);

  // Persist currentUser to localStorage on every change (fix: login state survives refresh)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shine_pos_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shine_pos_current_user');
    }
  }, [currentUser]);

  // Auto Logout after 5 minutes (300 seconds) of idle inactivity
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId;
    const FIVE_MINUTES = 5 * 60 * 1000;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        alert('🔒 Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 5 menit untuk keamanan studio.');
      }, FIVE_MINUTES);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [currentUser]);

  const login = (emailInput, passwordInput) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const user = users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.role === 'owner' && (cleanEmail === 'owner' || cleanEmail === 'owner@kasir.com' || cleanEmail === 'owner@shinestudio.com'))
    );

    if (!user) {
      return { success: false, message: 'Email / Username tidak terdaftar.' };
    }
    if (user.password !== passwordInput) {
      return { success: false, message: 'Password salah. Silakan coba lagi.' };
    }
    if (user.status === 'pending') {
      return { success: false, message: 'Akun Anda masih dalam antrean persetujuan (status: pending) oleh Owner Toko.' };
    }
    if (user.status === 'rejected') {
      return { success: false, message: 'Permintaan pendaftaran akun Anda ditolak oleh Owner.' };
    }

    setCurrentUser(user);
    return { success: true, user };
  };

  // Register Employee (Status: pending -> Instantly Pushed to Google Sheets Users Tab)
  const registerEmployee = ({ name, email, phone, password }) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email sudah terdaftar di sistem.' };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      password,
      role: 'karyawan',
      status: 'pending', // Pending approval
      registeredAt: new Date().toISOString()
    };

    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);

    // Instantly Push to Google Sheets so Owner sees the pending request immediately
    syncToGoogleSheets(SHEETS_URL, 'syncUsers', nextUsers);

    return { 
      success: true, 
      message: 'Pendaftaran berhasil! Akun Anda tersimpan di database dengan status "Pending". Silakan minta Owner untuk menyetujui akun Anda.' 
    };
  };

  // Approve Employee (Status: approved -> Instantly Pushed to Google Sheets)
  const approveEmployee = (userId) => {
    const nextUsers = users.map(u => u.id === userId ? { ...u, status: 'approved' } : u);
    setUsers(nextUsers);
    syncToGoogleSheets(SHEETS_URL, 'syncUsers', nextUsers);
  };

  // Reject Employee (Status: rejected -> Instantly Pushed to Google Sheets)
  const rejectEmployee = (userId) => {
    const nextUsers = users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u);
    setUsers(nextUsers);
    syncToGoogleSheets(SHEETS_URL, 'syncUsers', nextUsers);
  };

  // Delete Employee (Resign -> Instantly Pushed to Google Sheets)
  const deleteEmployee = (userId) => {
    const nextUsers = users.filter(u => u.id !== userId);
    setUsers(nextUsers);
    syncToGoogleSheets(SHEETS_URL, 'syncUsers', nextUsers);
  };

  const toggleUserRole = (userId, newRole) => {
    const nextUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(nextUsers);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole }));
    }
    syncToGoogleSheets(SHEETS_URL, 'syncUsers', nextUsers);
  };

  const updateUserProfile = (userId, profileData) => {
    const nextUsers = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          name: profileData.name || u.name,
          email: profileData.email || u.email,
          phone: profileData.phone || u.phone,
          password: profileData.password ? profileData.password : u.password
        };
      }
      return u;
    });

    setUsers(nextUsers);

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        name: profileData.name || prev.name,
        email: profileData.email || prev.email,
        phone: profileData.phone || prev.phone,
        password: profileData.password ? profileData.password : prev.password
      }));
    }

    syncToGoogleSheets(SHEETS_URL, 'syncUsers', nextUsers);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const pendingUsersCount = users.filter(u => u.status === 'pending').length;

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      pendingUsersCount,
      login,
      registerEmployee,
      approveEmployee,
      rejectEmployee,
      deleteEmployee,
      toggleUserRole,
      updateUserProfile,
      logout,
      setCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
