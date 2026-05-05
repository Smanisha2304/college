import { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");
    try {
      await axios.post("/api/auth/signup", form);
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="page-bg">
      <div className="auth-container">
        <h2 className="auth-title">Signup</h2>
        <p className="auth-tagline">Create your account 🚀</p>

        <div className="auth-card">
          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="signup-fullname">Full Name</label>
            <input
              id="signup-fullname"
              placeholder="Full Name"
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
          </div>
          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="signup-mobile">Mobile Number</label>
            <input
              id="signup-mobile"
              placeholder="Mobile Number"
              onChange={(e) =>
                setForm({ ...form, mobileNumber: e.target.value })
              }
            />
          </div>
          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              placeholder="Email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>
          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="signup-password">Password</label>
            <PasswordField
              id="signup-password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <PasswordField
              id="signup-confirm-password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          <button className="auth-btn" onClick={handleSignup}>
            Signup
          </button>

          {error && <p className="error">{error}</p>}

          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}