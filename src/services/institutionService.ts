import { API_CONFIG } from '../config/api';
import { authService } from './authService';

interface CreateInstitutionData {
  name: string;
  address?: string;
  phone?: string;
}


class InstitutionService {
  private baseUrl = API_CONFIG.BASE_URL;

  private getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createInstitution(data: CreateInstitutionData): Promise<any> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.INSTITUTIONS.CREATE}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear institución');
    }

    return response.json();
  }

  async getMyInstitution(): Promise<any> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.INSTITUTIONS.MY_INSTITUTION}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener institución');
    }

    return response.json();
  }

  async addTeacher(institutionId: string, teacherEmail: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.INSTITUTIONS.ADD_TEACHER.replace(':id', institutionId)}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ teacherEmail }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al agregar docente');
    }

    return response.json();
  }

  async requestToJoin(institutionId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.INSTITUTIONS.JOIN_REQUEST.replace(':id', institutionId)}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al enviar solicitud');
    }

    return response.json();
  }

  async getInstitutionDetails(institutionId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.INSTITUTIONS.DETAILS.replace(':id', institutionId)}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener detalles');
    }

    return response.json();
  }
}

export const institutionService = new InstitutionService();