import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";

export type ScheduleBlockUI = {
  _id: string;
  dayOfWeek: number; // 1..7 (Lun..Dom)
  startTime: string; // "08:00"
  endTime: string;   // "09:50"
  room?: string;
  subjectName?: string;
  teacherName?: string;
  groupName?: string;
};

const DAYS = [
  { v: 1, label: "Lun" },
  { v: 2, label: "Mar" },
  { v: 3, label: "Mié" },
  { v: 4, label: "Jue" },
  { v: 5, label: "Vie" },
  { v: 6, label: "Sáb" },
  { v: 7, label: "Dom" },
];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function WeeklyScheduleGrid({
  title = "Horario semanal",
  description = "Vista semanal",
  blocks,
  startHour = 7,
  endHour = 20,
}: {
  title?: string;
  description?: string;
  blocks: ScheduleBlockUI[];
  startHour?: number; // 7 = 07:00
  endHour?: number;   // 20 = 20:00
}) {
  const startMin = startHour * 60;
  const endMin = endHour * 60;

  const rows = React.useMemo(() => {
    // intervalos de 30 min
    const step = 30;
    const result: number[] = [];
    for (let m = startMin; m <= endMin; m += step) result.push(m);
    return result;
  }, [startMin, endMin]);

  // Agrupa por día
  const byDay = React.useMemo(() => {
    const map = new Map<number, ScheduleBlockUI[]>();
    for (const d of DAYS) map.set(d.v, []);
    for (const b of blocks) {
      if (!map.has(b.dayOfWeek)) map.set(b.dayOfWeek, []);
      map.get(b.dayOfWeek)!.push(b);
    }
    for (const [k, v] of map.entries()) {
      v.sort((a, b) => a.startTime.localeCompare(b.startTime));
      map.set(k, v);
    }
    return map;
  }, [blocks]);

  // Calcula estilo absoluto dentro de cada columna (día)
  const computeStyle = (b: ScheduleBlockUI) => {
    const top = Math.max(0, timeToMinutes(b.startTime) - startMin);
    const height = Math.max(20, timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    const total = endMin - startMin;
    return {
      top: `${(top / total) * 100}%`,
      height: `${(height / total) * 100}%`,
    } as React.CSSProperties;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2">
          {/* Header */}
          <div className="text-xs text-muted-foreground" />
          {DAYS.slice(0, 5).map((d) => (
            <div key={d.v} className="text-xs font-medium text-muted-foreground">
              {d.label}
            </div>
          ))}

          {/* Body: horas + columnas */}
          <div className="space-y-0.5">
            {rows.map((m) => (
              <div key={m} className="h-8 text-xs text-muted-foreground flex items-center">
                {minutesToTime(m)}
              </div>
            ))}
          </div>

          {DAYS.slice(0, 5).map((d) => (
            <div key={d.v} className="relative border border-border rounded-lg bg-card overflow-hidden">
              {/* rejilla */}
              <div className="absolute inset-0">
                {rows.map((m) => (
                  <div key={m} className="h-8 border-b border-border/50" />
                ))}
              </div>

              {/* bloques */}
              <div className="absolute inset-0 p-1">
                {(byDay.get(d.v) ?? []).map((b) => (
                  <div
                    key={b._id}
                    className="absolute left-1 right-1 rounded-md border border-border bg-muted/70 p-2 shadow-sm"
                    style={computeStyle(b)}
                    title={`${b.subjectName ?? ""} ${b.startTime}-${b.endTime}`}
                  >
                    <div className="text-xs font-semibold truncate">
                      {b.subjectName ?? "Materia"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {b.startTime} - {b.endTime}{b.room ? ` • ${b.room}` : ""}
                    </div>
                    {b.teacherName ? (
                      <div className="text-[11px] text-muted-foreground truncate">{b.teacherName}</div>
                    ) : null}
                    {b.groupName ? (
                      <div className="text-[11px] text-muted-foreground truncate">{b.groupName}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Nota: por simplicidad la vista muestra Lun–Vie. Sábado/Domingo se agrega igual si lo necesitas.
        </p>
      </CardContent>
    </Card>
  );
}
