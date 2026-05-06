import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function ResetPassword() {
  const location = useLocation();
  const token = useMemo(() => getTokenFromLocation(location), [location]);
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing or invalid. Please request a new reset link.");
      return;
    }

    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage(res.data.message || "Password reset successful");

      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="reset-container">
  <div className="reset-card">

    <div className="app-title">
      <h1>Smart Traffic Prediction</h1>
      <p>Route Recommendation System</p>
    </div>

    <h2 className="form-title">Reset Password</h2>

    <input
      type="password"
      placeholder="Enter new password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="reset-input"
    />

    <button onClick={handleSubmit} className="reset-btn">
      Reset Password
    </button>

    {message && <p className="success">{message}</p>}
    {error && <p className="error">{error}</p>}
  </div>
</div>
  );
}

function getTokenFromLocation(location) {
  // HashRouter URLs look like:
  // http://localhost:3000/#/reset-password?token=...
  const direct = new URLSearchParams(location.search).get("token");
  if (direct) return direct;
  const hash = typeof location.hash === "string" ? location.hash : "";
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return null;
  const query = hash.slice(queryIndex + 1);
  return new URLSearchParams(query).get("token");
}