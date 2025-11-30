// src/api.js
export const API_BASE = "http://localhost/my-project/api";
// change if your PHP API is in a different location

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}/${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {})
    },
    ...opts
  });

  let text = await res.text();
  try {
    return { ok: res.ok, data: JSON.parse(text), status: res.status };
  } catch {
    return { ok: res.ok, data: text, status: res.status };
  }
}
