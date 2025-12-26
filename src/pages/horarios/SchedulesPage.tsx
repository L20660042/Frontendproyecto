import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { Checkbox } from "../../components/checkbox";
import { api } from "../../api/client";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code: string; name: string };
type Group = { _id: string; name: string; semester: number };

type ClassAssignment = {
  _id: string;
  status: "active" | "inactive";
  subjectId?: any;
  teacherId?: any;
};

type ScheduleBlock = {
  _id: string;
  type: "class" | "extracurricular";
  dayOfWeek: number; // 1-7
  startTime: string; // "08:00"
  endTime: string;
  room?: string;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
};

const DAYS = [
  { v: 1, label: "Lunes" },
  { v: 2, label: "Martes" },
  { v: 3, label: "Miércoles" },
  { v: 4, label: "Jueves" },
  { v: 5, label: "Viernes" },
  { v: 6, label: "Sábado" },
  { v: 7, label: "Domingo" },
];

export default function SchedulesPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);

  // filtros principales
  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");

  // cargas disponibles para ese grupo/periodo
  const [assignments, setAssignments] = React.useState<ClassAssignment[]>([]);
  const [assignmentId, setAssignmentId] = React.useState("");

  // listado bloques
  const [blocks, setBlocks] = React.useState<ScheduleBlock[]>([]);

  // form
  const [daysSelected, setDaysSelected] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("09:00");
  const [room, setRoom] = React.useState("A-1");

  const loadBase = React.useCallback(async () => {
    setError("");
    try {
      const [p, c] = await Promise.all([api.get("/academic/periods"), api.get("/academic/careers")]);
      const pList: Period[] = p.data ?? [];
      setPeriods(pList);
      setCareers(c.data ?? []);

      const active = pList.find((x) => x.isActive);
      if (active) setPeriodId(active._id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar catálogos base (periodos/carreras)");
    }
  }, []);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  // grupos cuando cambia periodo/carrera
  React.useEffect(() => {
    (async () => {
      setError("");
      setGroups([]);
      setGroupId("");
      setAssignments([]);
      setAssignmentId("");
      setBlocks([]);

      if (!periodId || !careerId) return;

      try {
        const res = await api.get("/academic/groups", { params: { periodId, careerId } });
        setGroups(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar grupos");
      }
    })();
  }, [periodId, careerId]);

  // cargar cargas cuando cambia grupo/periodo
  React.useEffect(() => {
    (async () => {
      setError("");
      setAssignments([]);
      setAssignmentId("");

      if (!periodId || !groupId) return;

      try {
        const res = await api.get("/academic/class-assignments", {
          params: { periodId, groupId, status: "active" },
        });
        const list: ClassAssignment[] = res.data ?? [];
        setAssignments(list);

        if (list.length > 0) setAssignmentId(list[0]._id);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar cargas (class-assignments)");
      }
    })();
  }, [periodId, groupId]);

  const loadBlocks = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (!periodId || !groupId) {
        setBlocks([]);
        return;
      }
      const res = await api.get("/academic/schedule-blocks", { params: { periodId, groupId } });
      setBlocks(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar horario del grupo");
    } finally {
      setLoading(false);
    }
  }, [periodId, groupId]);

  React.useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const toggleDay = (d: number, checked: boolean) => {
    setDaysSelected((prev) => {
      const set = new Set(prev);
      if (checked) set.add(d);
      else set.delete(d);
      return Array.from(set).sort((a, b) => a - b);
    });
  };

  const createBlocks = async () => {
    setError("");

    if (!periodId || !careerId || !groupId) {
      setError("Selecciona Periodo, Carrera y Grupo.");
      return;
    }
    if (!assignmentId) {
      setError("No hay cargas activas para este grupo. Ve a 'Cargas' y crea al menos una.");
      return;
    }
    if (daysSelected.length === 0) {
      setError("Selecciona al menos un día.");
      return;
    }

    const ass = assignments.find((a) => a._id === assignmentId);
    const subjectId = ass?.subjectId?._id ?? ass?.subjectId;
    const teacherId = ass?.teacherId?._id ?? ass?.teacherId;

    if (!subjectId || !teacherId) {
      setError("La carga seleccionada no tiene subjectId/teacherId válidos.");
      return;
    }

    try {
      // crea un bloque por cada día seleccionado
      for (const dayOfWeek of daysSelected) {
        await api.post("/academic/schedule-blocks", {
          periodId,
          type: "class",
          groupId,
          subjectId,
          teacherId,
          dayOfWeek,
          startTime,
          endTime,
          room,
        });
      }
      await loadBlocks();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear bloque(s) (posible choque)");
    }
  };

  const dayLabel = (v: number) => DAYS.find((d) => d.v === v)?.label ?? String(v);

  const blocksSorted = React.useMemo(() => {
    return [...blocks].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [blocks]);

  return (
    <DashboardLayout title="Horarios (Admin)">
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Selectores principales */}
        <Card>
          <CardHeader>
            <CardTitle>Contexto</CardTitle>
            <CardDescription>Elige periodo, carrera y grupo para administrar el horario.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Periodo</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
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

            <div className="space-y-2">
              <Label>Carrera</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={careerId}
                onChange={(e) => setCareerId(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {careers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Grupo</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                disabled={!periodId || !careerId}
              >
                <option value="">
                  {!periodId || !careerId ? "Selecciona periodo y carrera..." : "Selecciona..."}
                </option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} (Sem {g.semester})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Crear bloques */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar clase</CardTitle>
            <CardDescription>
              Selecciona una carga (Materia+Docente) y define días/horas. Se creará un bloque por cada día marcado.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-3">
              <Label>Carga (Materia + Docente)</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                disabled={!groupId}
              >
                {assignments.length === 0 ? (
                  <option value="">Sin cargas activas (ve a Cargas)</option>
                ) : null}
                {assignments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {(a.subjectId?.code ? `${a.subjectId.code} - ` : "") + (a.subjectId?.name ?? "Materia")} ·{" "}
                    {a.teacherId?.name ?? "Docente"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>Días</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
                {DAYS.map((d) => (
                  <label key={d.v} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                    <Checkbox
                      checked={daysSelected.includes(d.v)}
                      onCheckedChange={(v) => toggleDay(d.v, Boolean(v))}
                      disabled={!groupId}
                    />
                    <span className="text-sm">{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hora inicio</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={!groupId} />
            </div>

            <div className="space-y-2">
              <Label>Hora fin</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!groupId} />
            </div>

            <div className="space-y-2">
              <Label>Aula</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} disabled={!groupId} placeholder="A-12" />
            </div>

            <div className="flex items-end">
              <Button onClick={createBlocks} disabled={!groupId || !assignmentId}>
                Agregar bloque(s)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listado */}
        <Card>
          <CardHeader>
            <CardTitle>Horario del grupo</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Bloques ordenados por día y hora"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Día</th>
                    <th className="text-left p-3">Inicio</th>
                    <th className="text-left p-3">Fin</th>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Docente</th>
                    <th className="text-left p-3">Aula</th>
                  </tr>
                </thead>
                <tbody>
                  {blocksSorted.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-muted-foreground">
                        {groupId ? "Sin bloques de horario" : "Selecciona un grupo"}
                      </td>
                    </tr>
                  ) : (
                    blocksSorted.map((b) => (
                      <tr key={b._id} className="border-t border-border">
                        <td className="p-3 font-medium">{dayLabel(b.dayOfWeek)}</td>
                        <td className="p-3">{b.startTime}</td>
                        <td className="p-3">{b.endTime}</td>
                        <td className="p-3">{b.subjectId?.name ?? ""}</td>
                        <td className="p-3">{b.teacherId?.name ?? ""}</td>
                        <td className="p-3">{b.room ?? ""}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <Button variant="secondary" onClick={loadBlocks} disabled={!groupId}>
                Refrescar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
