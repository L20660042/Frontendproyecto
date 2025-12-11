import axios from 'axios';

const API_URL = "https://mi-backendnew-production.up.railway.app";

// Obtener calificaciones por ID de estudiante
export const obtenerCalificacionesPorEstudiante = async (estudianteId: string) => {
  try {
    const response = await axios.get(`${API_URL}/calificaciones/${estudianteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las calificaciones:', error);
    throw error;
  }
};