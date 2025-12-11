import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Input } from '../input';
import { 
  Search, User, Mail, BookOpen, Calendar, AlertTriangle, 
  TrendingDown, TrendingUp, MessageSquare, Eye 
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';

interface Estudiante {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupName: string;
  materiaName: string;
  averageGrade: number;
  attendance: number;
  riskLevel: number; // 1-10
  lastTutoria?: string;
  status: 'regular' | 'at-risk' | 'critical';
  alertsCount?: number;
}

interface EstudiantesTableProps {
  estudiantes: Estudiante[];
  loading: boolean;
  onSelectEstudiante: (estudiante: Estudiante) => void;
}

export default function EstudiantesTable({ estudiantes, loading, onSelectEstudiante }: EstudiantesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Obtener grupos únicos
  const groups = Array.from(new Set(estudiantes.map(e => e.groupName)));

  const filteredEstudiantes = estudiantes
    .filter(estudiante => {
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          estudiante.firstName.toLowerCase().includes(searchLower) ||
          estudiante.lastName.toLowerCase().includes(searchLower) ||
          estudiante.email.toLowerCase().includes(searchLower) ||
          estudiante.groupName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(estudiante => {
      // Filtro por grupo
      if (selectedGroup !== 'all') {
        return estudiante.groupName === selectedGroup;
      }
      return true;
    })
    .filter(estudiante => {
      // Filtro por estado
      if (selectedStatus !== 'all') {
        return estudiante.status === selectedStatus;
      }
      return true;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'at-risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'regular': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical': return 'Crítico';
      case 'at-risk': return 'En Riesgo';
      case 'regular': return 'Regular';
      default: return 'Desconocido';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-green-600';
    if (grade >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 8) return { text: 'Alto', color: 'text-red-600', bg: 'bg-red-100' };
    if (risk >= 5) return { text: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Bajo', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Estudiantes</CardTitle>
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
              <CardTitle>Mis Estudiantes</CardTitle>
              <CardDescription>
                {filteredEstudiantes.length} de {estudiantes.length} estudiantes
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar estudiante..."
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
            <Button
              variant={selectedGroup === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGroup('all')}
            >
              Todos los grupos
            </Button>
            {groups.map(group => (
              <Button
                key={group}
                variant={selectedGroup === group ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGroup(group)}
              >
                {group}
              </Button>
            ))}
            
            <div className="ml-auto flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={selectedStatus === 'regular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('regular')}
              >
                Regular
              </Button>
              <Button
                variant={selectedStatus === 'at-risk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('at-risk')}
              >
                En Riesgo
              </Button>
              <Button
                variant={selectedStatus === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('critical')}
              >
                Crítico
              </Button>
            </div>
          </div>

          {filteredEstudiantes.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron estudiantes</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedGroup !== 'all' || selectedStatus !== 'all'
                  ? 'Intenta con otros términos de búsqueda o filtros'
                  : 'No tienes estudiantes asignados'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Grupo/Materia</TableHead>
                    <TableHead className="text-center">Calificación</TableHead>
                    <TableHead className="text-center">Asistencia</TableHead>
                    <TableHead className="text-center">Nivel de Riesgo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Última Tutoría</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstudiantes.map((estudiante) => {
                    const riskInfo = getRiskLevel(estudiante.riskLevel);
                    
                    return (
                      <TableRow key={estudiante._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {estudiante.firstName} {estudiante.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {estudiante._id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-sm truncate max-w-[150px]">
                              {estudiante.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {estudiante.groupName}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {estudiante.materiaName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`font-bold ${getGradeColor(estudiante.averageGrade)}`}>
                            {estudiante.averageGrade.toFixed(1)}
                            {estudiante.averageGrade >= 8 ? (
                              <TrendingUp className="h-4 w-4 inline ml-1 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 inline ml-1 text-red-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {estudiante.attendance}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`${riskInfo.bg} ${riskInfo.color} border`}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {estudiante.riskLevel}/10
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(estudiante.status)} border`}
                          >
                            {getStatusText(estudiante.status)}
                          </Badge>
                          {estudiante.alertsCount && estudiante.alertsCount > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {estudiante.alertsCount} alerta(s)
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {estudiante.lastTutoria ? (
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm">
                                {new Date(estudiante.lastTutoria).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin tutorías</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onSelectEstudiante(estudiante)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => onSelectEstudiante(estudiante)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Tutoría
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Resumen estadístico */}
          {filteredEstudiantes.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(
                        filteredEstudiantes.reduce((sum, e) => sum + e.averageGrade, 0) / 
                        filteredEstudiantes.length
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Promedio general</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(
                        filteredEstudiantes.reduce((sum, e) => sum + e.attendance, 0) / 
                        filteredEstudiantes.length
                      ).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Asistencia promedio</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredEstudiantes.filter(e => e.status === 'critical').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Estudiantes críticos</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredEstudiantes.filter(e => e.riskLevel >= 7).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Alto riesgo</div>
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