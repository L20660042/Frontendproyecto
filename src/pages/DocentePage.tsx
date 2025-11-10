import { useState, useEffect } from 'react';
import { DynamicSidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Bell
} from 'lucide-react';
import logo from '../assets/image.png'; // Importar el logo

export default function DocenteDashboard() {
  type Subject = { id: number; name: string; students: number; approvalRate: number; schedule: string; };
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setSubjects([
        { id: 1, name: 'Matemáticas Avanzadas', students: 45, approvalRate: 78, schedule: 'Lun-Mie 08:00-10:00' },
        { id: 2, name: 'Física I', students: 38, approvalRate: 85, schedule: 'Mar-Jue 10:00-12:00' },
        { id: 3, name: 'Programación Básica', students: 52, approvalRate: 92, schedule: 'Lun-Vie 14:00-16:00' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { title: 'Total Estudiantes', value: '135', icon: Users, trend: '+5' },
    { title: 'Materias Activas', value: '3', icon: BookOpen, trend: '0' },
    { title: 'Tasa de Aprobación', value: '85%', icon: TrendingUp, trend: '+3%' },
    { title: 'Asistencia Promedio', value: '92%', icon: TrendingDown, trend: '-1%' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel Docente</h1>
              <p className="text-muted-foreground">Bienvenido de vuelta a tu espacio de trabajo</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {stat.value}
                        </p>
                        <p className={`text-xs mt-1 ${
                          stat.trend.startsWith('+') ? 'text-green-600' : 
                          stat.trend.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {stat.trend} desde último mes
                        </p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mis Materias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Mis Materias
              </CardTitle>
              <CardDescription>
                Materias que estás impartiendo este ciclo académico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject: Subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Cambiar School por el logo */}
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <img 
                          src={logo} 
                          alt="Logo Metricampus" 
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {subject.schedule}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subject.students} estudiantes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        subject.approvalRate >= 80 ? 'text-green-600' :
                        subject.approvalRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {subject.approvalRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Tasa de aprobación</p>
                      <Button size="sm" className="mt-2 gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}