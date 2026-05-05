import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      return setError("Email is required");
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await axios.post("/api/auth/forgot-password", { email });

      // ✅ Always show generic message (security best practice)
      setMessage("If this email is registered, check your inbox for reset instructions.");
    } catch (err) {
      // ❗ still show same message to avoid user enumeration
      setMessage("If this email is registered, check your inbox for reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
  <div className="reset-card">

    <div className="app-title">
      <h1>Smart Traffic Prediction</h1>
      <p>Route Recommendation System</p>
    </div>

    <h2 className="form-title">Forgot Password</h2>

    <input
      type="email"
      placeholder="Enter your registered email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="reset-input"
    />

    <button onClick={handleSubmit} disabled={loading} className="reset-btn">
      {loading ? "Sending..." : "Send Reset Link"}
    </button>

    {message && <p className="success">{message}</p>}
    {error && <p className="error">{error}</p>}

    <p className="link-text">
      <Link to="/login">Back to Login</Link>
    </p>

  </div>
</div>
  );
}