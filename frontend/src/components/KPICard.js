// src/components/KPICard.js
import React from "react";
import "./KPICard.css";

export default function KPICard({ title, value }) {
  return (
    <div className="kpi-card">
      <div className="kpi-value">{value}</div>
      <div className="kpi-title">{title}</div>
    </div>
  );
}
