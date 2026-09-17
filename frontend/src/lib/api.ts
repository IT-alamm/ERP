import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080") + "/api/v1";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
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
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !refreshing) {
        refreshing = true;
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          localStorage.setItem("accessToken", data.data.accessToken);
          refreshing = false;
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          refreshing = false;
          localStorage.clear();
          window.location.href = "/login";
        }
      } else if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Backend wraps everything in ApiResponse { success, message, data }
export const unwrap = <T,>(res: { data: { data: T } }): T => res.data.data;

export function decodeRole(): string | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function decodeUsername(): string | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).sub ?? null;
  } catch {
    return null;
  }
}
