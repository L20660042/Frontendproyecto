import { api } from "../api/client";

export type AppRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "SERVICIOS_ESCOLARES"
  | "DOCENTE"
  | "ALUMNO"
  | "JEFE"
  | "SUBDIRECCION"
  | "DESARROLLO_ACADEMICO";

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;    
  roles: AppRole[]; 
};

const VALID_ROLES: AppRole[] = [
  "SUPERADMIN",
  "ADMIN",
  "SERVICIOS_ESCOLARES",
  "DOCENTE",
  "ALUMNO",
  "JEFE",
  "SUBDIRECCION",
  "DESARROLLO_ACADEMICO",
];

const VALID_SET = new Set<string>(VALID_ROLES);

function isAppRole(v: string): v is AppRole {
  return VALID_SET.has(v);
}

function normalizeRoles(raw: unknown): AppRole[] {
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const out: AppRole[] = [];

  for (const r of arr) {
    const up = String(r ?? "").trim().toUpperCase();
    if (isAppRole(up)) out.push(up);
  }

  return Array.from(new Set(out));
}

function pickPrimaryRole(roles: AppRole[]): AppRole {

  const priority: AppRole[] = [
    "SUPERADMIN",
    "ADMIN",
    "SERVICIOS_ESCOLARES",
    "SUBDIRECCION",
    "JEFE",
    "DESARROLLO_ACADEMICO",
    "DOCENTE",
    "ALUMNO",
  ];

  return priority.find((p) => roles.includes(p)) ?? roles[0] ?? "ADMIN";
}

const authService = {
  async login(payload: { email: string; password: string }) {
    const res = await api.post("/auth/login", payload);

    const token: string | undefined = res.data?.access_token;
    const rawUser = res.data?.user;

    if (!token || !rawUser) {
      throw new Error("Respuesta inválida del servidor (sin token o user).");
    }
    const roles = normalizeRoles(rawUser.roles ?? rawUser.role);
    const user: AuthUser = {
      id: rawUser.id ?? rawUser._id,
      email: rawUser.email,
      roles,
      role: pickPrimaryRole(roles),
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { token, user };
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },
};

export default authService;
