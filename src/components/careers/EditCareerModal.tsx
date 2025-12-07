// components/careers/EditCareerModal.tsx - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    if (career) {
      setEditCareerForm({
        name: career.name,
        code: career.code,
        description: career.description || '',
        duration: career.duration || 8,
        status: career.status
      });
    }
  }, [career]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!editCareerForm.name || !editCareerForm.code) {
        onError('Nombre y código son obligatorios');
        return;
      }

      // ✅ LLAMADA CORREGIDA
      const result = await authService.updateCareer(career._id, editCareerForm);
      
      if (result.success || result._id || result.id || result.data) {
        onUpdate();
        onClose();
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al actualizar carrera';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al actualizar carrera:", err);
      let errorMessage = 'Error al actualizar carrera: ' + (err.message || 'Error desconocido');
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Editar Carrera" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editCareerName">Nombre *</Label>
          <Input
            id="editCareerName"
            value={editCareerForm.name}
            onChange={(e) => setEditCareerForm({...editCareerForm, name: e.target.value})}
            required
            placeholder="Ingeniería en Sistemas"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCareerCode">Código *</Label>
          <Input
            id="editCareerCode"
            value={editCareerForm.code}
            onChange={(e) => setEditCareerForm({...editCareerForm, code: e.target.value})}
            required
            placeholder="IS-2024"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCareerDescription">Descripción</Label>
          <textarea
            id="editCareerDescription"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-24"
            value={editCareerForm.description}
            onChange={(e) => setEditCareerForm({...editCareerForm, description: e.target.value})}
            placeholder="Descripción de la carrera..."
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCareerDuration">Duración (semestres)</Label>
          <Input
            id="editCareerDuration"
            type="number"
            min="1"
            max="12"
            value={editCareerForm.duration}
            onChange={(e) => setEditCareerForm({...editCareerForm, duration: parseInt(e.target.value)})}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCareerStatus">Estado</Label>
          <select
            id="editCareerStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editCareerForm.status}
            onChange={(e) => setEditCareerForm({...editCareerForm, status: e.target.value})}
            required
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
                Actualizando...
              </>
            ) : 'Actualizar Carrera'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}