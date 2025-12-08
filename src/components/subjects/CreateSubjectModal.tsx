import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface CreateSubjectModalProps {
  careers: any[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  onError: (error: string) => void;
}

export default function CreateSubjectModal({ 
  careers, 
  isOpen, 
  onClose, 
  onCreate,
  onError 
}: CreateSubjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    careerId: '',
    credits: 4,
    semester: 1,
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newSubject.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!newSubject.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    } else if (newSubject.code.length < 3) {
      newErrors.code = 'El código debe tener al menos 3 caracteres';
    }
    
    if (!newSubject.careerId) {
      newErrors.careerId = 'Debes seleccionar una carrera';
    }
    
    if (newSubject.credits < 1 || newSubject.credits > 20) {
      newErrors.credits = 'Los créditos deben estar entre 1 y 20';
    }
    
    if (newSubject.semester < 1 || newSubject.semester > 12) {
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
        name: newSubject.name.trim(),
        code: newSubject.code.trim().toUpperCase(),
        careerId: newSubject.careerId,
        credits: newSubject.credits,
        semester: newSubject.semester,
        status: newSubject.status
      };

      console.log('📤 Creando materia:', subjectData);

      // ✅ LLAMADA CORREGIDA con manejo de estructura anidada
      const result = await authService.createSubject(subjectData);
      
      // Manejar diferentes formatos de respuesta
      if (result.success || result._id || result.id || result.data?._id) {
        console.log('✅ Materia creada exitosamente:', result);
        
        // Resetear formulario
        setNewSubject({
          name: '',
          code: '',
          careerId: '',
          credits: 4,
          semester: 1,
          status: 'active'
        });
        setErrors({});
        
        onCreate(); // Notificar al componente padre
        onClose(); // Cerrar modal
      } else {
        // Extraer mensaje de error
        const errorMsg = result.message || result.error || 'Error desconocido al crear materia';
        console.error('❌ Error del servidor:', errorMsg);
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear materia:", err);
      
      let errorMessage = 'Error al crear materia';
      
      // Manejar errores de red
      if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet o si el servidor está activo.';
      }
      // Manejar errores de respuesta HTTP
      else if (err.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada.';
      } else if (err.response?.status === 409) {
        errorMessage = 'El código de materia ya existe. Usa un código diferente.';
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
      title="Crear Nueva Materia" 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subjectName" className="text-sm font-medium flex items-center gap-2">
            Nombre de la Materia *
            {errors.name && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </span>
            )}
          </Label>
          <Input
            id="subjectName"
            value={newSubject.name}
            onChange={(e) => {
              setNewSubject({...newSubject, name: e.target.value});
              if (errors.name) setErrors({...errors, name: ''});
            }}
            required
            placeholder="Cálculo Diferencial"
            disabled={loading}
            className={`w-full ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectCode" className="text-sm font-medium flex items-center gap-2">
            Código Único *
            {errors.code && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.code}
              </span>
            )}
          </Label>
          <Input
            id="subjectCode"
            value={newSubject.code}
            onChange={(e) => {
              setNewSubject({...newSubject, code: e.target.value.toUpperCase()});
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
          <Label htmlFor="subjectCareerId" className="text-sm font-medium flex items-center gap-2">
            Carrera *
            {errors.careerId && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.careerId}
              </span>
            )}
          </Label>
          <select
            id="subjectCareerId"
            className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 ${errors.careerId ? 'border-red-500' : ''}`}
            value={newSubject.careerId}
            onChange={(e) => {
              setNewSubject({...newSubject, careerId: e.target.value});
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
          <p className="text-xs text-muted-foreground">
            La materia pertenecerá a esta carrera
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subjectCredits" className="text-sm font-medium flex items-center gap-2">
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
                id="subjectCredits"
                type="number"
                min="1"
                max="20"
                step="1"
                value={newSubject.credits}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 20) {
                    setNewSubject({...newSubject, credits: value});
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
            <p className="text-xs text-muted-foreground">
              Generalmente 3-5 créditos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectSemester" className="text-sm font-medium flex items-center gap-2">
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
                id="subjectSemester"
                type="number"
                min="1"
                max="12"
                step="1"
                value={newSubject.semester}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 12) {
                    setNewSubject({...newSubject, semester: value});
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
            <p className="text-xs text-muted-foreground">
              En qué semestre se imparte
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectStatus" className="text-sm font-medium">
            Estado Inicial
          </Label>
          <select
            id="subjectStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newSubject.status}
            onChange={(e) => setNewSubject({...newSubject, status: e.target.value})}
            disabled={loading}
          >
            <option value="active">🟢 Activa - Disponible para grupos</option>
            <option value="inactive">🔴 Inactiva - No disponible temporalmente</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Puedes cambiar el estado después de crear la materia
          </p>
        </div>

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
            className="px-6 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Crear Materia
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}