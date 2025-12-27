import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code?: string; name: string };
type Group = { _id: string; name: string; semester: number; careerId?: any; periodId?: any };
type Subject = { _id: string; code: string; name: string; semester: number };
type Teacher = { _id: string; name: string; employeeNumber?: string };

type ClassAssignment = {
  _id: string;
  status: "active" | "inactive";
  periodId: any;
  careerId: any;
  groupId: any;
  subjectId: any;
  teacherId: any;
  createdAt: string;
};

type BulkEnrollResult = {
  ok: boolean;
  studentsSource: "enrollments" | "students";
  periodId: string;
  groupId: string;
  students: number;
  classAssignments: number;
  attempted: number;
  upserted: number;
  matched: number;
  modified: number;
};

export default function ClassAssignmentsPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // catálogos
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);

  // filtros
  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");

  // formulario create
  const [subjectId, setSubjectId] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");

  // listado
  const [rows, setRows] = React.useState<ClassAssignment[]>([]);
  const [q, setQ] = React.useState("");

  // ✅ bulk enroll UI state
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [bulkError, setBulkError] = React.useState("");
  const [bulkResult, setBulkResult] = React.useState<BulkEnrollResult | null>(null);

  const loadBase = React.useCallback(async () => {
    setError("");
    try {
      const [p, c, t] = await Promise.all([
        api.get("/academic/periods"),
        api.get("/academic/careers"),
        api.get("/academic/teachers"),
      ]);

      const plist: Period[] = p.data ?? [];
      setPeriods(plist);
      setCareers(c.data ?? []);
      setTeachers(t.data ?? []);

      const active = plist.find((x) => x.isActive);
      if (active) setPeriodId(active._id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar catálogos base");
    }
  }, []);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  // grupos por periodo+carrera
  React.useEffect(() => {
    (async () => {
      setGroups([]);
      setGroupId("");
      setRows([]);
      setSubjects([]);
      setSubjectId("");
      setBulkResult(null);
      setBulkError("");
      if (!periodId || !careerId) return;

      setError("");
      try {
        const res = await api.get("/academic/groups", { params: { periodId, careerId } });
        setGroups(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar grupos");
      }
    })();
  }, [periodId, careerId]);

  // materias por carrera + semestre del grupo
  React.useEffect(() => {
    (async () => {
      setSubjects([]);
      setSubjectId("");
      if (!careerId) return;

      const sem = groups.find((g) => g._id === groupId)?.semester;

      setError("");
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

  const loadAssignments = React.useCallback(async () => {
    setRows([]);
    if (!periodId || !groupId) return;

    setError("");
    try {
      const res = await api.get("/academic/class-assignments", {
        params: { periodId, groupId },
      });
      setRows(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar cargas (class-assignments)");
    }
  }, [periodId, groupId]);

  React.useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const create = async () => {
    setError("");
    if (!periodId || !careerId || !groupId) return setError("Selecciona Periodo, Carrera y Grupo.");
    if (!subjectId || !teacherId) return setError("Selecciona Materia y Docente.");

    setLoading(true);
    try {
      await api.post("/academic/class-assignments", {
        periodId,
        careerId,
        groupId,
        subjectId,
        teacherId,
        status,
      });
      setSubjectId("");
      setTeacherId("");
      await loadAssignments();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear asignación";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/class-assignments/${id}`);
      await loadAssignments();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar asignación";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const bulkEnrollGroup = async () => {
    setBulkError("");
    setBulkResult(null);

    if (!periodId || !groupId) {
      setBulkError("Selecciona Periodo y Grupo para inscribir.");
      return;
    }

    if (rows.length === 0) {
      setBulkError("No hay cargas activas para este grupo. Primero crea las cargas (materias con docente).");
      return;
    }

    setBulkLoading(true);
    try {
      const res = await api.post("/academic/course-enrollments/bulk/by-group", {
        periodId,
        groupId,
        status: "active",
      });

      setBulkResult(res.data as BulkEnrollResult);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al hacer inscripción masiva (course-enrollments)";
      setBulkError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setBulkLoading(false);
    }
  };

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const subj = r.subjectId?.name ?? "";
      const tch = r.teacherId?.name ?? "";
      return subj.toLowerCase().includes(s) || tch.toLowerCase().includes(s);
    });
  }, [rows, q]);

  return (
    <DashboardLayout title="Cargas (Materia → Docente por Grupo/Periodo)">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Contexto</CardTitle>
            <CardDescription>Define el periodo, carrera y grupo para asignar materias con docente.</CardDescription>
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
                    {c.code ? `${c.code} - ` : ""}
                    {c.name}
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

        {/* ✅ NUEVO: Inscripción masiva */}
        <Card>
          <CardHeader>
            <CardTitle>Inscripción masiva (Grupo → Todas las cargas)</CardTitle>
            <CardDescription>
              Esto crea los <b>CourseEnrollments</b> necesarios para que el alumno vea su horario y “mis materias”.
              Primero intenta usar inscripciones del periodo (Enrollments). Si no existen, usa Student.groupId.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bulkError ? (
              <Alert variant="destructive">
                <AlertDescription>{bulkError}</AlertDescription>
              </Alert>
            ) : null}

            {bulkResult ? (
              <Alert>
                <AlertDescription>
                  <div className="space-y-1">
                    <div><b>Fuente alumnos:</b> {bulkResult.studentsSource}</div>
                    <div><b>Alumnos:</b> {bulkResult.students}</div>
                    <div><b>Cargas:</b> {bulkResult.classAssignments}</div>
                    <div><b>Operaciones:</b> {bulkResult.attempted}</div>
                    <div><b>Nuevas (upserted):</b> {bulkResult.upserted}</div>
                    <div><b>Ya existían (matched):</b> {bulkResult.matched}</div>
                    <div><b>Modificadas:</b> {bulkResult.modified}</div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button onClick={bulkEnrollGroup} disabled={!periodId || !groupId || bulkLoading}>
                {bulkLoading ? "Inscribiendo..." : "Inscribir grupo a todas las cargas"}
              </Button>

              <Button variant="secondary" onClick={loadAssignments} disabled={!periodId || !groupId || bulkLoading}>
                Refrescar cargas
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Recomendación: ejecuta esto después de cargar alumnos + crear cargas. Luego el alumno ya puede ir a “Mi horario”.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crear asignación</CardTitle>
            <CardDescription>Una materia no puede duplicarse en el mismo grupo/periodo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
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
                    {t.name}
                    {t.employeeNumber ? ` (${t.employeeNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={!groupId}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={create} disabled={loading || !groupId}>
                {loading ? "Guardando..." : "Asignar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de cargas</CardTitle>
            <CardDescription>Estas son las materias asignadas al grupo en el periodo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Materia o docente" />
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Docente</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        {groupId ? "Sin asignaciones todavía" : "Selecciona un grupo"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r._id} className="border-t border-border">
                        <td className="p-3 font-medium">
                          {r.subjectId?.code ? `${r.subjectId.code} - ` : ""}
                          {r.subjectId?.name ?? ""}
                        </td>
                        <td className="p-3">{r.teacherId?.name ?? ""}</td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3">
                          <Button variant="destructive" onClick={() => remove(r._id)} disabled={loading}>
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-muted-foreground">
              Nota: esta tabla es la “carga” del grupo. Horarios y “Mi horario” dependen de CourseEnrollments.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
