import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Input } from "../../components/input";

type Period = { _id: string; name: string; isActive: boolean };

type CourseEnrollmentRow = {
  _id: string;
  status?: "active" | "inactive";
  finalGrade?: number | null;
  classAssignmentId?: any;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
  periodId?: any;
};

export default function MisMateriasAlumno() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [rows, setRows] = React.useState<CourseEnrollmentRow[]>([]);
  const [q, setQ] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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

  React.useEffect(() => {
    (async () => {
      setError("");
      setRows([]);
      if (!periodId) return;

      setLoading(true);
      try {
        const res = await api.get("/academic/course-enrollments/me", { params: { periodId, status: "active" } });
        setRows(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar mis materias");
      } finally {
        setLoading(false);
      }
    })();
  }, [periodId]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const sub = r.subjectId ?? r.classAssignmentId?.subjectId ?? {};
      const tea = r.teacherId ?? r.classAssignmentId?.teacherId ?? {};
      const grp = r.groupId ?? r.classAssignmentId?.groupId ?? {};
      return (
        String(sub?.code ?? "").toLowerCase().includes(s) ||
        String(sub?.name ?? "").toLowerCase().includes(s) ||
        String(tea?.name ?? "").toLowerCase().includes(s) ||
        String(grp?.name ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  return (
    <DashboardLayout title="Mis materias">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-muted-foreground">Periodo</label>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
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

        <div>
          <label className="text-sm text-muted-foreground">Buscar</label>
          <Input className="mt-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Materia, docente o grupo" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materias del periodo</CardTitle>
          <CardDescription>{loading ? "Cargando..." : "Inscripciones activas por materia"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3">Clave</th>
                  <th className="text-left p-3">Materia</th>
                  <th className="text-left p-3">Grupo</th>
                  <th className="text-left p-3">Docente</th>
                  <th className="text-left p-3">Calificación</th>
                </tr>
              </thead>
              <tbody>
                {!periodId ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-muted-foreground">
                      Selecciona un periodo.
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-muted-foreground">
                      No hay materias para mostrar.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const sub = r.subjectId ?? r.classAssignmentId?.subjectId ?? {};
                    const grp = r.groupId ?? r.classAssignmentId?.groupId ?? {};
                    const tea = r.teacherId ?? r.classAssignmentId?.teacherId ?? {};

                    const grade =
                      r.finalGrade === null || r.finalGrade === undefined || Number.isNaN(Number(r.finalGrade))
                        ? "Pendiente"
                        : String(r.finalGrade);

                    return (
                      <tr key={r._id} className="border-t border-border">
                        <td className="p-3">{sub?.code ?? "-"}</td>
                        <td className="p-3 font-medium">{sub?.name ?? "-"}</td>
                        <td className="p-3">{grp?.name ?? "-"}</td>
                        <td className="p-3">{tea?.name ?? "-"}</td>
                        <td className="p-3">{grade}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
