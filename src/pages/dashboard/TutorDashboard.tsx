import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { Users } from 'lucide-react';
import { DynamicSidebar } from '../../components/Sidebar';

export default function TutorDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
  <DynamicSidebar />
  <div className="flex-1"></div>
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Tutorías</h1>
            <p className="text-muted-foreground">Seguimiento de estudiantes</p>
          </div>
          <Badge variant="outline">Tutor</Badge>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Tutorías
            </CardTitle>
            <CardDescription>Seguimiento de alumnos asignados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Esta es la vista de ejemplo para el Tutor.</p>
            <Button>Ver Mis Estudiantes</Button>
            <Button variant="outline">Agendar Tutoría</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
