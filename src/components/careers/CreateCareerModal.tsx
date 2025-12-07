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

      if (!newCareer.name || !newCareer.code) {
        onError('Nombre y código son obligatorios');
        return;
      }

      const result = await authService.createCareer(newCareer);
      
      if (result.success || result._id || result.id || result.data) {
        onCreate();
        onClose();
        setNewCareer({
          name: '',
          code: '',
          description: '',
          duration: 8,
          status: 'active'
        });
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear carrera';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear carrera:", err);
      let errorMessage = 'Error al crear carrera: ' + (err.message || 'Error desconocido');
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Crear Nueva Carrera" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="careerName">Nombre *</Label>
          <Input
            id="careerName"
            value={newCareer.name}
            onChange={(e) => setNewCareer({...newCareer, name: e.target.value})}
            required
            placeholder="Ingeniería en Sistemas"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerCode">Código *</Label>
          <Input
            id="careerCode"
            value={newCareer.code}
            onChange={(e) => setNewCareer({...newCareer, code: e.target.value})}
            required
            placeholder="IS-2024"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerDescription">Descripción</Label>
          <textarea
            id="careerDescription"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
            value={newCareer.description}
            onChange={(e) => setNewCareer({...newCareer, description: e.target.value})}
            placeholder="Descripción de la carrera..."
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerDuration">Duración (semestres)</Label>
          <Input
            id="careerDuration"
            type="number"
            min="1"
            max="12"
            value={newCareer.duration}
            onChange={(e) => setNewCareer({...newCareer, duration: parseInt(e.target.value)})}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerStatus">Estado</Label>
          <select
            id="careerStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newCareer.status}
            onChange={(e) => setNewCareer({...newCareer, status: e.target.value})}
            disabled={loading}
          >
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
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
            ) : 'Crear Carrera'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}