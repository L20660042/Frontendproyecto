import { useState, useEffect } from 'react';
import { DynamicSidebar } from '../../components/Sidebar';
import { Alert, AlertDescription } from '../../components/alert';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Shield, RefreshCw, X, Check } from 'lucide-react';
import { authService } from '../../services/authService';

// Importar componentes
import StatsCards from '../../components/commons/StatsCards';
import QuickActions from '../../components/commons/QuickActions';
import RecentUsers from '../../components/commons/RecentUsers';
import UsersTable from '../../components/users/UsersTable';
import CareersTable from '../../components/careers/CareersTable';
import SubjectsTable from '../../components/subjects/SubjectsTable';
import GroupsTable from '../../components/groups/GroupsTable';

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

export default function SuperAdminDashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  
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
  
  // Estados para modales
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCareer, setShowCreateCareer] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCareerDetails, setShowCareerDetails] = useState(false);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  
  const [showEditUser, setShowEditUser] = useState(false);
  const [showEditCareer, setShowEditCareer] = useState(false);
  const [showEditSubject, setShowEditSubject] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);

  // Cargar datos
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
        setInfoMessage('Algunos endpoints pueden no estar disponibles todavía');
      }
      
      // Cargar materias
      try {
        console.log("📥 Intentando cargar materias...");
        const subjectsResponse = await authService.getSubjects();
        let subjectsData: Subject[] = [];
        
        console.log("📊 Subjects response:", subjectsResponse);
        
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
        // No mostrar error si el endpoint no está disponible
      }
      
      // Cargar grupos - CORREGIDO
      try {
        console.log("📥 Intentando cargar grupos...");
        const groupsResponse = await authService.getGroups();
        let groupsData: Group[] = [];
        
        console.log("📊 Groups response:", groupsResponse);
        
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
      
      console.log("✅ Todos los datos cargados exitosamente");
      
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      setError(`Error al cargar datos: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

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

  // Handlers para grupos - CORREGIDOS
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
            <StatsCards 
              users={users}
              careers={careers}
              subjects={subjects}
              groups={groups}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActions 
                onCreateUser={() => setShowCreateUser(true)}
                onRefresh={loadAllData}
                loading={loading}
              />
              
              <RecentUsers users={users} />
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
    </div>
  );
}