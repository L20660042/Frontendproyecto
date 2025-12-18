import React from "react";
import { Navigate } from "react-router-dom";
import { type Role, useAuth } from "./AuthContext";

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const auth = useAuth();
  if (!auth.role) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
