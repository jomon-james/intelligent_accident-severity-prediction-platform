// src/components/SeverityChart.js
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#16a34a","#A3E635","#F59E0B","#F97316","#EF4444","#94a3b8"];

export default function SeverityChart({ data }) {
  // expect data = [{name, value}, ...]
  if (!data || data.length === 0) return <div style={{padding:20}}>No severity data</div>;
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={50} outerRadius={90} paddingAngle={4}>
            {data.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(val) => [val, "Count"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
