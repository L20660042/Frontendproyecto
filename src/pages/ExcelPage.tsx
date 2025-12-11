import { useState, useEffect } from 'react';
import ExcelTable from '../components/excel/ExcelTable';
import UploadExcelModal from '../components/excel/UploadExcelModal';
import { Card, CardContent } from '../components/card';
import { Button } from '../components/button';
import { 
  Upload, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { authService } from '../services/authService';

export default function ExcelPage() {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  // Verificar permisos al cargar
  useEffect(() => {
    const checkPermissions = () => {
      const user = authService.getCurrentUser();
      console.log('🔍 Usuario actual:', user); // Debug
      
      if (!user) {
        setHasPermission(false);
        setError('Debe iniciar sesión para acceder a esta funcionalidad');
        return false;
      }
      
      // Verificar roles (manejar mayúsculas y minúsculas)
      const userRole = user.role?.toUpperCase();
      console.log('🔍 Rol del usuario:', userRole); // Debug
      
      const allowedRoles = ['ADMIN', 'SUPERADMIN'];
      const hasPermission = allowedRoles.includes(userRole);
      
      console.log('🔍 Tiene permiso?', hasPermission); // Debug
      
      if (!hasPermission) {
        setHasPermission(false);
        setError(`No tiene permisos para acceder a la importación masiva. Su rol (${user.role}) no está autorizado.`);
        return false;
      }
      
      return true;
    };
    
    if (checkPermissions()) {
      loadUploads();
    }
  }, []);

  // Cargar historial de importaciones
  const loadUploads = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.getExcelUploads();
      console.log('📥 Historial de importaciones:', response);
      
      if (response.success && Array.isArray(response.data)) {
        setUploads(response.data);
      } else {
        // Datos de prueba si el endpoint no está implementado
        const mockData = [
          {
            _id: '1',
            filename: 'importacion_2024.xlsx',
            filesize: 1024 * 1024, // 1MB
            createdAt: new Date().toISOString(),
            status: 'completed',
            user: { name: 'Admin', email: 'admin@test.com' },
            details: {
              carreras: { created: 5, updated: 2, errors: [] },
              usuarios: { created: 20, updated: 3, errors: [] },
              materias: { created: 15, updated: 1, errors: [] },
              grupos: { created: 8, updated: 0, errors: [] }
            }
          },
          {
            _id: '2',
            filename: 'estudiantes_octubre.xlsx',
            filesize: 512 * 1024, // 0.5MB
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
            status: 'partial',
            user: { name: 'Admin', email: 'admin@test.com' },
            details: {
              usuarios: { created: 15, updated: 0, errors: ['Fila 5: Email inválido'] }
            }
          }
        ];
        
        setUploads(mockData);
      }
      
    } catch (err: any) {
      console.error('Error loading uploads:', err);
      setError('Error al cargar el historial de importaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (result: any) => {
    console.log('✅ Importación exitosa:', result);
    
    if (result && result.summary) {
      const created = result.summary.totalCreated || 0;
      const updated = result.summary.totalUpdated || 0;
      
      if (created > 0 || updated > 0) {
        setSuccess(`✅ ${result.summary.message || 'Importación completada'} (${created} creados, ${updated} actualizados)`);
      } else {
        setSuccess('✅ Importación procesada (sin cambios)');
      }
    } else {
      setSuccess('✅ Datos importados exitosamente');
    }
    
    // Actualizar la lista
    loadUploads();
    
    // Cerrar modal después de un tiempo
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  const handleViewDetails = (upload: any) => {
    const details = upload.details || {};
    let detailsText = `Detalles de importación:\n\n`;
    detailsText += `📄 Archivo: ${upload.filename}\n`;
    detailsText += `📊 Estado: ${upload.status}\n`;
    detailsText += `📅 Fecha: ${new Date(upload.createdAt).toLocaleString()}\n\n`;
    
    if (Object.keys(details).length > 0) {
      detailsText += `Resultados por hoja:\n`;
      Object.entries(details).forEach(([sheetName, sheetResult]: [string, any]) => {
        detailsText += `\n📋 ${sheetName.charAt(0).toUpperCase() + sheetName.slice(1)}:\n`;
        detailsText += `   ✅ Creados: ${sheetResult.created || 0}\n`;
        detailsText += `   🔄 Actualizados: ${sheetResult.updated || 0}\n`;
        if (sheetResult.errors?.length > 0) {
          detailsText += `   ❌ Errores: ${sheetResult.errors.length}\n`;
          sheetResult.errors.slice(0, 2).forEach((err: string) => {
            detailsText += `      - ${err}\n`;
          });
          if (sheetResult.errors.length > 2) {
            detailsText += `      ... y ${sheetResult.errors.length - 2} más\n`;
          }
        }
      });
    }
    
    alert(detailsText);
  };

  const handleDownloadResult = async (uploadId: string) => {
    try {
      const upload = uploads.find(u => u._id === uploadId);
      if (!upload) return;
      
      // Crear reporte simple en formato texto
      let report = `Reporte de Importación - ${upload.filename}\n` +
                   `Fecha: ${new Date(upload.createdAt).toLocaleString()}\n` +
                   `Estado: ${upload.status}\n` +
                   `Tamaño: ${(upload.filesize / 1024 / 1024).toFixed(2)} MB\n\n`;
      
      const details = upload.details || {};
      if (Object.keys(details).length > 0) {
        Object.entries(details).forEach(([sheetName, sheetResult]: [string, any]) => {
          report += `\n=== ${sheetName.toUpperCase()} ===\n`;
          report += `Creados: ${sheetResult.created || 0}\n`;
          report += `Actualizados: ${sheetResult.updated || 0}\n`;
          if (sheetResult.errors?.length > 0) {
            report += `Errores:\n`;
            sheetResult.errors.forEach((err: string, idx: number) => {
              report += `${idx + 1}. ${err}\n`;
            });
          }
        });
      }
      
      // Descargar como archivo de texto
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${upload.filename.replace('.xlsx', '').replace('.xls', '')}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando resultado:', error);
      alert('Error al descargar el reporte');
    }
  };

  const handleRefresh = () => {
    loadUploads();
  };

  // Si no tiene permisos, mostrar mensaje
  if (!hasPermission) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
              <p className="text-gray-600 mb-6">
                {error || 'No tiene permisos para acceder a la funcionalidad de importación masiva.'}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Contacte al administrador del sistema si necesita acceso.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  Volver al Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const user = authService.getCurrentUser();
                    console.log('🔍 Debug - Usuario actual:', user);
                    alert(`Debug info:\nRol: ${user?.role}\nNombre: ${user?.name}\nEmail: ${user?.email}`);
                  }}
                  className="w-full text-xs"
                >
                  Mostrar Debug Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header con estadísticas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              Importación Masiva
            </h1>
            <p className="text-muted-foreground mt-2">
              Importa datos desde archivos Excel para cargar información masiva
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Cargando...' : 'Actualizar'}
            </Button>
            <Button onClick={() => setIsModalOpen(true)} disabled={loading}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Excel
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Importaciones</p>
                  <p className="text-2xl font-bold">{uploads.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exitosas</p>
                  <p className="text-2xl font-bold">
                    {uploads.filter(u => u.status === 'completed').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Con Errores</p>
                  <p className="text-2xl font-bold">
                    {uploads.filter(u => u.status === 'partial' || u.status === 'failed').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Registros Totales</p>
                  <p className="text-2xl font-bold">
                    {uploads.reduce((total, upload) => {
                      const details = upload.details || {};
                      return total + Object.values(details).reduce((sum: number, sheet: any) => 
                        sum + (sheet.created || 0) + (sheet.updated || 0), 0);
                    }, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="text-red-700">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-green-700">{success}</div>
          </div>
        </div>
      )}

      {/* Tabla de importaciones */}
      <ExcelTable
        uploads={uploads}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onUploadNew={() => setIsModalOpen(true)}
        onViewDetails={handleViewDetails}
        onDownloadResult={handleDownloadResult}
      />

      {/* Modal de importación */}
      <UploadExcelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}