import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Progress } from '../../components/progress';
import { BookOpen, Calendar, TrendingUp, MessageSquare, Bell, User } from 'lucide-react';

export default function EstudianteDashboard() {
  const currentCourses = [
    { name: "Matemáticas I", teacher: "Prof. Martínez", grade: 85, progress: 75 },
    { name: "Física Básica", teacher: "Prof. García", grade: 78, progress: 60 },
    { name: "Programación", teacher: "Prof. Rodríguez", grade: 92, progress: 90 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mi Panel Estudiantil</h1>
            <p className="text-muted-foreground">Bienvenido, Carlos Ramírez</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Badge variant="outline">Estudiante</Badge>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Promedio General</CardTitle>
                <CardDescription>Este semestre</CardDescription>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">85.0</div>
              <p className="text-sm text-muted-foreground">+2.5 vs semestre anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Materias Activas</CardTitle>
                <CardDescription>Cursando actualmente</CardDescription>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">6</div>
              <p className="text-sm text-muted-foreground">3 aprobadas, 3 en curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximas Evaluaciones</CardTitle>
                <CardDescription>En los próximos 7 días</CardDescription>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">Preparación recomendada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nivel de Riesgo</CardTitle>
                <CardDescription>Académico</CardDescription>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Bajo</div>
              <p className="text-sm text-muted-foreground">Rendimiento satisfactorio</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Courses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mis Materias Actuales</CardTitle>
            <CardDescription>Desempeño en este semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{course.name}</h3>
                      <Badge variant={course.grade >= 90 ? 'default' : course.grade >= 70 ? 'secondary' : 'destructive'}>
                        {course.grade}/100
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{course.teacher}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={course.progress} />
                      </div>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button className="h-24 flex-col gap-3" variant="outline">
            <BookOpen className="h-8 w-8" />
            <div className="text-center">
              <div>Historial Académico</div>
              <div className="text-xs text-muted-foreground">Ver mis calificaciones</div>
            </div>
          </Button>
          
          <Button className="h-24 flex-col gap-3" variant="outline">
            <Calendar className="h-8 w-8" />
            <div className="text-center">
              <div>Horario</div>
              <div className="text-xs text-muted-foreground">Ver mi horario semanal</div>
            </div>
          </Button>
          
          <Button className="h-24 flex-col gap-3" variant="outline">
            <MessageSquare className="h-8 w-8" />
            <div className="text-center">
              <div>Solicitar Tutoría</div>
              <div className="text-xs text-muted-foreground">Agendar con mi tutor</div>
            </div>
          </Button>
          
          <Button className="h-24 flex-col gap-3" variant="outline">
            <User className="h-8 w-8" />
            <div className="text-center">
              <div>Mi Perfil</div>
              <div className="text-xs text-muted-foreground">Información personal</div>
            </div>
          </Button>
        </div>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Comunicados</CardTitle>
            <CardDescription>Información importante para ti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Evaluación de Matemáticas", date: "Hoy, 10:00 AM", priority: "Alta" },
                { title: "Tutoría disponible", date: "Ayer, 3:30 PM", priority: "Media" },
                { title: "Nueva tarea asignada", date: "2 días atrás", priority: "Baja" },
              ].map((notification, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.date}</p>
                  </div>
                  <Badge variant={notification.priority === 'Alta' ? 'destructive' : notification.priority === 'Media' ? 'default' : 'outline'}>
                    {notification.priority}
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
