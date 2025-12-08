import { useState, useEffect } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Textarea } from '../textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { RefreshCw, Calendar, Filter, AlertCircle } from 'lucide-react';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportData: any) => Promise<void>;
  onError: (error: string) => void;
  users?: any[];
  careers?: any[];
  subjects?: any[];
  groups?: any[];
}

const reportTypes = [
  { value: 'tutoria', label: '📝 Reporte de Tutorías', description: 'Registros de sesiones de tutoría' },
  { value: 'capacitacion', label: '🎓 Reporte de Capacitaciones', description: 'Capacitaciones realizadas' },
  { value: 'usuarios', label: '👥 Reporte de Usuarios', description: 'Listado completo de usuarios' },
  { value: 'grupos', label: '👨‍🏫 Reporte de Grupos', description: 'Grupos académicos registrados' },
  { value: 'materias', label: '📚 Reporte de Materias', description: 'Materias del sistema' },
  { value: 'completo', label: '📊 Reporte Completo', description: 'Resumen general del sistema' }
];

const formatOptions = [
  { value: 'json', label: 'JSON', description: 'Formato estructurado para análisis' },
  { value: 'csv', label: 'CSV', description: 'Formato tabular para hojas de cálculo' }
];

export default function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
  onError,
  users = [],
  careers = [],
  subjects = [],
  groups = []
}: GenerateReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [reportData, setReportData] = useState({
    name: '',
    description: '',
    type: 'tutoria',
    format: 'json',
    startDate: '',
    endDate: '',
    userId: '',
    studentId: '',
    groupId: '',
    subjectId: '',
    careerId: ''
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReportData({
        name: '',
        description: '',
        type: 'tutoria',
        format: 'json',
        startDate: '',
        endDate: '',
        userId: '',
        studentId: '',
        groupId: '',
        subjectId: '',
        careerId: ''
      });
      setShowAdvancedFilters(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      onError('');

      // Validaciones
      if (!reportData.name.trim()) {
        onError('El nombre del reporte es obligatorio');
        setLoading(false);
        return;
      }

      if (reportData.startDate && reportData.endDate && new Date(reportData.startDate) > new Date(reportData.endDate)) {
        onError('La fecha de inicio no puede ser mayor a la fecha de fin');
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const dataToSend: any = {
        name: reportData.name.trim(),
        type: reportData.type,
        format: reportData.format
      };

      // Agregar campos opcionales si tienen valor
      if (reportData.description.trim()) dataToSend.description = reportData.description.trim();
      if (reportData.startDate) dataToSend.startDate = reportData.startDate;
      if (reportData.endDate) dataToSend.endDate = reportData.endDate;
      if (reportData.userId) dataToSend.userId = reportData.userId;
      if (reportData.studentId) dataToSend.studentId = reportData.studentId;
      if (reportData.groupId) dataToSend.groupId = reportData.groupId;
      if (reportData.subjectId) dataToSend.subjectId = reportData.subjectId;
      if (reportData.careerId) dataToSend.careerId = reportData.careerId;

      console.log('📤 Enviando datos para generar reporte:', dataToSend);
      
      await onGenerate(dataToSend);
      
      // Solo cerramos si no hubo error
      if (!loading) {
        onClose();
      }
      
    } catch (err: any) {
      console.error("❌ Error al generar reporte:", err);
      onError(err.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultName = () => {
    const typeLabel = reportTypes.find(t => t.value === reportData.type)?.label || 'Reporte';
    const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${typeLabel} - ${date}`;
  };

  return (
    <BaseModal
      title="Generar Nuevo Reporte"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Información del Reporte</h3>
          
          <div className="space-y-2">
            <Label htmlFor="reportName" className="text-sm font-medium flex items-center justify-between">
              Nombre del Reporte *
              <button
                type="button"
                onClick={() => setReportData({...reportData, name: generateDefaultName()})}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Generar automáticamente
              </button>
            </Label>
            <Input
              id="reportName"
              value={reportData.name}
              onChange={(e) => setReportData({...reportData, name: e.target.value})}
              required
              placeholder="Ej: Reporte de Tutorías Octubre 2024"
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportDescription" className="text-sm font-medium">
              Descripción (opcional)
            </Label>
            <Textarea
              id="reportDescription"
              value={reportData.description}
              onChange={(e) => setReportData({...reportData, description: e.target.value})}
              placeholder="Describe el propósito o contenido de este reporte..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType" className="text-sm font-medium">
                Tipo de Reporte *
              </Label>
              <Select
                value={reportData.type}
                onValueChange={(value) => setReportData({...reportData, type: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="py-3">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportFormat" className="text-sm font-medium">
                Formato de salida *
              </Label>
              <Select
                value={reportData.format}
                onValueChange={(value) => setReportData({...reportData, format: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona formato" />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map(format => (
                    <SelectItem key={format.value} value={format.value} className="py-3">
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rango de fechas (opcional)
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Fecha de inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={reportData.startDate}
                onChange={(e) => setReportData({...reportData, startDate: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Fecha de fin
              </Label>
              <Input
                id="endDate"
                type="date"
                value={reportData.endDate}
                onChange={(e) => setReportData({...reportData, endDate: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <Filter className="h-4 w-4" />
            {showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
          </button>

          {showAdvancedFilters && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {users.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="userId" className="text-sm font-medium">
                      Usuario específico
                    </Label>
                    <Select
                      value={reportData.userId}
                      onValueChange={(value) => setReportData({...reportData, userId: value})}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los usuarios</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.fullName} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {careers.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="careerId" className="text-sm font-medium">
                      Carrera específica
                    </Label>
                    <Select
                      value={reportData.careerId}
                      onValueChange={(value) => setReportData({...reportData, careerId: value})}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las carreras</SelectItem>
                        {careers.map(career => (
                          <SelectItem key={career._id} value={career._id}>
                            {career.name} ({career.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="subjectId" className="text-sm font-medium">
                      Materia específica
                    </Label>
                    <Select
                      value={reportData.subjectId}
                      onValueChange={(value) => setReportData({...reportData, subjectId: value})}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar materia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las materias</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {groups.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="groupId" className="text-sm font-medium">
                      Grupo específico
                    </Label>
                    <Select
                      value={reportData.groupId}
                      onValueChange={(value) => setReportData({...reportData, groupId: value})}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los grupos</SelectItem>
                        {groups.map(group => (
                          <SelectItem key={group._id} value={group._id}>
                            {group.name} ({group.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium">
                  ID de Estudiante (opcional)
                </Label>
                <Input
                  id="studentId"
                  value={reportData.studentId}
                  onChange={(e) => setReportData({...reportData, studentId: e.target.value})}
                  placeholder="ID del estudiante específico"
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Nota informativa */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Nota:</p>
            <p>Los reportes pueden demorar algunos segundos en generarse dependiendo de la cantidad de datos.</p>
            <p className="mt-1">Una vez generado, podrás descargarlo en los formatos disponibles.</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              'Generar Reporte'
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}