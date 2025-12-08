import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, UserPlus, EyeIcon, Edit, Trash2 } from 'lucide-react';

interface UsersTableProps {
  users: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateUser: () => void;
  onViewDetails: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus?: (userId: string) => void; // <-- Agregar esta línea
}

const availableRoles = [
  { value: 'superadmin', label: 'Super Administrador' },
  { value: 'admin', label: 'Administrador' },
  { value: 'docente', label: 'Docente' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'jefe_departamento', label: 'Jefe Académico' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'control_escolar', label: 'Psicopedagógico' },
  { value: 'capacitacion', label: 'Desarrollo Académico' }
];

export default function UsersTable({
  users,
  loading,
  searchTerm,
  onSearchChange,
  onCreateUser,
  onViewDetails,
  onEditUser,
  onDeleteUser
}: UsersTableProps) {
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
    );
  });

  // Función para obtener etiqueta del rol
  const getRoleLabel = (roleValue: string) => {
    const role = availableRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            {users.length} usuarios registrados en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateUser} disabled={loading}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando usuarios...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Nombre</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Rol</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.fullName || 'Sin nombre'
                            }
                          </div>
                          {user.institutionId && (
                            <div className="text-xs text-muted-foreground">
                              Institución: {user.institutionId}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={
                            user.role === 'superadmin' ? 'default' :
                            user.role === 'admin' ? 'secondary' :
                            user.role === 'docente' ? 'outline' : 'outline'
                          }>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.active === true ? 'default' : 'destructive'}>
                            {user.active === true ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Ver detalles"
                              onClick={() => onViewDetails(user)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Editar"
                              onClick={() => onEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              title="Eliminar"
                              onClick={() => onDeleteUser(user._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}