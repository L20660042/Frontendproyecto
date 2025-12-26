import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; code?: string; name: string };
type Group = { _id: string; name: string; semester: number };

type SummaryRow = {
  _id: string;
  subjectId?: any;
  teacherId?: any;
  groupId?: any;
  careerId?: any;
  periodId?: any;
  status?: string;
  enrolledCount: number;
};

export default function GroupLoadsSummaryPage() {
  const nav = useNavigate();

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [rows, setRows] = React.useState<SummaryRow[]>([]);

  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [groupId, setGroupId] = React.useState("");

  // base
  React.useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // grupos por periodo + carrera
  React.useEffect(() => {
    (async () => {
      setGroups([]);
      setGroupId("");
      setRows([]);

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

  const loadSummary = React.useCallback(async () => {
    setError("");
    setRows([]);

    if (!periodId || !groupId) {
      setError("Selecciona periodo y grupo.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/academic/class-assignments/group-summary", {
        params: {
          periodId,
          careerId: careerId || undefined,
          groupId,
          status: "active",
        },
      });
      setRows(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar resumen del grupo");
    } finally {
      setLoading(false);
    }
  }, [periodId, careerId, groupId]);

  React.useEffect(() => {
    if (periodId && groupId) loadSummary();
  }, [periodId, groupId, loadSummary]);

  const openEnrollment = (classAssignmentId: string) => {
    // abre inscripciones ya preseleccionadas
    const qs = new URLSearchParams({
      periodId,
      careerId,
      groupId,
      classAssignmentId,
    }).toString();

    nav(`/catalogos/inscripciones?${qs}`);
  };

  return (
    <DashboardLayout title="Grupo → Cargas → # inscritos">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{String(error)}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Selector</CardTitle>
            <CardDescription>Selecciona el grupo y revisa el conteo de inscritos por carga.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Periodo</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={periodId}
                onChange={(e) => {
                  setPeriodId(e.target.value);
                  setRows([]);
                }}
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
                onChange={(e) => {
                  setCareerId(e.target.value);
                  setRows([]);
                }}
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

            <div className="flex items-end">
              <Button variant="secondary" onClick={loadSummary} disabled={!periodId || !groupId || loading}>
                Refrescar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cargas del grupo</CardTitle>
            <CardDescription>Conteo de inscritos activos por carga.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Materia</th>
                    <th className="text-left p-3">Docente</th>
                    <th className="text-left p-3">Inscritos</th>
                    <th className="text-left p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {!groupId ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Selecciona un grupo.
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin cargas (o no hay datos para el grupo seleccionado).
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r._id} className="border-t border-border">
                        <td className="p-3 font-medium">{r.subjectId?.name ?? "-"}</td>
                        <td className="p-3">{r.teacherId?.name ?? "-"}</td>
                        <td className="p-3">{r.enrolledCount}</td>
                        <td className="p-3">
                          <Button onClick={() => openEnrollment(r._id)}>Abrir inscripción</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
