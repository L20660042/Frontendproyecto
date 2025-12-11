import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Input } from '../input';
import { 
  Search, FileText, Download, Eye, Calendar, 
  Filter, BarChart3, Users, BookOpen, RefreshCw 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'; 

interface ReporteDocente {
  _id: string;
  name: string;
  type: 'academic' | 'attendance' | 'risk' | 'tutoring' | 'general';
  format: 'pdf' | 'excel' | 'json';
  status: 'completed' | 'processing' | 'failed';
  date: string;
  dataSize: number;
  downloadCount: number;
  filters?: {
    grupo?: string;
    materia?: string;
    fechaInicio?: string;
    fechaFin?: string;
  };
}

interface ReportesTableProps {
  userId: string;
  onGenerateReport: (type: string) => void;
}

export default function ReportesTable({ onGenerateReport }: ReportesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reports, setReports] = useState<ReporteDocente[]>([
    // Datos de ejemplo
    {
      _id: '1',
      name: 'Reporte de Rendimiento - Matemáticas I',
      type: 'academic',
      format: 'pdf',
      status: 'completed',
      date: '2024-01-15',
      dataSize: 2456,
      downloadCount: 3,
      filters: { materia: 'Matemáticas I' }
    },
    {
      _id: '2',
      name: 'Asistencia General - Grupo A202',
      type: 'attendance',
      format: 'excel',
      status: 'completed',
      date: '2024-01-10',
      dataSize: 1890,
      downloadCount: 1,
      filters: { grupo: 'A202' }
    },
    {
      _id: '3',
      name: 'Análisis de Riesgo Académico',
      type: 'risk',
      format: 'pdf',
      status: 'processing',
      date: '2024-01-20',
      dataSize: 0,
      downloadCount: 0
    },
  ]);

  const filteredReports = reports
    .filter(reporte => {
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return reporte.name.toLowerCase().includes(searchLower);
      }
      return true;
    })
    .filter(reporte => {
      // Filtro por tipo
      if (filterType !== 'all') {
        return reporte.type === filterType;
      }
      return true;
    })
    .filter(reporte => {
      // Filtro por formato
      if (filterFormat !== 'all') {
        return reporte.format === filterFormat;
      }
      return true;
    })
    .filter(reporte => {
      // Filtro por estado
      if (filterStatus !== 'all') {
        return reporte.status === filterStatus;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'attendance': return 'bg-green-100 text-green-800 border-green-200';
      case 'risk': return 'bg-red-100 text-red-800 border-red-200';
      case 'tutoring': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'academic': return 'Rendimiento';
      case 'attendance': return 'Asistencia';
      case 'risk': return 'Riesgo';
      case 'tutoring': return 'Tutorías';
      default: return 'General';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGenerateReport = (type: string) => {
    // Agregar reporte de ejemplo
    const newReport: ReporteDocente = {
      _id: Date.now().toString(),
      name: `Nuevo Reporte ${type} - ${new Date().toLocaleDateString()}`,
      type: type as any,
      format: 'pdf',
      status: 'processing',
      date: new Date().toISOString(),
      dataSize: 0,
      downloadCount: 0
    };
    
    setReports([newReport, ...reports]);
    onGenerateReport(type);
    
    // Simular procesamiento
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r._id === newReport._id 
          ? { ...r, status: 'completed', dataSize: 1500 + Math.random() * 1000 }
          : r
      ));
    }, 2000);
  };

  const handleDownloadReport = (reportId: string) => {
    setReports(prev => prev.map(r => 
      r._id === reportId 
        ? { ...r, downloadCount: r.downloadCount + 1 }
        : r
    ));
    // Aquí iría la lógica real de descarga
    alert(`Descargando reporte ${reportId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Mis Reportes</CardTitle>
              <CardDescription>Genera y descarga reportes de tus grupos</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Botones de generación rápida */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Generar Nuevo Reporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => handleGenerateReport('academic')}
              >
                <BarChart3 className="h-8 w-8" />
                <span>Rendimiento Académico</span>
                <span className="text-sm font-normal">Calificaciones por materia</span>
              </Button>
              
              <Button 
                className="h-auto py-4 flex-col gap-2"
                variant="outline"
                onClick={() => handleGenerateReport('attendance')}
              >
                <Calendar className="h-8 w-8" />
                <span>Reporte de Asistencia</span>
                <span className="text-sm font-normal">Porcentajes por grupo</span>
              </Button>
              
              <Button 
                className="h-auto py-4 flex-col gap-2"
                variant="outline"
                onClick={() => handleGenerateReport('risk')}
              >
                <Users className="h-8 w-8" />
                <span>Estudiantes en Riesgo</span>
                <span className="text-sm font-normal">Identificación temprana</span>
              </Button>
              
              <Button 
                className="h-auto py-4 flex-col gap-2"
                variant="outline"
                onClick={() => handleGenerateReport('tutoring')}
              >
                <BookOpen className="h-8 w-8" />
                <span>Registro de Tutorías</span>
                <span className="text-sm font-normal">Sesiones realizadas</span>
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Tipo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  Todos los tipos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('academic')}>
                  Rendimiento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('attendance')}>
                  Asistencia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('risk')}>
                  Riesgo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('tutoring')}>
                  Tutorías
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Formato
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterFormat('all')}>
                  Todos los formatos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterFormat('pdf')}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterFormat('excel')}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterFormat('json')}>
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Completados
              </Button>
              <Button
                variant={filterStatus === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('processing')}
              >
                Procesando
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterFormat('all');
                setFilterStatus('all');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron reportes</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' || filterFormat !== 'all' || filterStatus !== 'all'
                  ? 'Intenta con otros términos de búsqueda o filtros'
                  : 'Genera tu primer reporte usando los botones arriba'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Reporte</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Descargas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((reporte) => (
                    <TableRow key={reporte._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <div>{reporte.name}</div>
                            {reporte.filters && (
                              <div className="text-xs text-muted-foreground">
                                {Object.entries(reporte.filters).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getTypeColor(reporte.type)} border`}>
                          {getTypeText(reporte.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reporte.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(reporte.date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatFileSize(reporte.dataSize)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span className="text-sm">{reporte.downloadCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(reporte.status)} border`}
                        >
                          {getStatusText(reporte.status)}
                          {reporte.status === 'processing' && (
                            <div className="ml-2 inline-block h-2 w-2 animate-ping rounded-full bg-yellow-600"></div>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {reporte.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleDownloadReport(reporte._id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Resumen estadístico */}
          {filteredReports.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{filteredReports.length}</div>
                    <div className="text-sm text-muted-foreground">Total reportes</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredReports.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completados</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredReports.reduce((sum, r) => sum + r.downloadCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total descargas</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatFileSize(
                        filteredReports.reduce((sum, r) => sum + r.dataSize, 0)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Datos totales</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}