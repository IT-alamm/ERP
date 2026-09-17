import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Read from .env (Vite injects this for web, process.env for RN)
const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : process?.env?.VITE_API_URL;

// Base URL: use env var if set, otherwise use Platform-based defaults
const BASE_URL = envBaseUrl || (Platform.OS === 'android'
  ? 'http://10.0.2.2:8080/api/v1'  // Android emulator
  : 'http://localhost:8080/api/v1'); // iOS simulator / web

// For real device: change to 'http://192.168.0.100:8080/api/v1'

export const api = axios.create({ baseURL: BASE_URL });

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

export async function decodeRole(): Promise<string | null> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export async function decodeUsername(): Promise<string | null> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).sub ?? null;
  } catch {
    return null;
  }
}

export function extractError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message ?? err.message ?? 'Something went wrong';
}
