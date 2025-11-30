// src/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

/**
 * Props:
 *  - children: React node
 *  - requiredRole: optional string e.g. "admin"
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  if (!user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // logged in but not authorized
    return <div style={{ padding: 20 }}>403 — Forbidden</div>;
  }

  return children;
}
