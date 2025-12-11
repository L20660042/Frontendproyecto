import {
  BarChart3,
  BookOpen,
  Users,
  User,
  LogOut,
  Building,
  TrendingUp,
  Home,
  GraduationCap,
  FileText,
  UsersIcon,
  Award,
  FolderTree,
  Calendar,
  MessageSquare,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from './button';
// OJO: ajusta este import según tu estructura real
import { cn } from '../components/lib/utils';
import logo from '../assets/image.png';
import { authService } from '../services/authService';
import { useEffect, useState } from 'react';

interface SidebarProps {
  userRole: string;
  userName?: string;
  userEmail?: string;
  onNavigate?: (view: string) => void;
  currentView?: string;
  alertsCount?: number;
}

type MenuItem = {
  icon: any;
  label: string;
  view: string;
  badge?: number;
};

// Menú por rol
const menuItems: Record<string, MenuItem[]> = {
  superadmin: [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: Users, label: 'Usuarios', view: 'users' },
    { icon: GraduationCap, label: 'Carreras', view: 'careers' },
    { icon: BookOpen, label: 'Materias', view: 'subjects' },
    { icon: UsersIcon, label: 'Grupos', view: 'groups' },
    { icon: FileSpreadsheet, label: 'Importar Excel', view: 'excel' },
    { icon: FolderTree, label: 'Tutorías', view: 'tutorias' },
    { icon: Award, label: 'Capacitaciones', view: 'capacitaciones' },
    { icon: AlertTriangle, label: 'Alertas', view: 'alerts' },
    { icon: FileText, label: 'Reportes', view: 'reports' },
  ],
  admin: [
    { icon: Home, label: 'Inicio', view: 'dashboard' },
    { icon: Users, label: 'Estudiantes', view: 'estudiantes' },
    { icon: GraduationCap, label: 'Docentes', view: 'docentes' },
    { icon: BookOpen, label: 'Materias', view: 'materias' },
    { icon: BarChart3, label: 'Dashboard', view: 'admin-dashboard' },
    { icon: FileText, label: 'Catálogos', view: 'catalogos' },
    { icon: AlertTriangle, label: 'Alertas', view: 'alerts' },
    { icon: User, label: 'Perfil', view: 'perfil' },
  ],
  docente: [
    { icon: Home, label: 'Dashboard', view: 'dashboard' },
    { icon: BookOpen, label: 'Mis Materias', view: 'materias' },
    { icon: Users, label: 'Mis Estudiantes', view: 'estudiantes' },
    { icon: MessageSquare, label: 'Tutorías', view: 'tutorias' },
    { icon: BarChart3, label: 'Evaluación Docente', view: 'evaluacion' },
    { icon: AlertTriangle, label: 'Mis Alertas', view: 'alerts' },
    { icon: FileText, label: 'Mis Reportes', view: 'reportes' },
    { icon: User, label: 'Mi Perfil', view: 'perfil' },
  ],
  estudiante: [
    { icon: Home, label: 'Inicio', view: 'inicio' },
    { icon: BookOpen, label: 'Mis Materias', view: 'materias' },
    { icon: BarChart3, label: 'Mi Rendimiento', view: 'rendimiento' },
    { icon: GraduationCap, label: 'Mis Calificaciones', view: 'calificaciones' },
    { icon: Calendar, label: 'Horario', view: 'horario' },
    { icon: MessageSquare, label: 'Tutorías', view: 'tutorias' },
    { icon: User, label: 'Perfil', view: 'perfil' },
  ],
  'jefe-academico': [
    { icon: Home, label: 'Inicio', view: 'inicio' },
    { icon: BarChart3, label: 'Dashboard', view: 'dashboard' },
    { icon: Users, label: 'Docentes', view: 'docentes' },
    { icon: BookOpen, label: 'Materias', view: 'materias' },
    { icon: AlertTriangle, label: 'Alertas', view: 'alerts' },
    { icon: Building, label: 'Institución', view: 'institucion' },
    { icon: TrendingUp, label: 'Indicadores', view: 'indicadores' },
    { icon: User, label: 'Perfil', view: 'perfil' },
  ],
  tutor: [
    { icon: Home, label: 'Inicio', view: 'inicio' },
    { icon: Users, label: 'Mis Estudiantes', view: 'estudiantes' },
    { icon: AlertTriangle, label: 'Alertas', view: 'alerts' },
    { icon: MessageSquare, label: 'Tutorías', view: 'tutorias' },
    { icon: BarChart3, label: 'Seguimiento', view: 'seguimiento' },
    { icon: FileText, label: 'Reportes', view: 'reportes' },
    { icon: User, label: 'Perfil', view: 'perfil' },
  ],
  psicopedagogico: [
    { icon: Home, label: 'Inicio', view: 'inicio' },
    { icon: Users, label: 'Alumnos en Riesgo', view: 'riesgo' },
    { icon: AlertTriangle, label: 'Alertas', view: 'alerts' },
    { icon: BarChart3, label: 'Estadísticas', view: 'estadisticas' },
    { icon: MessageSquare, label: 'Tutorías', view: 'tutorias' },
    { icon: FileText, label: 'Reportes', view: 'reportes' },
    { icon: User, label: 'Perfil', view: 'perfil' },
  ],
  'desarrollo-academico': [
    { icon: Home, label: 'Inicio', view: 'inicio' },
    { icon: GraduationCap, label: 'Capacitaciones', view: 'capacitaciones' },
    { icon: Users, label: 'Docentes', view: 'docentes' },
    { icon: BarChart3, label: 'Evaluación', view: 'evaluacion' },
    { icon: AlertTriangle, label: 'Alertas', view: 'alerts' },
    { icon: FileText, label: 'Programas', view: 'programas' },
    { icon: User, label: 'Perfil', view: 'perfil' },
  ],
};

const userRoleLabels: Record<string, string> = {
  superadmin: 'Super Administrador',
  admin: 'Administrador',
  docente: 'Panel Docente',
  estudiante: 'Estudiante',
  'jefe-academico': 'Jefe Académico',
  tutor: 'Tutor',
  psicopedagogico: 'Psicopedagogía',
  'desarrollo-academico': 'Desarrollo Académico',
};

export function Sidebar({
  userRole,
  userName = 'Usuario',
  userEmail = 'usuario@email.com',
  onNavigate,
  currentView = 'dashboard',
  alertsCount = 0,
}: SidebarProps) {
  const handleLogout = () => {
    authService.logout();
    // Ajusta esta ruta según cómo sirvas el frontend
    window.location.href = '/Frontendproyecto';
  };

  const currentMenuItems = menuItems[userRole] || menuItems.docente;

  const handleNavigation = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const getBadgeCount = (view: string) => {
    if (view === 'alerts' && alertsCount > 0) {
      return alertsCount;
    }
    return undefined;
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 bottom-0">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <img
              src={logo}
              alt="Metricampus Logo"
              className="h-6 w-6 text-primary-foreground"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Metricampus</h1>
            <p className="text-xs text-muted-foreground">
              {userRoleLabels[userRole] || 'Usuario'}
            </p>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {userEmail}
          </p>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          const badgeCount = getBadgeCount(item.view);

          return (
            <button
              key={item.view}
              onClick={() => handleNavigation(item.view)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>

              {badgeCount !== undefined && badgeCount > 0 && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-800',
                  )}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}

              {isActive && (
                <div className="w-1 h-4 bg-current rounded-full opacity-60" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-2 mt-auto">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:border-border"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>

        <div className="text-xs text-muted-foreground text-center pt-2">
          Metricampus v1.0
        </div>
      </div>
    </div>
  );
}

// Componente que detecta automáticamente el rol del usuario
export function DynamicSidebar({
  onNavigate,
  currentView,
  alertsCount = 0,
}: {
  onNavigate?: (view: string) => void;
  currentView?: string;
  alertsCount?: number;
}) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUserData(user);
  }, []);

  if (!userData) {
    return (
      <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex items-center justify-center fixed left-0 top-0 bottom-0">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <Sidebar
      userRole={userData.role || userData.userType || 'docente'}
      userName={`${userData.firstName || userData.name || 'Usuario'} ${
        userData.lastName || ''
      }`}
      userEmail={userData.email || 'usuario@email.com'}
      onNavigate={onNavigate}
      currentView={currentView}
      alertsCount={alertsCount}
    />
  );
}
