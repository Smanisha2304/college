import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { token, user, loadingUser } = useContext(AuthContext);
  const location = useLocation();

  if (loadingUser) return <p>Loading...</p>;
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
