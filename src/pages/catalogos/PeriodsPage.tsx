import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { api } from "../../api/client";

type Period = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

function toDateInput(value: string) {
  // Si backend manda ISO, nos quedamos con YYYY-MM-DD
  if (!value) return "";
  return value.substring(0, 10);
}

export default function PeriodsPage() {
  const [items, setItems] = React.useState<Period[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [name, setName] = React.useState("Ene-Jun 2026");
  const [startDate, setStartDate] = React.useState("2026-01-06");
  const [endDate, setEndDate] = React.useState("2026-06-30");
  const [isActive, setIsActive] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/academic/periods");
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar periodos");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setError("");
    try {
      await api.post("/academic/periods", { name, startDate, endDate, isActive });
      await load();
      setName("");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear periodo");
    }
  };

  return (
    <DashboardLayout title="Catálogo: Periodos">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crear */}
        <Card>
          <CardHeader>
            <CardTitle>Crear periodo</CardTitle>
            <CardDescription>Registra un periodo académico para operar horarios e inscripciones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ene-Jun 2026" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Inicio</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fin</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive">Periodo activo</Label>
            </div>

            <Button onClick={create} className="w-full">
              Crear periodo
            </Button>
          </CardContent>
        </Card>

        {/* Listar */}
        <Card>
          <CardHeader>
            <CardTitle>Periodos registrados</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Listado desde el backend"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Inicio</th>
                    <th className="text-left p-3">Fin</th>
                    <th className="text-left p-3">Activo</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin periodos
                      </td>
                    </tr>
                  ) : (
                    items.map((p) => (
                      <tr key={p._id} className="border-t border-border">
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3">{toDateInput(p.startDate)}</td>
                        <td className="p-3">{toDateInput(p.endDate)}</td>
                        <td className="p-3">{p.isActive ? "Sí" : "No"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <Button variant="secondary" onClick={load}>
                Refrescar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
