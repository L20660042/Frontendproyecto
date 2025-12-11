import axios from 'axios';
import { authService } from './authService';

export interface StudentRiskResponse {
  estudianteId?: string;
  risk_level: string;
  confidence: number;
  risk_factors: string[];
  recommendations: string[];
}

export interface CreateTutoriaPayload {
  tutor: string;        // ID del tutor
  group: string;        // ID del grupo
  date: string;         // ISO string o 'YYYY-MM-DDTHH:mm'
  topic: string;        // Tema de la tutoría
  observations?: string;
}

export interface Tutoria {
  _id: string;
  tutor?: any;
  student?: any;
  group?: any;
  date?: string;
  topic?: string;
  observations?: string;
  status?: string;
}

export const studentService = {
  // Riesgo académico + recomendaciones (ML) vía backend
  getRiskAndRecommendations: async (
    studentId: string
  ): Promise<StudentRiskResponse> => {
    const response = await axios.get(`/calificaciones/${studentId}/riesgo`);
    return response.data;
  },

  // Tutorías del estudiante
  getTutorias: async (studentId: string): Promise<Tutoria[]> => {
    const response = await axios.get(`/tutoria/student/${studentId}`);
    return response.data;
  },

  // Crear tutoría como estudiante (POST /tutoria)
  createTutoriaAsStudent: async (
    data: CreateTutoriaPayload
  ): Promise<Tutoria> => {
    const currentUser = authService.getCurrentUser();

    if (!currentUser?._id) {
      throw new Error('No hay usuario autenticado.');
    }

    const payload = {
      ...data,
      student: currentUser._id, // el backend espera este campo en CreateTutoriaDto
    };

    const response = await axios.post('/tutoria', payload);
    return response.data;
  },
};
