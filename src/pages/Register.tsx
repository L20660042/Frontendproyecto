import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Progress } from "../components/progress";
import { Eye, EyeOff, Shield, Users, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";
import logo from '../assets/image.png';

// Tipos de los campos del formulario
type FieldName = "firstName" | "lastName" | "email" | "password" | "confirmPassword" | "userType";

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
}

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState(""); // Código de validación
  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });

  const navigate = useNavigate();

  // Tipado estricto de los campos
  const updateFormData = (field: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 1 && formData.firstName && formData.lastName && formData.email && formData.userType) {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("https://backend-proy-production.up.railway.app/users/send-verification-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        if (response.ok) {
          setCurrentStep(2);
          setError("");
        } else {
          setError("Hubo un problema al enviar el código");
        }
      } catch (err) {
        setError("Error al enviar el código de validación");
      } finally {
        setIsLoading(false);
      }
    }
    else if (currentStep === 2 && code) {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("https://backend-proy-production.up.railway.app/users/validate-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, code }),
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentStep(3);
          setError("");
        } else {
          setError(data.message || "Código inválido");
        }
      } catch (err) {
        setError("Error al validar el código");
      } finally {
        setIsLoading(false);
      }
    }
    else if (currentStep === 3 && formData.password && formData.password === formData.confirmPassword) {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("https://backend-proy-production.up.railway.app/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formData.firstName,
            apellido: formData.lastName,
            correo: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            userType: formData.userType,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          navigate('/dashboard');
        } else {
          setError(data.message || "Error en el registro");
        }
      } catch (err) {
        setError("Error en la conexión con el servidor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado izquierdo - Formulario (similar a Login) */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            {/* Eliminado: Volver al inicio */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <img src={logo} alt="Logo de Metricampus" className="w-12 h-12 object-contain" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Crear Cuenta</h1>
            <p className="text-muted-foreground">Únete a Metricampus</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Paso {currentStep} de 3</span>
              <span>{Math.round(progressValue)}% completado</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <Card className="border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">
                {currentStep === 1 && "Información Personal"}
                {currentStep === 2 && "Validación de Correo"}
                {currentStep === 3 && "Contraseña"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Ingresa tus datos personales básicos"}
                {currentStep === 2 && "Verifica tu correo ingresando el código"}
                {currentStep === 3 && "Crea una contraseña segura para tu cuenta"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        placeholder="Tu nombre"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        placeholder="Tu apellido"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@institucion.edu"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>

                    {/* Tipos de usuario actualizados */}
                    <div className="space-y-2">
                      <Label htmlFor="userType">Tipo de Usuario</Label>
                      <Select value={formData.userType} onValueChange={(value) => updateFormData("userType", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecciona tu rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subdirector-academico">subdirector académico</SelectItem>
                          <SelectItem value="jefes-academicos">jefes académicos</SelectItem>
                          <SelectItem value="tutores">tutores</SelectItem>
                          <SelectItem value="docentes">docentes</SelectItem>
                          <SelectItem value="coordinadores">coordinadores</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código de Validación</Label>
                      <Input
                        id="code"
                        placeholder="Ingresa el código recibido"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={formData.password}
                          onChange={(e) => updateFormData("password", e.target.value)}
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repite tu contraseña"
                          value={formData.confirmPassword}
                          onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 bg-transparent"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Anterior
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      className="flex-1 h-11"
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      {isLoading ? "Procesando..." : "Siguiente"}
                    </Button>
                  ) : (
                    <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
                      {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lado derecho - Presentación de características (igual que Login) */}
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
