import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";

type Period = { _id: string; name: string; isActive: boolean };

export default function CalidadDocentePage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [data, setData] = React.useState<any>(null);
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
      if (!periodId) return;
      setError("");
      setLoading(true);
      try {
        const res = await api.get("/feedback/analytics/overview", { params: { periodId } });
        setData(res.data ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar analítica");
      } finally {
        setLoading(false);
      }
    })();
  }, [periodId]);

  const items = data?.items ?? [];
  const teachers = data?.teachers ?? [];

  return (
    <DashboardLayout title="Analítica: Calidad docente">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Overview por docente</CardTitle>
          <CardDescription>{loading ? "Cargando..." : "Quejas + promedio de evaluación (1..5)"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3">Docente</th>
                  <th className="text-left p-3"># Eval</th>
                  <th className="text-left p-3"># Quejas</th>
                  <th className="text-left p-3">Quejas abiertas</th>
                  {items.map((it: any) => (
                    <th key={it.key} className="text-left p-3">
                      {it.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!periodId ? (
                  <tr>
                    <td colSpan={4 + items.length} className="p-4 text-muted-foreground">
                      Selecciona un periodo.
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4 + items.length} className="p-4 text-muted-foreground">
                      Sin datos para este periodo.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t: any) => (
                    <tr key={t.teacherId} className="border-t border-border">
                      <td className="p-3 font-medium">{t.teacherName || "-"}</td>
                      <td className="p-3">{t.countEvaluations ?? 0}</td>
                      <td className="p-3">{t.countComplaints ?? 0}</td>
                      <td className="p-3">{t.complaintsOpen ?? 0}</td>
                      {items.map((it: any) => (
                        <td key={it.key} className="p-3">
                          {t.averages?.[it.key] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Ordenado por más quejas abiertas y luego peor promedio (proxy: clarity).
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
