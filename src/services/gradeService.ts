import api from './api';

export interface Grade {
  _id: string;
  student: any;
  subject: any;
  group: any;
  teacher: any;
  score: number;
  period: string;
  comments?: string;
  institution: string;
  gradedAt: string;
  isActive: boolean;
  lastModifiedBy?: any;
  lastModifiedAt?: string;
}

export interface CreateGradeData {
  student: string;
  subject: string;
  group: string;
  score: number;
  period: string;
  comments?: string;
}

export interface BulkGradeItem {
  student: string;
  subject: string;
  group: string;
  score: number;
}

export interface BulkGradesData {
  grades: BulkGradeItem[];
  group: string;
  subject: string;
  period: string;
}

class GradeService {
  async getMyGrades(): Promise<Grade[]> {
    const response = await api.get('/grades/my-grades');
    return response.data;
  }

  async getAllGrades(): Promise<Grade[]> {
    const response = await api.get('/grades');
    return response.data;
  }

  async getGradeById(id: string): Promise<Grade> {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  }

  async createGrade(data: CreateGradeData): Promise<Grade> {
    const response = await api.post('/grades', data);
    return response.data;
  }

  async updateGrade(id: string, data: Partial<CreateGradeData>): Promise<Grade> {
    const response = await api.put(`/grades/${id}`, data);
    return response.data;
  }

  async deleteGrade(id: string): Promise<void> {
    await api.delete(`/grades/${id}`);
  }

  async createBulkGrades(data: BulkGradesData): Promise<any> {
    const response = await api.post('/grades/bulk', data);
    return response.data;
  }

  async getStudentReport(studentId: string): Promise<any> {
    const response = await api.get(`/grades/student-report/${studentId}`);
    return response.data;
  }

  async getGroupReport(groupId: string, subjectId: string, period: string): Promise<any> {
    const response = await api.get(`/grades/group-report/${groupId}/${subjectId}/${period}`);
    return response.data;
  }
}

export const gradeService = new GradeService();

// Exportar tipos individualmente
export type GradeType = Grade;
export type CreateGradeDataType = CreateGradeData;
export type BulkGradeItemType = BulkGradeItem;
export type BulkGradesDataType = BulkGradesData;