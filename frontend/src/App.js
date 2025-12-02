// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Navbar from "./Navbar";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import DatasetUpload from "./components/DatasetUpload";
import FormInput from "./components/FormInput";

import "./global.css"; // ensure global styling is loaded

function LandingOrRedirect() {
  // If AuthContext sets redirection logic on mount (me()), this will route users to /home
  return <Navigate to="/home" replace />;
}

/* Lightweight error boundary to prevent whole-app crash during demos */
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(err, info) {
    console.error("AppErrorBoundary caught:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <p>We encountered an error while rendering the app. Check the console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppErrorBoundary>
          <Navbar />
          <main className="container" style={{ paddingTop: 18, paddingBottom: 40 }}>
            <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
              <Routes>
                <Route path="/" element={<LandingOrRedirect />} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/predict"
                  element={
                    <ProtectedRoute>
                      <FormInput />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <DatasetUpload onUploaded={() => window.location.reload()} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<div style={{ padding: 24 }}>404 — Page not found</div>} />
              </Routes>
            </Suspense>
          </main>
        </AppErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
