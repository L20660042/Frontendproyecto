import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import WeeklyScheduleGrid, { type ScheduleBlockUI } from "../../components/schedule/WeeklyScheduleGrid";
import { Alert, AlertDescription } from "../../components/alert";

type Period = { _id: string; name: string; isActive: boolean };

export default function TeacherSchedulePage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [blocks, setBlocks] = React.useState<ScheduleBlockUI[]>([]);
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

  React.useEffect(() => {
    (async () => {
      setError("");
      setBlocks([]);
      if (!periodId) return;

      try {
        const res = await api.get("/academic/schedule/me", { params: { periodId } });
        const ui: ScheduleBlockUI[] = (res.data ?? []).map((b: any) => ({
          _id: b._id,
          dayOfWeek: b.dayOfWeek,
          startTime: b.startTime,
          endTime: b.endTime,
          room: b.room,
          deliveryMode: b.deliveryMode, // ✅ AQUI (para badge Presencial/Semi/Async)
          subjectName: b.subjectId?.name ?? b.subject?.name,
          teacherName: b.teacherId?.name ?? b.teacher?.name,
          groupName: b.groupId?.name ?? b.group?.name,
        }));
        setBlocks(ui);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar mis clases");
      }
    })();
  }, [periodId]);

  return (
    <DashboardLayout title="Mis clases">
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

      <WeeklyScheduleGrid title="Horario semanal" description="Mis bloques de clase" blocks={blocks} />
    </DashboardLayout>
  );
}
