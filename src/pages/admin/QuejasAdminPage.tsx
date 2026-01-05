import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";

type Period = { _id: string; name: string; isActive: boolean };

type ComplaintRow = {
  _id: string;
  category: string;
  description: string;
  status: string;
  resolutionNote?: string;
  teacherId?: any;
  studentId?: any;
  subjectId?: any;
  groupId?: any;
  analysis?: any;
  createdAt?: string;
};

const STATUS_OPTIONS = [
  { value: "open", label: "open" },
  { value: "in_review", label: "in_review" },
  { value: "resolved", label: "resolved" },
  { value: "rejected", label: "rejected" },
];

export default function QuejasAdminPage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [status, setStatus] = React.useState<string>("");

  const [rows, setRows] = React.useState<ComplaintRow[]>([]);
  const [draftStatus, setDraftStatus] = React.useState<Record<string, string>>({});
  const [draftNote, setDraftNote] = React.useState<Record<string, string>>({});

  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await api.get("/academic/periods");
        const list: Period[] = res.data ?? [];
        setPeriods(list);
        // IMPORTANTE:
        // En esta pantalla el periodo es opcional ("Todos").
        // Si autoseleccionamos el activo, el usuario ve "aparecen y desaparecen"
        // (primero carga todos, luego filtra al activo y puede quedar vacío).
        // Dejamos por defecto "Todos".
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar periodos");
      }
    })();
  }, []);

  const reload = React.useCallback(async () => {
    setError("");
    setOk("");
    setLoading(true);
    try {
      const res = await api.get("/feedback/complaints", { params: { periodId: periodId || undefined, status: status || undefined } });
      const list: ComplaintRow[] = res.data ?? [];
      setRows(list);

      const st: Record<string, string> = {};
      const nt: Record<string, string> = {};
      for (const r of list) {
        st[r._id] = r.status;
        nt[r._id] = r.resolutionNote ?? "";
      }
      setDraftStatus(st);
      setDraftNote(nt);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar quejas");
    } finally {
      setLoading(false);
    }
  }, [periodId, status]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  async function save(id: string) {
    setError("");
    setOk("");
    try {
      await api.patch(`/feedback/complaints/${id}/status`, {
        status: draftStatus[id],
        resolutionNote: draftNote[id] ?? "",
      });
      setOk("Estatus actualizado.");
      await reload();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al actualizar estatus");
    }
  }

  return (
    <DashboardLayout title="Bandeja de quejas (gestión)">
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

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-muted-foreground">Periodo (opcional)</label>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
          >
            <option value="">Todos</option>
            {periods.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
                {p.isActive ? " (Activo)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Estatus (opcional)</label>
          <select
            className="mt-1 h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>{loading ? "Cargando..." : "Actualizar estatus y agregar nota de resolución"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3">Docente</th>
                  <th className="text-left p-3">Alumno</th>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Descripción</th>
                  <th className="text-left p-3">IA (resumen)</th>
                  <th className="text-left p-3">Estatus</th>
                  <th className="text-left p-3">Nota</th>
                  <th className="text-left p-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-muted-foreground">
                      No hay quejas para mostrar.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r._id} className="border-t border-border align-top">
                      <td className="p-3">{r.teacherId?.name ?? "-"}</td>
                      <td className="p-3">{r.studentId?.name ?? r.studentId?.fullName ?? "-"}</td>
                      <td className="p-3">{r.category}</td>
                      <td className="p-3 max-w-[360px]">
                        <div className="whitespace-pre-wrap">{r.description}</div>
                      </td>
                      <td className="p-3 max-w-[280px]">
                        {r.analysis?.summary ? String(r.analysis.summary) : "-"}
                      </td>
                      <td className="p-3">
                        <select
                          className="h-10 w-full rounded-md border border-border bg-input px-2 text-sm"
                          value={draftStatus[r._id] ?? r.status}
                          onChange={(e) => setDraftStatus((prev) => ({ ...prev, [r._id]: e.target.value }))}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 min-w-[240px]">
                        <textarea
                          className="w-full rounded-md border border-border bg-input px-2 py-2 text-sm min-h-[80px]"
                          value={draftNote[r._id] ?? ""}
                          onChange={(e) => setDraftNote((prev) => ({ ...prev, [r._id]: e.target.value }))}
                          placeholder="Nota de resolución..."
                        />
                      </td>
                      <td className="p-3">
                        <Button size="sm" onClick={() => save(r._id)}>
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
