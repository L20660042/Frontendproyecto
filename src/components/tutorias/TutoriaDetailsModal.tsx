import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../../components/badge';
import { User, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface TutoriaDetailsModalProps {
  tutoria: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function TutoriaDetailsModal({ 
  tutoria, 
  isOpen, 
  onClose, 
  onEdit 
}: TutoriaDetailsModalProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <BaseModal title="Detalles de la Tutoría" isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Encabezado con info básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tutor</Label>
                <p className="text-lg font-medium">{tutoria.tutorName || 'Sin asignar'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estudiante</Label>
                <p className="text-lg font-medium">{tutoria.studentName || 'Desconocido'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Grupo</Label>
            <Badge variant="outline" className="mt-1 text-base px-3 py-1">
              {tutoria.groupName || 'Desconocido'}
            </Badge>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Fecha de la Tutoría</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg">{formatDate(tutoria.date)}</p>
            </div>
          </div>
          
          {tutoria.topics && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Temas Tratados</Label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="whitespace-pre-line">{tutoria.topics}</p>
              </div>
            </div>
          )}
          
          {tutoria.agreements && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Acuerdos</Label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="whitespace-pre-line">{tutoria.agreements}</p>
              </div>
            </div>
          )}
          
          {tutoria.observations && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="whitespace-pre-line">{tutoria.observations}</p>
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Estado de Riesgo</Label>
            <div className="mt-1">
              {tutoria.riskDetected ? (
                <Badge variant="destructive" className="gap-2 text-base px-3 py-1">
                  <AlertCircle className="h-4 w-4" />
                  Riesgo Académico Detectado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-2 text-base px-3 py-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sin Riesgo Detectado
                </Badge>
              )}
            </div>
          </div>
          
          {tutoria.followUps && tutoria.followUps.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Seguimientos / Canalizaciones</Label>
              <div className="mt-2 space-y-2">
                {tutoria.followUps.map((followUp: string, index: number) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm">{followUp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {tutoria.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Registrado el</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateTime(tutoria.createdAt)}
              </p>
            </div>
          )}
        </div>
        
        <div className="pt-6">
          <Button 
            onClick={onEdit}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Editar Tutoría
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}