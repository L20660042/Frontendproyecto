import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

import { DynamicSidebar } from '../../components/Sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { BookOpen, Calendar, TrendingUp, MessageSquare, Bell, User } from 'lucide-react';

import { authService } from '../../services/authService';
import { obtenerCalificacionesPorEstudiante } from '../../services/calificacionesService';
import { studentService } from '../../services/studentService';
import type {
  CreateTutoriaPayload,
  Tutoria,
  StudentRiskResponse,
} from '../../services/studentService';
import CalificacionesList from '../../components/CalificacionesList';

export default function EstudianteDashboard() {
  const user = authService.getCurrentUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [promedioGeneral, setPromedioGeneral] = useState<number | null>(null);
  const [materiasCount, setMateriasCount] = useState<number>(0);

  const [risk, setRisk] = useState<StudentRiskResponse | null>(null);
  const [tutorias, setTutorias] = useState<Tutoria[]>([]);

  const [newTutoria, setNewTutoria] = useState<CreateTutoriaPayload>({
    tutor: '',
    group: '',
    date: '',
    topic: '',
    observations: '',
  });
  const [creatingTutoria, setCreatingTutoria] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?._id) {
          setError('No se encontró el usuario autenticado.');
          setLoading(false);
          return;
        }

        // 1) Calificaciones del estudiante
        let califs: any[] = [];
        try {
          const califRes = await obtenerCalificacionesPorEstudiante(user._id);
          califs = Array.isArray(califRes) ? califRes : [];
        } catch (err) {
          console.error('Error al obtener calificaciones:', err);
        }

        setMateriasCount(califs.length);

        const grades = califs
          .map((c: any) => c.calificacion)
          .filter((g: any) => typeof g === 'number');

        if (grades.length > 0) {
          const sum = grades.reduce((acc: number, g: number) => acc + g, 0);
          setPromedioGeneral(sum / grades.length);
        } else {
          setPromedioGeneral(null);
        }

        // 2) Riesgo académico (ML) vía backend
        try {
          const riskRes = await studentService.getRiskAndRecommendations(user._id);
          setRisk(riskRes || null);
        } catch (err) {
          console.error('Error al obtener riesgo académico:', err);
        }

        // 3) Tutorías del estudiante
        try {
          const tutoriasRes = await studentService.getTutorias(user._id);
          setTutorias(Array.isArray(tutoriasRes) ? tutoriasRes : []);
        } catch (err) {
          console.error('Error al obtener tutorías del estudiante:', err);
        }
      } catch (err) {
        console.error('Error cargando datos del estudiante:', err);
        setError('No se pudieron cargar tus datos. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?._id]);

  const handleDownloadRecommendations = () => {
    if (!risk) return;

    const content = [
      `Nivel de riesgo: ${risk.risk_level}`,
      `Confianza: ${(risk.confidence * 100).toFixed(0)}%`,
      '',
      'Recomendaciones:',
      ...risk.recommendations.map((r, i) => `${i + 1}. ${r}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recomendaciones_riesgo_academico.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleChangeNewTutoria = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewTutoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTutoria = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!newTutoria.tutor || !newTutoria.group || !newTutoria.date || !newTutoria.topic) {
      setError('Por favor llena todos los campos obligatorios de la tutoría.');
      return;
    }

    try {
      setCreatingTutoria(true);
      setError(null);

      await studentService.createTutoriaAsStudent(newTutoria);

      // Recargar tutorías
      if (user?._id) {
        const tutoriasRes = await studentService.getTutorias(user._id);
        setTutorias(Array.isArray(tutoriasRes) ? tutoriasRes : []);
      }

      // Limpiar formulario
      setNewTutoria({
        tutor: '',
        group: '',
        date: '',
        topic: '',
        observations: '',
      });

      setSuccessMessage('Tutoría agendada correctamente.');
    } catch (err) {
      console.error('Error al crear tutoría:', err);
      setError('No se pudo agendar la tutoría. Intenta nuevamente.');
    } finally {
      setCreatingTutoria(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DynamicSidebar />

      <div className="flex-1">
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mi Panel Estudiantil</h1>
              <p className="text-muted-foreground">
                Bienvenido, {user?.nombre || user?.name || 'Estudiante'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Badge variant="outline">Estudiante</Badge>
            </div>
          </div>
        </header>

        <main className="p-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Resumen superior */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Promedio general */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Promedio General</CardTitle>
                  <CardDescription>Este semestre</CardDescription>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {promedioGeneral !== null ? promedioGeneral.toFixed(1) : '--'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {promedioGeneral !== null
                    ? 'Calculado a partir de tus calificaciones.'
                    : 'Aún no hay suficientes calificaciones.'}
                </p>
              </CardContent>
            </Card>

            {/* Materias activas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Materias Activas</CardTitle>
                  <CardDescription>Cursando actualmente</CardDescription>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{materiasCount}</div>
                <p className="text-sm text-muted-foreground">
                  Materias con calificaciones registradas.
                </p>
              </CardContent>
            </Card>

            {/* Próximas evaluaciones (placeholder) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Próximas Evaluaciones</CardTitle>
                  <CardDescription>En los próximos 7 días</CardDescription>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">
                  Integra aquí tu módulo de calendario cuando esté listo.
                </p>
              </CardContent>
            </Card>

            {/* Riesgo académico */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Nivel de Riesgo</CardTitle>
                  <CardDescription>Académico</CardDescription>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Calculando tu riesgo...</p>
                ) : risk ? (
                  <>
                    <div className="text-3xl font-bold capitalize">
                      {risk.risk_level}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Confianza: {(risk.confidence * 100).toFixed(0)}%
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadRecommendations}
                    >
                      Descargar recomendaciones
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay información suficiente para calcular tu riesgo.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mi rendimiento / Mis materias */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mis Materias Actuales</CardTitle>
              <CardDescription>Desempeño en este semestre</CardDescription>
            </CardHeader>
            <CardContent>
              {user?._id ? (
                <CalificacionesList estudianteId={user._id} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No se encontró información del estudiante.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Agendar tutoría + listado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Formulario para agendar tutoría */}
            <Card>
              <CardHeader>
                <CardTitle>Agendar tutoría</CardTitle>
                <CardDescription>Solicita una nueva sesión de tutoría académica</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateTutoria}>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID del tutor
                    </label>
                    <input
                      type="text"
                      name="tutor"
                      value={newTutoria.tutor}
                      onChange={handleChangeNewTutoria}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Ej. 660f1c..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID del grupo
                    </label>
                    <input
                      type="text"
                      name="group"
                      value={newTutoria.group}
                      onChange={handleChangeNewTutoria}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Ej. 6610ab..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fecha y hora
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={newTutoria.date}
                      onChange={handleChangeNewTutoria}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tema
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={newTutoria.topic}
                      onChange={handleChangeNewTutoria}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="Ej. Repaso de Álgebra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      name="observations"
                      value={newTutoria.observations || ''}
                      onChange={handleChangeNewTutoria}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Comentarios adicionales para el tutor"
                    />
                  </div>

                  <Button type="submit" disabled={creatingTutoria}>
                    {creatingTutoria ? 'Agendando...' : 'Agendar tutoría'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de tutorías del estudiante */}
            <Card>
              <CardHeader>
                <CardTitle>Mis tutorías</CardTitle>
                <CardDescription>Tutorías que has agendado</CardDescription>
              </CardHeader>
              <CardContent>
                {tutorias.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aún no tienes tutorías agendadas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tutorias.map((t) => (
                      <div
                        key={t._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {t.topic || 'Tutoría académica'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t.date
                              ? new Date(t.date).toLocaleString()
                              : 'Sin fecha definida'}
                            {' — Grupo: '}
                            {t.group?.name || (t as any).group || 'N/A'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {t.status || 'Pendiente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Button className="h-24 flex-col gap-3" variant="outline">
              <BookOpen className="h-8 w-8" />
              <div className="text-center">
                <div>Historial Académico</div>
                <div className="text-xs text-muted-foreground">Ver mis calificaciones</div>
              </div>
            </Button>

            <Button className="h-24 flex-col gap-3" variant="outline">
              <Calendar className="h-8 w-8" />
              <div className="text-center">
                <div>Horario</div>
                <div className="text-xs text-muted-foreground">Ver mi horario semanal</div>
              </div>
            </Button>

            <Button className="h-24 flex-col gap-3" variant="outline">
              <MessageSquare className="h-8 w-8" />
              <div className="text-center">
                <div>Solicitar Tutoría</div>
                <div className="text-xs text-muted-foreground">Agendar con mi tutor</div>
              </div>
            </Button>

            <Button className="h-24 flex-col gap-3" variant="outline">
              <User className="h-8 w-8" />
              <div className="text-center">
                <div>Mi Perfil</div>
                <div className="text-xs text-muted-foreground">Información personal</div>
              </div>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
