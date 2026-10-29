const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Verifies the JWT from the Authorization header.
 * Attaches the decoded payload to req.user on success.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing or malformed." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";
    return res.status(401).json({ message });
  }
};

/**
 * Factory that creates a middleware allowing only certain roles.
 * Usage: requireRole("admin") or requireRole("admin", "store_owner")
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
