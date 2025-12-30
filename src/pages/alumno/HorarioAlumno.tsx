import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import WeeklyScheduleGrid, { type ScheduleBlockUI } from "../../components/schedule/WeeklyScheduleGrid";
import { Alert, AlertDescription } from "../../components/alert";
import { Button } from "../../components/button";

type Period = { _id: string; name: string; isActive: boolean };

export default function StudentSchedulePage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [blocks, setBlocks] = React.useState<ScheduleBlockUI[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const selectedPeriod = React.useMemo(
    () => periods.find((p) => p._id === periodId) ?? null,
    [periods, periodId]
  );

  const downloadCsv = React.useCallback(() => {
    if (!blocks.length) return;

    const dayLabel = (d: number) =>
      ({ 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo" } as any)[
        d
      ] ?? String(d);

    const normMode = (m?: string) => {
      const s = String(m ?? "").trim().toLowerCase().replace(/\s+/g, "");
      if (!s) return "presencial";
      if (s === "presencial") return "presencial";
      if (s === "semipresencial" || s === "semi-presencial") return "semipresencial";
      if (s === "asincrono" || s === "asíncrono") return "asincrono";
      return "presencial";
    };

    const rows = [...blocks]
      .sort(
        (a, b) =>
          a.dayOfWeek - b.dayOfWeek ||
          a.startTime.localeCompare(b.startTime) ||
          (a.subjectName ?? "").localeCompare(b.subjectName ?? "")
      )
      .map((b) => [
        dayLabel(b.dayOfWeek),
        b.startTime,
        b.endTime,
        b.subjectName ?? "",
        b.groupName ?? "",
        b.room ?? "",
        b.teacherName ?? "",
        normMode(b.deliveryMode),
      ]);

    const header = ["Día", "Inicio", "Fin", "Materia", "Grupo", "Aula", "Docente", "Modalidad"];
    const csv = [header, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const v = String(cell ?? "");
            const escaped = v.replaceAll('"', '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    // BOM para que Excel respete acentos
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const pName = (selectedPeriod?.name ?? "periodo").replaceAll("/", "-").replaceAll(" ", "_");
    a.href = url;
    a.download = `horario_${pName}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [blocks, selectedPeriod]);

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
      setBlocks([]);
      if (!periodId) return;

      try {
        setLoading(true);
        const res = await api.get("/academic/schedule/me", { params: { periodId } });
        const ui: ScheduleBlockUI[] = (res.data ?? []).map((b: any) => ({
          _id: b._id,
          dayOfWeek: b.dayOfWeek,
          startTime: b.startTime,
          endTime: b.endTime,
          room: b.room,
          deliveryMode: b.deliveryMode,
          subjectName: b.subjectId?.name ?? b.subject?.name,
          teacherName: b.teacherId?.name ?? b.teacher?.name,
          groupName: b.groupId?.name ?? b.group?.name,
        }));
        setBlocks(ui);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar mi horario");
      } finally {
        setLoading(false);
      }
    })();
  }, [periodId]);

  return (
    <DashboardLayout title="Mi horario">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!periodId || loading || blocks.length === 0}
            onClick={downloadCsv}
            title="Descargar mi horario en CSV"
          >
            Descargar horario
          </Button>
        </div>
      </div>

      <WeeklyScheduleGrid
        title="Horario semanal"
        description={loading ? "Cargando..." : "Clases del periodo (multi-grupo + empalmes permitidos)"}
        blocks={blocks}
      />
    </DashboardLayout>
  );
}
