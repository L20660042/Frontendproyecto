import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../../components/badge';
import { UsersIcon, Clock, Calendar, Edit } from 'lucide-react';

interface GroupDetailsModalProps {
  group: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function GroupDetailsModal({ 
  group, 
  isOpen, 
  onClose, 
  onEdit 
}: GroupDetailsModalProps) {
  return (
    <BaseModal title="Detalles del Grupo" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <UsersIcon className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold">{group.name}</h4>
            <p className="text-muted-foreground">Código: {group.code}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Código</Label>
            <p className="text-lg font-mono">{group.code}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Carrera</Label>
            <Badge variant="outline" className="mt-1">
              {group.careerName || 'Desconocida'}
            </Badge>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Materia</Label>
            <Badge variant="outline" className="mt-1">
              {group.subjectName || 'Desconocida'}
            </Badge>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Docente</Label>
            <p className="mt-1">{group.teacherName || 'Sin asignar'}</p>
          </div>
          
          {group.schedule && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Horario</Label>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p>{group.schedule}</p>
              </div>
            </div>
          )}
          
          {group.capacity && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Capacidad</Label>
              <p className="text-lg">{group.capacity} estudiantes</p>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
            <div className="mt-1">
              <Badge 
                variant={group.status === 'active' ? 'default' : 'destructive'}
                className="text-base px-3 py-1 gap-2"
              >
                {group.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
          
          {group.createdAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{new Date(group.createdAt).toLocaleDateString()}</p>
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
            Editar Grupo
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}