import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, unwrap, decodeRole, decodeUsername, extractError } from '../services/api';

interface AuthState {
  role: string | null;
  username: string | null;
  login: (username: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await decodeRole();
      const u = await decodeUsername();
      setRole(r);
      setUsername(u);
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string, role: string) => {
    const res = await api.post('/auth/login', { username, password, role });
    const data = unwrap<{ accessToken: string; refreshToken: string }>(res);
    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    const r = await decodeRole();
    const u = await decodeUsername();
    setRole(r);
    setUsername(u);
  };

  const logout = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ }
    await AsyncStorage.clear();
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ role, username, login, logout, isAdmin: role === 'ROLE_ADMIN', loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
