import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Alert, AlertDescription } from "../components/alert";
import { Eye, EyeOff, Shield, Users, BarChart3 } from "lucide-react";
import { authService } from "../services/authService";
import logo from '../assets/image.png';
import { Checkbox } from "../components/checkbox";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

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
      console.log("Enviando solicitud de login...");
      const response = await authService.login({ email, password });

      console.log("Respuesta del backend:", response);

      // Extraer token y usuario
      const token = response?.data?.token;
      const user = response?.data?.user;

      console.log("Token recibido:", token ? "✓ Presente" : "✗ Ausente");
      console.log("Usuario recibido:", user);
      console.log("Rol del usuario:", user?.role);

      if (!token || !user) {
        setError("No se recibió token de autenticación o información del usuario.");
        setIsLoading(false);
        return;
      }

      // Guardar en localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(user));

      console.log("✅ Token y usuario almacenados en localStorage");
      console.log("🎯 Rol para redirección:", user.role);

      // Determinar la ruta de redirección según el rol
      let redirectPath = "/dashboard";
      
      switch (user.role) {
        case "superadmin":
          redirectPath = "/dashboard/superadmin";
          break;
        case "admin":
          redirectPath = "/dashboard/admin";
          break;
        case "docente":
          redirectPath = "/docente";
          break;
        case "estudiante":
          redirectPath = "/estudiante";
          break;
        case "jefe_departamento":
          redirectPath = "/jefe-academico";
          break;
        case "tutor":
          redirectPath = "/tutor";
          break;
        case "control_escolar":
          redirectPath = "/psicopedagogico";
          break;
        case "capacitacion":
          redirectPath = "/desarrollo-academico";
          break;
        default:
          console.warn("⚠️ Rol no reconocido:", user.role);
          redirectPath = "/dashboard";
      }

      console.log("🔀 Redirigiendo a:", redirectPath);
      
      // Solo UNA llamada a navigate
      navigate(redirectPath, { replace: true });

    } catch (err: any) {
      console.error("❌ Error completo:", err);

      if (err.response) {
        console.error("Detalles del error:", {
          status: err.response.status,
          data: err.response.data,
          url: err.response.config?.url
        });
        
        setError(
          err.response.data?.error || 
          err.response.data?.message || 
          "Error en el servidor"
        );
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Verifica el backend.");
      } else {
        setError("Error inesperado: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado izquierdo - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <img src={logo} alt="Logo de Metricampus" className="w-12 h-12 object-contain" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede al sistema de Metricampus</p>
          </div>

          <Card className="border-border/50">
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

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
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

                {/* Password */}
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
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Recordarme */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Recordarme
                  </Label>
                </div>

                {/* Términos */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Al iniciar sesión aceptas los{" "}
                    <Link to="/terms" className="text-primary hover:text-primary/80 underline">
                      términos y condiciones
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading || !acceptedTerms}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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

      {/* Lado derecho - Información */}
      <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-8">
        <div className="max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Sistema Académico Avanzado</h2>
            <p className="text-muted-foreground">
              Accede a herramientas profesionales para la gestión académica institucional
            </p>
          </div>

          <div className="space-y-6">
            {/* Cards informativas */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Tablero de Indicadores</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza métricas académicas en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Gestión Integral</h3>
                <p className="text-sm text-muted-foreground">
                  Administra estudiantes, docentes y recursos académicos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Seguridad Avanzada</h3>
                <p className="text-sm text-muted-foreground">
                  Protección de datos institucionales con altos estándares
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}