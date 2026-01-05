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

const ALL_ROLES = ["SUPERADMIN", "ADMIN", "SERVICIOS_ESCOLARES", "DOCENTE", "ALUMNO", "JEFE", "SUBDIRECCION", "DESARROLLO_ACADEMICO"] as const;

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<string>("ADMIN");
  const [status, setStatus] = React.useState<UserStatus>("active");
  const [linkedEntityId, setLinkedEntityId] = React.useState("");

  // Docente autovinculación opcional (si tu backend lo usa)
  const [teacherName, setTeacherName] = React.useState("");
  const [employeeNumber, setEmployeeNumber] = React.useState("");

  const [error, setError] = React.useState<string>("");
  const [notice, setNotice] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<UserRow[]>("/users");
      setUsers(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const isDocente = role === "DOCENTE";
  const TEACHER_EMAIL_DOMAIN = "metricampus.local";
  const normalizedEmail = email.trim().toLowerCase();
  const existingByEmail = React.useMemo(
    () => users.find((u) => u.email?.toLowerCase() === normalizedEmail) ?? null,
    [users, normalizedEmail]
  );

  React.useEffect(() => {
    if (role !== "DOCENTE") return;
    const emp = employeeNumber.trim();
    if (!emp) return;
    const next = `${emp}@${TEACHER_EMAIL_DOMAIN}`.toLowerCase();
    // Solo auto-llenamos si el email está vacío o ya era del dominio docente.
    if (!email.trim() || email.trim().toLowerCase().endsWith(`@${TEACHER_EMAIL_DOMAIN}`)) {
      setEmail(next);
    }
  }, [role, employeeNumber]);

  // Si NO pones linkedEntityId y es DOCENTE, tu backend podría auto-crear Teacher (si lo implementaste)
  const willAutoCreateTeacher = isDocente && !linkedEntityId.trim();

  const createUser = async () => {
    setError("");
    setNotice("");

    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) return setError("Email requerido");

    const isExisting = !!existingByEmail;

    // Si NO existe todavía, pedimos password para crear.
    if (!isExisting && !password.trim()) return setError("Password requerido");

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
        email: emailNorm,
        password: password.trim() ? password : undefined,
        roles: [role],
        status,
        linkedEntityId: linkedEntityId.trim() ? linkedEntityId.trim() : null,
      };

      if (willAutoCreateTeacher) {
        payload.teacherName = teacherName.trim();
        payload.employeeNumber = employeeNumber.trim();
      }

      // Intento 1: si existe endpoint upsert (si lo agregas en backend)
      try {
        await api.post("/users/upsert", payload);
        setNotice(isExisting ? "Usuario actualizado." : "Usuario creado.");
      } catch (e1: any) {
        const statusCode = e1?.response?.status;

        // Si el backend no tiene /users/upsert, caemos a create tradicional
        if (statusCode === 404) {
          try {
            await api.post("/users", payload);
            setNotice("Usuario creado.");
          } catch (e2: any) {
            const msg = e2?.response?.data?.message ?? "";
            const msgStr = Array.isArray(msg) ? msg.join(" | ") : String(msg);

            // Si el email ya existe, hacemos PATCH al usuario existente
            const isDup = e2?.response?.status === 409 || /ya existe|duplicate|e11000/i.test(msgStr);

            if (isDup) {
              // Si no lo tenemos en memoria, consultamos listado y buscamos
              let existing = existingByEmail;
              if (!existing) {
                const resList = await api.get<UserRow[]>("/users");
                existing = (resList.data ?? []).find((u) => u.email?.toLowerCase() === emailNorm) ?? null;
              }

              if (!existing) {
                throw e2;
              }

              await api.patch(`/users/${existing._id}`, {
                roles: payload.roles,
                status: payload.status,
                linkedEntityId: payload.linkedEntityId,
                password: payload.password ?? undefined,
              });
              setNotice("Usuario ya existía: se actualizó (upsert).");
            } else {
              throw e2;
            }
          }
        } else {
          // upsert existe pero falló
          throw e1;
        }
      }

      setEmail("");
      setPassword("");
      setLinkedEntityId("");
      setTeacherName("");
      setEmployeeNumber("");

      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al guardar usuario";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, patch: Partial<UserRow> & { password?: string | null }) => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await api.patch(`/users/${id}`, {
        roles: patch.roles,
        status: patch.status,
        linkedEntityId: patch.linkedEntityId === "" ? null : patch.linkedEntityId,
        password: patch.password ?? undefined,
      });
      setNotice("Usuario actualizado.");
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

        {notice ? (
          <Alert>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Crear / Actualizar (Upsert)</CardTitle>
            <CardDescription>
              Si el email ya existe, en vez de fallar se actualizará el usuario. Para DOCENTE, puedes capturar employeeNumber y se autogenera
              el correo.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@metricampus.local" disabled={loading} />
              {existingByEmail ? <div className="text-xs text-muted-foreground">Ya existe: se hará actualización (upsert).</div> : null}
            </div>

            <div className="space-y-2">
              <Label>Password {existingByEmail ? "(opcional: si lo llenas se resetea)" : ""}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={existingByEmail ? "Deja vacío para no cambiar" : "Password inicial"}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                className="w-full h-10 border border-border rounded-md bg-background px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full h-10 border border-border rounded-md bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                disabled={loading}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="pending">pending</option>
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>linkedEntityId (Teacher/Student _id)</Label>
              <Input value={linkedEntityId} onChange={(e) => setLinkedEntityId(e.target.value)} placeholder="ObjectId" disabled={loading} />
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
                      ? "Si no proporcionas linkedEntityId, el backend podría auto-crear Teacher (si está implementado)."
                      : "Si proporcionas linkedEntityId, no se auto-crea Teacher."}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-end">
              <Button onClick={createUser} disabled={loading || !email || (!password && !existingByEmail)}>
                {loading ? "Guardando..." : "Guardar"}
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
                <thead className="bg-muted/30">
                  <tr className="text-left">
                    <th className="p-3">Email</th>
                    <th className="p-3">Roles</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">linkedEntityId</th>
                    <th className="p-3">Reset password</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <UserRowItem key={u._id} u={u} onSave={updateUser} />
                  ))}
                </tbody>
              </table>
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
  onSave: (id: string, patch: Partial<UserRow> & { password?: string | null }) => Promise<void>;
}) {
  const [role, setRole] = React.useState(u.roles?.[0] ?? "ADMIN");
  const [status, setStatus] = React.useState<UserStatus>(u.status ?? "active");
  const [linkedEntityId, setLinkedEntityId] = React.useState(u.linkedEntityId ?? "");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    setRole(u.roles?.[0] ?? "ADMIN");
    setStatus(u.status ?? "active");
    setLinkedEntityId(u.linkedEntityId ?? "");
    setPassword("");
  }, [u._id]);

  return (
    <tr className="border-t border-border">
      <td className="p-3 font-mono text-xs">{u.email}</td>

      <td className="p-3">
        <select className="h-9 border border-border rounded-md bg-background px-2" value={role} onChange={(e) => setRole(e.target.value)}>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>

      <td className="p-3">
        <select className="h-9 border border-border rounded-md bg-background px-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="pending">pending</option>
        </select>
      </td>

      <td className="p-3">
        <Input value={linkedEntityId ?? ""} onChange={(e) => setLinkedEntityId(e.target.value)} placeholder="ObjectId o vacío" />
      </td>

      <td className="p-3">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nuevo password (opcional)"
        />
      </td>

      <td className="p-3">
        <Button
          onClick={() =>
            onSave(u._id, {
              roles: [role],
              status,
              linkedEntityId,
              password: password.trim() ? password : null,
            })
          }
        >
          Guardar
        </Button>
      </td>
    </tr>
  );
}
