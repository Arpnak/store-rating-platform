import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminApi } from "../../api/services";

const AdminAddUser = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "", role: "normal_user" });
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
    setSuccess(false);

    try {
      await adminApi.createUser(form);
      setSuccess(true);
      setForm({ name: "", email: "", password: "", address: "", role: "normal_user" });
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      // Surface server-side validation errors individually if available
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped = {};
        serverErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        setServerError(err.response?.data?.message || "Failed to create user.");
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
          <h1 className="page-title">Add New User</h1>
          <p className="page-subtitle">Create a new account on the platform</p>

          {serverError && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{serverError}</div>}
          {success    && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>User created! Redirecting…</div>}

          <div className="card" style={{ maxWidth: 520 }}>
            <form style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }} onSubmit={handleSubmit}>
              {[
                { id: "au-name",    name: "name",    label: "Full Name",   type: "text",  placeholder: "Jane Doe" },
                { id: "au-email",   name: "email",   label: "Email",       type: "email", placeholder: "user@example.com" },
                { id: "au-password",name: "password",label: "Password",    type: "password", placeholder: "Min 8 chars, uppercase + special" },
                { id: "au-address", name: "address", label: "Address",     type: "text",  placeholder: "123 Main St" },
              ].map(({ id, name, label, type, placeholder }) => (
                <div className="form-group" key={name}>
                  <label className="form-label" htmlFor={id}>{label}</label>
                  <input
                    id={id} name={name} type={type}
                    className={`form-input ${errors[name] ? "error" : ""}`}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    required={name !== "address"}
                  />
                  {errors[name] && <span className="form-error">{errors[name]}</span>}
                </div>
              ))}

              <div className="form-group">
                <label className="form-label" htmlFor="au-role">Role</label>
                <select id="au-role" name="role" className="form-select" value={form.role} onChange={handleChange}>
                  <option value="normal_user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Creating…" : "Create User"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/users")}>
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

export default AdminAddUser;
