import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Textarea } from '../textarea';
import { RefreshCw } from 'lucide-react';

interface EditCapacitacionModalProps {
  capacitacion: any;
  teachers: any[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (capacitacionData: any) => Promise<void>; // CAMBIADO
  onError: (error: string) => void;
}

export default function EditCapacitacionModal({ 
  capacitacion, 
  teachers, 
  isOpen, 
  onClose, 
  onUpdate,
  onError 
}: EditCapacitacionModalProps) {
  const [loading, setLoading] = useState(false);
  const [editCapacitacion, setEditCapacitacion] = useState({
    title: '',
    teacher: '',
    date: '',
    description: '',
    observations: '',
    evidence: [] as string[]
  });

  useEffect(() => {
    if (capacitacion) {
      setEditCapacitacion({
        title: capacitacion.title || '',
        teacher: capacitacion.teacherId || capacitacion.teacher?._id || '',
        date: capacitacion.date ? new Date(capacitacion.date).toISOString().split('T')[0] : '',
        description: capacitacion.description || '',
        observations: capacitacion.observations || '',
        evidence: capacitacion.evidence || []
      });
    }
  }, [capacitacion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!editCapacitacion.title || !editCapacitacion.teacher || !editCapacitacion.date) {
        onError('Título, docente y fecha son obligatorios');
        return;
      }

      // Llama a la función del padre pasando los datos
      await onUpdate(editCapacitacion);
      
      // Si llegamos aquí, el padre manejó la actualización exitosamente
      onClose(); // Cierra el modal solo si todo salió bien
      
    } catch (err: any) {
      // El error ya fue manejado por el padre (SuperAdminDashboard)
      console.log("Modal cerrado después de error manejado por el padre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Editar Capacitación" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="editCapacitacionTitle">Título *</Label>
          <Input
            id="editCapacitacionTitle"
            value={editCapacitacion.title}
            onChange={(e) => setEditCapacitacion({...editCapacitacion, title: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCapacitacionTeacher">Docente *</Label>
          <select
            id="editCapacitacionTeacher"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={editCapacitacion.teacher}
            onChange={(e) => setEditCapacitacion({...editCapacitacion, teacher: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Seleccionar docente</option>
            {teachers.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCapacitacionDate">Fecha *</Label>
          <Input
            id="editCapacitacionDate"
            type="date"
            value={editCapacitacion.date}
            onChange={(e) => setEditCapacitacion({...editCapacitacion, date: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCapacitacionDescription">Descripción</Label>
          <Textarea
            id="editCapacitacionDescription"
            value={editCapacitacion.description}
            onChange={(e) => setEditCapacitacion({...editCapacitacion, description: e.target.value})}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editCapacitacionObservations">Observaciones / Resultados</Label>
          <Textarea
            id="editCapacitacionObservations"
            value={editCapacitacion.observations}
            onChange={(e) => setEditCapacitacion({...editCapacitacion, observations: e.target.value})}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Evidencias ({editCapacitacion.evidence.length} archivos)</Label>
          {editCapacitacion.evidence.length > 0 ? (
            <div className="space-y-2">
              {editCapacitacion.evidence.map((file, index) => (
                <div key={index} className="p-2 border rounded text-sm">
                  {file}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay evidencias cargadas</p>
          )}
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
            ) : 'Actualizar Capacitación'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}