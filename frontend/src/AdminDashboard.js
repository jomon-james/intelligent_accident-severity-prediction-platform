// src/AdminDashboard.js
import React, { useEffect, useState, useContext } from "react";
import { apiFetch } from "./api";
import { AuthContext } from "./AuthContext";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  // Fetch admin stats on mount
  useEffect(() => {
    async function loadStats() {
      const res = await apiFetch("admin_stats.php", { method: "GET" });

      if (!res.ok) {
        setErr(res.data?.error || "Failed to load admin stats");
      } else {
        setStats(res.data.stats);
      }
    }

    loadStats();
  }, []);

  if (!user) return <div>Unauthorized</div>;
  if (err) return <div style={{ color: "red", padding: "20px" }}>{err}</div>;
  if (!stats) return <div style={{ padding: "20px" }}>Loading admin data...</div>;

  const chartData = {
    labels: ["Users", "Predictions Logged"],
    datasets: [
      {
        label: "Count",
        data: [
          stats.user_count || 0,
          stats.prediction_count === null ? 0 : stats.prediction_count,
        ],
        backgroundColor: ["#4285F4", "#34A853"]
      }
    ]
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, <strong>{user.username}</strong> (Admin)</p>

      <div style={{ maxWidth: "600px", marginTop: "20px" }}>
        <Bar data={chartData} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>Total Users: <strong>{stats.user_count}</strong></p>
        <p>
          Predictions Logged:{" "}
          <strong>{stats.prediction_count ?? "Not enabled"}</strong>
        </p>
      </div>
    </div>
  );
}
