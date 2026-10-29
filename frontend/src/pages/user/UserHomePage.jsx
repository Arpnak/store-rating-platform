import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import StarRating from "../../components/common/StarRating";
import { storeApi, ratingApi } from "../../api/services";

/**
 * Modal for submitting or updating a star rating on a store.
 */
const RatingModal = ({ store, onClose, onSuccess }) => {
  const [score, setScore] = useState(store.myRating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isUpdate = !!store.myRating;

  const handleSubmit = async () => {
    if (score === 0) {
      setError("Please select a rating before submitting.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isUpdate) {
        await ratingApi.updateRating(store.id, { score });
      } else {
        await ratingApi.submitRating({ store_id: store.id, score });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "0.4rem" }}>
          {isUpdate ? "Update Your Rating" : "Rate This Store"}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.92rem" }}>
          {store.name}
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <StarRating value={score} onChange={setScore} size="2.5rem" />
        </div>

        {score > 0 && (
          <p style={{ textAlign: "center", color: "var(--color-accent)", fontWeight: 600, marginBottom: "1rem" }}>
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][score]} ({score}/5)
          </p>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : isUpdate ? "Update Rating" : "Submit Rating"}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const UserHomePage = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await storeApi.listStores(clean);
      setStores(data.stores);
    } catch {
      setError("Could not load stores.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleRatingSuccess = () => {
    setSelectedStore(null);
    fetchStores(); // Refresh so the new average shows immediately
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ flex: 1, padding: "2rem", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        <h1 className="page-title">Browse Stores</h1>
        <p className="page-subtitle">Discover stores and share your experience</p>

        <div className="filter-bar">
          {["name", "email", "address"].map((field) => (
            <input
              key={field}
              name={field}
              className="form-input"
              placeholder={`Search by ${field.charAt(0).toUpperCase() + field.slice(1)}`}
              value={filters[field]}
              onChange={(e) => setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
            />
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        {loading ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : (
          <div className="stores-grid">
            {stores.length === 0 ? (
              <p style={{ color: "var(--text-muted)", gridColumn: "1/-1" }}>No stores found.</p>
            ) : stores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-card-name">🏪 {store.name}</div>
                <div className="store-card-meta">
                  <span>✉️ {store.email}</span>
                  {store.address && <span>📍 {store.address}</span>}
                </div>

                {/* Average rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
                  <StarRating value={Math.round(store.average_rating)} readonly size="1.1rem" />
                  <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
                    {Number(store.average_rating).toFixed(1)}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    ({store.rating_count} {store.rating_count === 1 ? "review" : "reviews"})
                  </span>
                </div>

                {/* User's own rating (if any) */}
                {store.myRating && (
                  <div style={{ marginBottom: "0.75rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Your rating:&nbsp;
                    <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                      {"★".repeat(store.myRating)}{"☆".repeat(5 - store.myRating)} ({store.myRating}/5)
                    </span>
                  </div>
                )}

                <button
                  className={`btn ${store.myRating ? "btn-secondary" : "btn-primary"} btn-sm`}
                  onClick={() => setSelectedStore(store)}
                >
                  {store.myRating ? "✏️ Update Rating" : "⭐ Rate Store"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};

export default UserHomePage;
