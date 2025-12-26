import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type Career = { _id: string; code?: string; name: string };

type StudentRow = {
  _id: string;
  controlNumber: string;
  name: string;
  careerId: any;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
};

export default function StudentsPage() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [careers, setCareers] = React.useState<Career[]>([]);
  const [careerId, setCareerId] = React.useState("");

  const [rows, setRows] = React.useState<StudentRow[]>([]);
  const [q, setQ] = React.useState("");

  // form create
  const [controlNumber, setControlNumber] = React.useState("");
  const [name, setName] = React.useState("");
  const [status, setStatus] = React.useState<StudentRow["status"]>("active");

  const loadCareers = React.useCallback(async () => {
    setError("");
    try {
      const res = await api.get("/academic/careers");
      setCareers(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar carreras");
    }
  }, []);

  const loadStudents = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/academic/students", {
        params: careerId ? { careerId } : {},
      });
      setRows(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar alumnos");
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  React.useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const create = async () => {
    setError("");
    if (!careerId) return setError("Selecciona una carrera");
    if (!controlNumber.trim()) return setError("controlNumber requerido");
    if (!name.trim()) return setError("name requerido");

    setLoading(true);
    try {
      await api.post("/academic/students", {
        controlNumber: controlNumber.trim(),
        name: name.trim(),
        careerId,
        status,
      });
      setControlNumber("");
      setName("");
      setStatus("active");
      await loadStudents();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear alumno";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, patch: Partial<StudentRow>) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/academic/students/${id}`, patch);
      await loadStudents();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar alumno";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setError("");
    setLoading(true);
    try {
      await api.delete(`/academic/students/${id}`);
      await loadStudents();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al eliminar alumno";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      return (
        (r.controlNumber ?? "").toLowerCase().includes(s) ||
        (r.name ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  return (
    <DashboardLayout title="Alumnos (Students)">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Crear alumno</CardTitle>
            <CardDescription>
              Control Escolar captura alumnos aquí. Luego ya aparecen en Inscripciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Carrera</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={careerId}
                onChange={(e) => setCareerId(e.target.value)}
              >
                <option value="">Selecciona...</option>
                {careers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code ? `${c.code} - ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>No. Control</Label>
              <Input
                value={controlNumber}
                onChange={(e) => setControlNumber(e.target.value)}
                placeholder="20660042"
                disabled={loading}
              />
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
                <option value="suspended">suspended</option>
              </select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                disabled={loading}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={create} disabled={loading || !careerId || !controlNumber || !name}>
                Crear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Filtra por nombre o No. Control"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <Label>Búsqueda</Label>
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Juan / 2066..." />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="secondary" onClick={loadStudents} disabled={loading}>
                  Refrescar
                </Button>
              </div>
            </div>

            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">No. Control</th>
                    <th className="text-left p-3">Nombre</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-muted-foreground">
                        Sin alumnos.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <StudentRowItem
                        key={s._id}
                        s={s}
                        onSave={update}
                        onDelete={remove}
                        disabled={loading}
                      />
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

function StudentRowItem({
  s,
  onSave,
  onDelete,
  disabled,
}: {
  s: StudentRow;
  onSave: (id: string, patch: Partial<StudentRow>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled: boolean;
}) {
  const [name, setName] = React.useState(s.name);
  const [status, setStatus] = React.useState<StudentRow["status"]>(s.status);

  return (
    <tr className="border-t border-border">
      <td className="p-3">{s.controlNumber}</td>
      <td className="p-3">
        <Input className="h-10" value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </td>
      <td className="p-3">
        <select
          className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          disabled={disabled}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="suspended">suspended</option>
        </select>
      </td>
      <td className="p-3 flex gap-2">
        <Button onClick={() => onSave(s._id, { name: name.trim(), status })} disabled={disabled || !name.trim()}>
          Guardar
        </Button>
        <Button variant="destructive" onClick={() => onDelete(s._id)} disabled={disabled}>
          Eliminar
        </Button>
      </td>
    </tr>
  );
}
