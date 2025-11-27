import { useState, useEffect } from 'react';
import { DynamicSidebar } from '../components/Sidebar';
import { Button } from '../components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Calendar,
  Bell,
  TrendingUp,
  FileText
} from 'lucide-react';
import logo from '../assets/image.png';
import { useAuthGuard } from '../components/AuthGuard';
import { gradeService } from '../services/gradeService';
import { subjectService } from '../services/subjectService';
import { institutionService } from '../services/institutionService';
import type { GradeType as Grade } from '../services/gradeService';
import type { SubjectType as Subject } from '../services/subjectService';
import type { InstitutionType as Institution } from '../services/institutionService';

export default function EstudianteDashboard() {
  useAuthGuard();
  
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar calificaciones del estudiante
      const myGrades = await gradeService.getMyGrades();
      setGrades(myGrades);

      // Cargar institución
      const inst = await institutionService.getMyInstitution();
      setInstitution(inst);

      // Cargar materias disponibles
      const allSubjects = await subjectService.getAllSubjects();
      setSubjects(allSubjects.slice(0, 5)); // Mostrar solo 5 materias

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Promedio General', 
      value: '8.5', 
      icon: TrendingUp, 
      trend: '+0.2', 
      description: 'Sobre 10' 
    },
    { 
      title: 'Materias Inscritas', 
      value: subjects.length.toString(), 
      icon: BookOpen, 
      trend: '0', 
      description: 'Este semestre' 
    },
    { 
      title: 'Asistencia', 
      value: '92%', 
      icon: Users, 
      trend: '+3%', 
      description: 'Promedio' 
    },
    { 
      title: 'Próximos Exámenes', 
      value: '3', 
      icon: Calendar, 
      trend: '2 días', 
      description: 'Por venir' 
    },
  ];

  const recentGrades = [
    { subject: 'Matemáticas', grade: 9.2, date: '2024-01-15', type: 'Parcial' },
    { subject: 'Programación', grade: 8.5, date: '2024-01-12', type: 'Proyecto' },
    { subject: 'Física', grade: 7.8, date: '2024-01-10', type: 'Laboratorio' },
  ];

  const renderDashboard = () => (
    <>
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                    <p className={`text-xs mt-1 ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {stat.trend}
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
        {/* Calificaciones Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Calificaciones Recientes
            </CardTitle>
            <CardDescription>
              Tus últimas calificaciones y evaluaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      grade.grade >= 9 ? 'bg-green-100 text-green-600' :
                      grade.grade >= 8 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{grade.subject}</h3>
                      <p className="text-sm text-muted-foreground">{grade.type} • {grade.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      grade.grade >= 9 ? 'text-green-600' :
                      grade.grade >= 8 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grade.grade}
                    </p>
                    <p className="text-xs text-muted-foreground">Sobre 10</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Materias Inscritas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Mis Materias
            </CardTitle>
            <CardDescription>
              Materias en las que estás inscrito este semestre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject._id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">{subject.name}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {subject.credits} créditos
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {subject.description || 'Sin descripción disponible'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Código: {subject.code}</span>
                    <span>{subject.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderGrades = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Historial de Calificaciones
        </CardTitle>
        <CardDescription>
          Todas tus calificaciones por período académico
        </CardDescription>
      </CardHeader>
      <CardContent>
        {grades.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay calificaciones registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grades.map((grade) => (
              <div key={grade._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    grade.score >= 90 ? 'bg-green-100 text-green-600' :
                    grade.score >= 80 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {(grade.subject as any)?.name || 'Materia no disponible'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {grade.period} • {new Date(grade.gradedAt).toLocaleDateString()}
                    </p>
                    {grade.comments && (
                      <p className="text-xs text-muted-foreground mt-1">{grade.comments}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    grade.score >= 90 ? 'text-green-600' :
                    grade.score >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {grade.score}%
                  </p>
                  <p className="text-xs text-muted-foreground">Calificación</p>
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
          Información de la institución educativa
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">{institution.students?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
              </div>
              <div className="text-center p-4 border border-border rounded-lg">
                <p className="text-2xl font-bold text-primary">{institution.teachers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Docentes</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No estás asignado a ninguna institución</p>
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
              <h1 className="text-2xl font-bold text-foreground">Panel del Estudiante</h1>
              <p className="text-muted-foreground">Sigue tu progreso académico</p>
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
              { id: 'calificaciones', label: 'Calificaciones' },
              { id: 'materias', label: 'Mis Materias' },
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
          {activeTab === 'calificaciones' && renderGrades()}
          {activeTab === 'materias' && (
            <Card>
              <CardHeader>
                <CardTitle>Mis Materias</CardTitle>
                <CardDescription>Gestión de materias inscritas</CardDescription>
              </CardHeader>
              <CardContent>
                {renderDashboard().props.children[1].props.children[1]}
              </CardContent>
            </Card>
          )}
          {activeTab === 'institucion' && renderInstitution()}
        </main>
      </div>
    </div>
  );
}