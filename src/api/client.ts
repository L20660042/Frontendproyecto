import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: false,
});

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken")
  );
}

api.interceptors.request.use((config) => {
  const token = getToken();

  config.headers = config.headers ?? {};

  if (token) {
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  }

  // LOG TEMPORAL (quítalo después)
  console.log("[API]", config.method?.toUpperCase(), config.url, "Auth?", !!(config.headers as any)["Authorization"]);

  return config;
});

