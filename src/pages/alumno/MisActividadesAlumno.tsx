import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Alert, AlertDescription } from "../../components/alert";

type Period = { _id: string; name: string; isActive: boolean };

type Activity = {
  _id: string;
  name: string;
  type: string;
  responsibleName?: string | null;
  capacity?: number | null;
};

type MyActivityEnrollment = {
  _id: string;
  activityId: Activity;
};

type Block = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
};

const dayLabel: Record<number, string> = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom" };

export default function StudentActivitiesPage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [items, setItems] = React.useState<MyActivityEnrollment[]>([]);
  const [blocksByActivity, setBlocksByActivity] = React.useState<Record<string, Block[]>>({});
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
      setItems([]);
      setBlocksByActivity({});
      if (!periodId) return;

      try {
        const res = await api.get("/academic/activity-enrollments/me", { params: { periodId } });
        const list: MyActivityEnrollment[] = res.data ?? [];
        setItems(list);

        const uniqueActivityIds = Array.from(new Set(list.map((x) => x.activityId?._id).filter(Boolean))) as string[];
        const pairs = await Promise.all(
          uniqueActivityIds.map(async (aid) => {
            try {
              const r = await api.get("/academic/schedule-blocks", {
                params: { periodId, type: "extracurricular", activityId: aid },
              });
              return [aid, (r.data ?? []) as Block[]] as const;
            } catch {
              return [aid, [] as Block[]] as const;
            }
          }),
        );

        const map: Record<string, Block[]> = {};
        for (const [aid, blocks] of pairs) {
          map[aid] = blocks.slice().sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
        }
        setBlocksByActivity(map);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar mis actividades");
      }
    })();
  }, [periodId]);

  return (
    <DashboardLayout title="Mis actividades extraescolares">
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

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin actividades</CardTitle>
            <CardDescription>No tienes actividades extraescolares registradas en este periodo.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((it) => {
            const a = it.activityId;
            const blocks = blocksByActivity[a?._id] ?? [];
            return (
              <Card key={it._id}>
                <CardHeader>
                  <CardTitle>{a?.name}</CardTitle>
                  <CardDescription>
                    Tipo: <span className="font-medium">{a?.type}</span>
                    {a?.responsibleName ? <> · Responsable: <span className="font-medium">{a.responsibleName}</span></> : null}
                    {typeof a?.capacity === "number" ? <> · Cupo: <span className="font-medium">{a.capacity}</span></> : null}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">Horario de la actividad</div>
                  {blocks.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sin bloques de horario registrados.</div>
                  ) : (
                    <ul className="text-sm space-y-1">
                      {blocks.map((b) => (
                        <li key={b._id} className="flex items-center justify-between">
                          <span>
                            {dayLabel[b.dayOfWeek] ?? `Día ${b.dayOfWeek}`} {b.startTime}-{b.endTime}
                          </span>
                          <span className="text-muted-foreground">{b.room ?? "Sin aula"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
