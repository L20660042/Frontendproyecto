import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");
      
      console.log("🔍 ProtectedRoute - Verificando autenticación:", {
        tieneToken: !!token,
        tieneUserData: !!userData,
        rutaActual: location.pathname
      });

      if (token && userData) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [location]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    console.log("🚫 No autenticado, redirigiendo a /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}