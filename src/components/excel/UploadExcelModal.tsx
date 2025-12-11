import { useState, useRef } from 'react';
import BaseModal from '../modals/BaseModal';
import { Button } from '../button';
import { Label } from '../label';
import { Badge } from '../badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  X,
  Info
} from 'lucide-react';
import { authService } from '../../services/authService';

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export default function UploadExcelModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: UploadExcelModalProps) {
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
      'text/csv'
    ];
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(selectedFile.type) || 
                       ['xlsx', 'xls', 'csv'].includes(fileExtension || '');

    if (!isValidType) {
      setError('Formato no válido. Use archivos Excel (.xlsx, .xls) o CSV (.csv)');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Seleccione un archivo primero');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setUploadResult(null);
      
      console.log('📤 Subiendo archivo:', file.name);
      
      // Verificar permisos
      if (!authService.canImportExcel()) {
        throw new Error('No tiene permisos para realizar importaciones');
      }
      
      // Subir archivo
      const result = await authService.importExcel(file);
      
      console.log('✅ Resultado de importación:', result);
      
      // Manejar respuesta
      if (result && result.summary) {
        setUploadResult(result);
        
        if (result.summary.success) {
          const created = result.summary.totalCreated || 0;
          const updated = result.summary.totalUpdated || 0;
          const message = result.summary.message || 'Importación completada exitosamente';
          
          setSuccess(`✅ ${message} (${created} creados, ${updated} actualizados)`);
          
          // Notificar al padre después de un breve delay
          setTimeout(() => {
            onSuccess(result);
          }, 1500);
          
        } else {
          const errors = result.summary.errors || [];
          if (errors.length > 0) {
            // Mostrar solo primeros 3 errores
            const errorDisplay = errors.slice(0, 3).join('\n');
            setError(`❌ Importación con errores:\n${errorDisplay}`);
            if (errors.length > 3) {
              setError(prev => `${prev}\n\n... y ${errors.length - 3} errores más`);
            }
          } else {
            setError('❌ Error en la importación');
          }
        }
      } else {
        setError('❌ Respuesta inválida del servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Error en upload:', err);
      
      // Mensajes de error específicos
      let errorMsg = err.message || 'Error al procesar el archivo';
      
      // Limpiar mensajes largos
      if (errorMsg.length > 200) {
        errorMsg = errorMsg.substring(0, 200) + '...';
      }
      
      setError(`❌ ${errorMsg}`);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      setError('');
      await authService.downloadTemplate();
      setSuccess('✅ Plantilla descargada exitosamente');
    } catch (err: any) {
      console.error('❌ Error descargando plantilla:', err);
      
      let errorMsg = err.message || 'Error al descargar la plantilla';
      if (err.message.includes('404')) {
        errorMsg = 'Plantilla no disponible en el servidor';
      } else if (err.message.includes('401')) {
        errorMsg = 'Sesión expirada';
      }
      
      setError(`❌ ${errorMsg}`);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para renderizar el resultado
  const renderUploadResult = () => {
    if (!uploadResult) return null;

    const { summary, details } = uploadResult;

    if (!summary) {
      return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Importación completada</h4>
              <p className="text-sm text-green-700">Proceso finalizado correctamente</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Resumen */}
        <div className={`p-4 rounded-lg ${
          summary.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            {summary.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
            <div>
              <h4 className="font-medium">
                {summary.success ? '✅ Importación completada' : '⚠️ Importación con advertencias'}
              </h4>
              <p className="text-sm mt-1">
                {summary.message || 'Proceso finalizado'}
              </p>
              {(summary.totalCreated || summary.totalUpdated) && (
                <div className="flex gap-4 mt-2 text-sm">
                  {summary.totalCreated > 0 && (
                    <span className="text-green-600">
                      <strong>{summary.totalCreated}</strong> creados
                    </span>
                  )}
                  {summary.totalUpdated > 0 && (
                    <span className="text-blue-600">
                      <strong>{summary.totalUpdated}</strong> actualizados
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalles por hoja */}
        {details && Object.keys(details).length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-muted-foreground">Resultados por hoja:</h5>
            
            {Object.entries(details).map(([sheetName, sheetResult]: [string, any]) => (
              <div key={sheetName} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                    <span className="font-medium capitalize">{sheetName}</span>
                  </div>
                  <div className="flex gap-2">
                    {sheetResult.created > 0 && (
                      <Badge variant="success" className="text-xs">
                        {sheetResult.created} creados
                      </Badge>
                    )}
                    {sheetResult.updated > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {sheetResult.updated} actualizados
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Errores de esta hoja */}
                {sheetResult.errors?.length > 0 && (
                  <div className="mt-2">
                    <h6 className="text-xs font-medium text-red-600 mb-1">Errores ({sheetResult.errors.length}):</h6>
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded max-h-20 overflow-y-auto">
                      {sheetResult.errors.slice(0, 3).map((err: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 mb-1">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{err}</span>
                        </div>
                      ))}
                      {sheetResult.errors.length > 3 && (
                        <div className="text-xs text-red-500 mt-1">
                          ... y {sheetResult.errors.length - 3} errores más
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Errores generales */}
        {summary.errors?.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-red-600 mb-2">Errores generales:</h5>
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded max-h-24 overflow-y-auto">
              {summary.errors.slice(0, 5).map((err: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 mb-1">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{err}</span>
                </div>
              ))}
              {summary.errors.length > 5 && (
                <div className="text-xs text-red-500 mt-2">
                  ... y {summary.errors.length - 5} errores más
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseModal 
      title="Importar desde Excel" 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-800">Instrucciones de importación</h4>
          </div>
          <ul className="text-xs text-blue-700 space-y-1 list-disc pl-5">
            <li><strong>El archivo debe contener las hojas:</strong> Carreras, Usuarios, Materias, Grupos</li>
            <li>Descarga la plantilla para ver el formato correcto</li>
            <li>Usa nombres y códigos en lugar de IDs</li>
            <li>Tamaño máximo: <strong>10MB</strong></li>
            <li>Formatos soportados: <strong>.xlsx, .xls, .csv</strong></li>
            <li>El orden de importación es automático: Carreras → Usuarios → Materias → Grupos</li>
          </ul>
        </div>

        {/* Botón para descargar plantilla */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate || loading}
            className="w-full"
          >
            {downloadingTemplate ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla
              </>
            )}
          </Button>
        </div>

        {/* Selección de archivo */}
        <div className="space-y-3">
          <Label>Seleccionar archivo Excel</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file"
              disabled={loading}
            />
            
            {!file ? (
              <label htmlFor="excel-file" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Haz clic para seleccionar un archivo</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Arrastra y suelta o haz clic para buscar
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Formatos: .xlsx, .xls, .csv (máx. 10MB)
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!loading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-gray-600 text-center">
                  Archivo listo para importar. Haz clic en "Importar Datos" para continuar.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 whitespace-pre-line break-words">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && !uploadResult && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="text-sm text-green-700">{success}</div>
            </div>
          </div>
        )}

        {/* Resultado de la importación */}
        {uploadResult && renderUploadResult()}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {!uploadResult ? (
            <>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className="min-w-[140px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Datos
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={handleClose}
              className="w-full"
            >
              Continuar
            </Button>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 text-center pt-2">
          <p>La importación puede tardar varios minutos dependiendo del tamaño del archivo.</p>
          <p>No cierre esta ventana mientras se procesa la importación.</p>
        </div>
      </div>
    </BaseModal>
  );
}