import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";

// Gráficas
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

type KardexRow = {
  _id: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  groupName: string;
  unitGrades: { u1?: number; u2?: number; u3?: number; u4?: number; u5?: number };
  finalGrade: number | null;
  status: "active" | "inactive";
};

type KardexResponse = {
  periodId: string;
  periodName: string;
  summary: {
    total: number;
    withFinal: number;
    avgFinal: number | null;
    passed: number;
    failed: number;
    incomplete: number;
    passThreshold: number;
  };
  rows: KardexRow[];
};

function toCSV(rows: KardexRow[], periodName: string) {
  const headers = [
    "Periodo",
    "Clave",
    "Materia",
    "Grupo",
    "Docente",
    "U1",
    "U2",
    "U3",
    "U4",
    "U5",
    "Final",
  ];

  const esc = (v: any) => {
    const s = String(v ?? "");
    const needsQuotes = /[",\n]/.test(s);
    const cleaned = s.replace(/"/g, '""');
    return needsQuotes ? `"${cleaned}"` : cleaned;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        periodName,
        r.subjectCode,
        r.subjectName,
        r.groupName,
        r.teacherName,
        r.unitGrades?.u1 ?? "",
        r.unitGrades?.u2 ?? "",
        r.unitGrades?.u3 ?? "",
        r.unitGrades?.u4 ?? "",
        r.unitGrades?.u5 ?? "",
        r.finalGrade ?? "",
      ]
        .map(esc)
        .join(",")
    ),
  ];

  return lines.join("\n");
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function KardexAlumno() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<KardexResponse | null>(null);

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
      const res = await api.get("/academic/course-enrollments/me/kardex", { params: { periodId } });
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar kardex");
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const rows = React.useMemo(() => {
    const list = data?.rows ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((r) => {
      const m = `${r.subjectCode} ${r.subjectName} ${r.teacherName} ${r.groupName}`.toLowerCase();
      return m.includes(s);
    });
  }, [data, q]);

  const barData = React.useMemo(() => {
    // solo materias con final
    return (data?.rows ?? [])
      .filter((r) => typeof r.finalGrade === "number")
      .map((r) => ({
        name: r.subjectCode || r.subjectName,
        final: r.finalGrade as number,
      }));
  }, [data]);

  const pieData = React.useMemo(() => {
    const s = data?.summary;
    if (!s) return [];
    return [
      { name: "Aprobadas", value: s.passed },
      { name: "Reprobadas", value: s.failed },
      { name: "Incompletas", value: s.incomplete },
    ];
  }, [data]);

  const copyCSV = async () => {
    if (!data) return;
    const csv = toCSV(data.rows, data.periodName || "");
    try {
      await navigator.clipboard.writeText(csv);
      // sin alertas invasivas; si quieres UI toast lo agregamos después
    } catch {
      // fallback: descarga
      downloadCSV("kardex.csv", csv);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const csv = toCSV(data.rows, data.periodName || "");
    const filename = `kardex_${(data.periodName || "periodo").replace(/\s+/g, "_")}.csv`.toLowerCase();
    downloadCSV(filename, csv);
  };

  return (
    <DashboardLayout title="Kardex por periodo">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtro</CardTitle>
          <CardDescription>Selecciona el periodo y consulta tu kardex con promedio, estados y export.</CardDescription>
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
              placeholder="Materia, clave, docente o grupo"
              disabled={!periodId}
            />
          </div>

          <div className="flex gap-2 items-end">
            <Button variant="secondary" onClick={load} disabled={!periodId || loading}>
              Refrescar
            </Button>
            <Button onClick={copyCSV} disabled={!data || (data?.rows?.length ?? 0) === 0}>
              Copiar CSV
            </Button>
            <Button variant="secondary" onClick={exportCSV} disabled={!data || (data?.rows?.length ?? 0) === 0}>
              Descargar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Indicadores del periodo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!data ? (
              <div className="text-muted-foreground">Cargando...</div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Total materias</span>
                  <span className="font-medium">{data.summary.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Con calificación final</span>
                  <span className="font-medium">{data.summary.withFinal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Promedio final</span>
                  <span className="font-medium">{data.summary.avgFinal ?? "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aprobadas (≥ {data.summary.passThreshold})</span>
                  <span className="font-medium">{data.summary.passed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reprobadas</span>
                  <span className="font-medium">{data.summary.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incompletas</span>
                  <span className="font-medium">{data.summary.incomplete}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gráfica: Calificación final por materia</CardTitle>
            <CardDescription>Solo materias que ya tienen final capturada</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-15} height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="final" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Gráfica: Estado del periodo</CardTitle>
            <CardDescription>Aprobadas, reprobadas e incompletas</CardDescription>
          </CardHeader>
          <CardContent style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label />
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalle por materia</CardTitle>
          <CardDescription>U1–U5 y final</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3">Clave</th>
                  <th className="text-left p-3">Materia</th>
                  <th className="text-left p-3">Docente</th>
                  <th className="text-left p-3">Grupo</th>
                  <th className="text-left p-3">U1</th>
                  <th className="text-left p-3">U2</th>
                  <th className="text-left p-3">U3</th>
                  <th className="text-left p-3">U4</th>
                  <th className="text-left p-3">U5</th>
                  <th className="text-left p-3">Final</th>
                </tr>
              </thead>
              <tbody>
                {!periodId ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-muted-foreground">
                      Selecciona un periodo.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-4 text-muted-foreground">
                      Sin materias en el periodo (o no coincide la búsqueda).
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const ug = r.unitGrades ?? {};
                    return (
                      <tr key={r._id} className="border-t border-border">
                        <td className="p-3">{r.subjectCode || "-"}</td>
                        <td className="p-3 font-medium">{r.subjectName || "-"}</td>
                        <td className="p-3">{r.teacherName || "-"}</td>
                        <td className="p-3">{r.groupName || "-"}</td>
                        <td className="p-3">{ug.u1 ?? "-"}</td>
                        <td className="p-3">{ug.u2 ?? "-"}</td>
                        <td className="p-3">{ug.u3 ?? "-"}</td>
                        <td className="p-3">{ug.u4 ?? "-"}</td>
                        <td className="p-3">{ug.u5 ?? "-"}</td>
                        <td className="p-3 font-medium">{r.finalGrade ?? "-"}</td>
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
