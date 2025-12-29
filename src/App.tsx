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
import TeacherSchedulePage from "./pages/docente/HorarioDocente";
import StudentSchedulePage from "./pages/alumno/HorarioAlumno";
import UsersPage from "./pages/admin/UsersPage";
import ClassAssignmentsPage from "./pages/catalogos/ClassAssignmentsPage";
import ClassAssignmentsPage1 from "./pages/horarios/ClassAssignmentsPage";
import StudentsPage from "./pages/catalogos/StudentsPage";
import RegisterStudentPage from "./pages/RegisterStudentPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import CourseEnrollmentsPage from "./pages/catalogos/CourseEnrollmentsPage";
import MisCargasDocente from "./pages/docente/MisCargasDocente";
import GroupLoadsSummaryPage from "./pages/catalogos/GroupLoadsSummaryPage";
import MisMateriasAlumno from "./pages/alumno/MisMateriasAlumno";
import ImportacionCsvPage from "./pages/catalogos/ImportacionCsvPage";
import EnrollmentsPage from "./pages/catalogos/EnrollmentsPage";


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
        path="/catalogos/enrollments"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <EnrollmentsPage />
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
      <Route
          path="/estudiante/horario"
          element={
            <RequireRole allow={["estudiante"]}>
              <StudentSchedulePage />
            </RequireRole>
          }
        />
      <Route
        path="/docente/horario"
        element={
          <RequireRole allow={["docente"]}>
            <TeacherSchedulePage />
          </RequireRole>
        }
      />
      <Route
      path="/docente/cargas"
      element={
        <RequireRole allow={["docente"]}>
          <MisCargasDocente />
        </RequireRole>
      }
    />

      <Route
        path="/dashboard/usuarios"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <UsersPage />
          </RequireRole>
        }
      />
      <Route
        path="/catalogos/inscripciones"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <CourseEnrollmentsPage/>
          </RequireRole>
        }
      />
      <Route
        path="/catalogos/cargas"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <ClassAssignmentsPage />
          </RequireRole>
        }
      />
      <Route
        path="/horarios/cargas"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <ClassAssignmentsPage1 />
          </RequireRole>
        }
      />
      <Route
        path="/catalogos/resumen-grupo"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <GroupLoadsSummaryPage />
          </RequireRole>
        }
      />

      <Route path="/register" element={<RegisterStudentPage />} />
      <Route
        path="/catalogos/alumnos"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar"]}>
            <StudentsPage />
          </RequireRole>
        }
      />
      <Route
        path="/estudiante/materias"
        element={
          <RequireRole allow={["estudiante"]}>
            <MisMateriasAlumno />
          </RequireRole>
        }
      />
      <Route
        path="/catalogos/importacion"
        element={
          <RequireRole allow={["superadmin", "admin", "control_escolar",]}>
            <ImportacionCsvPage />
          </RequireRole>
        }
      />

      <Route
        path="/mi-cuenta/password"
        element={
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
        }
      />

      {/* Genéricos */}
      <Route path="/dashboard" element={<RequireAuth><Navigate to="/dashboard/admin" replace /></RequireAuth>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
