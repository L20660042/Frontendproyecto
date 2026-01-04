import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { Checkbox } from "../../components/checkbox";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code?: string; name: string };
type StudentRow = { _id: string; controlNumber: string; name: string };

type Activity = {
  _id: string;
  periodId: any;
  name: string;
  type: string;
  responsibleName?: string | null;
  capacity?: number | null;
  status: "active" | "inactive";
};

type Block = {
  _id: string;
  type: "class" | "extracurricular";
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
};

type ActivityEnrollmentRow = {
  _id: string;
  studentId: any;
  activityId: any;
  status: "active" | "inactive";
};

const dayLabel: Record<number, string> = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom" };

export default function ActivitiesPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Periodos
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");

  // Actividades
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = React.useState<string>("");

  // Form crear actividad
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("deportiva");
  const [responsibleName, setResponsibleName] = React.useState("");
  const [capacity, setCapacity] = React.useState<string>("");
  const [status, setStatus] = React.useState<Activity["status"]>("active");

  // Form editar actividad (cuando se selecciona)
  const [editName, setEditName] = React.useState("");
  const [editType, setEditType] = React.useState("");
  const [editResponsibleName, setEditResponsibleName] = React.useState("");
  const [editCapacity, setEditCapacity] = React.useState<string>("");
  const [editStatus, setEditStatus] = React.useState<Activity["status"]>("active");

  // Bloques de horario extra
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [dayOfWeek, setDayOfWeek] = React.useState<number>(1);
  const [startTime, setStartTime] = React.useState("16:00");
  const [endTime, setEndTime] = React.useState("17:00");
  const [room, setRoom] = React.useState("");

  // Inscripción alumnos (bulk)
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [careerId, setCareerId] = React.useState("");
  const [students, setStudents] = React.useState<StudentRow[]>([]);
  const [qStudent, setQStudent] = React.useState("");
  const [selectedStudents, setSelectedStudents] = React.useState<Record<string, boolean>>({});

  // Enrollments list
  const [enrollments, setEnrollments] = React.useState<ActivityEnrollmentRow[]>([]);

  // Reporte CSV (sin descarga)
  const [reportCsv, setReportCsv] = React.useState("");
  const [reportMeta, setReportMeta] = React.useState<any>(null);

  const loadPeriods = React.useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/academic/periods");
      const list: Period[] = res.data ?? [];
      setPeriods(list);
      const active = list.find((p) => p.isActive);
      if (active) setPeriodId(active._id);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar periodos");
    }
  }, []);

  const loadCareers = React.useCallback(async () => {
    try {
      const res = await api.get("/academic/careers");
      setCareers(res.data ?? []);
    } catch {
      // silencioso
    }
  }, []);

  const loadActivities = React.useCallback(async () => {
    setActivities([]);
    setSelectedActivityId("");
    setBlocks([]);
    setEnrollments([]);
    setReportCsv("");
    setReportMeta(null);

    if (!periodId) return;
    setError("");
    try {
      const res = await api.get("/academic/activities", { params: { periodId } });
      setActivities(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar actividades");
    }
  }, [periodId]);

  const loadBlocks = React.useCallback(async () => {
    setBlocks([]);
    if (!periodId || !selectedActivityId) return;

    setError("");
    try {
      const res = await api.get("/academic/schedule-blocks", {
        params: { periodId, type: "extracurricular", activityId: selectedActivityId },
      });
      setBlocks(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar bloques de horario");
    }
  }, [periodId, selectedActivityId]);

  const loadStudents = React.useCallback(async () => {
    setStudents([]);
    setSelectedStudents({});
    if (!careerId) return;

    setError("");
    try {
      const res = await api.get("/academic/students", { params: { careerId } });
      const list: StudentRow[] = res.data ?? [];
      // Orden alfabético
      list.sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));
      setStudents(list);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar alumnos");
    }
  }, [careerId]);

  const loadEnrollments = React.useCallback(async () => {
    setEnrollments([]);
    if (!periodId || !selectedActivityId) return;

    setError("");
    try {
      const res = await api.get("/academic/activity-enrollments", {
        params: { periodId, activityId: selectedActivityId },
      });

      const list = (res.data ?? []).slice();
      list.sort((a: any, b: any) => {
        const an = String(a?.studentId?.name ?? "").toLowerCase();
        const bn = String(b?.studentId?.name ?? "").toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return String(a?.studentId?.controlNumber ?? "").localeCompare(String(b?.studentId?.controlNumber ?? ""));
      });

      setEnrollments(list);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar inscritos de actividad");
    }
  }, [periodId, selectedActivityId]);

  React.useEffect(() => {
    loadPeriods();
    loadCareers();
  }, [loadPeriods, loadCareers]);

  React.useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  React.useEffect(() => {
    loadBlocks();
    loadEnrollments();
    setReportCsv("");
    setReportMeta(null);
  }, [loadBlocks, loadEnrollments]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const createActivity = async () => {
    setError("");
    if (!periodId) return setError("Selecciona un periodo");
    if (!name.trim()) return setError("Nombre requerido");
    if (!type.trim()) return setError("Tipo requerido");

    setLoading(true);
    try {
      await api.post("/academic/activities", {
        periodId,
        name: name.trim(),
        type: type.trim(),
        responsibleName: responsibleName.trim() ? responsibleName.trim() : null,
        capacity: capacity.trim() ? Number(capacity) : null,
        status,
      });
      setName("");
      setResponsibleName("");
      setCapacity("");
      setStatus("active");
      await loadActivities();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear actividad";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/activities/${id}`);
      await loadActivities();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar actividad";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async () => {
    setError("");
    if (!periodId) return setError("Selecciona periodo");
    if (!selectedActivityId) return setError("Selecciona una actividad");
    if (!editName.trim()) return setError("Nombre requerido");
    if (!editType.trim()) return setError("Tipo requerido");

    const id = selectedActivityId;
    setLoading(true);
    try {
      await api.patch(`/academic/activities/${id}`, {
        periodId,
        name: editName.trim(),
        type: editType.trim(),
        responsibleName: editResponsibleName.trim() ? editResponsibleName.trim() : null,
        capacity: editCapacity.trim() ? Number(editCapacity) : null,
        status: editStatus,
      });
      await loadActivities();
      setSelectedActivityId(id);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar actividad";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const addBlock = async () => {
    setError("");
    if (!periodId) return setError("Selecciona periodo");
    if (!selectedActivityId) return setError("Selecciona una actividad");
    if (!startTime || !endTime) return setError("startTime/endTime requeridos");

    setLoading(true);
    try {
      await api.post("/academic/schedule-blocks", {
        periodId,
        type: "extracurricular",
        activityId: selectedActivityId,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim() ? room.trim() : null,
      });
      setRoom("");
      await loadBlocks();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear bloque";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlock = async (id: string) => {
    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/schedule-blocks/${id}`);
      await loadBlocks();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar bloque";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string, checked: boolean) => {
    setSelectedStudents((prev) => ({ ...prev, [id]: checked }));
  };

  const bulkEnroll = async () => {
    setError("");
    if (!periodId) return setError("Selecciona periodo");
    if (!selectedActivityId) return setError("Selecciona actividad");

    const ids = Object.entries(selectedStudents)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (ids.length === 0) return setError("Selecciona al menos 1 alumno");

    setLoading(true);
    try {
      const res = await api.post("/academic/activity-enrollments/bulk", {
        periodId,
        activityId: selectedActivityId,
        studentIds: ids,
        status: "active",
      });

      // Si el backend regresó errores por choques, muéstralos
      const errors = res.data?.errors ?? [];
      if (errors.length > 0) {
        const preview = errors.slice(0, 6).map((e: any) => `${e.studentId}: ${e.message}`).join(" | ");
        setError(`Algunos no se inscribieron: ${preview}${errors.length > 6 ? " ..." : ""}`);
      }

      setSelectedStudents({});
      await loadEnrollments();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error en inscripción masiva";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = React.useMemo(() => {
    const s = qStudent.trim().toLowerCase();
    if (!s) return students;
    return students.filter((st) => {
      return (st.controlNumber ?? "").toLowerCase().includes(s) || (st.name ?? "").toLowerCase().includes(s);
    });
  }, [students, qStudent]);

  const selectedActivity = activities.find((a) => a._id === selectedActivityId);

  React.useEffect(() => {
    if (!selectedActivity) {
      setEditName("");
      setEditType("");
      setEditResponsibleName("");
      setEditCapacity("");
      setEditStatus("active");
      return;
    }
    setEditName(selectedActivity.name ?? "");
    setEditType(selectedActivity.type ?? "");
    setEditResponsibleName(selectedActivity.responsibleName ?? "");
    setEditCapacity(typeof selectedActivity.capacity === "number" ? String(selectedActivity.capacity) : "");
    setEditStatus(selectedActivity.status ?? "active");
  }, [selectedActivityId, activities]);

  const loadReport = async () => {
    setError("");
    setReportCsv("");
    setReportMeta(null);

    if (!periodId || !selectedActivityId) return;

    setLoading(true);
    try {
      const res = await api.get("/academic/activity-enrollments/report", {
        params: { periodId, activityId: selectedActivityId, status: "active" },
      });
      setReportMeta(res.data?.meta ?? null);
      setReportCsv(res.data?.csv ?? "");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al generar reporte";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Actividades extraescolares (Control Escolar)">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Periodo</CardTitle>
            <CardDescription>Selecciona el periodo de trabajo</CardDescription>
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

            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={loadActivities} disabled={loading || !periodId}>
                Recargar actividades
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crear actividad</CardTitle>
            <CardDescription>Catálogo de actividades extraescolares</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-6">
            <div className="space-y-2 lg:col-span-2">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fútbol / Danza / Club..."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="deportiva" disabled={loading} />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Responsable (texto)</Label>
              <Input
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                placeholder="Nombre del responsable"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Cupo</Label>
              <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="30" disabled={loading} />
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
              <Button onClick={createActivity} disabled={loading || !periodId || !name.trim() || !type.trim()}>
                Crear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividades</CardTitle>
            <CardDescription>Selecciona una actividad para gestionar horario e inscripciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Actividad seleccionada</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {activities.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.type}) {a.status === "inactive" ? " - INACTIVA" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedActivity ? (
              <div className="rounded-md border border-border p-3 space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="text-sm">
                    <div className="font-medium">Editar actividad seleccionada</div>
                    <div className="text-muted-foreground">
                      Actual: {selectedActivity.name} ({selectedActivity.type})
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={updateActivity} disabled={loading || !editName.trim() || !editType.trim()}>
                      Guardar cambios
                    </Button>
                    <Button variant="destructive" onClick={() => deleteActivity(selectedActivity._id)} disabled={loading}>
                      Eliminar
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-6">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Nombre</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input value={editType} onChange={(e) => setEditType(e.target.value)} disabled={loading} />
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <Label>Responsable (texto)</Label>
                    <Input value={editResponsibleName} onChange={(e) => setEditResponsibleName(e.target.value)} disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label>Cupo</Label>
                    <Input value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} placeholder="(opcional)" disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      disabled={loading}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {selectedActivity ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Horario de la actividad</CardTitle>
                <CardDescription>Bloques extraescolares (schedule-blocks)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Día</Label>
                    <select
                      className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d}>
                          {dayLabel[d]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Inicio</Label>
                    <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label>Fin</Label>
                    <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={loading} />
                  </div>

                  <div className="space-y-2">
                    <Label>Aula</Label>
                    <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="G2 / Cancha" disabled={loading} />
                  </div>

                  <div className="lg:col-span-4">
                    <Button onClick={addBlock} disabled={loading}>
                      Agregar bloque
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {blocks.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sin bloques aún.</div>
                  ) : (
                    <ul className="space-y-2">
                      {blocks.map((b) => (
                        <li key={b._id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                          <span>
                            {dayLabel[b.dayOfWeek]} {b.startTime}-{b.endTime} · {b.room ?? "Sin aula"}
                          </span>
                          <Button variant="destructive" onClick={() => deleteBlock(b._id)} disabled={loading}>
                            Quitar
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inscripción de alumnos</CardTitle>
                <CardDescription>Selecciona alumnos y usa inscripción masiva</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 lg:grid-cols-2">
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
                    <Label>Búsqueda</Label>
                    <Input value={qStudent} onChange={(e) => setQStudent(e.target.value)} placeholder="No. Control o nombre" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={bulkEnroll} disabled={loading}>
                    Inscribir seleccionados
                  </Button>
                  <Button variant="secondary" onClick={loadEnrollments} disabled={loading}>
                    Recargar inscritos
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Seleccionar alumnos</div>
                  {careerId ? (
                    <div className="max-h-64 overflow-auto rounded-md border border-border">
                      <div className="p-2 space-y-2">
                        {filteredStudents.map((st) => (
                          <label key={st._id} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={!!selectedStudents[st._id]} onCheckedChange={(v) => toggleStudent(st._id, Boolean(v))} />
                            <span className="text-muted-foreground">{st.controlNumber}</span>
                            <span>{st.name}</span>
                          </label>
                        ))}
                        {filteredStudents.length === 0 ? (
                          <div className="text-sm text-muted-foreground">Sin alumnos para esa búsqueda.</div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Selecciona una carrera para ver alumnos.</div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Inscritos en la actividad</div>
                  {enrollments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Sin inscritos.</div>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {enrollments.map((r) => (
                        <li key={r._id} className="flex items-center justify-between rounded-md border border-border p-2">
                          <span>
                            {(r.studentId?.controlNumber ?? "S/N")} · {(r.studentId?.name ?? "Sin nombre")}
                          </span>
                          <span className="text-muted-foreground">{r.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Reporte CSV (copiar) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={loadReport} disabled={loading || !selectedActivityId}>
                      Generar reporte CSV (copiar)
                    </Button>

                    {reportCsv ? (
                      <Button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(reportCsv);
                          } catch {
                            setError("No se pudo copiar al portapapeles (permiso del navegador).");
                          }
                        }}
                        disabled={loading}
                      >
                        Copiar CSV
                      </Button>
                    ) : null}
                  </div>

                  {reportMeta ? (
                    <div className="text-xs text-muted-foreground">
                      Reporte: {reportMeta.activityName} · {reportMeta.periodName} · Total: {reportMeta.total}
                    </div>
                  ) : null}

                  {reportCsv ? (
                    <textarea
                      className="min-h-[180px] w-full rounded-md border border-border bg-input p-2 text-xs"
                      value={reportCsv}
                      readOnly
                    />
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
