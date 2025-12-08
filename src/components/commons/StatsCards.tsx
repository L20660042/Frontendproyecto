import { Card, CardContent } from '../../components/card';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Users as GroupsIcon, 
  FileText,
  BarChart3,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Badge } from '../../components/badge';

interface StatsCardsProps {
  users: any[];
  careers: any[];
  subjects: any[];
  groups: any[];
  tutorias: any[];
  reports: any[];
}

export default function StatsCards({ 
  users, 
  careers, 
  subjects, 
  groups, 
  tutorias,
  reports 
}: StatsCardsProps) {
  
  // Calcular estadísticas
  const activeUsers = users.filter(u => u.status === 'active' || u.active).length;
  const activeCareers = careers.filter(c => c.status === 'active' || c.active).length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const processingReports = reports.filter(r => r.status === 'processing').length;
  const totalDownloads = reports.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
  
  const statCards = [
    {
      title: "Total Usuarios",
      value: users.length,
      subValue: `${activeUsers} activos`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: '+12%'
    },
    {
      title: "Carreras Activas",
      value: careers.length,
      subValue: `${activeCareers} activas`,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Materias Totales",
      value: subjects.length,
      subValue: `${subjects.filter(s => s.status === 'active' || s.active).length} activas`,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Grupos Registrados",
      value: groups.length,
      subValue: `${groups.filter(g => g.status === 'active' || g.active).length} activos`,
      icon: GroupsIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Total Tutorías",
      value: tutorias.length,
      subValue: `${tutorias.filter(t => new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} últimos 30 días`,
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Reportes Generados",
      value: reports.length,
      subValue: `${completedReports} completados`,
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              
              {stat.change && (
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                  <span className="text-xs text-muted-foreground ml-2">desde el mes pasado</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estadísticas adicionales de reportes */}
      {reports.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Estadísticas de Reportes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-700">{reports.length}</div>
                <div className="text-sm text-blue-600">Total Generados</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-700">{completedReports}</div>
                <div className="text-sm text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completados
                </div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-700">{processingReports}</div>
                <div className="text-sm text-yellow-600 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                  En proceso
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-700">{totalDownloads}</div>
                <div className="text-sm text-purple-600 flex items-center justify-center gap-1">
                  <Download className="h-3 w-3" />
                  Descargas
                </div>
              </div>
            </div>
            
            {/* Último reporte generado */}
            {reports.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Último reporte generado</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {reports[0].name}
                    </p>
                  </div>
                  <Badge variant={
                    reports[0].status === 'completed' ? 'success' : 
                    reports[0].status === 'processing' ? 'secondary' : 'outline'
                  }>
                    {reports[0].status === 'completed' ? 'Completado' : 'En proceso'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}