import axios from "axios";

export const api = axios.create({
  baseURL: "https://mi-backendnew-production.up.railway.app",
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

  const url = config.url ?? "";
  const isPublicAuth =
    url.includes("/auth/login") ||
    url.includes("/auth/register-student");

  config.headers = config.headers ?? {};

  if (token && !isPublicAuth) {
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
  } else {
    delete (config.headers as any)["Authorization"];
  }

  console.log(
    "[API]",
    config.method?.toUpperCase(),
    config.url,
    "Auth?",
    !!(config.headers as any)["Authorization"]
  );

  return config;
});
