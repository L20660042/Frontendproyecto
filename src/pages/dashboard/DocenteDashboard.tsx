import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Progress } from '../../components/progress';
import { BookOpen, Users, Calendar, BarChart3, MessageSquare, Bell } from 'lucide-react';

export default function DocenteDashboard() {
  const courses = [
    { name: "Matemáticas I", group: "A-202", students: 30, progress: 75 },
    { name: "Física Básica", group: "B-103", students: 28, progress: 60 },
    { name: "Programación", group: "C-305", students: 25, progress: 90 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel Docente</h1>
            <p className="text-muted-foreground">Bienvenido, Prof. Juan Martínez</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge variant="outline">Docente</Badge>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis Materias</CardTitle>
                <CardDescription>3 asignaturas activas</CardDescription>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">Materias asignadas este semestre</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Total Estudiantes</CardTitle>
                <CardDescription>En todas mis materias</CardDescription>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">83</div>
              <p className="text-sm text-muted-foreground">Estudiantes bajo mi tutoría</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximas Actividades</CardTitle>
                <CardDescription>Evaluaciones pendientes</CardDescription>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">Evaluaciones por calificar</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {courses.map((course, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>Grupo {course.group}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progreso del curso</span>
                  <span className="font-bold">{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{course.students} estudiantes</span>
                  </div>
                  <Button size="sm" variant="outline">Ver Detalles</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex-col gap-2" variant="outline">
            <BarChart3 className="h-6 w-6" />
            <span>Calificaciones</span>
          </Button>
          <Button className="h-20 flex-col gap-2" variant="outline">
            <MessageSquare className="h-6 w-6" />
            <span>Comunicados</span>
          </Button>
          <Button className="h-20 flex-col gap-2" variant="outline">
            <Users className="h-6 w-6" />
            <span>Mis Estudiantes</span>
          </Button>
          <Button className="h-20 flex-col gap-2" variant="outline">
            <Calendar className="h-6 w-6" />
            <span>Horarios</span>
          </Button>
        </div>

        {/* Recent Alerts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Alertas de mis Estudiantes</CardTitle>
            <CardDescription>Estudiantes que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { student: "María González", course: "Matemáticas I", issue: "Bajo rendimiento", priority: "Alta" },
                { student: "Carlos Rodríguez", course: "Física Básica", issue: "Inasistencias frecuentes", priority: "Media" },
                { student: "Ana López", course: "Programación", issue: "Solicita tutoría", priority: "Baja" },
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{alert.student}</p>
                    <p className="text-sm text-muted-foreground">{alert.course} - {alert.issue}</p>
                  </div>
                  <Badge variant={alert.priority === 'Alta' ? 'destructive' : alert.priority === 'Media' ? 'default' : 'outline'}>
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
