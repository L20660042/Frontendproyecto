import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { api } from "../../api/client";

type Period = { _id: string; name: string; isActive: boolean };
type Career = { _id: string; name: string; code: string };
type Group = {
  _id: string;
  name: string;
  semester: number;
  periodId: any;
  careerId: any;
};

export default function GroupsPage() {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [careers, setCareers] = React.useState<Career[]>([]);
  const [items, setItems] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // filtros/creación
  const [periodId, setPeriodId] = React.useState("");
  const [careerId, setCareerId] = React.useState("");
  const [name, setName] = React.useState("");
  const [semester, setSemester] = React.useState<number>(1);

  const loadCombos = React.useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.get("/academic/periods"), api.get("/academic/careers")]);
      setPeriods(p.data ?? []);
      setCareers(c.data ?? []);
    } catch {
      // silencioso: los errores se verán en listados
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (periodId) params.periodId = periodId;
      if (careerId) params.careerId = careerId;

      const res = await api.get("/academic/groups", { params });
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar grupos");
    } finally {
      setLoading(false);
    }
  }, [periodId, careerId]);

  React.useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setError("");
    if (!periodId || !careerId) {
      setError("Selecciona Periodo y Carrera para crear un grupo.");
      return;
    }
    try {
      await api.post("/academic/groups", {
        name: name.trim(),
        semester: Number(semester),
        periodId,
        careerId,
      });
      setName("");
      setSemester(1);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear grupo");
    }
  };

  return (
    <DashboardLayout title="Catálogo: Grupos">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear grupo</CardTitle>
            <CardDescription>Los grupos se registran por carrera y periodo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre del grupo</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="4A" />
              </div>
              <div className="space-y-2">
                <Label>Semestre</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                />
              </div>
            </div>

            <Button className="w-full" onClick={create}>
              Crear grupo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grupos registrados</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Filtra por Periodo/Carrera si lo necesitas"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={load}>Refrescar</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPeriodId("");
                  setCareerId("");
                }}
              >
                Limpiar filtros
              </Button>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Grupo</th>
                    <th className="text-left p-3">Sem</th>
                    <th className="text-left p-3">Carrera</th>
                    <th className="text-left p-3">Periodo</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin grupos
                      </td>
                    </tr>
                  ) : (
                    items.map((g) => (
                      <tr key={g._id} className="border-t border-border">
                        <td className="p-3 font-medium">{g.name}</td>
                        <td className="p-3">{g.semester}</td>
                        <td className="p-3">{g.careerId?.code ?? ""}</td>
                        <td className="p-3">{g.periodId?.name ?? ""}</td>
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
