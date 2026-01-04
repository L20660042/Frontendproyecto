import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";

type Period = { _id: string; name: string; isActive: boolean };

type EvalItem = { key: string; label: string; min: number; max: number };

type CourseEnrollmentRow = {
  _id: string;
  classAssignmentId?: any;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
};

type TeacherEvaluationRow = {
  _id: string;
  classAssignmentId?: any;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
  ratings?: Record<string, number>;
  comment?: string;
  analysis?: any;
  createdAt?: string;
};

function pick(x: any, path: string[]) {
  let cur = x;
  for (const p of path) cur = cur?.[p];
  return cur;
}

export default function EvaluacionDocente() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [items, setItems] = React.useState<EvalItem[]>([]);
  const [enrollments, setEnrollments] = React.useState<CourseEnrollmentRow[]>([]);
  const [myEvals, setMyEvals] = React.useState<TeacherEvaluationRow[]>([]);

  const [classAssignmentId, setClassAssignmentId] = React.useState("");
  const [ratings, setRatings] = React.useState<Record<string, number>>({});
  const [comment, setComment] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setError("");
      try {
        const [pRes, fRes] = await Promise.all([
          api.get("/academic/periods"),
          api.get("/feedback/evaluations/form"),
        ]);

        const list: Period[] = pRes.data ?? [];
        setPeriods(list);
        const active = list.find((p) => p.isActive);
        if (active) setPeriodId(active._id);

        const formItems: EvalItem[] = fRes.data?.items ?? [];
        setItems(formItems);

        // init ratings default a 5
        const initial: Record<string, number> = {};
        for (const it of formItems) initial[it.key] = 5;
        setRatings(initial);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar formulario/periodos");
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
        api.get("/feedback/evaluations/me", { params: { periodId } }),
      ]);
      setEnrollments(ceRes.data ?? []);
      setMyEvals(meRes.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const evaluatedSet = React.useMemo(() => {
    const s = new Set<string>();
    for (const ev of myEvals) {
      const ca = pick(ev, ["classAssignmentId", "_id"]) ?? ev?.classAssignmentId;
      if (ca) s.add(String(ca));
    }
    return s;
  }, [myEvals]);

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
    // auto-select primera opción no evaluada
    if (!classAssignmentId && options.length) {
      const first = options.find((o) => !evaluatedSet.has(o.caId)) ?? options[0];
      setClassAssignmentId(first.caId);
    }
  }, [options, evaluatedSet, classAssignmentId]);

  async function submit() {
    setError("");
    setOk("");

    if (!periodId) return setError("Selecciona un periodo.");
    if (!classAssignmentId) return setError("Selecciona una materia/carga.");
    if (evaluatedSet.has(classAssignmentId)) return setError("Ya evaluaste esta carga en este periodo.");

    // validar ratings completos
    for (const it of items) {
      const v = Number(ratings[it.key]);
      if (!Number.isFinite(v) || v < 1 || v > 5) {
        return setError(`Rating inválido en: ${it.label}`);
      }
    }

    setLoading(true);
    try {
      await api.post("/feedback/evaluations", {
        periodId,
        classAssignmentId,
        ratings,
        comment: comment.trim(),
      });
      setOk("Evaluación registrada.");
      setComment("");
      await reload();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al registrar evaluación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Evaluación docente">
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
            <CardTitle>Enviar evaluación</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Selecciona una materia y califica 1..5"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Materia / Grupo / Docente</label>
              <select
                className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={classAssignmentId}
                onChange={(e) => setClassAssignmentId(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {options.map((o) => (
                  <option key={o.caId} value={o.caId}>
                    {o.label}
                    {evaluatedSet.has(o.caId) ? " (Ya evaluada)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.key} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                  <div className="text-sm">
                    <div className="font-medium">{it.label}</div>
                    <div className="text-xs text-muted-foreground">1 (bajo) – 5 (alto)</div>
                  </div>
                  <select
                    className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                    value={String(ratings[it.key] ?? 5)}
                    onChange={(e) => setRatings((prev) => ({ ...prev, [it.key]: Number(e.target.value) }))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Comentario (opcional)</label>
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-input px-3 py-2 text-sm min-h-[110px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe tu experiencia (la IA analizará sentimiento/temas)."
              />
            </div>

            <Button className="w-full" disabled={loading} onClick={submit}>
              Enviar evaluación
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis evaluaciones</CardTitle>
            <CardDescription>Historial en el periodo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Grupo</th>
                    <th className="text-left p-3">Docente</th>
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
                  ) : myEvals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Aún no has enviado evaluaciones.
                      </td>
                    </tr>
                  ) : (
                    myEvals.map((ev) => {
                      const sub = ev.subjectId ?? ev.classAssignmentId?.subjectId ?? {};
                      const grp = ev.groupId ?? ev.classAssignmentId?.groupId ?? {};
                      const tea = ev.teacherId ?? ev.classAssignmentId?.teacherId ?? {};
                      const summary = ev.analysis?.summary ? String(ev.analysis.summary) : "-";
                      return (
                        <tr key={ev._id} className="border-t border-border">
                          <td className="p-3">
                            <div className="font-medium">{sub?.name ?? "-"}</div>
                            <div className="text-xs text-muted-foreground">{sub?.code ?? ""}</div>
                          </td>
                          <td className="p-3">{grp?.name ?? "-"}</td>
                          <td className="p-3">{tea?.name ?? "-"}</td>
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
