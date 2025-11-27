import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export function useAuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (!token || !userData) {
        console.log('No hay token o datos de usuario, redirigiendo a login');
        navigate('/');
        return;
      }

      try {
        // Verificar si el token es válido intentando obtener el perfil
        await authService.getProfile();
      } catch (error) {
        console.error('Error de autenticación:', error);
        authService.logout();
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);
}