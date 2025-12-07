import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { EyeOff, Eye as EyeIcon, Key, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  onError: (error: string) => void;
}

const availableRoles = [
  { value: 'superadmin', label: 'Super Administrador', backendValue: 'superadmin' },
  { value: 'admin', label: 'Administrador', backendValue: 'admin' },
  { value: 'docente', label: 'Docente', backendValue: 'docente' },
  { value: 'estudiante', label: 'Estudiante', backendValue: 'estudiante' },
  { value: 'jefe_departamento', label: 'Jefe Académico', backendValue: 'jefe_departamento' },
  { value: 'tutor', label: 'Tutor', backendValue: 'tutor' },
  { value: 'control_escolar', label: 'Psicopedagógico', backendValue: 'control_escolar' },
  { value: 'capacitacion', label: 'Desarrollo Académico', backendValue: 'capacitacion' }
];

export default function CreateUserModal({ 
  isOpen, 
  onClose, 
  onCreate,
  onError 
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'estudiante',
    institutionId: '',
    status: 'active' as 'active' | 'inactive'
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password, confirmPassword: password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      // Validaciones
      if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
        onError('Todos los campos marcados con * son obligatorios');
        return;
      }

      if (newUser.password.length < 6) {
        onError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (newUser.password !== newUser.confirmPassword) {
        onError('Las contraseñas no coinciden');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        onError('Por favor ingresa un email válido');
        return;
      }

      // Preparar datos para enviar al backend
      const userDataToSend = {
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        fullName: `${newUser.firstName.trim()} ${newUser.lastName.trim()}`,
        role: newUser.role, // Ya está en el formato correcto
        active: newUser.status === 'active',
        ...(newUser.institutionId && newUser.institutionId.trim() !== "" && { 
          institutionId: newUser.institutionId.trim()
        })
      };
      
      // Crear usuario
      const result = await authService.createUser(userDataToSend);
      
      if (result.success || result.status === 'success' || result._id || result.id || result.data) {
        onCreate();
        onClose();
        setNewUser({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'estudiante',
          institutionId: '',
          status: 'active'
        });
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear usuario';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear usuario:", err);
      let errorMessage = 'Error al crear usuario';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      onError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Crear Nuevo Usuario" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              value={newUser.firstName}
              onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
              required
              placeholder="Juan"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              value={newUser.lastName}
              onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
              required
              placeholder="Pérez"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            placeholder="usuario@institucion.edu"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Contraseña *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generatePassword}
              disabled={loading}
              className="text-xs h-7"
            >
              <Key className="h-3 w-3 mr-1" />
              Generar
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={newUser.confirmPassword}
            onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
            placeholder="Repite la contraseña"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol *</Label>
          <select
            id="role"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            required
            disabled={loading}
          >
            {availableRoles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institutionId">Institución (Opcional)</Label>
          <Input
            id="institutionId"
            value={newUser.institutionId}
            onChange={(e) => setNewUser({...newUser, institutionId: e.target.value})}
            placeholder="ID de la institución"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">Dejar vacío si no tiene institución asignada</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newUser.status}
            onChange={(e) => setNewUser({...newUser, status: e.target.value as "active" | "inactive"})}
            disabled={loading}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}