// src/components/DatasetUpload.js
import React, { useState } from "react";
import "./DatasetUpload.css";

export default function DatasetUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function handleFileChange(e) {
    setMessage(null);
    setColumns([]);
    setTarget("");
    const f = e.target.files[0];
    setFile(f || null);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage(null);
    if (!file) {
      setMessage({ type: "error", text: "Please choose a CSV file first." });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (target) form.append("target_column", target);

      // API base from your api.js or fallback
      const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost/my-project/api";

      const res = await fetch(`${API_BASE}/upload_dataset.php`, {
        method: "POST",
        body: form,
        credentials: "include" // important: include session cookie
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { ok: res.ok, text }; }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || text || "Upload failed");
      }

      setMessage({ type: "success", text: "Dataset uploaded successfully." });

      // if server returned columns, populate them
      if (data.dataset?.cols) {
        setColumns(data.dataset.cols);
      }

      if (typeof onUploaded === "function") onUploaded(data.dataset);
    } catch (err) {
      console.error("Upload error", err);
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-card card">
      <h3>Upload Dataset (CSV)</h3>

      <form onSubmit={handleUpload} className="upload-form">
        <label className="field">
          <div className="label">Choose CSV file</div>
          <input type="file" accept=".csv,.txt" onChange={handleFileChange} />
        </label>

        {columns.length > 0 && (
          <label className="field">
            <div className="label">Select target column (optional)</div>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">-- choose target column --</option>
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        )}

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Uploading…" : "Upload Dataset"}
          </button>
        </div>

        {message && (
          <div className={`message ${message.type === "error" ? "error" : "success"}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
