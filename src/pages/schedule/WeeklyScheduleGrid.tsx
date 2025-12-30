import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";

export type ScheduleBlockUI = {
  _id: string;
  dayOfWeek: number; // 1..7 (Lun..Dom)
  startTime: string; // "08:00"
  endTime: string;   // "09:50"
  room?: string;
  deliveryMode?: "presencial" | "semipresencial" | "asincrono" | string;
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

function normalizeMode(mode?: string) {
  const s = String(mode ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  if (!s) return "presencial";
  if (s === "presencial") return "presencial";
  if (s === "semipresencial" || s === "semi-presencial") return "semipresencial";
  if (s === "asincrono" || s === "asíncrono") return "asincrono";
  return "presencial";
}

function modeLabel(mode?: string) {
  const m = normalizeMode(mode);
  if (m === "presencial") return "Presencial";
  if (m === "semipresencial") return "Semi";
  if (m === "asincrono") return "Async";
  return "Presencial";
}

type BlockLayout = ScheduleBlockUI & {
  __startMin: number;
  __endMin: number;
  __col: number;
  __cols: number;
};

function buildLayoutForDay(dayBlocks: ScheduleBlockUI[]): BlockLayout[] {
  const blocks = (dayBlocks ?? [])
    .map((b) => ({
      ...b,
      __startMin: timeToMinutes(b.startTime),
      __endMin: timeToMinutes(b.endTime),
      __col: 0,
      __cols: 1,
    }))
    .sort((a, b) => a.__startMin - b.__startMin || a.__endMin - b.__endMin);

  // Agrupar en clusters por traslape transitivo
  const clusters: BlockLayout[][] = [];
  let current: BlockLayout[] = [];
  let currentEnd = -1;

  for (const b of blocks) {
    if (current.length === 0) {
      current = [b];
      currentEnd = b.__endMin;
      continue;
    }

    if (b.__startMin < currentEnd) {
      current.push(b);
      currentEnd = Math.max(currentEnd, b.__endMin);
    } else {
      clusters.push(current);
      current = [b];
      currentEnd = b.__endMin;
    }
  }
  if (current.length) clusters.push(current);

  // Para cada cluster: asignar columnas por interval partition
  const out: BlockLayout[] = [];

  for (const cluster of clusters) {
    const active: Array<{ end: number; col: number }> = [];
    const freeCols: number[] = [];
    let nextCol = 0;
    let maxCols = 1;

    for (const b of cluster) {
      // liberar columnas
      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i].end <= b.__startMin) {
          freeCols.push(active[i].col);
          active.splice(i, 1);
        }
      }
      freeCols.sort((x, y) => x - y);

      const col = freeCols.length ? (freeCols.shift() as number) : nextCol++;
      b.__col = col;
      active.push({ end: b.__endMin, col });
      maxCols = Math.max(maxCols, nextCol);
    }

    for (const b of cluster) {
      b.__cols = Math.max(1, maxCols);
      out.push(b);
    }
  }

  return out;
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

  // Layout (manejo de empalmes): por día
  const layoutByDay = React.useMemo(() => {
    const map = new Map<number, BlockLayout[]>();
    for (const d of DAYS) {
      map.set(d.v, buildLayoutForDay(byDay.get(d.v) ?? []));
    }
    return map;
  }, [byDay]);

  // Calcula estilo absoluto dentro de cada columna (día)
  const computeStyle = (b: BlockLayout) => {
    const top = Math.max(0, b.__startMin - startMin);
    const height = Math.max(22, b.__endMin - b.__startMin);
    const total = endMin - startMin;

    // Column splitting for overlaps
    const cols = Math.max(1, b.__cols);
    const col = Math.max(0, Math.min(cols - 1, b.__col));
    const width = 100 / cols;
    const left = col * width;

    // pequeño padding para que se vea separación
    const gutter = cols > 1 ? 1.5 : 0;

    return {
      top: `${(top / total) * 100}%`,
      height: `${(height / total) * 100}%`,
      left: `calc(${left}% + ${gutter}px)`,
      width: `calc(${width}% - ${gutter * 2}px)`,
      zIndex: 10 + col,
    } as React.CSSProperties;
  };

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2 py-0.5 text-[10px] font-medium">
      {children}
    </span>
  );

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
                {(layoutByDay.get(d.v) ?? []).map((b) => (
                  <div
                    key={b._id}
                    className="absolute rounded-md border border-border bg-muted/70 p-2 shadow-sm"
                    style={computeStyle(b)}
                    title={`${b.subjectName ?? ""} ${b.startTime}-${b.endTime}`}
                  >
                    <div className="text-xs font-semibold truncate">
                      {b.subjectName ?? "Materia"}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {b.startTime} - {b.endTime}
                    </div>

                    {b.teacherName ? (
                      <div className="text-[11px] text-muted-foreground truncate">{b.teacherName}</div>
                    ) : null}

                    {/* ✅ Abajo: Grupo + Modalidad (badges) + Aula */}
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {b.groupName ? <Badge>{b.groupName}</Badge> : null}
                      <Badge>{modeLabel(b.deliveryMode)}</Badge>
                      {b.room ? (
                        <span className="text-[11px] text-muted-foreground truncate">Aula: {b.room}</span>
                      ) : null}
                    </div>
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
