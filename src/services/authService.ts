import { api } from "../api/client";

export type AppRole =
  | "superadmin"
  | "admin"
  | "docente"
  | "estudiante"
  | "jefe_departamento"
  | "tutor"
  | "control_escolar"
  | "capacitacion";

export type AuthUser = {
  id: string;
  email: string;
  role: AppRole;
  roles?: string[]; // opcional: roles originales del backend
};

function mapBackendRolesToAppRole(roles?: string[]): AppRole {
  const r = (roles?.[0] || "").toUpperCase();

  const map: Record<string, AppRole> = {
    SUPERADMIN: "superadmin",
    ADMIN: "admin",
    DOCENTE: "docente",
    ALUMNO: "estudiante",
    JEFE: "jefe_departamento",
    SUBDIRECCION: "admin",
    SERVICIOS_ESCOLARES: "control_escolar",
    DESARROLLO_ACADEMICO: "capacitacion",
  };

  return map[r] ?? "admin";
}

const authService = {
  async login(payload: { email: string; password: string }) {
    const res = await api.post("/auth/login", payload);

    const token: string | undefined = res.data?.access_token;
    const rawUser = res.data?.user;

    if (!token || !rawUser) {
      throw new Error("Respuesta inválida del servidor (sin token o user).");
    }

    const user: AuthUser = {
      id: rawUser.id ?? rawUser._id,
      email: rawUser.email,
      role: rawUser.role ?? mapBackendRolesToAppRole(rawUser.roles),
      roles: rawUser.roles ?? [],
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
