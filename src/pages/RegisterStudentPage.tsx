import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { Checkbox } from "../components/checkbox";
import { Copy, Eye, EyeOff, GraduationCap, Mail, ShieldCheck } from "lucide-react";
import logo from "../assets/image.png";
import { api } from "../api/client";

const TERMS_KEY = "metricamps_terms_accepted_v1";

function buildStudentEmail(controlNumber: string) {
  const cn = String(controlNumber ?? "").trim();
  if (!cn) return "";
  return `l${cn}@matehuala.tecnm.mx`.toLowerCase();
}

export default function RegisterStudentPage() {
  const [controlNumber, setControlNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [okMsg, setOkMsg] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const [acceptedTerms, setAcceptedTerms] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(TERMS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const nav = useNavigate();

  const email = React.useMemo(() => buildStudentEmail(controlNumber), [controlNumber]);

  const setTermsAccepted = (value: boolean) => {
    setAcceptedTerms(value);
    try {
      if (value) localStorage.setItem(TERMS_KEY, "1");
      else localStorage.removeItem(TERMS_KEY);
    } catch {
    }
  };

  const copyEmail = async () => {
    setCopied(false);
    try {
      if (!email) return;
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback (older browsers)
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

    if (!/^[0-9]{8}$/.test(cn)) {
      setError("El número de control debe tener 8 dígitos");
      return;
    }
    if (!password || password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

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
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-44 left-1/4 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-44 -right-44 h-[34rem] w-[34rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6 sm:p-10">
        <div className="w-full overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-2xl backdrop-blur">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: form */}
            <div className="p-6 sm:p-10">
              <div className="mx-auto w-full max-w-md space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                    <img src={logo} alt="Logo de Metricamps" className="h-9 w-9 object-contain" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Metricamps</div>
                    <div className="text-lg font-semibold text-foreground">Registro de estudiante</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-foreground">Registro de estudiante</h1>
                  <p className="text-muted-foreground">
                    Crea tu acceso a Metricamps usando tu número de control
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur">
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

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={copyEmail}
                          disabled={!email || loading}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? "Copiado" : "Copiar"}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">Este campo no se puede editar.</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Contraseña</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((s) => !s)}
                          disabled={loading}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">Mínimo 6 caracteres.</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confirmar contraseña</Label>
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          disabled={loading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirm((s) => !s)}
                          disabled={loading}
                          aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                        disabled={loading}
                      />
                      <Label htmlFor="terms" className="text-sm leading-snug">
                        Acepto los{" "}
                        <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                          términos y condiciones
                        </Link>
                        .
                      </Label>
                    </div>

                    <Button className="w-full h-11" type="submit" disabled={loading || !acceptedTerms}>
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
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-6 p-10">
              <div className="rounded-2xl border border-border/60 bg-primary/5 p-6">
                <h2 className="text-xl font-bold text-foreground">Registro rápido y verificable</h2>
                <p className="mt-2 text-muted-foreground">
                  Este registro está pensado para estudiantes. El sistema asociará tu cuenta al control institucional.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Identidad institucional</h3>
                    <p className="text-sm text-muted-foreground">
                      El correo se deriva del número de control para mantener consistencia con el ITMH.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Correo autogenerado</h3>
                    <p className="text-sm text-muted-foreground">
                      Copia el correo mostrado y úsalo para iniciar sesión una vez creada/activada tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Seguridad básica</h3>
                    <p className="text-sm text-muted-foreground">
                      Usa una contraseña robusta y no la compartas. Puedes cambiarla desde tu perfil.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
