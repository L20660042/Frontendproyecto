import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../../components/badge';
import { Book, Calendar, Edit } from 'lucide-react';

interface SubjectDetailsModalProps {
  subject: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function SubjectDetailsModal({ 
  subject, 
  isOpen, 
  onClose, 
  onEdit 
}: SubjectDetailsModalProps) {
  return (
    <BaseModal title="Detalles de la Materia" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Book className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold">{subject.name}</h4>
            <p className="text-muted-foreground">Código: {subject.code}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Código</Label>
            <p className="text-lg font-mono">{subject.code}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Carrera</Label>
            <Badge variant="outline" className="mt-1">
              {subject.careerName || 'Desconocida'}
            </Badge>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Semestre</Label>
            <p className="text-lg">{subject.semester || 1}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Créditos</Label>
            <p className="text-lg">{subject.credits || 4}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
            <div className="mt-1">
              <Badge 
                variant={subject.status === 'active' ? 'default' : 'destructive'}
                className="text-base px-3 py-1 gap-2"
              >
                {subject.status === 'active' ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>
          
          {subject.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{new Date(subject.createdAt).toLocaleDateString()}</p>
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
            Editar Materia
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}