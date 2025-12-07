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

export const authService = {
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
      
      const mapRoleToBackend = (frontendRole: string) => {
        const roleMap: Record<string, string> = {
          'superadmin': 'superadmin',
          'admin': 'admin',
          'docente': 'docente',
          'estudiante': 'estudiante',
          'jefe-academico': 'jefe_departamento',
          'tutor': 'tutor',
          'psicopedagogico': 'control_escolar',
          'desarrollo-academico': 'capacitacion'
        };
        return roleMap[frontendRole] || frontendRole;
      };
      
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
      
      try {
        const formattedData = formatUserData(userData);
        
        console.log("📤 Sending to /users:", formattedData);
        const response = await axios.post("/users", formattedData);
        console.log("✅ Create user via /users response:", response.data);
        return response.data;
        
      } catch (usersError: any) {
        console.log("❌ /users failed, trying /auth/register:", usersError.response?.data);
        
        const registerData = formatUserData(userData);
        Object.assign(registerData, {
          name: registerData.fullName,
          username: userData.email.split('@')[0]
        });
        
        console.log("📤 Sending to /auth/register:", registerData);
        const response = await axios.post("/auth/register", registerData);
        console.log("✅ Create user via /auth/register response:", response.data);
        return response.data;
      }
      
    } catch (error: any) {
      console.error("❌ Error creating user:", error.response?.data || error.message);
      
      const errorDetails = error.response?.data;
      if (errorDetails) {
        console.error("Error details:", errorDetails);
        
        if (errorDetails.errors) {
          console.error("Validation errors:", errorDetails.errors);
        }
      }
      
      throw error;
    }
  },

  updateUser: async (userId: string, userData: any) => {
    try {
      const response = await axios.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      console.error("Error updating user:", error.response?.data || error.message);
      throw error;
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
      return response.data;
    } catch (error: any) {
      console.error("Error getting careers:", error.response?.data || error.message);
      return { success: false, data: [] };
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

  // ========== MATERIAS ==========
  
  getSubjects: async () => {
    try {
      const response = await axios.get("/subjects");
      console.log("✅ Subjects response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error getting subjects:", error.response?.data || error.message);
      return { success: false, data: [] };
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

  // ========== GRUPOS ==========
  
  getGroups: async () => {
    try {
      const response = await axios.get("/groups");
      console.log("✅ Groups response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error getting groups:", error.response?.data || error.message);
      return { success: false, data: [] };
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

  // ========== TUTORÍAS ==========
  
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
  
  getReports: async () => {
    try {
      const response = await axios.get("/reports");
      return response.data;
    } catch (error: any) {
      console.error("Error getting reports:", error.response?.data || error.message);
      return { success: false, data: [] };
    }
  }
};