import axios from "axios";

const API_URL = "https://mi-backendnew-production.up.railway.app"; // Ajusta si tu backend está en otro puerto

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  getProfile: async (token: string) => {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }
};
