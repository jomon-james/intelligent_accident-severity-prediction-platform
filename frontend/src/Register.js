// src/Register.js
import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await register(username, email, password);
      navigate("/login");
    } catch (ex) {
      setErr(ex.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: 20, border: "1px solid #ddd", borderRadius: 6 }}>
      <h2>Register</h2>
      {err && <div style={{ color: "red" }}>{err}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>Register</button>
      </form>
    </div>
  );
}
