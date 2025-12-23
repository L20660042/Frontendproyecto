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

const ROLE_OPTIONS = [
  "SUPERADMIN",
  "ADMIN",
  "SERVICIOS_ESCOLARES",
  "DOCENTE",
  "ALUMNO",
];

export default function UsersPage() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // form create
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("DOCENTE");
  const [status, setStatus] = React.useState<UserRow["status"]>("active");
  const [linkedEntityId, setLinkedEntityId] = React.useState("");

  // NUEVO: para autocrear teacher cuando role=DOCENTE y NO se provee linkedEntityId
  const [teacherName, setTeacherName] = React.useState("");
  const [employeeNumber, setEmployeeNumber] = React.useState("");

  const load = React.useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/users");
      setRows(res.data ?? []);
    } catch (e: any) {
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

    // Validaciones mínimas del lado del front
    if (!email.trim()) return setError("Email requerido");
    if (!password.trim()) return setError("Password requerido");

    const isDocenteAuto = role === "DOCENTE" && !linkedEntityId.trim();

    if (isDocenteAuto) {
      if (!teacherName.trim()) return setError("Nombre del docente requerido (teacherName)");
      if (!employeeNumber.trim()) return setError("No. empleado requerido (employeeNumber)");
    }

    try {
      setLoading(true);

      await api.post("/users", {
        email: email.trim(),
        password,
        roles: [role],
        status,
        linkedEntityId: linkedEntityId.trim() || undefined,

        // SOLO cuando sea DOCENTE y no mandes linkedEntityId:
        ...(isDocenteAuto
          ? { teacherName: teacherName.trim(), employeeNumber: employeeNumber.trim() }
          : {}),
      });

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
              Si el rol es <b>DOCENTE</b> y no proporcionas <b>linkedEntityId</b>, se creará automáticamente el registro
              en <b>teachers</b> usando <b>teacherName</b> + <b>employeeNumber</b>.
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
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={loading}
              >
                <option value="active">active</option>
                <option value="disabled">disabled</option>
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
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>linkedEntityId (Teacher/Student _id)</Label>
              <Input
                value={linkedEntityId}
                onChange={(e) => setLinkedEntityId(e.target.value)}
                placeholder="Opcional: pega el _id del teacher/student (si lo dejas vacío, DOCENTE autogenera Teacher)"
                disabled={loading}
              />
            </div>

            {/* NUEVO: campos solo para DOCENTE cuando linkedEntityId está vacío */}
            {role === "DOCENTE" && !linkedEntityId.trim() ? (
              <>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Nombre del docente (teacherName)</Label>
                  <Input
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>No. empleado (employeeNumber)</Label>
                  <Input
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    placeholder="EMP-0001"
                    disabled={loading}
                  />
                </div>
              </>
            ) : null}

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
                    <UserRowItem key={u._id} u={u} onSave={updateUser} loading={loading} />
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
  loading,
}: {
  u: UserRow;
  onSave: (id: string, patch: any) => Promise<void>;
  loading: boolean;
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
          disabled={loading}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>

      <td className="p-3">
        <select
          className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          disabled={loading}
        >
          <option value="active">active</option>
          <option value="disabled">disabled</option>
          <option value="pending">pending</option>
        </select>
      </td>

      <td className="p-3">
        <Input
          value={linkedEntityId}
          onChange={(e) => setLinkedEntityId(e.target.value)}
          placeholder="Teacher/Student _id o vacío"
          className="h-10"
          disabled={loading}
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
          disabled={loading}
        >
          Guardar
        </Button>
      </td>
    </tr>
  );
}
