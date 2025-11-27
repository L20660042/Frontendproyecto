import { useState, useEffect } from 'react';
import { DynamicSidebar } from '../components/Sidebar';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Plus,
  Eye
} from 'lucide-react';
import logo from '../assets/image.png';
import { useAuthGuard } from '../components/AuthGuard';
import { institutionService } from '../services/institutionService';
import { subjectService } from '../services/subjectService';
import { studentService } from '../services/studentService';
import type { InstitutionType as Institution } from '../services/institutionService';
import type { SubjectType as Subject } from '../services/subjectService';
import type { StudentType as Student } from '../services/studentService';

export default function DocenteDashboard() {
  useAuthGuard();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubjects: 0,
    approvalRate: 0,
    averageAttendance: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar materias del docente
      const mySubjects = await subjectService.getMySubjects();
      setSubjects(mySubjects);

      // Cargar institución
      const inst = await institutionService.getMyInstitution();
      setInstitution(inst);

      // Cargar estudiantes de la institución
      if (inst) {
        const allStudents = await studentService.getAllStudents();
        const institutionStudents = allStudents.filter(s => s.institution === inst._id);
        setStudents(institutionStudents);
      }

      // Calcular estadísticas
      const totalStudents = inst?.students?.length || 0;
      const activeSubjects = mySubjects.length;

      setStats({
        totalStudents,
        activeSubjects,
        approvalRate: 85, // Por ahora estático
        averageAttendance: 92 // Por ahora estático
      });

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { 
      title: 'Total Estudiantes', 
      value: stats.totalStudents.toString(), 
      icon: Users, 
      trend: '+5' 
    },
    { 
      title: 'Materias Activas', 
      value: stats.activeSubjects.toString(), 
      icon: BookOpen, 
      trend: '0' 
    },
    { 
      title: 'Tasa de Aprobación', 
      value: `${stats.approvalRate}%`, 
      icon: TrendingUp, 
      trend: stats.approvalRate > 80 ? '+3%' : '-2%' 
    },
    { 
      title: 'Asistencia Promedio', 
      value: `${stats.averageAttendance}%`, 
      icon: TrendingDown, 
      trend: '-1%' 
    },
  ];

  const renderDashboard = () => (
    <>
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
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
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes materias asignadas</p>
              <Button className="mt-4" onClick={() => window.location.href = '/docente/solicitar-institucion'}>
                Unirse a una Institución
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <img src={logo} alt="Logo Metricampus" className="h-6 w-6 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">Código: {subject.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.credits} créditos • {subject.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button size="sm" className="gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderStudents = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Mis Estudiantes
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Estudiante
          </Button>
        </CardTitle>
        <CardDescription>
          Lista de estudiantes en tus materias asignadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay estudiantes asignados</p>
            <Button className="mt-4" onClick={loadDashboardData}>
              Recargar Estudiantes
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.studentId && `ID: ${student.studentId} • `}
                      Grupo: {student.enrollmentGroup || 'No asignado'}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Calificaciones
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderInstitution = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Mi Institución
        </CardTitle>
        <CardDescription>
          Información de la institución a la que perteneces
        </CardDescription>
      </CardHeader>
      <CardContent>
        {institution ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Institución" className="h-8 w-8 object-contain" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{institution.name}</h3>
                <p className="text-sm text-muted-foreground">{institution.address}</p>
                <p className="text-sm text-muted-foreground">{institution.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">{institution.teachers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Docentes</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">{institution.students?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">{subjects.length}</p>
                <p className="text-sm text-muted-foreground">Materias</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No perteneces a ninguna institución
            </h3>
            <p className="text-muted-foreground mb-4">
              Únete a una institución para comenzar a gestionar tus materias y estudiantes
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/docente/solicitar-institucion'}>
                Solicitar Unirse
              </Button>
              <Button variant="outline">
                Ver Instituciones Disponibles
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DynamicSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Navegación de pestañas */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'materias', label: 'Mis Materias' },
              { id: 'estudiantes', label: 'Estudiantes' },
              { id: 'institucion', label: 'Institución' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'materias' && (
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Materias</CardTitle>
                <CardDescription>Administra tus materias asignadas</CardDescription>
              </CardHeader>
              <CardContent>
                {subjects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tienes materias asignadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjects.map((subject) => (
                      <div key={subject._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{subject.name}</h3>
                            <p className="text-sm text-muted-foreground">Código: {subject.code}</p>
                            <p className="text-sm text-muted-foreground">
                              {subject.credits} créditos • {subject.area}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Detalles
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {activeTab === 'estudiantes' && renderStudents()}
          {activeTab === 'institucion' && renderInstitution()}
        </main>
      </div>
    </div>
  );
}