// src/Home.js
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1>Intelligent Accident Severity Prediction Platform</h1>
        <p style={{ color: "#666" }}>
          Predict accident severity, upload datasets, and view analysis.
        </p>
      </header>

      <nav style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Link to="/predict" style={pillStyle}>Predict</Link>
        <Link to="/dashboard" style={pillStyle}>Dashboard</Link>
        <Link to="/upload" style={pillStyle}>Upload Dataset</Link>
      </nav>

      <section>
        <h3>Welcome</h3>
        <p>
          Use the Predict page to input road conditions and get a severity prediction.
          Visit Dashboard to see basic analysis and your recent activity.
        </p>
      </section>
    </div>
  );
}

const pillStyle = {
  display: "inline-block",
  padding: "8px 14px",
  background: "#1976d2",
  color: "#fff",
  borderRadius: 6,
  textDecoration: "none"
};
