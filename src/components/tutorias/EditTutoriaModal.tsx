import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Textarea } from './textarea';
import { RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

interface EditTutoriaModalProps {
  tutoria: any;
  users: any[];
  groups: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onError: (error: string) => void;
}

export default function EditTutoriaModal({ 
  tutoria, 
  users, 
  groups, 
  isOpen, 
  onClose, 
  onUpdate,
  onError 
}: EditTutoriaModalProps) {
  const [loading, setLoading] = useState(false);
  const [editTutoria, setEditTutoria] = useState({
    tutorId: '',
    studentId: '',
    groupId: '',
    date: '',
    topics: '',
    agreements: '',
    observations: '',
    riskDetected: false
  });

  useEffect(() => {
    if (tutoria) {
      setEditTutoria({
        tutorId: tutoria.tutorId || tutoria.tutor?._id || '',
        studentId: tutoria.studentId || tutoria.student?._id || '',
        groupId: tutoria.groupId || tutoria.group?._id || '',
        date: tutoria.date ? new Date(tutoria.date).toISOString().split('T')[0] : '',
        topics: tutoria.topics || '',
        agreements: tutoria.agreements || '',
        observations: tutoria.observations || '',
        riskDetected: tutoria.riskDetected || false
      });
    }
  }, [tutoria]);

  // Filtrar usuarios por rol
  const tutors = users.filter(user => 
    user.role === 'docente' || 
    user.role === 'tutor' || 
    user.role === 'teacher'
  );
  
  const students = users.filter(user => 
    user.role === 'estudiante' || 
    user.role === 'student'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!editTutoria.tutorId || !editTutoria.studentId || !editTutoria.groupId || !editTutoria.date) {
        onError('Tutor, estudiante, grupo y fecha son obligatorios');
        return;
      }

      const result = await authService.updateTutoria(tutoria._id, editTutoria);
      
      if (result.success || result._id || result.id || result.data) {
        onUpdate();
        onClose();
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al actualizar tutoría';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al actualizar tutoría:", err);
      let errorMessage = 'Error al actualizar tutoría: ' + (err.message || 'Error desconocido');
      
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
    <BaseModal title="Editar Tutoría" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editTutoriaTutor">Tutor *</Label>
          <select
            id="editTutoriaTutor"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editTutoria.tutorId}
            onChange={(e) => setEditTutoria({...editTutoria, tutorId: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Seleccionar tutor</option>
            {tutors.map(tutor => (
              <option key={tutor._id} value={tutor._id}>
                {tutor.firstName} {tutor.lastName} ({tutor.role})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editTutoriaStudent">Estudiante *</Label>
          <select
            id="editTutoriaStudent"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editTutoria.studentId}
            onChange={(e) => setEditTutoria({...editTutoria, studentId: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Seleccionar estudiante</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editTutoriaGroup">Grupo *</Label>
          <select
            id="editTutoriaGroup"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editTutoria.groupId}
            onChange={(e) => setEditTutoria({...editTutoria, groupId: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Seleccionar grupo</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>
                {group.name} - {group.subjectName} ({group.careerName})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editTutoriaDate">Fecha *</Label>
          <Input
            id="editTutoriaDate"
            type="date"
            value={editTutoria.date}
            onChange={(e) => setEditTutoria({...editTutoria, date: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editTutoriaTopics">Temas Tratados</Label>
          <Textarea
            id="editTutoriaTopics"
            value={editTutoria.topics}
            onChange={(e) => setEditTutoria({...editTutoria, topics: e.target.value})}
            placeholder="Describa los temas tratados en la tutoría..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editTutoriaAgreements">Acuerdos</Label>
          <Textarea
            id="editTutoriaAgreements"
            value={editTutoria.agreements}
            onChange={(e) => setEditTutoria({...editTutoria, agreements: e.target.value})}
            placeholder="Describa los acuerdos tomados..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editTutoriaObservations">Observaciones</Label>
          <Textarea
            id="editTutoriaObservations"
            value={editTutoria.observations}
            onChange={(e) => setEditTutoria({...editTutoria, observations: e.target.value})}
            placeholder="Observaciones adicionales..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="editTutoriaRiskDetected"
              checked={editTutoria.riskDetected}
              onChange={(e) => setEditTutoria({...editTutoria, riskDetected: e.target.checked})}
              disabled={loading}
              className="rounded border-gray-300"
            />
            <Label htmlFor="editTutoriaRiskDetected" className="cursor-pointer">
              Detección de riesgo académico
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Marque esta opción si se detectó algún riesgo académico durante la tutoría
          </p>
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
            ) : 'Actualizar Tutoría'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}