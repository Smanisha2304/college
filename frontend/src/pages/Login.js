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

import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
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

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-btn" onClick={handleLogin}>
            Login
          </button>

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