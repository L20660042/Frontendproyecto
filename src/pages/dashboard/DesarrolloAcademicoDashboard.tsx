import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { BookOpen } from 'lucide-react';

export default function DesarrolloAcademicoDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Desarrollo Académico</h1>
            <p className="text-muted-foreground">Capacitación y formación docente</p>
          </div>
          <Badge variant="outline">Desarrollo Académico</Badge>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Capacitaciones Docentes
            </CardTitle>
            <CardDescription>Programas de formación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Esta es la vista de ejemplo para Desarrollo Académico.</p>
            <Button>Programar Capacitación</Button>
            <Button variant="outline">Ver Historial de Capacitaciones</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
