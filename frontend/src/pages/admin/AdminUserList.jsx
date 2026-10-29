import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminApi } from "../../api/services";

const ROLE_LABELS = {
  admin:        { label: "Admin",       cls: "badge-admin" },
  normal_user:  { label: "User",        cls: "badge-normal" },
  store_owner:  { label: "Store Owner", cls: "badge-owner" },
};

const AdminUserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Only send non-empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const { data } = await adminApi.listUsers(cleanFilters);
      setUsers(data.users);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="dashboard-wrapper">
        <AdminSidebar />
        <main className="dashboard-content">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Browse and filter all platform users</p>

          {/* Filter bar */}
          <div className="filter-bar">
            {[
              { name: "name",    placeholder: "Filter by Name" },
              { name: "email",   placeholder: "Filter by Email" },
              { name: "address", placeholder: "Filter by Address" },
            ].map(({ name, placeholder }) => (
              <input
                key={name}
                name={name}
                className="form-input"
                placeholder={placeholder}
                value={filters[name]}
                onChange={handleFilterChange}
              />
            ))}

            <select
              name="role"
              className="form-select"
              value={filters.role}
              onChange={handleFilterChange}
              style={{ flex: "0 1 180px" }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="normal_user">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
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
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const role = ROLE_LABELS[u.role] || { label: u.role, cls: "" };
                      return (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.address || "—"}</td>
                          <td>
                            <span className={`badge ${role.cls}`}>{role.label}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => navigate(`/admin/users/${u.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
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

export default AdminUserList;
