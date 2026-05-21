import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to correct dashboard
    if (user.role === "admin") return <Navigate to="/admin/verify" replace />;
    if (user.role === "user") return <Navigate to="/user/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;