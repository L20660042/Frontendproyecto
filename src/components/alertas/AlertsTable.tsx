import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, PlusCircle, EyeIcon, CheckCircle } from 'lucide-react';

interface Alert {
  _id: string;
  message: string;
  type: string;
  riskLevel: number;
  resolved: boolean;
  student?: { firstName: string; lastName: string; email: string };
  teacher?: { firstName: string; lastName: string; email: string };
  group?: { name: string; code: string };
  createdAt: string;
}

interface AlertsTableProps {
  alerts: Alert[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateAlert: () => void;
  onViewDetails: (alert: Alert) => void;
  onResolveAlert: (alertId: string) => void;
  // Remover onDeleteAlert ya que no se usa
}

export default function AlertsTable({
  alerts,
  loading,
  searchTerm,
  onSearchChange,
  onCreateAlert,
  onViewDetails,
  onResolveAlert
}: AlertsTableProps) {
  
  const getAlertTypeBadge = (type: string) => {
    switch(type) {
      case 'riesgo_academico':
        return { label: 'Riesgo Académico', variant: 'destructive' as const };
      case 'queja':
        return { label: 'Queja', variant: 'warning' as const };
      case 'comportamiento':
        return { label: 'Comportamiento', variant: 'outline' as const };
      default:
        return { label: type, variant: 'default' as const };
    }
  };

  const getRiskBadge = (riskLevel: number) => {
    if (riskLevel >= 0.8) return { label: 'Alto', variant: 'destructive' as const };
    if (riskLevel >= 0.5) return { label: 'Medio', variant: 'warning' as const };
    return { label: 'Bajo', variant: 'success' as const };
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      alert.message.toLowerCase().includes(searchLower) ||
      alert.type.toLowerCase().includes(searchLower) ||
      alert.student?.firstName?.toLowerCase().includes(searchLower) ||
      alert.student?.lastName?.toLowerCase().includes(searchLower) ||
      alert.teacher?.firstName?.toLowerCase().includes(searchLower) ||
      alert.teacher?.lastName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Alertas</h2>
          <p className="text-muted-foreground">
            {alerts.length} alertas en el sistema • {
              alerts.filter(a => !a.resolved).length
            } pendientes
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alertas..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateAlert} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Alerta
          </Button>
        </div>
      </div>

      {loading && alerts.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando alertas...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Mensaje</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">Riesgo</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron alertas' : 'No hay alertas registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => {
                      const typeBadge = getAlertTypeBadge(alert.type);
                      const riskBadge = getRiskBadge(alert.riskLevel);
                      
                      return (
                        <tr key={alert._id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium truncate max-w-xs">{alert.message}</div>
                            {alert.student && (
                              <div className="text-xs text-muted-foreground">
                                Estudiante: {alert.student.firstName} {alert.student.lastName}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant={typeBadge.variant}>
                              {typeBadge.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={riskBadge.variant}>
                              {riskBadge.label} ({Math.round(alert.riskLevel * 100)}%)
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={alert.resolved ? 'success' : 'warning'}>
                              {alert.resolved ? 'Resuelta' : 'Pendiente'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                title="Ver detalles"
                                onClick={() => onViewDetails(alert)}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              {!alert.resolved && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="Marcar como resuelta"
                                  onClick={() => onResolveAlert(alert._id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}