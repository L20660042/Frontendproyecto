import { type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Props = {
  allow: string[];
  children: JSX.Element;
};

export function RequireRole({ allow, children }: Props) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="p-6 text-muted-foreground">Cargando...</div>;
  }

if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
if (!allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
