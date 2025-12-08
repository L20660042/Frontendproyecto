import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Textarea } from './textarea';
import { RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

interface CreateTutoriaModalProps {
  users: any[];
  groups: any[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  onError: (error: string) => void;
}

export default function CreateTutoriaModal({ 
  users, 
  groups, 
  isOpen, 
  onClose, 
  onCreate,
  onError 
}: CreateTutoriaModalProps) {
  const [loading, setLoading] = useState(false);
  const [newTutoria, setNewTutoria] = useState({
    tutorId: '',
    studentId: '',
    groupId: '',
    date: new Date().toISOString().split('T')[0],
    topics: '',
    agreements: '',
    observations: '',
    riskDetected: false
  });

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

      if (!newTutoria.tutorId || !newTutoria.studentId || !newTutoria.groupId || !newTutoria.date) {
        onError('Tutor, estudiante, grupo y fecha son obligatorios');
        return;
      }

      const result = await authService.createTutoria(newTutoria);
      
      if (result.success || result._id || result.id || result.data) {
        onCreate();
        onClose();
        // Resetear formulario
        setNewTutoria({
          tutorId: '',
          studentId: '',
          groupId: '',
          date: new Date().toISOString().split('T')[0],
          topics: '',
          agreements: '',
          observations: '',
          riskDetected: false
        });
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear tutoría';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear tutoría:", err);
      let errorMessage = 'Error al crear tutoría: ' + (err.message || 'Error desconocido');
      
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
    <BaseModal title="Crear Nueva Tutoría" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tutoriaTutor">Tutor *</Label>
          <select
            id="tutoriaTutor"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newTutoria.tutorId}
            onChange={(e) => setNewTutoria({...newTutoria, tutorId: e.target.value})}
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
          <Label htmlFor="tutoriaStudent">Estudiante *</Label>
          <select
            id="tutoriaStudent"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newTutoria.studentId}
            onChange={(e) => setNewTutoria({...newTutoria, studentId: e.target.value})}
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
          <Label htmlFor="tutoriaGroup">Grupo *</Label>
          <select
            id="tutoriaGroup"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newTutoria.groupId}
            onChange={(e) => setNewTutoria({...newTutoria, groupId: e.target.value})}
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
          <Label htmlFor="tutoriaDate">Fecha *</Label>
          <Input
            id="tutoriaDate"
            type="date"
            value={newTutoria.date}
            onChange={(e) => setNewTutoria({...newTutoria, date: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tutoriaTopics">Temas Tratados</Label>
          <Textarea
            id="tutoriaTopics"
            value={newTutoria.topics}
            onChange={(e) => setNewTutoria({...newTutoria, topics: e.target.value})}
            placeholder="Describa los temas tratados en la tutoría..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tutoriaAgreements">Acuerdos</Label>
          <Textarea
            id="tutoriaAgreements"
            value={newTutoria.agreements}
            onChange={(e) => setNewTutoria({...newTutoria, agreements: e.target.value})}
            placeholder="Describa los acuerdos tomados..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tutoriaObservations">Observaciones</Label>
          <Textarea
            id="tutoriaObservations"
            value={newTutoria.observations}
            onChange={(e) => setNewTutoria({...newTutoria, observations: e.target.value})}
            placeholder="Observaciones adicionales..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tutoriaRiskDetected"
              checked={newTutoria.riskDetected}
              onChange={(e) => setNewTutoria({...newTutoria, riskDetected: e.target.checked})}
              disabled={loading}
              className="rounded border-gray-300"
            />
            <Label htmlFor="tutoriaRiskDetected" className="cursor-pointer">
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
                Creando...
              </>
            ) : 'Crear Tutoría'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}