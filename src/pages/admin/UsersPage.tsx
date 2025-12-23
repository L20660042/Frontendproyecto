import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type UserRow = {
  _id: string;
  email: string;
  roles: string[];
  status: "active" | "disabled" | "pending";
  linkedEntityId?: string | null;
};

export default function UsersPage() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // form create
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("DOCENTE");
  const [status, setStatus] = React.useState<"active" | "disabled" | "pending">("active");
  const [linkedEntityId, setLinkedEntityId] = React.useState("");

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/users");
      setRows(res.data ?? []);
    } catch (e: any) {
      console.error("GET /users error:", e?.response?.data ?? e);
      setError(e?.response?.data?.message ?? "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const createUser = async () => {
    setError("");
    try {
      await api.post("/users", {
        email,
        password,
        roles: [role],
        status,
        linkedEntityId: linkedEntityId || undefined,
      });

      setEmail("");
      setPassword("");
      setLinkedEntityId("");
      setStatus("active");
      setRole("DOCENTE");

      await load();
    } catch (e: any) {
      console.error("POST /users error:", e?.response?.data ?? e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Error al crear usuario";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    }
  };

  const updateUser = async (id: string, patch: Partial<UserRow> & { password?: string | null }) => {
    setError("");
    try {
      await api.patch(`/users/${id}`, {
        roles: patch.roles,
        status: patch.status,
        linkedEntityId: patch.linkedEntityId === "" ? null : patch.linkedEntityId,
        password: patch.password ?? undefined,
      });
      await load();
    } catch (e: any) {
      console.error("PATCH /users/:id error:", e?.response?.data ?? e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Error al actualizar usuario";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    }
  };

  return (
    <DashboardLayout title="Usuarios">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
            <CardDescription>
              MVP: crea usuario y opcionalmente enlázalo a Teacher/Student.
              <br />
              Status válidos en backend: <b>active | pending | disabled</b>
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@metricampus.local"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
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
                <option value="pending">pending</option>
                <option value="disabled">disabled</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="SUPERADMIN">SUPERADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SERVICIOS_ESCOLARES">SERVICIOS_ESCOLARES</option>
                <option value="DOCENTE">DOCENTE</option>
                <option value="ALUMNO">ALUMNO</option>
              </select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>linkedEntityId (Teacher/Student _id)</Label>
              <Input
                value={linkedEntityId}
                onChange={(e) => setLinkedEntityId(e.target.value)}
                placeholder="Opcional: pega el _id del teacher/student"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={createUser} disabled={!email || !password}>
                Crear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado</CardTitle>
            <CardDescription>
              {loading ? "Cargando..." : "Administra roles/status/linkedEntityId"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Roles</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">linkedEntityId</th>
                    <th className="text-left p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <UserRowItem key={u._id} u={u} onSave={updateUser} />
                  ))}
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

function UserRowItem({
  u,
  onSave,
}: {
  u: UserRow;
  onSave: (id: string, patch: any) => Promise<void>;
}) {
  const [role, setRole] = React.useState<string>(u.roles?.[0] ?? "");
  const [status, setStatus] = React.useState<UserRow["status"]>(u.status);
  const [linkedEntityId, setLinkedEntityId] = React.useState<string>(u.linkedEntityId ?? "");

  return (
    <tr className="border-t border-border">
      <td className="p-3 font-medium">{u.email}</td>

      <td className="p-3">
        <select
          className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="SUPERADMIN">SUPERADMIN</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SERVICIOS_ESCOLARES">SERVICIOS_ESCOLARES</option>
          <option value="DOCENTE">DOCENTE</option>
          <option value="ALUMNO">ALUMNO</option>
        </select>
      </td>

      <td className="p-3">
        <select
          className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="active">active</option>
          <option value="pending">pending</option>
          <option value="disabled">disabled</option>
        </select>
      </td>

      <td className="p-3">
        <Input
          value={linkedEntityId}
          onChange={(e) => setLinkedEntityId(e.target.value)}
          placeholder="Teacher/Student _id o vacío"
          className="h-10"
        />
      </td>

      <td className="p-3">
        <Button
          onClick={() =>
            onSave(u._id, {
              roles: [role],
              status,
              linkedEntityId,
            })
          }
        >
          Guardar
        </Button>
      </td>
    </tr>
  );
}
