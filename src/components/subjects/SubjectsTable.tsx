// components/subjects/SubjectsTable.tsx
import { Card, CardContent } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Input } from '../../components/input';
import { Search, PlusCircle, EyeIcon, Edit, Trash2 } from 'lucide-react';


interface SubjectsTableProps {
  subjects: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateSubject: () => void;
  onViewDetails: (subject: any) => void;
  onEditSubject: (subject: any) => void;
  onDeleteSubject: (subjectId: string) => void;
  onToggleSubjectStatus?: (subjectId: string) => void; // <-- Agregar esta línea
}

export default function SubjectsTable({
  subjects,
  loading,
  searchTerm,
  onSearchChange,
  onCreateSubject,
  onViewDetails,
  onEditSubject,
  onDeleteSubject
}: SubjectsTableProps) {
  const filteredSubjects = subjects.filter(subject => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchLower) ||
      subject.code.toLowerCase().includes(searchLower) ||
      subject.careerName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestión de Materias</h2>
          <p className="text-muted-foreground">
            {subjects.length} materias registradas en el sistema
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar materias..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={onCreateSubject} disabled={loading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Materia
          </Button>
        </div>
      </div>

      {loading && subjects.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando materias...</span>
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
                    <th className="text-left p-4 font-medium">Semestre</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        {searchTerm ? 'No se encontraron materias' : 'No hay materias registradas'}
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map(subject => (
                      <tr key={subject._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{subject.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {subject.credits || 4} créditos
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-muted-foreground">{subject.code}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{subject.careerName || 'Desconocida'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-center">{subject.semester || 1}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant={subject.status === 'active' ? 'default' : 'destructive'}>
                            {subject.status || 'active'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Ver detalles"
                              onClick={() => onViewDetails(subject)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Editar"
                              onClick={() => onEditSubject(subject)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive" 
                              title="Eliminar"
                              onClick={() => onDeleteSubject(subject._id)}
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