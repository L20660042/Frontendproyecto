import { API_CONFIG } from '../config/api';
import { authService } from './authService';

interface StudentRiskData {
  grades: number[];
  attendance: number[];
  tutoring_sessions: number;
  evaluation_scores: number[];
  student_id?: string;
}

interface FeedbackData {
  text: string;
  context?: string;
  student_id?: string;
  teacher_id?: string;
}

class AnalyticsService {
  private baseUrl = API_CONFIG.BASE_URL;

  private getAuthHeaders() {
    const token = authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async analyzeStudentRisk(data: StudentRiskData): Promise<any> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.STUDENT_RISK}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en análisis de riesgo');
    }

    return response.json();
  }

  async analyzeFeedbackSentiment(data: FeedbackData): Promise<any> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.FEEDBACK_SENTIMENT}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en análisis de sentimiento');
    }

    return response.json();
  }

  async checkServiceHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.HEALTH}`);

    if (!response.ok) {
      throw new Error('Servicio de análisis no disponible');
    }

    return response.json();
  }
}

export const analyticsService = new AnalyticsService();