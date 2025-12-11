import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Badge } from '../badge';
import { Progress } from '../progress';
import { 
  Star, MessageSquare, TrendingUp, TrendingDown, 
  Users, Calendar, Award, BarChart3, ThumbsUp, BookOpen 
} from 'lucide-react';

interface Evaluacion {
  _id: string;
  docenteId: string;
  periodo: string;
  promedioGeneral: number;
  totalEvaluaciones: number;
  categorias: {
    didactica: number;
    conocimiento: number;
    puntualidad: number;
    trato: number;
    claridad: number;
  };
  comentarios: {
    positivo: string[];
    sugerencias: string[];
  };
  tendencia: 'mejora' | 'estable' | 'disminuye';
  fechaActualizacion: string;
}

interface EvaluacionDocenteProps {
  userId: string;
}

export default function EvaluacionDocente({ userId }: EvaluacionDocenteProps) {
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'categorias' | 'comentarios'>('general');

  // Datos de ejemplo mientras se implementa el backend
  const datosEjemplo: Evaluacion = {
    _id: '1',
    docenteId: userId || 'docente123',
    periodo: '2024-1',
    promedioGeneral: 8.7,
    totalEvaluaciones: 45,
    categorias: {
      didactica: 8.5,
      conocimiento: 9.2,
      puntualidad: 9.8,
      trato: 8.9,
      claridad: 8.0,
    },
    comentarios: {
      positivo: [
        "Excelente explicación de los temas",
        "Muy paciente con los estudiantes",
        "Material de apoyo muy útil",
        "Buen manejo del tiempo en clase",
        "Fomenta la participación activa"
      ],
      sugerencias: [
        "Podría incluir más ejemplos prácticos",
        "A veces el ritmo es muy rápido",
        "Más retroalimentación individual",
        "Incorporar más tecnología en clase"
      ]
    },
    tendencia: 'mejora',
    fechaActualizacion: '2024-01-20'
  };

  useEffect(() => {
    const loadEvaluacion = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada al backend
        // const data = await authService.getTeacherEvaluation(userId);
        // setEvaluacion(data);
        
        // Por ahora usamos datos de ejemplo
        setTimeout(() => {
          setEvaluacion(datosEjemplo);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error cargando evaluación:', error);
        setLoading(false);
      }
    };

    loadEvaluacion();
  }, [userId]);

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (score >= 8) return { text: 'Muy Bueno', color: 'bg-blue-100 text-blue-800' };
    if (score >= 7) return { text: 'Bueno', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 6) return { text: 'Regular', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Necesita mejorar', color: 'bg-red-100 text-red-800' };
  };

  const renderStars = (score: number) => {
    const stars = [];
    const filledStars = Math.floor(score / 2);
    const hasHalfStar = (score / 2) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < filledStars) {
        stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === filledStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluación Docente</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!evaluacion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluación Docente</CardTitle>
          <CardDescription>No disponible</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay datos de evaluación disponibles</h3>
          <p className="text-muted-foreground mb-4">
            La evaluación docente se actualiza al final de cada periodo académico
          </p>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Ver periodos anteriores
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scoreInfo = getScoreBadge(evaluacion.promedioGeneral);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Evaluación Docente</CardTitle>
              <CardDescription>Período: {evaluacion.periodo}</CardDescription>
            </div>
            <Badge className={scoreInfo.color}>
              <Award className="h-3 w-3 mr-1" />
              {scoreInfo.text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Resumen General */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resumen General</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {evaluacion.totalEvaluaciones} evaluaciones
                </Badge>
                <Badge variant="outline" className={`gap-1 ${
                  evaluacion.tendencia === 'mejora' ? 'text-green-600' :
                  evaluacion.tendencia === 'disminuye' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {evaluacion.tendencia === 'mejora' ? <TrendingUp className="h-3 w-3" /> :
                   evaluacion.tendencia === 'disminuye' ? <TrendingDown className="h-3 w-3" /> :
                   <BarChart3 className="h-3 w-3" />}
                  {evaluacion.tendencia === 'mejora' ? 'En mejora' :
                   evaluacion.tendencia === 'disminuye' ? 'En disminución' : 'Estable'}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Puntuación General */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(evaluacion.promedioGeneral)}`}>
                      {evaluacion.promedioGeneral.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">Promedio General</div>
                    <div className="flex justify-center mb-3">
                      {renderStars(evaluacion.promedioGeneral)}
                    </div>
                    <Progress value={(evaluacion.promedioGeneral / 10) * 100} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Comparativa */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tu puntuación</span>
                        <span className="font-bold">{evaluacion.promedioGeneral.toFixed(1)}</span>
                      </div>
                      <Progress value={(evaluacion.promedioGeneral / 10) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Promedio departamento</span>
                        <span className="font-bold">8.2</span>
                      </div>
                      <Progress value={82} className="bg-blue-100" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Promedio institucional</span>
                        <span className="font-bold">7.8</span>
                      </div>
                      <Progress value={78} className="bg-gray-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ranking */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">#3</div>
                    <div className="text-sm text-muted-foreground mb-3">Posición en el departamento</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Top departamento:</span>
                        <span className="font-bold">9.1</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Tu posición:</span>
                        <span className="font-bold">8.7</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Diferencia:</span>
                        <span className="font-bold text-green-600">+0.4</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b mb-6">
            <nav className="flex space-x-4">
              <Button
                variant={activeTab === 'general' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('general')}
                className="px-4"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                General
              </Button>
              <Button
                variant={activeTab === 'categorias' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('categorias')}
                className="px-4"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Por Categorías
              </Button>
              <Button
                variant={activeTab === 'comentarios' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('comentarios')}
                className="px-4"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comentarios
              </Button>
            </nav>
          </div>

          {/* Contenido según tab activo */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Tendencia Histórica</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">9.0</div>
                      <div className="text-sm text-muted-foreground">2023-2</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">8.5</div>
                      <div className="text-sm text-muted-foreground">2023-1</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">8.2</div>
                      <div className="text-sm text-muted-foreground">2022-2</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">8.0</div>
                      <div className="text-sm text-muted-foreground">2022-1</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'categorias' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Evaluación por Categorías</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(evaluacion.categorias).map(([categoria, puntuacion]) => (
                  <Card key={categoria}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium capitalize">
                            {categoria === 'didactica' ? 'Didáctica' :
                             categoria === 'conocimiento' ? 'Conocimiento' :
                             categoria === 'puntualidad' ? 'Puntualidad' :
                             categoria === 'trato' ? 'Trato con estudiantes' :
                             'Claridad en explicaciones'}
                          </h4>
                          <span className={`font-bold ${getScoreColor(puntuacion)}`}>
                            {puntuacion.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={(puntuacion / 10) * 100} />
                        <div className="flex justify-center">
                          {renderStars(puntuacion)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comentarios' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Comentarios Positivos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      Aspectos Positivos
                    </CardTitle>
                    <CardDescription>Lo que más valoran tus estudiantes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {evaluacion.comentarios.positivo.map((comentario, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                          <span className="text-sm">{comentario}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Sugerencias */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Sugerencias de Mejora
                    </CardTitle>
                    <CardDescription>Áreas de oportunidad identificadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {evaluacion.comentarios.sugerencias.map((sugerencia, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                          <span className="text-sm">{sugerencia}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Estadísticas de comentarios */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Comentarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {evaluacion.comentarios.positivo.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Comentarios positivos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {evaluacion.comentarios.sugerencias.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Sugerencias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-sm text-muted-foreground">Tasa de satisfacción</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">12%</div>
                      <div className="text-sm text-muted-foreground">Crecimiento vs período anterior</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-between">
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Ver historial completo
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Descargar reporte
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Compartir logros
          </Button>
        </div>
      </div>
    </div>
  );
}