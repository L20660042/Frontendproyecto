import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Input } from '../input';
import { 
  Search, AlertTriangle, User, BookOpen, Calendar, 
  CheckCircle, XCircle, Filter, MessageSquare, Eye 
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

interface Alerta {
  _id: string;
  type: 'low-grade' | 'absenteeism' | 'behavior' | 'academic-risk' | 'other';
  message: string;
  studentName: string;
  studentId: string;
  materiaName: string;
  groupName: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
  notes?: string;
}

interface AlertasTableProps {
  alertas: Alerta[];
  loading: boolean;
  onResolveAlert: (alertaId: string) => void;
}

export default function AlertasTable({ alertas, loading, onResolveAlert }: AlertasTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'pending'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Tipos únicos de alertas
  const tiposAlertas = Array.from(new Set(alertas.map(a => a.type)));

  const filteredAlertas = alertas
    .filter(alerta => {
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          alerta.studentName.toLowerCase().includes(searchLower) ||
          alerta.message.toLowerCase().includes(searchLower) ||
          alerta.materiaName.toLowerCase().includes(searchLower) ||
          alerta.groupName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(alerta => {
      // Filtro por prioridad
      if (filterPriority !== 'all') {
        return alerta.priority === filterPriority;
      }
      return true;
    })
    .filter(alerta => {
      // Filtro por estado
      if (filterStatus !== 'all') {
        if (filterStatus === 'resolved') return alerta.resolved;
        if (filterStatus === 'pending') return !alerta.resolved;
      }
      return true;
    })
    .filter(alerta => {
      // Filtro por tipo
      if (filterType !== 'all') {
        return alerta.type === filterType;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Desconocida';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low-grade': return '📉';
      case 'absenteeism': return '📅';
      case 'behavior': return '⚠️';
      case 'academic-risk': return '🎓';
      default: return '📌';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'low-grade': return 'Bajo Rendimiento';
      case 'absenteeism': return 'Inasistencias';
      case 'behavior': return 'Comportamiento';
      case 'academic-risk': return 'Riesgo Académico';
      default: return 'Otro';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Alertas</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Mis Alertas</CardTitle>
              <CardDescription>
                {filteredAlertas.length} alertas de {alertas.length} total
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar alertas..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pendientes
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('resolved')}
              >
                Resueltas
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterPriority === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('all')}
              >
                Todas las prioridades
              </Button>
              <Button
                variant={filterPriority === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('high')}
              >
                Alta
              </Button>
              <Button
                variant={filterPriority === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('medium')}
              >
                Media
              </Button>
              <Button
                variant={filterPriority === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('low')}
              >
                Baja
              </Button>
            </div>
            
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
                {tiposAlertas.map(tipo => (
                  <DropdownMenuItem key={tipo} onClick={() => setFilterType(tipo)}>
                    {getTypeIcon(tipo)} {getTypeText(tipo)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredAlertas.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron alertas</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all'
                  ? 'Intenta con otros términos de búsqueda o filtros'
                  : '¡Excelente! No tienes alertas pendientes'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Grupo/Materia</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlertas.map((alerta) => (
                    <TableRow 
                      key={alerta._id} 
                      className={`hover:bg-gray-50 ${alerta.resolved ? 'bg-green-50' : ''}`}
                    >
                      <TableCell>
                        {alerta.resolved ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resuelta
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">{alerta.studentName}</div>
                            <div className="text-xs text-muted-foreground">
                              ID: {alerta.studentId?.substring(0, 8) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(alerta.type)}</span>
                          <span className="text-sm">{getTypeText(alerta.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <div className="truncate">{alerta.message}</div>
                        {alerta.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Notas: {alerta.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {alerta.groupName}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {alerta.materiaName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(alerta.priority)} border`}
                        >
                          <AlertTriangle className={`h-3 w-3 mr-1 ${
                            alerta.priority === 'high' ? 'text-red-600' :
                            alerta.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                          {getPriorityText(alerta.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">
                            {new Date(alerta.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {alerta.resolvedAt && (
                          <div className="text-xs text-green-600 mt-1">
                            Resuelta: {new Date(alerta.resolvedAt).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!alerta.resolved && (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => onResolveAlert(alerta._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Tutoría
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
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
          {filteredAlertas.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredAlertas.filter(a => a.priority === 'high').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Alta prioridad</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredAlertas.filter(a => !a.resolved).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Pendientes</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredAlertas.filter(a => a.resolved).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Resueltas</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredAlertas.filter(a => a.type === 'low-grade').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Bajo rendimiento</div>
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