import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

interface CreateGroupModalProps {
  careers: any[];
  subjects: any[];
  users: any[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  onError: (error: string) => void;
}

export default function CreateGroupModal({ 
  careers, 
  subjects, 
  users, 
  isOpen, 
  onClose, 
  onCreate,
  onError 
}: CreateGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    code: '',
    careerId: '',
    subjectId: '',
    teacherId: '',
    schedule: '',
    capacity: 30,
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!newGroup.name || !newGroup.code || !newGroup.careerId || !newGroup.subjectId) {
        onError('Nombre, código, carrera y materia son obligatorios');
        return;
      }

      const result = await authService.createGroup(newGroup);
      
      if (result.success || result._id || result.id || result.data) {
        onCreate();
        onClose();
        setNewGroup({
          name: '',
          code: '',
          careerId: '',
          subjectId: '',
          teacherId: '',
          schedule: '',
          capacity: 30,
          status: 'active'
        });
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear grupo';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear grupo:", err);
      let errorMessage = 'Error al crear grupo: ' + (err.message || 'Error desconocido');
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Crear Nuevo Grupo" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groupName">Nombre *</Label>
          <Input
            id="groupName"
            value={newGroup.name}
            onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
            required
            placeholder="Grupo A - Mañana"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupCode">Código *</Label>
          <Input
            id="groupCode"
            value={newGroup.code}
            onChange={(e) => setNewGroup({...newGroup, code: e.target.value})}
            required
            placeholder="GRP-A-MAN"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupCareerId">Carrera *</Label>
          <select
            id="groupCareerId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newGroup.careerId}
            onChange={(e) => setNewGroup({...newGroup, careerId: e.target.value})}
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
          <Label htmlFor="groupSubjectId">Materia *</Label>
          <select
            id="groupSubjectId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newGroup.subjectId}
            onChange={(e) => setNewGroup({...newGroup, subjectId: e.target.value})}
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
          <Label htmlFor="groupTeacherId">Docente (Opcional)</Label>
          <select
            id="groupTeacherId"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newGroup.teacherId}
            onChange={(e) => setNewGroup({...newGroup, teacherId: e.target.value})}
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
          <Label htmlFor="groupSchedule">Horario</Label>
          <Input
            id="groupSchedule"
            value={newGroup.schedule}
            onChange={(e) => setNewGroup({...newGroup, schedule: e.target.value})}
            placeholder="Lunes y Miércoles 8:00-10:00"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupCapacity">Capacidad</Label>
          <Input
            id="groupCapacity"
            type="number"
            min="1"
            max="100"
            value={newGroup.capacity}
            onChange={(e) => setNewGroup({...newGroup, capacity: parseInt(e.target.value)})}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="groupStatus">Estado</Label>
          <select
            id="groupStatus"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newGroup.status}
            onChange={(e) => setNewGroup({...newGroup, status: e.target.value})}
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
                Creando...
              </>
            ) : 'Crear Grupo'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}