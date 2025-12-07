import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: any) {
  const token = localStorage.getItem("authToken");

  if (!token) return <Navigate to="/login" replace />;

  return children;
}
