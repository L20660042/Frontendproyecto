import React from "react";
import { Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import { useAuth } from "./AuthContext";
import type { AppRole } from "../services/authService";

function homeByRole(role: AppRole) {
  switch (role) {
    case "SUPERADMIN":
      return "/dashboard/superadmin";
    case "ADMIN":
      return "/dashboard/admin";
    case "SERVICIOS_ESCOLARES":
      return "/control-escolar";
    case "DOCENTE":
      return "/docente";
    case "ALUMNO":
      return "/estudiante";
    case "JEFE":
      return "/jefe-academico";
    case "SUBDIRECCION":
      return "/subdireccion";
    case "DESARROLLO_ACADEMICO":
      return "/desarrollo-academico";
    default:
      return "/dashboard/admin";
  }
}

export function RequireRole({
  allow,
  children,
}: {
  allow: AppRole[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <RequireAuth>
      {!user ? null : user.roles.some((r) => allow.includes(r)) ? (
        <>{children}</>
      ) : (
        <Navigate to={homeByRole(user.role)} replace />
      )}
    </RequireAuth>
  );
}
