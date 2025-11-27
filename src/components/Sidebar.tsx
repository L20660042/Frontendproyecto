import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  User, 
  LogOut,
  Building,
  Plus,
  TrendingUp,
  Home
} from 'lucide-react';
import { Button } from './button';
import { cn } from './lib/utils';
import logo from '../assets/image.png';
import { authService } from '../services/authService';

interface SidebarProps {
  userType: 'docente' | 'jefe-academico' | 'subdirector-academico';
  userName?: string;
  userEmail?: string;
}

const menuItems = {
  docente: [
    { icon: Home, label: 'Inicio', href: '/docente' },
    { icon: BarChart3, label: 'Dashboard', href: '/docente/dashboard' },
    { icon: BookOpen, label: 'Mis Materias', href: '/docente/materias' },
    { icon: Users, label: 'Mis Estudiantes', href: '/docente/estudiantes' },
    { icon: Building, label: 'Mi Institución', href: '/docente/institucion' },
    { icon: User, label: 'Perfil', href: '/docente/perfil' }, // Perfil agregado aquí
  ],
  'jefe-academico': [
    { icon: Home, label: 'Inicio', href: '/jefe-academico' },
    { icon: BarChart3, label: 'Dashboard', href: '/jefe-academico/dashboard' },
    { icon: Users, label: 'Docentes', href: '/jefe-academico/docentes' },
    { icon: BookOpen, label: 'Materias', href: '/jefe-academico/materias' },
    { icon: Building, label: 'Institución', href: '/jefe-academico/institucion' },
    { icon: TrendingUp, label: 'Indicadores', href: '/jefe-academico/indicadores' },
    { icon: User, label: 'Perfil', href: '/jefe-academico/perfil' }, // Perfil agregado aquí
  ],
  'subdirector-academico': [
    { icon: Home, label: 'Inicio', href: '/subdirector-academico' },
    { icon: BarChart3, label: 'Dashboard General', href: '/subdirector-academico/dashboard' },
    { icon: Building, label: 'Instituciones', href: '/subdirector-academico/instituciones' },
    { icon: Users, label: 'Personal Académico', href: '/subdirector-academico/personal' },
    { icon: TrendingUp, label: 'Indicadores Globales', href: '/subdirector-academico/indicadores' },
    { icon: BookOpen, label: 'Programas Académicos', href: '/subdirector-academico/programas' },
    { icon: User, label: 'Perfil', href: '/subdirector-academico/perfil' }, // Perfil agregado aquí
  ],
};

const userTypeLabels = {
  docente: 'Panel Docente',
  'jefe-academico': 'Jefe Académico',
  'subdirector-academico': 'Subdirector Académico',
};

export function Sidebar({ userType, userName = 'Usuario', userEmail = 'usuario@email.com' }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleCreateInstitution = () => {
    if (userType === 'docente') {
      navigate('/docente/solicitar-institucion');
    } else {
      navigate(`/${userType}/crear-institucion`);
    }
  };

  const handleLeaveInstitution = () => {
    if (window.confirm('¿Estás seguro de que quieres salir de la institución?')) {
      console.log('Saliendo de la institución...');
    }
  };

  const canCreateInstitution = userType !== 'docente';
  const canLeaveInstitution = userType === 'docente';

  return (
    <div className="sidebar w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
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
            <p className="text-xs text-muted-foreground">{userTypeLabels[userType]}</p>
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

      {/* Navegación Principal */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems[userType].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="w-1 h-4 bg-current rounded-full opacity-60" />
              )}
            </Link>
          );
        })}
        
        {/* Botones de Acción Específicos */}
        <div className="pt-4 space-y-2">
          {canCreateInstitution && (
            <Button
              onClick={handleCreateInstitution}
              className="w-full justify-start gap-3 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Crear Institución
            </Button>
          )}
          
          {canLeaveInstitution && (
            <Button
              onClick={handleLeaveInstitution}
              variant="outline"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Salir de Institución
            </Button>
          )}
        </div>
      </nav>

      {/* Footer con Cerrar Sesión */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
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

// En la función DynamicSidebar, actualiza para manejar mejor los datos:
export function DynamicSidebar() {
  const userData = authService.getCurrentUser();
  
  if (!userData) {
    return (
      <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <Sidebar
      userType={(userData.userType as 'docente' | 'jefe-academico' | 'subdirector-academico') || 'docente'}
      userName={`${userData.firstName} ${userData.lastName}`}
      userEmail={userData.email}
    />
  );
}