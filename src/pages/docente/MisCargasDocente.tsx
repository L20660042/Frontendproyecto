import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "../../components/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";

type Period = { _id: string; name: string; isActive: boolean };

type ClassAssignment = {
  _id: string;
  periodId?: any;
  careerId?: any;
  groupId?: any;
  subjectId?: any;
  teacherId?: any;
  status?: "active" | "inactive";
};

type UnitGrades = { u1?: number; u2?: number; u3?: number; u4?: number; u5?: number };

type CourseEnrollment = {
  _id: string;
  studentId?: any;
  status?: "active" | "inactive";
  unitGrades?: UnitGrades;
  finalGrade?: number | null;
};

function downloadCSV(filename: string, rows: Array<Record<string, any>>) {
  const headers = Object.keys(rows[0] ?? {});
  const esc = (v: any) => {
    const s = String(v ?? "");
    const needsQuotes = /[",\n]/.test(s);
    const cleaned = s.replace(/"/g, '""');
    return needsQuotes ? `"${cleaned}"` : cleaned;
  };

  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function normalizeNum(v: string): number | undefined {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function gradeStatus(finalGrade: number | null | undefined) {
  if (typeof finalGrade !== "number") return { label: "Sin final", cls: "bg-muted text-foreground" };
  if (finalGrade >= 70) return { label: "Aprobado", cls: "bg-emerald-100 text-emerald-900" };
  return { label: "Reprobado", cls: "bg-red-100 text-red-900" };
}

export default function MisCargasDocente() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [classAssignments, setClassAssignments] = React.useState<ClassAssignment[]>([]);
  const [selected, setSelected] = React.useState<ClassAssignment | null>(null);

  const [enrollments, setEnrollments] = React.useState<CourseEnrollment[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Edición local de calificaciones
  const [edits, setEdits] = React.useState<Record<string, { u1: string; u2: string; u3: string; u4: string; u5: string }>>(
    {}
  );
  const [savingId, setSavingId] = React.useState<string>(""); // guarda por fila
  const [savingAll, setSavingAll] = React.useState(false);

  // Periodos + activo
  React.useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Mis cargas por periodo
  const loadMyLoads = React.useCallback(async () => {
    setError("");
    setClassAssignments([]);
    setSelected(null);
    setEnrollments([]);
    setEdits({});

    if (!periodId) return;

    setLoading(true);
    try {
      const res = await api.get("/academic/class-assignments/me", { params: { periodId, status: "active" } });
      setClassAssignments(res.data ?? []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Error al cargar mis cargas. Verifica que exista GET /academic/class-assignments/me en backend."
      );
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  React.useEffect(() => {
    loadMyLoads();
  }, [loadMyLoads]);

  // Alumnos inscritos de una carga
  const loadStudents = React.useCallback(
    async (ca: ClassAssignment) => {
      setError("");
      setSelected(ca);
      setEnrollments([]);
      setEdits({});
      if (!periodId) return;

      setLoading(true);
      try {
        const res = await api.get("/academic/course-enrollments/me", {
          params: { periodId, classAssignmentId: ca._id, status: "active" },
        });

        const list: CourseEnrollment[] = res.data ?? [];
        setEnrollments(list);

        // Inicializa edición desde backend
        const nextEdits: any = {};
        for (const e of list) {
          const ug = e.unitGrades ?? {};
          nextEdits[e._id] = {
            u1: ug.u1 === undefined ? "" : String(ug.u1),
            u2: ug.u2 === undefined ? "" : String(ug.u2),
            u3: ug.u3 === undefined ? "" : String(ug.u3),
            u4: ug.u4 === undefined ? "" : String(ug.u4),
            u5: ug.u5 === undefined ? "" : String(ug.u5),
          };
        }
        setEdits(nextEdits);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ??
            "Error al cargar alumnos. Verifica que exista GET /academic/course-enrollments/me en backend."
        );
      } finally {
        setLoading(false);
      }
    },
    [periodId]
  );

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return enrollments;

    return enrollments.filter((e) => {
      const st = e.studentId ?? {};
      const cn = String(st.controlNumber ?? "").toLowerCase();
      const nm = String(st.name ?? "").toLowerCase();
      return cn.includes(s) || nm.includes(s);
    });
  }, [enrollments, q]);

  const setEditField = (enrollmentId: string, key: "u1" | "u2" | "u3" | "u4" | "u5", value: string) => {
    setEdits((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...(prev[enrollmentId] ?? { u1: "", u2: "", u3: "", u4: "", u5: "" }),
        [key]: value,
      },
    }));
  };

  const saveRow = async (enrollmentId: string) => {
    if (!selected) return;
    const rowEdit = edits[enrollmentId];
    if (!rowEdit) return;

    setError("");
    setSavingId(enrollmentId);
    try {
      const payload: any = { unitGrades: {}, computeFinal: true };

      const u1 = normalizeNum(rowEdit.u1); if (u1 !== undefined) payload.unitGrades.u1 = u1;
      const u2 = normalizeNum(rowEdit.u2); if (u2 !== undefined) payload.unitGrades.u2 = u2;
      const u3 = normalizeNum(rowEdit.u3); if (u3 !== undefined) payload.unitGrades.u3 = u3;
      const u4 = normalizeNum(rowEdit.u4); if (u4 !== undefined) payload.unitGrades.u4 = u4;
      const u5 = normalizeNum(rowEdit.u5); if (u5 !== undefined) payload.unitGrades.u5 = u5;

      const res = await api.patch(`/academic/course-enrollments/${enrollmentId}/grades`, payload);

      // Actualiza fila local con respuesta del backend
      const updated: CourseEnrollment = res.data;
      setEnrollments((prev) => prev.map((e) => (e._id === enrollmentId ? updated : e)));

      // Re-sincroniza edits para mantener consistencia (si backend redondea)
      const ug = updated.unitGrades ?? {};
      setEdits((prev) => ({
        ...prev,
        [enrollmentId]: {
          u1: ug.u1 === undefined ? "" : String(ug.u1),
          u2: ug.u2 === undefined ? "" : String(ug.u2),
          u3: ug.u3 === undefined ? "" : String(ug.u3),
          u4: ug.u4 === undefined ? "" : String(ug.u4),
          u5: ug.u5 === undefined ? "" : String(ug.u5),
        },
      }));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al guardar calificaciones");
    } finally {
      setSavingId("");
    }
  };

  const saveAll = async () => {
    if (!selected) return;
    setError("");
    setSavingAll(true);
    try {
      // Guardado secuencial para evitar saturar backend
      for (const e of enrollments) {
        await saveRow(e._id);
      }
    } finally {
      setSavingAll(false);
    }
  };

  const exportSelectedGrades = () => {
    if (!selected) return;

    const rows = (enrollments ?? []).map((e) => {
      const st = e.studentId ?? {};
      const ug = e.unitGrades ?? {};
      return {
        controlNumber: st.controlNumber ?? "",
        name: st.name ?? "",
        subject: selected.subjectId?.name ?? "",
        group: selected.groupId?.name ?? "",
        u1: ug.u1 ?? "",
        u2: ug.u2 ?? "",
        u3: ug.u3 ?? "",
        u4: ug.u4 ?? "",
        u5: ug.u5 ?? "",
        finalGrade: e.finalGrade ?? "",
      };
    });

    if (rows.length === 0) return;

    const filename = `calificaciones_${selected.subjectId?.name ?? "materia"}_${selected.groupId?.name ?? "grupo"}.csv`
      .replace(/\s+/g, "_")
      .toLowerCase();

    downloadCSV(filename, rows);
  };

  return (
    <DashboardLayout title="Mis cargas (Calificaciones por unidad)">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-4">
        <label className="text-sm text-muted-foreground">Periodo</label>
        <div className="mt-1 flex gap-2">
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

          <Button variant="secondary" onClick={loadMyLoads} disabled={!periodId || loading}>
            Refrescar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista de cargas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis cargas del periodo</CardTitle>
            <CardDescription>Selecciona una carga para capturar calificaciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Grupo</th>
                    <th className="text-left p-3">Carrera</th>
                    <th className="text-left p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {!periodId ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Selecciona un periodo.
                      </td>
                    </tr>
                  ) : classAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        No tienes cargas activas en este periodo.
                      </td>
                    </tr>
                  ) : (
                    classAssignments.map((ca) => {
                      const isSelected = selected?._id === ca._id;
                      return (
                        <tr key={ca._id} className={`border-t border-border ${isSelected ? "bg-muted/40" : ""}`}>
                          <td className="p-3 font-medium">{ca.subjectId?.name ?? "-"}</td>
                          <td className="p-3">{ca.groupId?.name ?? "-"}</td>
                          <td className="p-3">{ca.careerId?.name ?? "-"}</td>
                          <td className="p-3">
                            <Button onClick={() => loadStudents(ca)} disabled={loading}>
                              Calificar
                            </Button>
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

        {/* Alumnos de la carga seleccionada */}
        <Card>
          <CardHeader>
            <CardTitle>Captura por alumno</CardTitle>
            <CardDescription>
              {selected
                ? `${selected.subjectId?.name ?? "Materia"} — ${selected.groupId?.name ?? "Grupo"}`
                : "Selecciona una carga para capturar calificaciones."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Buscar por No. Control o nombre"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                disabled={!selected}
              />

              <Button variant="secondary" onClick={exportSelectedGrades} disabled={!selected || enrollments.length === 0}>
                Exportar CSV (calificaciones)
              </Button>

              <Button onClick={saveAll} disabled={!selected || enrollments.length === 0 || savingAll}>
                Guardar todo
              </Button>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">No. Control</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">U1</th>
                    <th className="text-left p-3">U2</th>
                    <th className="text-left p-3">U3</th>
                    <th className="text-left p-3">U4</th>
                    <th className="text-left p-3">U5</th>
                    <th className="text-left p-3">Final</th>
                    <th className="text-left p-3">Estado</th>
                    <th className="text-left p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {!selected ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-muted-foreground">
                        Selecciona una carga.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-muted-foreground">
                        Sin alumnos inscritos (o no coincide la búsqueda).
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => {
                      const st = e.studentId ?? {};
                      const rowEdit = edits[e._id] ?? { u1: "", u2: "", u3: "", u4: "", u5: "" };
                      const gs = gradeStatus(e.finalGrade);

                      return (
                        <tr key={e._id} className="border-t border-border">
                          <td className="p-3">{st.controlNumber ?? "-"}</td>
                          <td className="p-3 font-medium">{st.name ?? "-"}</td>

                          {(["u1", "u2", "u3", "u4", "u5"] as const).map((k) => (
                            <td key={k} className="p-3">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={rowEdit[k]}
                                onChange={(ev) => setEditField(e._id, k, ev.target.value)}
                                className="h-9 w-20"
                              />
                            </td>
                          ))}

                          <td className="p-3 font-medium">{typeof e.finalGrade === "number" ? e.finalGrade : "-"}</td>

                          <td className="p-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${gs.cls}`}>
                              {gs.label}
                            </span>
                          </td>

                          <td className="p-3">
                            <Button
                              variant="secondary"
                              onClick={() => saveRow(e._id)}
                              disabled={savingId === e._id || savingAll}
                            >
                              {savingId === e._id ? "Guardando..." : "Guardar"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {selected ? (
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{enrollments.length}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
