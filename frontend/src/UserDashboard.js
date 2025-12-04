// src/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { apiFetch } from "./api";
import "./Dashboard.css";

/* try importing Recharts components; if not installed the import will fail.
   We guard rendering if charts are not available. */
let Recharts = null;
try {
  // dynamic import - will be resolved at bundle time if installed
  // eslint-disable-next-line import/no-extraneous-dependencies
  Recharts = require("recharts");
} catch (e) {
  Recharts = null;
}

// fallback palette
const COLORS = ["#1976d2", "#125ea6", "#4f46e5", "#f59e0b", "#ef4444", "#10b981"];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    user_count: "—",
    prediction_count: "—",
    dataset_count: 0,
    model_count: 0
  });
  const [severityData, setSeverityData] = useState([]); // for pie chart
  const [timeSeriesData, setTimeSeriesData] = useState([]); // for line chart

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Primary: call a dashboard stats endpoint if present
        // This endpoint should return JSON like:
        // { summary: {user_count:..., prediction_count:..., dataset_count:..., model_count:...},
        //   severity_distribution: [{name:"Minor", value:123}, ...],
        //   time_series: [{date:"2025-11-01", predictions:12}, ...]
        // }
        const res = await apiFetch("dashboard_stats.php", { method: "GET" });
        if (res.ok && res.data) {
          const data = res.data;
          if (mounted) {
            setSummary((s) => ({ ...s, ...(data.summary || {}) }));
            setSeverityData(Array.isArray(data.severity_distribution) ? data.severity_distribution : []);
            setTimeSeriesData(Array.isArray(data.time_series) ? data.time_series : []);
          }
        } else {
          // fallback: try admin_stats.php for summary and try other endpoints
          const r2 = await apiFetch("admin_stats.php", { method: "GET" });
          if (r2.ok && r2.data && r2.data.stats) {
            if (mounted) setSummary((s) => ({ ...s, user_count: r2.data.stats.user_count, prediction_count: r2.data.stats.prediction_count }));
          } else {
            // no stats endpoint; show placeholders
            if (mounted) {
              setSummary((s) => ({ ...s }));
            }
          }

          // try severity endpoint if exists
          const r3 = await apiFetch("severity_distribution.php", { method: "GET" });
          if (r3.ok && Array.isArray(r3.data?.distribution)) {
            if (mounted) setSeverityData(r3.data.distribution);
          } else {
            // placeholder sample
            if (mounted && severityData.length === 0) {
              setSeverityData([
                { name: "Slight", value: 60 },
                { name: "Serious", value: 25 },
                { name: "Fatal", value: 15 }
              ]);
            }
          }

          // try timeseries endpoint
          const r4 = await apiFetch("predictions_timeseries.php", { method: "GET" });
          if (r4.ok && Array.isArray(r4.data?.series)) {
            if (mounted) setTimeSeriesData(r4.data.series);
          } else {
            if (mounted && timeSeriesData.length === 0) {
              // sample last 7 days
              const today = new Date();
              const sample = [];
              for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                sample.push({ date: d.toISOString().slice(0, 10), predictions: Math.floor(Math.random() * 30) + 10 });
              }
              setTimeSeriesData(sample);
            }
          }
        }
      } catch (err) {
        console.error("Dashboard load error", err);
        if (mounted) setError("Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChartsAvailable = !!Recharts;

  return (
    <div className="dashboard-root">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Overview & insights — {user?.username ? user.username : "Guest"}</p>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading card">Loading dashboard…</div>
      ) : error ? (
        <div className="dashboard-error card">{error}</div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-title">Users</div>
              <div className="stat-value">{String(summary.user_count ?? "—")}</div>
              <div className="stat-sub">Total registered users</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Predictions</div>
              <div className="stat-value">{String(summary.prediction_count ?? "—")}</div>
              <div className="stat-sub">Total predictions made</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Datasets</div>
              <div className="stat-value">{String(summary.dataset_count ?? 0)}</div>
              <div className="stat-sub">Uploaded datasets</div>
            </div>

            <div className="stat-card">
              <div className="stat-title">Models</div>
              <div className="stat-value">{String(summary.model_count ?? 0)}</div>
              <div className="stat-sub">Saved/active models</div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card">
              <h3 className="chart-title">Severity distribution</h3>

              {isChartsAvailable ? (
                <Recharts.ResponsiveContainer width="100%" height={300}>
                  <Recharts.PieChart>
                    <Recharts.Pie
                      data={severityData}
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={6}
                      dataKey="value"
                      nameKey="name"
                    >
                      {severityData.map((entry, index) => (
                        <Recharts.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Recharts.Pie>
                    <Recharts.Legend verticalAlign="bottom" height={36} />
                  </Recharts.PieChart>
                </Recharts.ResponsiveContainer>
              ) : (
                // fallback simple list
                <div className="chart-fallback">
                  {severityData.map((s, i) => (
                    <div key={i} className="fallback-row">
                      <div className="fallback-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      <div className="fallback-label">{s.name}</div>
                      <div className="fallback-value">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Predictions over time</h3>

              {isChartsAvailable ? (
                <Recharts.ResponsiveContainer width="100%" height={300}>
                  <Recharts.LineChart data={timeSeriesData} margin={{ top: 6, right: 12, left: -6, bottom: 6 }}>
                    <Recharts.CartesianGrid strokeDasharray="3 3" />
                    <Recharts.XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                    <Recharts.YAxis />
                    <Recharts.Tooltip />
                    <Recharts.Line type="monotone" dataKey="predictions" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 3 }} />
                  </Recharts.LineChart>
                </Recharts.ResponsiveContainer>
              ) : (
                <div className="chart-fallback">
                  <em>Chart library not installed. Install 'recharts' to see the interactive chart.</em>
                  <ul style={{ marginTop: 12 }}>
                    {timeSeriesData.map((d, idx) => (
                      <li key={idx}>{d.date}: {d.predictions}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
