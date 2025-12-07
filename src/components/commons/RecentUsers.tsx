import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Badge } from '../../components/badge';

interface RecentUsersProps {
  users: any[];
}

const availableRoles = [
  { value: 'superadmin', label: 'Super Administrador' },
  { value: 'admin', label: 'Administrador' },
  { value: 'docente', label: 'Docente' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'jefe-academico', label: 'Jefe Académico' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'psicopedagogico', label: 'Psicopedagógico' },
  { value: 'desarrollo-academico', label: 'Desarrollo Académico' }
];

export default function RecentUsers({ users }: RecentUsersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios Recientes</CardTitle>
        <CardDescription>Últimos registros</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.slice(0, 3).map(user => (
          <div key={user._id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">{user.firstName} {user.lastName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <Badge variant={
              user.role === 'superadmin' ? 'default' :
              user.role === 'admin' ? 'secondary' :
              user.role === 'docente' ? 'outline' : 'outline'
            }>
              {availableRoles.find(r => r.value === user.role)?.label || user.role}
            </Badge>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No hay usuarios registrados
          </div>
        )}
      </CardContent>
    </Card>
  );
}