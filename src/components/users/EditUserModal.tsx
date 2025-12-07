import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw, Eye, EyeOff, Key } from 'lucide-react';
import { authService } from '../../services/authService';

interface EditUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onError: (error: string) => void;
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

export default function EditUserModal({ 
  user, 
  isOpen, 
  onClose, 
  onUpdate,
  onError 
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'estudiante',
    status: 'active' as 'active' | 'inactive',
    institutionId: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      // Normalizar datos del usuario del backend
      const normalizedUser = {
        firstName: user.firstName || (user.fullName ? user.fullName.split(' ')[0] : ''),
        lastName: user.lastName || (user.fullName ? user.fullName.split(' ').slice(1).join(' ') : ''),
        email: user.email || user.username || '',
        role: user.role,
        status: (user.active === false ? 'inactive' : 'active') as 'active' | 'inactive',
        institutionId: user.institutionId || user.institution || '',
        password: '',
        confirmPassword: ''
      };
      setEditUserForm(normalizedUser);
      setChangePassword(false);
    }
  }, [user]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditUserForm({ 
      ...editUserForm, 
      password, 
      confirmPassword: password 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      // Validaciones básicas
      if (!editUserForm.firstName.trim() || !editUserForm.lastName.trim()) {
        onError('Nombre y apellido son obligatorios');
        return;
      }

      if (!editUserForm.email.trim()) {
        onError('El email es obligatorio');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editUserForm.email)) {
        onError('Por favor ingresa un email válido');
        return;
      }

      // Validar contraseña si se quiere cambiar
      if (changePassword) {
        if (editUserForm.password.length < 6) {
          onError('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        if (editUserForm.password !== editUserForm.confirmPassword) {
          onError('Las contraseñas no coinciden');
          return;
        }
      }
      
      // Preparar datos para actualizar - VERSIÓN MEJORADA
      const updateData: any = {
        firstName: editUserForm.firstName.trim(),
        lastName: editUserForm.lastName.trim(),
        email: editUserForm.email.trim(),
        role: editUserForm.role,
        active: editUserForm.status === 'active',
        fullName: `${editUserForm.firstName.trim()} ${editUserForm.lastName.trim()}`,
      };

      // Solo agregar institutionId si no está vacío
      if (editUserForm.institutionId.trim() !== "") {
        updateData.institutionId = editUserForm.institutionId.trim();
      }

      // Agregar contraseña solo si se quiere cambiar y no está vacía
      if (changePassword && editUserForm.password.trim()) {
        updateData.password = editUserForm.password.trim();
        console.log("🔐 Contraseña será actualizada");
      }
      // IMPORTANTE: NO enviar password si no se quiere cambiar
      
      // Depuración: Mostrar datos que se enviarán
      console.log("📤 Datos a enviar al backend:", updateData);
      
      // Actualizar usuario usando PATCH
      console.log("📤 Actualizando usuario:", user._id, updateData);
      const result = await authService.updateUser(user._id, updateData);
      
      console.log("✅ Usuario actualizado:", result);
      onUpdate();
      onClose();
      
    } catch (err: any) {
      console.error("❌ Error detallado al actualizar usuario:", err);
      
      let errorMessage = 'Error al actualizar usuario';
      
      // Manejo mejorado de errores
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details) {
          // Si hay detalles de validación
          errorMessage = 'Error de validación: ' + JSON.stringify(errorData.details);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Editar Usuario" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editFirstName">Nombre *</Label>
            <Input
              id="editFirstName"
              value={editUserForm.firstName}
              onChange={(e) => setEditUserForm({...editUserForm, firstName: e.target.value})}
              required
              placeholder="Juan"
              disabled={loading}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editLastName">Apellido *</Label>
            <Input
              id="editLastName"
              value={editUserForm.lastName}
              onChange={(e) => setEditUserForm({...editUserForm, lastName: e.target.value})}
              required
              placeholder="Pérez"
              disabled={loading}
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editEmail">Email *</Label>
          <Input
            id="editEmail"
            type="email"
            value={editUserForm.email}
            onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
            placeholder="usuario@institucion.edu"
            required
            disabled={loading}
            className="bg-background"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editRole">Rol *</Label>
            <select
              id="editRole"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              value={editUserForm.role}
              onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
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
            <Label htmlFor="editStatus">Estado *</Label>
            <select
              id="editStatus"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              value={editUserForm.status}
              onChange={(e) => setEditUserForm({...editUserForm, status: e.target.value as "active" | "inactive"})}
              required
              disabled={loading}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editInstitutionId">Institución (Opcional)</Label>
          <Input
            id="editInstitutionId"
            value={editUserForm.institutionId}
            onChange={(e) => setEditUserForm({...editUserForm, institutionId: e.target.value})}
            placeholder="ID de la institución"
            disabled={loading}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">Dejar vacío si no tiene institución asignada</p>
        </div>

        {/* Sección para cambiar contraseña */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                disabled={loading}
                className="h-4 w-4"
              />
              <Label htmlFor="changePassword" className="font-medium">
                Cambiar contraseña
              </Label>
            </div>
            
            {changePassword && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateRandomPassword}
                disabled={loading}
              >
                <Key className="h-3 w-3 mr-1" />
                Generar
              </Button>
            )}
          </div>

          {changePassword && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="editPassword">Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="editPassword"
                    type={showPassword ? "text" : "password"}
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm({...editUserForm, password: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                    className="bg-background"
                    required={changePassword}
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
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editConfirmPassword">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="editConfirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={editUserForm.confirmPassword}
                    onChange={(e) => setEditUserForm({...editUserForm, confirmPassword: e.target.value})}
                    placeholder="Repite la contraseña"
                    disabled={loading}
                    className="bg-background"
                    required={changePassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Nota: Si no deseas cambiar la contraseña, deja esta sección desactivada. 
            La contraseña actual se mantendrá.
          </p>
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
                Actualizando...
              </>
            ) : 'Actualizar Usuario'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}