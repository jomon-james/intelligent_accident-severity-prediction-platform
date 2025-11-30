// src/Login.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("login.php", {
        method: "POST",
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok) {
        setError(res.data?.error || "Login failed");
        setLoading(false);
        return;
      }

      const user = res.data?.user;
      if (!user) {
        setError("Login failed: no user returned");
        setLoading(false);
        return;
      }

      // store user in context (this ensures UI updates immediately)
      if (typeof setUser === "function") setUser(user);

      // redirect by role
      if (user.role === "admin") navigate("/admin");
      else navigate("/predict");
    } catch (err) {
      console.error(err);
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "32px auto", padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ width: "100%", padding: 8, margin: "6px 0" }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, margin: "6px 0" }}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        {error && <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
