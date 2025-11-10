import { DynamicSidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Search,
  Plus,
  Eye,
  Target
} from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/image.png'; // Importar el logo

export default function JefeAcademicoDashboard() {
  type Teacher = { id: number; name: string; subjects: string[]; students: number; approvalRate: number; };
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setTeachers([
        { id: 1, name: 'María González', subjects: ['Matemáticas', 'Cálculo'], students: 45, approvalRate: 85 },
        { id: 2, name: 'Carlos Rodríguez', subjects: ['Física', 'Química'], students: 38, approvalRate: 72 },
        { id: 3, name: 'Ana Martínez', subjects: ['Programación', 'BD'], students: 52, approvalRate: 90 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { title: 'Docentes a Cargo', value: '24', icon: Users, trend: '+3', description: 'En mi área' },
    { title: 'Materias', value: '18', icon: BookOpen, trend: '+2', description: 'Gestionadas' },
    { title: 'Tasa Aprobación', value: '81.5%', icon: TrendingUp, trend: '+3.2%', description: 'Promedio área' },
    { title: 'Deserción', value: '7.8%', icon: TrendingDown, trend: '-1.5%', description: 'Tasa reducida' },
  ];

  const subjectPerformance = [
    { name: 'Matemáticas', approval: 78, enrollment: 120, trend: 'up' },
    { name: 'Programación', approval: 85, enrollment: 95, trend: 'up' },
    { name: 'Física', approval: 72, enrollment: 85, trend: 'down' },
    { name: 'Química', approval: 68, enrollment: 78, trend: 'stable' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Jefe Académico</h1>
              <p className="text-muted-foreground">Gestión del área académica asignada</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar docentes o materias..." className="pl-10 w-80" />
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Docente
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
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.description}
                        </p>
                        <p className={`text-xs mt-1 ${
                          stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Docentes del Área */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Docentes del Área
                </CardTitle>
                <CardDescription>
                  Rendimiento y estadísticas por docente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher: any) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {/* Cambiar School por el logo */}
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <img 
                            src={logo} 
                            alt="Logo Metricampus" 
                            className="h-5 w-5 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{teacher.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {teacher.subjects.join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {teacher.students} estudiantes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          teacher.approvalRate >= 80 ? 'text-green-600' :
                          teacher.approvalRate >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {teacher.approvalRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Aprobación</p>
                        <Button size="sm" variant="outline" className="mt-2 gap-1">
                          <Eye className="h-3 w-3" />
                          Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rendimiento por Materia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Rendimiento por Materia
                </CardTitle>
                <CardDescription>
                  Comparativa de tasas de aprobación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{subject.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {subject.enrollment} estudiantes
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              subject.approval >= 80 ? 'bg-green-500' :
                              subject.approval >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subject.approval}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          subject.approval >= 80 ? 'text-green-600' :
                          subject.approval >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {subject.approval}%
                        </span>
                        <span className={`text-xs ${
                          subject.trend === 'up' ? 'text-green-600' :
                          subject.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {subject.trend === 'up' ? '↗' : 
                           subject.trend === 'down' ? '↘' : '→'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}