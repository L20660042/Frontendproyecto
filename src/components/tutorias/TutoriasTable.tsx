import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, PlusCircle, EyeIcon, Edit, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface TutoriasTableProps {
  tutorias: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateTutoria: () => void;
  onViewDetails: (tutoria: any) => void;
  onEditTutoria: (tutoria: any) => void;
  onDeleteTutoria: (tutoriaId: string) => void;
}

export default function TutoriasTable({
  tutorias,
  loading,
  searchTerm,
  onSearchChange,
  onCreateTutoria,
  onViewDetails,
  onEditTutoria,
  onDeleteTutoria
}: TutoriasTableProps) {
  const filteredTutorias = tutorias.filter(tutoria => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      tutoria.tutorName?.toLowerCase().includes(searchLower) ||
      tutoria.studentName?.toLowerCase().includes(searchLower) ||
      tutoria.groupName?.toLowerCase().includes(searchLower) ||
      tutoria.topics?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Tutorías</h2>
          <p className="text-muted-foreground">
            {tutorias.length} tutorías registradas en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tutorías..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateTutoria} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Tutoría
          </Button>
        </div>
      </div>

      {loading && tutorias.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando tutorías...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Tutor</th>
                    <th className="text-left p-4 font-medium">Estudiante</th>
                    <th className="text-left p-4 font-medium">Grupo</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Temas</th>
                    <th className="text-left p-4 font-medium">Riesgo</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutorias.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron tutorías' : 'No hay tutorías registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredTutorias.map(tutoria => (
                      <tr key={tutoria._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{tutoria.tutorName || 'Sin asignar'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{tutoria.studentName || 'Desconocido'}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{tutoria.groupName || 'Desconocido'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(tutoria.date)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {tutoria.topics || 'Sin temas registrados'}
                          </div>
                        </td>
                        <td className="p-4">
                          {tutoria.riskDetected ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Riesgo
                            </Badge>
                          ) : (
                            <Badge variant="outline">Normal</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Ver detalles"
                              onClick={() => onViewDetails(tutoria)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Editar"
                              onClick={() => onEditTutoria(tutoria)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              title="Eliminar"
                              onClick={() => onDeleteTutoria(tutoria._id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
    </div>
  );
}