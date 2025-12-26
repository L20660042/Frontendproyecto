import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code: string; name: string };
type Group = { _id: string; name: string; semester: number };
type Subject = { _id: string; code: string; name: string; semester: number };
type Teacher = { _id: string; name: string; employeeNumber?: string };

type ClassAssignment = {
  _id: string;
  status: "active" | "inactive";
  periodId?: any;
  careerId?: any;
  groupId?: any;
  subjectId?: any;
  teacherId?: any;
  createdAt?: string;
};

export default function ClassAssignmentsPage1() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // catálogos
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);

  // filtros/selección
  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");

  const [rows, setRows] = React.useState<ClassAssignment[]>([]);

  const loadBase = React.useCallback(async () => {
    setError("");
    try {
      const [p, c, t] = await Promise.all([
        api.get("/academic/periods"),
        api.get("/academic/careers"),
        api.get("/academic/teachers"),
      ]);

      const pList: Period[] = p.data ?? [];
      setPeriods(pList);
      setCareers(c.data ?? []);
      setTeachers(t.data ?? []);

      const active = pList.find((x) => x.isActive);
      if (active) setPeriodId(active._id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar catálogos base");
    }
  }, []);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  // grupos por periodo + carrera
  React.useEffect(() => {
    (async () => {
      setError("");
      setGroups([]);
      setGroupId("");
      setRows([]);
      if (!periodId || !careerId) return;

      try {
        const res = await api.get("/academic/groups", { params: { periodId, careerId } });
        setGroups(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar grupos");
      }
    })();
  }, [periodId, careerId]);

  // materias por carrera (+ semestre si hay grupo)
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

  const loadAssignments = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      if (!periodId) {
        setRows([]);
        return;
      }
      const res = await api.get("/academic/class-assignments", {
        params: {
          periodId,
          ...(careerId ? { careerId } : {}),
          ...(groupId ? { groupId } : {}),
        },
      });
      setRows(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar cargas");
    } finally {
      setLoading(false);
    }
  }, [periodId, careerId, groupId]);

  React.useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const createAssignment = async () => {
    setError("");
    if (!periodId || !careerId || !groupId || !subjectId || !teacherId) {
      setError("Completa Periodo, Carrera, Grupo, Materia y Docente.");
      return;
    }
    try {
      await api.post("/academic/class-assignments", {
        periodId,
        careerId,
        groupId,
        subjectId,
        teacherId,
        status,
      });
      await loadAssignments();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear carga");
    }
  };

  const toggleStatus = async (row: ClassAssignment) => {
    setError("");
    try {
      await api.patch(`/academic/class-assignments/${row._id}`, {
        status: row.status === "active" ? "inactive" : "active",
      });
      await loadAssignments();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al actualizar carga");
    }
  };

  return (
    <DashboardLayout title="Cargas (Grupo - Materia - Docente)">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Crear carga</CardTitle>
            <CardDescription>
              Define qué materia imparte qué docente a un grupo en un periodo. Luego, en “Horarios” ya podrás asignar días/horas.
            </CardDescription>
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
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={createAssignment} disabled={!periodId || !careerId || !groupId || !subjectId || !teacherId}>
                Crear carga
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de cargas</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Usa esto como base para armar el horario"}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Periodo</th>
                    <th className="text-left p-3">Grupo</th>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Docente</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-muted-foreground">
                        Sin cargas (filtra por periodo/carrera/grupo y crea una)
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r._id} className="border-t border-border">
                        <td className="p-3">{r.periodId?.name ?? ""}</td>
                        <td className="p-3">{r.groupId?.name ?? ""}</td>
                        <td className="p-3">
                          {r.subjectId?.code ? `${r.subjectId.code} - ` : ""}
                          {r.subjectId?.name ?? ""}
                        </td>
                        <td className="p-3">{r.teacherId?.name ?? ""}</td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3">
                          <Button variant="secondary" onClick={() => toggleStatus(r)}>
                            {r.status === "active" ? "Desactivar" : "Activar"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <Button variant="secondary" onClick={loadAssignments}>
                Refrescar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
