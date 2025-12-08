import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, PlusCircle, EyeIcon, Edit, Trash2, Power } from 'lucide-react';

interface GroupsTableProps {
  groups: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateGroup: () => void;
  onViewDetails: (group: any) => void;
  onEditGroup: (group: any) => void;
  onDeleteGroup: (groupId: string) => void;
  onToggleGroupStatus?: (groupId: string) => void; // Nueva prop opcional
}

export default function GroupsTable({
  groups,
  loading,
  searchTerm,
  onSearchChange,
  onCreateGroup,
  onViewDetails,
  onEditGroup,
  onDeleteGroup,
  onToggleGroupStatus // Nueva prop
}: GroupsTableProps) {
  const filteredGroups = groups.filter(group => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      group.name?.toLowerCase().includes(searchLower) ||
      group.code?.toLowerCase().includes(searchLower) ||
      group.careerName?.toLowerCase().includes(searchLower) ||
      group.subjectName?.toLowerCase().includes(searchLower) ||
      group.teacherName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Grupos</h2>
          <p className="text-muted-foreground">
            {groups.length} grupos registrados en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateGroup} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>
      </div>

      {loading && groups.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando grupos...</span>
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
                    <th className="text-left p-4 font-medium">Carrera</th>
                    <th className="text-left p-4 font-medium">Materia</th>
                    <th className="text-left p-4 font-medium">Docente</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron grupos' : 'No hay grupos registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map(group => (
                      <tr key={group._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{group.name}</div>
                          {group.schedule && (
                            <div className="text-xs text-muted-foreground">
                              Horario: {group.schedule}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">{group.code}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{group.careerName || 'Desconocida'}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{group.subjectName || 'Desconocida'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">{group.teacherName || 'Sin asignar'}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={group.status === 'active' ? 'default' : 'destructive'}>
                            {group.status || 'active'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Ver detalles"
                              onClick={() => onViewDetails(group)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Editar"
                              onClick={() => onEditGroup(group)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {onToggleGroupStatus && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                title={group.status === 'active' ? 'Desactivar' : 'Activar'}
                                onClick={() => onToggleGroupStatus(group._id)}
                              >
                                <Power className={`h-4 w-4 ${group.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              title="Eliminar"
                              onClick={() => onDeleteGroup(group._id)}
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