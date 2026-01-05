import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { Eye, EyeOff, BarChart3, ShieldCheck, UsersRound } from "lucide-react";
import logo from "../assets/image.png";
import { Checkbox } from "../components/checkbox";
import authService from "../services/authService";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const { setSession } = useAuth();

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

      // Nota: rememberMe es UI-only por ahora. Si quieres persistencia real,
      // almacena el token en localStorage cuando rememberMe sea true.
      setSession(token, user);

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
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left: login form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-sm">
                  <img src={logo} alt="Logo de Metricamps" className="w-12 h-12 object-contain" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Iniciar sesión</h1>
              <p className="text-muted-foreground">Accede a Metricamps con tu correo institucional</p>
            </div>

            <Card className="border-border/60 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
                <CardDescription>Ingresa tus credenciales para acceder al tablero</CardDescription>
              </CardHeader>
              <CardContent>
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
                      onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: info panel */}
        <div className="hidden lg:flex items-center justify-center p-10">
          <div className="max-w-md space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Gestión académica institucional</h2>
              <p className="text-muted-foreground">Operación, analítica y trazabilidad con una interfaz limpia y rápida.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Analítica y reportes</h3>
                  <p className="text-sm text-muted-foreground">Dashboards académicos e IA para decisiones más rápidas.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UsersRound className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Flujo por roles</h3>
                  <p className="text-sm text-muted-foreground">Vistas específicas para administración, docentes y alumnos.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Control y seguridad</h3>
                  <p className="text-sm text-muted-foreground">Sesiones y permisos controlados para operación confiable.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
