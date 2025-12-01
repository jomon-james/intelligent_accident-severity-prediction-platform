// src/api.js
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost/my-project/api";

// change the above if your API is at a different path (e.g. http://localhost/intelligent_accident-severity-platform/api)

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}/${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {})
    },
    ...opts
  });

  const text = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(text), status: res.status };
  } catch {
    return { ok: res.ok, data: text, status: res.status };
  }
}
