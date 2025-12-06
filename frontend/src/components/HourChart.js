// src/components/HourChart.js
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function HourChart({ data }) {
  // data expected: [{hour:0,count:10},...]
  if (!data || data.length === 0) return <div style={{padding:20}}>No hourly data</div>;

  // ensure hours 0..23 present for nicer X axis
  const map = {};
  data.forEach(d => map[d.hour] = d.count);
  const filled = Array.from({length:24}, (_,h) => ({ hour: h, count: map[h] ?? 0 }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={filled}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tick={{ fontSize:12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
