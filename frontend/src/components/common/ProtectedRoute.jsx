import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Wraps routes that need authentication.
 * Optionally restricts access to specific roles.
 *
 * Props:
 *   allowedRoles  – array of role strings. If omitted, any authenticated user passes.
 *   redirectTo    – where to send unauthenticated visitors (default: /login)
 */
const ProtectedRoute = ({ allowedRoles, redirectTo = "/login" }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated but wrong role — send to their own home
    const roleHome = { admin: "/admin", normal_user: "/home", store_owner: "/store" };
    return <Navigate to={roleHome[user.role] || "/login"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
