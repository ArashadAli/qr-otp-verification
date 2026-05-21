import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Login from "../pages/Login";
import UserDashboard from "../pages/UserDashboard";
import AdminVerification from "../pages/AdminVerification";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<Login />} />

    {/* User routes */}
    <Route
      path="/user/dashboard"
      element={
        <ProtectedRoute requiredRole="user">
          <UserDashboard />
        </ProtectedRoute>
      }
    />

    {/* Admin routes */}
    <Route
      path="/admin/verify"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminVerification />
        </ProtectedRoute>
      }
    />

    {/* Default redirect */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;