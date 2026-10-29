import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Admin sidebar navigation.
 * NavLink gives the "active" class automatically.
 */
const AdminSidebar = () => {
  const links = [
    { to: "/admin/dashboard", label: "📊 Dashboard" },
    { to: "/admin/users",     label: "👥 Users" },
    { to: "/admin/stores",    label: "🏪 Stores" },
    { to: "/admin/add-user",  label: "➕ Add User" },
    { to: "/admin/add-store", label: "➕ Add Store" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
