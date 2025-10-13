import { Link } from 'react-router-dom';
import { Button } from "../components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Badge } from "../components/badge";
import { BarChart3, Users, TrendingUp, BookOpen, Award, Calendar } from "lucide-react";
import logo from '../assets/image.png';


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Encabezado */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                {/* Logo de Metricampus */}
                <img src={logo} alt="Logo de Metricampus" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Metricampus</h1> {/* Nombre del proyecto */}
                <p className="text-sm text-muted-foreground">Tablero Institucional</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sección Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Power BI Integrado
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Tablero Institucional de <span className="text-primary">Indicadores Académicos</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Plataforma integral para la gestión y visualización de métricas académicas, reportes institucionales y
            análisis de rendimiento estudiantil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/login">Acceder al Sistema</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="#features">Conocer Más</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sección de Funcionalidades */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Funcionalidades Principales</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Herramientas avanzadas para el análisis y gestión de datos académicos institucionales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Análisis de Datos</CardTitle>
                <CardDescription>Visualización avanzada de métricas académicas con Power BI integrado</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Gestión Estudiantil</CardTitle>
                <CardDescription>Control integral de estudiantes, docentes y personal administrativo</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle>Reportes Dinámicos</CardTitle>
                <CardDescription>Generación automática de reportes institucionales y estadísticas</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-chart-4" />
                </div>
                <CardTitle>Gestión Curricular</CardTitle>
                <CardDescription>Administración de planes de estudio, materias y programas académicos</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-chart-5" />
                </div>
                <CardTitle>Evaluación Académica</CardTitle>
                <CardDescription>
                  Sistema integral de evaluación y seguimiento del rendimiento académico
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Planificación Académica</CardTitle>
                <CardDescription>
                  Gestión de horarios, calendarios académicos y recursos institucionales
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Sección de Estadísticas */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15,000+</div>
              <div className="text-muted-foreground">Estudiantes Activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">850+</div>
              <div className="text-muted-foreground">Docentes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-chart-3 mb-2">120+</div>
              <div className="text-muted-foreground">Programas Académicos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-chart-4 mb-2">98%</div>
              <div className="text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="Logo de Metricampus" className="w-6 h-6 object-contain filter brightness-110 contrast-120" />
                <span className="font-bold">Metricampus</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma integral para la gestión académica institucional.
              </p>
              <p className="text-sm text-muted-foreground mt-4">Desarrollado por <span className="font-semibold">CodeSystems</span></p> {/* Texto añadido */}
            </div>
            <div>
              <h4 className="font-semibold mb-4">Funcionalidades</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Tablero de Indicadores</li>
                <li>Gestión Estudiantil</li>
                <li>Reportes Académicos</li>
                <li>Análisis de Datos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentación</li>
                <li>Centro de Ayuda</li>
                <li>Contacto Técnico</li>
                <li>Capacitación</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Institución</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Acerca de</li>
                <li>Políticas</li>
                <li>Términos de Uso</li>
                <li>Privacidad</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Metricampus. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
