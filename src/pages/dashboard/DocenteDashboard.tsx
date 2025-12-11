import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { DynamicSidebar } from '../../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Progress } from '../../components/progress';

import {
  MateriasTable,
  EstudiantesTable,
  AlertasTable,
  ReportesTable,
  EvaluacionDocente,
} from '../../components/docente';

import { authService } from '../../services/authService';

import {
  Users,
  BookOpen,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

/* =========================
 *  TIPOS LOCALES
 * ========================= */

interface MateriaDocente {
  _id: string;
  name: string;
  code: string;
  groupCode: string;
  careerName: string;
  schedule: string;
  studentsCount: number;
  progress: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
  averageGrade?: number;
  attendance?: number;
}

interface Estudiante {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupName: string;
  materiaName: string;
  averageGrade: number;
  attendance: number;
  riskLevel: number; // 1-10
  lastTutoria?: string;
  status: 'regular' | 'at-risk' | 'critical';
  alertsCount?: number;
}

interface AlertaDocente {
  _id: string;
  type: 'low-grade' | 'absenteeism' | 'behavior' | 'academic-risk' | 'other';
  message: string;
  studentName: string;
  studentId: string;
  materiaName: string;
  groupName: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
  notes?: string;
}

/* =========================
 *  MAPEOS AUXILIARES
 * ========================= */

const mapAlertType = (backendType: string): AlertaDocente['type'] => {
  switch (backendType) {
    case 'riesgo_academico':
      return 'academic-risk';
    case 'queja':
      return 'behavior';
    case 'comportamiento':
      return 'behavior';
    default:
      return 'other';
  }
};

const mapRiskToPriority = (riskLevel: number | undefined): AlertaDocente['priority'] => {
  if (riskLevel === undefined || riskLevel === null) return 'low';
  if (riskLevel >= 7) return 'high';
  if (riskLevel >= 4) return 'medium';
  return 'low';
};

/* =========================
 *  COMPONENTE PRINCIPAL
 * ========================= */

type View =
  | 'dashboard'
  | 'materias'
  | 'estudiantes'
  | 'alerts'
  | 'reportes'
  | 'evaluacion'
  | 'tutorias';

export default function DocenteDashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const [userData, setUserData] = useState<any>(null);

  const [materias, setMaterias] = useState<MateriaDocente[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [alertas, setAlertas] = useState<AlertaDocente[]>([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(true);
  const [loadingAlertas, setLoadingAlertas] = useState(true);

  // Solo usamos el setter, no leemos el valor
  const [, setSelectedMateria] = useState<MateriaDocente | null>(null);

  /* =========================
   *  CARGA INICIAL
   * ========================= */

  useEffect(() => {
    const loadDocenteData = async () => {
      try {
        const user = authService.getCurrentUser();
        setUserData(user);

        if (!user) {
          setLoadingDashboard(false);
          setLoadingMaterias(false);
          setLoadingEstudiantes(false);
          setLoadingAlertas(false);
          return;
        }

        // 1) Traer todos los grupos y filtrar por docente
        const groupsResponse = await axios.get('/groups');
        const allGroups = groupsResponse.data || [];

        const myGroups = allGroups.filter((g: any) => {
          if (!g.teacher) return false;

          const teacherId =
            typeof g.teacher === 'string' ? g.teacher : g.teacher._id || g.teacher.id;

          return teacherId === user._id;
        });

        // 1.1) Mapear grupos -> materias
        const materiasMapped: MateriaDocente[] = myGroups.map((g: any) => {
          const subject = g.subject || {};
          const career = g.career || {};

          return {
            _id: g._id,
            name: subject.name || 'Materia sin nombre',
            code: subject.code || g.code || 'SIN-CODIGO',
            groupCode: g.code || g.name || 'SIN-GRUPO',
            careerName: career.name || 'Carrera no definida',
            schedule: g.schedule || 'Horario no definido',
            studentsCount: Array.isArray(g.students) ? g.students.length : 0,
            progress: 0, // Placeholder hasta que tengas lógica real de progreso
            riskLevel: 'low', // Placeholder, puedes ligarlo a alertas después
            lastActivity: g.updatedAt || g.createdAt || new Date().toISOString(),
            averageGrade: 0,
            attendance: 0,
          };
        });

        setMaterias(materiasMapped);
        setLoadingMaterias(false);

        // 2) Mapear grupos -> estudiantes
        const estudiantesMapped: Estudiante[] = myGroups.flatMap((g: any) => {
          const subject = g.subject || {};
          const groupName = g.name || g.code || 'SIN-GRUPO';

          if (!Array.isArray(g.students)) return [];

          return g.students.map((s: any) => {
            const fullName =
              s.fullName ||
              `${s.firstName || ''} ${s.lastName || ''}`.trim() ||
              'Sin nombre';

            return {
              _id: s._id,
              firstName: s.firstName || fullName.split(' ')[0] || 'Sin nombre',
              lastName: s.lastName || fullName.split(' ').slice(1).join(' '),
              email: s.email || 'sin-email',
              groupName,
              materiaName: subject.name || 'Materia sin nombre',
              averageGrade: 0, // aquí podrías integrar calificaciones luego
              attendance: 0,
              riskLevel: 2, // 1-10, placeholder
              status: 'regular',
              alertsCount: 0,
            };
          });
        });

        setEstudiantes(estudiantesMapped);
        setLoadingEstudiantes(false);

        // 3) Cargar alertas (si backend lo permite)
        try {
          const alertsResponse = await axios.get('/alerts');
          const allAlerts = alertsResponse.data || [];

          // Si el usuario es docente, filtramos alertas que pertenezcan a sus grupos o a él
          const myAlerts = allAlerts.filter((a: any) => {
            const teacherId =
              a.teacher && (a.teacher._id || a.teacher.id || a.teacher);
            const groupTeacherId =
              a.group &&
              a.group.teacher &&
              (a.group.teacher._id || a.group.teacher.id || a.group.teacher);

            return teacherId === user._id || groupTeacherId === user._id;
          });

          const mappedAlerts: AlertaDocente[] = myAlerts.map((a: any) => {
            const student = a.student || {};
            const group = a.group || {};
            const subject = group.subject || {};

            const fullName =
              student.fullName ||
              `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
              'Sin nombre';

            return {
              _id: a._id,
              type: mapAlertType(a.type),
              message: a.message || 'Sin mensaje',
              studentName: fullName,
              studentId: student._id || '',
              materiaName: subject.name || 'Materia sin nombre',
              groupName: group.name || group.code || 'SIN-GRUPO',
              priority: mapRiskToPriority(a.riskLevel),
              createdAt: a.createdAt || new Date().toISOString(),
              resolved: !!a.resolved,
              resolvedAt: a.resolved ? a.updatedAt || undefined : undefined,
              notes: '',
            };
          });

          setAlertas(mappedAlerts);
        } catch (error) {
          // Si no tiene permisos (403) o no hay endpoint, simplemente dejamos alertas vacías
          console.error('No se pudieron cargar las alertas del docente:', error);
          setAlertas([]);
        } finally {
          setLoadingAlertas(false);
        }
      } catch (error) {
        console.error('Error cargando datos del docente:', error);
        setLoadingMaterias(false);
        setLoadingEstudiantes(false);
        setLoadingAlertas(false);
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDocenteData();
  }, []);

  /* =========================
   *  MÉTRICAS DEL DASHBOARD
   * ========================= */

  const dashboardStats = useMemo(() => {
    const totalMaterias = materias.length;
    const totalEstudiantes = estudiantes.length;
    const alertasPendientes = alertas.filter((a) => !a.resolved).length;

    // Riesgo promedio a partir de estudiantes (placeholder)
    const promedioRiesgo =
      estudiantes.length > 0
        ? estudiantes.reduce((sum, e) => sum + (e.riskLevel || 0), 0) /
          estudiantes.length
        : 0;

    const tendencia = promedioRiesgo >= 5 ? 'up' : 'down';

    return {
      totalMaterias,
      totalEstudiantes,
      alertasPendientes,
      promedioRiesgo,
      tendencia,
    };
  }, [materias, estudiantes, alertas]);

  /* =========================
   *  HANDLERS
   * ========================= */

  const handleSelectMateria = (materia: MateriaDocente) => {
    setSelectedMateria(materia);

    // Filtrar estudiantes del grupo seleccionado (por si luego quieres usarlo)
    const relacionados = estudiantes.filter(
      (e) =>
        e.groupName === materia.groupCode ||
        e.groupName === materia.name ||
        e.materiaName === materia.name,
    );

    console.log('Materia seleccionada:', materia, 'Estudiantes relacionados:', relacionados);

    setCurrentView('estudiantes');
  };

  const handleResolveAlert = async (alertaId: string) => {
    try {
      // IMPORTANTE: si tu backend expone /alerts/resolve/:id con PATCH
      await axios.patch(`/alerts/resolve/${alertaId}`);

      setAlertas((prev) =>
        prev.map((a) =>
          a._id === alertaId
            ? { ...a, resolved: true, resolvedAt: new Date().toISOString() }
            : a,
        ),
      );
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      // Aquí puedes mostrar un toast si ya usas alguno
    }
  };

  const handleGenerateReport = (type: string) => {
    console.log('Generar reporte tipo:', type);
    // Aquí puedes integrar tu endpoint de generación de reportes para docente
  };

  /* =========================
   *  RENDER DE VISTAS
   * ========================= */

  const renderContent = () => {
    switch (currentView) {
      case 'materias':
        return (
          <MateriasTable
            materias={materias}
            loading={loadingMaterias}
            onSelectMateria={handleSelectMateria}
          />
        );

      case 'estudiantes':
        return (
          <EstudiantesTable
            estudiantes={estudiantes}
            loading={loadingEstudiantes}
            onSelectEstudiante={(e) => console.log('Estudiante seleccionado:', e)}
          />
        );

      case 'alerts':
        return (
          <AlertasTable
            alertas={alertas}
            loading={loadingAlertas}
            onResolveAlert={handleResolveAlert}
          />
        );

      case 'reportes':
        return (
          <ReportesTable
            userId={userData?._id || ''}
            onGenerateReport={handleGenerateReport}
          />
        );

      case 'evaluacion':
        return <EvaluacionDocente userId={userData?._id || ''} />;

      case 'tutorias':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Registro de Tutorías / Acompañamiento</CardTitle>
              <CardDescription>
                Integra aquí el formulario y la tabla usando los endpoints de /tutoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                El módulo de tutorías está listo para conectarse a <code>/tutoria</code>. Por ahora,
                esta sección es un placeholder.
              </p>
            </CardContent>
          </Card>
        );

      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mis materias</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalMaterias}</div>
                  <p className="text-xs text-muted-foreground">Asignadas este periodo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mis estudiantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalEstudiantes}</div>
                  <p className="text-xs text-muted-foreground">En todos tus grupos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Alertas pendientes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.alertasPendientes}</div>
                  <p className="text-xs text-muted-foreground">Por revisar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Riesgo promedio</CardTitle>
                  {dashboardStats.tendencia === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">
                      {dashboardStats.promedioRiesgo.toFixed(1)}/10
                    </span>
                    <div className="flex-1">
                      <Progress value={(dashboardStats.promedioRiesgo / 10) * 100} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado a partir de tus estudiantes (placeholder)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
                <CardDescription>Accede a tus módulos más usados</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setCurrentView('materias')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver mis materias
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('estudiantes')}>
                  <Users className="h-4 w-4 mr-2" />
                  Ver mis estudiantes
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('alerts')}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alertas de riesgo
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('reportes')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Mis reportes
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('evaluacion')}>
                  <Badge className="mr-2">Eval</Badge>
                  Evaluación docente
                </Button>
              </CardContent>
            </Card>

            {/* Vista rápida de materias */}
            <MateriasTable
              materias={materias}
              loading={loadingMaterias || loadingDashboard}
              onSelectMateria={handleSelectMateria}
            />
          </div>
        );
    }
  };

  /* =========================
   *  LAYOUT
   * ========================= */

  return (
    <div className="flex min-h-screen bg-background">
      <DynamicSidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as View)}
      />
      {/* Contenedor principal con margen izquierdo para el sidebar */}
      <div className="flex-1 flex flex-col ml-64"> {/* Agregado ml-64 aquí */}
        <header className="border-b px-6 py-4 flex items-center justify-between bg-card/40 backdrop-blur">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel del Docente</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus grupos, estudiantes, alertas y reportes.
            </p>
          </div>
          {userData && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{userData.email}</p>
              </div>
              <Badge variant="outline">{userData.role}</Badge>
            </div>
          )}
        </header>

        <main className="p-6">
          {loadingDashboard && currentView === 'dashboard' ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}