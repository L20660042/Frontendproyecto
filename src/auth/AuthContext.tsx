import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = {
  id?: string;
  _id?: string;
  role: string;
  email?: string;
  [key: string]: any;
};

type SetSessionOptions = { remember?: boolean };

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  setSession: (token: string, user: AuthUser, rememberOrOptions?: boolean | SetSessionOptions) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const KEY_TOKEN = "mc_token";
const KEY_USER = "mc_user";
const KEY_STORAGE = "mc_storage"; 

function readFrom(storage: Storage) {
  const token = storage.getItem(KEY_TOKEN);
  const userRaw = storage.getItem(KEY_USER);
  const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
  return { token, user };
}

function writeTo(storage: Storage, token: string, user: AuthUser) {
  storage.setItem(KEY_TOKEN, token);
  storage.setItem(KEY_USER, JSON.stringify(user));
}

function clearFrom(storage: Storage) {
  storage.removeItem(KEY_TOKEN);
  storage.removeItem(KEY_USER);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const preferred = localStorage.getItem(KEY_STORAGE);

    let restored: { token: string | null; user: AuthUser | null } | null = null;

    if (preferred === "local") restored = readFrom(localStorage);
    if (preferred === "session") restored = readFrom(sessionStorage);

    if (!restored || (!restored.token && !restored.user)) {
      const local = readFrom(localStorage);
      const session = readFrom(sessionStorage);

      restored = local.token ? local : session;
    }

    setToken(restored.token || null);
    setUser(restored.user || null);
    setReady(true);
  }, []);

  const setSession: AuthContextType["setSession"] = (newToken, newUser, rememberOrOptions) => {
    const remember =
      typeof rememberOrOptions === "boolean"
        ? rememberOrOptions
        : Boolean(rememberOrOptions?.remember);

    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;

    writeTo(target, newToken, newUser);
    clearFrom(other);

    localStorage.setItem(KEY_STORAGE, remember ? "local" : "session");

    setToken(newToken);
    setUser(newUser);
  };

  const clearSession = () => {
    clearFrom(localStorage);
    clearFrom(sessionStorage);
    localStorage.removeItem(KEY_STORAGE);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, ready, setSession, clearSession }),
    [token, user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
