// components/groups/EditGroupModal.tsx - VERSIÓN CORREGIDA
import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

interface EditGroupModalProps {
  group: any;
  careers: any[];
  subjects: any[];
  users: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onError: (error: string) => void;
}

export default function EditGroupModal({ 
  group, 
  careers, 
  subjects, 
  users, 
  isOpen, 
  onClose, 
  onUpdate,
  onError 
}: EditGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [editGroupForm, setEditGroupForm] = useState({
    name: '',
    code: '',
    careerId: '',
    subjectId: '',
    teacherId: '',
    schedule: '',
    capacity: 30,
    status: 'active'
  });

  useEffect(() => {
    if (group) {
      setEditGroupForm({
        name: group.name,
        code: group.code,
        careerId: group.careerId,
        subjectId: group.subjectId,
        teacherId: group.teacherId || '',
        schedule: group.schedule || '',
        capacity: group.capacity || 30,
        status: group.status
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!editGroupForm.name || !editGroupForm.code || !editGroupForm.careerId || !editGroupForm.subjectId) {
        onError('Nombre, código, carrera y materia son obligatorios');
        return;
      }

      // ✅ LLAMADA CORREGIDA
      const result = await authService.updateGroup(group._id, editGroupForm);
      
      if (result.success || result._id || result.id || result.data) {
        onUpdate();
        onClose();
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al actualizar grupo';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al actualizar grupo:", err);
      let errorMessage = 'Error al actualizar grupo: ' + (err.message || 'Error desconocido');
      
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
    <BaseModal title="Editar Grupo" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editGroupName">Nombre *</Label>
          <Input
            id="editGroupName"
            value={editGroupForm.name}
            onChange={(e) => setEditGroupForm({...editGroupForm, name: e.target.value})}
            required
            placeholder="Grupo A - Mañana"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editGroupCode">Código *</Label>
          <Input
            id="editGroupCode"
            value={editGroupForm.code}
            onChange={(e) => setEditGroupForm({...editGroupForm, code: e.target.value})}
            required
            placeholder="GRP-A-MAN"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editGroupCareerId">Carrera *</Label>
          <select
            id="editGroupCareerId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editGroupForm.careerId}
            onChange={(e) => setEditGroupForm({...editGroupForm, careerId: e.target.value})}
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

        <div className="space-y-2">
          <Label htmlFor="editGroupSubjectId">Materia *</Label>
          <select
            id="editGroupSubjectId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editGroupForm.subjectId}
            onChange={(e) => setEditGroupForm({...editGroupForm, subjectId: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Seleccionar materia</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editGroupTeacherId">Docente (Opcional)</Label>
          <select
            id="editGroupTeacherId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editGroupForm.teacherId}
            onChange={(e) => setEditGroupForm({...editGroupForm, teacherId: e.target.value})}
            disabled={loading}
          >
            <option value="">Seleccionar docente</option>
            {users.filter(user => user.role === 'docente').map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editGroupSchedule">Horario</Label>
          <Input
            id="editGroupSchedule"
            value={editGroupForm.schedule}
            onChange={(e) => setEditGroupForm({...editGroupForm, schedule: e.target.value})}
            placeholder="Lunes y Miércoles 8:00-10:00"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editGroupCapacity">Capacidad</Label>
          <Input
            id="editGroupCapacity"
            type="number"
            min="1"
            max="100"
            value={editGroupForm.capacity}
            onChange={(e) => setEditGroupForm({...editGroupForm, capacity: parseInt(e.target.value)})}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editGroupStatus">Estado</Label>
          <select
            id="editGroupStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editGroupForm.status}
            onChange={(e) => setEditGroupForm({...editGroupForm, status: e.target.value})}
            required
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
                Actualizando...
              </>
            ) : 'Actualizar Grupo'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}