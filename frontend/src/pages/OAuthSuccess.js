import { useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function OAuthSuccess() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  // ✅ Get token from URL
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // ❌ No token → go back to login
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    try {
      // ✅ Decode JWT token
      const payload = JSON.parse(atob(token.split(".")[1]));

      // ✅ Save auth state
      login({
        token,
        user: payload,
      });

      // ✅ Redirect to dashboard or admin
      if (payload.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (error) {
      console.error("OAuth error:", error);
      navigate("/", { replace: true });
    }

  }, [token, login, navigate]);

  return (
    <div className="page">
      <p>Logging you in...</p>
    </div>
  );
}