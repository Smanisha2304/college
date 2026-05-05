import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { token, user, loadingUser } = useContext(AuthContext);

  if (loadingUser) return <p>Loading...</p>;
  if (!token || !user) return <Navigate to="/" replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
