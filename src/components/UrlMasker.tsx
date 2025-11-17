import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function UrlMasker() {
  const location = useLocation();

  useEffect(() => {
    const maskUrl = () => {
      const baseUrl = window.location.origin + window.location.pathname;
      
      // Para rutas que no sean el login/register, enmascarar la URL
      if (location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register') {
        // Mostrar siempre la misma URL enmascarada para todas las rutas de la app
        const maskedUrl = baseUrl + '#/app';
        if (window.location.href !== maskedUrl) {
          window.history.replaceState(null, '', maskedUrl);
        }
      } else {
        // Para login/register, mantener la URL normal pero limpia
        const cleanUrl = baseUrl + '#/';
        if (window.location.href !== cleanUrl) {
          window.history.replaceState(null, '', cleanUrl);
        }
      }

      // Actualizar el título de la página según la ruta
      updatePageTitle(location.pathname);
    };

    const updatePageTitle = (pathname: string) => {
      const titleMap: { [key: string]: string } = {
        '/': 'Metricampus - Iniciar Sesión',
        '/login': 'Metricampus - Iniciar Sesión',
        '/register': 'Metricampus - Registrarse',
        '/docente': 'Metricampus - Panel Docente',
        '/docente/dashboard': 'Metricampus - Dashboard Docente',
        '/docente/materias': 'Metricampus - Mis Materias',
        '/docente/estudiantes': 'Metricampus - Mis Estudiantes',
        '/docente/institucion': 'Metricampus - Mi Institución',
        '/docente/solicitar-institucion': 'Metricampus - Solicitar Institución',
        '/docente/perfil': 'Metricampus - Mi Perfil',
        '/jefe-academico': 'Metricampus - Panel Jefe Académico',
        '/jefe-academico/dashboard': 'Metricampus - Dashboard Jefe Académico',
        '/jefe-academico/docentes': 'Metricampus - Gestión de Docentes',
        '/jefe-academico/materias': 'Metricampus - Gestión de Materias',
        '/jefe-academico/institucion': 'Metricampus - Institución',
        '/jefe-academico/indicadores': 'Metricampus - Indicadores',
        '/jefe-academico/crear-institucion': 'Metricampus - Crear Institución',
        '/jefe-academico/perfil': 'Metricampus - Mi Perfil',
        '/subdirector-academico': 'Metricampus - Panel Subdirector',
        '/subdirector-academico/dashboard': 'Metricampus - Dashboard General',
        '/subdirector-academico/instituciones': 'Metricampus - Instituciones',
        '/subdirector-academico/personal': 'Metricampus - Personal Académico',
        '/subdirector-academico/indicadores': 'Metricampus - Indicadores Globales',
        '/subdirector-academico/programas': 'Metricampus - Programas Académicos',
        '/subdirector-academico/crear-institucion': 'Metricampus - Crear Institución',
        '/subdirector-academico/perfil': 'Metricampus - Mi Perfil',
      };

      document.title = titleMap[pathname] || 'Metricampus';
    };

    maskUrl();
  }, [location]);

  return null; // Este componente no renderiza nada visible
}

export default UrlMasker;