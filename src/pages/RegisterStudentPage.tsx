import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { api } from "../api/client";

function buildStudentEmail(controlNumber: string) {
  const cn = String(controlNumber ?? "").trim();
  if (!cn) return "";
  return `l${cn}@matehuala.tecnm.mx`.toLowerCase();
}

export default function RegisterStudentPage() {
  const [controlNumber, setControlNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const nav = useNavigate();

  const email = React.useMemo(() => buildStudentEmail(controlNumber), [controlNumber]);

  const copyEmail = async () => {
    setCopied(false);
    try {
      if (!email) return;
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback: selección manual
      const el = document.getElementById("studentEmail") as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    }
  };

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

      const status = String(res.data?.status ?? "");
      const msg =
        status === "active"
          ? (res.data?.message ?? "Cuenta creada y ACTIVADA. Ya puedes iniciar sesión.")
          : (res.data?.message ?? "Registro creado. Espera activación.");

      setOkMsg(msg);

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
              Ingresa tu número de control y define tu contraseña. Tu correo institucional se genera automáticamente.
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
                <Input
                  value={controlNumber}
                  onChange={(e) => setControlNumber(e.target.value)}
                  placeholder="20660042"
                  disabled={loading}
                />
              </div>

              {/* ✅ Campo EMAIL solo lectura + copiar */}
              <div className="space-y-2">
                <Label>Correo institucional</Label>
                <div className="flex gap-2">
                  <Input
                    id="studentEmail"
                    value={email}
                    readOnly
                    disabled={!email}
                    className="flex-1"
                    title="Este correo se genera automáticamente"
                  />
                  <Button type="button" variant="secondary" onClick={copyEmail} disabled={!email}>
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Este campo no se puede editar. Copia y pega el correo en el login cuando lo necesites.
                </div>
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
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
