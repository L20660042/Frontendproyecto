import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";
import { api } from "../../api/client";

type Career = {
  _id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
};

export default function CareersPage() {
  const [items, setItems] = React.useState<Career[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/academic/careers");
      setItems(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar carreras");
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
      await api.post("/academic/careers", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status,
      });
      setName("");
      setCode("");
      setStatus("active");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al crear carrera");
    }
  };

  return (
    <DashboardLayout title="Catálogo: Carreras">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear carrera</CardTitle>
            <CardDescription>Registra carreras para asociarlas a grupos, materias y alumnos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingeniería en Sistemas Computacionales" />
            </div>

            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ISC" />
            </div>

            <div className="space-y-2">
              <Label>Estatus</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>

            <Button className="w-full" onClick={create}>
              Crear carrera
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carreras registradas</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Listado desde el backend"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Código</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-muted-foreground">
                        Sin carreras
                      </td>
                    </tr>
                  ) : (
                    items.map((c) => (
                      <tr key={c._id} className="border-t border-border">
                        <td className="p-3 font-medium">{c.code}</td>
                        <td className="p-3">{c.name}</td>
                        <td className="p-3">{c.status === "active" ? "Activa" : "Inactiva"}</td>
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
