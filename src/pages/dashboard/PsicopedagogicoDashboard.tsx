import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { AlertTriangle } from 'lucide-react';

export default function PsicopedagogicoDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Coordinación Psicopedagógica</h1>
            <p className="text-muted-foreground">Seguimiento de riesgo académico</p>
          </div>
          <Badge variant="outline">Psicopedagogía</Badge>
        </div>
      </header>
      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alumnos en Riesgo
            </CardTitle>
            <CardDescription>Monitoreo y seguimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Esta es la vista de ejemplo para Psicopedagogía.</p>
            <Button>Ver Reporte de Riesgo</Button>
            <Button variant="outline">Estadísticas de Tutorías</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
