import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string;
}

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  institution?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/users/login', loginData);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  }

  async register(registerData: RegisterData): Promise<any> {
    try {
      // Transformar los datos para que coincidan con el schema del backend
      const backendData = {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        user_type: registerData.userType // ← Cambiar userType a user_type
      };

      console.log('Enviando datos de registro al backend:', backendData);
      
      const response = await api.post('/users/register', backendData);
      console.log('Register response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Profile error:', error.response?.data || error.message);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    console.log('Usuario cerró sesión');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        // Asegurarse de que userType esté disponible (por si el backend devuelve user_type)
        if (user.user_type && !user.userType) {
          user.userType = user.user_type;
        }
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
}

export const authService = new AuthService();

// Exportar tipos individualmente
export type LoginDataType = LoginData;
export type RegisterDataType = RegisterData;
export type UserType = User;
export type AuthResponseType = AuthResponse;