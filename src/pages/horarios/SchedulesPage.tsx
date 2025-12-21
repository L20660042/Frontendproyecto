import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { api } from "../../api/client";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code: string; name: string };
type Group = { _id: string; name: string; semester: number; careerId?: any; periodId?: any };
type Subject = { _id: string; code: string; name: string; semester: number };
type Teacher = { _id: string; name: string; email?: string };

type ScheduleBlock = {
  _id: string;
  dayOfWeek: number; // 1-7
  startTime: string; // "08:00"
  endTime: string;
  room?: string;
  periodId?: any;
  groupId?: any;
  subjectId?: any;
  teacherId?: any;
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

  // combos
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);

  // filtros principales
  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");

  // listado
  const [blocks, setBlocks] = React.useState<ScheduleBlock[]>([]);

  // form crear
  const [dayOfWeek, setDayOfWeek] = React.useState<number>(1);
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("09:00");
  const [room, setRoom] = React.useState("A-1");
  const [subjectId, setSubjectId] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");

  const loadBase = React.useCallback(async () => {
    try {
      const [p, c, t] = await Promise.all([
        api.get("/academic/periods"),
        api.get("/academic/careers"),
        api.get("/academic/teachers"),
      ]);
      setPeriods(p.data ?? []);
      setCareers(c.data ?? []);
      setTeachers(t.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar catálogos base (periodos/carreras/docentes)");
    }
  }, []);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  // cargar grupos cuando cambian periodo/carrera
  React.useEffect(() => {
    (async () => {
      setError("");
      setGroups([]);
      setGroupId("");
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

  // cargar subjects cuando cambian carrera o grupo (para usar semestre)
  React.useEffect(() => {
    (async () => {
      setError("");
      setSubjects([]);
      setSubjectId("");

      if (!careerId) return;

      const sem = groups.find((g) => g._id === groupId)?.semester;

      try {
        const res = await api.get("/academic/subjects", {
          params: { careerId, ...(sem ? { semester: sem } : {}) },
        });
        setSubjects(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar materias");
      }
    })();
  }, [careerId, groupId, groups]);

  const loadBlocks = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (!periodId || !groupId) {
        setBlocks([]);
        return;
      }
      const res = await api.get("/academic/schedule-blocks", {
        params: { periodId, groupId },
      });
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

  const createBlock = async () => {
    setError("");
    if (!periodId || !careerId || !groupId) {
      setError("Selecciona Periodo, Carrera y Grupo.");
      return;
    }
    if (!subjectId || !teacherId) {
      setError("Selecciona Materia y Docente.");
      return;
    }
    try {
      await api.post("/academic/schedule-blocks", {
        periodId,
        groupId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      });
      await loadBlocks();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear bloque de horario (posible choque)");
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
    <DashboardLayout title="Horarios">
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Selectores principales */}
        <Card>
          <CardHeader>
            <CardTitle>Selecciona contexto</CardTitle>
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
                    {p.name}{p.isActive ? " (Activo)" : ""}
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
                <option value="">{!periodId || !careerId ? "Selecciona periodo y carrera..." : "Selecciona..."}</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} (Sem {g.semester})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Crear bloque */}
        <Card>
          <CardHeader>
            <CardTitle>Crear bloque</CardTitle>
            <CardDescription>Agrega una clase al horario del grupo seleccionado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Día</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                disabled={!groupId}
              >
                {DAYS.map((d) => (
                  <option key={d.v} value={d.v}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Hora inicio</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={!groupId} />
            </div>

            <div className="space-y-2">
              <Label>Hora fin</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!groupId} />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Materia</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!groupId}
              >
                <option value="">Selecciona...</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.name} (Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Aula</Label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} disabled={!groupId} placeholder="A-12" />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Docente</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={!groupId}
              >
                <option value="">Selecciona...</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}{t.email ? ` (${t.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={createBlock} disabled={!groupId}>
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listado */}
        <Card>
          <CardHeader>
            <CardTitle>Horario del grupo</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Listado de bloques ordenados por día y hora"}</CardDescription>
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
