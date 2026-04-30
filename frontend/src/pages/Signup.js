import { useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

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
      navigate("/");
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
          <input
            placeholder="Full Name"
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />
          <input
            placeholder="Mobile Number"
            onChange={(e) =>
              setForm({ ...form, mobileNumber: e.target.value })
            }
          />

          <input
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />

          <button className="auth-btn" onClick={handleSignup}>
            Signup
          </button>

          {error && <p className="error">{error}</p>}

          <div className="auth-links">
            <Link to="/">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}