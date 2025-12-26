import React from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code?: string; name: string };
type Group = { _id: string; name: string; semester: number };

type Student = {
  _id: string;
  controlNumber: string;
  name: string;
  careerId?: any;
  status?: string;
};

type ClassAssignment = {
  _id: string;
  periodId: any;
  careerId: any;
  groupId: any;
  subjectId: any;
  teacherId: any;
  status: "active" | "inactive";
};

type CourseEnrollment = {
  _id: string;
  periodId: any;
  studentId: any;
  classAssignmentId: any;
  groupId: any;
  subjectId: any;
  teacherId: any;
  status: "active" | "inactive";
};

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, idx: number) => Promise<void>
) {
  let i = 0;
  const runners = new Array(Math.min(concurrency, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

export default function CourseEnrollmentsPage() {
  const [searchParams] = useSearchParams();

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // ✅ masivo
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [bulkReport, setBulkReport] = React.useState<{
    mode: "enroll" | "deactivate";
    total: number;
    processed: number;
    created?: number;
    skipped?: number;
    deactivated?: number;
    failed: number;
    lastError?: string;
  } | null>(null);

  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classAssignments, setClassAssignments] = React.useState<ClassAssignment[]>([]);
  const [enrollments, setEnrollments] = React.useState<CourseEnrollment[]>([]);

  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");
  const [classAssignmentId, setClassAssignmentId] = React.useState("");

  const [q, setQ] = React.useState("");

  // ✅ Prefill progresivo (para “Abrir inscripción” desde el resumen del grupo)
  const prefillRef = React.useRef<{ groupId?: string; classAssignmentId?: string } | null>(null);
  const prefillInitRef = React.useRef(false);

  React.useEffect(() => {
    if (prefillInitRef.current) return;

    const p = searchParams.get("periodId");
    const c = searchParams.get("careerId");
    const g = searchParams.get("groupId");
    const ca = searchParams.get("classAssignmentId");

    if (p) setPeriodId(p);
    if (c) setCareerId(c);

    // No seteamos groupId y classAssignmentId aquí, para no perderlos con los resets
    prefillRef.current = { groupId: g ?? undefined, classAssignmentId: ca ?? undefined };
    prefillInitRef.current = true;
  }, [searchParams]);

  const selectedPeriodName = React.useMemo(
    () => periods.find((p) => p._id === periodId)?.name ?? "",
    [periods, periodId]
  );

  const selectedCareerName = React.useMemo(
    () => careers.find((c) => c._id === careerId)?.name ?? "",
    [careers, careerId]
  );

  const selectedGroupName = React.useMemo(
    () => groups.find((g) => g._id === groupId)?.name ?? "",
    [groups, groupId]
  );

  const selectedCA = React.useMemo(
    () => classAssignments.find((x) => x._id === classAssignmentId),
    [classAssignments, classAssignmentId]
  );

  const activeEnrollmentByStudentId = React.useMemo(() => {
    const m = new Map<string, CourseEnrollment>();
    for (const e of enrollments) {
      if (e.status === "active") {
        const sid = String(e.studentId?._id ?? e.studentId);
        m.set(sid, e);
      }
    }
    return m;
  }, [enrollments]);

  const filteredStudents = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter((st) => {
      const cn = (st.controlNumber ?? "").toLowerCase();
      const nm = (st.name ?? "").toLowerCase();
      return cn.includes(s) || nm.includes(s);
    });
  }, [students, q]);

  const loadBase = React.useCallback(async () => {
    setError("");
    try {
      const [p, c] = await Promise.all([api.get("/academic/periods"), api.get("/academic/careers")]);
      const plist: Period[] = p.data ?? [];
      setPeriods(plist);
      setCareers(c.data ?? []);

      // ✅ no sobreescribir si viene periodId por URL
      const qp = searchParams.get("periodId");
      if (!qp && !periodId) {
        const active = plist.find((x) => x.isActive);
        if (active) setPeriodId(active._id);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar catálogos base");
    }
  }, [searchParams, periodId]);

  React.useEffect(() => {
    loadBase();
  }, [loadBase]);

  // Grupos por periodo + carrera
  React.useEffect(() => {
    (async () => {
      setGroups([]);
      setGroupId("");
      setClassAssignments([]);
      setClassAssignmentId("");
      setEnrollments([]);
      setBulkReport(null);

      if (!periodId || !careerId) return;

      setError("");
      try {
        const res = await api.get("/academic/groups", { params: { periodId, careerId } });
        const list: Group[] = res.data ?? [];
        setGroups(list);

        const pg = prefillRef.current?.groupId;
        if (pg) setGroupId(pg);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar grupos");
      }
    })();
  }, [periodId, careerId]);

  // Alumnos por carrera
  React.useEffect(() => {
    (async () => {
      setStudents([]);
      setError("");
      if (!careerId) return;
      try {
        const res = await api.get("/academic/students", { params: { careerId } });
        setStudents(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar alumnos");
      }
    })();
  }, [careerId]);

  // Cargas por periodo + carrera + grupo
  React.useEffect(() => {
    (async () => {
      setClassAssignments([]);
      setClassAssignmentId("");
      setEnrollments([]);
      setBulkReport(null);

      if (!periodId || !careerId || !groupId) return;

      setError("");
      try {
        const res = await api.get("/academic/class-assignments", {
          params: { periodId, careerId, groupId, status: "active" },
        });
        const list: ClassAssignment[] = res.data ?? [];
        setClassAssignments(list);

        // ✅ aplicar prefill de classAssignmentId DESPUÉS de cargar cargas
        const pca = prefillRef.current?.classAssignmentId;
        if (pca) {
          setClassAssignmentId(pca);
          // ya aplicamos prefill completo
          prefillRef.current = null;
        }
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Error al cargar cargas (class-assignments)");
      }
    })();
  }, [periodId, careerId, groupId]);

  // Course-enrollments por periodo + classAssignment
  const loadCourseEnrollments = React.useCallback(async () => {
    setEnrollments([]);
    setBulkReport(null);
    if (!periodId || !classAssignmentId) return;

    setError("");
    try {
      const res = await api.get("/academic/course-enrollments", {
        params: { periodId, classAssignmentId },
      });
      setEnrollments(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar inscripciones por materia");
    }
  }, [periodId, classAssignmentId]);

  React.useEffect(() => {
    loadCourseEnrollments();
  }, [loadCourseEnrollments]);

  const addStudentToClass = async (studentId: string) => {
    setError("");
    if (!periodId || !classAssignmentId) return setError("Selecciona periodo y carga");
    if (activeEnrollmentByStudentId.get(studentId)) return;

    setLoading(true);
    try {
      await api.post("/academic/course-enrollments", {
        periodId,
        studentId,
        classAssignmentId,
        status: "active",
      });
      await loadCourseEnrollments();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al inscribir alumno a la carga";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromClass = async (courseEnrollmentId: string) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/course-enrollments/${courseEnrollmentId}`, { status: "inactive" });
      await loadCourseEnrollments();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al dar de baja";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const activeEnrollments = React.useMemo(
    () => enrollments.filter((e) => e.status === "active"),
    [enrollments]
  );

  const bulkEnrollFiltered = async () => {
    setError("");
    if (!periodId || !classAssignmentId) {
      setError("Selecciona periodo y carga para inscripción masiva.");
      return;
    }

    const candidates = filteredStudents.filter((s) => !activeEnrollmentByStudentId.get(s._id));

    setBulkReport({
      mode: "enroll",
      total: candidates.length,
      processed: 0,
      created: 0,
      skipped: 0,
      failed: 0,
    });

    if (candidates.length === 0) return;

    setBulkLoading(true);

    let processed = 0;
    let created = 0;
    let skipped = 0;
    let failed = 0;

    try {
      await runPool(candidates, 10, async (student) => {
        try {
          await api.post("/academic/course-enrollments", {
            periodId,
            studentId: student._id,
            classAssignmentId,
            status: "active",
          });
          created++;
        } catch (e: any) {
          const msg = e?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(" | ") : String(msg ?? "");

          const isDup =
            e?.response?.status === 400 &&
            (text.toLowerCase().includes("ya está inscrito") ||
              text.toLowerCase().includes("ya esta inscrito") ||
              text.toLowerCase().includes("duplicate") ||
              text.toLowerCase().includes("duplic"));

          if (isDup) {
            skipped++;
          } else {
            failed++;
            setBulkReport((prev) => (prev ? { ...prev, lastError: text || "Error desconocido" } : prev));
          }
        } finally {
          processed++;
          setBulkReport((prev) =>
            prev ? { ...prev, processed, created, skipped, failed } : prev
          );
        }
      });

      await loadCourseEnrollments();
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDeactivateAll = async () => {
    setError("");
    if (!periodId || !classAssignmentId) {
      setError("Selecciona periodo y carga para baja masiva.");
      return;
    }

    setBulkReport({
      mode: "deactivate",
      total: activeEnrollments.length,
      processed: 0,
      deactivated: 0,
      failed: 0,
    });

    if (activeEnrollments.length === 0) return;

    setBulkLoading(true);

    let processed = 0;
    let deactivated = 0;
    let failed = 0;

    try {
      await runPool(activeEnrollments, 10, async (enr) => {
        try {
          await api.patch(`/academic/course-enrollments/${enr._id}`, { status: "inactive" });
          deactivated++;
        } catch (e: any) {
          failed++;
          const msg = e?.response?.data?.message;
          const text = Array.isArray(msg) ? msg.join(" | ") : String(msg ?? "");
          setBulkReport((prev) => (prev ? { ...prev, lastError: text || "Error desconocido" } : prev));
        } finally {
          processed++;
          setBulkReport((prev) =>
            prev ? { ...prev, processed, deactivated, failed } : prev
          );
        }
      });

      await loadCourseEnrollments();
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <DashboardLayout title="Inscripciones por materia (Alumno → Carga)">
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
              Selecciona Periodo, Carrera, Grupo y la Carga (Grupo–Materia–Docente). Luego agrega alumnos a esa carga.
              Esto permite que un alumno curse materias en grupos distintos.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-4">
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

            <div className="space-y-2">
              <Label>Carga (Materia–Docente)</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={classAssignmentId}
                onChange={(e) => setClassAssignmentId(e.target.value)}
                disabled={!periodId || !careerId || !groupId}
              >
                <option value="">{!groupId ? "Selecciona grupo..." : "Selecciona..."}</option>
                {classAssignments.map((ca) => (
                  <option key={ca._id} value={ca._id}>
                    {ca.subjectId?.name ?? "Materia"} — {ca.teacherId?.name ?? "Docente"}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-4 flex flex-wrap gap-2 items-center">
              <Button
                variant="secondary"
                onClick={loadCourseEnrollments}
                disabled={!periodId || !classAssignmentId || loading || bulkLoading}
              >
                Refrescar inscripciones
              </Button>

              <Button
                onClick={bulkEnrollFiltered}
                disabled={!periodId || !classAssignmentId || bulkLoading || loading}
              >
                Inscribir masivo (filtrados)
              </Button>

              <Button
                variant="destructive"
                onClick={bulkDeactivateAll}
                disabled={
                  !periodId ||
                  !classAssignmentId ||
                  bulkLoading ||
                  loading ||
                  activeEnrollments.length === 0
                }
              >
                Baja masiva (inscritos)
              </Button>

              <span className="text-sm text-muted-foreground">
                {selectedPeriodName && selectedCareerName ? `Periodo: ${selectedPeriodName} | Carrera: ${selectedCareerName}` : ""}
                {selectedGroupName ? ` | Grupo: ${selectedGroupName}` : ""}
                {selectedCA?.subjectId?.name ? ` | Materia: ${selectedCA.subjectId.name}` : ""}
              </span>

              {bulkReport ? (
                <div className="w-full mt-3 text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span>
                      Operación:{" "}
                      <span className="font-medium text-foreground">
                        {bulkReport.mode === "enroll" ? "Inscripción masiva" : "Baja masiva"}
                      </span>
                    </span>

                    <span>
                      Progreso:{" "}
                      <span className="font-medium text-foreground">
                        {bulkReport.processed}/{bulkReport.total}
                      </span>
                    </span>

                    {bulkReport.mode === "enroll" ? (
                      <>
                        <span>
                          Creados:{" "}
                          <span className="font-medium text-foreground">{bulkReport.created ?? 0}</span>
                        </span>
                        <span>
                          Omitidos:{" "}
                          <span className="font-medium text-foreground">{bulkReport.skipped ?? 0}</span>
                        </span>
                      </>
                    ) : (
                      <span>
                        Dados de baja:{" "}
                        <span className="font-medium text-foreground">{bulkReport.deactivated ?? 0}</span>
                      </span>
                    )}

                    <span>
                      Fallidos:{" "}
                      <span className="font-medium text-foreground">{bulkReport.failed}</span>
                    </span>
                  </div>

                  {bulkReport.lastError ? (
                    <div className="mt-1">
                      Último error: <span className="text-foreground">{bulkReport.lastError}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alumnos de la carrera</CardTitle>
              <CardDescription>Agrega el alumno a la carga seleccionada.</CardDescription>
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
                      <th className="text-left p-3">Estado (en esta carga)</th>
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

                        return (
                          <tr key={s._id} className="border-t border-border">
                            <td className="p-3">{s.controlNumber ?? "-"}</td>
                            <td className="p-3 font-medium">{s.name}</td>
                            <td className="p-3">
                              {enrolled ? "Inscrito" : <span className="text-muted-foreground">No inscrito</span>}
                            </td>
                            <td className="p-3">
                              {!periodId || !classAssignmentId ? (
                                <span className="text-muted-foreground">Selecciona carga</span>
                              ) : enrolled ? (
                                <Button disabled>Inscrito</Button>
                              ) : (
                                <Button onClick={() => addStudentToClass(s._id)} disabled={loading || bulkLoading}>
                                  Agregar
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

          <Card>
            <CardHeader>
              <CardTitle>Inscritos en la carga</CardTitle>
              <CardDescription>Inscripciones activas para la carga seleccionada.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="text-left p-3">No. Control</th>
                      <th className="text-left p-3">Alumno</th>
                      <th className="text-left p-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!classAssignmentId ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-muted-foreground">
                          Selecciona una carga para ver inscritos.
                        </td>
                      </tr>
                    ) : activeEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-muted-foreground">
                          Sin inscritos activos en esta carga.
                        </td>
                      </tr>
                    ) : (
                      activeEnrollments.map((e) => {
                        const st = e.studentId ?? {};
                        return (
                          <tr key={e._id} className="border-t border-border">
                            <td className="p-3">{st.controlNumber ?? "-"}</td>
                            <td className="p-3 font-medium">{st.name ?? "-"}</td>
                            <td className="p-3">
                              <Button
                                variant="destructive"
                                onClick={() => removeStudentFromClass(e._id)}
                                disabled={loading || bulkLoading}
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
                <Button
                  variant="secondary"
                  onClick={loadCourseEnrollments}
                  disabled={!periodId || !classAssignmentId || loading || bulkLoading}
                >
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
