import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { User, Calendar, FileText, Edit, Download } from 'lucide-react';

interface CapacitacionDetailsModalProps {
  capacitacion: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function CapacitacionDetailsModal({ 
  capacitacion, 
  isOpen, 
  onClose, 
  onEdit 
}: CapacitacionDetailsModalProps) {
  const downloadEvidence = (url: string) => {
    // Simulación de descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'evidencia';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BaseModal title="Detalles de la Capacitación" isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold">{capacitacion.title}</h4>
            <p className="text-muted-foreground">Capacitación registrada</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Docente</Label>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg">{capacitacion.teacherName || 'Desconocido'}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Fecha</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg">{new Date(capacitacion.date).toLocaleDateString()}</p>
            </div>
          </div>
          
          {capacitacion.description && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
              <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-line">
                {capacitacion.description}
              </p>
            </div>
          )}
          
          {capacitacion.observations && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Observaciones / Resultados</Label>
              <p className="mt-1 p-3 bg-blue-50 rounded-md whitespace-pre-line">
                {capacitacion.observations}
              </p>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Evidencias</Label>
            <div className="mt-1">
              {capacitacion.evidence && capacitacion.evidence.length > 0 ? (
                <div className="space-y-2">
                  {capacitacion.evidence.map((file: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadEvidence(file)}
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay evidencias cargadas</p>
              )}
            </div>
          </div>
          
          {capacitacion.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de registro</Label>
              <p className="mt-1">
                {new Date(capacitacion.createdAt).toLocaleDateString()} {new Date(capacitacion.createdAt).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-6">
          <Button 
            onClick={onEdit}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Capacitación
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}