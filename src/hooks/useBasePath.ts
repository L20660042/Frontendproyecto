import { useMemo } from 'react';

export const useBasePath = () => {
  const basePath = useMemo(() => {
    // En producción con GitHub Pages
    if (import.meta.env.PROD) {
      return '/Frontendproyecto';
    }
    // En desarrollo
    return '';
  }, []);

  return basePath;
};