// src/components/TopFactors.js
import React from "react";

/**
 * Expects props.data like:
 * { "Weather_Conditions": [{value:"Fine",count:1000}, ...], "Road_Surface_Conditions": [...] }
 */
export default function TopFactors({ data }) {
  if (!data || Object.keys(data).length === 0) return <div style={{padding:20}}>No factor data</div>;

  return (
    <div className="top-factors">
      {Object.entries(data).map(([col, items]) => (
        <div className="factor-block" key={col}>
          <h5>{col}</h5>
          <ul>
            {items.map((it, i) => (
              <li key={i}><strong>{it.value}</strong> — {it.count.toLocaleString()}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
