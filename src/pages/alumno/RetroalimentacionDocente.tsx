import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";

type Period = { _id: string; name: string; isActive: boolean };

export default function RetroalimentacionDocente() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [evalSummary, setEvalSummary] = React.useState<any>(null);
  const [compSummary, setCompSummary] = React.useState<any>(null);

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
        const [eRes, cRes] = await Promise.all([
          api.get("/feedback/evaluations/teachers/me/summary", { params: { periodId } }),
          api.get("/feedback/complaints/teachers/me/summary", { params: { periodId } }),
        ]);
        setEvalSummary(eRes.data ?? null);
        setCompSummary(cRes.data ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar retroalimentación");
      } finally {
        setLoading(false);
      }
    })();
  }, [periodId]);

  return (
    <DashboardLayout title="Retroalimentación (IA)">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evaluaciones</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Promedios + IA (temas/sentimiento)"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">{evalSummary?.totalEvaluations ?? 0}</span>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {(evalSummary?.items ?? []).map((it: any) => (
                    <tr key={it.key} className="border-t border-border">
                      <td className="p-3">{it.label}</td>
                      <td className="p-3">{evalSummary?.averages?.[it.key] ?? 0}</td>
                    </tr>
                  ))}
                  {!evalSummary?.items?.length ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-muted-foreground">
                        Sin datos.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium">Top temas (IA)</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(evalSummary?.topTopics ?? []).map((t: any) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground border border-border"
                  >
                    {t.label} ({t.count})
                  </span>
                ))}
                {!evalSummary?.topTopics?.length ? (
                  <span className="text-sm text-muted-foreground">Sin temas aún.</span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quejas</CardTitle>
            <CardDescription>Conteo por estatus/categoría + temas IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">{compSummary?.totalComplaints ?? 0}</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="border border-border rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Por estatus</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {Object.entries(compSummary?.byStatus ?? {}).map(([k, v]) => (
                    <div key={k}>
                      {k}: <span className="font-medium text-foreground">{String(v)}</span>
                    </div>
                  ))}
                  {Object.keys(compSummary?.byStatus ?? {}).length === 0 ? <div>Sin datos.</div> : null}
                </div>
              </div>

              <div className="border border-border rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Por categoría</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {Object.entries(compSummary?.byCategory ?? {}).map(([k, v]) => (
                    <div key={k}>
                      {k}: <span className="font-medium text-foreground">{String(v)}</span>
                    </div>
                  ))}
                  {Object.keys(compSummary?.byCategory ?? {}).length === 0 ? <div>Sin datos.</div> : null}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium">Top temas (IA)</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(compSummary?.topTopics ?? []).map((t: any) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground border border-border"
                  >
                    {t.label} ({t.count})
                  </span>
                ))}
                {!compSummary?.topTopics?.length ? (
                  <span className="text-sm text-muted-foreground">Sin temas aún.</span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
