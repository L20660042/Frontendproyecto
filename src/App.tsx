import CareersPage from "./pages/catalogos/CareersPage";
import GroupsPage from "./pages/catalogos/GroupsPage";
import SubjectsPage from "./pages/catalogos/SubjectsPage";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RequireAuth from "./auth/RequireAuth";
import { RequireRole } from "./auth/RequireRole";
import PeriodsPage from "./pages/catalogos/PeriodsPage";
import SchedulesPage from "./pages/horarios/SchedulesPage";
import TeacherSchedulePage from "./pages/docente/HorarioDocente";
import StudentSchedulePage from "./pages/alumno/HorarioAlumno";
import UsersPage from "./pages/admin/UsersPage";
import ClassAssignmentsPage from "./pages/catalogos/ClassAssignmentsPage";
import StudentsPage from "./pages/catalogos/StudentsPage";
import RegisterStudentPage from "./pages/RegisterStudentPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import CourseEnrollmentsPage from "./pages/catalogos/CourseEnrollmentsPage";
import MisCargasDocente from "./pages/docente/MisCargasDocente";
import GroupLoadsSummaryPage from "./pages/catalogos/GroupLoadsSummaryPage";
import MisMateriasAlumno from "./pages/alumno/MisMateriasAlumno";
import ImportacionCsvPage from "./pages/catalogos/ImportacionCsvPage";
import EnrollmentsPage from "./pages/catalogos/EnrollmentsPage";
import KardexAlumno from "./pages/alumno/KardexAlumno";
import EvaluacionDocente from "./pages/alumno/EvaluacionDocente";
import QuejasAlumno from "./pages/alumno/QuejasAlumno";
import RetroalimentacionDocente from "./pages/alumno/RetroalimentacionDocente";
import CalidadDocentePage from "./pages/admin/CalidadDocentePage";
import QuejasAdminPage from "./pages/admin/QuejasAdminPage";
import StudentActivitiesPage from "./pages/alumno/MisActividadesAlumno";
import ActivitiesPage from "./pages/catalogos/ActivitiesPage";
import DashboardAcademico from "./pages/admin/DashboardAcademico";
import DashboardIAPage from "./pages/admin/DashboardIAPage";
import { useAuth } from "./auth/AuthContext";

// NUEVOS INICIOS
import AdminHomePage from "./pages/home/AdminHomePage";
import LeadershipHomePage from "./pages/home/LeadershipHomePage";
import DocenteHomePage from "./pages/home/DocenteHomePage";
import AlumnoHomePage from "./pages/home/AlumnoHomePage";

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "SUPERADMIN":
      return <Navigate to="/dashboard/superadmin" replace />;
    case "ADMIN":
      return <Navigate to="/dashboard/admin" replace />;
    case "SERVICIOS_ESCOLARES":
      return <Navigate to="/control-escolar" replace />;
    case "DOCENTE":
      return <Navigate to="/docente" replace />;
    case "ALUMNO":
      return <Navigate to="/estudiante" replace />;
    case "JEFE":
      return <Navigate to="/jefe-academico" replace />;
    case "SUBDIRECCION":
      return <Navigate to="/subdireccion" replace />;
    case "DESARROLLO_ACADEMICO":
      return <Navigate to="/desarrollo-academico" replace />;
    default:
      return <Navigate to="/dashboard/admin" replace />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterStudentPage />} />

      {/* INICIOS REALES */}
      <Route
        path="/dashboard/superadmin"
        element={
          <RequireRole allow={["SUPERADMIN"]}>
            <AdminHomePage title="Inicio Superadmin" />
          </RequireRole>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <RequireRole allow={["ADMIN"]}>
            <AdminHomePage title="Inicio Admin" />
          </RequireRole>
        }
      />

      <Route
        path="/control-escolar"
        element={
          <RequireRole allow={["SERVICIOS_ESCOLARES"]}>
            <AdminHomePage title="Inicio Servicios Escolares" />
          </RequireRole>
        }
      />

      <Route
        path="/docente"
        element={
          <RequireRole allow={["DOCENTE"]}>
            <DocenteHomePage />
          </RequireRole>
        }
      />

      <Route
        path="/estudiante"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <AlumnoHomePage />
          </RequireRole>
        }
      />

      <Route
        path="/jefe-academico"
        element={
          <RequireRole allow={["JEFE"]}>
            <LeadershipHomePage title="Inicio Jefe Académico" />
          </RequireRole>
        }
      />

      <Route
        path="/subdireccion"
        element={
          <RequireRole allow={["SUBDIRECCION"]}>
            <LeadershipHomePage title="Inicio Subdirección" />
          </RequireRole>
        }
      />

      <Route
        path="/desarrollo-academico"
        element={
          <RequireRole allow={["DESARROLLO_ACADEMICO"]}>
            <LeadershipHomePage title="Inicio Desarrollo Académico" />
          </RequireRole>
        }
      />

      {/* CATÁLOGOS / OPERACIÓN */}
      <Route
        path="/catalogos/periodos"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <PeriodsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/carreras"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <CareersPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/enrollments"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <EnrollmentsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/grupos"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <GroupsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/materias"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <SubjectsPage />
          </RequireRole>
        }
      />

      <Route
        path="/horarios"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <SchedulesPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/cargas"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <ClassAssignmentsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/inscripciones"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <CourseEnrollmentsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/resumen-grupo"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <GroupLoadsSummaryPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/alumnos"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <StudentsPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/importacion"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <ImportacionCsvPage />
          </RequireRole>
        }
      />

      <Route
        path="/catalogos/actividades"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <ActivitiesPage />
          </RequireRole>
        }
      />

      {/* DOCENTE */}
      <Route
        path="/docente/horario"
        element={
          <RequireRole allow={["DOCENTE"]}>
            <TeacherSchedulePage />
          </RequireRole>
        }
      />
      <Route
        path="/docente/cargas"
        element={
          <RequireRole allow={["DOCENTE"]}>
            <MisCargasDocente />
          </RequireRole>
        }
      />
      <Route
        path="/docente/retro"
        element={
          <RequireRole allow={["DOCENTE"]}>
            <RetroalimentacionDocente />
          </RequireRole>
        }
      />

      {/* ALUMNO */}
      <Route
        path="/estudiante/horario"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <StudentSchedulePage />
          </RequireRole>
        }
      />
      <Route
        path="/estudiante/materias"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <MisMateriasAlumno />
          </RequireRole>
        }
      />
      <Route
        path="/estudiante/kardex"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <KardexAlumno />
          </RequireRole>
        }
      />
      <Route
        path="/estudiante/evaluacion"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <EvaluacionDocente />
          </RequireRole>
        }
      />
      <Route
        path="/estudiante/quejas"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <QuejasAlumno />
          </RequireRole>
        }
      />
      <Route
        path="/estudiante/actividades"
        element={
          <RequireRole allow={["ALUMNO"]}>
            <StudentActivitiesPage />
          </RequireRole>
        }
      />

      {/* ADMIN / ANALÍTICA */}
      <Route
        path="/dashboard/usuarios"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES"]}>
            <UsersPage />
          </RequireRole>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"]}>
            <CalidadDocentePage />
          </RequireRole>
        }
      />

      <Route
        path="/admin/quejas"
        element={
          <RequireRole allow={["SUPERADMIN", "ADMIN", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"]}>
            <QuejasAdminPage />
          </RequireRole>
        }
      />

      <Route
        path="/dashboard/academico"
        element={
          <RequireRole
            allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"]}
          >
            <DashboardAcademico />
          </RequireRole>
        }
      />

      <Route
        path="/dashboard/ia"
        element={
          <RequireRole
            allow={["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"]}
          >
            <DashboardIAPage />
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

      {/* Inicio genérico (redirige según rol) */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardRedirect />
          </RequireAuth>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
