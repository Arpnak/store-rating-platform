const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const { query: dbQuery } = require("../config/database");

// ─── Validation rules ────────────────────────────────────────────────────────

const createUserValidators = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage("Name must be between 3 and 60 characters."),
  body("email").isEmail().withMessage("A valid email address is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must include at least one special character."),
  body("address")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Address too long."),
  body("role")
    .isIn(["admin", "normal_user", "store_owner"])
    .withMessage("Role must be admin, normal_user, or store_owner."),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds a WHERE clause and param list from optional filter query params.
 * Supports filtering on: name, email, address, role.
 */
const buildUserFilters = (queryParams) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  const filterFields = ["name", "email", "address", "role"];

  filterFields.forEach((field) => {
    if (queryParams[field]) {
      conditions.push(`LOWER(${field}) LIKE $${idx}`);
      params.push(`%${queryParams[field].toLowerCase()}%`);
      idx++;
    }
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, params };
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Summary statistics for the admin dashboard.
 */
const getDashboardStats = async (req, res) => {
  try {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      dbQuery("SELECT COUNT(*) AS total FROM users"),
      dbQuery("SELECT COUNT(*) AS total FROM stores"),
      dbQuery("SELECT COUNT(*) AS total FROM ratings"),
    ]);

    return res.json({
      totalUsers: parseInt(usersCount.rows[0].total, 10),
      totalStores: parseInt(storesCount.rows[0].total, 10),
      totalRatings: parseInt(ratingsCount.rows[0].total, 10),
    });
  } catch (err) {
    console.error("[Admin] Dashboard error:", err.message);
    return res.status(500).json({ message: "Could not load dashboard data." });
  }
};

/**
 * GET /api/admin/users
 * List all users with optional filters.
 */
const listUsers = async (req, res) => {
  try {
    const { whereClause, params } = buildUserFilters(req.query);

    const result = await dbQuery(
      `SELECT id, name, email, address, role, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return res.json({ users: result.rows });
  } catch (err) {
    console.error("[Admin] List users error:", err.message);
    return res.status(500).json({ message: "Could not retrieve users." });
  }
};

/**
 * GET /api/admin/users/:id
 * Detailed view of a single user.
 * If the user is a store_owner, their store's average rating is included.
 */
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await dbQuery(
      "SELECT id, name, email, address, role, created_at FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    // If the user is a store owner, attach the average rating of their store
    if (user.role === "store_owner") {
      const ratingResult = await dbQuery(
        `SELECT COALESCE(AVG(r.score), 0) AS average_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1`,
        [id]
      );
      user.averageRating = parseFloat(
        Number(ratingResult.rows[0].average_rating).toFixed(2)
      );
    }

    return res.json({ user });
  } catch (err) {
    console.error("[Admin] Get user details error:", err.message);
    return res.status(500).json({ message: "Could not retrieve user details." });
  }
};

/**
 * POST /api/admin/users
 * Admin creates a new user of any role.
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existing = await dbQuery(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 12);

    const result = await dbQuery(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name.trim(), email.toLowerCase(), hashed, address || null, role]
    );

    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("[Admin] Create user error:", err.message);
    return res.status(500).json({ message: "Could not create user." });
  }
};

module.exports = {
  getDashboardStats,
  listUsers,
  getUserDetails,
  createUser,
  createUserValidators,
};
