import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import logo from "../assets/image.png";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grid + blobs (no palette changes: uses CSS variables) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center p-6">
        <Card className="w-full overflow-hidden border-border/60 shadow-2xl">
          <CardHeader className="border-b bg-card/60 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <img src={logo} alt="Logo de Metricamps" className="h-9 w-9 object-contain" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl">Términos y condiciones</CardTitle>
                <CardDescription>
                  Uso informativo para un proyecto académico. Última actualización: 6 de enero de 2026.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 text-sm">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1) Propósito del sistema</h2>
              <p className="text-muted-foreground">
                Metricamps es un proyecto académico orientado a la gestión y seguimiento de actividades relacionadas con
                proyectos de Ingeniería en Sistemas. Su finalidad principal es didáctica, de demostración y de
                evaluación dentro del contexto escolar.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2) Alcance y no vinculación</h2>
              <p className="text-muted-foreground">
                Este sistema se ofrece &quot;tal cual&quot;, sin garantía de disponibilidad, integridad o precisión. No constituye
                un servicio oficial ni un compromiso contractual con ninguna institución; su uso es voluntario y bajo
                responsabilidad de la persona usuaria.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3) Datos y confidencialidad</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  Evita capturar información sensible o privada (por ejemplo, contraseñas de otros sistemas, datos
                  médicos, información financiera, etc.).
                </li>
                <li>
                  La información registrada puede utilizarse únicamente con fines académicos (pruebas, validación,
                  evaluación y mejora del proyecto).
                </li>
                <li>
                  La administración del sistema puede realizar limpieza de datos o reinicios del entorno sin previo aviso
                  debido a la naturaleza de prototipo.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4) Uso aceptable</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>No compartas tus credenciales ni permitas el acceso a terceros.</li>
                <li>No intentes vulnerar, degradar o interferir con el funcionamiento del sistema.</li>
                <li>Usa el sistema únicamente para fines relacionados con el proyecto.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5) Cambios al contenido</h2>
              <p className="text-muted-foreground">
                Los términos pueden ajustarse conforme evolucione el proyecto. Se recomienda revisarlos periódicamente.
              </p>
            </section>

            <div className="pt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button asChild variant="secondary">
                <Link to="/login">Volver al login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Ir a registro</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
