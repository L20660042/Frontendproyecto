import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Textarea } from '../textarea';
import { RefreshCw, AlertTriangle, User, Users } from 'lucide-react';
import { authService } from '../../services/authService';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
  onError: (error: string) => void;
  users?: any[];
  groups?: any[];
}

export default function CreateAlertModal({ 
  isOpen, 
  onClose, 
  onCreate,
  onError,
  users = [],
  groups = []
}: CreateAlertModalProps) {
  const [loading, setLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({
    message: '',
    type: 'riesgo_academico',
    studentId: '',
    teacherId: '',
    groupId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      // Validaciones
      if (!newAlert.message.trim()) {
        onError('El mensaje es obligatorio');
        return;
      }

      // Preparar datos para el backend
      const alertData = {
        message: newAlert.message.trim(),
        type: newAlert.type,
        ...(newAlert.studentId && { student: newAlert.studentId }),
        ...(newAlert.teacherId && { teacher: newAlert.teacherId }),
        ...(newAlert.groupId && { group: newAlert.groupId })
      };

      console.log('📤 Creando alerta:', alertData);

      const result = await authService.createAlert(alertData);
      
      if (result.success || result._id) {
        console.log('✅ Alerta creada exitosamente:', result);
        
        // Resetear formulario
        setNewAlert({
          message: '',
          type: 'riesgo_academico',
          studentId: '',
          teacherId: '',
          groupId: ''
        });
        
        onCreate();
        onClose();
      } else {
        const errorMsg = result.message || result.error || 'Error desconocido al crear alerta';
        onError(`Error: ${errorMsg}`);
      }
      
    } catch (err: any) {
      console.error("❌ Error al crear alerta:", err);
      
      let errorMessage = 'Error al crear alerta';
      if (err.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión con el servidor de IA';
      } else if (err.response?.data) {
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      }
      
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const estudiantes = users.filter(u => u.role === 'estudiante' || u.role === 'student');
  const docentes = users.filter(u => u.role === 'docente' || u.role === 'teacher');

  return (
    <BaseModal 
      title="Crear Nueva Alerta" 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="alertType" className="text-sm font-medium">
            Tipo de Alerta *
          </Label>
          <select
            id="alertType"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={newAlert.type}
            onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
            disabled={loading}
            required
          >
            <option value="riesgo_academico">🎓 Riesgo Académico</option>
            <option value="queja">📝 Queja o Reclamo</option>
            <option value="comportamiento">👥 Comportamiento</option>
            <option value="otro">⚠️ Otro</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alertMessage" className="text-sm font-medium">
            Mensaje / Descripción *
          </Label>
          <Textarea
            id="alertMessage"
            className="w-full min-h-32"
            value={newAlert.message}
            onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
            placeholder="Describe la situación o problema detectado..."
            disabled={loading}
            required
          />
          <p className="text-xs text-muted-foreground">
            Este mensaje será analizado por IA para determinar el nivel de riesgo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alertStudent" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Estudiante (opcional)
            </Label>
            <select
              id="alertStudent"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newAlert.studentId}
              onChange={(e) => setNewAlert({...newAlert, studentId: e.target.value})}
              disabled={loading}
            >
              <option value="">Seleccionar estudiante</option>
              {estudiantes.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertTeacher" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Docente (opcional)
            </Label>
            <select
              id="alertTeacher"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newAlert.teacherId}
              onChange={(e) => setNewAlert({...newAlert, teacherId: e.target.value})}
              disabled={loading}
            >
              <option value="">Seleccionar docente</option>
              {docentes.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertGroup" className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupo (opcional)
            </Label>
            <select
              id="alertGroup"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newAlert.groupId}
              onChange={(e) => setNewAlert({...newAlert, groupId: e.target.value})}
              disabled={loading}
            >
              <option value="">Seleccionar grupo</option>
              {groups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Nota importante:</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Esta alerta será procesada por un sistema de IA que analizará el mensaje 
            y determinará automáticamente el nivel de riesgo (0-100%).
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
            className="px-6 bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Crear Alerta
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}