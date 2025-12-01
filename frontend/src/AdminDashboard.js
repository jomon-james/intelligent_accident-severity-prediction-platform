// src/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";

/**
 * AdminDashboard - safe rendering: never prints raw objects directly.
 * Use this as a drop-in replacement to avoid the "Objects are not valid as a React child" error.
 */

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);
  const [retrainLoading, setRetrainLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const s = await apiFetch("admin_stats.php", { method: "GET" });
        if (!s.ok) throw new Error(s.data?.error || "Failed to load admin stats");
        if (mounted) setStats(s.data?.stats ?? {});

        // optional dataset list (safe fallback)
        const d = await apiFetch("list_datasets.php", { method: "GET" });
        if (d.ok && Array.isArray(d.data?.datasets)) {
          if (mounted) setDatasets(d.data.datasets);
        }

        const m = await apiFetch("models_list.php", { method: "GET" });
        if (m.ok && Array.isArray(m.data?.models)) {
          if (mounted) setModels(m.data.models);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || "Server error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => { mounted = false; };
  }, []);

  async function handleRetrain(datasetId) {
    if (!datasetId) return;
    setRetrainLoading(true);
    try {
      const res = await apiFetch("admin_retrain.php", {
        method: "POST",
        body: JSON.stringify({ dataset_id: datasetId, target_column: "severity" })
      });
      if (!res.ok) throw new Error(res.data?.error || "Retrain failed");
      alert("Retrain started successfully (server response: " + (res.data?.fastapi ? JSON.stringify(res.data.fastapi) : "ok") + ")");
    } catch (e) {
      console.error(e);
      alert("Retrain error: " + (e.message || e));
    } finally {
      setRetrainLoading(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading admin dashboard...</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>Error: {error}</div>;

  // Safe rendering: extract values instead of rendering objects directly
  const userCount = stats?.user_count ?? "—";
  const predictionCount = stats?.prediction_count ?? "—";

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <InfoCard title="Users" value={userCount} />
        <InfoCard title="Predictions" value={predictionCount} />
        <InfoCard title="Datasets" value={datasets.length} />
        <InfoCard title="Models" value={models.length} />
      </div>

      <section style={{ marginTop: 20 }}>
        <h3>Datasets</h3>
        {datasets.length === 0 ? <div>No uploaded datasets</div> : (
          <div style={{ display: "grid", gap: 8 }}>
            {datasets.map(ds => (
              <div key={ds.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
                <div><strong>{ds.filename}</strong></div>
                <div style={{ fontSize: 13, color: "#555" }}>Target: {ds.target_column || "—"}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => handleRetrain(ds.id)} disabled={retrainLoading}>Retrain on this dataset</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Models</h3>
        {models.length === 0 ? <div>No models found</div> : (
          <div style={{ display: "grid", gap: 8 }}>
            {models.map(m => (
              <div key={m.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 6 }}>
                <div style={{ fontWeight: 700 }}>{m.name} <span style={{ fontWeight: 400, color: "#666" }}>({m.version || "—"})</span></div>
                <div style={{ fontSize: 13, color: "#666" }}>Uploaded: {m.created_at ? new Date(m.created_at).toLocaleString() : "—"}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => alert("Activate model: " + m.id)}>Activate</button>
                  <button style={{ marginLeft: 8 }} onClick={() => alert("Download: " + (m.filepath || "—"))}>Download</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div style={{ minWidth: 160, padding: 12, borderRadius: 8, background: "#fff", boxShadow: "0 0 0 1px rgba(16,24,40,0.03)" }}>
      <div style={{ color: "#888", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{String(value)}</div>
    </div>
  );
}
