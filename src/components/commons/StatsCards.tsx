import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Users, GraduationCap, BookOpen, Users as UsersIcon, MessageSquare } from 'lucide-react';

interface StatsCardsProps {
  users: any[];
  careers: any[];
  subjects: any[];
  groups: any[];
  tutorias?: any[]; // Nueva prop opcional
}

export default function StatsCards({ 
  users, 
  careers, 
  subjects, 
  groups, 
  tutorias = [] // Valor por defecto para compatibilidad
}: StatsCardsProps) {
  const totalUsers = users.length;
  const totalCareers = careers.length;
  const totalSubjects = subjects.length;
  const totalGroups = groups.length;
  const totalTutorias = tutorias.length;
  
  const totalTeachers = users.filter(u => u.role === 'docente' || u.role === 'teacher').length;
  const totalStudents = users.filter(u => u.role === 'estudiante' || u.role === 'student').length;
  const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  
  const activeCareers = careers.filter(c => c.active !== false && c.status !== 'inactive').length;
  const activeSubjects = subjects.filter(s => s.active !== false && s.status !== 'inactive').length;
  const activeGroups = groups.filter(g => g.active !== false && g.status !== 'inactive').length;
  const tutoriasConRiesgo = tutorias.filter(t => t.riskDetected === true).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {totalAdmins} admins, {totalTeachers} docentes, {totalStudents} estudiantes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carreras</CardTitle>
          <GraduationCap className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCareers}</div>
          <p className="text-xs text-muted-foreground">
            {activeCareers} activas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Materias</CardTitle>
          <BookOpen className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubjects}</div>
          <p className="text-xs text-muted-foreground">
            {activeSubjects} activas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Grupos</CardTitle>
          <UsersIcon className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGroups}</div>
          <p className="text-xs text-muted-foreground">
            {activeGroups} activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tutorías</CardTitle>
          <MessageSquare className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTutorias}</div>
          <p className="text-xs text-muted-foreground">
            {tutoriasConRiesgo} con riesgo detectado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}