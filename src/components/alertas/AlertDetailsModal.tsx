import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Badge } from '../../components/badge';
import { Label } from '../label';
import { 
  User, 
  Users, 
  Calendar, 
  CheckCircle} from 'lucide-react';

interface AlertDetailsModalProps {
  alert: any;
  isOpen: boolean;
  onClose: () => void;
  onResolve: () => void;
}

export default function AlertDetailsModal({ 
  alert, 
  isOpen, 
  onClose,
  onResolve
}: AlertDetailsModalProps) {
  
  const getRiskColor = (riskLevel: number) => {
    if (riskLevel >= 0.8) return 'text-red-600 bg-red-100';
    if (riskLevel >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'riesgo_academico': return '🎓';
      case 'queja': return '📝';
      case 'comportamiento': return '👥';
      default: return '⚠️';
    }
  };

  return (
    <BaseModal 
      title="Detalles de la Alerta" 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
    >
      <div className="space-y-6">
        {/* Header con tipo y riesgo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getTypeIcon(alert.type)}</div>
            <div>
              <h3 className="text-lg font-semibold">
                {alert.type === 'riesgo_academico' ? 'Riesgo Académico' :
                 alert.type === 'queja' ? 'Queja o Reclamo' :
                 alert.type === 'comportamiento' ? 'Problema de Comportamiento' : 'Alerta General'}
              </h3>
              <p className="text-sm text-muted-foreground">ID: {alert._id?.substring(0, 8)}...</p>
            </div>
          </div>
          <Badge variant={alert.resolved ? 'success' : 'destructive'}>
            {alert.resolved ? 'Resuelta' : 'Pendiente'}
          </Badge>
        </div>

        {/* Mensaje principal */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Mensaje</Label>
          <div className="p-3 bg-muted rounded-md">
            <p className="text-foreground">{alert.message}</p>
          </div>
        </div>

        {/* Información de riesgo */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Nivel de Riesgo (IA)</Label>
            <div className="mt-2 flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full ${getRiskColor(alert.riskLevel)} font-bold`}>
                {Math.round(alert.riskLevel * 100)}%
              </div>
              <div>
                <div className="font-medium">
                  {alert.riskLevel >= 0.8 ? 'Alto' : 
                   alert.riskLevel >= 0.5 ? 'Medio' : 'Bajo'}
                </div>
                <div className="text-xs text-muted-foreground">Calculado por IA</div>
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                alert.riskLevel >= 0.8 ? 'bg-red-600' :
                alert.riskLevel >= 0.5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${alert.riskLevel * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Información relacionada */}
        <div className="grid grid-cols-2 gap-4">
          {alert.student && (
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Estudiante
              </Label>
              <div className="p-2 bg-muted rounded-md">
                <p className="font-medium">{alert.student.firstName} {alert.student.lastName}</p>
                <p className="text-sm text-muted-foreground">{alert.student.email}</p>
              </div>
            </div>
          )}

          {alert.teacher && (
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Docente
              </Label>
              <div className="p-2 bg-muted rounded-md">
                <p className="font-medium">{alert.teacher.firstName} {alert.teacher.lastName}</p>
              </div>
            </div>
          )}

          {alert.group && (
            <div className="col-span-2 space-y-1">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Grupo
              </Label>
              <div className="p-2 bg-muted rounded-md">
                <p className="font-medium">{alert.group.name}</p>
                <p className="text-sm text-muted-foreground">Código: {alert.group.code}</p>
              </div>
            </div>
          )}
        </div>

        {/* Metadatos */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Creada
            </Label>
            <p>{new Date(alert.createdAt).toLocaleString()}</p>
          </div>
          
          {alert.updatedAt && (
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Actualizada
              </Label>
              <p>{new Date(alert.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        {!alert.resolved && (
          <div className="pt-6 border-t">
            <Button 
              onClick={onResolve}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Resuelta
            </Button>
          </div>
        )}
      </div>
    </BaseModal>
  );
}