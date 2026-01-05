import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { Copy, GraduationCap, Mail, ShieldCheck } from "lucide-react";
import logo from "../assets/image.png";
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
          ? res.data?.message ?? "Cuenta creada y ACTIVADA. Ya puedes iniciar sesión."
          : res.data?.message ?? "Registro creado. Espera activación.";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left: register form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
                  <img src={logo} alt="Logo de Metricamps" className="w-12 h-12 object-contain" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Registro de estudiante</h1>
              <p className="text-muted-foreground">Crea tu acceso a Metricamps usando tu número de control</p>
            </div>

            <Card className="border-border/60 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Crear cuenta</CardTitle>
                <CardDescription>
                  Tu correo institucional se genera automáticamente como <span className="font-medium">lXXXXXXXX@matehuala.tecnm.mx</span>.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                {okMsg ? (
                  <Alert className="mb-4">
                    <AlertDescription>{okMsg}</AlertDescription>
                  </Alert>
                ) : null}

                <form className="space-y-4" onSubmit={submit}>
                  <div className="space-y-2">
                    <Label>Número de control</Label>
                    <Input
                      value={controlNumber}
                      onChange={(e) => setControlNumber(e.target.value)}
                      placeholder="20660042"
                      disabled={loading}
                      inputMode="numeric"
                    />
                    <div className="text-xs text-muted-foreground">Debe tener exactamente 8 dígitos.</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Correo institucional</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="studentEmail"
                          value={email}
                          readOnly
                          disabled={!email || loading}
                          className="pl-9"
                          title="Este correo se genera automáticamente"
                        />
                      </div>
                      <Button type="button" variant="secondary" onClick={copyEmail} disabled={!email || loading} className="shrink-0">
                        <Copy className="h-4 w-4" />
                        {copied ? "Copiado" : "Copiar"}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Este campo no se puede editar.</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    <div className="text-xs text-muted-foreground">Mínimo 6 caracteres.</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmar contraseña</Label>
                    <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} />
                  </div>

                  <Button className="w-full h-11" type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Crear cuenta"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: info panel */}
        <div className="hidden lg:flex items-center justify-center p-10">
          <div className="max-w-md space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Registro rápido y verificable</h2>
              <p className="text-muted-foreground">
                Este registro está pensado para estudiantes. El sistema asociará tu cuenta al control institucional.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Identidad institucional</h3>
                  <p className="text-sm text-muted-foreground">
                    El correo se deriva del número de control para mantener consistencia con el ITMH.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Correo autogenerado</h3>
                  <p className="text-sm text-muted-foreground">
                    Copia el correo mostrado y úsalo para iniciar sesión una vez creada/activada tu cuenta.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Seguridad básica</h3>
                  <p className="text-sm text-muted-foreground">
                    Usa una contraseña robusta y no la compartas. Puedes cambiarla desde tu perfil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
