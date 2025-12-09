import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Textarea } from '../textarea';
import { RefreshCw, Upload } from 'lucide-react';

interface CreateCapacitacionModalProps {
  teachers: any[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: (capacitacionData: any) => Promise<void>; // CAMBIADO
  onError: (error: string) => void;
}

export default function CreateCapacitacionModal({ 
  teachers, 
  isOpen, 
  onClose, 
  onCreate,
  onError 
}: CreateCapacitacionModalProps) {
  const [loading, setLoading] = useState(false);
  const [newCapacitacion, setNewCapacitacion] = useState({
    title: '',
    teacher: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    observations: '',
    evidence: [] as string[]
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      setNewCapacitacion({
        ...newCapacitacion,
        evidence: [...newCapacitacion.evidence, ...selectedFiles.map(f => f.name)]
      });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newEvidence = [...newCapacitacion.evidence];
    newEvidence.splice(index, 1);
    setNewCapacitacion({ ...newCapacitacion, evidence: newEvidence });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      onError('');

      if (!newCapacitacion.title || !newCapacitacion.teacher || !newCapacitacion.date) {
        onError('Título, docente y fecha son obligatorios');
        return;
      }

      // Llama a la función del padre pasando los datos
      await onCreate(newCapacitacion);
      
      // Si llegamos aquí, el padre manejó la creación exitosamente
      // Reset form
      setNewCapacitacion({
        title: '',
        teacher: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        observations: '',
        evidence: []
      });
      setFiles([]);
      onClose(); // Cierra el modal solo si todo salió bien
      
    } catch (err: any) {
      // El error ya fue manejado por el padre (SuperAdminDashboard)
      // Solo cerramos el modal si el padre lo pidió
      console.log("Modal cerrado después de error manejado por el padre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal title="Crear Nueva Capacitación" isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="capacitacionTitle">Título *</Label>
          <Input
            id="capacitacionTitle"
            value={newCapacitacion.title}
            onChange={(e) => setNewCapacitacion({...newCapacitacion, title: e.target.value})}
            required
            placeholder="Taller de Metodologías Activas"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacitacionTeacher">Docente *</Label>
          <select
            id="capacitacionTeacher"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            value={newCapacitacion.teacher}
            onChange={(e) => setNewCapacitacion({...newCapacitacion, teacher: e.target.value})}
            required
            disabled={loading}
          >
            <option value="">Seleccionar docente</option>
            {teachers.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName} ({teacher.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacitacionDate">Fecha *</Label>
          <Input
            id="capacitacionDate"
            type="date"
            value={newCapacitacion.date}
            onChange={(e) => setNewCapacitacion({...newCapacitacion, date: e.target.value})}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacitacionDescription">Descripción</Label>
          <Textarea
            id="capacitacionDescription"
            value={newCapacitacion.description}
            onChange={(e) => setNewCapacitacion({...newCapacitacion, description: e.target.value})}
            placeholder="Descripción del taller, objetivos, contenido..."
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacitacionObservations">Observaciones / Resultados</Label>
          <Textarea
            id="capacitacionObservations"
            value={newCapacitacion.observations}
            onChange={(e) => setNewCapacitacion({...newCapacitacion, observations: e.target.value})}
            placeholder="Observaciones, resultados, comentarios..."
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacitacionEvidence">Evidencias (Opcional)</Label>
          <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
            <Input
              id="capacitacionEvidence"
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
            />
            <label htmlFor="capacitacionEvidence" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Arrastra archivos o haz click para subir
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos soportados: PDF, DOC, JPG, PNG
              </p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Archivos seleccionados:</p>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
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
                Creando...
              </>
            ) : 'Crear Capacitación'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}