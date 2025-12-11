import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { 
  Search, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Calendar,
  EyeIcon,
  CheckCircle,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExcelTableProps {
  uploads: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUploadNew: () => void;
  onViewDetails: (upload: any) => void;
  onDownloadResult: (uploadId: string) => void;
}

export default function ExcelTable({
  uploads,
  loading,
  searchTerm,
  onSearchChange,
  onUploadNew,
  onViewDetails,
  onDownloadResult
}: ExcelTableProps) {
  
  const filteredUploads = uploads.filter(upload => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      upload.filename?.toLowerCase().includes(searchLower) ||
      upload.status?.toLowerCase().includes(searchLower) ||
      upload.user?.name?.toLowerCase().includes(searchLower) ||
      upload.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" /> 
            Completado
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> 
            Procesando
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> 
            Fallido
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> 
            Parcial
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || 'Desconocido'}</Badge>;
    }
  };

  const getTotalRecords = (upload: any) => {
    if (!upload.details) return 0;
    return Object.values(upload.details).reduce((total: number, sheet: any) => {
      return total + (sheet.created || 0) + (sheet.updated || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Historial de Importaciones</h2>
          <p className="text-muted-foreground">
            Registro de todas las importaciones masivas realizadas
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar importaciones..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onUploadNew} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            Nueva Importación
          </Button>
        </div>
      </div>

      {loading && uploads.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando importaciones...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Archivo</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Registros</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Usuario</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUploads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron importaciones' : 'No hay importaciones registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredUploads.map(upload => (
                      <tr key={upload._id || upload.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate max-w-xs">{upload.filename || 'Sin nombre'}</div>
                              <div className="text-xs text-muted-foreground">
                                {upload.filesize ? `${(upload.filesize / 1024 / 1024).toFixed(2)} MB` : 'Tamaño no disponible'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(upload.createdAt || upload.date)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-center">
                            <span className="font-medium">{getTotalRecords(upload)}</span>
                            <div className="text-xs text-muted-foreground">
                              registros
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(upload.status)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {upload.user?.name || 'Sistema'}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {upload.user?.email || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Ver detalles"
                              onClick={() => onViewDetails(upload)}
                              className="h-8 w-8 p-0"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Descargar reporte"
                              onClick={() => onDownloadResult(upload._id || upload.id)}
                              disabled={!upload._id || upload.status === 'processing'}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de paginación o conteo */}
      {filteredUploads.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredUploads.length} de {uploads.length} importaciones
        </div>
      )}
    </div>
  );
}