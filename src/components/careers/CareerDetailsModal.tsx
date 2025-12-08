import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../../components/badge';
import { GraduationCap, Clock, Calendar, Edit, CheckCircle, XCircle } from 'lucide-react';

interface CareerDetailsModalProps {
  career: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus?: () => void; 
}

export default function CareerDetailsModal({ 
  career, 
  isOpen, 
  onClose, 
  onEdit 
}: CareerDetailsModalProps) {
  return (
    <BaseModal title="Detalles de la Carrera" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold">{career.name}</h4>
            <p className="text-muted-foreground">Código: {career.code}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Código</Label>
            <p className="text-lg font-mono">{career.code}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
            <div className="mt-1">
              <Badge 
                variant={career.status === 'active' ? 'default' : 'destructive'}
                className="text-base px-3 py-1 gap-2"
              >
                {career.status === 'active' ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Activa
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Inactiva
                  </>
                )}
              </Badge>
            </div>
          </div>
          
          {career.description && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
              <p className="mt-1 text-foreground">{career.description}</p>
            </div>
          )}
          
          {career.duration && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Duración</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p>{career.duration} semestres</p>
              </div>
            </div>
          )}
          
          {career.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{new Date(career.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-6">
          <Button 
            onClick={onEdit}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Carrera
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}