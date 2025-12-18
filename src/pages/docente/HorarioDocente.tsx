import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import WeeklySchedule from "../../components/WeeklySchedule";

export default function HorarioDocente() {
  const { periodId, teacherId, logout } = useAuth();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await api.get("/academic/schedule/teacher", { params: { periodId, teacherId } });
        setBlocks(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error consultando horario");
      }
    })();
  }, [periodId, teacherId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2>Horario del Docente</h2>
        <button onClick={logout}>Salir</button>
      </div>

      <div style={{ margin: "8px 0 16px", opacity: 0.8 }}>
        periodId: {periodId} · teacherId: {teacherId}
      </div>

      {error && <div style={{ padding: 10, border: "1px solid #f2c", borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      <WeeklySchedule blocks={blocks} />
    </div>
  );
}
