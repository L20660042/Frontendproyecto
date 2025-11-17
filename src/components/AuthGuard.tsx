import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuthGuard(requiredAuth = true) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      console.log('=== AUTH GUARD CHECK ===');
      console.log('Token exists:', !!token);
      console.log('UserData exists:', !!userData);
      
      if (requiredAuth) {
        // Si requiere autenticación pero no está autenticado
        if (!token || !userData) {
          console.log('No autenticado, redirigiendo a login');
          navigate('/');
          return false;
        }
        
        try {
          const user = JSON.parse(userData);
          console.log('Usuario autenticado:', user.userType);
          return true;
        } catch (error) {
          console.log('Error parsing userData, redirigiendo a login');
          navigate('/');
          return false;
        }
      }
      
      return true;
    };

    checkAuth();
  }, [navigate, requiredAuth]);
}