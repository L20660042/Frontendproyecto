import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthGuardOptions {
  redirectTo?: string;
  requireUserData?: boolean;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const navigate = useNavigate();
  const { redirectTo = '/', requireUserData = true } = options;

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const userData = authService.getCurrentUser();

      // Verificar si ya estamos en la página de redirección para evitar loops
      const currentPath = window.location.pathname;
      if (currentPath === redirectTo) {
        return;
      }

      // Validar autorización según configuración
      const isUnauthorized = requireUserData 
        ? (!token || !userData)
        : !token;

      if (isUnauthorized) {
        console.log('No autorizado, redirigiendo a login');
        navigate(redirectTo, { replace: true });
        return;
      }

      try {
        // Verificar si el token es válido intentando obtener el perfil
        await authService.getProfile();
      } catch (error: any) {
        console.error('Error de autenticación:', error);
        
        // Verificar tipos específicos de errores de autenticación
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Token inválido o expirado');
        }
        
        authService.logout();
        navigate(redirectTo, { replace: true });
      }
    };

    checkAuth();
  }, [navigate, redirectTo, requireUserData]);
}