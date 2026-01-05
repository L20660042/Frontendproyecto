import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Alert, AlertDescription } from "../../components/alert";
import { Button } from "../../components/button";

type Period = { _id: string; name: string; isActive: boolean };
type UnitGrades = { u1?: number; u2?: number; u3?: number; u4?: number; u5?: number };

type CourseEnrollment = {
  _id: string;
  status: "active" | "inactive";
  periodId?: any;
  groupId?: any;
  subjectId?: any;
  teacherId?: any;
  classAssignmentId?: any;
  unitGrades?: UnitGrades;
  finalGrade?: number | null;
};

function subjectName(r: CourseEnrollment) {
  return r.subjectId?.name ?? r.classAssignmentId?.subjectId?.name ?? "-";
}
function teacherName(r: CourseEnrollment) {
  return r.teacherId?.name ?? r.classAssignmentId?.teacherId?.name ?? "-";
}
function groupName(r: CourseEnrollment) {
  return r.groupId?.name ?? r.classAssignmentId?.groupId?.name ?? "-";
}

function gradeChip(finalGrade: number | null | undefined) {
  if (typeof finalGrade !== "number") return { label: "Pendiente", cls: "bg-muted text-foreground" };
  if (finalGrade >= 70) return { label: "Aprobada", cls: "bg-emerald-100 text-emerald-900" };
  return { label: "Reprobada", cls: "bg-red-100 text-red-900" };
}

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

export default function AlumnoHomePage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [rows, setRows] = React.useState<CourseEnrollment[]>([]);
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

  const load = React.useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/academic/course-enrollments/me", { params: { periodId, status: "active" } });
      setRows(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar materias del alumno");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const stats = React.useMemo(() => {
    const total = rows.length;
    const finals = rows.filter((r) => typeof r.finalGrade === "number") as Array<CourseEnrollment & { finalGrade: number }>;
    const pending = total - finals.length;

    const passed = finals.filter((r) => r.finalGrade >= 70).length;
    const failed = finals.filter((r) => r.finalGrade < 70).length;

    const avg = finals.length ? finals.reduce((a, r) => a + r.finalGrade, 0) / finals.length : null;

    const worst = [...finals]
      .sort((a, b) => a.finalGrade - b.finalGrade)
      .slice(0, 3);

    return { total, finals: finals.length, pending, passed, failed, avg, worst };
  }, [rows]);

  return (
    <DashboardLayout title="Inicio Alumno">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Tu rendimiento por periodo (materias y calificaciones).</CardDescription>
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
                <Button variant="secondary" onClick={load} disabled={!periodId || loading}>
                  Refrescar
                </Button>
                <Button asChild>
                  <Link to="/estudiante/materias">Ver detalle</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Materias" value={stats.total} />
              <StatCard label="Final capturado" value={stats.finals} />
              <StatCard label="Pendientes" value={stats.pending} />
              <StatCard label="Aprobadas" value={stats.passed} />
              <StatCard
                label="Promedio"
                value={stats.avg === null ? "—" : stats.avg.toFixed(1)}
                sub={stats.avg === null ? "Aún sin finales" : "Promedio de finales capturados"}
              />
            </div>

            {stats.worst.length ? (
              <div className="rounded-lg border border-border p-4">
                <div className="text-sm font-medium">Materias con menor final</div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {stats.worst.map((w) => (
                    <div key={w._id} className="rounded-md border border-border p-3">
                      <div className="text-sm font-medium">{subjectName(w)}</div>
                      <div className="text-xs text-muted-foreground mt-1">{teacherName(w)} · {groupName(w)}</div>
                      <div className="mt-2 text-lg font-semibold">{w.finalGrade}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis materias (vista rápida)</CardTitle>
            <CardDescription>Tabla resumida (U1–U5 + final). Para todo el detalle usa “Mis materias”.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm min-w-[1100px]">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Docente</th>
                    <th className="text-left p-3">Grupo</th>
                    <th className="text-left p-3">U1</th>
                    <th className="text-left p-3">U2</th>
                    <th className="text-left p-3">U3</th>
                    <th className="text-left p-3">U4</th>
                    <th className="text-left p-3">U5</th>
                    <th className="text-left p-3">Final</th>
                    <th className="text-left p-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {!periodId ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-muted-foreground">Selecciona un periodo.</td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-muted-foreground">
                        No hay materias en este periodo (o aún no estás inscrito).
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => {
                      const ug = r.unitGrades ?? {};
                      const chip = gradeChip(r.finalGrade);
                      return (
                        <tr key={r._id} className="border-t border-border">
                          <td className="p-3 font-medium">{subjectName(r)}</td>
                          <td className="p-3">{teacherName(r)}</td>
                          <td className="p-3">{groupName(r)}</td>
                          <td className="p-3">{ug.u1 ?? "-"}</td>
                          <td className="p-3">{ug.u2 ?? "-"}</td>
                          <td className="p-3">{ug.u3 ?? "-"}</td>
                          <td className="p-3">{ug.u4 ?? "-"}</td>
                          <td className="p-3">{ug.u5 ?? "-"}</td>
                          <td className="p-3 font-medium">{typeof r.finalGrade === "number" ? r.finalGrade : "-"}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${chip.cls}`}>
                              {chip.label}
                            </span>
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
                <Link to="/estudiante/horario">Mi horario</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/estudiante/kardex">Kardex</Link>
              </Button>
              <Button asChild>
                <Link to="/estudiante/materias">Mis materias</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
