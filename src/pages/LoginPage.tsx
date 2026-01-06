import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { Checkbox } from "../components/checkbox";
import { BarChart3, Eye, EyeOff, ShieldCheck, UsersRound } from "lucide-react";
import logo from "../assets/image.png";
import authService from "../services/authService";
import { useAuth } from "../auth/AuthContext";

const TERMS_KEY = "metricamps_terms_accepted_v1";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TERMS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();

  const from = (location.state as any)?.from as string | undefined;
  const safeFrom = useMemo(() => {
    return typeof from === "string" && from.startsWith("/") && from !== "/login" ? from : undefined;
  }, [from]);

  const setTermsAccepted = (value: boolean) => {
    setAcceptedTerms(value);
    try {
      if (value) localStorage.setItem(TERMS_KEY, "1");
      else localStorage.removeItem(TERMS_KEY);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones para continuar");
      setIsLoading(false);
      return;
    }

    try {
      const { token, user } = await authService.login({ email, password });

      if (!token || !user) {
        setError("No se recibió token de autenticación o información del usuario.");
        setIsLoading(false);
        return;
      }

      setSession(token, user);

      if (safeFrom) {
        navigate(safeFrom, { replace: true });
        return;
      }

      let redirectPath = "/dashboard/admin";

      switch (user.role) {
        case "SUPERADMIN":
          redirectPath = "/dashboard/superadmin";
          break;
        case "ADMIN":
          redirectPath = "/dashboard/admin";
          break;
        case "SERVICIOS_ESCOLARES":
          redirectPath = "/control-escolar";
          break;
        case "DOCENTE":
          redirectPath = "/docente";
          break;
        case "ALUMNO":
          redirectPath = "/estudiante";
          break;
        case "JEFE":
          redirectPath = "/jefe-academico";
          break;
        case "SUBDIRECCION":
          redirectPath = "/subdireccion";
          break;
        case "DESARROLLO_ACADEMICO":
          redirectPath = "/desarrollo-academico";
          break;
        default:
          redirectPath = "/dashboard/admin";
      }

      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      if (err?.response) {
        setError(err.response.data?.error || err.response.data?.message || "Error en el servidor");
      } else if (err?.request) {
        setError("No se pudo conectar con el servidor. Verifica el backend.");
      } else {
        setError("Error inesperado: " + (err?.message || "desconocido"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Backdrop: grid + blobs (no palette changes: uses CSS variables) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-44 -right-44 h-[34rem] w-[34rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6 sm:p-10">
        <div className="w-full overflow-hidden rounded-3xl border border-border/60 bg-card/50 shadow-2xl backdrop-blur">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: brand panel */}
            <div className="relative hidden lg:flex flex-col justify-between gap-10 p-10">
              <div className="absolute inset-0 bg-primary/5" />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                    <img src={logo} alt="Logo de Metricamps" className="h-9 w-9 object-contain" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Metricamps</div>
                    <div className="text-lg font-semibold text-foreground">Gestión académica institucional</div>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Operación, analítica y trazabilidad</h2>
                  <p className="text-muted-foreground">
                    Operación, analítica y trazabilidad con una interfaz limpia y rápida.
                  </p>
                </div>
              </div>

              <div className="relative grid gap-4">
                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Analítica y reportes</h3>
                    <p className="text-sm text-muted-foreground">Dashboards académicos e IA para decisiones más rápidas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UsersRound className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Flujo por roles</h3>
                    <p className="text-sm text-muted-foreground">Vistas específicas para administración, docentes y alumnos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Control y seguridad</h3>
                    <p className="text-sm text-muted-foreground">Sesiones y permisos controlados para operación confiable.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: login form */}
            <div className="p-6 sm:p-10">
              <div className="mx-auto w-full max-w-md space-y-6">
                <div className="lg:hidden flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
                    <img src={logo} alt="Logo de Metricamps" className="h-9 w-9 object-contain" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Metricamps</div>
                    <div className="text-lg font-semibold text-foreground">Iniciar sesión</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-foreground">Iniciar sesión</h1>
                  <p className="text-muted-foreground">Accede a Metricamps con tu correo institucional</p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-lg backdrop-blur">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@institucion.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                          disabled={isLoading}
                        />
                        <Label htmlFor="remember" className="text-sm leading-snug">
                          Recordarme
                        </Label>
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                          disabled={isLoading}
                        />
                        <Label htmlFor="terms" className="text-sm leading-snug">
                          Al iniciar sesión aceptas los{" "}
                          <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                            términos y condiciones
                          </Link>
                          .
                        </Label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading || !acceptedTerms}>
                      {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      ¿No tienes una cuenta?{" "}
                      <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Regístrate aquí
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Small screen: quick value prop */}
                <div className="lg:hidden rounded-2xl border border-border/60 bg-card/50 p-4">
                  <div className="text-sm font-semibold text-foreground">Gestión académica institucional</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Operación, analítica y trazabilidad con una interfaz limpia y rápida.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
