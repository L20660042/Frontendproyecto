import { useState } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../../components/badge';
import { 
  FileText, Calendar, User, Download, Copy, CheckCircle, 
  AlertCircle, BarChart3, Database, Clock, FileCode, X, Printer, Share2 
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportDetailsModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: string) => void;
  onCopyId: () => void;
}

export default function ReportDetailsModal({
  report,
  isOpen,
  onClose,
  onDownload,
  onCopyId
}: ReportDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const getTypeInfo = (type: string) => {
    const types: Record<string, { 
      label: string; 
      color: string; 
      bgColor: string; 
      icon: React.ReactNode;
      variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' 
    }> = {
      'tutoria': { 
        label: 'Tutorías', 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-100',
        icon: <FileText className="h-5 w-5" />,
        variant: 'default'
      },
      'capacitacion': { 
        label: 'Capacitaciones', 
        color: 'text-green-700', 
        bgColor: 'bg-green-100',
        icon: <FileText className="h-5 w-5" />,
        variant: 'success'
      },
      'usuarios': { 
        label: 'Usuarios', 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-100',
        icon: <User className="h-5 w-5" />,
        variant: 'secondary'
      },
      'grupos': { 
        label: 'Grupos', 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-100',
        icon: <FileText className="h-5 w-5" />,
        variant: 'success'
      },
      'materias': { 
        label: 'Materias', 
        color: 'text-red-700', 
        bgColor: 'bg-red-100',
        icon: <FileText className="h-5 w-5" />,
        variant: 'destructive'
      },
      'completo': { 
        label: 'Completo', 
        color: 'text-indigo-700', 
        bgColor: 'bg-indigo-100',
        icon: <Database className="h-5 w-5" />,
        variant: 'default'
      }
    };
    return types[type] || { 
      label: type, 
      color: 'text-gray-700', 
      bgColor: 'bg-gray-100',
      icon: <FileText className="h-5 w-5" />,
      variant: 'outline'
    };
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { 
      label: string; 
      color: string; 
      bgColor: string; 
      icon: React.ReactNode;
      variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' 
    }> = {
      'completed': { 
        label: 'Completado', 
        color: 'text-green-700', 
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'success'
      },
      'processing': { 
        label: 'Procesando', 
        color: 'text-yellow-700', 
        bgColor: 'bg-yellow-100',
        icon: <Clock className="h-4 w-4" />,
        variant: 'secondary'
      },
      'pending': { 
        label: 'Pendiente', 
        color: 'text-gray-700', 
        bgColor: 'bg-gray-100',
        icon: <Clock className="h-4 w-4" />,
        variant: 'outline'
      },
      'failed': { 
        label: 'Fallido', 
        color: 'text-red-700', 
        bgColor: 'bg-red-100',
        icon: <AlertCircle className="h-4 w-4" />,
        variant: 'destructive'
      }
    };
    return statuses[status] || { 
      label: status, 
      color: 'text-gray-700', 
      bgColor: 'bg-gray-100',
      icon: <AlertCircle className="h-4 w-4" />,
      variant: 'outline'
    };
  };

  const typeInfo = getTypeInfo(report.type);
  const statusInfo = getStatusInfo(report.status);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(report._id);
    setCopied(true);
    onCopyId();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report.name,
        text: `Reporte: ${report.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const hasFilters = report.filters && Object.values(report.filters).some(val => 
    val !== null && val !== undefined && val !== ''
  );



  return (
    <BaseModal 
      title="Detalles del Reporte" 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${typeInfo.bgColor}`}>
              <div className={typeInfo.color}>
                {typeInfo.icon}
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold">{report.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={typeInfo.variant} className="flex items-center gap-1">
                  {typeInfo.icon}
                  <span>{typeInfo.label}</span>
                </Badge>
                <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                  {statusInfo.icon}
                  <span>{statusInfo.label}</span>
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm text-muted-foreground">
              ID: {report._id?.substring(0, 8)}...
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyId}
              className="text-xs h-7 px-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar ID
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de generación
            </Label>
            <p className="text-foreground">{formatDate(report.createdAt)}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Generado por
            </Label>
            <p className="text-foreground">
              {report.generatedBy?.fullName || report.generatedBy?.email || 'Sistema'}
            </p>
          </div>
        </div>

        {/* Descripción */}
        {report.description && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Descripción
            </Label>
            <p className="text-foreground bg-gray-50 p-3 rounded-md">
              {report.description}
            </p>
          </div>
        )}

        {/* Estadísticas y detalles técnicos */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Tamaño
            </Label>
            <div className="text-lg font-semibold">
              {formatFileSize(report.dataSize || 0)}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              Registros
            </Label>
            <div className="text-lg font-semibold">
              {report.recordCount || 0}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Download className="h-4 w-4" />
              Descargas
            </Label>
            <div className="text-lg font-semibold">
              {report.downloadCount || 0}
            </div>
          </div>
        </div>

        {/* Parámetros aplicados */}
        {hasFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Filtros aplicados
            </Label>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {report.filters?.startDate && (
                  <div>
                    <span className="font-medium">Desde:</span> {new Date(report.filters.startDate).toLocaleDateString()}
                  </div>
                )}
                {report.filters?.endDate && (
                  <div>
                    <span className="font-medium">Hasta:</span> {new Date(report.filters.endDate).toLocaleDateString()}
                  </div>
                )}
                {report.filters?.userId && (
                  <div>
                    <span className="font-medium">Usuario ID:</span> {report.filters.userId.substring(0, 8)}...
                  </div>
                )}
                {report.filters?.studentId && (
                  <div>
                    <span className="font-medium">Estudiante ID:</span> {report.filters.studentId.substring(0, 8)}...
                  </div>
                )}
                {report.filters?.groupId && (
                  <div>
                    <span className="font-medium">Grupo ID:</span> {report.filters.groupId.substring(0, 8)}...
                  </div>
                )}
                {report.filters?.subjectId && (
                  <div>
                    <span className="font-medium">Materia ID:</span> {report.filters.subjectId.substring(0, 8)}...
                  </div>
                )}
                {report.filters?.careerId && (
                  <div>
                    <span className="font-medium">Carrera ID:</span> {report.filters.careerId.substring(0, 8)}...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas del reporte */}
        {report.stats && Object.keys(report.stats).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas
            </Label>
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(report.stats).map(([key, value]) => {
                  if (typeof value === 'object') return null;
                  
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className="font-semibold">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Acciones de descarga */}
        <div className="pt-6 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Descargar en formato:
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => onDownload('json')}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
              disabled={report.status !== 'completed'}
            >
              <FileCode className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">JSON</div>
                <div className="text-xs text-muted-foreground">Estructurado</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => onDownload('csv')}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
              disabled={report.status !== 'completed'}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">CSV</div>
                <div className="text-xs text-muted-foreground">Tabular</div>
              </div>
            </Button>

            <Button 
              onClick={handlePrint}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <Printer className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Imprimir</div>
                <div className="text-xs text-muted-foreground">Vista previa</div>
              </div>
            </Button>

            <Button 
              onClick={handleShare}
              variant="outline"
              className="flex items-center justify-center gap-2 h-12"
            >
              <Share2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Compartir</div>
                <div className="text-xs text-muted-foreground">Enlace</div>
              </div>
            </Button>
          </div>
          
          {report.status !== 'completed' && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {report.status === 'processing' 
                ? 'El reporte se está generando. Vuelve a intentarlo en unos momentos.' 
                : 'Este reporte no está disponible para descarga.'}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>Formato: <span className="font-medium">{report.format?.toUpperCase() || 'JSON'}</span></p>
          <p className="mt-1">Última actualización: {formatDate(report.updatedAt || report.createdAt)}</p>
          <p className="mt-1">
            Estado: <Badge variant="outline" className="ml-1 text-xs">
              {report.status === 'completed' ? '✅ Listo' : '⏳ Procesando'}
            </Badge>
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cerrar
          </Button>
          <Button
            onClick={() => onDownload(report.format || 'json')}
            disabled={report.status !== 'completed'}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}