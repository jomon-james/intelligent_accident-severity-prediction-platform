// src/Navbar.js
import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./Navbar.css";

/*
  Presentation-ready Navbar.
  Works with AuthContext that exposes either:
    - logout() function, or
    - setUser() so we can clear session on client side.

  Behavior:
    - If logout() exists on context, call it.
    - Otherwise call API logout.php (POST) and clear setUser if present.
*/

function IconHamburger({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"></path>
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, setUser } = useContext(AuthContext || {});
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    try {
      if (typeof logout === "function") {
        // If AuthContext supplies a logout helper, use it
        await logout();
      } else {
        // Fallback: call PHP logout endpoint
        const apiBase = process.env.REACT_APP_API_BASE || "http://localhost/my-project/api";
        await fetch(`${apiBase}/logout.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (typeof setUser === "function") setUser(null);
      }
    } catch (err) {
      console.error("Logout failed:", err);
      // still clear local user if possible
      if (typeof setUser === "function") setUser(null);
    } finally {
      navigate("/login");
    }
  }

  const isAdmin = user?.role === "admin";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand" onClick={() => navigate("/home")} role="button" tabIndex={0}>
          <div className="brand-logo" aria-hidden>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="5" fill="#1976d2"></rect>
              <path d="M6 16.5V7.5L12 4l6 3.5v9" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-text">
            <div className="project-title">Intelligent Accident Severity</div>
            <div className="project-sub">Prediction Platform</div>
          </div>
        </div>

        <button className="hamburger" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          <IconHamburger />
        </button>

        <nav className={`navlinks ${open ? "open" : ""}`} aria-label="Main navigation">
          <NavLink to="/home" className={({isActive}) => isActive ? "navlink active" : "navlink"}>Home</NavLink>
          <NavLink to="/predict" className={({isActive}) => isActive ? "navlink active" : "navlink"}>Predict</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "navlink active" : "navlink"}>Dashboard</NavLink>
          <NavLink to="/upload" className={({isActive}) => isActive ? "navlink active" : "navlink"}>Upload</NavLink>
          {isAdmin && <NavLink to="/admin" className={({isActive}) => isActive ? "navlink active admin" : "navlink admin"}>Admin</NavLink>}
        </nav>

        <div className="userpanel">
          {user ? (
            <>
              <div className="user-info" title={user.email || ""}>
                <div className="avatar" aria-hidden>
                  {/* initials fallback */}
                  {user.username ? user.username.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "U"}
                </div>
                <div className="user-meta">
                  <div className="user-name">{user.username || user.email}</div>
                  <div className={`user-role ${isAdmin ? "role-admin" : "role-user"}`}>{user.role || "user"}</div>
                </div>
              </div>

              <div className="user-actions">
                <button className="btn btn-ghost" onClick={() => navigate("/profile")}>Profile</button>
                <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => navigate("/login")}>Login</button>
              <button className="btn" onClick={() => navigate("/register")}>Register</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
