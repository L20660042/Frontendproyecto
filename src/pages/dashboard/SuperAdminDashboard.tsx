import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { BarChart3, Users, BookOpen, AlertTriangle, Download, Settings } from 'lucide-react';

export default function SuperAdminDashboard() {
  const stats = [
    { title: "Total Usuarios", value: "1,247", icon: Users, change: "+12%", color: "bg-blue-500" },
    { title: "Carreras Activas", value: "42", icon: BookOpen, change: "+3", color: "bg-green-500" },
    { title: "Materias", value: "312", icon: BookOpen, change: "+8", color: "bg-purple-500" },
    { title: "Alertas Activas", value: "18", icon: AlertTriangle, change: "-2", color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración General</h1>
            <p className="text-muted-foreground">Sistema Integral de Gestión Académica</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default">Super Administrador</Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span> desde el mes pasado
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>Administra usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">Crear Nuevo Usuario</Button>
              <Button className="w-full justify-start" variant="outline">Ver Todos los Usuarios</Button>
              <Button className="w-full justify-start" variant="outline">Roles y Permisos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Catálogos Académicos
              </CardTitle>
              <CardDescription>Gestiona carreras, materias y grupos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">Carreras</Button>
              <Button className="w-full justify-start" variant="outline">Materias</Button>
              <Button className="w-full justify-start" variant="outline">Grupos</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reportes y Análisis
              </CardTitle>
              <CardDescription>Genera reportes del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" variant="default">
                <Download className="h-4 w-4" />
                Descargar Reporte Completo
              </Button>
              <Button className="w-full justify-start" variant="outline">Reporte de Calidad Docente</Button>
              <Button className="w-full justify-start" variant="outline">Estadísticas Generales</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente del Sistema</CardTitle>
            <CardDescription>Últimas acciones registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nuevo usuario registrado", user: "Juan Pérez", time: "Hace 5 minutos", type: "success" },
                { action: "Alerta generada", user: "Grupo A-202", time: "Hace 15 minutos", type: "warning" },
                { action: "Reporte descargado", user: "Coordinador Académico", time: "Hace 30 minutos", type: "info" },
                { action: "Materia actualizada", user: "Matemáticas Avanzadas", time: "Hace 2 horas", type: "info" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">Por: {activity.user}</p>
                  </div>
                  <Badge variant={activity.type === 'success' ? 'default' : activity.type === 'warning' ? 'destructive' : 'outline'}>
                    {activity.time}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
