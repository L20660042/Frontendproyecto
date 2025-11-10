import { DynamicSidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { 
  BarChart3, 
  Users, 
  Building, 
  TrendingUp, 
  BookOpen,
  Search,
  Plus,
  Eye,
  Download,
  Filter,
  Calendar,
  Target
} from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/image.png'; // Importar el logo

export default function SubdirectorAcademicoDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  interface Institution {
    id: number;
    name: string;
    students: number;
    teachers: number;
    approvalRate: number;
  }

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setInstitutions([
        { id: 1, name: 'Instituto Tecnológico Superior', students: 1500, teachers: 85, approvalRate: 78 },
        { id: 2, name: 'Centro de Estudios Avanzados', students: 800, teachers: 45, approvalRate: 82 },
        { id: 3, name: 'Universidad del Norte', students: 2200, teachers: 120, approvalRate: 75 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { title: 'Instituciones', value: '15', icon: Building, trend: '+2', description: 'Total gestionadas' },
    { title: 'Estudiantes', value: '12,458', icon: Users, trend: '+345', description: 'Matriculados' },
    { title: 'Docentes', value: '685', icon: BarChart3, trend: '+12', description: 'Activos' }, // Cambiado School por BarChart3
    { title: 'Tasa Aprobación', value: '79.2%', icon: TrendingUp, trend: '+2.1%', description: 'Promedio general' },
  ];

  const globalIndicators = [
    { name: 'Tasa de Aprobación', current: 79.2, previous: 77.1, trend: 'up' },
    { name: 'Tasa de Deserción', current: 8.5, previous: 9.8, trend: 'down' },
    { name: 'Eficiencia Terminal', current: 72.3, previous: 70.5, trend: 'up' },
    { name: 'Satisfacción Estudiantil', current: 85.6, previous: 83.2, trend: 'up' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Subdirector Académico</h1>
              <p className="text-muted-foreground">Visión global del sistema académico institucional</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar instituciones..." className="pl-10 w-80" />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Indicadores Globales */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Indicadores Globales
                    </CardTitle>
                    <CardDescription>
                      Métricas académicas consolidadas del sistema
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {globalIndicators.map((indicator, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            indicator.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-foreground">{indicator.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Anterior: {indicator.previous}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            {indicator.current}%
                          </p>
                          <p className={`text-sm ${
                            indicator.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {indicator.trend === 'up' ? '↗' : '↘'} 
                            {Math.abs(indicator.current - indicator.previous).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instituciones Destacadas */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Instituciones Destacadas
                  </CardTitle>
                  <CardDescription>
                    Rendimiento por institución
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {institutions.map((institution: any) => (
                      <div key={institution.id} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{institution.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            institution.approvalRate >= 80 ? 'bg-green-100 text-green-800' :
                            institution.approvalRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {institution.approvalRate}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {institution.students} estudiantes
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Cambiar School por el logo */}
                            <img 
                              src={logo} 
                              alt="Docentes" 
                              className="h-3 w-3 object-contain"
                            />
                            {institution.teachers} docentes
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 gap-1">
                            <Eye className="h-3 w-3" />
                            Ver
                          </Button>
                          <Button size="sm" className="flex-1 gap-1">
                            <BarChart3 className="h-3 w-3" />
                            Reporte
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Gestiona el sistema académico de manera eficiente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-20 flex-col gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-2 border-dashed border-primary/30">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Crear Institución</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-medium">Gestionar Personal</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm font-medium">Reportes Globales</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm font-medium">Ciclo Académico</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}