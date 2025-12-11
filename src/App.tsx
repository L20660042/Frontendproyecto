import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DocenteDashboard from "./pages/dashboard/DocenteDashboard";
import EstudianteDashboard from "./pages/dashboard/EstudianteDashboard";
import JefeAcademicoDashboard from "./pages/dashboard/JefeAcademicoDashboard";
import TutorDashboard from "./pages/dashboard/TutorDashboard";
import PsicopedagogicoDashboard from "./pages/dashboard/PsicopedagogicoDashboard";
import DesarrolloAcademicoDashboard from "./pages/dashboard/DesarrolloAcademicoDashboard";
import ExcelPage from './pages/ExcelPage';

export default function App() {
  return (
    <BrowserRouter basename="/Frontendproyecto">
      <Routes>
        {/* Redirigir raíz a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas protegidas por rol */}
        <Route path="/dashboard/superadmin" element={
          <ProtectedRoute>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/docente" element={
          <ProtectedRoute>
            <DocenteDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/estudiante" element={
          <ProtectedRoute>
            <EstudianteDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/jefe-academico" element={
          <ProtectedRoute>
            <JefeAcademicoDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/tutor" element={
          <ProtectedRoute>
            <TutorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/psicopedagogico" element={
          <ProtectedRoute>
            <PsicopedagogicoDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/desarrollo-academico" element={
          <ProtectedRoute>
            <DesarrolloAcademicoDashboard />
          </ProtectedRoute>
        } />
        
        {/* AGREGAR ESTA RUTA PARA EXCEL */}
        <Route path="/excel" element={
          <ProtectedRoute>
            <ExcelPage />
          </ProtectedRoute>
        } />
        
        {/* Para cualquier otra ruta no encontrada, redirigir a login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
