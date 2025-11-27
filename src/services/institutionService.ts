import api from './api';

export interface Institution {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdBy: string;
  academicStaff: string[];
  teachers: string[];
  students: string[];
  joinRequests: Array<{
    teacherId: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
  }>;
  isActive: boolean;
  createdAt: string;
}

export interface CreateInstitutionData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

class InstitutionService {
  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    const response = await api.post('/institutions', data);
    return response.data;
  }

  async getMyInstitution(): Promise<Institution> {
    const response = await api.get('/institutions/my-institution');
    return response.data;
  }

  async getInstitutionById(id: string): Promise<Institution> {
    const response = await api.get(`/institutions/${id}`);
    return response.data;
  }

  async requestToJoin(institutionId: string): Promise<any> {
    const response = await api.post(`/institutions/${institutionId}/join-request`);
    return response.data;
  }

  async addTeacher(institutionId: string, teacherEmail: string): Promise<Institution> {
    const response = await api.post(`/institutions/${institutionId}/teachers`, { teacherEmail });
    return response.data;
  }

  async handleJoinRequest(institutionId: string, teacherId: string, status: 'approved' | 'rejected'): Promise<Institution> {
    const response = await api.put(`/institutions/${institutionId}/join-request/${teacherId}`, { status });
    return response.data;
  }

  async removeTeacher(institutionId: string, teacherId: string): Promise<Institution> {
    const response = await api.delete(`/institutions/${institutionId}/teachers/${teacherId}`);
    return response.data;
  }
}

export const institutionService = new InstitutionService();

// Exportar tipos individualmente
export type InstitutionType = Institution;
export type CreateInstitutionDataType = CreateInstitutionData;