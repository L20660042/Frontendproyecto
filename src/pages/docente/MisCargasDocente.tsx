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
};

function downloadCSV(filename: string, rows: Array<Record<string, any>>) {
  const headers = Object.keys(rows[0] ?? {});

  const esc = (v: any) => {
    const s = String(v ?? "");
    const needsQuotes = /[",\n]/.test(s);
    const cleaned = s.replace(/"/g, '""');
    return needsQuotes ? `"${cleaned}"` : cleaned;
  };

  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ].join("\n");

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

export default function MisCargasDocente() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [periodId, setPeriodId] = React.useState("");
  const [classAssignments, setClassAssignments] = React.useState<ClassAssignment[]>([]);
  const [selected, setSelected] = React.useState<ClassAssignment | null>(null);

  const [enrollments, setEnrollments] = React.useState<CourseEnrollment[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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
      if (!periodId) return;

      setLoading(true);
      try {
        const res = await api.get("/academic/course-enrollments/me", {
          params: { periodId, classAssignmentId: ca._id },
        });
        setEnrollments(res.data ?? []);
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

  const exportSelected = () => {
    if (!selected) return;
    const rows = (enrollments ?? []).map((e) => {
      const st = e.studentId ?? {};
      return {
        controlNumber: st.controlNumber ?? "",
        name: st.name ?? "",
        classAssignmentId: selected._id,
        subject: selected.subjectId?.name ?? "",
        group: selected.groupId?.name ?? "",
      };
    });

    if (rows.length === 0) return;

    const filename = `lista_${selected.subjectId?.name ?? "materia"}_${selected.groupId?.name ?? "grupo"}.csv`
      .replace(/\s+/g, "_")
      .toLowerCase();

    downloadCSV(filename, rows);
  };

  return (
    <DashboardLayout title="Mis cargas">
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
            <CardDescription>Selecciona una carga para ver alumnos inscritos.</CardDescription>
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

        {/* Alumnos de la carga seleccionada */}
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
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Buscar por No. Control o nombre"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                disabled={!selected}
              />
              <Button variant="secondary" onClick={exportSelected} disabled={!selected || enrollments.length === 0}>
                Exportar CSV
              </Button>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">No. Control</th>
                    <th className="text-left p-3">Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {!selected ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-muted-foreground">
                        Selecciona una carga.
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-muted-foreground">
                        Sin alumnos inscritos (o no coincide la búsqueda).
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => {
                      const st = e.studentId ?? {};
                      return (
                        <tr key={e._id} className="border-t border-border">
                          <td className="p-3">{st.controlNumber ?? "-"}</td>
                          <td className="p-3 font-medium">{st.name ?? "-"}</td>
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
