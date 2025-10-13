import type React from "react";
import { useState } from "react";
import { Link } from 'react-router-dom';
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Checkbox } from "../components/checkbox";
import { Alert, AlertDescription } from "../components/alert";
import { Eye, EyeOff, ArrowLeft, Shield, Users, BarChart3 } from "lucide-react";
import logo from '../assets/image.png';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simular proceso de inicio de sesión
    setTimeout(() => {
      if (email && password) {
        // Simulación de inicio de sesión exitoso
        console.log("Login successful");
      } else {
        setError("Por favor, complete todos los campos");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado izquierdo - Formulario de inicio de sesión */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Encabezado */}
          <div className="text-center space-y-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                {/* Logo de Metricampus */}
                <img src={logo} alt="Logo de Metricampus" className="w-12 h-12 object-contain" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-foreground">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Accede al sistema de Metricampus</p>
          </div>

          {/* Formulario de inicio de sesión */}
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
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Recordarme
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
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

          {/* Información adicional */}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              Al iniciar sesión, aceptas nuestros{" "}
              <Link to="/terms" className="text-primary hover:text-primary/80">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link to="/privacy" className="text-primary hover:text-primary/80">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Presentación de características */}
      <div className="hidden lg:flex flex-1 bg-muted/30 items-center justify-center p-8">
        <div className="max-w-md space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Sistema Académico Avanzado</h2>
            <p className="text-muted-foreground">
              Accede a herramientas profesionales para la gestión académica institucional
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Tablero de Indicadores</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza métricas académicas en tiempo real con Power BI integrado
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
                  Administra estudiantes, docentes y recursos académicos desde una plataforma
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
                  Protección de datos institucionales con los más altos estándares de seguridad
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-6 border border-border/50">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">15,000+</div>
              <div className="text-sm text-muted-foreground">Usuarios activos confían en nuestro sistema</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
