import React, { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import StarRating from "../../components/common/StarRating";
import { storeApi } from "../../api/services";

const StoreOwnerDashboard = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await storeApi.getMyStore();
        setStore(data.store);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("No store is linked to your account. Please contact an administrator.");
        } else {
          setError("Could not load your store information.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Translate numeric average into a descriptive label
  const ratingLabel = (avg) => {
    if (avg >= 4.5) return { text: "Excellent ✨", color: "#10b981" };
    if (avg >= 3.5) return { text: "Very Good 👍", color: "#6c63ff" };
    if (avg >= 2.5) return { text: "Average 😐",   color: "#f59e0b" };
    if (avg >= 1.5) return { text: "Below Average 😕", color: "#f97316" };
    return            { text: "Poor 😞",           color: "#ef4444" };
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ flex: 1, padding: "2rem", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <h1 className="page-title">My Store Dashboard</h1>
        <p className="page-subtitle">Monitor how customers rate your store</p>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : store ? (
          <>
            {/* Store info card */}
            <div className="card" style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                🏪 {store.name}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span>✉️ {store.email}</span>
                {store.address && <span>📍 {store.address}</span>}
              </div>
            </div>

            {/* Rating overview */}
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{Number(store.average_rating).toFixed(1)}</div>
                <div className="stat-label">Average Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-value">{store.rating_count}</div>
                <div className="stat-label">Total Reviews</div>
              </div>
            </div>

            {/* Visual rating breakdown */}
            <div className="card" style={{ marginTop: "1.25rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "1.25rem" }}>Rating Overview</h2>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <StarRating value={Math.round(store.average_rating)} readonly size="2rem" />
                <div>
                  <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--color-accent)", lineHeight: 1 }}>
                    {Number(store.average_rating).toFixed(2)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>out of 5.0</div>
                </div>
                {store.rating_count > 0 && (
                  <div style={{ padding: "0.4rem 0.9rem", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,0.12)", fontWeight: 600, fontSize: "0.9rem", color: ratingLabel(store.average_rating).color }}>
                    {ratingLabel(store.average_rating).text}
                  </div>
                )}
              </div>

              {store.rating_count === 0 && (
                <div className="alert alert-info" style={{ marginTop: "1rem" }}>
                  No ratings yet. Keep up the great service!
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default StoreOwnerDashboard;
