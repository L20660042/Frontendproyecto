import axios from "axios";

const API_URL = "https://mi-backendnew-production.up.railway.app";

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
    return Promise.reject(error);
  }
);

// Función para mapear roles de frontend a backend
const mapRoleToBackend = (frontendRole: string) => {
  // Ya que frontend y backend usan los mismos nombres según el enum,
  // simplemente devolvemos el mismo rol
  return frontendRole;
};

export const authService = {
  // ========== AUTENTICACIÓN ==========
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post("/auth/login", credentials);
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
      console.log("✅ Careers response:", response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Error getting careers:", error.response?.data || error.message);
      return [];
    }
  },

  createCareer: async (careerData: any) => {
    try {
      const response = await axios.post("/careers", careerData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating career:", error.response?.data || error.message);
      throw error;
    }
  },

  updateCareer: async (careerId: string, careerData: any) => {
    try {
      console.log("📤 Actualizando carrera:", careerId, careerData);
      const response = await axios.patch(`/careers/${careerId}`, careerData);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error actualizando carrera:", error.response?.data || error.message);
      throw error;
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

  // ========== MÉTODOS RESTANTES (sin cambios) ==========
  getSubjects: async () => {
    try {
      const response = await axios.get("/subjects");
      console.log("✅ Subjects response:", response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Error getting subjects:", error.response?.data || error.message);
      return [];
    }
  },

  createSubject: async (subjectData: any) => {
    try {
      const response = await axios.post("/subjects", subjectData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating subject:", error.response?.data || error.message);
      throw error;
    }
  },

  updateSubject: async (subjectId: string, subjectData: any) => {
    try {
      console.log("📤 Actualizando materia:", subjectId, subjectData);
      const response = await axios.patch(`/subjects/${subjectId}`, subjectData);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error actualizando materia:", error.response?.data || error.message);
      throw error;
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

  getGroups: async () => {
    try {
      const response = await axios.get("/groups");
      console.log("✅ Groups response:", response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error("Error getting groups:", error.response?.data || error.message);
      return [];
    }
  },

  createGroup: async (groupData: any) => {
    try {
      const response = await axios.post("/groups", groupData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating group:", error.response?.data || error.message);
      throw error;
    }
  },

  updateGroup: async (groupId: string, groupData: any) => {
    try {
      console.log("📤 Actualizando grupo:", groupId, groupData);
      const response = await axios.patch(`/groups/${groupId}`, groupData);
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

  getTutorias: async () => {
    try {
      const response = await axios.get("/tutoria");
      return response.data;
    } catch (error: any) {
      console.error("Error getting tutorias:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

  createTutoria: async (tutoriaData: any) => {
    try {
      const response = await axios.post("/tutoria", tutoriaData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating tutoria:", error.response?.data || error.message);
      throw error;
    }
  },

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

  getReports: async () => {
    try {
      const response = await axios.get("/reports");
      return response.data;
    } catch (error: any) {
      console.error("Error getting reports:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  },

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
  }
};