import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Label } from "../../components/label";
import { Input } from "../../components/input";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts";

type Period = { _id: string; name: string; isActive: boolean };

type Overview = {
  periodId: string;
  periodName: string;
  config: { passThreshold: number; failRateMin: number; minCount: number; topN: number };
  summary: { total: number; withFinal: number; avgFinal: number | null; passed: number; failed: number; incomplete: number };
  distribution: Array<{ bucket: string; count: number }>;
  top: {
    groups: Array<{ groupId: string; groupName: string; avgFinal: number | null; withFinal: number; failRate: number }>;
    subjects: Array<{ subjectId: string; subjectCode: string; subjectName: string; avgFinal: number | null; withFinal: number; failRate: number }>;
    teachers: Array<{ teacherId: string; teacherName: string; avgFinal: number | null; withFinal: number; failRate: number }>;
  };
  redFlags: Array<{ subjectId: string; subjectCode: string; subjectName: string; withFinal: number; failRate: number; avgFinal: number | null }>;
};

function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

export default function DashboardAcademico() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [failRateMin, setFailRateMin] = React.useState("0.40");
  const [minCount, setMinCount] = React.useState("10");
  const [topN] = React.useState("10");

  const [mode, setMode] = React.useState<"groups" | "subjects" | "teachers">("groups");

  const [data, setData] = React.useState<Overview | null>(null);
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
    setData(null);
    if (!periodId) return;

    setLoading(true);
    try {
      const res = await api.get("/academic/analytics/grades/overview", {
        params: {
          periodId,
          failRateMin,
          minCount,
          topN,
        },
      });
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar dashboard académico");
    } finally {
      setLoading(false);
    }
  }, [periodId, failRateMin, minCount, topN]);

  React.useEffect(() => {
    load();
  }, [load]);

  const barData = React.useMemo(() => {
    if (!data) return [];
    if (mode === "groups") {
      return data.top.groups.map((g) => ({
        name: g.groupName || "—",
        avg: g.avgFinal ?? 0,
        failRate: Math.round((g.failRate ?? 0) * 1000) / 10, // %
      }));
    }
    if (mode === "subjects") {
      return data.top.subjects.map((s) => ({
        name: s.subjectCode || s.subjectName || "—",
        avg: s.avgFinal ?? 0,
        failRate: Math.round((s.failRate ?? 0) * 1000) / 10,
      }));
    }
    return data.top.teachers.map((t) => ({
      name: t.teacherName || "—",
      avg: t.avgFinal ?? 0,
      failRate: Math.round((t.failRate ?? 0) * 1000) / 10,
    }));
  }, [data, mode]);

  return (
    <DashboardLayout title="Dashboard académico (Calificaciones)">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Periodo + configuración de focos rojos</CardDescription>
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
            <Label>FailRate mínimo (0–1)</Label>
            <Input value={failRateMin} onChange={(e) => setFailRateMin(e.target.value)} placeholder="0.40" />
          </div>

          <div className="space-y-2">
            <Label>Mínimo de calificaciones</Label>
            <Input value={minCount} onChange={(e) => setMinCount(e.target.value)} placeholder="10" />
          </div>

          <div className="flex items-end gap-2">
            <Button variant="secondary" onClick={load} disabled={!periodId || loading}>
              Refrescar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>{data?.periodName ?? ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!data ? (
              <div className="text-muted-foreground">Cargando...</div>
            ) : (
              <>
                <div className="flex justify-between"><span>Total inscripciones</span><span className="font-medium">{data.summary.total}</span></div>
                <div className="flex justify-between"><span>Con final</span><span className="font-medium">{data.summary.withFinal}</span></div>
                <div className="flex justify-between"><span>Promedio final</span><span className="font-medium">{data.summary.avgFinal ?? "-"}</span></div>
                <div className="flex justify-between"><span>Aprobadas</span><span className="font-medium">{data.summary.passed}</span></div>
                <div className="flex justify-between"><span>Reprobadas</span><span className="font-medium">{data.summary.failed}</span></div>
                <div className="flex justify-between"><span>Incompletas</span><span className="font-medium">{data.summary.incomplete}</span></div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribución de calificaciones</CardTitle>
            <CardDescription>Bins: 0–59, 60–69, 70–79, 80–89, 90–100</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.distribution ?? []} dataKey="count" nameKey="bucket" outerRadius={95} label />
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Promedios: toggle */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Promedios (Top N)</CardTitle>
          <CardDescription>Promedio final y % reprobación (failRate) por grupo/materia/docente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant={mode === "groups" ? "default" : "secondary"} onClick={() => setMode("groups")}>
              Por grupo
            </Button>
            <Button variant={mode === "subjects" ? "default" : "secondary"} onClick={() => setMode("subjects")}>
              Por materia
            </Button>
            <Button variant={mode === "teachers" ? "default" : "secondary"} onClick={() => setMode("teachers")}>
              Por docente
            </Button>
          </div>

          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-15} height={70} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Nota: “failRate” se usa en focos rojos; aquí la gráfica muestra el promedio. Si quieres, metemos otra gráfica para failRate.
          </div>
        </CardContent>
      </Card>

      {/* Focos rojos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Focos rojos (materias con alta reprobación)</CardTitle>
          <CardDescription>
            failRate ≥ {failRateMin} y mínimo {minCount} calificaciones finales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3">Clave</th>
                  <th className="text-left p-3">Materia</th>
                  <th className="text-left p-3"># Finals</th>
                  <th className="text-left p-3">FailRate</th>
                  <th className="text-left p-3">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {!data ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">Cargando...</td></tr>
                ) : (data.redFlags?.length ?? 0) === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-muted-foreground">Sin focos rojos con la configuración actual.</td></tr>
                ) : (
                  data.redFlags.map((r) => (
                    <tr key={r.subjectId} className="border-t border-border">
                      <td className="p-3 font-medium">{r.subjectCode || "-"}</td>
                      <td className="p-3">{r.subjectName || "-"}</td>
                      <td className="p-3">{r.withFinal}</td>
                      <td className="p-3">{pct(r.failRate)}</td>
                      <td className="p-3">{r.avgFinal ?? "-"}</td>
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
