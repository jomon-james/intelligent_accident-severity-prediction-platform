// src/DashboardContainer.js
import React, { useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import UserDatasetDashboard from "./UserDatasetDashboard";
import AdminDashboard from "./AdminDashboard";

/*
 DashboardContainer chooses which dashboard to show based on role.
 - admin -> AdminDashboard (existing)
 - other -> UserDatasetDashboard (analysis charts)
*/
export default function DashboardContainer() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // small debug log so you can see in browser console which branch runs
    console.log("DashboardContainer mount. user:", user);
  }, [user]);

  if (!user) {
    // If auth not ready, show a small notice
    return <div style={{ padding: 20 }}>Loading user session...</div>;
  }

  if (user.role && user.role.toLowerCase() === "admin") {
    return <AdminDashboard />;
  }

  // default -> regular user
  return <UserDatasetDashboard />;
}
