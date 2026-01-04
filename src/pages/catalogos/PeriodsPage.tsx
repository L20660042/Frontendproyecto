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
  if (!value) return "";
  return value.substring(0, 10);
}

export default function PeriodsPage() {
  const [items, setItems] = React.useState<Period[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // create
  const [name, setName] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
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
    if (!name.trim()) return setError("Nombre requerido");
    if (!startDate) return setError("Fecha de inicio requerida");
    if (!endDate) return setError("Fecha de fin requerida");

    setLoading(true);
    try {
      await api.post("/academic/periods", { name: name.trim(), startDate, endDate, isActive });
      setName("");
      setStartDate("");
      setEndDate("");
      setIsActive(true);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear periodo";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<Period>) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/periods/${id}`, patch);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar periodo";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirm(`¿Eliminar el periodo "${label}"?`)) return;

    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/periods/${id}`);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar periodo";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Periodos">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear periodo</CardTitle>
            <CardDescription>
              Un periodo define el contexto para horarios, inscripciones, actividades y evaluaciones.
              Si lo marcas como activo, se desactivan automáticamente los demás.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ene–Jun 2026" disabled={loading} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Inicio</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fin</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={loading} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
                disabled={loading}
              />
              <Label htmlFor="isActive">Periodo activo</Label>
            </div>

            <Button onClick={create} className="w-full" disabled={loading || !name.trim() || !startDate || !endDate}>
              Crear periodo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Periodos registrados</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Edita y elimina desde aquí"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={load} disabled={loading}>
                Refrescar
              </Button>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Inicio</th>
                    <th className="text-left p-3">Fin</th>
                    <th className="text-left p-3">Activo</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-muted-foreground">
                        Sin periodos
                      </td>
                    </tr>
                  ) : (
                    items.map((p) => (
                      <PeriodRowItem key={p._id} p={p} disabled={loading} onSave={update} onDelete={remove} />
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

function PeriodRowItem({
  p,
  disabled,
  onSave,
  onDelete,
}: {
  p: Period;
  disabled: boolean;
  onSave: (id: string, patch: Partial<Period>) => Promise<void>;
  onDelete: (id: string, label: string) => Promise<void>;
}) {
  const [name, setName] = React.useState(p.name ?? "");
  const [startDate, setStartDate] = React.useState(toDateInput(p.startDate));
  const [endDate, setEndDate] = React.useState(toDateInput(p.endDate));
  const [isActive, setIsActive] = React.useState(!!p.isActive);

  const canSave = name.trim() && startDate && endDate;

  return (
    <tr className="border-t border-border">
      <td className="p-3 min-w-[260px]">
        <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 w-40">
        <Input className="h-10" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 w-40">
        <Input className="h-10" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 w-28">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={disabled} />
          <span className="text-xs text-muted-foreground">{isActive ? "Sí" : "No"}</span>
        </div>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              onSave(p._id, {
                name: name.trim(),
                startDate,
                endDate,
                isActive,
              })
            }
            disabled={disabled || !canSave}
          >
            Guardar
          </Button>
          <Button variant="destructive" onClick={() => onDelete(p._id, p.name)} disabled={disabled}>
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  );
}
