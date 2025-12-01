// src/components/DatasetUpload.js
import React, { useState } from "react";

export default function DatasetUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!file) return setMessage("Please choose a CSV file.");
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("target_column", target);

    try {
      const apiBase = process.env.REACT_APP_API_BASE || "http://localhost/my-project/api";
      const res = await fetch(`${apiBase}/upload_dataset.php`, {
        method: "POST",
        body: fd,
        credentials: "include" // important to include session cookie
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setMessage("Upload successful.");
      if (typeof onUploaded === "function") onUploaded(data);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Upload error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "20px auto", padding: 16 }}>
      <h3>Upload Dataset (CSV)</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div style={{ marginTop: 8 }}>
          <label>Target column name (e.g. severity)</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="target column name"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload & Analyze"}
          </button>
        </div>
      </form>

      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}
