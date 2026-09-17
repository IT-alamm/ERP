import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api, unwrap, decodeRole, decodeUsername } from "../lib/api";

interface AuthState {
  role: string | null;
  username: string | null;
  login: (username: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(() => decodeRole());
  const [username, setUsername] = useState<string | null>(() => decodeUsername());
  const navigate = useNavigate();

  const login = async (username: string, password: string, role: string) => {
    const res = await api.post("/auth/login", { username, password, role });
    const data = unwrap<{ accessToken: string; refreshToken: string }>(res);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    const r = decodeRole();
    setRole(r);
    setUsername(decodeUsername());
    navigate(r === "ROLE_ADMIN" ? "/admin" : "/home", { replace: true });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {
      /* ignore */
    }
    localStorage.clear();
    setRole(null);
    setUsername(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ role, username, login, logout, isAdmin: role === "ROLE_ADMIN" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
