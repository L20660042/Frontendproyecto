import axios from 'axios';

// Usar la URL de tu backend en Railway
const API_BASE_URL = 'https://backend-proy-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentar timeout para Railway
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/';
    }
    
    // Manejar errores específicos de Railway
    if (error.code === 'ECONNABORTED') {
      throw new Error('El servidor está tardando en responder. Por favor intenta nuevamente.');
    }
    
    if (!error.response) {
      throw new Error('Error de conexión. Verifica tu internet o intenta más tarde.');
    }
    
    throw error;
  }
);

export default api;