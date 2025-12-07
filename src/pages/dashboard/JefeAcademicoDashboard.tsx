import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Building } from 'lucide-react';

export default function JefeAcademicoDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Jefe Académico</h1>
            <p className="text-muted-foreground">Facultad de Ingeniería</p>
          </div>
          <Badge variant="secondary">Jefe Académico</Badge>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Gestión de Departamento
            </CardTitle>
            <CardDescription>Supervisión académica de tu área</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Esta es la vista de ejemplo para el Jefe Académico.</p>
            <Button>Ver Docentes del Departamento</Button>
            <Button variant="outline">Reportes del Área</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
