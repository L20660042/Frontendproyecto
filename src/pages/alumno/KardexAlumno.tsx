import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";

type Period = { _id: string; name: string; isActive: boolean };

type Row = {
  _id: string;
  status?: "active" | "inactive";
  finalGrade?: number | null;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
  classAssignmentId?: any;
};

function csvEscape(v: any) {
  const s = String(v ?? "");
  const needsQuotes = /[",\n]/.test(s);
  const cleaned = s.replace(/"/g, '""');
  return needsQuotes ? `"${cleaned}"` : cleaned;
}

function downloadTextFile(filename: string, text: string, mime = "text/csv;charset=utf-8;") {
  const bom = "\uFEFF";
  const blob = new Blob([bom + text], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeFilename(s: string) {
  const plain = String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return plain
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

export default function KardexAlumno() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [q, setQ] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const selectedPeriod = React.useMemo(() => periods.find((p) => p._id === periodId) ?? null, [periods, periodId]);

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
        // Kardex del periodo: intenta traer todo lo del periodo.
        // Si tu backend sólo devuelve activos, igual funciona como MVP del periodo.
        const res = await api.get("/academic/course-enrollments/me", { params: { periodId } });
        setRows(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar kardex");
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

  const metrics = React.useMemo(() => {
    const graded = rows.filter((r) => r.finalGrade !== null && r.finalGrade !== undefined && !Number.isNaN(Number(r.finalGrade)));
    const avg =
      graded.length === 0
        ? null
        : graded.reduce((acc, r) => acc + Number(r.finalGrade), 0) / graded.length;

    return {
      total: rows.length,
      graded: graded.length,
      pending: rows.length - graded.length,
      avg: avg === null ? null : Math.round(avg * 100) / 100,
    };
  }, [rows]);

  const downloadCsv = () => {
    if (!selectedPeriod) return;
    const lines: string[] = [];

    lines.push(csvEscape("Tecnológico Nacional de México — Campus Matehuala"));
    lines.push(csvEscape("KARDEX DEL PERIODO"));
    lines.push("");
    lines.push(csvEscape(`PERIODO: ${selectedPeriod.name}`));
    lines.push("");

    const header = ["Clave", "Materia", "Grupo", "Docente", "Estatus", "Calificación final"];
    lines.push(header.map(csvEscape).join(","));

    const sorted = [...filtered].sort((a, b) => {
      const as = String((a.subjectId ?? a.classAssignmentId?.subjectId)?.name ?? "").toLowerCase();
      const bs = String((b.subjectId ?? b.classAssignmentId?.subjectId)?.name ?? "").toLowerCase();
      return as.localeCompare(bs, "es", { sensitivity: "base" });
    });

    sorted.forEach((r) => {
      const sub = r.subjectId ?? r.classAssignmentId?.subjectId ?? {};
      const grp = r.groupId ?? r.classAssignmentId?.groupId ?? {};
      const tea = r.teacherId ?? r.classAssignmentId?.teacherId ?? {};
      const grade =
        r.finalGrade === null || r.finalGrade === undefined || Number.isNaN(Number(r.finalGrade))
          ? ""
          : String(r.finalGrade);

      lines.push(
        [
          sub?.code ?? "",
          sub?.name ?? "",
          grp?.name ?? "",
          tea?.name ?? "",
          r.status ?? "",
          grade,
        ].map(csvEscape).join(","),
      );
    });

    const filename = `kardex_${safeFilename(selectedPeriod.name)}.csv`;
    downloadTextFile(filename, lines.join("\n"));
  };

  return (
    <DashboardLayout title="Kardex">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
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

        <div className="flex gap-2">
          <Button variant="outline" disabled={!periodId || loading || rows.length === 0} onClick={downloadCsv}>
            Descargar CSV
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
            <CardDescription>Materias</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calificadas</CardTitle>
            <CardDescription>Con final</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.graded}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>Sin final</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Promedio</CardTitle>
            <CardDescription>Calificadas</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.avg ?? "-"}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>{loading ? "Cargando..." : "Materias del periodo (kardex)"}</CardDescription>
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
                  <th className="text-left p-3">Estatus</th>
                  <th className="text-left p-3">Final</th>
                </tr>
              </thead>
              <tbody>
                {!periodId ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-muted-foreground">
                      Selecciona un periodo.
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-muted-foreground">
                      Sin registros.
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
                        <td className="p-3">{r.status ?? "-"}</td>
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
