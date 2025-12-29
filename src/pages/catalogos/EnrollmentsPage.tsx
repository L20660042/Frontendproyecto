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

type Student = {
  _id: string;
  controlNumber: string;
  name: string;
  careerId?: any;
  status?: string;
};

type Enrollment = {
  _id: string;
  periodId: any;
  groupId: any;
  studentId: any;
  status: "active" | "inactive";
};

export default function EnrollmentsPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);

  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");

  const [students, setStudents] = React.useState<Student[]>([]);
  const [enrollmentsGroup, setEnrollmentsGroup] = React.useState<Enrollment[]>([]);

  // IMPORTANT: mapa de inscripciones activas por alumno EN EL PERIODO
  const [periodEnrollments, setPeriodEnrollments] = React.useState<Enrollment[]>([]);
  const activeEnrollmentByStudentId = React.useMemo(() => {
    const m = new Map<string, Enrollment>();
    for (const e of periodEnrollments) {
      if (e.status === "active") {
        const sid = String(e.studentId?._id ?? e.studentId);
        m.set(sid, e);
      }
    }
    return m;
  }, [periodEnrollments]);

  const [q, setQ] = React.useState("");

  const selectedPeriodName = React.useMemo(
    () => periods.find((p) => p._id === periodId)?.name ?? "",
    [periods, periodId]
  );
  const selectedGroupName = React.useMemo(
    () => groups.find((g) => g._id === groupId)?.name ?? "",
    [groups, groupId]
  );

  const loadBase = React.useCallback(async () => {
    setError("");
    try {
      const [p, c] = await Promise.all([api.get("/academic/periods"), api.get("/academic/careers")]);
      const plist: Period[] = p.data ?? [];
      setPeriods(plist);
      setCareers(c.data ?? []);

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
      setEnrollmentsGroup([]);
      setPeriodEnrollments([]);
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

  const loadStudents = React.useCallback(async () => {
    if (!careerId) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/academic/students", { params: { careerId } });
      setStudents(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar alumnos");
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  // carga alumnos cuando cambia carrera
  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // carga inscripciones del grupo seleccionado
  const loadEnrollmentsGroup = React.useCallback(async () => {
    setEnrollmentsGroup([]);
    if (!periodId || !groupId) return;

    setError("");
    try {
      const res = await api.get("/academic/enrollments", { params: { periodId, groupId } });
      setEnrollmentsGroup(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar inscripciones del grupo");
    }
  }, [periodId, groupId]);

  React.useEffect(() => {
    loadEnrollmentsGroup();
  }, [loadEnrollmentsGroup]);

  // IMPORTANT: carga TODAS las inscripciones del periodo (para detectar “ya inscrito”)
  const loadEnrollmentsPeriod = React.useCallback(async () => {
    setPeriodEnrollments([]);
    if (!periodId) return;

    setError("");
    try {
      const res = await api.get("/academic/enrollments", { params: { periodId, status: "active" } });
      setPeriodEnrollments(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar inscripciones del periodo");
    }
  }, [periodId]);

  React.useEffect(() => {
    loadEnrollmentsPeriod();
  }, [loadEnrollmentsPeriod]);

  const enrollStudent = async (studentId: string) => {
    setError("");
    if (!periodId || !groupId) return setError("Selecciona periodo y grupo");

    // Si ya tiene inscripción activa en el periodo, no hacemos POST (el backend lo rechazará).
    const current = activeEnrollmentByStudentId.get(studentId);
    if (current) {
      return setError("El alumno ya está inscrito en este periodo. Usa 'Mover'.");
    }

    setLoading(true);
    try {
      await api.post("/academic/enrollments", { periodId, studentId, groupId, status: "active" });
      await Promise.all([loadEnrollmentsGroup(), loadEnrollmentsPeriod()]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al inscribir alumno";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const moveEnrollment = async (enrollmentId: string) => {
    setError("");
    if (!groupId) return;

    setLoading(true);
    try {
      await api.patch(`/academic/enrollments/${enrollmentId}`, { groupId });
      await Promise.all([loadEnrollmentsGroup(), loadEnrollmentsPeriod()]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al mover inscripción";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const setEnrollmentInactive = async (enrollmentId: string) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/enrollments/${enrollmentId}`, { status: "inactive" });
      await Promise.all([loadEnrollmentsGroup(), loadEnrollmentsPeriod()]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al dar de baja";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter((st) => {
      const cn = (st.controlNumber ?? "").toLowerCase();
      const nm = (st.name ?? "").toLowerCase();
      return cn.includes(s) || nm.includes(s);
    });
  }, [students, q]);

  return (
    <DashboardLayout title="Inscripciones (Alumno → Grupo por Periodo)">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Contexto</CardTitle>
            <CardDescription>
              Selecciona Periodo, Carrera y Grupo. El sistema solo permite 1 grupo por alumno por periodo.
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
                    {c.code ? `${c.code} - ` : ""}{c.name}
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

            <div className="lg:col-span-3 flex flex-wrap gap-2 items-center">
              <Button variant="secondary" onClick={loadStudents} disabled={!careerId || loading}>
                Refrescar alumnos
              </Button>
              <Button variant="secondary" onClick={loadEnrollmentsPeriod} disabled={!periodId || loading}>
                Refrescar inscripciones (Periodo)
              </Button>
              <Button variant="secondary" onClick={loadEnrollmentsGroup} disabled={!periodId || !groupId || loading}>
                Refrescar inscripciones (Grupo)
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedPeriodName && selectedGroupName ? `Periodo: ${selectedPeriodName} | Grupo: ${selectedGroupName}` : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista alumnos */}
          <Card>
            <CardHeader>
              <CardTitle>Alumnos de la carrera</CardTitle>
              <CardDescription>
                Busca por nombre o número de control. Si ya está inscrito en el periodo, usa “Mover”.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Búsqueda</Label>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ej. 2066... o Juan Pérez"
                  disabled={!careerId}
                />
              </div>

              <div className="overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">No. Control</th>
                      <th className="text-left p-3">Nombre</th>
                      <th className="text-left p-3">Inscripción (Periodo)</th>
                      <th className="text-left p-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!careerId ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-muted-foreground">
                          Selecciona una carrera para listar alumnos.
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-muted-foreground">
                          Sin alumnos para mostrar.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const enr = activeEnrollmentByStudentId.get(s._id);
                        const enrolled = Boolean(enr);
                        const enrolledGroupId = enr ? String(enr.groupId?._id ?? enr.groupId) : "";
                        const sameGroup = enrolled && groupId && enrolledGroupId === groupId;

                        return (
                          <tr key={s._id} className="border-t border-border">
                            <td className="p-3">{s.controlNumber ?? "-"}</td>
                            <td className="p-3 font-medium">{s.name}</td>
                            <td className="p-3">
                              {enrolled ? (
                                <span>
                                  {enr?.groupId?.name ? `Grupo ${enr.groupId.name}` : "Inscrito"}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">No inscrito</span>
                              )}
                            </td>
                            <td className="p-3">
                              {!periodId || !groupId ? (
                                <span className="text-muted-foreground">Selecciona periodo/grupo</span>
                              ) : sameGroup ? (
                                <Button disabled>Inscrito</Button>
                              ) : enrolled ? (
                                <Button onClick={() => moveEnrollment(enr!._id)} disabled={loading}>
                                  Mover a este grupo
                                </Button>
                              ) : (
                                <Button onClick={() => enrollStudent(s._id)} disabled={loading}>
                                  Inscribir
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Inscritos del grupo */}
          <Card>
            <CardHeader>
              <CardTitle>Inscritos en el grupo</CardTitle>
              <CardDescription>Inscripciones activas del grupo seleccionado.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">No. Control</th>
                      <th className="text-left p-3">Alumno</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!groupId ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-muted-foreground">
                          Selecciona un grupo para ver inscripciones.
                        </td>
                      </tr>
                    ) : enrollmentsGroup.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-muted-foreground">
                          Sin inscripciones para este grupo.
                        </td>
                      </tr>
                    ) : (
                      enrollmentsGroup
                        .map((e) => {
                          const st = e.studentId ?? {};
                          return (
                            <tr key={e._id} className="border-t border-border">
                              <td className="p-3">{st.controlNumber ?? "-"}</td>
                              <td className="p-3 font-medium">{st.name ?? "-"}</td>
                              <td className="p-3">{e.status}</td>
                              <td className="p-3">
                                <Button
                                  variant="destructive"
                                  onClick={() => setEnrollmentInactive(e._id)}
                                  disabled={loading}
                                >
                                  Dar de baja
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <Button variant="secondary" onClick={loadEnrollmentsGroup} disabled={!periodId || !groupId || loading}>
                  Refrescar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
