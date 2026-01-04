import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";

type Period = { _id: string; name: string; isActive: boolean };

type CourseEnrollmentRow = {
  _id: string;
  classAssignmentId?: any;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
};

type ComplaintRow = {
  _id: string;
  category: string;
  description: string;
  status: string;
  teacherId?: any;
  subjectId?: any;
  groupId?: any;
  analysis?: any;
  createdAt?: string;
};

function pick(x: any, path: string[]) {
  let cur = x;
  for (const p of path) cur = cur?.[p];
  return cur;
}

const CATEGORY_OPTIONS = [
  { value: "trato", label: "Trato" },
  { value: "impuntualidad", label: "Impuntualidad" },
  { value: "evaluacion_injusta", label: "Evaluación injusta" },
  { value: "incumplimiento", label: "Incumplimiento" },
  { value: "acoso", label: "Acoso" },
  { value: "otro", label: "Otro" },
];

export default function QuejasAlumno() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [enrollments, setEnrollments] = React.useState<CourseEnrollmentRow[]>([]);
  const [myComplaints, setMyComplaints] = React.useState<ComplaintRow[]>([]);

  const [classAssignmentId, setClassAssignmentId] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORY_OPTIONS[0].value);
  const [description, setDescription] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");

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

  const reload = React.useCallback(async () => {
    if (!periodId) return;
    setError("");
    setOk("");
    setLoading(true);
    try {
      const [ceRes, meRes] = await Promise.all([
        api.get("/academic/course-enrollments/me", { params: { periodId, status: "active" } }),
        api.get("/feedback/complaints/me", { params: { periodId } }),
      ]);
      setEnrollments(ceRes.data ?? []);
      setMyComplaints(meRes.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const options = React.useMemo(() => {
    return enrollments.map((r) => {
      const caId = String(pick(r, ["classAssignmentId", "_id"]) ?? r.classAssignmentId ?? "");
      const sub = r.subjectId ?? r.classAssignmentId?.subjectId ?? {};
      const grp = r.groupId ?? r.classAssignmentId?.groupId ?? {};
      const tea = r.teacherId ?? r.classAssignmentId?.teacherId ?? {};
      const label = `${sub?.code ?? ""} ${sub?.name ?? "Materia"} — ${grp?.name ?? "Grupo"} — ${tea?.name ?? "Docente"}`;
      return { caId, label };
    });
  }, [enrollments]);

  React.useEffect(() => {
    if (!classAssignmentId && options.length) setClassAssignmentId(options[0].caId);
  }, [options, classAssignmentId]);

  async function submit() {
    setError("");
    setOk("");

    if (!periodId) return setError("Selecciona un periodo.");
    if (!description.trim()) return setError("Describe la queja.");

    setLoading(true);
    try {
      await api.post("/feedback/complaints", {
        periodId,
        classAssignmentId: classAssignmentId || null,
        category,
        description: description.trim(),
      });
      setOk("Queja registrada.");
      setDescription("");
      await reload();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al registrar queja");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Quejas">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert className="mb-4">
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrar queja</CardTitle>
            <CardDescription>La IA analizará el texto para detectar sentimiento/temas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Materia / Grupo / Docente (opcional)</label>
              <select
                className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={classAssignmentId}
                onChange={(e) => setClassAssignmentId(e.target.value)}
              >
                <option value="">(Queja general sin carga)</option>
                {options.map((o) => (
                  <option key={o.caId} value={o.caId}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Categoría</label>
              <select
                className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Descripción</label>
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm min-h-[140px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lo ocurrido con el mayor detalle posible."
              />
            </div>

            <Button className="w-full" disabled={loading} onClick={submit}>
              Enviar queja
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis quejas</CardTitle>
            <CardDescription>Estatus y resumen IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Categoría</th>
                    <th className="text-left p-3">Docente</th>
                    <th className="text-left p-3">Estatus</th>
                    <th className="text-left p-3">IA (resumen)</th>
                  </tr>
                </thead>
                <tbody>
                  {!periodId ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Selecciona un periodo.
                      </td>
                    </tr>
                  ) : myComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        No hay quejas registradas.
                      </td>
                    </tr>
                  ) : (
                    myComplaints.map((c) => {
                      const tea = c.teacherId ?? {};
                      const summary = c.analysis?.summary ? String(c.analysis.summary) : "-";
                      return (
                        <tr key={c._id} className="border-t border-border">
                          <td className="p-3">{c.category}</td>
                          <td className="p-3">{tea?.name ?? "-"}</td>
                          <td className="p-3">{c.status}</td>
                          <td className="p-3">{summary}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
