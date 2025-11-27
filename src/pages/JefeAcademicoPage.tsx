import { DynamicSidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Search,
  Plus,
  Eye,
  Target,
  BarChart3
} from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../assets/image.png';
import { useAuthGuard } from '../components/AuthGuard';
import { institutionService } from '../services/institutionService';
import { subjectService } from '../services/subjectService';
import { studentService } from '../services/studentService';
import type { InstitutionType as Institution } from '../services/institutionService';
import type { SubjectType as Subject } from '../services/subjectService';
import type { StudentType as Student } from '../services/studentService';

export default function JefeAcademicoDashboard() {
  useAuthGuard();
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar institución
      const inst = await institutionService.getMyInstitution();
      setInstitution(inst);

      // Cargar materias
      const allSubjects = await subjectService.getAllSubjects();
      const institutionSubjects = allSubjects.filter(s => s.institution === inst?._id);
      setSubjects(institutionSubjects);

      // Cargar estudiantes
      const allStudents = await studentService.getAllStudents();
      const institutionStudents = allStudents.filter(s => s.institution === inst?._id);
      setStudents(institutionStudents);

      // Simular datos de docentes
      setTeachers([
        { id: 1, name: 'María González', subjects: ['Matemáticas', 'Cálculo'], students: 45, approvalRate: 85 },
        { id: 2, name: 'Carlos Rodríguez', subjects: ['Física', 'Química'], students: 38, approvalRate: 72 },
        { id: 3, name: 'Ana Martínez', subjects: ['Programación', 'BD'], students: 52, approvalRate: 90 }
      ]);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Docentes a Cargo', 
      value: institution?.teachers?.length?.toString() || '0', 
      icon: Users, 
      trend: '+3', 
      description: 'En mi área' 
    },
    { 
      title: 'Materias', 
      value: subjects.length.toString(), 
      icon: BookOpen, 
      trend: '+2', 
      description: 'Gestionadas' 
    },
    { 
      title: 'Estudiantes', 
      value: students.length.toString(), 
      icon: Users, 
      trend: '+45', 
      description: 'Matriculados' 
    },
    { 
      title: 'Tasa Aprobación', 
      value: '81.5%', 
      icon: TrendingUp, 
      trend: '+3.2%', 
      description: 'Promedio área' 
    },
  ];

  const subjectPerformance = [
    { name: 'Matemáticas', approval: 78, enrollment: 120, trend: 'up' },
    { name: 'Programación', approval: 85, enrollment: 95, trend: 'up' },
    { name: 'Física', approval: 72, enrollment: 85, trend: 'down' },
    { name: 'Química', approval: 68, enrollment: 78, trend: 'stable' },
  ];

  const renderDashboard = () => (
    <>
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
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
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
    </>
  );

  const renderTeachers = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Gestión de Docentes
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Docente
          </Button>
        </CardTitle>
        <CardDescription>
          Administra los docentes de tu área académica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
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
                  Gestionar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderSubjects = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Gestión de Materias
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Materia
          </Button>
        </CardTitle>
        <CardDescription>
          Administra las materias de tu área académica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
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
                  Gestionar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderInstitution = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Información Institucional
        </CardTitle>
        <CardDescription>
          Datos generales de la institución
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
                <p className="text-sm text-muted-foreground">{institution.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">{institution.academicStaff?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Staff Académico</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay información institucional
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea o únete a una institución para comenzar
            </p>
            <Button onClick={() => window.location.href = '/jefe-academico/crear-institucion'}>
              Crear Institución
            </Button>
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
              <h1 className="text-2xl font-bold text-foreground">Panel de Jefe Académico</h1>
              <p className="text-muted-foreground">Gestión del área académica asignada</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar docentes o materias..." className="pl-10 w-80" />
              </div>
            </div>
          </div>

          {/* Navegación de pestañas */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'docentes', label: 'Docentes' },
              { id: 'materias', label: 'Materias' },
              { id: 'institucion', label: 'Institución' },
              { id: 'indicadores', label: 'Indicadores' }
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

        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'docentes' && renderTeachers()}
          {activeTab === 'materias' && renderSubjects()}
          {activeTab === 'institucion' && renderInstitution()}
          {activeTab === 'indicadores' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Indicadores Académicos
                </CardTitle>
                <CardDescription>
                  Métricas y estadísticas del área académica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-foreground">{subject.name}</h3>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          subject.approval >= 80 ? 'bg-green-100 text-green-800' :
                          subject.approval >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {subject.approval}% aprobación
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{subject.enrollment} estudiantes</span>
                        <span className={`flex items-center gap-1 ${
                          subject.trend === 'up' ? 'text-green-600' :
                          subject.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {subject.trend === 'up' ? '↗ Mejorando' : 
                           subject.trend === 'down' ? '↘ Bajando' : '→ Estable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}