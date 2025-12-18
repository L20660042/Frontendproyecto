import React, { createContext, useContext, useMemo, useState } from "react";
import authService, { type AuthUser } from "../services/authService";

type AuthCtx = {
  user: AuthUser | null;
  token: string | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [user, setUser] = useState<AuthUser | null>(authService.getUser());

  const setSession = (t: string, u: AuthUser) => {
    setToken(t);
    setUser(u);
  };

  const clearSession = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, setSession, clearSession }), [user, token]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
