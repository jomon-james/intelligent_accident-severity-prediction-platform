// src/App.js
import React, { useState, useContext } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import FormInput from "./components/FormInput";
import ResultCard from "./components/ResultCard";
import "./App.css";

import { AuthProvider, AuthContext } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Register from "./Register";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import Navbar from "./Navbar";

// Home page for authenticated users (prediction + model info)
function HomeAuthenticated() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ padding: 16 }}>
      <FormInput onResult={setResult} />
      {result && <ResultCard result={result} />}
    </div>
  );
}

// Landing route: if loading show message, if not logged -> redirect to /login, else -> home
function Landing() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: 20 }}>Checking session...</div>;
  }

  // Not logged in -> go to login page
  if (!user) return <Navigate to="/login" replace />;

  // Logged in -> show authenticated home
  return <HomeAuthenticated />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* root behaves as landing which redirects to login when not authenticated */}
          <Route path="/" element={<Landing />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected pages */}
          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <HomeAuthenticated />
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
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<div style={{ padding: 20 }}>404 — Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
