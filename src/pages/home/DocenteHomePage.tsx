import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Alert, AlertDescription } from "../../components/alert";
import { Button } from "../../components/button";

type Period = { _id: string; name: string; isActive: boolean };

type ClassAssignment = {
  _id: string;
  groupId?: any;
  subjectId?: any;
  careerId?: any;
  teacherId?: any;
  status?: "active" | "inactive";
};

type UnitGrades = { u1?: number; u2?: number; u3?: number; u4?: number; u5?: number };
type CourseEnrollment = {
  _id: string;
  studentId?: any;
  status?: "active" | "inactive";
  unitGrades?: UnitGrades;
  finalGrade?: number | null;
};

type LoadStats = {
  classAssignmentId: string;
  students: number;
  finalsCaptured: number;
  pendingFinals: number;
  passed: number;
  failed: number;
  avgFinal: number | null;
};

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

async function mapLimit<T, R>(arr: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;

  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (i < arr.length) {
      const idx = i++;
      out[idx] = await fn(arr[idx]);
    }
  });

  await Promise.all(workers);
  return out;
}

export default function DocenteHomePage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [loads, setLoads] = React.useState<ClassAssignment[]>([]);
  const [statsByLoad, setStatsByLoad] = React.useState<Record<string, LoadStats>>({});

  const [evalSummary, setEvalSummary] = React.useState<any>(null);
  const [compSummary, setCompSummary] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await api.get("/academic/periods");
        const list: Period[] = res.data ?? [];
        setPeriods(list);
        const active = list.find((p) => p.isActive);
        if (active) setPeriodId(active._id);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar periodos");
      }
    })();
  }, []);

  const loadAll = React.useCallback(async () => {
    if (!periodId) return;

    setLoading(true);
    setError("");
    try {
      // 1) Mis cargas
      const loadsRes = await api.get("/academic/class-assignments/me", { params: { periodId, status: "active" } });
      const caList: ClassAssignment[] = loadsRes.data ?? [];
      setLoads(caList);

      // 2) Stats por carga (alumnos + finales)
      const statsList = await mapLimit(caList, 5, async (ca) => {
        const enrRes = await api.get("/academic/course-enrollments/me", {
          params: { periodId, classAssignmentId: ca._id, status: "active" },
        });
        const enrollments: CourseEnrollment[] = enrRes.data ?? [];

        const students = enrollments.length;
        const finals = enrollments.filter((e) => typeof e.finalGrade === "number") as Array<CourseEnrollment & { finalGrade: number }>;
        const finalsCaptured = finals.length;
        const pendingFinals = students - finalsCaptured;

        const passed = finals.filter((e) => e.finalGrade >= 70).length;
        const failed = finals.filter((e) => e.finalGrade < 70).length;
        const avgFinal = finalsCaptured ? finals.reduce((a, e) => a + e.finalGrade, 0) / finalsCaptured : null;

        const s: LoadStats = {
          classAssignmentId: ca._id,
          students,
          finalsCaptured,
          pendingFinals,
          passed,
          failed,
          avgFinal,
        };
        return s;
      });

      const dict: Record<string, LoadStats> = {};
      for (const s of statsList) dict[s.classAssignmentId] = s;
      setStatsByLoad(dict);

      // 3) Resumen IA (evaluaciones/quejas)
      try {
        const [eRes, cRes] = await Promise.all([
          api.get("/feedback/evaluations/teachers/me/summary", { params: { periodId } }),
          api.get("/feedback/complaints/teachers/me/summary", { params: { periodId } }),
        ]);
        setEvalSummary(eRes.data ?? null);
        setCompSummary(cRes.data ?? null);
      } catch {
        // Si no existe IA aún, no bloquea el dashboard
        setEvalSummary(null);
        setCompSummary(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar dashboard docente");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  const global = React.useMemo(() => {
    const list = loads.map((l) => statsByLoad[l._id]).filter(Boolean) as LoadStats[];
    const totalLoads = loads.length;
    const totalStudents = list.reduce((a, s) => a + s.students, 0);
    const totalFinals = list.reduce((a, s) => a + s.finalsCaptured, 0);
    const pendingFinals = list.reduce((a, s) => a + s.pendingFinals, 0);
    const passed = list.reduce((a, s) => a + s.passed, 0);
    const failed = list.reduce((a, s) => a + s.failed, 0);

    const avgFinal =
      totalFinals > 0
        ? list.reduce((sum, s) => sum + (s.avgFinal ?? 0) * s.finalsCaptured, 0) / totalFinals
        : null;

    const captureRate = totalStudents > 0 ? (totalFinals / totalStudents) * 100 : 0;

    return { totalLoads, totalStudents, totalFinals, pendingFinals, passed, failed, avgFinal, captureRate };
  }, [loads, statsByLoad]);

  return (
    <DashboardLayout title="Inicio Docente">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Tu rendimiento por periodo: cargas, alumnos y captura de calificaciones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="text-sm text-muted-foreground">Periodo</div>
                <select
                  className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona...</option>
                  {periods.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                      {p.isActive ? " (Activo)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-end justify-end gap-2">
                <Button variant="secondary" onClick={loadAll} disabled={!periodId || loading}>
                  Refrescar
                </Button>
                <Button asChild>
                  <Link to="/docente/cargas">Abrir mis cargas</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Cargas" value={global.totalLoads} />
              <StatCard label="Alumnos (total)" value={global.totalStudents} />
              <StatCard label="Final capturado" value={global.totalFinals} />
              <StatCard label="Pendientes" value={global.pendingFinals} />
              <StatCard
                label="Promedio final"
                value={global.avgFinal === null ? "—" : global.avgFinal.toFixed(1)}
                sub={global.avgFinal === null ? "Aún sin finales" : `Captura: ${global.captureRate.toFixed(0)}%`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis cargas (vista rápida)</CardTitle>
            <CardDescription>Materia, grupo, alumnos y avance de captura.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm min-w-[1050px]">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Grupo</th>
                    <th className="text-left p-3">Alumnos</th>
                    <th className="text-left p-3">Final capturado</th>
                    <th className="text-left p-3">Pendientes</th>
                    <th className="text-left p-3">Aprobados</th>
                    <th className="text-left p-3">Reprobados</th>
                    <th className="text-left p-3">Promedio</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!periodId ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-muted-foreground">Selecciona un periodo.</td>
                    </tr>
                  ) : loads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-muted-foreground">No tienes cargas en este periodo.</td>
                    </tr>
                  ) : (
                    loads.map((ca) => {
                      const st = statsByLoad[ca._id];
                      const subject = ca.subjectId?.name ?? "-";
                      const group = ca.groupId?.name ?? "-";
                      return (
                        <tr key={ca._id} className="border-t border-border">
                          <td className="p-3 font-medium">{subject}</td>
                          <td className="p-3">{group}</td>
                          <td className="p-3">{st?.students ?? "—"}</td>
                          <td className="p-3">{st?.finalsCaptured ?? "—"}</td>
                          <td className="p-3">{st?.pendingFinals ?? "—"}</td>
                          <td className="p-3">{st?.passed ?? "—"}</td>
                          <td className="p-3">{st?.failed ?? "—"}</td>
                          <td className="p-3">{st?.avgFinal == null ? "—" : st.avgFinal.toFixed(1)}</td>
                          <td className="p-3">
                            <Button asChild variant="secondary">
                              <Link to="/docente/cargas">Gestionar</Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to="/docente/horario">Mi horario</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/docente/retro">Retroalimentación (IA)</Link>
              </Button>
              <Button asChild>
                <Link to="/docente/cargas">Capturar calificaciones</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retroalimentación (IA) — resumen</CardTitle>
            <CardDescription>
              Evaluaciones/quejas agregadas. (Si tu backend aún no tiene estos endpoints, aquí no se rompe el inicio.)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium">Evaluaciones</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{evalSummary?.totalEvaluations ?? 0}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Top temas</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(evalSummary?.topTopics ?? []).slice(0, 8).map((t: any) => (
                    <span key={t.label} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground border border-border">
                      {t.label} ({t.count})
                    </span>
                  ))}
                  {!evalSummary?.topTopics?.length ? <span className="text-sm text-muted-foreground">Sin datos.</span> : null}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium">Quejas</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{compSummary?.totalComplaints ?? 0}</span>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Top temas</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(compSummary?.topTopics ?? []).slice(0, 8).map((t: any) => (
                    <span key={t.label} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground border border-border">
                      {t.label} ({t.count})
                    </span>
                  ))}
                  {!compSummary?.topTopics?.length ? <span className="text-sm text-muted-foreground">Sin datos.</span> : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
