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
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const CHART_COLORS = {
  primary: "var(--chart-1)",
  positive: "var(--chart-2)",
  neutral: "var(--chart-3)",
  negative: "var(--destructive)",
  unknown: "var(--muted-foreground)",
  cardStroke: "var(--card)",
} as const;

type Period = { _id: string; name: string; isActive: boolean };
type Teacher = { _id: string; name: string; employeeNumber?: string };
type Subject = { _id: string; code?: string; name: string };
type Group = { _id: string; name: string; semester?: number };

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

  // filtros extra
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);

  const [teacherId, setTeacherId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");

  const [data, setData] = React.useState<AiDashboard | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setError("");
      try {
        const [p, t, s] = await Promise.all([
          api.get("/academic/periods"),
          api.get("/academic/teachers"),
          api.get("/academic/subjects"),
        ]);

        const list: Period[] = p.data ?? [];
        setPeriods(list);
        setTeachers(t.data ?? []);
        setSubjects(s.data ?? []);

        const active = list.find((x) => x.isActive);
        if (active) setPeriodId(active._id);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar periodos");
      }
    })();
  }, []);

  // grupos dependen del periodo (para no mezclar distintos ciclos)
  React.useEffect(() => {
    (async () => {
      setGroups([]);
      setGroupId("");
      if (!periodId) return;
      setError("");

      const filterByPeriod = (list: any[]): Group[] => {
        return (list ?? []).filter((g) => {
          const pid = (g as any).periodId;
          const gPeriodId = typeof pid === "string" ? pid : pid?._id;
          // si no viene periodId en el documento, no filtramos para no dejarlo vacío
          if (!gPeriodId) return true;
          return String(gPeriodId) === String(periodId);
        });
      };

      try {
        // la API acepta periodId en la mayoría de pantallas; si no, se usa fallback sin params
        const res = await api.get("/academic/groups", { params: { periodId } });
        setGroups(filterByPeriod(res.data ?? []));
      } catch (e: any) {
        try {
          const res2 = await api.get("/academic/groups");
          setGroups(filterByPeriod(res2.data ?? []));
        } catch {
          setError(e?.response?.data?.message ?? "Error al cargar grupos");
        }
      }
    })();
  }, [periodId]);

  const load = React.useCallback(async () => {
    setError("");
    if (!periodId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        periodId,
        bucket,
        topN: String(topN),
      };
      if (teacherId) params.teacherId = teacherId;
      if (subjectId) params.subjectId = subjectId;
      if (groupId) params.groupId = groupId;

      const res = await api.get("/feedback/analytics/ai-dashboard", {
        // filtros opcionales (si el backend los soporta)
        params,
      });
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar dashboard IA");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [periodId, bucket, topN, teacherId, subjectId, groupId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const pieData = React.useMemo(() => {
    if (!data) return [];
    return [
      { id: "positive" as const, name: "Positivo", value: data.sentiment.positive },
      { id: "neutral" as const, name: "Neutro", value: data.sentiment.neutral },
      { id: "negative" as const, name: "Negativo", value: data.sentiment.negative },
      { id: "unknown" as const, name: "Sin clasificar", value: data.sentiment.unknown },
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
          <CardDescription>Periodo + materia + docente + grupo + granularidad + Top N</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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
            <Label>Grupo</Label>
            <select
              className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Todos</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                  {typeof g.semester === "number" ? ` (S${g.semester})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Materia</Label>
            <select
              className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Todas</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code ? `${s.code} — ` : ""}
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Docente</Label>
            <select
              className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
            >
              <option value="">Todos</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.employeeNumber ? `${t.employeeNumber} — ` : ""}
                  {t.name}
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

          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
            <Button variant="secondary" onClick={load} disabled={!periodId || loading}>
              Refrescar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTeacherId("");
                setSubjectId("");
                setGroupId("");
              }}
              disabled={loading}
            >
              Limpiar filtros
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
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
                  {pieData.map((entry, idx) => (
                    <Cell
                      key={`sent-${idx}`}
                      stroke={CHART_COLORS.cardStroke}
                      fill={CHART_COLORS[entry.id]}
                    />
                  ))}
                </Pie>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-15} height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="bucket" interval={0} angle={-15} height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill={CHART_COLORS.positive} />
              <Bar dataKey="neutral" stackId="a" fill={CHART_COLORS.neutral} />
              <Bar dataKey="negative" stackId="a" fill={CHART_COLORS.negative} />
              <Bar dataKey="unknown" stackId="a" fill={CHART_COLORS.unknown} />
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
