import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StarRating from "../../components/common/StarRating";
import { adminApi } from "../../api/services";

const ROLE_LABELS = {
  admin:       { label: "System Administrator", cls: "badge-admin" },
  normal_user: { label: "Normal User",          cls: "badge-normal" },
  store_owner: { label: "Store Owner",          cls: "badge-owner" },
};

const DetailRow = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border-color)" }}>
    <span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>
      {label}
    </span>
    <span style={{ color: "var(--text-primary)", fontSize: "0.97rem" }}>{value || "—"}</span>
  </div>
);

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi.getUserDetails(id);
        setUser(data.user);
      } catch {
        setError("Could not load user details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <main className="dashboard-content">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "1.25rem" }}>
            ← Back
          </button>
          <h1 className="page-title">User Details</h1>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : user ? (
            <div className="card" style={{ maxWidth: 560 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", fontWeight: 700, color: "#fff",
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>{user.name}</div>
                  {ROLE_LABELS[user.role] && (
                    <span className={`badge ${ROLE_LABELS[user.role].cls}`}>{ROLE_LABELS[user.role].label}</span>
                  )}
                </div>
              </div>

              <DetailRow label="Email"   value={user.email} />
              <DetailRow label="Address" value={user.address} />
              <DetailRow label="Role"    value={ROLE_LABELS[user.role]?.label || user.role} />
              <DetailRow label="Member since" value={new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />

              {user.role === "store_owner" && (
                <div style={{ marginTop: "1.25rem" }}>
                  <div className="divider" />
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Store Rating
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <StarRating value={Math.round(user.averageRating)} readonly size="1.5rem" />
                    <span style={{ color: "var(--color-accent)", fontWeight: 700, fontSize: "1.2rem" }}>
                      {user.averageRating?.toFixed(1)}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>/ 5.0</span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminUserDetail;
