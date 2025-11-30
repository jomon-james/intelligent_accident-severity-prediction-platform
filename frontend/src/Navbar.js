// src/Navbar.js
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        background: "#f5f5f5",
        borderBottom: "1px solid #ddd"
      }}
    >
      <Link to="/" style={{ fontWeight: "bold" }}>Home</Link>

      {/* Show links only if authenticated */}
      {user ? (
        <>
          <Link to="/predict">Predict</Link>
          <Link to="/dashboard">Dashboard</Link>
          {user.role === "admin" && <Link to="/admin">Admin</Link>}

          <div style={{ marginLeft: "auto" }}>
            <span style={{ marginRight: 12 }}>Hi, {user.username}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                background: "#d9534f",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        // When not logged in show only Login / Register on the right
        <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
