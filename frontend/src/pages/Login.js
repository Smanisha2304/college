// import { useState, useContext } from "react";
// import axios from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     setError("");
//     try {
//       const res = await axios.post("/auth/login", { email, password });
//       login(res.data);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.msg || "Login failed");
//     }
//   };

//   return (
//     <div className="page">
//       <h2>Login</h2>
//       <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
//       <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
//       <button onClick={handleLogin}>Login</button>
//       {error && <p className="error">{error}</p>}
//       <p><Link to="/signup">Create account</Link></p>
//       <p><Link to="/forgot-password">Forgot password?</Link></p>
//     </div>
//   );
// }

import { useState, useContext, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { token, user, loadingUser, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;
    if (token && user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [token, user, loadingUser, navigate]);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      login(res.data);
      navigate(res.data?.user?.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-bg">
      <div className="auth-container">
        
        {/* PROJECT TITLE */}
        <h1 className="auth-title">🚦 SmartRoute AI</h1>
        <p className="auth-tagline">
          Smart Traffic Prediction & Route Optimization
        </p>

        {/* LOGIN CARD */}
        <div className="auth-card">
          <h2>Login</h2>

          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-field-block">
            <label className="auth-field-label" htmlFor="login-password">Password</label>
            <PasswordField
              id="login-password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="auth-btn" onClick={handleLogin}>
            Login
          </button>
          <a className="google-auth-btn" href="http://localhost:8080/oauth2/authorization/google">
            Continue with Google
          </a>

          {/* ERROR */}
          {error && <p className="error">{error}</p>}

          {/* LINKS */}
          <div className="auth-links">
            <p>
              <Link to="/signup">Create account</Link>
            </p>
            <p>
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}