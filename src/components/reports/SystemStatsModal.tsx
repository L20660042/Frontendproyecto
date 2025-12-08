import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Card, CardContent } from '../../components/card';
import { RefreshCw, Users, GraduationCap, BookOpen, Users as GroupsIcon, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

interface SystemStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemStatsModal({ isOpen, onClose }: SystemStatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getSystemStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const StatCard = ({ title, value, icon: Icon, color = 'text-blue-600', bgColor = 'bg-blue-100' }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressBar = ({ value, max, label, color = 'bg-blue-600' }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value} / {max}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <BaseModal
      title="Estadísticas del Sistema"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3">Cargando estadísticas...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        ) : stats ? (
          <>
            {/* Header con botón de refrescar */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Última actualización: {new Date().toLocaleTimeString()}
              </p>
              <Button size="sm" variant="outline" onClick={loadStats} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>

            {/* Resumen general */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                title="Total Usuarios"
                value={stats.usuarios?.total || 0}
                icon={Users}
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatCard
                title="Carreras Activas"
                value={stats.carreras?.activas || 0}
                icon={GraduationCap}
                color="text-green-600"
                bgColor="bg-green-100"
              />
              <StatCard
                title="Materias Totales"
                value={stats.materias?.total || 0}
                icon={BookOpen}
                color="text-purple-600"
                bgColor="bg-purple-100"
              />
              <StatCard
                title="Grupos Registrados"
                value={stats.grupos?.total || 0}
                icon={GroupsIcon}
                color="text-orange-600"
                bgColor="bg-orange-100"
              />
              <StatCard
                title="Total Tutorías"
                value={stats.tutorias?.total || 0}
                icon={FileText}
                color="text-red-600"
                bgColor="bg-red-100"
              />
              <StatCard
                title="Capacitaciones"
                value={stats.capacitaciones?.total || 0}
                icon={TrendingUp}
                color="text-indigo-600"
                bgColor="bg-indigo-100"
              />
            </div>

            {/* Progresos detallados */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Distribución</h3>
              
              <div className="space-y-4">
                {stats.usuarios && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Usuarios</h4>
                    <div className="space-y-3">
                      <ProgressBar
                        value={stats.usuarios.activos}
                        max={stats.usuarios.total}
                        label="Activos"
                        color="bg-green-600"
                      />
                      <ProgressBar
                        value={stats.usuarios.inactivos}
                        max={stats.usuarios.total}
                        label="Inactivos"
                        color="bg-red-600"
                      />
                    </div>
                  </div>
                )}

                {stats.carreras && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Carreras</h4>
                    <div className="space-y-3">
                      <ProgressBar
                        value={stats.carreras.activas}
                        max={stats.carreras.total}
                        label="Activas"
                        color="bg-green-600"
                      />
                      <ProgressBar
                        value={stats.carreras.inactivas}
                        max={stats.carreras.total}
                        label="Inactivas"
                        color="bg-red-600"
                      />
                    </div>
                  </div>
                )}

                {stats.tutorias && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tutorías</h4>
                    <div className="space-y-3">
                      <ProgressBar
                        value={stats.tutorias.ultimos30Dias}
                        max={stats.tutorias.total}
                        label="Últimos 30 días"
                        color="bg-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm">
              <h4 className="font-medium text-muted-foreground mb-2">Información del Sistema</h4>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Tutorías recientes: {stats.tutorias?.ultimos30Dias || 0}</div>
                <div>Reportes activos: {stats.usuarios?.activos || 0} usuarios</div>
                <div>Porcentaje activos: {stats.usuarios?.total > 0 ? Math.round((stats.usuarios.activos / stats.usuarios.total) * 100) : 0}%</div>
                <div>Ratio tutorías: {stats.usuarios?.total > 0 ? (stats.tutorias?.total / stats.usuarios.total).toFixed(1) : 0} por usuario</div>
              </div>
            </div>
          </>
        ) : null}

        {/* Acciones */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="px-6">
            Cerrar
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}