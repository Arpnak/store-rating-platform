import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/common/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import StarRating from "../../components/common/StarRating";
import { storeApi } from "../../api/services";

const AdminStoreList = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const { data } = await storeApi.listStores(cleanFilters);
      setStores(data.stores);
    } catch {
      setError("Could not load stores.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <main className="dashboard-content">
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">All registered stores and their ratings</p>

          <div className="filter-bar">
            {["name", "email", "address"].map((field) => (
              <input
                key={field}
                name={field}
                className="form-input"
                placeholder={`Filter by ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                value={filters[field]}
                onChange={handleFilterChange}
              />
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Avg. Rating</th>
                    <th>Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                        No stores found.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.address || "—"}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <StarRating value={Math.round(s.average_rating)} readonly size="1rem" />
                            <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                              {Number(s.average_rating).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>{s.rating_count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminStoreList;
