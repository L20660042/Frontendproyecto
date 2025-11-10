import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DocenteDashboard from './pages/DocentePage';
import JefeAcademicoDashboard from './pages/JefeAcademicoPage';
import SubdirectorAcademicoDashboard from './pages/SubdirectorAcademicoPage';
import Perfil from './components/Perfil';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas para Docente */}
        <Route path="/docente" element={<DocenteDashboard />} />
        <Route path="/docente/dashboard" element={<DocenteDashboard />} />
        <Route path="/docente/materias" element={<DocenteDashboard />} />
        <Route path="/docente/estudiantes" element={<DocenteDashboard />} />
        <Route path="/docente/institucion" element={<DocenteDashboard />} />
        <Route path="/docente/perfil" element={<Perfil userType="docente" SidebarComponent={DocenteDashboard} />} />
        <Route path="/docente/solicitar-institucion" element={<DocenteDashboard />} />
        
        {/* Rutas para Jefe Académico */}
        <Route path="/jefe-academico" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/dashboard" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/docentes" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/materias" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/institucion" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/indicadores" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/perfil" element={<Perfil userType="jefe-academico" SidebarComponent={JefeAcademicoDashboard} />} />
        <Route path="/jefe-academico/crear-institucion" element={<JefeAcademicoDashboard />} />
        
        {/* Rutas para Subdirector Académico */}
        <Route path="/subdirector-academico" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/dashboard" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/instituciones" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/personal" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/indicadores" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/programas" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/perfil" element={<Perfil userType="subdirector-academico" SidebarComponent={SubdirectorAcademicoDashboard} />} />
        <Route path="/subdirector-academico/crear-institucion" element={<SubdirectorAcademicoDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;