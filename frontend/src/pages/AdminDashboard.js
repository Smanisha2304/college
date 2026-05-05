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
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [error, setError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadAdminData = async () => {
    setError("");
    try {
      const [usersRes, deleteRes] = await Promise.all([
        axios.get("/api/admin/users"),
        axios.get("/api/admin/delete-requests"),
      ]);
      setUsers(usersRes.data || []);
      setDeleteRequests(deleteRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    }
  };

  const loadHistory = async (userId) => {
    setSelectedUserId(userId);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`/api/admin/history/${userId}`);
      setUserHistory(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user history");
      setUserHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const actionDeleteRequest = async (id, action) => {
    try {
      await axios.post(`/api/admin/delete-requests/${id}/${action}`);
      await loadAdminData();
      if (selectedUserId) {
        await loadHistory(selectedUserId);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request`);
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
              <span>{h.destination}</span>
              <div className="admin-meta">
                {h.sourceLabel ? `From ${h.sourceLabel} • ` : ""}
                History ID: {h.id} • {new Date(h.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="route-card">
        <h3>Delete Requests</h3>
        {(deleteRequests || []).map((req) => (
          <div key={req.id} className="admin-row">
            <div className="admin-block">
              <span>
                Request #{req.id} • {req.status}
              </span>
              <div className="admin-meta">
                User: {req.userEmail || req.userId} • History ID: {req.historyId} • Destination: {req.destination}
              </div>
              <div className="admin-meta">
                Requested: {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : "-"}
                {req.actionedAt ? ` • Actioned: ${new Date(req.actionedAt).toLocaleString()}` : ""}
              </div>
            </div>
            {req.status === "PENDING" && (
              <div className="admin-actions">
                <button type="button" onClick={() => actionDeleteRequest(req.id, "approve")}>Approve</button>
                <button type="button" onClick={() => actionDeleteRequest(req.id, "reject")}>Reject</button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
