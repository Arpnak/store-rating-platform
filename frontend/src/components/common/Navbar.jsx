import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">⭐ RateMyStore</span>

        <div className="navbar-actions">
          {user && (
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Hi, <strong style={{ color: "var(--text-primary)" }}>{user.name}</strong>
            </span>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
