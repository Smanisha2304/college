import { useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function OAuthSuccess() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  }, [location.search]);

  useEffect(() => {
    const complete = async () => {
      if (!token) {
        navigate("/", { replace: true });
        return;
      }
      try {
        const validate = await axios.get("/api/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!validate.data?.valid || !validate.data?.user) {
          navigate("/", { replace: true });
          return;
        }
        login({ token, user: validate.data.user });
        navigate(validate.data.user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
      } catch {
        navigate("/", { replace: true });
      }
    };
    complete();
  }, [token, login, navigate]);

  return <p className="page">Completing Google sign-in...</p>;
}
