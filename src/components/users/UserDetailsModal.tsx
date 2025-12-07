import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../badge';
import { UserIcon, Mail, Building, Calendar, Edit, CheckCircle, XCircle } from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
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

export default function UserDetailsModal({ 
  user, 
  isOpen, 
  onClose, 
  onEdit,
  onToggleStatus 
}: UserDetailsModalProps) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Normalizar los datos del usuario para mostrar correctamente
      const normalizedUser = {
        ...user,
        // Si el backend devuelve fullName, separarlo
        firstName: user.firstName || (user.fullName ? user.fullName.split(' ')[0] : ''),
        lastName: user.lastName || (user.fullName ? user.fullName.split(' ').slice(1).join(' ') : ''),
        // Determinar el estado basado en 'active' o 'status'
        status: user.active === false ? 'inactive' : (user.status || 'active'),
        // Si no tiene email, usar username
        email: user.email || user.username || '',
        // Asegurar que institutionId esté presente
        institutionId: user.institutionId || user.institution || '',
        // Asegurar que createdAt esté presente
        createdAt: user.createdAt || user.createdDate || new Date().toISOString()
      };
      setUserData(normalizedUser);
    }
  }, [user]);

  if (!userData) return null;

  return (
    <BaseModal title="Detalles del Usuario" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="text-xl font-bold">
              {userData.firstName} {userData.lastName}
              {(userData.firstName === '' && userData.lastName === '') && 
                (userData.fullName || userData.name || 'Usuario sin nombre')}
            </h4>
            <p className="text-muted-foreground">{userData.email}</p>
            {userData.username && userData.username !== userData.email && (
              <p className="text-xs text-muted-foreground">Usuario: {userData.username}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
              <p className="text-lg font-medium">
                {userData.firstName || 'No especificado'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
              <p className="text-lg font-medium">
                {userData.lastName || 'No especificado'}
              </p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg">{userData.email}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
            <div className="mt-1">
              <Badge variant="default" className="text-base px-3 py-1">
                {availableRoles.find(r => r.value === userData.role)?.label || 
                 (userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)) || 
                 'Sin rol asignado'}
              </Badge>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
            <div className="mt-1">
              <Badge 
                variant={userData.status === 'active' ? 'default' : 'destructive'}
                className="text-base px-3 py-1 gap-2"
              >
                {userData.status === 'active' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Activo</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Inactivo</span>
                  </>
                )}
              </Badge>
            </div>
          </div>
          
          {userData.institutionId && userData.institutionId.trim() !== '' && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Institución</Label>
              <div className="flex items-center gap-2 mt-1">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg">{userData.institutionId}</p>
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">ID del Usuario</Label>
            <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
              {userData._id || userData.id || 'Sin ID'}
            </p>
          </div>
          
          {userData.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de registro</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{new Date(userData.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          )}

          {userData.updatedAt && userData.updatedAt !== userData.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Última actualización</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{new Date(userData.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-6 space-y-3">
          <Button 
            onClick={onEdit}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Usuario
          </Button>
          <Button 
            variant="outline"
            onClick={onToggleStatus}
            className="w-full"
          >
            {userData.status === 'active' ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Desactivar Usuario
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activar Usuario
              </>
            )}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}