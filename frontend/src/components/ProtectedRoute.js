import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loadingUser } = useContext(AuthContext);

  if (loadingUser) return <p>Loading...</p>;
  if (!token) return <Navigate to="/" replace />;

  return children;
}
