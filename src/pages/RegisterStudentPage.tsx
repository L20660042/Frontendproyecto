import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { api } from "../api/client";

export default function RegisterStudentPage() {
  const [controlNumber, setControlNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");

  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOkMsg("");

    const cn = controlNumber.trim();
    if (!/^\d{8}$/.test(cn)) return setError("El número de control debe tener 8 dígitos");
    if (!password || password.length < 6) return setError("La contraseña debe tener mínimo 6 caracteres");
    if (password !== confirm) return setError("Las contraseñas no coinciden");

    try {
      setLoading(true);
      const res = await api.post("/auth/register-student", { controlNumber: cn, password });
      setOkMsg(res.data?.message ?? "Registro creado. Espera activación.");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Error al registrar";
      setError(Array.isArray(msg) ? msg.join(" | ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Estudiante</CardTitle>
            <CardDescription>
              Tu correo se generará como <b>l{`{NoControl}`}@matehuala.tecnm.mx</b> y tu cuenta quedará en <b>pending</b>.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

            <form className="space-y-4 mt-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label>Número de control</Label>
                <Input value={controlNumber} onChange={(e) => setControlNumber(e.target.value)} placeholder="20660042" disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
              </div>

              <div className="space-y-2">
                <Label>Confirmar contraseña</Label>
                <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} />
              </div>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Crear registro"}
              </Button>
            </form>

            <div className="mt-4 text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <Link to="/login" className="text-primary underline">Inicia sesión</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
