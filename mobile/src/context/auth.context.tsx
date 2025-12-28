import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth.service";
import { clearToken, getToken, setToken } from "../storage/token";
import type { MeResponse } from "../types/dtos";

type AuthState = {
  loading: boolean;
  isAuthed: boolean;
  me: MeResponse["user"] | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);

  async function refreshMe() {
    try {
      const res = await authService.me();
      setMe(res.user);
      setIsAuthed(true);
    } catch {
      setMe(null);
      setIsAuthed(false);
    }
  }

  async function boot() {
    setLoading(true);
    const token = await getToken();
    if (!token) {
      setIsAuthed(false);
      setMe(null);
      setLoading(false);
      return;
    }
    await refreshMe();
    setLoading(false);
  }

  useEffect(() => {
    boot();
  }, []);

  async function login(token: string) {
    await setToken(token);
    await refreshMe();
  }

  async function logout() {
    try {
      await authService.logout(); // optional, tapi endpoint kamu ada
    } catch {
      // ignore
    }
    await clearToken();
    setMe(null);
    setIsAuthed(false);
  }

  const value = useMemo(
    () => ({ loading, isAuthed, me, login, logout, refreshMe }),
    [loading, isAuthed, me]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}