// authService.ts
import axios from "axios";

const API_URL = "https://mi-backendnew-production.up.railway.app";
// Para desarrollo local: "http://localhost:3000"

// Configurar axios por defecto
axios.defaults.baseURL = API_URL;

// Interceptor para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // Si es error 401 (Unauthorized), limpiar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Función para mapear roles de frontend a backend
const mapRoleToBackend = (frontendRole: string) => {
  return frontendRole;
};

export const authService = {
  // ========== AUTENTICACIÓN ==========
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post("/auth/login", credentials);
      if (response.data.access_token) {
        localStorage.setItem("authToken", response.data.access_token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await axios.get("/auth/profile");
      return response.data;
    } catch (error: any) {
      console.error("Get profile error:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  // ========== USUARIOS ==========
  getUsers: async () => {
    try {
      const response = await axios.get("/users");
      console.log("✅ Users response:", response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error("❌ Error getting users:", error.response?.data || error.message);
      throw error;
    }
  },

  createUser: async (userData: any) => {
    try {
      console.log("📤 Attempting to create user with data:", userData);
      
      const formatUserData = (data: any) => {
        return {
          email: data.email,
          password: data.password,
          fullName: data.fullName || `${data.firstName} ${data.lastName}`.trim(),
          firstName: data.firstName,
          lastName: data.lastName,
          role: mapRoleToBackend(data.role),
          active: data.active === undefined ? true : data.active,
          ...(data.institutionId && data.institutionId.trim() !== "" && { 
            institutionId: data.institutionId 
          })
        };
      };
      
      const formattedData = formatUserData(userData);
      console.log("📤 Sending to /users:", formattedData);
      
      const response = await axios.post("/users", formattedData);
      console.log("✅ Create user response:", response.data);
      return response.data;
      
    } catch (error: any) {
      console.error("❌ Error creating user:", error.response?.data || error.message);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: any) => {
    try {
      console.log("📤 Actualizando usuario:", userId, userData);
      
      // Preparar datos para enviar al backend
      const dataToSend = {
        ...userData,
        role: mapRoleToBackend(userData.role)
      };
      
      // Usar solo PATCH como especifica el backend
      const response = await axios.patch(`/users/${userId}`, dataToSend);
      console.log("✅ Usuario actualizado:", response.data);
      return response.data;
      
    } catch (error: any) {
      console.error("❌ Error al actualizar usuario:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al actualizar usuario';
      if (error.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const response = await axios.delete(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting user:", error.response?.data || error.message);
      throw error;
    }
  },

  toggleUserStatus: async (userId: string) => {
    try {
      const response = await axios.patch(`/users/${userId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error("Error toggling user:", error.response?.data || error.message);
      throw error;
    }
  },

  // ========== CARRERAS ==========
  getCareers: async () => {
    try {
      const response = await axios.get("/careers");
      console.log("✅ Careers response structure:", response.data);
      
      // Manejar diferentes estructuras de respuesta
      if (response.data.success && response.data.data) {
        const careersResponse = response.data.data;
        
        if (careersResponse.success && Array.isArray(careersResponse.data)) {
          return careersResponse.data;
        } else if (Array.isArray(careersResponse)) {
          return careersResponse;
        }
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn("⚠️ Estructura de respuesta inesperada:", response.data);
      return [];
    } catch (error: any) {
      console.error("Error getting careers:", error.response?.data || error.message);
      return [];
    }
  },

  createCareer: async (careerData: any) => {
    try {
      console.log("📤 Creando carrera:", careerData);
      
      // Asegurar que los datos tengan el formato correcto
      const formattedData = {
        name: careerData.name,
        code: careerData.code,
        duration: parseInt(careerData.duration) || 8,
        description: careerData.description || ''
        // NO enviar status, el backend usa active
      };
      
      console.log("📤 Enviando al backend:", formattedData);
      
      const response = await axios.post("/careers", formattedData);
      console.log("✅ Respuesta del backend:", response.data);
      
      // Manejar la estructura anidada del backend
      if (response.data.success && response.data.data) {
        // Si la respuesta tiene data anidada (data.data)
        const careerResponse = response.data.data;
        
        // Verificar si es un objeto con success (respuesta anidada)
        if (careerResponse.success && careerResponse.data) {
          return {
            success: true,
            data: careerResponse.data,
            message: careerResponse.message || 'Carrera creada exitosamente'
          };
        } else if (careerResponse._id) {
          // Si solo devuelve el objeto de carrera
          return {
            success: true,
            data: careerResponse,
            message: 'Carrera creada exitosamente'
          };
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Error creating career:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        dataSent: careerData
      });
      
      let errorMessage = 'Error al crear carrera';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos inválidos o incompletos';
      } else if (error.response?.status === 409) {
        errorMessage = 'El código de carrera ya existe';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  updateCareer: async (careerId: string, careerData: any) => {
    try {
      console.log("📤 Actualizando carrera:", careerId, careerData);
      
      // Preparar datos para el backend
      const dataToSend = {
        name: careerData.name,
        code: careerData.code,
        description: careerData.description || '',
        duration: careerData.duration,
        // Convertir status a active para el backend
        active: careerData.status === 'active'
      };
      
      console.log("📤 Enviando al backend:", dataToSend);
      
      const response = await axios.patch(`/careers/${careerId}`, dataToSend);
      console.log("✅ Respuesta del backend:", response.data);
      
      // Manejar la estructura anidada
      if (response.data.success && response.data.data) {
        const updateResponse = response.data.data;
        
        if (updateResponse.success && updateResponse.data) {
          return {
            success: true,
            data: updateResponse.data,
            message: updateResponse.message || 'Carrera actualizada exitosamente'
          };
        } else if (updateResponse._id) {
          return {
            success: true,
            data: updateResponse,
            message: 'Carrera actualizada exitosamente'
          };
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Error actualizando carrera:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al actualizar carrera';
      if (error.response?.status === 404) {
        errorMessage = 'Carrera no encontrada';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos inválidos';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  deleteCareer: async (careerId: string) => {
    try {
      const response = await axios.delete(`/careers/${careerId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting career:", error.response?.data || error.message);
      throw error;
    }
  },
  
  toggleCareerStatus: async (careerId: string) => {
    try {
      const response = await axios.patch(`/careers/${careerId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error("Error toggling career:", error.response?.data || error.message);
      throw error;
    }
  },

  // ========== MATERIAS (SUBJECTS) - CORREGIDO ==========
  getSubjects: async () => {
    try {
      const response = await axios.get("/subjects");
      console.log("✅ Subjects response structure:", response.data);
      
      // Manejar diferentes estructuras de respuesta
      if (response.data.success && response.data.data) {
        const subjectsResponse = response.data.data;
        
        if (subjectsResponse.success && Array.isArray(subjectsResponse.data)) {
          return subjectsResponse.data;
        } else if (Array.isArray(subjectsResponse)) {
          return subjectsResponse;
        }
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn("⚠️ Estructura de respuesta inesperada para subjects:", response.data);
      return [];
    } catch (error: any) {
      console.error("Error getting subjects:", error.response?.data || error.message);
      return [];
    }
  },

  createSubject: async (subjectData: any) => {
    try {
      console.log('📤 Creando materia:', subjectData);
      
      // Mapear datos del frontend al formato del backend
      const dataToSend = {
        name: subjectData.name,
        code: subjectData.code,
        career: subjectData.careerId, // Enviar como string
        credits: subjectData.credits || 4,
        semester: subjectData.semester || 1,
        // NO enviar status, el backend usa active
        // El backend manejará la conversión internamente
      };
      
      console.log('📤 Enviando al backend:', dataToSend);
      const response = await axios.post("/subjects", dataToSend);
      console.log("✅ Respuesta del backend:", response.data);
      
      // Manejar estructura anidada como en careers
      if (response.data.success && response.data.data) {
        const subjectResponse = response.data.data;
        
        if (subjectResponse.success && subjectResponse.data) {
          return {
            success: true,
            data: subjectResponse.data,
            message: subjectResponse.message || 'Materia creada exitosamente'
          };
        } else if (subjectResponse._id) {
          return {
            success: true,
            data: subjectResponse,
            message: 'Materia creada exitosamente'
          };
        }
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error("❌ Error creando materia:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        dataSent: subjectData
      });
      
      let errorMessage = 'Error al crear materia';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 409) {
        errorMessage = 'El código de materia ya existe';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  updateSubject: async (subjectId: string, subjectData: any) => {
    try {
      console.log("📤 Actualizando materia:", subjectId, subjectData);
      
      // Mapear datos del frontend al formato del backend
      const dataToSend = {
        name: subjectData.name,
        code: subjectData.code,
        career: subjectData.careerId, // IMPORTANTE: Enviar como string
        credits: subjectData.credits || 4,
        semester: subjectData.semester || 1,
        // Convertir status a active para el backend
        active: subjectData.status === 'active'
      };
      
      console.log('📤 Enviando al backend:', dataToSend);
      const response = await axios.patch(`/subjects/${subjectId}`, dataToSend);
      console.log("✅ Respuesta del backend:", response.data);
      
      // Manejar estructura anidada
      if (response.data.success && response.data.data) {
        const updateResponse = response.data.data;
        
        if (updateResponse.success && updateResponse.data) {
          return {
            success: true,
            data: updateResponse.data,
            message: updateResponse.message || 'Materia actualizada exitosamente'
          };
        } else if (updateResponse._id) {
          return {
            success: true,
            data: updateResponse,
            message: 'Materia actualizada exitosamente'
          };
        }
      }
      
      return response.data;
      
    } catch (error: any) {
      console.error("❌ Error actualizando materia:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Error al actualizar materia';
      if (error.response?.status === 404) {
        errorMessage = 'Materia no encontrada';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos inválidos';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  deleteSubject: async (subjectId: string) => {
    try {
      const response = await axios.delete(`/subjects/${subjectId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting subject:", error.response?.data || error.message);
      throw error;
    }
  },

  toggleSubjectStatus: async (subjectId: string) => {
    try {
      const response = await axios.patch(`/subjects/${subjectId}/toggle`);
      return response.data;
    } catch (error: any) {
      console.error("Error toggling subject:", error.response?.data || error.message);
      throw error;
    }
  },

  getSubjectById: async (subjectId: string) => {
    try {
      const response = await axios.get(`/subjects/${subjectId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting subject:", error.response?.data || error.message);
      throw error;
    }
  },

  getSubjectsByCareer: async (careerId: string) => {
    try {
      const response = await axios.get(`/careers/${careerId}/subjects`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting career subjects:", error.response?.data || error.message);
      return [];
    }
  },

// ========== GRUPOS ==========
getGroups: async () => {
  try {
    const response = await axios.get("/groups");
    console.log("✅ Groups response:", response.data);
    
    // Manejar diferentes estructuras de respuesta
    if (response.data.success && Array.isArray(response.data.data)) {
      return { success: true, data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    } else if (response.data._id) {
      // Si es un solo objeto
      return { success: true, data: [response.data] };
    }
    return { success: true, data: [] };
  } catch (error: any) {
    console.error("Error getting groups:", error.response?.data || error.message);
    return { success: false, data: [], message: error.message };
  }
},

createGroup: async (groupData: any) => {
  try {
    console.log("📤 Creando grupo:", groupData);
    
    // Formatear datos para el backend - CORREGIDO
    const formattedData = {
      name: groupData.name,
      code: groupData.code,
      career: groupData.careerId || undefined, // Mapear careerId -> career
      subject: groupData.subjectId,
      teacher: groupData.teacherId || undefined,
      schedule: groupData.schedule || '',
      capacity: parseInt(groupData.capacity) || 30,
      active: groupData.status === 'active' // Mapear status -> active
    };
    
    console.log("📤 Enviando al backend:", formattedData);
    const response = await axios.post("/groups", formattedData);
    console.log("✅ Grupo creado:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating group:", error.response?.data || error.message);
    throw error;
  }
},

updateGroup: async (groupId: string, groupData: any) => {
  try {
    console.log("📤 Actualizando grupo:", groupId, groupData);
    
    // Formatear datos para el backend - CORREGIDO
    const formattedData = {
      name: groupData.name,
      code: groupData.code,
      career: groupData.careerId || undefined, // Mapear careerId -> career
      subject: groupData.subjectId,
      teacher: groupData.teacherId || undefined,
      schedule: groupData.schedule || '',
      capacity: parseInt(groupData.capacity) || 30,
      active: groupData.status === 'active' // Mapear status -> active
    };
    
    console.log("📤 Enviando al backend:", formattedData);
    const response = await axios.patch(`/groups/${groupId}`, formattedData);
    console.log("✅ Grupo actualizado:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error actualizando grupo:", error.response?.data || error.message);
    throw error;
  }
},

deleteGroup: async (groupId: string) => {
  try {
    const response = await axios.delete(`/groups/${groupId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting group:", error.response?.data || error.message);
    throw error;
  }
},

toggleGroupStatus: async (groupId: string) => {
  try {
    const response = await axios.patch(`/groups/${groupId}/toggle`);
    return response.data;
  } catch (error: any) {
    console.error("Error toggling group status:", error.response?.data || error.message);
    throw error;
  }
},

 // ========== TUTORÍAS ==========
getTutorias: async () => {
  try {
    const response = await axios.get("/tutoria");
    console.log("✅ Tutorias response:", response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return { success: true, data: response.data.data };
    } else if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    return { success: true, data: [] };
  } catch (error: any) {
    console.error("Error getting tutorias:", error.response?.data || error.message);
    return { success: false, data: [], message: error.message };
  }
},

createTutoria: async (tutoriaData: any) => {
  try {
    console.log("📤 Creando tutoría:", tutoriaData);
    
    const formattedData = {
      tutor: tutoriaData.tutorId,
      student: tutoriaData.studentId,
      group: tutoriaData.groupId,
      date: tutoriaData.date,
      topics: tutoriaData.topics || '',
      agreements: tutoriaData.agreements || '',
      observations: tutoriaData.observations || '',
      riskDetected: tutoriaData.riskDetected || false
    };
    
    console.log("📤 Enviando al backend:", formattedData);
    const response = await axios.post("/tutoria", formattedData);
    console.log("✅ Tutoría creada:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error creating tutoria:", error.response?.data || error.message);
    throw error;
  }
},

updateTutoria: async (tutoriaId: string, tutoriaData: any) => {
  try {
    console.log("📤 Actualizando tutoría:", tutoriaId, tutoriaData);
    
    const formattedData = {
      tutor: tutoriaData.tutorId,
      student: tutoriaData.studentId,
      group: tutoriaData.groupId,
      date: tutoriaData.date,
      topics: tutoriaData.topics || '',
      agreements: tutoriaData.agreements || '',
      observations: tutoriaData.observations || '',
      riskDetected: tutoriaData.riskDetected || false
    };
    
    console.log("📤 Enviando al backend:", formattedData);
    const response = await axios.patch(`/tutoria/${tutoriaId}`, formattedData);
    console.log("✅ Tutoría actualizada:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error actualizando tutoría:", error.response?.data || error.message);
    throw error;
  }
},

deleteTutoria: async (tutoriaId: string) => {
  try {
    const response = await axios.delete(`/tutoria/${tutoriaId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting tutoria:", error.response?.data || error.message);
    throw error;
  }
},

  // ========== CAPACITACIONES ==========
  getCapacitaciones: async () => {
    try {
      const response = await axios.get("/capacitacion");
      return response.data;
    } catch (error: any) {
      console.error("Error getting capacitaciones:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  createCapacitacion: async (capacitacionData: any) => {
    try {
      const response = await axios.post("/capacitacion", capacitacionData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating capacitacion:", error.response?.data || error.message);
      throw error;
    }
  },

  // ========== ALERTAS ==========
  getAlerts: async () => {
    try {
      const response = await axios.get("/alerts");
      return response.data;
    } catch (error: any) {
      console.error("Error getting alerts:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  createAlert: async (alertData: any) => {
    try {
      const response = await axios.post("/alerts", alertData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating alert:", error.response?.data || error.message);
      throw error;
    }
  },


// ========== REPORTES ==========

getReports: async (filters?: any) => {
  try {
    console.log('📊 Solicitando reportes con filtros:', filters);
    
    const response = await axios.get("/reports/list", {
      params: {
        ...filters,
        page: filters?.page || 1,
        limit: filters?.limit || 100
      }
    });
    
    console.log("✅ Reports list response FULL:", response.data);
    
    // VERIFICAR LA ESTRUCTURA ANIDADA
    if (response.data && response.data.success === true) {
      // CASO 1: Estructura {success, data: {data: [...], pagination: {...}}}
      if (response.data.data && response.data.data.data) {
        console.log(`📊 Reportes encontrados en data.data:`, response.data.data.data.length);
        return {
          success: true,
          data: response.data.data.data,  // <-- ¡ESTA ES LA CLAVE!
          pagination: response.data.data.pagination,
          count: response.data.data.data.length
        };
      }
      // CASO 2: Estructura directa {success, data: [...], pagination: {...}}
      else if (Array.isArray(response.data.data)) {
        console.log(`📊 Reportes encontrados en data:`, response.data.data.length);
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
          count: response.data.data.length
        };
      }
      // CASO 3: La respuesta ES directamente un array
      else if (Array.isArray(response.data)) {
        console.log(`📊 Reportes como array directo:`, response.data.length);
        return {
          success: true,
          data: response.data,
          count: response.data.length
        };
      }
    }
    
    console.warn("⚠️ No se encontró array de reportes:", response.data);
    return { 
      success: false, 
      data: [], 
      message: "No se encontraron reportes",
      rawResponse: response.data
    };
    
  } catch (error: any) {
    console.error("❌ Error getting reports:", error);
    return { 
      success: false, 
      data: [], 
      message: error.message
    };
  }
},

generateReport: async (reportData: any) => {
  try {
    console.log("📤 Generando reporte:", reportData);
    
    const response = await axios.post("/reports/generate", reportData);
    console.log("✅ Reporte generado:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error generating report:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
},

getReportHistory: async (page = 1, limit = 50) => {
  try {
    const response = await axios.get("/reports/history", {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    console.error("Error getting report history:", error.response?.data || error.message);
    throw error;
  }
},

getSystemStats: async () => {
  try {
    const response = await axios.get("/reports/stats");
    return response.data;
  } catch (error: any) {
    console.error("Error getting system stats:", error.response?.data || error.message);
    throw error;
  }
},

downloadReport: async (reportId: string, format: string = 'json') => {
  try {
    console.log(`📥 Descargando reporte ${reportId} en formato ${format}`);
    
    const response = await axios.get(`/reports/export/${reportId}`, {
      params: { format },
      responseType: 'blob'
    });
    
    // Crear nombre de archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte-${reportId.substring(0, 8)}-${timestamp}.${format}`;
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Reporte descargado:', filename);
    return true;
  } catch (error: any) {
    console.error("❌ Error downloading report:", error.response?.data || error.message);
    throw error;
  }
},

getReportById: async (reportId: string) => {
  try {
    const response = await axios.get(`/reports/${reportId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error getting report by ID:", error.response?.data || error.message);
    throw error;
  }
},

deleteReport: async (reportId: string) => {
  try {
    console.log('🗑️ Eliminando reporte:', reportId);
    const response = await axios.delete(`/reports/${reportId}`);
    console.log('✅ Reporte eliminado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error deleting report:", error.response?.data || error.message);
    throw error;
  }
},

// ========== DEBUG: VER TODOS LOS REPORTES ==========
debugGetAllReports: async () => {
  try {
    const response = await axios.get("/reports/debug/all");
    console.log('🔍 Debug - Todos los reportes:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error debug reports:", error.response?.data || error.message);
    
    // Si el endpoint debug no existe, intentar con list
    try {
      console.log('🔄 Intentando endpoint /reports/list...');
      const listResponse = await axios.get("/reports/list");
      return {
        success: true,
        message: "Usando endpoint /reports/list",
        data: listResponse.data
      };
    } catch (listError: any) {
      throw new Error(`Debug no disponible: ${error.message}`);
    }
  }
},

  // ========== RELACIONES ==========
  getCareerSubjects: async (careerId: string) => {
    try {
      const response = await axios.get(`/careers/${careerId}/subjects`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting career subjects:", error.response?.data || error.message);
      return [];
    }
  },

  getSubjectGroups: async (subjectId: string) => {
    try {
      const response = await axios.get(`/subjects/${subjectId}/groups`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting subject groups:", error.response?.data || error.message);
      return [];
    }
  },

  getGroupStudents: async (groupId: string) => {
    try {
      const response = await axios.get(`/groups/${groupId}/students`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting group students:", error.response?.data || error.message);
      return [];
    }
  },

  // ========== UTILIDADES ==========
  checkConnection: async () => {
    try {
      await axios.get("/");
      return true;
    } catch (error) {
      console.error("❌ No se pudo conectar al servidor:", error);
      return false;
    }
  },

  // ========== EXPORTACIÓN ==========
  exportData: async (type: 'careers' | 'subjects' | 'users', format: 'csv' | 'excel' = 'csv') => {
    try {
      const response = await axios.get(`/export/${type}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error("Error exporting data:", error.response?.data || error.message);
      throw error;
    }
  }
};