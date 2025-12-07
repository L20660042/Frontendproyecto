import { useState, useEffect } from 'react';
import { DynamicSidebar } from '../../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Alert, AlertDescription } from '../../components/alert';
import {
  Users,
  BookOpen,
  Download,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  Shield,
  UserPlus,
  EyeOff,
  Eye as EyeIcon,
  RefreshCw,
  Users as UsersIcon,
  Key,
  PlusCircle,
  Calendar,
  Mail,
  User as UserIcon,
  Building,
  Book,
  Clock,
  CheckCircle,
  XCircle} from 'lucide-react';
import { authService } from '../../services/authService';

// Interfaces según tu backend
interface User {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  institutionId?: string | null;
  subjects?: any[];
  groups?: any[];
  active?: boolean;
}

interface Career {
  _id: string;
  name: string;
  code: string;
  status: string;
  createdAt?: string;
  description?: string;
  duration?: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  careerId: string;
  careerName?: string;
  status: string;
  createdAt?: string;
  credits?: number;
  semester?: number;
}

interface Group {
  _id: string;
  name: string;
  code: string;
  careerId: string;
  careerName?: string;
  subjectId: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  students?: any[];
  status: string;
  createdAt?: string;
  schedule?: string;
  capacity?: number;
}

interface Tutoria {
  _id: string;
  title: string;
  description: string;
  status: string;
  date?: string;
  studentName?: string;
  tutorName?: string;
}

interface Capacitacion {
  _id: string;
  title: string;
  description: string;
  status: string;
  date?: string;
  duration?: string;
}

interface AlertItem {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt?: string;
}

interface Report {
  _id: string;
  title: string;
  type: string;
  generatedAt: string;
  downloadUrl?: string;
}

export default function SuperAdminDashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tutorias, setTutorias] = useState<Tutoria[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modales
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCareer, setShowCreateCareer] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateTutoria, setShowCreateTutoria] = useState(false);
  const [showCreateCapacitacion, setShowCreateCapacitacion] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para ver/editar
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [, setSelectedTutoria] = useState<Tutoria | null>(null);
  const [, setSelectedCapacitacion] = useState<Capacitacion | null>(null);
  const [, setSelectedAlert] = useState<AlertItem | null>(null);
  
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCareerDetails, setShowCareerDetails] = useState(false);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showTutoriaDetails, setShowTutoriaDetails] = useState(false);
  const [showCapacitacionDetails, setShowCapacitacionDetails] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditCareer, setShowEditCareer] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);

  // Formulario nuevo usuario
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'estudiante',
    institutionId: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Formulario editar usuario
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'estudiante',
    status: 'active' as 'active' | 'inactive',
    institutionId: ''
  });

  // Formulario nueva carrera
  const [newCareer, setNewCareer] = useState({
    name: '',
    code: '',
    description: '',
    duration: 8,
    status: 'active'
  });

  // Formulario editar carrera
  const [editCareerForm, setEditCareerForm] = useState({
    name: '',
    code: '',
    description: '',
    duration: 8,
    status: 'active'
  });

  // Formulario nueva materia
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    careerId: '',
    credits: 4,
    semester: 1,
    status: 'active'
  });

  // Formulario editar materia
  const [editSubjectForm, setEditSubjectForm] = useState({
    name: '',
    code: '',
    careerId: '',
    credits: 4,
    semester: 1,
    status: 'active'
  });

  // Formulario nuevo grupo
  const [newGroup, setNewGroup] = useState({
    name: '',
    code: '',
    careerId: '',
    subjectId: '',
    teacherId: '',
    schedule: '',
    capacity: 30,
    status: 'active'
  });

  // Formulario editar grupo
  const [editGroupForm, setEditGroupForm] = useState({
    name: '',
    code: '',
    careerId: '',
    subjectId: '',
    teacherId: '',
    schedule: '',
    capacity: 30,
    status: 'active'
  });

  // Formulario nueva tutoría
  const [newTutoria, setNewTutoria] = useState({
    title: '',
    description: '',
    studentId: '',
    tutorId: '',
    date: '',
    status: 'pendiente'
  });

  // Formulario nueva capacitación
  const [newCapacitacion, setNewCapacitacion] = useState({
    title: '',
    description: '',
    date: '',
    duration: '2 horas',
    instructorId: '',
    status: 'pendiente'
  });

  // Formulario nueva alerta
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    priority: 'media',
    type: 'general',
    status: 'pendiente'
  });

  // Función para mapear roles del frontend al backend
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

  // Función para mapear roles del backend al frontend
  const mapRoleToFrontend = (backendRole: string) => {
    const roleMap: Record<string, string> = {
      'superadmin': 'superadmin',
      'admin': 'admin',
      'docente': 'docente',
      'estudiante': 'estudiante',
      'jefe_departamento': 'jefe-academico',
      'tutor': 'tutor',
      'control_escolar': 'psicopedagogico',
      'capacitacion': 'desarrollo-academico'
    };
    return roleMap[backendRole] || backendRole;
  };

  // Roles disponibles para mostrar en el frontend
  const availableRoles = [
    { value: 'superadmin', label: 'Super Administrador', backendValue: 'superadmin' },
    { value: 'admin', label: 'Administrador', backendValue: 'admin' },
    { value: 'docente', label: 'Docente', backendValue: 'docente' },
    { value: 'estudiante', label: 'Estudiante', backendValue: 'estudiante' },
    { value: 'jefe-academico', label: 'Jefe Académico', backendValue: 'jefe_departamento' },
    { value: 'tutor', label: 'Tutor', backendValue: 'tutor' },
    { value: 'psicopedagogico', label: 'Psicopedagógico', backendValue: 'control_escolar' },
    { value: 'desarrollo-academico', label: 'Desarrollo Académico', backendValue: 'capacitacion' }
  ];

  // Cargar todos los datos
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar usuarios
      const usersResponse = await authService.getUsers();
      console.log("📊 Raw users response:", usersResponse);
      
      if (Array.isArray(usersResponse)) {
        const formattedUsers = usersResponse.map((user: any) => ({
          _id: user._id || user.id,
          id: user._id || user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
          fullName: user.fullName || `${user.firstName} ${user.lastName}`,
          role: mapRoleToFrontend(user.role) || 'estudiante',
          status: (user.active ? 'active' : 'inactive') as 'active' | 'inactive',
          createdAt: user.createdAt,
          institutionId: user.institutionId,
          subjects: user.subjects || [],
          groups: user.groups || [],
          active: user.active
        }));
        setUsers(formattedUsers);
      } else if (usersResponse.data && Array.isArray(usersResponse.data)) {
        const formattedUsers = usersResponse.data.map((user: any) => ({
          _id: user._id || user.id,
          id: user._id || user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
          fullName: user.fullName || `${user.firstName} ${user.lastName}`,
          role: mapRoleToFrontend(user.role) || 'estudiante',
          status: (user.active ? 'active' : 'inactive') as 'active' | 'inactive',
          createdAt: user.createdAt,
          institutionId: user.institutionId,
          subjects: user.subjects || [],
          groups: user.groups || [],
          active: user.active
        }));
        setUsers(formattedUsers);
      }
      
      // Cargar carreras
      try {
        const careersResponse = await authService.getCareers();
        console.log("📊 Carreras response:", careersResponse);
        
        let careersData: Career[] = [];
        if (careersResponse.success && Array.isArray(careersResponse.data)) {
          careersData = careersResponse.data;
        } else if (Array.isArray(careersResponse)) {
          careersData = careersResponse;
        } else if (careersResponse.data && Array.isArray(careersResponse.data)) {
          careersData = careersResponse.data;
        }
        setCareers(careersData);
      } catch (err) {
        console.log("⚠️ Carreras endpoint no disponible aún");
      }
      
      // Cargar materias
      try {
        const subjectsResponse = await authService.getSubjects();
        console.log("📊 Materias response:", subjectsResponse);
        
        let subjectsData: Subject[] = [];
        if (subjectsResponse.success && Array.isArray(subjectsResponse.data)) {
          subjectsData = subjectsResponse.data;
        } else if (Array.isArray(subjectsResponse)) {
          subjectsData = subjectsResponse;
        } else if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
          subjectsData = subjectsResponse.data;
        }
        
        const subjectsWithCareerName = subjectsData.map((subject: any) => ({
          ...subject,
          careerName: careers.find(c => c._id === subject.careerId)?.name || 'Desconocida'
        }));
        setSubjects(subjectsWithCareerName);
      } catch (err) {
        console.log("⚠️ Subjects endpoint no disponible aún");
      }
      
      // Cargar grupos
      try {
        const groupsResponse = await authService.getGroups();
        console.log("📊 Grupos response:", groupsResponse);
        
        let groupsData: Group[] = [];
        if (groupsResponse.success && Array.isArray(groupsResponse.data)) {
          groupsData = groupsResponse.data;
        } else if (Array.isArray(groupsResponse)) {
          groupsData = groupsResponse;
        } else if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
          groupsData = groupsResponse.data;
        }
        
        const groupsWithDetails = groupsData.map((group: any) => ({
          ...group,
          careerName: careers.find(c => c._id === group.careerId)?.name || 'Desconocida',
          subjectName: subjects.find(s => s._id === group.subjectId)?.name || 'Desconocida',
          teacherName: users.find(u => u._id === group.teacherId)?.fullName || 'Sin asignar'
        }));
        setGroups(groupsWithDetails);
      } catch (err) {
        console.log("⚠️ Groups endpoint no disponible aún");
      }
      
      // Cargar tutorías
      try {
        const tutoriasResponse = await authService.getTutorias();
        if (tutoriasResponse.success && Array.isArray(tutoriasResponse.data)) {
          setTutorias(tutoriasResponse.data);
        }
      } catch (err) {
        console.log("⚠️ Tutorías endpoint no disponible aún");
      }
      
      // Cargar capacitaciones
      try {
        const capacitacionesResponse = await authService.getCapacitaciones();
        if (capacitacionesResponse.success && Array.isArray(capacitacionesResponse.data)) {
          setCapacitaciones(capacitacionesResponse.data);
        }
      } catch (err) {
        console.log("⚠️ Capacitaciones endpoint no disponible aún");
      }
      
      // Cargar alertas
      try {
        const alertsResponse = await authService.getAlerts();
        if (alertsResponse.success && Array.isArray(alertsResponse.data)) {
          setAlerts(alertsResponse.data);
        }
      } catch (err) {
        console.log("⚠️ Alertas endpoint no disponible aún");
      }
      
      // Cargar reportes
      try {
        const reportsResponse = await authService.getReports();
        if (reportsResponse.success && Array.isArray(reportsResponse.data)) {
          setReports(reportsResponse.data);
        }
      } catch (err) {
        console.log("⚠️ Reportes endpoint no disponible aún");
      }
      
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar datos';
      setError(`Error al cargar datos: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  // Efecto para cargar datos del usuario seleccionado
  useEffect(() => {
    if (selectedUser) {
      setEditUserForm({
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status || 'active',
        institutionId: selectedUser.institutionId || ''
      });
    }
  }, [selectedUser]);

  // Efecto para cargar datos de la carrera seleccionada
  useEffect(() => {
    if (selectedCareer) {
      setEditCareerForm({
        name: selectedCareer.name,
        code: selectedCareer.code,
        description: selectedCareer.description || '',
        duration: selectedCareer.duration || 8,
        status: selectedCareer.status
      });
    }
  }, [selectedCareer]);

  // Efecto para cargar datos de la materia seleccionada
  useEffect(() => {
    if (selectedSubject) {
      setEditSubjectForm({
        name: selectedSubject.name,
        code: selectedSubject.code,
        careerId: selectedSubject.careerId,
        credits: selectedSubject.credits || 4,
        semester: selectedSubject.semester || 1,
        status: selectedSubject.status
      });
    }
  }, [selectedSubject]);

  // Efecto para cargar datos del grupo seleccionado
  useEffect(() => {
    if (selectedGroup) {
      setEditGroupForm({
        name: selectedGroup.name,
        code: selectedGroup.code,
        careerId: selectedGroup.careerId,
        subjectId: selectedGroup.subjectId,
        teacherId: selectedGroup.teacherId || '',
        schedule: selectedGroup.schedule || '',
        capacity: selectedGroup.capacity || 30,
        status: selectedGroup.status
      });
    }
  }, [selectedGroup]);

  // Crear usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validaciones
      if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
        setError('Todos los campos marcados con * son obligatorios');
        return;
      }

      if (newUser.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (newUser.password !== newUser.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        setError('Por favor ingresa un email válido');
        return;
      }

      console.log("🚀 Preparando datos para enviar al backend...");
      
      // Preparar datos para enviar
      const userDataToSend = {
        email: newUser.email,
        password: newUser.password,
        fullName: `${newUser.firstName} ${newUser.lastName}`.trim(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: mapRoleToBackend(newUser.role),
        active: newUser.status === 'active',
        ...(newUser.institutionId && newUser.institutionId.trim() !== "" && { 
          institutionId: newUser.institutionId 
        }),
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        username: newUser.email.split('@')[0]
      };
      
      console.log("📤 Datos a enviar:", userDataToSend);
      
      // Intentar crear usuario
      const result = await authService.createUser(userDataToSend);
      console.log("✅ Respuesta del backend:", result);
      
      if (result.success || result.status === 'success' || result._id || result.id || result.data) {
        setSuccess('¡Usuario creado exitosamente!');
        setShowCreateUser(false);
        
        // Limpiar formulario
        setNewUser({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'estudiante',
          institutionId: '',
          status: 'active'
        });
        
        // Recargar datos
        setTimeout(() => {
          loadAllData();
        }, 1000);
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear usuario';
        setError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error completo al crear usuario:", err);
      
      let errorMessage = 'Error al crear usuario';
      let errorDetails = '';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        if (errorData.errors) {
          errorDetails = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (errorDetails) {
        setError(`${errorMessage} (${errorDetails})`);
      } else {
        setError(`Error: ${errorMessage}`);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuario
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Validaciones básicas
      if (!editUserForm.firstName || !editUserForm.lastName || !editUserForm.email) {
        setError('Nombre, apellido y email son obligatorios');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editUserForm.email)) {
        setError('Por favor ingresa un email válido');
        return;
      }
      
      // Preparar datos para actualizar
      const updateData = {
        firstName: editUserForm.firstName,
        lastName: editUserForm.lastName,
        email: editUserForm.email,
        role: mapRoleToBackend(editUserForm.role),
        active: editUserForm.status === 'active',
        ...(editUserForm.institutionId && editUserForm.institutionId.trim() !== "" && { 
          institutionId: editUserForm.institutionId 
        })
      };
      
      console.log("📤 Actualizando usuario:", selectedUser._id, updateData);
      
      // Llamar al servicio de actualización
      const result = await authService.updateUser(selectedUser._id, updateData);
      console.log("✅ Usuario actualizado:", result);
      
      setSuccess('Usuario actualizado correctamente');
      setShowEditUser(false);
      setSelectedUser(null);
      
      // Recargar datos
      loadAllData();
      
    } catch (err: any) {
      console.error("❌ Error al actualizar usuario:", err);
      setError('Error al actualizar usuario: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear carrera
  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!newCareer.name || !newCareer.code) {
        setError('Nombre y código son obligatorios');
        return;
      }

      const result = await authService.createCareer(newCareer);
      console.log("✅ Carrera creada:", result);
      
      if (result.success || result._id || result.id || result.data) {
        setSuccess('¡Carrera creada exitosamente!');
        setShowCreateCareer(false);
        setNewCareer({
          name: '',
          code: '',
          description: '',
          duration: 8,
          status: 'active'
        });
        
        loadAllData();
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear carrera:", err);
      setError('Error al crear carrera: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar carrera
  const handleUpdateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCareer) return;
    
    try {
      setLoading(true);
      setError('');

      if (!editCareerForm.name || !editCareerForm.code) {
        setError('Nombre y código son obligatorios');
        return;
      }

      const result = await authService.updateUser(selectedCareer._id, editCareerForm);
      console.log("✅ Carrera actualizada:", result);
      
      setSuccess('Carrera actualizada correctamente');
      setShowEditCareer(false);
      setSelectedCareer(null);
      
      loadAllData();
      
    } catch (err: any) {
      console.error("❌ Error al actualizar carrera:", err);
      setError('Error al actualizar carrera: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear materia
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!newSubject.name || !newSubject.code || !newSubject.careerId) {
        setError('Nombre, código y carrera son obligatorios');
        return;
      }

      const result = await authService.createSubject(newSubject);
      console.log("✅ Materia creada:", result);
      
      if (result.success || result._id || result.id || result.data) {
        setSuccess('¡Materia creada exitosamente!');
        setShowCreateSubject(false);
        setNewSubject({
          name: '',
          code: '',
          careerId: '',
          credits: 4,
          semester: 1,
          status: 'active'
        });
        
        loadAllData();
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear materia:", err);
      setError('Error al crear materia: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar materia
  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    
    try {
      setLoading(true);
      setError('');

      if (!editSubjectForm.name || !editSubjectForm.code || !editSubjectForm.careerId) {
        setError('Nombre, código y carrera son obligatorios');
        return;
      }

      const result = await authService.updateUser(selectedSubject._id, editSubjectForm);
      console.log("✅ Materia actualizada:", result);
      
      setSuccess('Materia actualizada correctamente');
      setShowEditSubject(false);
      setSelectedSubject(null);
      
      loadAllData();
      
    } catch (err: any) {
      console.error("❌ Error al actualizar materia:", err);
      setError('Error al actualizar materia: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear grupo
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!newGroup.name || !newGroup.code || !newGroup.careerId || !newGroup.subjectId) {
        setError('Nombre, código, carrera y materia son obligatorios');
        return;
      }

      const result = await authService.createGroup(newGroup);
      console.log("✅ Grupo creado:", result);
      
      if (result.success || result._id || result.id || result.data) {
        setSuccess('¡Grupo creado exitosamente!');
        setShowCreateGroup(false);
        setNewGroup({
          name: '',
          code: '',
          careerId: '',
          subjectId: '',
          teacherId: '',
          schedule: '',
          capacity: 30,
          status: 'active'
        });
        
        loadAllData();
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear grupo:", err);
      setError('Error al crear grupo: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Actualizar grupo
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    
    try {
      setLoading(true);
      setError('');

      if (!editGroupForm.name || !editGroupForm.code || !editGroupForm.careerId || !editGroupForm.subjectId) {
        setError('Nombre, código, carrera y materia son obligatorios');
        return;
      }

      const result = await authService.updateUser(selectedGroup._id, editGroupForm);
      console.log("✅ Grupo actualizado:", result);
      
      setSuccess('Grupo actualizado correctamente');
      setShowEditGroup(false);
      setSelectedGroup(null);
      
      loadAllData();
      
    } catch (err: any) {
      console.error("❌ Error al actualizar grupo:", err);
      setError('Error al actualizar grupo: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear tutoría
  const handleCreateTutoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!newTutoria.title || !newTutoria.studentId || !newTutoria.tutorId) {
        setError('Título, estudiante y tutor son obligatorios');
        return;
      }

      const result = await authService.createTutoria(newTutoria);
      console.log("✅ Tutoría creada:", result);
      
      if (result.success || result._id || result.id || result.data) {
        setSuccess('¡Tutoría creada exitosamente!');
        setShowCreateTutoria(false);
        setNewTutoria({
          title: '',
          description: '',
          studentId: '',
          tutorId: '',
          date: '',
          status: 'pendiente'
        });
        
        loadAllData();
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear tutoría:", err);
      setError('Error al crear tutoría: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear capacitación
  const handleCreateCapacitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!newCapacitacion.title || !newCapacitacion.instructorId) {
        setError('Título e instructor son obligatorios');
        return;
      }

      const result = await authService.createCapacitacion(newCapacitacion);
      console.log("✅ Capacitación creada:", result);
      
      if (result.success || result._id || result.id || result.data) {
        setSuccess('¡Capacitación creada exitosamente!');
        setShowCreateCapacitacion(false);
        setNewCapacitacion({
          title: '',
          description: '',
          date: '',
          duration: '2 horas',
          instructorId: '',
          status: 'pendiente'
        });
        
        loadAllData();
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear capacitación:", err);
      setError('Error al crear capacitación: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear alerta
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!newAlert.title || !newAlert.description) {
        setError('Título y descripción son obligatorios');
        return;
      }

      const result = await authService.createAlert(newAlert);
      console.log("✅ Alerta creada:", result);
      
      if (result.success || result._id || result.id || result.data) {
        setSuccess('¡Alerta creada exitosamente!');
        setShowCreateAlert(false);
        setNewAlert({
          title: '',
          description: '',
          priority: 'media',
          type: 'general',
          status: 'pendiente'
        });
        
        loadAllData();
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear alerta:", err);
      setError('Error al crear alerta: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await authService.deleteUser(userId);
        setSuccess('Usuario eliminado correctamente');
        loadAllData();
      } catch (err: any) {
        setError('Error al eliminar usuario: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  // Alternar estado de usuario
  const handleToggleUserStatus = async (userId: string) => {
    try {
      await authService.toggleUserStatus(userId);
      setSuccess('Estado del usuario actualizado');
      loadAllData();
    } catch (err: any) {
      setError('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  // Eliminar carrera
  const handleDeleteCareer = async (careerId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta carrera?')) {
      try {
        await authService.deleteUser(careerId);
        setSuccess('Carrera eliminada correctamente');
        loadAllData();
      } catch (err: any) {
        setError('Error al eliminar carrera: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  // Eliminar materia
  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta materia?')) {
      try {
        await authService.deleteUser(subjectId);
        setSuccess('Materia eliminada correctamente');
        loadAllData();
      } catch (err: any) {
        setError('Error al eliminar materia: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  // Eliminar grupo
  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este grupo?')) {
      try {
        await authService.deleteUser(groupId);
        setSuccess('Grupo eliminado correctamente');
        loadAllData();
      } catch (err: any) {
        setError('Error al eliminar grupo: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  // Generar contraseña aleatoria
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password, confirmPassword: password });
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar carreras
  const filteredCareers = careers.filter(career => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      career.name.toLowerCase().includes(searchLower) ||
      career.code.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar materias
  const filteredSubjects = subjects.filter(subject => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchLower) ||
      subject.code.toLowerCase().includes(searchLower) ||
      subject.careerName?.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar grupos
  const filteredGroups = groups.filter(group => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchLower) ||
      group.code.toLowerCase().includes(searchLower) ||
      group.careerName?.toLowerCase().includes(searchLower) ||
      group.subjectName?.toLowerCase().includes(searchLower) ||
      group.teacherName?.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar tutorías
  const filteredTutorias = tutorias.filter(tutoria => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      tutoria.title.toLowerCase().includes(searchLower) ||
      tutoria.description.toLowerCase().includes(searchLower) ||
      tutoria.studentName?.toLowerCase().includes(searchLower) ||
      tutoria.tutorName?.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar capacitaciones
  const filteredCapacitaciones = capacitaciones.filter(capacitacion => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      capacitacion.title.toLowerCase().includes(searchLower) ||
      capacitacion.description.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      alert.title.toLowerCase().includes(searchLower) ||
      alert.description.toLowerCase().includes(searchLower) ||
      alert.priority.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.type.toLowerCase().includes(searchLower)
    );
  });

  // Obtener estadísticas en tiempo real
  const getStats = () => {
    const totalUsers = users.length;
    const totalCareers = careers.length;
    const totalSubjects = subjects.length;
    const totalGroups = groups.length;
    const totalTeachers = users.filter(u => u.role === 'docente').length;
    const totalStudents = users.filter(u => u.role === 'estudiante').length;
    const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
    
    return {
      totalUsers,
      totalCareers,
      totalSubjects,
      totalGroups,
      totalTeachers,
      totalStudents,
      totalAdmins
    };
  };

  const stats = getStats();

  // Renderizar contenido según la vista actual
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalAdmins} admins, {stats.totalTeachers} docentes, {stats.totalStudents} estudiantes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Carreras</CardTitle>
                  <GraduationCap className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCareers}</div>
                  <p className="text-xs text-muted-foreground">Programas académicos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Materias</CardTitle>
                  <BookOpen className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubjects}</div>
                  <p className="text-xs text-muted-foreground">Asignaturas registradas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Grupos</CardTitle>
                  <UsersIcon className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalGroups}</div>
                  <p className="text-xs text-muted-foreground">Grupos académicos</p>
                </CardContent>
              </Card>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>Gestión del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => setShowCreateUser(true)}
                    disabled={loading}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Nuevo Usuario
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => loadAllData()}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Cargando...' : 'Recargar Datos'}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuarios Recientes</CardTitle>
                  <CardDescription>Últimos registros</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.slice(0, 3).map(user => (
                    <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant={
                        user.role === 'superadmin' ? 'default' :
                        user.role === 'admin' ? 'secondary' :
                        user.role === 'docente' ? 'outline' : 'outline'
                      }>
                        {availableRoles.find(r => r.value === user.role)?.label || user.role}
                      </Badge>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay usuarios registrados
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
                <p className="text-muted-foreground">
                  {users.length} usuarios registrados en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuarios..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateUser(true)}
                  disabled={loading}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>
            </div>

            {loading && users.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando usuarios...</span>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Nombre</th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Rol</th>
                          <th className="text-left p-4 font-medium">Estado</th>
                          <th className="text-left p-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-muted-foreground">
                              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(user => (
                            <tr key={user._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                {user.institutionId && (
                                  <div className="text-xs text-muted-foreground">
                                    Institución: {user.institutionId}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="text-muted-foreground">{user.email}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant={
                                  user.role === 'superadmin' ? 'default' :
                                  user.role === 'admin' ? 'secondary' :
                                  user.role === 'docente' ? 'outline' : 'outline'
                                }>
                                  {availableRoles.find(r => r.value === user.role)?.label || user.role}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                  {user.status || 'active'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Ver detalles"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowUserDetails(true);
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Editar"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowEditUser(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'careers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Carreras</h2>
                <p className="text-muted-foreground">
                  {careers.length} carreras registradas en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar carreras..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateCareer(true)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Carrera
                </Button>
              </div>
            </div>

            {loading && careers.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando carreras...</span>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Nombre</th>
                          <th className="text-left p-4 font-medium">Código</th>
                          <th className="text-left p-4 font-medium">Estado</th>
                          <th className="text-left p-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCareers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center p-8 text-muted-foreground">
                              {searchTerm ? 'No se encontraron carreras' : 'No hay carreras registradas'}
                            </td>
                          </tr>
                        ) : (
                          filteredCareers.map(career => (
                            <tr key={career._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="font-medium">{career.name}</div>
                                {career.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-xs">
                                    {career.description}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="text-muted-foreground">{career.code}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant={career.status === 'active' ? 'default' : 'destructive'}>
                                  {career.status || 'active'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Ver detalles"
                                    onClick={() => {
                                      setSelectedCareer(career);
                                      setShowCareerDetails(true);
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Editar"
                                    onClick={() => {
                                      setSelectedCareer(career);
                                      setShowEditCareer(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
                                    onClick={() => handleDeleteCareer(career._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'subjects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Materias</h2>
                <p className="text-muted-foreground">
                  {subjects.length} materias registradas en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar materias..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateSubject(true)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Materia
                </Button>
              </div>
            </div>

            {loading && subjects.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando materias...</span>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Nombre</th>
                          <th className="text-left p-4 font-medium">Código</th>
                          <th className="text-left p-4 font-medium">Carrera</th>
                          <th className="text-left p-4 font-medium">Semestre</th>
                          <th className="text-left p-4 font-medium">Estado</th>
                          <th className="text-left p-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubjects.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center p-8 text-muted-foreground">
                              {searchTerm ? 'No se encontraron materias' : 'No hay materias registradas'}
                            </td>
                          </tr>
                        ) : (
                          filteredSubjects.map(subject => (
                            <tr key={subject._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="font-medium">{subject.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {subject.credits || 4} créditos
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-muted-foreground">{subject.code}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{subject.careerName || 'Desconocida'}</Badge>
                              </td>
                              <td className="p-4">
                                <div className="text-center">{subject.semester || 1}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant={subject.status === 'active' ? 'default' : 'destructive'}>
                                  {subject.status || 'active'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Ver detalles"
                                    onClick={() => {
                                      setSelectedSubject(subject);
                                      setShowSubjectDetails(true);
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Editar"
                                    onClick={() => {
                                      setSelectedSubject(subject);
                                      setShowEditSubject(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
                                    onClick={() => handleDeleteSubject(subject._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'groups':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Grupos</h2>
                <p className="text-muted-foreground">
                  {groups.length} grupos registrados en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar grupos..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateGroup(true)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nuevo Grupo
                </Button>
              </div>
            </div>

            {loading && groups.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando grupos...</span>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-medium">Nombre</th>
                          <th className="text-left p-4 font-medium">Código</th>
                          <th className="text-left p-4 font-medium">Carrera</th>
                          <th className="text-left p-4 font-medium">Materia</th>
                          <th className="text-left p-4 font-medium">Docente</th>
                          <th className="text-left p-4 font-medium">Estado</th>
                          <th className="text-left p-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGroups.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center p-8 text-muted-foreground">
                              {searchTerm ? 'No se encontraron grupos' : 'No hay grupos registrados'}
                            </td>
                          </tr>
                        ) : (
                          filteredGroups.map(group => (
                            <tr key={group._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="font-medium">{group.name}</div>
                                {group.schedule && (
                                  <div className="text-xs text-muted-foreground">
                                    Horario: {group.schedule}
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="text-muted-foreground">{group.code}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{group.careerName || 'Desconocida'}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{group.subjectName || 'Desconocida'}</Badge>
                              </td>
                              <td className="p-4">
                                <div className="text-sm">{group.teacherName || 'Sin asignar'}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant={group.status === 'active' ? 'default' : 'destructive'}>
                                  {group.status || 'active'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Ver detalles"
                                    onClick={() => {
                                      setSelectedGroup(group);
                                      setShowGroupDetails(true);
                                    }}
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    title="Editar"
                                    onClick={() => {
                                      setSelectedGroup(group);
                                      setShowEditGroup(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
                                    onClick={() => handleDeleteGroup(group._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'tutorias':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Tutorías</h2>
                <p className="text-muted-foreground">
                  {tutorias.length} tutorías registradas en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tutorías..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateTutoria(true)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Tutoría
                </Button>
              </div>
            </div>

            {loading && tutorias.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando tutorías...</span>
              </div>
            ) : (
              <Card>
                <CardContent>
                  {tutorias.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay tutorías registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTutorias.map(tutoria => (
                        <div key={tutoria._id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedTutoria(tutoria);
                            setShowTutoriaDetails(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{tutoria.title || 'Tutoría sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                {tutoria.description || 'Sin descripción'}
                              </div>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                {tutoria.studentName && (
                                  <span>Estudiante: {tutoria.studentName}</span>
                                )}
                                {tutoria.tutorName && (
                                  <span>Tutor: {tutoria.tutorName}</span>
                                )}
                                {tutoria.date && (
                                  <span>Fecha: {new Date(tutoria.date).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <Badge variant={
                              tutoria.status === 'completada' ? 'default' :
                              tutoria.status === 'en_proceso' ? 'secondary' :
                              'outline'
                            }>
                              {tutoria.status || 'pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'capacitaciones':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Capacitaciones</h2>
                <p className="text-muted-foreground">
                  {capacitaciones.length} capacitaciones registradas en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar capacitaciones..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateCapacitacion(true)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Capacitación
                </Button>
              </div>
            </div>

            {loading && capacitaciones.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando capacitaciones...</span>
              </div>
            ) : (
              <Card>
                <CardContent>
                  {capacitaciones.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay capacitaciones registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCapacitaciones.map(capacitacion => (
                        <div key={capacitacion._id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedCapacitacion(capacitacion);
                            setShowCapacitacionDetails(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{capacitacion.title || 'Capacitación sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                {capacitacion.description || 'Sin descripción'}
                              </div>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                {capacitacion.date && (
                                  <span>Fecha: {new Date(capacitacion.date).toLocaleDateString()}</span>
                                )}
                                {capacitacion.duration && (
                                  <span>Duración: {capacitacion.duration}</span>
                                )}
                              </div>
                            </div>
                            <Badge variant={
                              capacitacion.status === 'completada' ? 'default' :
                              capacitacion.status === 'en_proceso' ? 'secondary' :
                              'outline'
                            }>
                              {capacitacion.status || 'pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Gestión de Alertas</h2>
                <p className="text-muted-foreground">
                  {alerts.length} alertas registradas en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alertas..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => setShowCreateAlert(true)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Alerta
                </Button>
              </div>
            </div>

            {loading && alerts.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando alertas...</span>
              </div>
            ) : (
              <Card>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay alertas registradas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAlerts.map(alert => (
                        <div key={alert._id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertDetails(true);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{alert.title || 'Alerta sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                {alert.description || 'Sin descripción'}
                              </div>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Prioridad: {alert.priority || 'media'}</span>
                                {alert.createdAt && (
                                  <span>Fecha: {new Date(alert.createdAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <Badge variant={
                              alert.status === 'resuelta' ? 'default' :
                              alert.priority === 'alta' ? 'destructive' :
                              alert.priority === 'media' ? 'outline' :
                              'secondary'
                            }>
                              {alert.status || 'pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Reportes del Sistema</h2>
                <p className="text-muted-foreground">
                  {reports.length} reportes generados en el sistema
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar reportes..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
              </div>
            </div>

            {loading && reports.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3">Cargando reportes...</span>
              </div>
            ) : (
              <Card>
                <CardContent>
                  {reports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay reportes generados
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredReports.map(report => (
                        <div key={report._id} className="p-4 border rounded-lg hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{report.title || 'Reporte sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                Tipo: {report.type || 'general'} | Generado: {new Date(report.generatedAt).toLocaleDateString() || 'Desconocido'}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

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
      />
      
      <div className="flex-1 overflow-auto ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Super Administración</h1>
              <p className="text-muted-foreground">Sistema Metricampus - Panel de Control</p>
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
            </div>
          </div>
        </header>

        {/* Mensajes */}
        {(error || success) && (
          <div className="px-6 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Contenido */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {/* Modal para crear usuario */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nuevo Usuario</h3>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowCreateUser(false);
                  setError('');
                  setSuccess('');
                }}>×</Button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      required
                      placeholder="Juan"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      required
                      placeholder="Pérez"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="usuario@institucion.edu"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generatePassword}
                      disabled={loading}
                      className="text-xs h-7"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Generar
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                    placeholder="Repite la contraseña"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <select
                    id="role"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    required
                    disabled={loading}
                  >
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutionId">Institución (Opcional)</Label>
                  <Input
                    id="institutionId"
                    value={newUser.institutionId}
                    onChange={(e) => setNewUser({...newUser, institutionId: e.target.value})}
                    placeholder="ID de la institución"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Dejar vacío si no tiene institución asignada</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value as "active" | "inactive"})}
                    disabled={loading}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateUser(false);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Usuario'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del usuario */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Detalles del Usuario</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h4>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                      <p className="text-lg">{selectedUser.firstName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                      <p className="text-lg">{selectedUser.lastName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
                    <div className="mt-1">
                      <Badge variant="default" className="text-base px-3 py-1">
                        {availableRoles.find(r => r.value === selectedUser.role)?.label || selectedUser.role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedUser.status === 'active' ? 'default' : 'destructive'}
                        className="text-base px-3 py-1 gap-2"
                      >
                        {selectedUser.status === 'active' ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedUser.institutionId && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Institución</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg">{selectedUser.institutionId}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.createdAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de registro</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 space-y-3">
                  <Button 
                    onClick={() => {
                      setShowUserDetails(false);
                      setShowEditUser(true);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Usuario
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleToggleUserStatus(selectedUser._id)}
                    className="w-full"
                  >
                    {selectedUser.status === 'active' ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Desactivar Usuario
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activar Usuario
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Editar Usuario</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowEditUser(false);
                    setSelectedUser(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">Nombre *</Label>
                    <Input
                      id="editFirstName"
                      value={editUserForm.firstName}
                      onChange={(e) => setEditUserForm({...editUserForm, firstName: e.target.value})}
                      required
                      placeholder="Juan"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Apellido *</Label>
                    <Input
                      id="editLastName"
                      value={editUserForm.lastName}
                      onChange={(e) => setEditUserForm({...editUserForm, lastName: e.target.value})}
                      required
                      placeholder="Pérez"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                    placeholder="usuario@institucion.edu"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editRole">Rol *</Label>
                  <select
                    id="editRole"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                    required
                    disabled={loading}
                  >
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editInstitutionId">Institución (Opcional)</Label>
                  <Input
                    id="editInstitutionId"
                    value={editUserForm.institutionId}
                    onChange={(e) => setEditUserForm({...editUserForm, institutionId: e.target.value})}
                    placeholder="ID de la institución"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">Dejar vacío si no tiene institución asignada</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStatus">Estado *</Label>
                  <select
                    id="editStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({...editUserForm, status: e.target.value as "active" | "inactive"})}
                    required
                    disabled={loading}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEditUser(false);
                      setSelectedUser(null);
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : 'Actualizar Usuario'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear carrera */}
      {showCreateCareer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nueva Carrera</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateCareer(false)}>×</Button>
              </div>
              
              <form onSubmit={handleCreateCareer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="careerName">Nombre *</Label>
                  <Input
                    id="careerName"
                    value={newCareer.name}
                    onChange={(e) => setNewCareer({...newCareer, name: e.target.value})}
                    required
                    placeholder="Ingeniería en Sistemas"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerCode">Código *</Label>
                  <Input
                    id="careerCode"
                    value={newCareer.code}
                    onChange={(e) => setNewCareer({...newCareer, code: e.target.value})}
                    required
                    placeholder="IS-2024"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerDescription">Descripción</Label>
                  <textarea
                    id="careerDescription"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                    value={newCareer.description}
                    onChange={(e) => setNewCareer({...newCareer, description: e.target.value})}
                    placeholder="Descripción de la carrera..."
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerDuration">Duración (semestres)</Label>
                  <Input
                    id="careerDuration"
                    type="number"
                    min="1"
                    max="12"
                    value={newCareer.duration}
                    onChange={(e) => setNewCareer({...newCareer, duration: parseInt(e.target.value)})}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="careerStatus">Estado</Label>
                  <select
                    id="careerStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newCareer.status}
                    onChange={(e) => setNewCareer({...newCareer, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateCareer(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Carrera'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles de la carrera */}
      {showCareerDetails && selectedCareer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Detalles de la Carrera</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowCareerDetails(false);
                    setSelectedCareer(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{selectedCareer.name}</h4>
                    <p className="text-muted-foreground">Código: {selectedCareer.code}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código</Label>
                    <p className="text-lg font-mono">{selectedCareer.code}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedCareer.status === 'active' ? 'default' : 'destructive'}
                        className="text-base px-3 py-1 gap-2"
                      >
                        {selectedCareer.status === 'active' ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Activa
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Inactiva
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedCareer.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                      <p className="mt-1 text-foreground">{selectedCareer.description}</p>
                    </div>
                  )}
                  
                  {selectedCareer.duration && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Duración</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p>{selectedCareer.duration} semestres</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedCareer.createdAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{new Date(selectedCareer.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6">
                  <Button 
                    onClick={() => {
                      setShowCareerDetails(false);
                      setShowEditCareer(true);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Carrera
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar carrera */}
      {showEditCareer && selectedCareer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Editar Carrera</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowEditCareer(false);
                    setSelectedCareer(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={handleUpdateCareer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editCareerName">Nombre *</Label>
                  <Input
                    id="editCareerName"
                    value={editCareerForm.name}
                    onChange={(e) => setEditCareerForm({...editCareerForm, name: e.target.value})}
                    required
                    placeholder="Ingeniería en Sistemas"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCareerCode">Código *</Label>
                  <Input
                    id="editCareerCode"
                    value={editCareerForm.code}
                    onChange={(e) => setEditCareerForm({...editCareerForm, code: e.target.value})}
                    required
                    placeholder="IS-2024"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCareerDescription">Descripción</Label>
                  <textarea
                    id="editCareerDescription"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                    value={editCareerForm.description}
                    onChange={(e) => setEditCareerForm({...editCareerForm, description: e.target.value})}
                    placeholder="Descripción de la carrera..."
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCareerDuration">Duración (semestres)</Label>
                  <Input
                    id="editCareerDuration"
                    type="number"
                    min="1"
                    max="12"
                    value={editCareerForm.duration}
                    onChange={(e) => setEditCareerForm({...editCareerForm, duration: parseInt(e.target.value)})}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCareerStatus">Estado</Label>
                  <select
                    id="editCareerStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editCareerForm.status}
                    onChange={(e) => setEditCareerForm({...editCareerForm, status: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEditCareer(false);
                      setSelectedCareer(null);
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : 'Actualizar Carrera'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear materia */}
      {showCreateSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nueva Materia</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateSubject(false)}>×</Button>
              </div>
              
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Nombre *</Label>
                  <Input
                    id="subjectName"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    required
                    placeholder="Cálculo Diferencial"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjectCode">Código *</Label>
                  <Input
                    id="subjectCode"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                    required
                    placeholder="CAL-101"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjectCareerId">Carrera *</Label>
                  <select
                    id="subjectCareerId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newSubject.careerId}
                    onChange={(e) => setNewSubject({...newSubject, careerId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar carrera</option>
                    {careers.map(career => (
                      <option key={career._id} value={career._id}>
                        {career.name} ({career.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjectCredits">Créditos</Label>
                    <Input
                      id="subjectCredits"
                      type="number"
                      min="1"
                      max="12"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value)})}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectSemester">Semestre</Label>
                    <Input
                      id="subjectSemester"
                      type="number"
                      min="1"
                      max="12"
                      value={newSubject.semester}
                      onChange={(e) => setNewSubject({...newSubject, semester: parseInt(e.target.value)})}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjectStatus">Estado</Label>
                  <select
                    id="subjectStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newSubject.status}
                    onChange={(e) => setNewSubject({...newSubject, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateSubject(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Materia'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles de la materia */}
      {showSubjectDetails && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Detalles de la Materia</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowSubjectDetails(false);
                    setSelectedSubject(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Book className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{selectedSubject.name}</h4>
                    <p className="text-muted-foreground">Código: {selectedSubject.code}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código</Label>
                    <p className="text-lg font-mono">{selectedSubject.code}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Carrera</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedSubject.careerName || 'Desconocida'}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Semestre</Label>
                    <p className="text-lg">{selectedSubject.semester || 1}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Créditos</Label>
                    <p className="text-lg">{selectedSubject.credits || 4}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedSubject.status === 'active' ? 'default' : 'destructive'}
                        className="text-base px-3 py-1 gap-2"
                      >
                        {selectedSubject.status === 'active' ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedSubject.createdAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{new Date(selectedSubject.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6">
                  <Button 
                    onClick={() => {
                      setShowSubjectDetails(false);
                      setShowEditSubject(true);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Materia
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar materia */}
      {showEditSubject && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Editar Materia</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowEditSubject(false);
                    setSelectedSubject(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={handleUpdateSubject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editSubjectName">Nombre *</Label>
                  <Input
                    id="editSubjectName"
                    value={editSubjectForm.name}
                    onChange={(e) => setEditSubjectForm({...editSubjectForm, name: e.target.value})}
                    required
                    placeholder="Cálculo Diferencial"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSubjectCode">Código *</Label>
                  <Input
                    id="editSubjectCode"
                    value={editSubjectForm.code}
                    onChange={(e) => setEditSubjectForm({...editSubjectForm, code: e.target.value})}
                    required
                    placeholder="CAL-101"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSubjectCareerId">Carrera *</Label>
                  <select
                    id="editSubjectCareerId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editSubjectForm.careerId}
                    onChange={(e) => setEditSubjectForm({...editSubjectForm, careerId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar carrera</option>
                    {careers.map(career => (
                      <option key={career._id} value={career._id}>
                        {career.name} ({career.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSubjectCredits">Créditos</Label>
                    <Input
                      id="editSubjectCredits"
                      type="number"
                      min="1"
                      max="12"
                      value={editSubjectForm.credits}
                      onChange={(e) => setEditSubjectForm({...editSubjectForm, credits: parseInt(e.target.value)})}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editSubjectSemester">Semestre</Label>
                    <Input
                      id="editSubjectSemester"
                      type="number"
                      min="1"
                      max="12"
                      value={editSubjectForm.semester}
                      onChange={(e) => setEditSubjectForm({...editSubjectForm, semester: parseInt(e.target.value)})}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSubjectStatus">Estado</Label>
                  <select
                    id="editSubjectStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editSubjectForm.status}
                    onChange={(e) => setEditSubjectForm({...editSubjectForm, status: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEditSubject(false);
                      setSelectedSubject(null);
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : 'Actualizar Materia'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear grupo */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nuevo Grupo</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateGroup(false)}>×</Button>
              </div>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Nombre *</Label>
                  <Input
                    id="groupName"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    required
                    placeholder="Grupo A - Mañana"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupCode">Código *</Label>
                  <Input
                    id="groupCode"
                    value={newGroup.code}
                    onChange={(e) => setNewGroup({...newGroup, code: e.target.value})}
                    required
                    placeholder="GRP-A-MAN"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupCareerId">Carrera *</Label>
                  <select
                    id="groupCareerId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newGroup.careerId}
                    onChange={(e) => setNewGroup({...newGroup, careerId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar carrera</option>
                    {careers.map(career => (
                      <option key={career._id} value={career._id}>
                        {career.name} ({career.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupSubjectId">Materia *</Label>
                  <select
                    id="groupSubjectId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newGroup.subjectId}
                    onChange={(e) => setNewGroup({...newGroup, subjectId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar materia</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupTeacherId">Docente (Opcional)</Label>
                  <select
                    id="groupTeacherId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newGroup.teacherId}
                    onChange={(e) => setNewGroup({...newGroup, teacherId: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Seleccionar docente</option>
                    {users.filter(user => user.role === 'docente').map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupSchedule">Horario</Label>
                  <Input
                    id="groupSchedule"
                    value={newGroup.schedule}
                    onChange={(e) => setNewGroup({...newGroup, schedule: e.target.value})}
                    placeholder="Lunes y Miércoles 8:00-10:00"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupCapacity">Capacidad</Label>
                  <Input
                    id="groupCapacity"
                    type="number"
                    min="1"
                    max="100"
                    value={newGroup.capacity}
                    onChange={(e) => setNewGroup({...newGroup, capacity: parseInt(e.target.value)})}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupStatus">Estado</Label>
                  <select
                    id="groupStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newGroup.status}
                    onChange={(e) => setNewGroup({...newGroup, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateGroup(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Grupo'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del grupo */}
      {showGroupDetails && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Detalles del Grupo</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowGroupDetails(false);
                    setSelectedGroup(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{selectedGroup.name}</h4>
                    <p className="text-muted-foreground">Código: {selectedGroup.code}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código</Label>
                    <p className="text-lg font-mono">{selectedGroup.code}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Carrera</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedGroup.careerName || 'Desconocida'}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Materia</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedGroup.subjectName || 'Desconocida'}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Docente</Label>
                    <p className="mt-1">{selectedGroup.teacherName || 'Sin asignar'}</p>
                  </div>
                  
                  {selectedGroup.schedule && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Horario</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p>{selectedGroup.schedule}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedGroup.capacity && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Capacidad</Label>
                      <p className="text-lg">{selectedGroup.capacity} estudiantes</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedGroup.status === 'active' ? 'default' : 'destructive'}
                        className="text-base px-3 py-1 gap-2"
                      >
                        {selectedGroup.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedGroup.createdAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p>{new Date(selectedGroup.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6">
                  <Button 
                    onClick={() => {
                      setShowGroupDetails(false);
                      setShowEditGroup(true);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Grupo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar grupo */}
      {showEditGroup && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Editar Grupo</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowEditGroup(false);
                    setSelectedGroup(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editGroupName">Nombre *</Label>
                  <Input
                    id="editGroupName"
                    value={editGroupForm.name}
                    onChange={(e) => setEditGroupForm({...editGroupForm, name: e.target.value})}
                    required
                    placeholder="Grupo A - Mañana"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupCode">Código *</Label>
                  <Input
                    id="editGroupCode"
                    value={editGroupForm.code}
                    onChange={(e) => setEditGroupForm({...editGroupForm, code: e.target.value})}
                    required
                    placeholder="GRP-A-MAN"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupCareerId">Carrera *</Label>
                  <select
                    id="editGroupCareerId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editGroupForm.careerId}
                    onChange={(e) => setEditGroupForm({...editGroupForm, careerId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar carrera</option>
                    {careers.map(career => (
                      <option key={career._id} value={career._id}>
                        {career.name} ({career.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupSubjectId">Materia *</Label>
                  <select
                    id="editGroupSubjectId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editGroupForm.subjectId}
                    onChange={(e) => setEditGroupForm({...editGroupForm, subjectId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar materia</option>
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupTeacherId">Docente (Opcional)</Label>
                  <select
                    id="editGroupTeacherId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editGroupForm.teacherId}
                    onChange={(e) => setEditGroupForm({...editGroupForm, teacherId: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Seleccionar docente</option>
                    {users.filter(user => user.role === 'docente').map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupSchedule">Horario</Label>
                  <Input
                    id="editGroupSchedule"
                    value={editGroupForm.schedule}
                    onChange={(e) => setEditGroupForm({...editGroupForm, schedule: e.target.value})}
                    placeholder="Lunes y Miércoles 8:00-10:00"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupCapacity">Capacidad</Label>
                  <Input
                    id="editGroupCapacity"
                    type="number"
                    min="1"
                    max="100"
                    value={editGroupForm.capacity}
                    onChange={(e) => setEditGroupForm({...editGroupForm, capacity: parseInt(e.target.value)})}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editGroupStatus">Estado</Label>
                  <select
                    id="editGroupStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={editGroupForm.status}
                    onChange={(e) => setEditGroupForm({...editGroupForm, status: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowEditGroup(false);
                      setSelectedGroup(null);
                    }}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : 'Actualizar Grupo'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear tutoría */}
      {showCreateTutoria && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nueva Tutoría</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateTutoria(false)}>×</Button>
              </div>
              
              <form onSubmit={handleCreateTutoria} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tutoriaTitle">Título *</Label>
                  <Input
                    id="tutoriaTitle"
                    value={newTutoria.title}
                    onChange={(e) => setNewTutoria({...newTutoria, title: e.target.value})}
                    required
                    placeholder="Tutoría de Matemáticas"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutoriaDescription">Descripción</Label>
                  <textarea
                    id="tutoriaDescription"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                    value={newTutoria.description}
                    onChange={(e) => setNewTutoria({...newTutoria, description: e.target.value})}
                    placeholder="Descripción de la tutoría..."
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutoriaStudentId">Estudiante *</Label>
                  <select
                    id="tutoriaStudentId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newTutoria.studentId}
                    onChange={(e) => setNewTutoria({...newTutoria, studentId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar estudiante</option>
                    {users.filter(user => user.role === 'estudiante').map(student => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutoriaTutorId">Tutor *</Label>
                  <select
                    id="tutoriaTutorId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newTutoria.tutorId}
                    onChange={(e) => setNewTutoria({...newTutoria, tutorId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar tutor</option>
                    {users.filter(user => user.role === 'tutor' || user.role === 'docente').map(tutor => (
                      <option key={tutor._id} value={tutor._id}>
                        {tutor.firstName} {tutor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutoriaDate">Fecha</Label>
                  <Input
                    id="tutoriaDate"
                    type="datetime-local"
                    value={newTutoria.date}
                    onChange={(e) => setNewTutoria({...newTutoria, date: e.target.value})}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutoriaStatus">Estado</Label>
                  <select
                    id="tutoriaStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newTutoria.status}
                    onChange={(e) => setNewTutoria({...newTutoria, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateTutoria(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Tutoría'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear capacitación */}
      {showCreateCapacitacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nueva Capacitación</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateCapacitacion(false)}>×</Button>
              </div>
              
              <form onSubmit={handleCreateCapacitacion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacitacionTitle">Título *</Label>
                  <Input
                    id="capacitacionTitle"
                    value={newCapacitacion.title}
                    onChange={(e) => setNewCapacitacion({...newCapacitacion, title: e.target.value})}
                    required
                    placeholder="Capacitación en Metodologías Activas"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacitacionDescription">Descripción</Label>
                  <textarea
                    id="capacitacionDescription"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                    value={newCapacitacion.description}
                    onChange={(e) => setNewCapacitacion({...newCapacitacion, description: e.target.value})}
                    placeholder="Descripción de la capacitación..."
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacitacionInstructorId">Instructor *</Label>
                  <select
                    id="capacitacionInstructorId"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newCapacitacion.instructorId}
                    onChange={(e) => setNewCapacitacion({...newCapacitacion, instructorId: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Seleccionar instructor</option>
                    {users.filter(user => user.role === 'docente' || user.role === 'desarrollo-academico').map(instructor => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacitacionDate">Fecha</Label>
                  <Input
                    id="capacitacionDate"
                    type="datetime-local"
                    value={newCapacitacion.date}
                    onChange={(e) => setNewCapacitacion({...newCapacitacion, date: e.target.value})}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacitacionDuration">Duración</Label>
                  <Input
                    id="capacitacionDuration"
                    value={newCapacitacion.duration}
                    onChange={(e) => setNewCapacitacion({...newCapacitacion, duration: e.target.value})}
                    placeholder="2 horas"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacitacionStatus">Estado</Label>
                  <select
                    id="capacitacionStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newCapacitacion.status}
                    onChange={(e) => setNewCapacitacion({...newCapacitacion, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateCapacitacion(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Capacitación'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear alerta */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Crear Nueva Alerta</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateAlert(false)}>×</Button>
              </div>
              
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alertTitle">Título *</Label>
                  <Input
                    id="alertTitle"
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                    required
                    placeholder="Alerta de rendimiento académico"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertDescription">Descripción *</Label>
                  <textarea
                    id="alertDescription"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({...newAlert, description: e.target.value})}
                    placeholder="Descripción detallada de la alerta..."
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertPriority">Prioridad</Label>
                  <select
                    id="alertPriority"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newAlert.priority}
                    onChange={(e) => setNewAlert({...newAlert, priority: e.target.value})}
                    disabled={loading}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertType">Tipo</Label>
                  <select
                    id="alertType"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                    disabled={loading}
                  >
                    <option value="general">General</option>
                    <option value="academica">Académica</option>
                    <option value="comportamiento">Comportamiento</option>
                    <option value="tecnica">Técnica</option>
                    <option value="seguridad">Seguridad</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertStatus">Estado</Label>
                  <select
                    id="alertStatus"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={newAlert.status}
                    onChange={(e) => setNewAlert({...newAlert, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En Revisión</option>
                    <option value="resuelta">Resuelta</option>
                    <option value="cerrada">Cerrada</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateAlert(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : 'Crear Alerta'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modales para ver detalles de tutorías, capacitaciones y alertas seguirían la misma estructura */}
    </div>
  );
}