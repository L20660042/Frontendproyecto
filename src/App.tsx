import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">Pantalla placeholder. Conecta tu layout real aquí.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboards/roles */}
      <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
      <Route path="/dashboard/superadmin" element={<Placeholder title="Dashboard Superadmin" />} />
      <Route path="/dashboard/admin" element={<Placeholder title="Dashboard Admin" />} />

      <Route path="/docente" element={<Placeholder title="Panel Docente" />} />
      <Route path="/estudiante" element={<Placeholder title="Panel Estudiante" />} />
      <Route path="/jefe-academico" element={<Placeholder title="Panel Jefe Académico" />} />
      <Route path="/tutor" element={<Placeholder title="Panel Tutor" />} />
      <Route path="/control-escolar" element={<Placeholder title="Panel Control Escolar" />} />
      <Route path="/desarrollo-academico" element={<Placeholder title="Panel Desarrollo Académico" />} />

      {/* Otros */}
      <Route path="/terms" element={<Placeholder title="Términos y Condiciones" />} />
      <Route path="/register" element={<Placeholder title="Registro" />} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
