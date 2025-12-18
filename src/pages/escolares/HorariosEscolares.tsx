import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

export default function HorariosEscolares() {
  const { periodId, logout } = useAuth();

  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:00");
  const [room, setRoom] = useState("A-101");

  const [blocks, setBlocks] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");

  const load = async () => {
    setMsg("");
    if (!groupId) return;
    const res = await api.get("/academic/schedule-blocks", { params: { periodId, groupId } });
    setBlocks(res.data);
  };

  useEffect(() => { load(); }, [periodId, groupId]);

  const create = async () => {
    setMsg("");
    try {
      await api.post("/academic/schedule-blocks", {
        periodId,
        type: "class",
        dayOfWeek,
        startTime,
        endTime,
        room,
        groupId,
        subjectId,
        teacherId,
      });
      setMsg("Bloque creado correctamente.");
      await load();
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "Error al crear bloque");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2>Servicios Escolares - Captura de Horarios</h2>
        <button onClick={logout}>Salir</button>
      </div>

      <div style={{ margin: "8px 0 16px", opacity: 0.8 }}>
        periodId: {periodId}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, maxWidth: 900 }}>
        <input value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="groupId" style={{ padding: 8 }} />
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="aula" style={{ padding: 8 }} />

        <input value={subjectId} onChange={(e) => setSubjectId(e.target.value)} placeholder="subjectId" style={{ padding: 8 }} />
        <input value={teacherId} onChange={(e) => setTeacherId(e.target.value)} placeholder="teacherId" style={{ padding: 8 }} />

        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} style={{ padding: 8 }}>
          <option value={1}>Lunes</option>
          <option value={2}>Martes</option>
          <option value={3}>Miércoles</option>
          <option value={4}>Jueves</option>
          <option value={5}>Viernes</option>
          <option value={6}>Sábado</option>
          <option value={7}>Domingo</option>
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="HH:MM" style={{ padding: 8, flex: 1 }} />
          <input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="HH:MM" style={{ padding: 8, flex: 1 }} />
        </div>

        <button onClick={create} style={{ padding: "10px 14px" }}>Guardar bloque</button>
        <button onClick={load} style={{ padding: "10px 14px" }}>Refrescar</button>
      </div>

      {msg && <div style={{ marginTop: 12, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>{msg}</div>}

      <h3 style={{ marginTop: 18 }}>Bloques del grupo</h3>
      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        {blocks.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Sin bloques</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 6 }}>Día</th>
                <th style={{ textAlign: "left", padding: 6 }}>Hora</th>
                <th style={{ textAlign: "left", padding: 6 }}>Aula</th>
                <th style={{ textAlign: "left", padding: 6 }}>Materia</th>
                <th style={{ textAlign: "left", padding: 6 }}>Docente</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b._id}>
                  <td style={{ padding: 6 }}>{b.dayOfWeek}</td>
                  <td style={{ padding: 6 }}>{b.startTime}-{b.endTime}</td>
                  <td style={{ padding: 6 }}>{b.room ?? ""}</td>
                  <td style={{ padding: 6 }}>{b.subjectId?.name ?? ""}</td>
                  <td style={{ padding: 6 }}>{b.teacherId?.name ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
