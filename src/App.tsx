import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DocenteDashboard from './pages/DocentePage';
import JefeAcademicoDashboard from './pages/JefeAcademicoPage';
import SubdirectorAcademicoDashboard from './pages/SubdirectorAcademicoPage';
import Perfil from './components/Perfil';
import { DynamicSidebar } from './components/Sidebar';
import React from 'react';

function App() {
  return (
    <Router basename='/Frontendproyecto'>
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
        <Route path="/docente/perfil" element={<PerfilLayout userType="docente" />} />
        
        {/* Rutas para Jefe Académico */}
        <Route path="/jefe-academico" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/dashboard" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/docentes" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/materias" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/institucion" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/indicadores" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/crear-institucion" element={<JefeAcademicoDashboard />} />
        <Route path="/jefe-academico/perfil" element={<PerfilLayout userType="jefe-academico" />} />
        
        {/* Rutas para Subdirector Académico */}
        <Route path="/subdirector-academico" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/dashboard" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/instituciones" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/personal" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/indicadores" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/programas" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/crear-institucion" element={<SubdirectorAcademicoDashboard />} />
        <Route path="/subdirector-academico/perfil" element={<PerfilLayout userType="subdirector-academico" />} />
        
        {/* Ruta 404 - debe ir al final */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </Router>
  );
}

// Layout para páginas de perfil con sidebar
function PerfilLayout({ }: { userType: string }) {
  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <Perfil />
    </div>
  );
}

// Componente para redirección 404
function NotFoundRedirect() {
  React.useEffect(() => {
    window.location.href = '/Frontendproyecto/';
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
        <p>Redirigiendo al inicio...</p>
      </div>
    </div>
  );
}

export default App;