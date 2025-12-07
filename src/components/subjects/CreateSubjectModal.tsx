import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!newSubject.name || !newSubject.code || !newSubject.careerId) {
        onError('Nombre, código y carrera son obligatorios');
        return;
      }

      const result = await authService.createSubject(newSubject);
      
      if (result.success || result._id || result.id || result.data) {
        onCreate();
        onClose();
        setNewSubject({
          name: '',
          code: '',
          careerId: '',
          credits: 4,
          semester: 1,
          status: 'active'
        });
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear materia';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear materia:", err);
      let errorMessage = 'Error al crear materia: ' + (err.message || 'Error desconocido');
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Crear Nueva Materia" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subjectName">Nombre *</Label>
          <Input
            id="subjectName"
            value={newSubject.name}
            onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
            required
            placeholder="Cálculo Diferencial"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectCode">Código *</Label>
          <Input
            id="subjectCode"
            value={newSubject.code}
            onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
            required
            placeholder="CAL-101"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectCareerId">Carrera *</Label>
          <select
            id="subjectCareerId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newSubject.careerId}
            onChange={(e) => setNewSubject({...newSubject, careerId: e.target.value})}
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
            <Label htmlFor="subjectCredits">Créditos</Label>
            <Input
              id="subjectCredits"
              type="number"
              min="1"
              max="12"
              value={newSubject.credits}
              onChange={(e) => setNewSubject({...newSubject, credits: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectSemester">Semestre</Label>
            <Input
              id="subjectSemester"
              type="number"
              min="1"
              max="12"
              value={newSubject.semester}
              onChange={(e) => setNewSubject({...newSubject, semester: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectStatus">Estado</Label>
          <select
            id="subjectStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newSubject.status}
            onChange={(e) => setNewSubject({...newSubject, status: e.target.value})}
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
            ) : 'Crear Materia'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}