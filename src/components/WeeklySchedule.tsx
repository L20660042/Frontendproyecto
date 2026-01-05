type Block = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  type: "class" | "extracurricular";
  groupId?: any;
  subjectId?: any;
  teacherId?: any;
};

const dayNames: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 7: "Domingo",
};

export default function WeeklySchedule({ blocks }: { blocks: Block[] }) {
  const byDay: Record<number, Block[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

  for (const b of blocks) byDay[b.dayOfWeek]?.push(b);
  for (const d of Object.keys(byDay)) {
    byDay[Number(d)].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {([1, 2, 3, 4, 5, 6, 7] as const).map((d) => (
          <div key={d} className="rounded-xl border border-border bg-card p-3">
            <div className="font-semibold mb-2">{dayNames[d]}</div>
            {byDay[d].length === 0 ? (
              <div className="text-sm text-muted-foreground">Sin bloques</div>
            ) : (
              <div className="space-y-2">
                {byDay[d].map((b) => (
                  <div key={b._id} className="rounded-lg border border-border bg-muted/50 p-2">
                    <div className="text-sm font-semibold">
                      {b.startTime}–{b.endTime} {b.room ? `(${b.room})` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.subjectId?.name ? b.subjectId.name : "Sin materia"}{" "}
                      {b.groupId?.name ? `· ${b.groupId.name}` : ""}
                    </div>
                    {b.teacherId?.name ? (
                      <div className="text-xs text-muted-foreground">{b.teacherId.name}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
