import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Alert, AlertDescription } from "../../components/alert";
import { Label } from "../../components/label";
import { Input } from "../../components/input";
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

function gradeLabel(finalGrade: number | null | undefined) {
  if (typeof finalGrade !== "number") return { label: "Sin final", cls: "bg-muted text-foreground" };
  if (finalGrade >= 70) return { label: "Aprobada", cls: "bg-emerald-100 text-emerald-900" };
  return { label: "Reprobada", cls: "bg-red-100 text-red-900" };
}

export default function MisMateriasAlumno() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState<CourseEnrollment[]>([]);

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
    setError("");
    setRows([]);
    if (!periodId) return;

    setLoading(true);
    try {
      const res = await api.get("/academic/course-enrollments/me", {
        params: { periodId, status: "active" },
      });
      setRows(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar mis materias");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      const subj = String(r.subjectId?.name ?? r.classAssignmentId?.subjectId?.name ?? "").toLowerCase();
      const teacher = String(r.teacherId?.name ?? r.classAssignmentId?.teacherId?.name ?? "").toLowerCase();
      const group = String(r.groupId?.name ?? r.classAssignmentId?.groupId?.name ?? "").toLowerCase();
      return subj.includes(s) || teacher.includes(s) || group.includes(s);
    });
  }, [rows, q]);

  return (
    <DashboardLayout title="Mis materias">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{String(error)}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Periodo</CardTitle>
            <CardDescription>Selecciona el periodo para ver tus materias y calificaciones.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Periodo</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
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

            <div className="space-y-2">
              <Label>Búsqueda</Label>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Materia, docente o grupo"
                disabled={!periodId}
              />
            </div>

            <div className="flex items-end">
              <Button variant="secondary" onClick={load} disabled={!periodId || loading}>
                Refrescar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materias inscritas</CardTitle>
            <CardDescription>U1–U5 y calificación final (si ya fueron capturadas).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
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
                      <td colSpan={10} className="p-4 text-muted-foreground">
                        Selecciona un periodo.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-muted-foreground">
                        No tienes materias inscritas en este periodo (o no coincide la búsqueda).
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => {
                      const subject = r.subjectId?.name ?? r.classAssignmentId?.subjectId?.name ?? "-";
                      const teacher = r.teacherId?.name ?? r.classAssignmentId?.teacherId?.name ?? "-";
                      const group = r.groupId?.name ?? r.classAssignmentId?.groupId?.name ?? "-";
                      const ug = r.unitGrades ?? {};
                      const gl = gradeLabel(r.finalGrade);

                      return (
                        <tr key={r._id} className="border-t border-border">
                          <td className="p-3 font-medium">{subject}</td>
                          <td className="p-3">{teacher}</td>
                          <td className="p-3">{group}</td>
                          <td className="p-3">{ug.u1 ?? "-"}</td>
                          <td className="p-3">{ug.u2 ?? "-"}</td>
                          <td className="p-3">{ug.u3 ?? "-"}</td>
                          <td className="p-3">{ug.u4 ?? "-"}</td>
                          <td className="p-3">{ug.u5 ?? "-"}</td>
                          <td className="p-3 font-medium">{typeof r.finalGrade === "number" ? r.finalGrade : "-"}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${gl.cls}`}>
                              {gl.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {periodId ? (
              <div className="mt-3 text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{filtered.length}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
