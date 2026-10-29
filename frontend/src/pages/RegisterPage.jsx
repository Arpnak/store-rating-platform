import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/services";

const passwordRules = "Minimum 8 characters, one uppercase letter, one special character.";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", address: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.length < 3) {
      next.name = "Name must be at least 3 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      next.password = passwordRules;
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        address: form.address.trim(),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <h1>⭐ RateMyStore</h1>
          <p>Create your account</p>
        </div>

        {serverError && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: "1rem" }}>
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { id: "reg-name",    name: "name",    label: "Full Name",       type: "text",     placeholder: "Jane Doe" },
            { id: "reg-email",   name: "email",   label: "Email Address",   type: "email",    placeholder: "you@example.com" },
            { id: "reg-address", name: "address", label: "Address (optional)", type: "text",  placeholder: "123 Main St, City" },
          ].map(({ id, name, label, type, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="form-label" htmlFor={id}>{label}</label>
              <input
                id={id}
                name={name}
                type={type}
                className={`form-input ${errors[name] ? "error" : ""}`}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
              />
              {errors[name] && <span className="form-error">{errors[name]}</span>}
            </div>
          ))}

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
