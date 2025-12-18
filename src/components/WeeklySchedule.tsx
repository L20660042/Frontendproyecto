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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12 }}>
      {([1,2,3,4,5,6,7] as const).map((d) => (
        <div key={d} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{dayNames[d]}</div>
          {byDay[d].length === 0 ? (
            <div style={{ opacity: 0.6 }}>Sin bloques</div>
          ) : (
            byDay[d].map((b) => (
              <div key={b._id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>
                  {b.startTime}–{b.endTime} {b.room ? `(${b.room})` : ""}
                </div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>
                  {b.subjectId?.name ? b.subjectId.name : "Sin materia"}{" "}
                  {b.groupId?.name ? `· ${b.groupId.name}` : ""}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {b.teacherId?.name ? b.teacherId.name : ""}
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
