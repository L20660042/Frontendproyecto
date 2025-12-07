import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { UserPlus, RefreshCw, Download } from 'lucide-react';

interface QuickActionsProps {
  onCreateUser: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function QuickActions({ onCreateUser, onRefresh, loading }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Gestión del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start" 
          onClick={onCreateUser}
          disabled={loading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Crear Nuevo Usuario
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Cargando...' : 'Recargar Datos'}
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </CardContent>
    </Card>
  );
}