import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface EditCareerModalProps {
  career: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onError: (error: string) => void;
}

export default function EditCareerModal({ 
  career, 
  isOpen, 
  onClose, 
  onUpdate,
  onError 
}: EditCareerModalProps) {
  const [loading, setLoading] = useState(false);
  const [editCareerForm, setEditCareerForm] = useState({
    name: '',
    code: '',
    description: '',
    duration: 8,
    status: 'active'
  });

  // Estado para validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (career) {
      setEditCareerForm({
        name: career.name || '',
        code: career.code || '',
        description: career.description || '',
        duration: career.duration || 8,
        status: career.status || 'active'
      });
      setErrors({}); // Resetear errores cuando cambia la carrera
    }
  }, [career]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editCareerForm.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!editCareerForm.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (editCareerForm.code.length < 3) {
      newErrors.code = 'El código debe tener al menos 3 caracteres';
    }
    
    if (editCareerForm.duration < 1 || editCareerForm.duration > 20) {
      newErrors.duration = 'La duración debe estar entre 1 y 20 semestres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      onError('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      onError('');

      // Preparar datos para el backend
      const careerData = {
      name: editCareerForm.name.trim(),
      code: editCareerForm.code.trim().toUpperCase(),
      description: editCareerForm.description.trim() || undefined,
      duration: editCareerForm.duration,
      status: editCareerForm.status  // El authService lo convertirá a active
    };

      console.log('📤 Actualizando carrera:', career._id, careerData);

      const result = await authService.updateCareer(career._id, careerData);
      
      // Manejar diferentes formatos de respuesta
      if (result.success || result._id || result.id || result.data?._id) {
        console.log('✅ Carrera actualizada exitosamente:', result);
        
        onUpdate(); // Notificar al componente padre para refrescar datos
        onClose(); // Cerrar modal
      } else {
        // Extraer mensaje de error
        const errorMsg = result.message || result.error || 'Error desconocido al actualizar carrera';
        console.error('❌ Error del servidor:', errorMsg);
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al actualizar carrera:", err);
      
      let errorMessage = 'Error al actualizar carrera';
      
      // Manejar errores específicos
      if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet o si el servidor está activo.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Carrera no encontrada. Puede que haya sido eliminada.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Conflicto: El código o nombre ya existe en otra carrera.';
      } else if (err.response?.data) {
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
      
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal 
      title={`Editar Carrera: ${career?.code || ''}`}
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editCareerName" className="text-sm font-medium flex items-center gap-2">
            Nombre de la Carrera *
            {errors.name && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </span>
            )}
          </Label>
          <Input
            id="editCareerName"
            value={editCareerForm.name}
            onChange={(e) => {
              setEditCareerForm({...editCareerForm, name: e.target.value});
              if (errors.name) setErrors({...errors, name: ''});
            }}
            required
            placeholder="Ingeniería en Sistemas Computacionales"
            disabled={loading}
            className={`w-full ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCareerCode" className="text-sm font-medium flex items-center gap-2">
            Código Único *
            {errors.code && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.code}
              </span>
            )}
          </Label>
          <Input
            id="editCareerCode"
            value={editCareerForm.code}
            onChange={(e) => {
              setEditCareerForm({...editCareerForm, code: e.target.value.toUpperCase()});
              if (errors.code) setErrors({...errors, code: ''});
            }}
            required
            placeholder="ISC-2024"
            disabled={loading}
            className={`w-full font-mono ${errors.code ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          <p className="text-xs text-muted-foreground">
            Código identificador único (se convertirá a mayúsculas)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCareerDescription" className="text-sm font-medium">
            Descripción
          </Label>
          <textarea
            id="editCareerDescription"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24 resize-y"
            value={editCareerForm.description}
            onChange={(e) => setEditCareerForm({...editCareerForm, description: e.target.value})}
            placeholder="Descripción de la carrera, objetivos, perfil del egresado..."
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Opcional - Puedes modificar la descripción
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editCareerDuration" className="text-sm font-medium flex items-center gap-2">
              Duración (semestres)
              {errors.duration && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.duration}
                </span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="editCareerDuration"
                type="number"
                min="1"
                max="20"
                step="1"
                value={editCareerForm.duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 20) {
                    setEditCareerForm({...editCareerForm, duration: value});
                    if (errors.duration) setErrors({...errors, duration: ''});
                  }
                }}
                disabled={loading}
                className={`w-full ${errors.duration ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                semestres
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editCareerStatus" className="text-sm font-medium">
              Estado
            </Label>
            <select
              id="editCareerStatus"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={editCareerForm.status}
              onChange={(e) => setEditCareerForm({...editCareerForm, status: e.target.value})}
              disabled={loading}
            >
              <option value="active">🟢 Activa - Disponible para inscripción</option>
              <option value="inactive">🔴 Inactiva - No disponible para nuevos estudiantes</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Cambiar a inactiva no afecta a estudiantes actuales
            </p>
          </div>
        </div>

        {/* Información de la carrera */}
        {career && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
            <p className="text-blue-800 font-medium">Información de la carrera:</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-blue-700">
              <div>
                <span className="font-medium">ID:</span> {career._id?.substring(0, 8)}...
              </div>
              <div>
                <span className="font-medium">Creada:</span> {career.createdAt ? new Date(career.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}