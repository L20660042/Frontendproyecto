import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || "https://mi-backendnew-production.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

export interface LoginRequest {
  email: string;
  password: string;
}

interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  roles?: string[]; // lo que pongas en el payload del backend
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;     // rol principal (el que usas en el switch del Login)
  roles: string[];  // todos los roles
}

async function login({ email, password }: LoginRequest): Promise<{ token: string; user: User }> {
  // IMPORTANTE: si tu backend espera "username", le mandamos el correo en ese campo
  const response = await api.post("/auth/login", {
    username: email,
    password,
  });

  const token: string = response.data.access_token || response.data.token;

  if (!token) {
    throw new Error("La respuesta del backend no contiene un token");
  }

  // Decodificamos el JWT para sacar los roles
  const payload = jwtDecode<JwtPayload>(token);
  const rolesFromToken = payload.roles ?? [];

  // Normalizamos a minúsculas para que coincida con tu switch
  const normalizedRoles = rolesFromToken.map((r) => r.toLowerCase());

  const mainRole =
    normalizedRoles[0] ||
    "estudiante"; // rol por defecto si no viene nada

  const user: User = {
    id: payload.sub,
    username: payload.username || email,
    email: payload.email || email,
    role: mainRole,     // aquí será "superadmin", "admin", "docente", etc.
    roles: normalizedRoles,
  };

  // Guardar token/usuario (tu LoginPage asume que ya está todo guardado)
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return { token, user };
}

export const authService = {
  login,
};
