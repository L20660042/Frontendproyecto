import React from "react";
import { Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import { useAuth } from "./AuthContext";
import type { AppRole } from "../services/authService";

function homeByRole(role: AppRole) {
  switch (role) {
    case "superadmin":
      return "/dashboard/superadmin";
    case "admin":
      return "/dashboard/admin";
    case "control_escolar":
      return "/control-escolar";
    case "docente":
      return "/docente";
    case "estudiante":
      return "/estudiante";
    case "jefe_departamento":
      return "/jefe-academico";
    case "tutor":
      return "/tutor";
    case "capacitacion":
      return "/desarrollo-academico";
    default:
      return "/dashboard";
  }
}

export function RequireRole({
  allow,
  children,
}: {
  allow: AppRole[]; // roles permitidos
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <RequireAuth>
      {!user ? null : allow.includes(user.role) ? (
        <>{children}</>
      ) : (
        <Navigate to={homeByRole(user.role)} replace />
      )}
    </RequireAuth>
  );
}
