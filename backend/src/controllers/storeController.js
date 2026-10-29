const { body } = require("express-validator");
const { query: dbQuery } = require("../config/database");

// ─── Validation rules ────────────────────────────────────────────────────────

const createStoreValidators = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Store name must be between 2 and 120 characters."),
  body("email").isEmail().withMessage("A valid store email is required."),
  body("address")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Address cannot exceed 255 characters."),
  body("owner_id")
    .optional()
    .isUUID()
    .withMessage("owner_id must be a valid UUID."),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildStoreFilters = (queryParams) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (queryParams.name) {
    conditions.push(`LOWER(s.name) LIKE $${idx}`);
    params.push(`%${queryParams.name.toLowerCase()}%`);
    idx++;
  }
  if (queryParams.email) {
    conditions.push(`LOWER(s.email) LIKE $${idx}`);
    params.push(`%${queryParams.email.toLowerCase()}%`);
    idx++;
  }
  if (queryParams.address) {
    conditions.push(`LOWER(s.address) LIKE $${idx}`);
    params.push(`%${queryParams.address.toLowerCase()}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, params };
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/stores
 * Public-ish list of stores with their average rating.
 * Accessible by all authenticated roles.
 * Optional filters: name, email, address
 */
const listStores = async (req, res) => {
  try {
    const { whereClause, params } = buildStoreFilters(req.query);

    // For normal users we also want to know if they've already rated each store
    const userId = req.user?.id;

    const result = await dbQuery(
      `SELECT
         s.id,
         s.name,
         s.email,
         s.address,
         s.owner_id,
         COALESCE(ROUND(AVG(r.score), 2), 0)::FLOAT AS average_rating,
         COUNT(r.id)::INT AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY s.name ASC`,
      params
    );

    // If a normal user is requesting, attach their own rating for each store
    let userRatings = {};
    if (userId) {
      const rated = await dbQuery(
        "SELECT store_id, score FROM ratings WHERE user_id = $1",
        [userId]
      );
      rated.rows.forEach((row) => {
        userRatings[row.store_id] = row.score;
      });
    }

    const stores = result.rows.map((store) => ({
      ...store,
      myRating: userRatings[store.id] || null,
    }));

    return res.json({ stores });
  } catch (err) {
    console.error("[Store] List stores error:", err.message);
    return res.status(500).json({ message: "Could not retrieve stores." });
  }
};

/**
 * POST /api/admin/stores
 * Admin creates a new store.
 */
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const existing = await dbQuery(
      "SELECT id FROM stores WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "A store with this email already exists." });
    }

    // If owner_id provided, verify the user exists and is a store_owner
    if (owner_id) {
      const ownerCheck = await dbQuery(
        "SELECT role FROM users WHERE id = $1",
        [owner_id]
      );
      if (ownerCheck.rowCount === 0) {
        return res.status(404).json({ message: "Specified owner user not found." });
      }
      if (ownerCheck.rows[0].role !== "store_owner") {
        return res.status(400).json({ message: "Assigned user must have the store_owner role." });
      }
    }

    const result = await dbQuery(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name.trim(), email.toLowerCase(), address || null, owner_id || null]
    );

    return res.status(201).json({ store: result.rows[0] });
  } catch (err) {
    console.error("[Store] Create store error:", err.message);
    return res.status(500).json({ message: "Could not create store." });
  }
};

/**
 * GET /api/store-owner/my-store
 * Store owner views their own store details with ratings breakdown.
 */
const getMyStore = async (req, res) => {
  try {
    const result = await dbQuery(
      `SELECT
         s.id,
         s.name,
         s.email,
         s.address,
         COALESCE(ROUND(AVG(r.score), 2), 0)::FLOAT AS average_rating,
         COUNT(r.id)::INT AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No store is linked to your account." });
    }

    return res.json({ store: result.rows[0] });
  } catch (err) {
    console.error("[Store] Get my store error:", err.message);
    return res.status(500).json({ message: "Could not retrieve your store." });
  }
};

module.exports = {
  listStores,
  createStore,
  getMyStore,
  createStoreValidators,
};
