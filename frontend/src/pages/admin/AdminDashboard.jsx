import React, { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminApi } from "../../api/services";

const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-value" style={color ? { backgroundImage: `linear-gradient(135deg, ${color}, var(--color-primary-light))` } : undefined}>
      {value ?? "—"}
    </div>
    <div className="stat-label">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.getDashboard();
        setStats(data);
      } catch {
        setError("Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <main className="dashboard-content">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview at a glance</p>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : (
            <div className="stats-grid">
              <StatCard icon="👥" value={stats?.totalUsers}   label="Total Users"   color="#6c63ff" />
              <StatCard icon="🏪" value={stats?.totalStores}  label="Total Stores"  color="#f59e0b" />
              <StatCard icon="⭐" value={stats?.totalRatings} label="Ratings Given" color="#10b981" />
            </div>
          )}

          <div className="card" style={{ marginTop: "0.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "0.75rem" }}>
              Quick Actions
            </h2>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="/admin/add-user"  className="btn btn-primary">➕ Add New User</a>
              <a href="/admin/add-store" className="btn btn-secondary">🏪 Add New Store</a>
              <a href="/admin/users"     className="btn btn-secondary">👥 View All Users</a>
              <a href="/admin/stores"    className="btn btn-secondary">📋 View All Stores</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
