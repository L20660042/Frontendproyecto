import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

export function useUserData() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          // Intentar cargar el perfil desde el backend
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return { user, loading };
}