import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DocenteDashboard from './pages/DocentePage';
import JefeAcademicoDashboard from './pages/JefeAcademicoPage';
import SubdirectorAcademicoDashboard from './pages/SubdirectorAcademicoPage';
import EstudianteDashboard from './pages/EstudiantePage';
import Perfil from './components/Perfil';
import { DynamicSidebar } from './components/Sidebar';
import { useEffect } from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas para Docente */}
        <Route path="/docente" element={<DocenteDashboard />} />
        <Route path="/docente/dashboard" element={<DocenteDashboard />} />
        <Route path="/docente/materias" element={<DocenteDashboard />} />
        <Route path="/docente/estudiantes" element={<DocenteDashboard />} />
        <Route path="/docente/institucion" element={<DocenteDashboard />} />
        <Route path="/docente/solicitar-institucion" element={<DocenteDashboard />} />
        <Route path="/docente/perfil" element={<PerfilLayout />} />
        
        {/* Rutas para Jefe Académico */}
        <Route path="/jefe-academico" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/dashboard" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/docentes" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/materias" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/institucion" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/indicadores" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/crear-institucion" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/perfil" element={<PerfilLayout />} />
        
        {/* Rutas para Subdirector Académico */}
        <Route path="/subdirector-academico" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/dashboard" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/instituciones" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/personal" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/indicadores" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/programas" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/crear-institucion" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/perfil" element={<PerfilLayout />} />
        
        {/* Rutas para Estudiante */}
        <Route path="/estudiante" element={<EstudianteDashboard />} />
        <Route path="/estudiante/dashboard" element={<EstudianteDashboard />} />
        <Route path="/estudiante/calificaciones" element={<EstudianteDashboard />} />
        <Route path="/estudiante/materias" element={<EstudianteDashboard />} />
        <Route path="/estudiante/institucion" element={<EstudianteDashboard />} />
        <Route path="/estudiante/perfil" element={<PerfilLayout />} />
        
        {/* Rutas adicionales para otros tipos de usuario */}
        <Route path="/tutor" element={<TutorDashboard />} />
        <Route path="/coordinador-tutorias" element={<CoordinadorTutoriasDashboard />} />
        <Route path="/control-escolar" element={<ControlEscolarDashboard />} />
        
        {/* Ruta 404 */}
        <Route path="*" element={<HashNotFoundPage />} />
      </Routes>
    </Router>
  );
}

// Layout para páginas de perfil con sidebar
function PerfilLayout() {
  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <Perfil />
    </div>
  );
}

// Componentes placeholder para las nuevas rutas
function TutorDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard Tutor</h1>
          <p className="text-muted-foreground">Módulo en desarrollo</p>
        </div>
      </div>
    </div>
  );
}

function CoordinadorTutoriasDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Coordinador de Tutorías</h1>
          <p className="text-muted-foreground">Módulo en desarrollo</p>
        </div>
      </div>
    </div>
  );
}

function ControlEscolarDashboard() {
  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Control Escolar</h1>
          <p className="text-muted-foreground">Módulo en desarrollo</p>
        </div>
      </div>
    </div>
  );
}

// Componente 404 específico para HashRouter - CORREGIDO
function HashNotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 HashNotFoundPage - Ruta actual:', location.pathname, location.hash);
    
    const userData = localStorage.getItem('userData');
    const authToken = localStorage.getItem('authToken');

    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('🔍 Usuario autenticado encontrado, redirigiendo a:', user.userType);
        
        // ✅ REDIRIGIR SIN # - HashRouter lo maneja automáticamente
        let redirectPath = '/';
        
        switch (user.userType) {
          case "docente":
            redirectPath = "/docente";
            break;
          case "jefe-departamento":
            redirectPath = "/jefe-academico";
            break;
          case "subdireccion-academica":
          case "administrador":
            redirectPath = "/subdirector-academico";
            break;
          case "estudiante":
            redirectPath = "/estudiante";
            break;
          case "tutor":
            redirectPath = "/tutor";
            break;
          case "coordinador-tutorias":
            redirectPath = "/coordinador-tutorias";
            break;
          case "control-escolar":
            redirectPath = "/control-escolar";
            break;
          default:
            redirectPath = "/";
        }
        
        console.log('🔍 Redirigiendo a:', redirectPath);
        navigate(redirectPath);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
      }
    } else {
      console.log('🔍 No autenticado, redirigiendo a login');
      navigate('/');
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-foreground mb-2">Reestableciendo sesión...</h1>
        <p className="text-muted-foreground">Por favor espera</p>
      </div>
    </div>
  );
}

export default App;