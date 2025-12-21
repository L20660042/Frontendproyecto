import CareersPage from "./pages/catalogos/CareersPage";
import GroupsPage from "./pages/catalogos/GroupsPage";
import SubjectsPage from "./pages/catalogos/SubjectsPage";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";
import PeriodsPage from "./pages/catalogos/PeriodsPage";
import DashboardLayout from "./layout/DashboardLayout";
import SchedulesPage from "./pages/horarios/SchedulesPage";

function SimpleHome({ title }: { title: string }) {
  return (
    <DashboardLayout title={title}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Bienvenido</h2>
        <p className="text-muted-foreground">
          Este es un placeholder de inicio. A partir de aquí montamos tus dashboards reales.
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Homes por rol */}
      <Route
        path="/dashboard/superadmin"
        element={
          <RequireRole allow={["superadmin"]}>
            <SimpleHome title="Dashboard Superadmin" />
          </RequireRole>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <RequireRole allow={["admin"]}>
            <SimpleHome title="Dashboard Admin" />
          </RequireRole>
        }
      />

      <Route
        path="/control-escolar"
        element={
          <RequireRole allow={["control_escolar"]}>
            <SimpleHome title="Panel Control Escolar" />
          </RequireRole>
        }
      />

      <Route
        path="/docente"
        element={
          <RequireRole allow={["docente"]}>
            <SimpleHome title="Panel Docente" />
          </RequireRole>
        }
      />

      <Route
        path="/estudiante"
        element={
          <RequireRole allow={["estudiante"]}>
            <SimpleHome title="Panel Estudiante" />
          </RequireRole>
        }
      />

      <Route
        path="/jefe-academico"
        element={
          <RequireRole allow={["jefe_departamento"]}>
            <SimpleHome title="Panel Jefe Académico" />
          </RequireRole>
        }
      />

      <Route
        path="/tutor"
        element={
          <RequireRole allow={["tutor"]}>
            <SimpleHome title="Panel Tutor" />
          </RequireRole>
        }
      />

      <Route
        path="/desarrollo-academico"
        element={
          <RequireRole allow={["capacitacion"]}>
            <SimpleHome title="Panel Desarrollo Académico" />
          </RequireRole>
        }
      />

      {/* Catálogos */}
      <Route
        path="/catalogos/periodos"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <PeriodsPage />
          </RequireRole>
        }
      />
      <Route
        path="/catalogos/carreras"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <CareersPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/grupos"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <GroupsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/materias"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <SubjectsPage />
          </RequireRole>
        }
      />
      <Route
        path="/horarios"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <SchedulesPage />
          </RequireRole>
        }
      />

      {/* Genéricos */}
      <Route path="/dashboard" element={<RequireAuth><Navigate to="/dashboard/admin" replace /></RequireAuth>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
