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

type CourseEnrollment = {
  _id: string;
  studentId?: any;
  status?: "active" | "inactive";
  finalGrade?: number | null;
};

function csvEscape(v: any) {
  const s = String(v ?? "");
  const needsQuotes = /[",\n]/.test(s);
  const cleaned = s.replace(/"/g, '""');
  return needsQuotes ? `"${cleaned}"` : cleaned;
}

function downloadTextFile(filename: string, text: string, mime = "text/csv;charset=utf-8;") {
  const bom = "\uFEFF";
  const blob = new Blob([bom + text], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadCSV(filename: string, rows: Array<Record<string, any>>) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0] ?? {});
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(","))].join("\n");
  downloadTextFile(filename, csv);
}

function isValidGrade(n: number) {
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

function safeFilename(s: string) {
  // quita acentos y símbolos raros para nombre de archivo
  const plain = String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return plain
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function exportAttendanceGrid(params: {
  institutionName: string;
  periodName: string;
  teacherName: string;
  subjectName: string;
  groupName: string;
  enrollments: CourseEnrollment[];
  weeks?: number; // default 4
}) {
  const weeks = params.weeks ?? 4;

  const sorted = [...(params.enrollments ?? [])].sort((a, b) => {
    const an = String(a?.studentId?.name ?? "").trim().toLowerCase();
    const bn = String(b?.studentId?.name ?? "").trim().toLowerCase();
    return an.localeCompare(bn, "es", { sensitivity: "base" });
  });

  const cols: string[] = ["No.", "NOMBRE DEL ALUMNO"];
  for (let w = 0; w < weeks; w++) cols.push("L", "M", "M", "J", "V");
  cols.push("T"); // Total

  const width = cols.length;
  const blankRow = () => new Array(width).fill("");

  const lines: string[] = [];

  const inst = blankRow();
  inst[0] = params.institutionName;
  lines.push(inst.map(csvEscape).join(","));

  const meta = blankRow();
  meta[0] = "DOCENTE:";
  meta[1] = params.teacherName;

  meta[5] = "GRADO Y GRUPO:";
  meta[6] = params.groupName;

  meta[12] = "PERIODO:";
  meta[13] = params.periodName;

  meta[17] = "MATERIA:";
  meta[18] = params.subjectName;

  lines.push(meta.map(csvEscape).join(","));

  // Línea en blanco
  lines.push(blankRow().join(","));

  // Encabezado de la tabla
  lines.push(cols.map(csvEscape).join(","));

  // Filas de alumnos
  sorted.forEach((e, idx) => {
    const st = e.studentId ?? {};
    const row = blankRow();
    row[0] = String(idx + 1);
    row[1] = String(st.name ?? "");
    // El resto queda vacío para marcar asistencia
    lines.push(row.map(csvEscape).join(","));
  });

  const filename = `asistencia_${safeFilename(params.groupName)}_${safeFilename(params.subjectName)}_${safeFilename(
    params.periodName,
  )}.csv`;

  downloadTextFile(filename, lines.join("\n"));
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
  const [info, setInfo] = React.useState("");

  const [gradeDraft, setGradeDraft] = React.useState<Record<string, string>>({});

  // Periodos
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
    setInfo("");
    setClassAssignments([]);
    setSelected(null);
    setEnrollments([]);
    setGradeDraft({});

    if (!periodId) return;

    setLoading(true);
    try {
      const res = await api.get("/academic/class-assignments/me", { params: { periodId, status: "active" } });
      setClassAssignments(res.data ?? []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Error al cargar mis cargas. Verifica que exista GET /academic/class-assignments/me en backend.",
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
      setInfo("");
      setSelected(ca);
      setEnrollments([]);
      setGradeDraft({});
      if (!periodId) return;

      setLoading(true);
      try {
        const res = await api.get("/academic/course-enrollments/me", {
          params: { periodId, classAssignmentId: ca._id },
        });

        const list: CourseEnrollment[] = res.data ?? [];
        setEnrollments(list);

        const drafts: Record<string, string> = {};
        for (const e of list) {
          drafts[e._id] = e.finalGrade === null || e.finalGrade === undefined ? "" : String(e.finalGrade);
        }
        setGradeDraft(drafts);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ??
            "Error al cargar alumnos. Verifica que exista GET /academic/course-enrollments/me en backend.",
        );
      } finally {
        setLoading(false);
      }
    },
    [periodId],
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

  const exportRoster = () => {
    if (!selected) return;
    if (!enrollments || enrollments.length === 0) return;

    const rows = [...enrollments].sort((a, b) => {
      const an = String(a?.studentId?.name ?? "").trim().toLowerCase();
      const bn = String(b?.studentId?.name ?? "").trim().toLowerCase();
      return an.localeCompare(bn, "es", { sensitivity: "base" });
    });

    const data = rows.map((e) => {
      const st = e.studentId ?? {};
      return {
        controlNumber: st.controlNumber ?? "",
        name: st.name ?? "",
        finalGrade: e.finalGrade ?? "",
        subject: selected.subjectId?.name ?? "",
        group: selected.groupId?.name ?? "",
        period: periods.find((p) => p._id === periodId)?.name ?? "",
      };
    });

    const filename = `lista_${safeFilename(selected.groupId?.name ?? "grupo")}_${safeFilename(
      selected.subjectId?.name ?? "materia",
    )}.csv`;

    downloadCSV(filename, data);
  };

  const downloadAttendance = () => {
    if (!selected) return;
    if (!enrollments || enrollments.length === 0) return;

    const institutionName = "Tecnologico Nacional de Mexico - Campus Matehuala"; // ASCII (sin guiones raros)
    const periodName = periods.find((p) => p._id === periodId)?.name ?? "";
    const teacherName = selected.teacherId?.name ?? "";
    const subjectName = selected.subjectId?.name ?? "";
    const groupName = selected.groupId?.name ?? "";

    exportAttendanceGrid({
      institutionName,
      periodName,
      teacherName,
      subjectName,
      groupName,
      enrollments,
      weeks: 4, // cambia a 5 si quieres 5 semanas
    });
  };

  const saveOne = async (courseEnrollmentId: string) => {
    setError("");
    setInfo("");

    const raw = (gradeDraft[courseEnrollmentId] ?? "").trim();
    let finalGrade: number | null = null;

    if (raw !== "") {
      const n = Number(raw);
      if (!isValidGrade(n)) {
        setError("Calificación inválida. Debe ser un número entre 0 y 100.");
        return;
      }
      finalGrade = n;
    }

    setLoading(true);
    try {
      await api.patch(`/academic/course-enrollments/${courseEnrollmentId}`, { finalGrade });
      setEnrollments((prev) => prev.map((e) => (e._id === courseEnrollmentId ? { ...e, finalGrade } : e)));

      setInfo("Calificación guardada.");
      setTimeout(() => setInfo(""), 1200);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al guardar calificación";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    if (!selected) return;
    setError("");
    setInfo("");

    setLoading(true);
    try {
      for (const e of enrollments) {
        const raw = (gradeDraft[e._id] ?? "").trim();
        let finalGrade: number | null = null;

        if (raw !== "") {
          const n = Number(raw);
          if (!isValidGrade(n)) {
            throw new Error(`Calificación inválida para ${e.studentId?.controlNumber ?? "alumno"} (0..100)`);
          }
          finalGrade = n;
        }

        const current = e.finalGrade ?? null;
        const changed =
          (current === null && finalGrade !== null) ||
          (current !== null && finalGrade === null) ||
          current !== finalGrade;

        if (!changed) continue;

        await api.patch(`/academic/course-enrollments/${e._id}`, { finalGrade });
        setEnrollments((prev) => prev.map((x) => (x._id === e._id ? { ...x, finalGrade } : x)));
      }

      setInfo("Cambios guardados.");
      setTimeout(() => setInfo(""), 1500);
    } catch (err: any) {
      setError(String(err?.message ?? err ?? "Error al guardar todo"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Mis cargas">
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{String(error)}</AlertDescription>
        </Alert>
      ) : null}

      {info ? (
        <Alert className="mb-4">
          <AlertDescription>{String(info)}</AlertDescription>
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
        {/* Cargas */}
        <Card>
          <CardHeader>
            <CardTitle>Mis cargas del periodo</CardTitle>
            <CardDescription>Selecciona una carga para ver alumnos, descargar asistencia y capturar calificación final.</CardDescription>
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
                              Ver alumnos
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

        {/* Alumnos */}
        <Card>
          <CardHeader>
            <CardTitle>Alumnos inscritos</CardTitle>
            <CardDescription>
              {selected
                ? `${selected.subjectId?.name ?? "Materia"} — ${selected.groupId?.name ?? "Grupo"}`
                : "Selecciona una carga para ver su lista."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex gap-2 items-center flex-wrap">
              <Input
                placeholder="Buscar por No. Control o nombre"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                disabled={!selected}
              />

              <Button variant="secondary" onClick={exportRoster} disabled={!selected || enrollments.length === 0}>
                Descargar lista (CSV)
              </Button>

              <Button variant="secondary" onClick={downloadAttendance} disabled={!selected || enrollments.length === 0}>
                Descargar lista de asistencia
              </Button>

              <Button onClick={saveAll} disabled={!selected || enrollments.length === 0 || loading}>
                Guardar todo
              </Button>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">No. Control</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3 w-[160px]">Final (0–100)</th>
                    <th className="text-left p-3 w-[120px]">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {!selected ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Selecciona una carga.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin alumnos inscritos (o no coincide la búsqueda).
                      </td>
                    </tr>
                  ) : (
                    filtered
                      .slice()
                      .sort((a, b) => {
                        const an = String(a?.studentId?.name ?? "").trim().toLowerCase();
                        const bn = String(b?.studentId?.name ?? "").trim().toLowerCase();
                        return an.localeCompare(bn, "es", { sensitivity: "base" });
                      })
                      .map((e) => {
                        const st = e.studentId ?? {};
                        return (
                          <tr key={e._id} className="border-t border-border">
                            <td className="p-3">{st.controlNumber ?? "-"}</td>
                            <td className="p-3 font-medium">{st.name ?? "-"}</td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step="1"
                                value={gradeDraft[e._id] ?? ""}
                                onChange={(ev) => setGradeDraft((prev) => ({ ...prev, [e._id]: ev.target.value }))}
                                disabled={loading}
                              />
                            </td>
                            <td className="p-3">
                              <Button variant="secondary" onClick={() => saveOne(e._id)} disabled={loading}>
                                Guardar
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
