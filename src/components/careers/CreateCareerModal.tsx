import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

interface CreateCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  onError: (error: string) => void;
}

export default function CreateCareerModal({ 
  isOpen, 
  onClose, 
  onCreate,
  onError 
}: CreateCareerModalProps) {
  const [loading, setLoading] = useState(false);
  const [newCareer, setNewCareer] = useState({
    name: '',
    code: '',
    description: '',
    duration: 8,
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      // Validaciones
      if (!newCareer.name.trim()) {
        onError('El nombre es obligatorio');
        return;
      }
      
      if (!newCareer.code.trim()) {
        onError('El código es obligatorio');
        return;
      }

      if (newCareer.code.length < 3) {
        onError('El código debe tener al menos 3 caracteres');
        return;
      }

      // Preparar datos para el backend
      const careerData = {
        name: newCareer.name.trim(),
        code: newCareer.code.trim().toUpperCase(),
        description: newCareer.description.trim() || undefined,
        duration: newCareer.duration,
        status: newCareer.status  // authService manejará la conversión
      };

      console.log('📤 Enviando datos al backend:', careerData);

      const result = await authService.createCareer(careerData);
      
      // Manejar diferentes formatos de respuesta
      if (result.success || result._id || result.id || result.data?._id) {
        console.log('✅ Carrera creada exitosamente:', result);
        
        // Resetear formulario
        setNewCareer({
          name: '',
          code: '',
          description: '',
          duration: 8,
          status: 'active'
        });
        
        onCreate(); // Notificar al componente padre
        onClose(); // Cerrar modal
      } else {
        // Extraer mensaje de error
        const errorMsg = result.message || result.error || 'Error desconocido al crear carrera';
        console.error('❌ Error del servidor:', errorMsg);
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear carrera:", err);
      
      let errorMessage = 'Error al crear carrera';
      
      // Manejar errores de red
      if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet o si el servidor está activo.';
      }
      // Manejar errores de respuesta HTTP
      else if (err.response?.data) {
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
      title="Crear Nueva Carrera" 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="careerName" className="text-sm font-medium">
            Nombre de la Carrera *
          </Label>
          <Input
            id="careerName"
            value={newCareer.name}
            onChange={(e) => setNewCareer({...newCareer, name: e.target.value})}
            required
            placeholder="Ej: Ingeniería en Sistemas Computacionales"
            disabled={loading}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Nombre completo de la carrera
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerCode" className="text-sm font-medium">
            Código Único *
          </Label>
          <Input
            id="careerCode"
            value={newCareer.code}
            onChange={(e) => setNewCareer({...newCareer, code: e.target.value.toUpperCase()})}
            required
            placeholder="Ej: ISC-2024, LIC-ADM"
            disabled={loading}
            className="w-full font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Código identificador único (se convertirá a mayúsculas)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerDescription" className="text-sm font-medium">
            Descripción
          </Label>
          <textarea
            id="careerDescription"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24 resize-y"
            value={newCareer.description}
            onChange={(e) => setNewCareer({...newCareer, description: e.target.value})}
            placeholder="Descripción de la carrera, objetivos, perfil del egresado..."
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Opcional - Puedes agregar una descripción detallada
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="careerDuration" className="text-sm font-medium">
              Duración (semestres)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="careerDuration"
                type="number"
                min="1"
                max="20"
                step="1"
                value={newCareer.duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= 20) {
                    setNewCareer({...newCareer, duration: value});
                  }
                }}
                disabled={loading}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                semestres
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Generalmente 8-10 semestres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="careerStatus" className="text-sm font-medium">
              Estado Inicial
            </Label>
            <select
              id="careerStatus"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              value={newCareer.status}
              onChange={(e) => setNewCareer({...newCareer, status: e.target.value})}
              disabled={loading}
            >
              <option value="active">🟢 Activa</option>
              <option value="inactive">🔴 Inactiva</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Las carreras inactivas no estarán disponibles para nuevos estudiantes
            </p>
          </div>
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
                Crear Carrera
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}