import { useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadAdminData = async () => {
    setError("");
    try {
      const usersRes = await axios.get("/api/admin/users");
      setUsers(usersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    }
  };

  const loadHistory = async (userId) => {
    setSelectedUserId(userId);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`/admin/user/${userId}/history`);
      setUserHistory(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user history");
      setUserHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Manage users, history, and delete requests.</p>
        </div>
        <button
          type="button"
          className="logout-btn"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          Logout
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      <section className="route-card">
        <h3>Users</h3>
        {(users || []).map((u) => (
          <div key={u.id} className="admin-row">
            <div className="admin-block">
              <span>{u.fullName}</span>
              <div className="admin-meta">{u.email} • {u.role}</div>
            </div>
            <button type="button" onClick={() => loadHistory(u.id)}>View History</button>
          </div>
        ))}
      </section>

      <section className="route-card">
        <h3>
          User History{" "}
          {selectedUserId ? (
            <span className="admin-meta">
              (User #{selectedUserId} • {loadingHistory ? "Loading..." : `${userHistory.length} items`})
            </span>
          ) : (
            <span className="admin-meta">(Select a user)</span>
          )}
        </h3>
        {(userHistory || []).map((h) => (
          <div key={h.id} className="admin-row">
            <div className="admin-block">
              <span>
                {h.destination}{" "}
                {getRouteSummary(h.routeJson) ? (
                  <span className="admin-meta">• {getRouteSummary(h.routeJson)}</span>
                ) : null}
              </span>
              <div className="admin-meta">
                {h.sourceLabel ? `From ${h.sourceLabel} • ` : ""}
                Source: {h.source || "-"} • {new Date(h.createdAt).toLocaleString()}
              </div>
            </div>
            {h.routeJson ? (
              <details className="admin-route-details">
                <summary>Route JSON</summary>
                <pre>{prettyJson(h.routeJson)}</pre>
              </details>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}

function getRouteSummary(routeJson) {
  if (!routeJson) return "";
  try {
    const obj = typeof routeJson === "string" ? JSON.parse(routeJson) : routeJson;
    const rec = obj?.recommendation;
    if (!rec) return "";
    return rec.name || rec.id || "";
  } catch {
    return "";
  }
}

function prettyJson(routeJson) {
  try {
    const obj = typeof routeJson === "string" ? JSON.parse(routeJson) : routeJson;
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(routeJson);
  }
}
