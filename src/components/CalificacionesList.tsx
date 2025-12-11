import React, { useEffect, useState } from 'react';
import { obtenerCalificacionesPorEstudiante } from '../services/calificacionesService';

interface Calificacion {
  materia: string;
  calificacion: number;
  evaluacion: string;
  fecha: string;
}

interface Props {
  estudianteId: string;
}

const CalificacionesList: React.FC<Props> = ({ estudianteId }) => {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        const data = await obtenerCalificacionesPorEstudiante(estudianteId);
        setCalificaciones(data);
      } catch (err) {
        setError('No se pudieron cargar las calificaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchCalificaciones();
  }, [estudianteId]);

  if (loading) return <div>Cargando calificaciones...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>Calificaciones de {estudianteId}</h3>
      <table>
        <thead>
          <tr>
            <th>Materia</th>
            <th>Calificación</th>
            <th>Evaluación</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {calificaciones.map((calificacion, index) => (
            <tr key={index}>
              <td>{calificacion.materia}</td>
              <td>{calificacion.calificacion}</td>
              <td>{calificacion.evaluacion}</td>
              <td>{new Date(calificacion.fecha).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalificacionesList;
