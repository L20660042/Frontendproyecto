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
  PlusCircle
} from 'lucide-react';
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
}

interface Career {
  _id: string;
  name: string;
  code: string;
  status: string;
  createdAt?: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  careerId: string;
  careerName?: string;
  status: string;
  createdAt?: string;
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
}

export default function SuperAdminDashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tutorias, setTutorias] = useState<any[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modales
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [, setShowCreateCareer] = useState(false);
  const [, setShowCreateSubject] = useState(false);
  const [, setShowCreateGroup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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

  // Formulario nueva carrera
  const [] = useState({
    name: '',
    code: '',
    status: 'active'
  });

  // Formulario nueva materia
  const [] = useState({
    name: '',
    code: '',
    careerId: '',
    status: 'active'
  });

  // Formulario nuevo grupo
  const [] = useState({
    name: '',
    code: '',
    careerId: '',
    subjectId: '',
    teacherId: '',
    status: 'active'
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

  // Cargar todos los datos - CORREGIDO
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
          groups: user.groups || []
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
          groups: user.groups || []
        }));
        setUsers(formattedUsers);
      }
      
      // Cargar carreras
      try {
        const careersResponse = await authService.getCareers();
        console.log("📊 Carreras response:", careersResponse);
        
        if (careersResponse.success && Array.isArray(careersResponse.data)) {
          setCareers(careersResponse.data);
        } else if (Array.isArray(careersResponse)) {
          setCareers(careersResponse);
        } else if (careersResponse.data && Array.isArray(careersResponse.data)) {
          setCareers(careersResponse.data);
        }
      } catch (err) {
        console.log("⚠️ Carreras endpoint no disponible aún");
      }
      
      // Cargar materias
      try {
        const subjectsResponse = await authService.getSubjects();
        console.log("📊 Materias response:", subjectsResponse);
        
        if (subjectsResponse.success && Array.isArray(subjectsResponse.data)) {
          const subjectsWithCareerName = subjectsResponse.data.map((subject: any) => ({
            ...subject,
            careerName: careers.find(c => c._id === subject.careerId)?.name || 'Desconocida'
          }));
          setSubjects(subjectsWithCareerName);
        } else if (Array.isArray(subjectsResponse)) {
          setSubjects(subjectsResponse);
        } else if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
          setSubjects(subjectsResponse.data);
        }
      } catch (err) {
        console.log("⚠️ Subjects endpoint no disponible aún");
      }
      
      // Cargar grupos
      try {
        const groupsResponse = await authService.getGroups();
        console.log("📊 Grupos response:", groupsResponse);
        
        if (groupsResponse.success && Array.isArray(groupsResponse.data)) {
          const groupsWithDetails = groupsResponse.data.map((group: any) => ({
            ...group,
            careerName: careers.find(c => c._id === group.careerId)?.name || 'Desconocida',
            subjectName: subjects.find(s => s._id === group.subjectId)?.name || 'Desconocida',
            teacherName: users.find(u => u._id === group.teacherId)?.fullName || 'Sin asignar'
          }));
          setGroups(groupsWithDetails);
        } else if (Array.isArray(groupsResponse)) {
          setGroups(groupsResponse);
        } else if (groupsResponse.data && Array.isArray(groupsResponse.data)) {
          setGroups(groupsResponse.data);
        }
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

  // Crear carrera

  // Crear materia

  // Crear grupo

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
                                  <Button size="sm" variant="ghost" title="Ver detalles">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
                                    onClick={async () => {
                                      if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
                                        try {
                                          await authService.deleteUser(user._id);
                                          loadAllData();
                                          setSuccess('Usuario eliminado correctamente');
                                        } catch (err) {
                                          setError('Error al eliminar usuario');
                                        }
                                      }
                                    }}
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
                                  <Button size="sm" variant="ghost" title="Ver detalles">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
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
                          <th className="text-left p-4 font-medium">Estado</th>
                          <th className="text-left p-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubjects.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-muted-foreground">
                              {searchTerm ? 'No se encontraron materias' : 'No hay materias registradas'}
                            </td>
                          </tr>
                        ) : (
                          filteredSubjects.map(subject => (
                            <tr key={subject._id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="font-medium">{subject.name}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-muted-foreground">{subject.code}</div>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{subject.careerName || 'Desconocida'}</Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={subject.status === 'active' ? 'default' : 'destructive'}>
                                  {subject.status || 'active'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" title="Ver detalles">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
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
                                  <Button size="sm" variant="ghost" title="Ver detalles">
                                    <EyeIcon className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-destructive" 
                                    title="Eliminar"
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
                <Button disabled={loading}>
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
                      {tutorias.map(tutoria => (
                        <div key={tutoria._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{tutoria.title || 'Tutoría sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                {tutoria.description || 'Sin descripción'}
                              </div>
                            </div>
                            <Badge variant="outline">
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
                <Button disabled={loading}>
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
                      {capacitaciones.map(capacitacion => (
                        <div key={capacitacion._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{capacitacion.title || 'Capacitación sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                {capacitacion.description || 'Sin descripción'}
                              </div>
                            </div>
                            <Badge variant="outline">
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
                <Button disabled={loading}>
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
                      {alerts.map(alert => (
                        <div key={alert._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{alert.title || 'Alerta sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                {alert.description || 'Sin descripción'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Prioridad: {alert.priority || 'media'}
                              </div>
                            </div>
                            <Badge variant={alert.status === 'resolved' ? 'default' : 'destructive'}>
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
                      {reports.map(report => (
                        <div key={report._id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{report.title || 'Reporte sin título'}</div>
                              <div className="text-sm text-muted-foreground">
                                Tipo: {report.type || 'general'} | Generado: {report.generatedAt || 'Desconocido'}
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
        {/* Header - SIN BOTÓN DE CERRAR SESIÓN */}
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
    </div>
  );
}