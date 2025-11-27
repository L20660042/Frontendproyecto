import api from './api';

export interface Group {
  _id: string;
  name: string;
  code: string;
  grade?: string;
  level?: string;
  semester?: string;
  shift?: string;
  capacity?: number;
  students: any[];
  teachers: any[];
  tutor?: any;
  headTeacher?: any;
  assignedSubjects: Array<{
    subject: any;
    teacher: any;
    schedule?: string;
  }>;
  isActive: boolean;
  institution: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateGroupData {
  name: string;
  code: string;
  grade?: string;
  level?: string;
  semester?: string;
  shift?: string;
  capacity?: number;
  tutor?: string;
  headTeacher?: string;
  students?: string[];
  teachers?: string[];
}

class GroupService {
  async getMyGroups(): Promise<Group[]> {
    const response = await api.get('/groups/my-groups');
    return response.data;
  }

  async getAllGroups(): Promise<Group[]> {
    const response = await api.get('/groups');
    return response.data;
  }

  async getGroupById(id: string): Promise<Group> {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    const response = await api.post('/groups', data);
    return response.data;
  }

  async updateGroup(id: string, data: Partial<CreateGroupData>): Promise<Group> {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  }

  async deleteGroup(id: string): Promise<void> {
    await api.delete(`/groups/${id}`);
  }

  async assignStudent(groupId: string, studentId: string): Promise<Group> {
    const response = await api.post(`/groups/${groupId}/students`, { studentId });
    return response.data;
  }

  async assignStudentsBulk(groupId: string, studentIds: string[]): Promise<Group> {
    const response = await api.post(`/groups/${groupId}/students/bulk`, { studentIds });
    return response.data;
  }

  async removeStudent(groupId: string, studentId: string): Promise<Group> {
    const response = await api.delete(`/groups/${groupId}/students/${studentId}`);
    return response.data;
  }

  async assignSubject(groupId: string, subjectId: string, teacherId: string, schedule?: string): Promise<Group> {
    const response = await api.post(`/groups/${groupId}/subjects`, { 
      subjectId, 
      teacherId, 
      schedule 
    });
    return response.data;
  }
}

export const groupService = new GroupService();

// Exportar tipos individualmente
export type GroupType = Group;
export type CreateGroupDataType = CreateGroupData;