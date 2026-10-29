const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const { query: dbQuery } = require("../config/database");
const config = require("../config/config");

// ─── Validation rules ────────────────────────────────────────────────────────

const loginValidators = [
  body("email").isEmail().withMessage("A valid email address is required."),
  body("password").notEmpty().withMessage("Password cannot be blank."),
];

const registerValidators = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage("Name must be between 3 and 60 characters."),
  body("email").isEmail().withMessage("A valid email address is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character."),
  body("address")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Address cannot exceed 255 characters."),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mintToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

const safeUser = (user) => {
  // Never send the hashed password back to the client
  const { password, ...rest } = user;
  return rest;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Works for all roles — admin, normal_user, store_owner.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await dbQuery(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = mintToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * POST /api/auth/register
 * Self-registration is only available for normal_user accounts.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    const existing = await dbQuery(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 12);

    const inserted = await dbQuery(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'normal_user') RETURNING *`,
      [name.trim(), email.toLowerCase(), hashed, address || null]
    );

    const token = mintToken(inserted.rows[0]);
    return res.status(201).json({ token, user: safeUser(inserted.rows[0]) });
  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res) => {
  try {
    const result = await dbQuery(
      "SELECT id, name, email, address, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("[Auth] GetMe error:", err.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

/**
 * PATCH /api/auth/change-password
 * Lets any logged-in user update their own password.
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await dbQuery(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    const correct = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!correct) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await dbQuery(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashed, req.user.id]
    );

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("[Auth] ChangePassword error:", err.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  login,
  register,
  getMe,
  changePassword,
  loginValidators,
  registerValidators,
};
