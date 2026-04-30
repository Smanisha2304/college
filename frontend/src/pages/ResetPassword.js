import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../api/axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage(res.data.message || "Password reset successful");

      setTimeout(() => navigate("/"), 1500);
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