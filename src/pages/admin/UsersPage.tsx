import React from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { api } from "../../api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Alert, AlertDescription } from "../../components/alert";

type UserStatus = "active" | "inactive" | "pending";

type UserRow = {
  _id: string;
  email: string;
  roles: string[];
  status: UserStatus;
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
  const [status, setStatus] = React.useState<UserStatus>("active");
  const [linkedEntityId, setLinkedEntityId] = React.useState("");

  // campos para auto-crear docente (si el backend los soporta en CreateUserDto)
  const [teacherName, setTeacherName] = React.useState("");
  const [employeeNumber, setEmployeeNumber] = React.useState("");

  const isDocente = role === "DOCENTE";
  const willAutoCreateTeacher = isDocente && !linkedEntityId.trim();

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/users");
      setRows(res.data ?? []);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al cargar usuarios";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const createUser = async () => {
    setError("");

    if (!email.trim()) return setError("Email requerido");
    if (!password.trim()) return setError("Password requerido");

    if (willAutoCreateTeacher) {
      if (!teacherName.trim() || teacherName.trim().length < 3) {
        return setError("teacherName requerido (mínimo 3 caracteres) para auto-crear docente");
      }
      if (!employeeNumber.trim()) {
        return setError("employeeNumber requerido para auto-crear docente");
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        email: email.trim(),
        password,
        roles: [role],
        status,
        linkedEntityId: linkedEntityId.trim() ? linkedEntityId.trim() : null,
      };

      if (willAutoCreateTeacher) {
        payload.teacherName = teacherName.trim();
        payload.employeeNumber = employeeNumber.trim();
      }

      await api.post("/users", payload);

      setEmail("");
      setPassword("");
      setLinkedEntityId("");
      setTeacherName("");
      setEmployeeNumber("");

      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al crear usuario";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, patch: Partial<UserRow> & { password?: string | null }) => {
    setError("");
    setLoading(true);
    try {
      await api.patch(`/users/${id}`, {
        roles: patch.roles,
        status: patch.status,
        linkedEntityId: patch.linkedEntityId === "" ? null : patch.linkedEntityId,
        password: patch.password ?? undefined,
      });
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al actualizar usuario";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
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
              Crea usuarios. Si el rol es DOCENTE y no proporcionas linkedEntityId, el backend puede auto-crear un Teacher.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@metricampus.local"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                disabled={loading}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="pending">pending</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                className="h-11 w-full rounded-md border border-border bg-input px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
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
                placeholder="Opcional: pega el _id del teacher/student (si lo dejas vacío y es DOCENTE, auto-crea Teacher)"
                disabled={loading}
              />
            </div>

            {isDocente && (
              <>
                <div className="space-y-2 lg:col-span-2">
                  <Label>teacherName (para auto-crear Teacher)</Label>
                  <Input
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Nombre completo del docente"
                    disabled={loading || !willAutoCreateTeacher}
                  />
                </div>

                <div className="space-y-2">
                  <Label>employeeNumber (para auto-crear Teacher)</Label>
                  <Input
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="No. empleado"
                    disabled={loading || !willAutoCreateTeacher}
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-xs text-muted-foreground">
                    {willAutoCreateTeacher
                      ? "Se creará un Teacher automáticamente al guardar."
                      : "Si proporcionas linkedEntityId, no se auto-crea Teacher."}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-end">
              <Button onClick={createUser} disabled={loading || !email || !password}>
                {loading ? "Creando..." : "Crear"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado</CardTitle>
            <CardDescription>{loading ? "Cargando..." : "Administra roles/status/linkedEntityId"}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Rol</th>
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
              <Button variant="secondary" onClick={load} disabled={loading}>
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
  const [status, setStatus] = React.useState<UserStatus>(u.status);
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
          onChange={(e) => setStatus(e.target.value as UserStatus)}
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="pending">pending</option>
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
