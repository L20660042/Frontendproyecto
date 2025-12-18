import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import WeeklySchedule from "../../components/WeeklySchedule";

export default function HorarioAlumno() {
  const { periodId, studentId, logout } = useAuth();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await api.get("/academic/schedule/student", { params: { periodId, studentId } });
        setBlocks(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error consultando horario");
      }
    })();
  }, [periodId, studentId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2>Horario del Alumno</h2>
        <button onClick={logout}>Salir</button>
      </div>

      <div style={{ margin: "8px 0 16px", opacity: 0.8 }}>
        periodId: {periodId} · studentId: {studentId}
      </div>

      {error && <div style={{ padding: 10, border: "1px solid #f2c", borderRadius: 8, marginBottom: 12 }}>{error}</div>}

      <WeeklySchedule blocks={blocks} />
    </div>
  );
}
