// src/UserDatasetDashboard.js
import React, { useEffect, useState } from "react";
import KPICard from "./components/KPICard";
import SeverityChart from "./components/SeverityChart";
import HourChart from "./components/HourChart";
import TopFactors from "./components/TopFactors";
import "./Dashboard.css";

const ANALYSIS_API = process.env.REACT_APP_ANALYSIS_URL || "http://127.0.0.1:8001";

export default function UserDatasetDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${ANALYSIS_API}/analysis`, { credentials: "include" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load analysis");
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="dashboard-root">Loading dataset analysis…</div>;
  if (error) return <div className="dashboard-root error">Failed to load analysis: {error}</div>;
  if (!data) return <div className="dashboard-root">No analysis available.</div>;

  const basic = data.basic || {};
  const severity = data.severity_distribution || [];
  const byHour = data.by_hour || [];
  const topFactors = data.top_factors || {};

  // compute some KPIs
  const rows = basic.rows ?? 0;
  const mostCommonSeverity = (severity.length > 0 ? severity.reduce((a,b)=> a.value>b.value?a:b).name : "N/A");
  const fatalPct = (() => {
    const fatal = severity.find(s => String(s.name).toLowerCase().includes("fatal"))?.value ?? 0;
    return rows ? (fatal / rows * 100) : 0;
  })();

  return (
    <div className="dashboard-root">
      <h2>Dataset Analysis — {data.dataset || "AccidentsBig.csv"}</h2>

      <div className="kpi-row">
        <KPICard title="Total records" value={rows.toLocaleString()} />
        <KPICard title="Most common severity" value={String(mostCommonSeverity)} />
        <KPICard title="Fatal (%)" value={`${fatalPct.toFixed(2)}%`} />
        <KPICard title="Columns" value={(basic.cols || []).length} />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h4>Severity distribution</h4>
          <SeverityChart data={severity} />
        </div>

        <div className="chart-card">
          <h4>Accidents by hour</h4>
          <HourChart data={byHour} />
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card wide">
          <h4>Top categorical factors</h4>
          <TopFactors data={topFactors} />
        </div>

        <div className="chart-card">
          <h4>Sample rows</h4>
          <div className="sample-table">
            <table>
              <thead>
                <tr>
                  {(basic.cols || []).slice(0,6).map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {(basic.sample || []).map((row, i) => (
                  <tr key={i}>
                    {(basic.cols || []).slice(0,6).map((c) => <td key={c}>{String(row[c] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
