import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Users, BookOpen, BarChart3, AlertTriangle, FileText } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel Administrativo</h1>
            <p className="text-muted-foreground">Gestión de datos académicos</p>
          </div>
          <Badge variant="secondary">Administrador</Badge>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
                <CardDescription>Administra estudiantes y docentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">850</div>
                    <div className="text-sm text-muted-foreground">Estudiantes</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">45</div>
                    <div className="text-sm text-muted-foreground">Docentes</div>
                  </div>
                </div>
                <Button className="w-full">Ver Todos los Usuarios</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Rendimiento Bajo</span>
                        <Badge variant="destructive">Alta</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Grupo de Matemáticas - 12 estudiantes</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Catálogos Académicos
                </CardTitle>
                <CardDescription>Gestiona información académica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4">
                    <div className="text-center">
                      <BookOpen className="h-6 w-6 mx-auto mb-2" />
                      <div>Carreras</div>
                      <div className="text-xs text-muted-foreground">15 activas</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-4">
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <div>Materias</div>
                      <div className="text-xs text-muted-foreground">120 registradas</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Reportes Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">Reporte de Asistencia</Button>
                <Button className="w-full justify-start" variant="outline">Calificaciones por Grupo</Button>
                <Button className="w-full justify-start" variant="outline">Evaluación Docente</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="default">Nuevo Grupo</Button>
                <Button variant="secondary">Asignar Docente</Button>
                <Button variant="outline">Importar Datos</Button>
                <Button variant="outline">Exportar Reporte</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}