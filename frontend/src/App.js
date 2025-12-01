// src/App.js
import React from "react";
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

function LandingOrRedirect() {
  // Landing logic handled in AuthContext's initial me() call; show Home if logged-in
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingOrRedirect />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/predict" element={
            <ProtectedRoute>
              <FormInput />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <DatasetUpload onUploaded={() => window.location.reload()} />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<div style={{ padding: 24 }}>404 — Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
