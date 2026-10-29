import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./styles/global.css";

// Lazy-load pages for better initial bundle size
const LoginPage        = lazy(() => import("./pages/LoginPage"));
const RegisterPage     = lazy(() => import("./pages/RegisterPage"));
const AdminDashboard   = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUserList    = lazy(() => import("./pages/admin/AdminUserList"));
const AdminUserDetail  = lazy(() => import("./pages/admin/AdminUserDetail"));
const AdminAddUser     = lazy(() => import("./pages/admin/AdminAddUser"));
const AdminAddStore    = lazy(() => import("./pages/admin/AdminAddStore"));
const AdminStoreList   = lazy(() => import("./pages/admin/AdminStoreList"));
const UserHomePage     = lazy(() => import("./pages/user/UserHomePage"));
const UserProfilePage  = lazy(() => import("./pages/user/UserProfilePage"));
const StoreOwnerDashboard = lazy(() => import("./pages/store/StoreOwnerDashboard"));

const PageLoader = () => (
  <div className="spinner-overlay" style={{ minHeight: "100vh" }}>
    <div className="spinner" />
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users"     element={<AdminUserList />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/add-user"  element={<AdminAddUser />} />
            <Route path="/admin/add-store" element={<AdminAddStore />} />
            <Route path="/admin/stores"    element={<AdminStoreList />} />
          </Route>

          {/* Normal user routes */}
          <Route element={<ProtectedRoute allowedRoles={["normal_user"]} />}>
            <Route path="/home"    element={<UserHomePage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          {/* Store owner routes */}
          <Route element={<ProtectedRoute allowedRoles={["store_owner"]} />}>
            <Route path="/store/dashboard" element={<StoreOwnerDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
