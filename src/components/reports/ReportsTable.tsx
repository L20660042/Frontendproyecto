import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Badge } from '../../components/badge';
import { Search, FileText, Download, Eye, Calendar, Trash2, BarChart3 } from 'lucide-react';

interface ReportsTableProps {
  reports: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onGenerateReport: () => void;
  onViewReport: (report: any) => void;
  onDownloadReport: (report: any) => void;
  onDeleteReport: (reportId: string) => void;
  onViewStats: () => void;
}

export default function ReportsTable({
  reports,
  loading,
  searchTerm,
  onSearchChange,
  onGenerateReport,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
  onViewStats
}: ReportsTableProps) {
  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      report.name?.toLowerCase().includes(searchLower) ||
      report.type?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower)
    );
  });

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
      'tutoria': { label: 'Tutorías', variant: 'default' },
      'capacitacion': { label: 'Capacitaciones', variant: 'secondary' },
      'usuarios': { label: 'Usuarios', variant: 'outline' },
      'grupos': { label: 'Grupos', variant: 'success' }, // Usando la nueva variante success
      'materias': { label: 'Materias', variant: 'destructive' },
      'completo': { label: 'Completo', variant: 'default' }
    };
    return types[type] || { label: type, variant: 'outline' };
  };

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
      'completed': { label: 'Completado', variant: 'success' }, // Usando la nueva variante success
      'processing': { label: 'Procesando', variant: 'secondary' },
      'pending': { label: 'Pendiente', variant: 'outline' },
      'failed': { label: 'Fallido', variant: 'destructive' }
    };
    return statuses[status] || { label: status, variant: 'outline' };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Reportes</h2>
          <p className="text-muted-foreground">
            {reports.length} reportes generados en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reportes..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button variant="outline" onClick={onViewStats}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Estadísticas
          </Button>
          <Button onClick={onGenerateReport} disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </Button>
        </div>
      </div>

      {loading && reports.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando reportes...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Nombre</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Tamaño</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron reportes' : 'No hay reportes generados aún'}
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map(report => {
                      const typeInfo = getTypeBadge(report.type);
                      const statusInfo = getStatusBadge(report.status);
                      
                      return (
                        <tr key={report._id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{report.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {report.description || 'Sin descripción'}
                            </div>
                            {report.downloadCount > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                📥 {report.downloadCount} descarga(s)
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant={typeInfo.variant}>
                              {typeInfo.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(report.dataSize || 0)}
                              <div className="text-xs">
                                {report.recordCount || 0} registros
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Ver detalles"
                                onClick={() => onViewReport(report)}
                                disabled={report.status !== 'completed'}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Descargar"
                                onClick={() => onDownloadReport(report)}
                                disabled={report.status !== 'completed'}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                title="Eliminar"
                                onClick={() => onDeleteReport(report._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Formato: {report.format || 'json'}
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