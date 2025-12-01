// src/UserDashboard.js
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { apiFetch } from "./api";

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("user_stats.php", { method: "GET" });
        if (!res.ok) {
          const message = res.data?.error || `Status ${res.status}`;
          if (mounted) setError(message);
        } else {
          if (mounted) setStats(res.data);
        }
      } catch (e) {
        if (mounted) setError("Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStats();
    return () => { mounted = false; };
  }, []);

  function goToPredict() {
    navigate("/predict");
  }
  function goToUpload() {
    navigate("/upload");
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>User Dashboard</h2>
      <p>Welcome, <strong>{user?.username}</strong>!</p>

      <div style={{ marginTop: 16 }}>
        <p>Your role: <strong>{user?.role ?? "user"}</strong></p>
        <p>You can submit accident data for prediction from the Predict page or upload datasets for analysis.</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <button onClick={goToPredict} style={actionBtnStyle}>Go to Predict</button>
          <button onClick={goToUpload} style={actionBtnStyle}>Upload Dataset</button>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: "#fafafa", border: "1px solid #eee" }}>
          {loading && <div>Loading stats...</div>}
          {error && <div style={{ color: "crimson" }}>Error: {error}</div>}

          {!loading && !error && stats && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard title="Datasets" value={stats.datasets_count ?? 0} />
              <StatCard title="Predictions" value={stats.predictions_count ?? 0} />
              <ModelCard model={stats.active_model} />
            </div>
          )}
        </div>
      </div>

      <section style={{ marginTop: 24 }}>
        <h3>Quick Notes</h3>
        <ul>
          <li>Upload CSV datasets via the <strong>Upload Dataset</strong> page; specify the target column for analysis.</li>
          <li>After uploading, you can ask an admin to retrain the model on the new dataset (or use retrain UI if you are admin).</li>
          <li>Recent predictions will appear here after calls to the Predict API (we store them in the database).</li>
        </ul>
      </section>
    </div>
  );
}

const actionBtnStyle = {
  padding: "8px 14px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  background: "#fff",
  cursor: "pointer"
};

function StatCard({ title, value }) {
  return (
    <div style={{ minWidth: 160, padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px rgba(16,24,40,0.03)" }}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function ModelCard({ model }) {
  if (!model) {
    return (
      <div style={{ minWidth: 260, padding: 12, borderRadius: 8, background: "#fff" }}>
        <div style={{ fontSize: 12, color: "#666" }}>Active Model</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>—</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#999" }}>No active model</div>
      </div>
    );
  }

  return (
    <div style={{ minWidth: 260, padding: 12, borderRadius: 8, background: "#fff" }}>
      <div style={{ fontSize: 12, color: "#666" }}>Active Model</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{model.name} <span style={{ fontWeight: 500, fontSize: 13 }}>({model.version})</span></div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>Uploaded: {model.created_at ? new Date(model.created_at).toLocaleString() : "—"}</div>
    </div>
  );
}
