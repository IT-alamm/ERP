import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { Platform } from 'react-native';

// EXPO_PUBLIC_API_URL build time par bake hota hai (EAS env / .env) - production builds ke liye.
// Expo Go real phone par: Metro host se laptop ka LAN IP nikalo,
// kyunki 10.0.2.2 (sirf Android emulator) aur localhost real device par kabhi kaam nahi karte.
function resolveBaseUrl(): string {
  const fromEnv =
    typeof process !== 'undefined' && process.env
      ? (process.env.EXPO_PUBLIC_API_URL || '').trim()
      : '';
  if (fromEnv) {
    const clean = fromEnv.replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8080/api/v1`;
    }
  }

  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:8080/api/v1' // Android emulator
      : 'http://localhost:8080/api/v1'; // iOS simulator
  }
  throw new Error('EXPO_PUBLIC_API_URL missing: production build needs the backend URL at build time.');
}

export const BASE_URL = resolveBaseUrl();

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken && !refreshing) {
        refreshing = true;
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('accessToken', data.data.accessToken);
          refreshing = false;
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          refreshing = false;
          await AsyncStorage.clear();
        }
      } else if (!refreshToken) {
        await AsyncStorage.clear();
      }
    }
    return Promise.reject(error);
  }
);

export const unwrap = <T,>(res: { data: { data: T } }): T => res.data.data;

// Hermes me atob() nahi hota, isliye chhota manual base64url decoder (koi nayi dependency nahi).
function base64UrlToJson<T>(segment: string): T | null {
  try {
    let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes: number[] = [];
    let acc = 0;
    let bits = 0;
    for (const ch of base64) {
      if (ch === '=') break;
      const v = chars.indexOf(ch);
      if (v < 0) return null;
      acc = (acc << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((acc >> bits) & 0xff);
      }
    }
    const bin = String.fromCharCode(...bytes);
    const json = decodeURIComponent(
      bin
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function decodeRole(): Promise<string | null> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return base64UrlToJson<{ role?: string }>(parts[1])?.role ?? null;
}

export async function decodeUsername(): Promise<string | null> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return base64UrlToJson<{ sub?: string }>(parts[1])?.sub ?? null;
}

export function extractError(e: unknown): string {
  if (!e || typeof e !== 'object') return 'Something went wrong';
  const err = e as { response?: { data?: { message?: string } }; request?: unknown; message?: string };
  if (err.response?.data?.message) return err.response.data.message;
  // Server tak request pahunchi hi nahi (galat IP / backend band / firewall)
  if (err.request && !err.response) return `Server unreachable (${BASE_URL}). Same WiFi + backend :8080 check karo.`;
  return err.message ?? 'Something went wrong';
}
