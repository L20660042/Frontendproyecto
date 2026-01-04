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

  // create
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState<Career["status"]>("active");

  // list
  const [q, setQ] = React.useState("");

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
    if (!name.trim()) return setError("Nombre requerido");
    if (!code.trim()) return setError("Código requerido");

    setLoading(true);
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
      const msg = e?.response?.data?.message ?? "Error al crear carrera";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<Career>) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/careers/${id}`, patch);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar carrera";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string, codeLabel: string) => {
    if (!confirm(`¿Eliminar la carrera ${codeLabel}? Esto puede afectar grupos, materias y alumnos.`)) return;

    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/careers/${id}`);
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar carrera";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => (c.code ?? "").toLowerCase().includes(s) || (c.name ?? "").toLowerCase().includes(s));
  }, [items, q]);

  return (
    <DashboardLayout title="Carreras">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear carrera</CardTitle>
            <CardDescription>Catálogo base. Se usa para asociar grupos, materias y alumnos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingeniería en Sistemas Computacionales" disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Código</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ISC" disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Estatus</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={loading}
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>

            <Button className="w-full" onClick={create} disabled={loading || !name.trim() || !code.trim()}>
              Crear carrera
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carreras registradas</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Edita y elimina desde aquí"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <Label>Búsqueda</Label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ISC / Industrial..." />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="secondary" onClick={load} disabled={loading}>
                  Refrescar
                </Button>
              </div>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Código</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Estatus</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin carreras
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <CareerRowItem key={c._id} c={c} disabled={loading} onSave={update} onDelete={remove} />
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

function CareerRowItem({
  c,
  disabled,
  onSave,
  onDelete,
}: {
  c: Career;
  disabled: boolean;
  onSave: (id: string, patch: Partial<Career>) => Promise<void>;
  onDelete: (id: string, codeLabel: string) => Promise<void>;
}) {
  const [code, setCode] = React.useState(c.code ?? "");
  const [name, setName] = React.useState(c.name ?? "");
  const [status, setStatus] = React.useState<Career["status"]>(c.status ?? "active");

  const canSave = code.trim() && name.trim();

  return (
    <tr className="border-t border-border">
      <td className="p-3 w-48">
        <Input className="h-10" value={code} onChange={(e) => setCode(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3">
        <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3 w-44">
        <select
          className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          disabled={disabled}
        >
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </select>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onSave(c._id, { code: code.trim().toUpperCase(), name: name.trim(), status })} disabled={disabled || !canSave}>
            Guardar
          </Button>
          <Button variant="destructive" onClick={() => onDelete(c._id, c.code)} disabled={disabled}>
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  );
}
