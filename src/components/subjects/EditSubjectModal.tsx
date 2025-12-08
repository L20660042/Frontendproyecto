import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface EditSubjectModalProps {
  subject: any;
  careers: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onError: (error: string) => void;
}

export default function EditSubjectModal({ 
  subject, 
  careers, 
  isOpen, 
  onClose, 
  onUpdate,
  onError 
}: EditSubjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [editSubjectForm, setEditSubjectForm] = useState({
    name: '',
    code: '',
    careerId: '',
    credits: 4,
    semester: 1,
    status: 'active'
  });

  // Estado para validaciones
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subject) {
      setEditSubjectForm({
        name: subject.name || '',
        code: subject.code || '',
        careerId: subject.careerId || subject.career?._id || '',
        credits: subject.credits || 4,
        semester: subject.semester || 1,
        status: subject.status || 'active'
      });
      setErrors({}); // Resetear errores cuando cambia la materia
    }
  }, [subject]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editSubjectForm.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!editSubjectForm.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (editSubjectForm.code.length < 3) {
      newErrors.code = 'El código debe tener al menos 3 caracteres';
    }
    
    if (!editSubjectForm.careerId) {
      newErrors.careerId = 'Debes seleccionar una carrera';
    }
    
    if (editSubjectForm.credits < 1 || editSubjectForm.credits > 20) {
      newErrors.credits = 'Los créditos deben estar entre 1 y 20';
    }
    
    if (editSubjectForm.semester < 1 || editSubjectForm.semester > 12) {
      newErrors.semester = 'El semestre debe estar entre 1 y 12';
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
      const subjectData = {
        name: editSubjectForm.name.trim(),
        code: editSubjectForm.code.trim().toUpperCase(),
        careerId: editSubjectForm.careerId,
        credits: editSubjectForm.credits,
        semester: editSubjectForm.semester,
        status: editSubjectForm.status
      };

      console.log('📤 Actualizando materia:', subject._id, subjectData);

      // ✅ LLAMADA CORREGIDA con manejo de estructura anidada
      const result = await authService.updateSubject(subject._id, subjectData);
      
      // Manejar diferentes formatos de respuesta
      if (result.success || result._id || result.id || result.data?._id) {
        console.log('✅ Materia actualizada exitosamente:', result);
        
        onUpdate(); // Notificar al componente padre para refrescar datos
        onClose(); // Cerrar modal
      } else {
        // Extraer mensaje de error
        const errorMsg = result.message || result.error || 'Error desconocido al actualizar materia';
        console.error('❌ Error del servidor:', errorMsg);
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al actualizar materia:", err);
      
      let errorMessage = 'Error al actualizar materia';
      
      // Manejar errores específicos
      if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet o si el servidor está activo.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Materia no encontrada. Puede que haya sido eliminada.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Conflicto: El código ya existe en otra materia.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada.';
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
      title={`Editar Materia: ${subject?.code || ''}`}
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editSubjectName" className="text-sm font-medium flex items-center gap-2">
            Nombre de la Materia *
            {errors.name && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </span>
            )}
          </Label>
          <Input
            id="editSubjectName"
            value={editSubjectForm.name}
            onChange={(e) => {
              setEditSubjectForm({...editSubjectForm, name: e.target.value});
              if (errors.name) setErrors({...errors, name: ''});
            }}
            required
            placeholder="Cálculo Diferencial"
            disabled={loading}
            className={`w-full ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editSubjectCode" className="text-sm font-medium flex items-center gap-2">
            Código Único *
            {errors.code && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.code}
              </span>
            )}
          </Label>
          <Input
            id="editSubjectCode"
            value={editSubjectForm.code}
            onChange={(e) => {
              setEditSubjectForm({...editSubjectForm, code: e.target.value.toUpperCase()});
              if (errors.code) setErrors({...errors, code: ''});
            }}
            required
            placeholder="CAL-101"
            disabled={loading}
            className={`w-full font-mono ${errors.code ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          <p className="text-xs text-muted-foreground">
            Código identificador único (se convertirá a mayúsculas)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editSubjectCareerId" className="text-sm font-medium flex items-center gap-2">
            Carrera *
            {errors.careerId && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.careerId}
              </span>
            )}
          </Label>
          <select
            id="editSubjectCareerId"
            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 ${errors.careerId ? 'border-red-500' : ''}`}
            value={editSubjectForm.careerId}
            onChange={(e) => {
              setEditSubjectForm({...editSubjectForm, careerId: e.target.value});
              if (errors.careerId) setErrors({...errors, careerId: ''});
            }}
            required
            disabled={loading}
          >
            <option value="">Seleccionar carrera</option>
            {careers.map(career => (
              <option key={career._id} value={career._id}>
                {career.name} ({career.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editSubjectCredits" className="text-sm font-medium flex items-center gap-2">
              Créditos
              {errors.credits && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.credits}
                </span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="editSubjectCredits"
                type="number"
                min="1"
                max="20"
                step="1"
                value={editSubjectForm.credits}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 20) {
                    setEditSubjectForm({...editSubjectForm, credits: value});
                    if (errors.credits) setErrors({...errors, credits: ''});
                  }
                }}
                disabled={loading}
                className={`w-full ${errors.credits ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                créditos
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editSubjectSemester" className="text-sm font-medium flex items-center gap-2">
              Semestre
              {errors.semester && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.semester}
                </span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="editSubjectSemester"
                type="number"
                min="1"
                max="12"
                step="1"
                value={editSubjectForm.semester}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 12) {
                    setEditSubjectForm({...editSubjectForm, semester: value});
                    if (errors.semester) setErrors({...errors, semester: ''});
                  }
                }}
                disabled={loading}
                className={`w-full ${errors.semester ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                semestre
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editSubjectStatus" className="text-sm font-medium">
            Estado
          </Label>
          <select
            id="editSubjectStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editSubjectForm.status}
            onChange={(e) => setEditSubjectForm({...editSubjectForm, status: e.target.value})}
            disabled={loading}
          >
            <option value="active">🟢 Activa - Disponible para inscripción</option>
            <option value="inactive">🔴 Inactiva - No disponible para nuevos grupos</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Cambiar a inactiva no afecta a grupos actuales
          </p>
        </div>

        {/* Información de la materia */}
        {subject && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md text-sm">
            <p className="text-purple-800 font-medium">Información de la materia:</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-purple-700">
              <div>
                <span className="font-medium">ID:</span> {subject._id?.substring(0, 8)}...
              </div>
              <div>
                <span className="font-medium">Creada:</span> {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : 'N/A'}
              </div>
              {subject.updatedAt && subject.updatedAt !== subject.createdAt && (
                <div className="col-span-2">
                  <span className="font-medium">Actualizada:</span> {new Date(subject.updatedAt).toLocaleDateString()}
                </div>
              )}
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
            className="px-6 bg-purple-600 hover:bg-purple-700"
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