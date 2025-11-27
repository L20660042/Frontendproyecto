import api from './api';

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  hoursPerWeek?: number;
  type: string;
  area?: string;
  assignedTeacher?: any;
  availableTeachers: any[];
  isActive: boolean;
  institution: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  description?: string;
  credits: number;
  hoursPerWeek?: number;
  type?: string;
  area?: string;
  assignedTeacher?: string;
  availableTeachers?: string[];
}

class SubjectService {
  async getMySubjects(): Promise<Subject[]> {
    const response = await api.get('/subjects/my-subjects');
    return response.data;
  }

  async getAllSubjects(): Promise<Subject[]> {
    const response = await api.get('/subjects');
    return response.data;
  }

  async getSubjectById(id: string): Promise<Subject> {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  }

  async createSubject(data: CreateSubjectData): Promise<Subject> {
    const response = await api.post('/subjects', data);
    return response.data;
  }

  async updateSubject(id: string, data: Partial<CreateSubjectData>): Promise<Subject> {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  }

  async assignTeacher(subjectId: string, teacherId: string): Promise<Subject> {
    const response = await api.post(`/subjects/${subjectId}/assign-teacher`, { teacherId });
    return response.data;
  }

  async addAvailableTeachers(subjectId: string, teacherIds: string[]): Promise<Subject> {
    const response = await api.post(`/subjects/${subjectId}/available-teachers`, { teacherIds });
    return response.data;
  }

  async removeTeacherFromSubject(subjectId: string, teacherId: string): Promise<Subject> {
    const response = await api.delete(`/subjects/${subjectId}/teachers/${teacherId}`);
    return response.data;
  }
}

export const subjectService = new SubjectService();

// Exportar tipos individualmente
export type SubjectType = Subject;
export type CreateSubjectDataType = CreateSubjectData;