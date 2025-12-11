import { useState, useEffect } from 'react';
import { DynamicSidebar } from '../../components/Sidebar';
import { Alert, AlertDescription } from '../../components/alert';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Shield, RefreshCw, X, Check, FileText, BarChart3, Users, AlertCircle, Database, Award } from 'lucide-react';
import { authService } from '../../services/authService';
import axios from 'axios';
import ExcelPage from '../../pages/ExcelPage';

// Importar componentes
import StatsCards from '../../components/commons/StatsCards';
import RecentUsers from '../../components/commons/RecentUsers';
import UsersTable from '../../components/users/UsersTable';
import CareersTable from '../../components/careers/CareersTable';
import SubjectsTable from '../../components/subjects/SubjectsTable';
import GroupsTable from '../../components/groups/GroupsTable';
import TutoriasTable from '../../components/tutorias/TutoriasTable';
import ReportsTable from '../../components/reports/ReportsTable';
import SystemStatsModal from '../../components/reports/SystemStatsModal';

// Importar componentes de capacitaciones
import CapacitacionesTable from '../../components/capacitacion/CapacitacionesTable';
import CreateCapacitacionModal from '../../components/capacitacion/CreateCapacitacionModal';
import CapacitacionDetailsModal from '../../components/capacitacion/CapacitacionDetailsModal';
import EditCapacitacionModal from '../../components/capacitacion/EditCapacitacionModal';

// Importar modales
import CreateUserModal from '../../components/users/CreateUserModal';
import UserDetailsModal from '../../components/users/UserDetailsModal';
import EditUserModal from '../../components/users/EditUserModal';
import CreateCareerModal from '../../components/careers/CreateCareerModal';
import CareerDetailsModal from '../../components/careers/CareerDetailsModal';
import EditCareerModal from '../../components/careers/EditCareerModal';
import CreateSubjectModal from '../../components/subjects/CreateSubjectModal';
import SubjectDetailsModal from '../../components/subjects/SubjectDetailsModal';
import EditSubjectModal from '../../components/subjects/EditSubjectModal';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import GroupDetailsModal from '../../components/groups/GroupDetailsModal';
import EditGroupModal from '../../components/groups/EditGroupModal';
import CreateTutoriaModal from '../../components/tutorias/CreateTutoriaModal';
import TutoriaDetailsModal from '../../components/tutorias/TutoriaDetailsModal';
import EditTutoriaModal from '../../components/tutorias/EditTutoriaModal';

// Modales de reportes
import GenerateReportModal from '../../components/reports/GenerateReportModal';
import ReportDetailsModal from '../../components/reports/ReportDetailsModal';

// Interfaces
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  institutionId?: string | null;
  active?: boolean;
  fullName?: string;
}

interface Career {
  _id: string;
  name: string;
  code: string;
  status: string;
  description?: string;
  duration?: number;
  createdAt?: string;
  active?: boolean;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  careerId: string;
  careerName?: string;
  status: string;
  credits?: number;
  semester?: number;
  createdAt?: string;
  active?: boolean;
}

interface Group {
  _id: string;
  name: string;
  code: string;
  career?: string | { _id: string; name: string; code: string };
  careerId?: string;
  careerName?: string;
  subject?: string | { _id: string; name: string; code: string };
  subjectId?: string;
  subjectName?: string;
  teacher?: string | { _id: string; firstName: string; lastName: string };
  teacherId?: string;
  teacherName?: string;
  schedule?: string;
  capacity?: number;
  status: string;
  active?: boolean;
  students?: any[];
  createdAt?: string;
}

interface Tutoria {
  _id: string;
  tutor: string | { _id: string; firstName: string; lastName: string };
  tutorId?: string;
  tutorName?: string;
  student: string | { _id: string; firstName: string; lastName: string };
  studentId?: string;
  studentName?: string;
  group: string | { _id: string; name: string; code: string };
  groupId?: string;
  groupName?: string;
  date: string;
  topics?: string;
  agreements?: string;
  observations?: string;
  riskDetected?: boolean;
  followUps?: string[];
  createdAt?: string;
}

interface Capacitacion {
  _id: string;
  title: string;
  teacher: string | { _id: string; firstName: string; lastName: string };
  teacherId?: string;
  teacherName?: string;
  date: string;
  description?: string;
  evidence?: string[];
  observations?: string;
  createdAt?: string;
}

interface Report {
  _id: string;
  name: string;
  description?: string;
  type: string;
  format?: string;
  status: string;
  dataSize?: number;
  recordCount?: number;
  downloadCount?: number;
  generatedBy?: string | { _id: string; fullName: string; email: string };
  filters?: {
    userId?: string;
    studentId?: string;
    groupId?: string;
    subjectId?: string;
    careerId?: string;
    startDate?: Date;
    endDate?: Date;
  };
  stats?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

interface AlertItem {
  _id: string;
  message: string;
  riskLevel: number;
  resolved: boolean;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tutorias, setTutorias] = useState<Tutoria[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Estados para selección
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedTutoria, setSelectedTutoria] = useState<Tutoria | null>(null);
  const [selectedCapacitacion, setSelectedCapacitacion] = useState<Capacitacion | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // Estados para modales
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCareer, setShowCreateCareer] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateTutoria, setShowCreateTutoria] = useState(false);
  const [showCreateCapacitacion, setShowCreateCapacitacion] = useState(false);
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCareerDetails, setShowCareerDetails] = useState(false);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showTutoriaDetails, setShowTutoriaDetails] = useState(false);
  const [showCapacitacionDetails, setShowCapacitacionDetails] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [showSystemStats, setShowSystemStats] = useState(false);
  
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditCareer, setShowEditCareer] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showEditTutoria, setShowEditTutoria] = useState(false);
  const [showEditCapacitacion, setShowEditCapacitacion] = useState(false);

  // Función para debuguear endpoint de capacitaciones
  const debugCapacitacionesEndpoint = async () => {
    try {
      console.log('🔍 DEBUG: Probando endpoint /capacitacion directamente...');
      
      const response = await axios.get("/capacitacion", {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      console.log('📊 RESPUESTA CRUDA:', response.data);
      console.log('📊 TIPO:', typeof response.data);
      console.log('📊 ES ARRAY?:', Array.isArray(response.data));
      
      if (response.data && typeof response.data === 'object') {
        console.log('📊 PROPIEDADES:', Object.keys(response.data));
      }
      
      return response.data;
      
    } catch (err: any) {
      console.error('❌ DEBUG Error:', err);
      return null;
    }
  };

  // Función para cargar capacitaciones
  const loadCapacitaciones = async () => {
    try {
      console.log("📥 Intentando cargar capacitaciones...");
      const response = await authService.getCapacitaciones();
      let capacitacionesData: Capacitacion[] = [];
      
      console.log("📊 Capacitaciones response:", response);
      
      // Manejar diferentes estructuras de respuesta
      if (response.success && Array.isArray(response.data)) {
        capacitacionesData = response.data;
      } else if (Array.isArray(response)) {
        capacitacionesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        capacitacionesData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        capacitacionesData = response.data.data;
      }
      
      // Enriquecer con datos de docentes
      const enrichedCapacitaciones = capacitacionesData.map((capacitacion: any) => {
        const teacherId = capacitacion.teacher?._id || capacitacion.teacher || '';
        const teacher = users.find(u => u._id === teacherId);
        
        return {
          ...capacitacion,
          teacherId,
          teacherName: teacher 
            ? `${teacher.firstName} ${teacher.lastName}`
            : capacitacion.teacher?.firstName
              ? `${capacitacion.teacher.firstName} ${capacitacion.teacher.lastName}`
              : 'Desconocido',
          date: capacitacion.date || capacitacion.createdAt
        };
      });
      
      // Ordenar por fecha más reciente
      const sortedCapacitaciones = enrichedCapacitaciones.sort((a: any, b: any) => 
        new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
      );
      
      setCapacitaciones(sortedCapacitaciones);
      console.log("📚 Capacitaciones cargadas:", sortedCapacitaciones.length);
      
    } catch (err: any) {
      console.log("ℹ️ Capacitaciones endpoint no disponible aún o error:", err.message);
    }
  };

  // Función para cargar alertas
  const loadAlerts = async () => {
    try {
      console.log("📥 Intentando cargar alertas...");
      const response = await authService.getAlerts();
      let alertsData: AlertItem[] = [];
      
      console.log("📊 Alerts response:", response);
      
      if (response.success && Array.isArray(response.data)) {
        alertsData = response.data;
      } else if (Array.isArray(response)) {
        alertsData = response;
      }
      
      // Ordenar por fecha más reciente
      const sortedAlerts = alertsData.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAlerts(sortedAlerts);
      console.log("🚨 Alertas cargadas:", sortedAlerts.length);
      
    } catch (err: any) {
      console.log("ℹ️ Alerts endpoint no disponible aún o error:", err.message);
    }
  };

  // Cargar todos los datos
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setInfoMessage('');
      
      console.log("🔄 Cargando todos los datos...");
      
      // Cargar usuarios
      try {
        console.log("📥 Intentando cargar usuarios...");
        const usersResponse = await authService.getUsers();
        let usersData: User[] = [];
        
        if (Array.isArray(usersResponse)) {
          usersData = usersResponse;
        } else if (usersResponse.data && Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        } else if (usersResponse.success && Array.isArray(usersResponse.data)) {
          usersData = usersResponse.data;
        }
        
        // Transformar datos de usuarios
        const transformedUsers = usersData.map((user: any) => ({
          ...user,
          status: user.active ? 'active' : 'inactive'
        }));
        
        setUsers(transformedUsers);
        console.log("👥 Usuarios cargados:", transformedUsers.length);
      } catch (err: any) {
        console.log("ℹ️ Usuarios endpoint error:", err.message);
      }
      
      // Cargar carreras
      try {
        console.log("📥 Intentando cargar carreras...");
        const careersResponse = await authService.getCareers();
        let careersData: Career[] = [];
        
        if (careersResponse.success && Array.isArray(careersResponse.data)) {
          careersData = careersResponse.data;
        } else if (Array.isArray(careersResponse)) {
          careersData = careersResponse;
        } else if (careersResponse.data && Array.isArray(careersResponse.data)) {
          careersData = careersResponse.data;
        }
        
        // Transformar datos de carreras
        const transformedCareers = careersData.map((career: any) => ({
          ...career,
          status: career.active ? 'active' : 'inactive'
        }));
        
        setCareers(transformedCareers);
        console.log("🎓 Carreras cargadas:", transformedCareers.length);
      } catch (err: any) {
        console.log("ℹ️ Carreras endpoint no disponible aún o error:", err.message);
      }
      
      // Cargar materias
      try {
        console.log("📥 Intentando cargar materias...");
        const subjectsResponse = await authService.getSubjects();
        let subjectsData: Subject[] = [];
        
        if (subjectsResponse.success && Array.isArray(subjectsResponse.data)) {
          subjectsData = subjectsResponse.data;
        } else if (Array.isArray(subjectsResponse)) {
          subjectsData = subjectsResponse;
        } else if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
          subjectsData = subjectsResponse.data;
        }
        
        // Enriquecer con datos de carreras
        const enrichedSubjects = subjectsData.map((subject: any) => {
          const careerId = subject.career?._id || subject.career || subject.careerId || '';
          const career = careers.find(c => c._id === careerId);
          
          return {
            ...subject,
            careerId: careerId,
            careerName: subject.career?.name || career?.name || 'Desconocida',
            status: subject.active ? 'active' : 'inactive',
            credits: subject.credits || 4,
            semester: subject.semester || 1
          };
        });
        
        setSubjects(enrichedSubjects);
        console.log("✅ Materias cargadas:", enrichedSubjects.length);
      } catch (err: any) {
        console.log("ℹ️ Materias endpoint no disponible aún o error:", err.message);
      }
      
      // Cargar grupos
      try {
        console.log("📥 Intentando cargar grupos...");
        const groupsResponse = await authService.getGroups();
        let groupsData: Group[] = [];
        
        if (groupsResponse.success && Array.isArray(groupsResponse.data)) {
          groupsData = groupsResponse.data;
        } else if (Array.isArray(groupsResponse)) {
          groupsData = groupsResponse;
        } else if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
          groupsData = groupsResponse.data;
        }
        
        // Enriquecer con detalles usando los datos ya cargados
        const groupsWithDetails = groupsData.map((group: any) => {
          const careerId = group.career?._id || group.career || '';
          const subjectId = group.subject?._id || group.subject || '';
          const teacherId = group.teacher?._id || group.teacher || '';
          
          const career = careers.find(c => c._id === careerId);
          const subject = subjects.find(s => s._id === subjectId);
          const teacher = users.find(u => u._id === teacherId);
          
          return {
            ...group,
            careerId: careerId,
            careerName: group.career?.name || career?.name || 'Desconocida',
            subjectId: subjectId,
            subjectName: group.subject?.name || subject?.name || 'Desconocida',
            teacherId: teacherId,
            teacherName: group.teacher 
              ? `${group.teacher?.firstName || ''} ${group.teacher?.lastName || ''}`.trim()
              : teacher
                ? `${teacher.firstName} ${teacher.lastName}`
                : 'Sin asignar',
            status: group.active ? 'active' : 'inactive',
            capacity: group.capacity || 30,
            schedule: group.schedule || ''
          };
        });
        
        setGroups(groupsWithDetails);
        console.log("👥 Grupos cargados:", groupsWithDetails.length);
      } catch (err: any) {
        console.log("ℹ️ Grupos endpoint no disponible aún o error:", err.message);
      }
      
      // Cargar tutorías
      try {
        console.log("📥 Intentando cargar tutorías...");
        const tutoriasResponse = await authService.getTutorias();
        let tutoriasData: Tutoria[] = [];
        
        if (tutoriasResponse.success && Array.isArray(tutoriasResponse.data)) {
          tutoriasData = tutoriasResponse.data;
        } else if (Array.isArray(tutoriasResponse)) {
          tutoriasData = tutoriasResponse;
        } else if (tutoriasResponse.data && Array.isArray(tutoriasResponse.data)) {
          tutoriasData = tutoriasResponse.data;
        }
        
        // Enriquecer con detalles
        const tutoriasWithDetails = tutoriasData.map((tutoria: any) => {
          const tutorId = tutoria.tutor?._id || tutoria.tutor || '';
          const studentId = tutoria.student?._id || tutoria.student || '';
          const groupId = tutoria.group?._id || tutoria.group || '';
          
          const tutor = users.find(u => u._id === tutorId);
          const student = users.find(u => u._id === studentId);
          const group = groups.find(g => g._id === groupId);
          
          return {
            ...tutoria,
            tutorId,
            tutorName: tutor 
              ? `${tutor.firstName} ${tutor.lastName}`
              : tutoria.tutor?.firstName 
                ? `${tutoria.tutor.firstName} ${tutoria.tutor.lastName}`
                : 'Desconocido',
            studentId,
            studentName: student
              ? `${student.firstName} ${student.lastName}`
              : tutoria.student?.firstName
                ? `${tutoria.student.firstName} ${tutoria.student.lastName}`
                : 'Desconocido',
            groupId,
            groupName: group?.name || tutoria.group?.name || 'Desconocido'
          };
        });
        
        setTutorias(tutoriasWithDetails);
        console.log("📝 Tutorías cargadas:", tutoriasWithDetails.length);
      } catch (err: any) {
        console.log("ℹ️ Tutorías endpoint no disponible aún o error:", err.message);
      }

      // Cargar capacitaciones (debe ir después de cargar usuarios)
      await loadCapacitaciones();

      // Cargar alertas
      await loadAlerts();

      // Cargar reportes
      try {
        console.log("📥 Intentando cargar reportes...");
        const reportsResponse = await authService.getReports();
        let reportsData: Report[] = [];
        
        console.log("📊 Reports response:", reportsResponse);
        
        // FORMA ROBUSTA DE EXTRAER LOS DATOS
        if (reportsResponse && reportsResponse.success === true) {
          // Caso 1: data es un array directamente
          if (Array.isArray(reportsResponse.data)) {
            reportsData = reportsResponse.data;
            console.log(`✅ Reportes obtenidos de data: ${reportsData.length}`);
          }
          // Caso 2: La respuesta completa es un array
          else if (Array.isArray(reportsResponse)) {
            reportsData = reportsResponse;
            console.log(`✅ Reportes como array directo: ${reportsResponse.length}`);
          }
        }
        
        // Procesar y transformar los reportes
        const processedReports = reportsData.map((report: any) => ({
          _id: report._id || report.id,
          name: report.name || `Reporte ${report.type || 'Sin nombre'}`,
          description: report.description,
          type: report.type,
          format: report.format || 'json',
          status: report.status || 'completed',
          dataSize: report.dataSize || 0,
          recordCount: report.recordCount || 0,
          downloadCount: report.downloadCount || 0,
          generatedBy: report.generatedBy,
          filters: report.filters,
          stats: report.stats,
          createdAt: report.createdAt || report.created_at || new Date().toISOString(),
          updatedAt: report.updatedAt
        }));
        
        // Ordenar por fecha más reciente
        const sortedReports = processedReports.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setReports(sortedReports);
        console.log("✅ Reportes cargados:", sortedReports.length);
        
      } catch (err: any) {
        console.log("❌ Error cargando reportes:", err.message);
      }
      
      console.log("✅ Todos los datos cargados exitosamente");
      
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      setError(`Error al cargar datos: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers para usuarios
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        setLoading(true);
        await authService.deleteUser(userId);
        setSuccess('✅ Usuario eliminado correctamente');
        loadAllData();
      } catch (err: any) {
        setError('❌ Error al eliminar usuario: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setLoading(true);
      await authService.toggleUserStatus(userId);
      setSuccess('✅ Estado del usuario actualizado');
      loadAllData();
    } catch (err: any) {
      setError('❌ Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Handlers para carreras
  const handleDeleteCareer = async (careerId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta carrera? Esto también eliminará las materias asociadas.')) {
      try {
        setLoading(true);
        await authService.deleteCareer(careerId);
        setSuccess('✅ Carrera eliminada correctamente');
        loadAllData();
      } catch (err: any) {
        setError('❌ Error al eliminar carrera: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers para materias
  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta materia? Esto también eliminará los grupos asociados.')) {
      try {
        setLoading(true);
        await authService.deleteSubject(subjectId);
        setSuccess('✅ Materia eliminada correctamente');
        loadAllData();
      } catch (err: any) {
        setError('❌ Error al eliminar materia: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleSubjectStatus = async (subjectId: string) => {
    try {
      setLoading(true);
      await authService.toggleSubjectStatus(subjectId);
      setSuccess('✅ Estado de la materia actualizado');
      loadAllData();
    } catch (err: any) {
      setError('❌ Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Handlers para grupos
  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este grupo?')) {
      try {
        setLoading(true);
        await authService.deleteGroup(groupId);
        setSuccess('✅ Grupo eliminado correctamente');
        loadAllData();
      } catch (err: any) {
        setError('❌ Error al eliminar grupo: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleGroupStatus = async (groupId: string) => {
    try {
      setLoading(true);
      await authService.toggleGroupStatus(groupId);
      setSuccess('✅ Estado del grupo actualizado');
      loadAllData();
    } catch (err: any) {
      setError('❌ Error al cambiar estado del grupo: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Handlers para tutorías
  const handleDeleteTutoria = async (tutoriaId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta tutoría?')) {
      try {
        setLoading(true);
        await authService.deleteTutoria(tutoriaId);
        setSuccess('✅ Tutoría eliminada correctamente');
        loadAllData();
      } catch (err: any) {
        setError('❌ Error al eliminar tutoría: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers para capacitaciones
  const handleCreateCapacitacion = async (capacitacionData: any) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('📤 Creando capacitación:', capacitacionData);
      const result = await authService.createCapacitacion(capacitacionData);
      
      console.log('✅ Resultado:', result);
      
      if (result.success || result._id) {
        // Recargar datos para obtener la nueva capacitación
        await loadCapacitaciones();
        
        setSuccess('✅ Capacitación creada exitosamente');
        setShowCreateCapacitacion(false);
        
      } else {
        throw new Error(result.message || '❌ Error al crear capacitación');
      }
      
    } catch (err: any) {
      console.error('❌ Error creating capacitacion:', err);
      setError(err.message || '❌ Error al crear capacitación');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCapacitacion = async (capacitacionId: string, capacitacionData: any) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('📤 Actualizando capacitación:', capacitacionId, capacitacionData);
      const result = await authService.updateCapacitacion(capacitacionId, capacitacionData);
      
      console.log('✅ Resultado:', result);
      
      if (result.success || result._id) {
        // Recargar datos
        await loadCapacitaciones();
        
        setSuccess('✅ Capacitación actualizada exitosamente');
        setShowEditCapacitacion(false);
        setSelectedCapacitacion(null);
        
      } else {
        throw new Error(result.message || '❌ Error al actualizar capacitación');
      }
      
    } catch (err: any) {
      console.error('❌ Error updating capacitacion:', err);
      setError(err.message || '❌ Error al actualizar capacitación');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCapacitacion = async (capacitacionId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta capacitación?')) {
      try {
        setLoading(true);
        await authService.deleteCapacitacion(capacitacionId);
        setSuccess('✅ Capacitación eliminada correctamente');
        loadAllData();
      } catch (err: any) {
        setError('❌ Error al eliminar capacitación: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers para reportes
  const handleGenerateReport = async (reportData: any) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('🚀 Generando reporte con datos:', reportData);
      const result = await authService.generateReport(reportData);
      
      console.log('📊 Resultado de generación:', result);
      
      if (result.success) {
        // Recargar datos para obtener el nuevo reporte
        await loadAllData();
        
        setSuccess(result.message || '✅ Reporte generado exitosamente');
        
        // Cerrar el modal de generación
        setShowGenerateReport(false);
        
      } else {
        throw new Error(result.message || '❌ Error al generar reporte');
      }
      
    } catch (err: any) {
      console.error('❌ Error generating report:', err);
      setError(err.message || '❌ Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log(`📥 Descargando reporte ${report._id} en formato ${report.format || 'json'}`);
      
      await authService.downloadReport(report._id, report.format || 'json');
      
      setSuccess(`✅ Reporte "${report.name}" descargado exitosamente`);
      
      // Refrescar datos para actualizar contador de descargas
      await loadAllData();
      
    } catch (err: any) {
      console.error('❌ Error downloading report:', err);
      setError(err.message || '❌ Error al descargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await authService.deleteReport(reportId);
      
      console.log('🗑️ Resultado de eliminación:', result);
      
      if (result.success) {
        // Remover de la lista local
        setReports(prevReports => prevReports.filter(r => r._id !== reportId));
        
        setSuccess(result.message || '✅ Reporte eliminado exitosamente');
        
        // Cerrar modal de detalles si estaba abierto
        if (selectedReport && selectedReport._id === reportId) {
          setShowReportDetails(false);
          setSelectedReport(null);
        }
      } else {
        throw new Error(result.message || '❌ Error al eliminar reporte');
      }
      
    } catch (err: any) {
      console.error('❌ Error deleting report:', err);
      setError(err.message || '❌ Error al eliminar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReportId = () => {
    if (selectedReport) {
      navigator.clipboard.writeText(selectedReport._id);
      setSuccess('ID copiado al portapapeles');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success || infoMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
        setInfoMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, infoMessage]);

  // Renderizar contenido
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* DEBUG: Mostrar estado de reportes */}
            {process.env.NODE_ENV === 'development' && reports.length === 0 && (
              <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>No se encontraron reportes. Verifica la conexión con el backend.</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={debugCapacitacionesEndpoint}
                    className="ml-2"
                  >
                    Debug
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <StatsCards 
              users={users}
              careers={careers}
              subjects={subjects}
              groups={groups}
              tutorias={tutorias}
              reports={reports}
              capacitaciones={capacitaciones}
              alerts={alerts}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QuickActions */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => setShowCreateUser(true)}
                    disabled={loading}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Crear Nuevo Usuario
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowCreateCapacitacion(true)}
                    disabled={loading}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Nueva Capacitación
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowGenerateReport(true)}
                    disabled={loading}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowSystemStats(true)}
                    disabled={loading}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Estadísticas del Sistema
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={loadAllData}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Cargando...' : 'Recargar Datos'}
                  </Button>
                </div>
              </div>
              
              <RecentUsers users={users} />
            </div>
            
            {/* Card de capacitaciones recientes */}
            {capacitaciones.length > 0 && (
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Capacitaciones Recientes
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentView('capacitaciones')}
                  >
                    Ver todas →
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {capacitaciones.slice(0, 3).map(capacitacion => (
                    <div 
                      key={capacitacion._id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={() => {
                        setSelectedCapacitacion(capacitacion);
                        setShowCapacitacionDetails(true);
                      }}
                    >
                      <div>
                        <div className="font-medium">{capacitacion.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {capacitacion.teacherName} • {new Date(capacitacion.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {capacitacion.evidence?.length || 0} evidencias
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Card de reportes */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reportes del Sistema
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentView('reports')}
                >
                  Ver todos →
                </Button>
              </div>
              
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay reportes generados aún</p>
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => setShowGenerateReport(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Primer Reporte
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{reports.length}</div>
                      <div className="text-sm text-muted-foreground">Total Reportes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {reports.filter(r => r.status === 'completed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {reports.reduce((sum, r) => sum + (r.downloadCount || 0), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Descargas</div>
                    </div>
                  </div>
                  
                  {/* Últimos reportes */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Últimos Reportes</h4>
                    <div className="space-y-2">
                      {reports.slice(0, 3).map(report => (
                        <div 
                          key={report._id} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => handleViewReport(report)}
                        >
                          <div>
                            <div className="font-medium">{report.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={
                            report.status === 'completed' ? 'success' : 
                            report.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {report.status === 'completed' ? 'Completado' : 'En proceso'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setCurrentView('reports')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver todos los reportes ({reports.length})
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'users':
        return (
          <UsersTable
            users={users}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateUser={() => setShowCreateUser(true)}
            onViewDetails={(user) => {
              setSelectedUser(user);
              setShowUserDetails(true);
            }}
            onEditUser={(user) => {
              setSelectedUser(user);
              setShowEditUser(true);
            }}
            onDeleteUser={handleDeleteUser}
            onToggleUserStatus={handleToggleUserStatus}
          />
        );

      case 'careers':
        return (
          <CareersTable
            careers={careers}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateCareer={() => setShowCreateCareer(true)}
            onViewDetails={(career) => {
              setSelectedCareer(career);
              setShowCareerDetails(true);
            }}
            onEditCareer={(career) => {
              setSelectedCareer(career);
              setShowEditCareer(true);
            }}
            onDeleteCareer={handleDeleteCareer}
          />
        );

      case 'subjects':
        return (
          <SubjectsTable
            subjects={subjects}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateSubject={() => setShowCreateSubject(true)}
            onViewDetails={(subject) => {
              setSelectedSubject(subject);
              setShowSubjectDetails(true);
            }}
            onEditSubject={(subject) => {
              setSelectedSubject(subject);
              setShowEditSubject(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onToggleSubjectStatus={handleToggleSubjectStatus}
          />
        );

      case 'groups':
        return (
          <GroupsTable
            groups={groups}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateGroup={() => setShowCreateGroup(true)}
            onViewDetails={(group) => {
              setSelectedGroup(group);
              setShowGroupDetails(true);
            }}
            onEditGroup={(group) => {
              setSelectedGroup(group);
              setShowEditGroup(true);
            }}
            onDeleteGroup={handleDeleteGroup}
            onToggleGroupStatus={handleToggleGroupStatus}
          />
        );

      case 'tutorias':
        return (
          <TutoriasTable
            tutorias={tutorias}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateTutoria={() => setShowCreateTutoria(true)}
            onViewDetails={(tutoria) => {
              setSelectedTutoria(tutoria);
              setShowTutoriaDetails(true);
            }}
            onEditTutoria={(tutoria) => {
              setSelectedTutoria(tutoria);
              setShowEditTutoria(true);
            }}
            onDeleteTutoria={handleDeleteTutoria}
          />
        );

      case 'capacitaciones':
        return (
          <CapacitacionesTable
            capacitaciones={capacitaciones}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateCapacitacion={() => setShowCreateCapacitacion(true)}
            onViewDetails={(capacitacion) => {
              setSelectedCapacitacion(capacitacion);
              setShowCapacitacionDetails(true);
            }}
            onEditCapacitacion={(capacitacion) => {
              setSelectedCapacitacion(capacitacion);
              setShowEditCapacitacion(true);
            }}
            onDeleteCapacitacion={handleDeleteCapacitacion}
          />
        );

      case 'reports':
        return (
          <ReportsTable
            reports={reports}
            loading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onGenerateReport={() => setShowGenerateReport(true)}
            onViewReport={handleViewReport}
            onDownloadReport={handleDownloadReport}
            onDeleteReport={handleDeleteReport}
            onViewStats={() => setShowSystemStats(true)}
          />
        );

      case 'excel':
        return <ExcelPage />;

      default:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Panel de Control</h2>
            <p className="text-muted-foreground">Selecciona una opción del menú para comenzar</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DynamicSidebar 
        onNavigate={setCurrentView} 
        currentView={currentView} 
        alertsCount={alerts.filter(a => !a.resolved).length}
      />
      
      <div className="flex-1 overflow-auto ml-64">
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Super Administración</h1>
              <p className="text-muted-foreground">Sistema Metricampus - Panel de Control</p>
              {currentView === 'capacitaciones' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
                  <Award className="h-4 w-4" />
                  <span>Gestión de Capacitaciones</span>
                </div>
              )}
              {currentView === 'reports' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                  <FileText className="h-4 w-4" />
                  <span>Gestión de Reportes</span>
                </div>
              )}
              {currentView === 'excel' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>Importación Masiva desde Excel</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="gap-2">
                <Shield className="h-3 w-3" />
                Super Admin
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadAllData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              {currentView === 'capacitaciones' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setShowCreateCapacitacion(true)}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Nueva Capacitación
                </Button>
              )}
              {currentView === 'reports' && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => setShowSystemStats(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estadísticas
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Mensajes de estado */}
        <div className="px-6 pt-4 space-y-2">
          {error && (
            <Alert variant="destructive" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertDescription className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                {success}
              </AlertDescription>
            </Alert>
          )}
          {infoMessage && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          )}
          
          {/* BOTÓN DE DEBUG PARA DESARROLLO */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={debugCapacitacionesEndpoint}
                disabled={loading}
              >
                Debug Capacitaciones
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  console.log('📊 Estado actual de capacitaciones:', {
                    count: capacitaciones.length,
                    capacitaciones: capacitaciones.map(c => ({
                      id: c._id?.substring(0, 8) + '...',
                      title: c.title,
                      teacher: c.teacherName,
                      date: c.date
                    }))
                  });
                }}
              >
                Ver Estado
              </Button>
            </div>
          )}
        </div>

        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modales de USUARIOS */}
      {showCreateUser && (
        <CreateUserModal 
          isOpen={showCreateUser} 
          onClose={() => setShowCreateUser(false)} 
          onCreate={() => {
            loadAllData();
            setShowCreateUser(false);
          }} 
          onError={setError} 
        />
      )}
      
      {showUserDetails && selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          isOpen={showUserDetails} 
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }} 
          onEdit={() => {
            setShowUserDetails(false);
            setShowEditUser(true);
          }}
          onToggleStatus={() => {
            handleToggleUserStatus(selectedUser._id);
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
      
      {showEditUser && selectedUser && (
        <EditUserModal 
          user={selectedUser} 
          isOpen={showEditUser} 
          onClose={() => {
            setShowEditUser(false);
            setSelectedUser(null);
          }} 
          onUpdate={() => {
            loadAllData();
            setShowEditUser(false);
            setSelectedUser(null);
          }} 
          onError={setError} 
        />
      )}

      {/* Modales de CARRERAS */}
      {showCreateCareer && (
        <CreateCareerModal 
          isOpen={showCreateCareer} 
          onClose={() => setShowCreateCareer(false)} 
          onCreate={() => {
            loadAllData();
            setShowCreateCareer(false);
          }} 
          onError={setError} 
        />
      )}
      
      {showCareerDetails && selectedCareer && (
        <CareerDetailsModal 
          career={selectedCareer} 
          isOpen={showCareerDetails} 
          onClose={() => {
            setShowCareerDetails(false);
            setSelectedCareer(null);
          }} 
          onEdit={() => {
            setShowCareerDetails(false);
            setShowEditCareer(true);
          }} 
        />
      )}
      
      {showEditCareer && selectedCareer && (
        <EditCareerModal 
          career={selectedCareer} 
          isOpen={showEditCareer} 
          onClose={() => {
            setShowEditCareer(false);
            setSelectedCareer(null);
          }} 
          onUpdate={() => {
            loadAllData();
            setShowEditCareer(false);
            setSelectedCareer(null);
          }} 
          onError={setError} 
        />
      )}

      {/* Modales de MATERIAS */}
      {showCreateSubject && (
        <CreateSubjectModal 
          careers={careers} 
          isOpen={showCreateSubject} 
          onClose={() => setShowCreateSubject(false)} 
          onCreate={() => {
            loadAllData();
            setShowCreateSubject(false);
          }} 
          onError={setError} 
        />
      )}
      
      {showSubjectDetails && selectedSubject && (
        <SubjectDetailsModal 
          subject={selectedSubject} 
          isOpen={showSubjectDetails} 
          onClose={() => {
            setShowSubjectDetails(false);
            setSelectedSubject(null);
          }} 
          onEdit={() => {
            setShowSubjectDetails(false);
            setShowEditSubject(true);
          }}
          onToggleStatus={() => {
            handleToggleSubjectStatus(selectedSubject._id);
            setShowSubjectDetails(false);
            setSelectedSubject(null);
          }}
        />
      )}
      
      {showEditSubject && selectedSubject && (
        <EditSubjectModal 
          subject={selectedSubject} 
          careers={careers} 
          isOpen={showEditSubject} 
          onClose={() => {
            setShowEditSubject(false);
            setSelectedSubject(null);
          }} 
          onUpdate={() => {
            loadAllData();
            setShowEditSubject(false);
            setSelectedSubject(null);
          }} 
          onError={setError} 
        />
      )}

      {/* Modales de GRUPOS */}
      {showCreateGroup && (
        <CreateGroupModal 
          careers={careers} 
          subjects={subjects} 
          users={users.filter(u => u.role === 'docente' || u.role === 'teacher')} 
          isOpen={showCreateGroup} 
          onClose={() => setShowCreateGroup(false)} 
          onCreate={() => {
            loadAllData();
            setShowCreateGroup(false);
          }} 
          onError={setError} 
        />
      )}
      
      {showGroupDetails && selectedGroup && (
        <GroupDetailsModal 
          group={selectedGroup} 
          isOpen={showGroupDetails} 
          onClose={() => {
            setShowGroupDetails(false);
            setSelectedGroup(null);
          }} 
          onEdit={() => {
            setShowGroupDetails(false);
            setShowEditGroup(true);
          }} 
        />
      )}
      
      {showEditGroup && selectedGroup && (
        <EditGroupModal 
          group={selectedGroup} 
          careers={careers} 
          subjects={subjects} 
          users={users.filter(u => u.role === 'docente' || u.role === 'teacher')} 
          isOpen={showEditGroup} 
          onClose={() => {
            setShowEditGroup(false);
            setSelectedGroup(null);
          }} 
          onUpdate={() => {
            loadAllData();
            setShowEditGroup(false);
            setSelectedGroup(null);
          }} 
          onError={setError} 
        />
      )}

      {/* Modales de TUTORÍAS */}
      {showCreateTutoria && (
        <CreateTutoriaModal 
          users={users}
          groups={groups}
          isOpen={showCreateTutoria} 
          onClose={() => setShowCreateTutoria(false)} 
          onCreate={() => {
            loadAllData();
            setShowCreateTutoria(false);
          }} 
          onError={setError} 
        />
      )}
      
      {showTutoriaDetails && selectedTutoria && (
        <TutoriaDetailsModal 
          tutoria={selectedTutoria} 
          isOpen={showTutoriaDetails} 
          onClose={() => {
            setShowTutoriaDetails(false);
            setSelectedTutoria(null);
          }} 
          onEdit={() => {
            setShowTutoriaDetails(false);
            setShowEditTutoria(true);
          }} 
        />
      )}
      
      {showEditTutoria && selectedTutoria && (
        <EditTutoriaModal 
          tutoria={selectedTutoria} 
          users={users}
          groups={groups}
          isOpen={showEditTutoria} 
          onClose={() => {
            setShowEditTutoria(false);
            setSelectedTutoria(null);
          }} 
          onUpdate={() => {
            loadAllData();
            setShowEditTutoria(false);
            setSelectedTutoria(null);
          }} 
          onError={setError} 
        />
      )}

      {/* Modales de CAPACITACIONES */}
      {showCreateCapacitacion && (
        <CreateCapacitacionModal 
          teachers={users.filter(u => u.role === 'docente' || u.role === 'teacher')} 
          isOpen={showCreateCapacitacion} 
          onClose={() => setShowCreateCapacitacion(false)} 
          onCreate={handleCreateCapacitacion}
          onError={setError} 
        />
      )}
      
      {showCapacitacionDetails && selectedCapacitacion && (
        <CapacitacionDetailsModal 
          capacitacion={selectedCapacitacion} 
          isOpen={showCapacitacionDetails} 
          onClose={() => {
            setShowCapacitacionDetails(false);
            setSelectedCapacitacion(null);
          }} 
          onEdit={() => {
            setShowCapacitacionDetails(false);
            setShowEditCapacitacion(true);
          }}
        />
      )}
      
      {showEditCapacitacion && selectedCapacitacion && (
        <EditCapacitacionModal 
          capacitacion={selectedCapacitacion}
          teachers={users.filter(u => u.role === 'docente' || u.role === 'teacher')}
          isOpen={showEditCapacitacion} 
          onClose={() => {
            setShowEditCapacitacion(false);
            setSelectedCapacitacion(null);
          }} 
          onUpdate={(updatedData) => handleUpdateCapacitacion(selectedCapacitacion._id, updatedData)} 
          onError={setError} 
        />
      )}

      {/* Modales de REPORTES */}
      {showGenerateReport && (
        <GenerateReportModal
          isOpen={showGenerateReport}
          onClose={() => setShowGenerateReport(false)}
          onGenerate={handleGenerateReport}
          onError={setError}
          users={users}
          careers={careers}
          subjects={subjects}
          groups={groups}
        />
      )}
      
      {showReportDetails && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={showReportDetails}
          onClose={() => {
            setShowReportDetails(false);
            setSelectedReport(null);
          }}
          onDownload={(format) => handleDownloadReport({...selectedReport, format})}
          onCopyId={handleCopyReportId}
        />
      )}

      {/* Modal de estadísticas del sistema */}
      <SystemStatsModal
        isOpen={showSystemStats}
        onClose={() => setShowSystemStats(false)}
      />
    </div>
  );
}