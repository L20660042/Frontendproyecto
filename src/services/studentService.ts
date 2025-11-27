import api from './api';

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  institution?: string;
  studentId?: string;
  enrollmentGroup?: string;
  semester?: number;
  isActive: boolean;
}

export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId?: string;
  enrollmentGroup?: string;
  semester?: number;
}

class StudentService {
  async getAllStudents(): Promise<Student[]> {
    const response = await api.get('/users/students');
    return response.data;
  }

  async getStudentById(id: string): Promise<Student> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async createStudent(data: CreateStudentData): Promise<Student> {
    const response = await api.post('/users/register', {
      ...data,
      userType: 'estudiante'
    });
    return response.data;
  }

  async updateStudent(id: string, data: Partial<CreateStudentData>): Promise<Student> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async getStudentsByInstitution(institutionId: string): Promise<Student[]> {
    const response = await api.get(`/users/institution/${institutionId}/students`);
    return response.data;
  }

  async addStudentToInstitution(studentEmail: string): Promise<any> {
    const response = await api.post('/institutions/add-student', { studentEmail });
    return response.data;
  }
}

export const studentService = new StudentService();

// Exportar tipos individualmente
export type StudentType = Student;
export type CreateStudentDataType = CreateStudentData;