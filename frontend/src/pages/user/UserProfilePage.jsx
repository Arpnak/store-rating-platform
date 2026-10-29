import React, { useState } from "react";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/services";

const UserProfilePage = () => {
  const { user } = useAuth();

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwServerError, setPwServerError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setPwServerError("");
    setPwSuccess("");
  };

  const validatePw = () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Current password is required.";
    if (pwForm.newPassword.length < 8 || !/[A-Z]/.test(pwForm.newPassword) || !/[^A-Za-z0-9]/.test(pwForm.newPassword)) {
      errs.newPassword = "At least 8 characters, one uppercase, one special character.";
    }
    if (pwForm.newPassword !== pwForm.confirmNew) {
      errs.confirmNew = "Passwords do not match.";
    }
    return errs;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess("Password updated successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmNew: "" });
    } catch (err) {
      setPwServerError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ flex: 1, padding: "2rem", maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account details</p>

        {/* Profile info */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.6rem", fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700 }}>{user?.name}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>Normal User</div>
            </div>
          </div>

          {[
            { label: "Email",   value: user?.email },
            { label: "Address", value: user?.address || "Not provided" },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "0.65rem 0", borderBottom: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: "0.2rem" }}>
                {label}
              </div>
              <div style={{ color: "var(--text-primary)" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Change password */}
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "1.25rem" }}>Change Password</h2>

          {pwSuccess    && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{pwSuccess}</div>}
          {pwServerError && <div className="alert alert-error"  style={{ marginBottom: "1rem" }}>{pwServerError}</div>}

          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onSubmit={handlePwSubmit}>
            {[
              { id: "cp-current", name: "currentPassword", label: "Current Password" },
              { id: "cp-new",     name: "newPassword",     label: "New Password" },
              { id: "cp-confirm", name: "confirmNew",      label: "Confirm New Password" },
            ].map(({ id, name, label }) => (
              <div className="form-group" key={name}>
                <label className="form-label" htmlFor={id}>{label}</label>
                <input
                  id={id} name={name} type="password"
                  className={`form-input ${pwErrors[name] ? "error" : ""}`}
                  placeholder="••••••••"
                  value={pwForm[name]}
                  onChange={handlePwChange}
                />
                {pwErrors[name] && <span className="form-error">{pwErrors[name]}</span>}
              </div>
            ))}

            <button type="submit" className="btn btn-primary" disabled={pwLoading} style={{ alignSelf: "flex-start" }}>
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
