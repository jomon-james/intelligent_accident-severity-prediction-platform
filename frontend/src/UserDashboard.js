// src/UserDashboard.js
import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function UserDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Dashboard</h2>
      <p>Welcome, <strong>{user?.username}</strong>!</p>

      <div style={{ marginTop: "16px" }}>
        <p>Your role: <strong>{user?.role}</strong></p>
        <p>You can now submit accident data for prediction from the Home page.</p>
      </div>
    </div>
  );
}
