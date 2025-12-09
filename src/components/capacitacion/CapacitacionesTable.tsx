import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, PlusCircle, EyeIcon, Edit, Trash2, Calendar, User } from 'lucide-react';

interface CapacitacionesTableProps {
  capacitaciones: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateCapacitacion: () => void;
  onViewDetails: (capacitacion: any) => void;
  onEditCapacitacion: (capacitacion: any) => void;
  onDeleteCapacitacion: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export default function CapacitacionesTable({
  capacitaciones,
  loading,
  searchTerm,
  onSearchChange,
  onCreateCapacitacion,
  onViewDetails,
  onEditCapacitacion,
  onDeleteCapacitacion}: CapacitacionesTableProps) {
  const filteredCapacitaciones = capacitaciones.filter(capacitacion => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      capacitacion.title?.toLowerCase().includes(searchLower) ||
      capacitacion.teacherName?.toLowerCase().includes(searchLower) ||
      capacitacion.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Capacitaciones</h2>
          <p className="text-muted-foreground">
            {capacitaciones.length} capacitaciones registradas en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar capacitaciones..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateCapacitacion} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Capacitación
          </Button>
        </div>
      </div>

      {loading && capacitaciones.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando capacitaciones...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Título</th>
                    <th className="text-left p-4 font-medium">Docente</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Evidencias</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCapacitaciones.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron capacitaciones' : 'No hay capacitaciones registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredCapacitaciones.map(capacitacion => (
                      <tr key={capacitacion._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{capacitacion.title}</div>
                          {capacitacion.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {capacitacion.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{capacitacion.teacherName || 'Desconocido'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(capacitacion.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {capacitacion.evidence?.length || 0} archivos
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Ver detalles"
                              onClick={() => onViewDetails(capacitacion)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Editar"
                              onClick={() => onEditCapacitacion(capacitacion)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              title="Eliminar"
                              onClick={() => onDeleteCapacitacion(capacitacion._id)}
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