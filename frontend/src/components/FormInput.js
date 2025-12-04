import React, { useState } from "react";
import "./FormInput.css";
/*
  FormInput.js (STRING MODE)
  ------------------------------------
  Sends human-readable text values for the 4 categorical fields.
  This matches the synthetic model (trained on string categories).
*/

import { apiFetch } from "../api"; // <-- make sure this path points to your src/api.js

const WEATHER_OPTIONS = [
  "Fine no high winds",
  "Raining no high winds",
  "Snowing no high winds",
  "Fog or mist",
  "Strong winds",
  "Other"
];

const ROAD_OPTIONS = [
  "Dry",
  "Wet or damp",
  "Snow",
  "Ice",
  "Other"
];

const LIGHT_OPTIONS = [
  "Daylight",
  "Darkness - lights lit",
  "Darkness - no lighting",
  "Dusk/Dawn"
];

const AREA_OPTIONS = [
  "Urban",
  "Rural"
];

/* Human-friendly mapping for severity_label */
const SEVERITY_MAP = {
  0: { text: "No Injury", color: "#16a34a", desc: "No injuries expected or very mild impact." },
  1: { text: "Slight Injury", color: "#A3E635", desc: "Minor injuries (bruises, small cuts). Medical attention unlikely." },
  2: { text: "Moderate Injury", color: "#F59E0B", desc: "Notable injuries that may require medical treatment but are generally non-fatal." },
  3: { text: "Serious Injury", color: "#F97316", desc: "Severe injuries likely requiring hospitalization." },
  4: { text: "Fatal Accident", color: "#EF4444", desc: "High likelihood of life-threatening injuries or fatality." }
};

function FormInput({ onResult, onPredict }) {
  const [form, setForm] = useState({
    Speed_limit: 50,
    Weather_Conditions: WEATHER_OPTIONS[0],
    Road_Surface_Conditions: ROAD_OPTIONS[1],
    Light_Conditions: LIGHT_OPTIONS[0],
    Urban_or_Rural_Area: AREA_OPTIONS[0]
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    setError(null);
    setLoading(true);

    const payload = {
      Speed_limit: Number(form.Speed_limit),
      Weather_Conditions: form.Weather_Conditions,
      Road_Surface_Conditions: form.Road_Surface_Conditions,
      Light_Conditions: form.Light_Conditions,
      Urban_or_Rural_Area: form.Urban_or_Rural_Area
    };

    try {
      // Use PHP proxy so session cookie is checked and request is logged.
      const res = await apiFetch("predict.php", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // handle common cases
        if (res.status === 401) {
          throw new Error("Unauthorized — please login before predicting.");
        }
        // try to show server message if present
        const msg = res.data?.error || res.data?.detail || JSON.stringify(res.data) || "Prediction failed";
        throw new Error(msg);
      }

      const data = res.data;
      setResult(data);
      // Call whichever callback the parent provided
      if (typeof onResult === "function") onResult(data);
      if (typeof onPredict === "function") onPredict(data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || "Failed to predict");
    } finally {
      setLoading(false);
    }
  }

  function renderFriendlyResult(res) {
    // res.severity_label may be string or number
    const labelNum = Number(res?.severity_label);
    const map = SEVERITY_MAP[labelNum] || { text: "Unknown", color: "#6b7280", desc: "No description available." };
    const confidence = res?.confidence != null ? Number(res.confidence) : null;

    return (
      <div className="enhanced-result">
        <div className="result-head">
          <h3>🚧 Prediction Summary</h3>
          <div className="severity-badge" style={{ backgroundColor: map.color }}>
            {map.text}
          </div>
        </div>

        <div className="result-body">
          <div className="result-row">
            <div className="result-label">Confidence</div>
            <div className="result-value">{confidence != null ? `${(confidence * 100).toFixed(1)}%` : "—"}</div>
          </div>

          <div className="result-row" style={{ marginTop: 8 }}>
            <div className="result-label">Meaning</div>
            <div className="result-value">{map.desc}</div>
          </div>

          {/* Optional: show raw values for transparency */}
          <details className="raw-details" style={{ marginTop: 12 }}>
            <summary>Technical details</summary>
            <div style={{ marginTop: 8, fontSize: 13, color: "#475569" }}>
              <div><strong>Severity Class:</strong> {String(res.severity_class)}</div>
              <div><strong>Severity Label (raw):</strong> {String(res.severity_label)}</div>
              {confidence != null && <div><strong>Confidence (raw):</strong> {(confidence * 100).toFixed(1)}%</div>}
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <h2>Accident Severity Predictor</h2>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Speed Limit (km/h)
          <select
            name="Speed_limit"
            value={form.Speed_limit}
            onChange={handleChange}
          >
            {[20, 30, 40, 50, 60, 70, 80, 100].map((speed) => (
              <option key={speed} value={speed}>
                {speed}
              </option>
            ))}
          </select>
        </label>

        <label>
          Weather Condition
          <select
            name="Weather_Conditions"
            value={form.Weather_Conditions}
            onChange={handleChange}
          >
            {WEATHER_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Road Surface Condition
          <select
            name="Road_Surface_Conditions"
            value={form.Road_Surface_Conditions}
            onChange={handleChange}
          >
            {ROAD_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Light Condition
          <select
            name="Light_Conditions"
            value={form.Light_Conditions}
            onChange={handleChange}
          >
            {LIGHT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Area Type
          <select
            name="Urban_or_Rural_Area"
            value={form.Urban_or_Rural_Area}
            onChange={handleChange}
          >
            {AREA_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary predict-btn" type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>

      {error && <div className="error">❌ {error}</div>}

      {result && renderFriendlyResult(result)}
    </div>
  );
}

export default FormInput;
