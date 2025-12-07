import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, PlusCircle, EyeIcon, Edit, Trash2 } from 'lucide-react';

interface CareersTableProps {
  careers: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateCareer: () => void;
  onViewDetails: (career: any) => void;
  onEditCareer: (career: any) => void;
  onDeleteCareer: (careerId: string) => void;
}

export default function CareersTable({
  careers,
  loading,
  searchTerm,
  onSearchChange,
  onCreateCareer,
  onViewDetails,
  onEditCareer,
  onDeleteCareer
}: CareersTableProps) {
  const filteredCareers = careers.filter(career => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      career.name.toLowerCase().includes(searchLower) ||
      career.code.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Carreras</h2>
          <p className="text-muted-foreground">
            {careers.length} carreras registradas en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar carreras..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateCareer} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Carrera
          </Button>
        </div>
      </div>

      {loading && careers.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando carreras...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Nombre</th>
                    <th className="text-left p-4 font-medium">Código</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCareers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron carreras' : 'No hay carreras registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredCareers.map(career => (
                      <tr key={career._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{career.name}</div>
                          {career.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-xs">
                              {career.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">{career.code}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={career.status === 'active' ? 'default' : 'destructive'}>
                            {career.status || 'active'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Ver detalles"
                              onClick={() => onViewDetails(career)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Editar"
                              onClick={() => onEditCareer(career)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              title="Eliminar"
                              onClick={() => onDeleteCareer(career._id)}
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