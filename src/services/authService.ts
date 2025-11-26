import { apiService } from './api';
import { API_CONFIG } from '../config/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    permissions: string[];
  };
}

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, loginData);
    this.setToken(response.token);
    return response;
  }

  async register(registerData: RegisterData): Promise<any> {
    return apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, registerData);
  }

  async getProfile(): Promise<any> {
    return apiService.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return apiService.put(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }

  // Gestión del token
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();