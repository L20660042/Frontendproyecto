// src/services/calificacionesService.ts
import axios from 'axios';


// Obtener calificaciones por ID de estudiante
export const obtenerCalificacionesPorEstudiante = async (estudianteId: string) => {
  try {
    // Puedes usar esta línea, aprovechando baseURL:
    const response = await axios.get(`/calificaciones/${estudianteId}`);
    // O si prefieres explícito:
    // const response = await axios.get(`${API_URL}/calificaciones/${estudianteId}`);

    const raw = response.data;

    // Distintos formatos posibles

    // Caso 1: el backend regresa directamente un array
    if (Array.isArray(raw)) {
      return raw;
    }

    // Caso 2: { data: [...] }
    if (Array.isArray(raw?.data)) {
      return raw.data;
    }

    // Caso 3: { success: true, data: [...] }
    if (raw?.success && Array.isArray(raw.data)) {
      return raw.data;
    }

    // Caso 4: { success: true, data: { data: [...] } }
    if (raw?.success && Array.isArray(raw?.data?.data)) {
      return raw.data.data;
    }

    console.warn('⚠️ Estructura inesperada en respuesta de calificaciones:', raw);
    return [];
  } catch (error) {
    console.error('❌ Error al obtener las calificaciones:', error);
    throw error;
  }
};
