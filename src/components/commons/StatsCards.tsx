import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Users, GraduationCap, BookOpen, Users as UsersIcon } from 'lucide-react';

interface StatsCardsProps {
  users: any[];
  careers: any[];
  subjects: any[];
  groups: any[];
}

export default function StatsCards({ users, careers, subjects, groups }: StatsCardsProps) {
  const totalUsers = users.length;
  const totalCareers = careers.length;
  const totalSubjects = subjects.length;
  const totalGroups = groups.length;
  const totalTeachers = users.filter(u => u.role === 'docente').length;
  const totalStudents = users.filter(u => u.role === 'estudiante').length;
  const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <p className="text-xs text-muted-foreground">Programas académicos activos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Materias</CardTitle>
          <BookOpen className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSubjects}</div>
          <p className="text-xs text-muted-foreground">Asignaturas registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Grupos</CardTitle>
          <UsersIcon className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGroups}</div>
          <p className="text-xs text-muted-foreground">Grupos académicos</p>
        </CardContent>
      </Card>
    </div>
  );
}