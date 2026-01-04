import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Label } from "../../components/label";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Period = { _id: string; name: string; isActive: boolean };

type AiDashboard = {
  periodId: string;
  bucket: "day" | "week" | "month";
  sentiment: { positive: number; neutral: number; negative: number; unknown: number };
  topTopics: Array<{ label: string; count: number; weight: number }>;
  sentimentTrend: Array<{ bucket: string; positive: number; neutral: number; negative: number; unknown: number }>;
  topTeachersByNegativity: Array<{
    teacherId: string;
    teacherName: string;
    total: number;
    negative: number;
    neutral: number;
    positive: number;
    negativeRate: number; // %
  }>;
};

export default function DashboardIAPage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [bucket, setBucket] = React.useState<"month" | "week" | "day">("month");
  const [topN, setTopN] = React.useState(10);

  const [data, setData] = React.useState<AiDashboard | null>(null);
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
    setError("");
    if (!periodId) return;
    setLoading(true);
    try {
      const res = await api.get("/feedback/analytics/ai-dashboard", {
        params: { periodId, bucket, topN: String(topN) },
      });
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar dashboard IA");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [periodId, bucket, topN]);

  React.useEffect(() => {
    load();
  }, [load]);

  const pieData = React.useMemo(() => {
    if (!data) return [];
    return [
      { name: "Positivo", value: data.sentiment.positive },
      { name: "Neutro", value: data.sentiment.neutral },
      { name: "Negativo", value: data.sentiment.negative },
      { name: "Sin clasificar", value: data.sentiment.unknown },
    ].filter((x) => x.value > 0);
  }, [data]);

  const topicsData = React.useMemo(() => {
    return (data?.topTopics ?? []).map((t) => ({ name: t.label, count: t.count }));
  }, [data]);

  const trendData = React.useMemo(() => {
    return data?.sentimentTrend ?? [];
  }, [data]);

  return (
    <DashboardLayout title="Dashboard IA (Retroalimentación docente)">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Periodo + granularidad + Top N</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-4">
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
            <Label>Granularidad</Label>
            <select
              className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
              value={bucket}
              onChange={(e) => setBucket(e.target.value as any)}
            >
              <option value="month">Mes</option>
              <option value="week">Semana</option>
              <option value="day">Día</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Top N temas</Label>
            <select
              className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
              value={String(topN)}
              onChange={(e) => setTopN(Number(e.target.value))}
            >
              {[5, 8, 10, 12, 15].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={load} disabled={!periodId || loading}>
              Refrescar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sentimiento</CardTitle>
            <CardDescription>Evaluaciones + quejas (IA)</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label />
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Temas más recurrentes</CardTitle>
            <CardDescription>Top {topN} (evaluaciones + quejas)</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-15} height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tendencia de sentimiento</CardTitle>
          <CardDescription>Serie por {bucket}</CardDescription>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" interval={0} angle={-15} height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" stackId="a" />
              <Bar dataKey="neutral" stackId="a" />
              <Bar dataKey="negative" stackId="a" />
              <Bar dataKey="unknown" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Docentes con mayor negatividad</CardTitle>
          <CardDescription>Ordenado por % negativo (mínimo 3 registros)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3">Docente</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-right p-3">Negativos</th>
                  <th className="text-right p-3">% Neg</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topTeachersByNegativity ?? []).map((r) => (
                  <tr key={r.teacherId} className="border-t border-border">
                    <td className="p-3">{r.teacherName || "—"}</td>
                    <td className="p-3 text-right">{r.total}</td>
                    <td className="p-3 text-right">{r.negative}</td>
                    <td className="p-3 text-right font-medium">{r.negativeRate.toFixed(1)}%</td>
                  </tr>
                ))}
                {!data?.topTeachersByNegativity?.length ? (
                  <tr className="border-t border-border">
                    <td className="p-3 text-muted-foreground" colSpan={4}>
                      Sin datos suficientes en este periodo.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
