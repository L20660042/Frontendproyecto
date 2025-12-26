import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function ChangePasswordPage() {
  const { clearSession } = useAuth();
  const nav = useNavigate();

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");

  const submit = async () => {
    setError("");
    setOkMsg("");

    if (!currentPassword) return setError("Escribe tu contraseña actual");
    if (!newPassword || newPassword.length < 6) return setError("La nueva contraseña debe tener mínimo 6 caracteres");
    if (newPassword !== confirm) return setError("Las contraseñas no coinciden");

    try {
      setLoading(true);
      const res = await api.patch("/auth/change-password", { currentPassword, newPassword });
      setOkMsg(res.data?.message ?? "Contraseña actualizada");

      // Recomiendo cerrar sesión para evitar tokens “viejos”
      setTimeout(() => {
        clearSession();
        nav("/login", { replace: true });
      }, 900);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Error al cambiar contraseña";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Cambiar contraseña">
      <div className="max-w-xl">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {okMsg ? (
          <Alert>
            <AlertDescription>{okMsg}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Actualiza tu contraseña</CardTitle>
            <CardDescription>Debes confirmar tu contraseña actual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Confirmar nueva contraseña</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} />
            </div>

            <Button onClick={submit} disabled={loading}>
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
