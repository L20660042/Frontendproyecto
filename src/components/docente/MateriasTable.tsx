import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Progress } from '../progress';
import { Input } from '../input';
import { 
  Search, BookOpen, Users, Calendar, AlertTriangle, 
  Eye, ChevronDown, ChevronUp, Filter 
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

interface MateriaDocente {
  _id: string;
  name: string;
  code: string;
  groupCode: string;
  careerName: string;
  schedule: string;
  studentsCount: number;
  progress: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
  averageGrade?: number;
  attendance?: number;
}

interface MateriasTableProps {
  materias: MateriaDocente[];
  loading: boolean;
  onSelectMateria: (materia: MateriaDocente) => void;
}

export default function MateriasTable({ materias, loading, onSelectMateria }: MateriasTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'progress' | 'students'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredMaterias = materias
    .filter(materia => {
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          materia.name.toLowerCase().includes(searchLower) ||
          materia.code.toLowerCase().includes(searchLower) ||
          materia.groupCode.toLowerCase().includes(searchLower) ||
          materia.careerName.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(materia => {
      // Filtro por nivel de riesgo
      if (filterRisk !== 'all') {
        return materia.riskLevel === filterRisk;
      }
      return true;
    })
    .sort((a, b) => {
      // Ordenamiento
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'students':
          comparison = a.studentsCount - b.studentsCount;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'Alto Riesgo';
      case 'medium': return 'Riesgo Medio';
      case 'low': return 'Bajo Riesgo';
      default: return 'Sin Riesgo';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Materias</CardTitle>
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
              <CardTitle>Mis Materias</CardTitle>
              <CardDescription>
                {filteredMaterias.length} de {materias.length} materias
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar materia..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterRisk('all')}>
                    Todos los niveles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRisk('high')}>
                    Solo alto riesgo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRisk('medium')}>
                    Solo riesgo medio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterRisk('low')}>
                    Solo bajo riesgo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredMaterias.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron materias</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRisk !== 'all' 
                  ? 'Intenta con otros términos de búsqueda o filtros'
                  : 'No tienes materias asignadas este semestre'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Materia
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort('students')}
                      >
                        Estudiantes
                        {sortBy === 'students' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort('progress')}
                      >
                        Progreso
                        {sortBy === 'progress' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort('risk')}
                      >
                        Riesgo
                        {sortBy === 'risk' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterias.map((materia) => (
                    <TableRow key={materia._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <div>
                            <div>{materia.name}</div>
                            <div className="text-xs text-muted-foreground">{materia.code}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{materia.groupCode}</Badge>
                      </TableCell>
                      <TableCell>{materia.careerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {materia.schedule}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {materia.studentsCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={materia.progress} />
                          <div className="text-xs text-muted-foreground text-center">
                            {materia.progress}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getRiskColor(materia.riskLevel)} border`}
                        >
                          <AlertTriangle className={`h-3 w-3 mr-1 ${
                            materia.riskLevel === 'high' ? 'text-red-600' :
                            materia.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                          }`} />
                          {getRiskText(materia.riskLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onSelectMateria(materia)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
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
          {filteredMaterias.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredMaterias.filter(m => m.riskLevel === 'high').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Materias con alto riesgo</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {Math.round(
                        filteredMaterias.reduce((sum, m) => sum + m.progress, 0) / filteredMaterias.length
                      )}%
                    </div>
                    <div className="text-sm text-muted-foreground">Progreso promedio</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {filteredMaterias.reduce((sum, m) => sum + m.studentsCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total estudiantes</div>
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