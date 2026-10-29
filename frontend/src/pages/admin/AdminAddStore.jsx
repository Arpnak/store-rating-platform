import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminApi } from "../../api/services";

const AdminAddStore = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", address: "", owner_id: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    // Build payload — only include owner_id if filled
    const payload = { ...form };
    if (!payload.owner_id.trim()) delete payload.owner_id;

    try {
      await adminApi.createStore(payload);
      setSuccess(true);
      setTimeout(() => navigate("/admin/stores"), 1500);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        setServerError(err.response?.data?.message || "Failed to create store.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <main className="dashboard-content">
          <h1 className="page-title">Add New Store</h1>
          <p className="page-subtitle">Register a new store on the platform</p>

          {serverError && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{serverError}</div>}
          {success    && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>Store created! Redirecting…</div>}

          <div className="card" style={{ maxWidth: 520 }}>
            <form style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }} onSubmit={handleSubmit}>
              {[
                { id: "as-name",     name: "name",     label: "Store Name", type: "text",  placeholder: "The Coffee House", required: true },
                { id: "as-email",    name: "email",    label: "Store Email",type: "email", placeholder: "store@example.com", required: true },
                { id: "as-address",  name: "address",  label: "Address",    type: "text",  placeholder: "456 Commerce Blvd", required: false },
                { id: "as-owner",    name: "owner_id", label: "Owner User ID (UUID, optional)", type: "text", placeholder: "Paste UUID of a store_owner user", required: false },
              ].map(({ id, name, label, type, placeholder, required }) => (
                <div className="form-group" key={name}>
                  <label className="form-label" htmlFor={id}>{label}</label>
                  <input
                    id={id} name={name} type={type}
                    className={`form-input ${errors[name] ? "error" : ""}`}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                  />
                  {errors[name] && <span className="form-error">{errors[name]}</span>}
                </div>
              ))}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating…" : "Create Store"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/stores")}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAddStore;
