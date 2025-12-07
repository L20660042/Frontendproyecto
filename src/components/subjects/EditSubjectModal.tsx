// components/subjects/EditSubjectModal.tsx - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw } from 'lucide-react';
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

  useEffect(() => {
    if (subject) {
      setEditSubjectForm({
        name: subject.name,
        code: subject.code,
        careerId: subject.careerId,
        credits: subject.credits || 4,
        semester: subject.semester || 1,
        status: subject.status
      });
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!editSubjectForm.name || !editSubjectForm.code || !editSubjectForm.careerId) {
        onError('Nombre, código y carrera son obligatorios');
        return;
      }

      // ✅ LLAMADA CORREGIDA
      const result = await authService.updateSubject(subject._id, editSubjectForm);
      
      if (result.success || result._id || result.id || result.data) {
        onUpdate();
        onClose();
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al actualizar materia';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al actualizar materia:", err);
      let errorMessage = 'Error al actualizar materia: ' + (err.message || 'Error desconocido');
      
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
    <BaseModal title="Editar Materia" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editSubjectName">Nombre *</Label>
          <Input
            id="editSubjectName"
            value={editSubjectForm.name}
            onChange={(e) => setEditSubjectForm({...editSubjectForm, name: e.target.value})}
            required
            placeholder="Cálculo Diferencial"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editSubjectCode">Código *</Label>
          <Input
            id="editSubjectCode"
            value={editSubjectForm.code}
            onChange={(e) => setEditSubjectForm({...editSubjectForm, code: e.target.value})}
            required
            placeholder="CAL-101"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editSubjectCareerId">Carrera *</Label>
          <select
            id="editSubjectCareerId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editSubjectForm.careerId}
            onChange={(e) => setEditSubjectForm({...editSubjectForm, careerId: e.target.value})}
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
            <Label htmlFor="editSubjectCredits">Créditos</Label>
            <Input
              id="editSubjectCredits"
              type="number"
              min="1"
              max="12"
              value={editSubjectForm.credits}
              onChange={(e) => setEditSubjectForm({...editSubjectForm, credits: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editSubjectSemester">Semestre</Label>
            <Input
              id="editSubjectSemester"
              type="number"
              min="1"
              max="12"
              value={editSubjectForm.semester}
              onChange={(e) => setEditSubjectForm({...editSubjectForm, semester: parseInt(e.target.value)})}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editSubjectStatus">Estado</Label>
          <select
            id="editSubjectStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editSubjectForm.status}
            onChange={(e) => setEditSubjectForm({...editSubjectForm, status: e.target.value})}
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
            ) : 'Actualizar Materia'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}