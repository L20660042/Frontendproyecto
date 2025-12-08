import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { UserPlus, RefreshCw, FileText, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onCreateUser: () => void;
  onCreateReport?: () => void; 
  onViewStats?: () => void; // <-- AÑADIDO OPCIONAL
  onRefresh: () => void;
  loading: boolean;
}

export default function QuickActions({ 
  onCreateUser, 
  onCreateReport, // <-- AÑADIDO
  onViewStats, // <-- AÑADIDO OPCIONAL
  onRefresh, 
  loading 
}: QuickActionsProps) {
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
        
        {/* BOTÓN PARA CREAR REPORTE */}
        {onCreateReport && (
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={onCreateReport}
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        )}
        
        {/* BOTÓN PARA VER ESTADÍSTICAS (opcional) */}
        {onViewStats && (
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={onViewStats}
            disabled={loading}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Estadísticas
          </Button>
        )}
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Cargando...' : 'Recargar Datos'}
        </Button>
      </CardContent>
    </Card>
  );
}