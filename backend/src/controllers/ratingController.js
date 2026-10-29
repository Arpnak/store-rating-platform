const { body } = require("express-validator");
const { query: dbQuery } = require("../config/database");

// ─── Validation rules ────────────────────────────────────────────────────────

const ratingValidators = [
  body("store_id").isUUID().withMessage("A valid store ID is required."),
  body("score")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating score must be a whole number between 1 and 5."),
];

const updateRatingValidators = [
  body("score")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating score must be a whole number between 1 and 5."),
];

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/ratings
 * Submit a new rating for a store.
 * A user can only rate a store once (enforced by DB unique constraint too).
 */
const submitRating = async (req, res) => {
  try {
    const { store_id, score } = req.body;
    const userId = req.user.id;

    // Confirm the store exists
    const storeCheck = await dbQuery("SELECT id FROM stores WHERE id = $1", [store_id]);
    if (storeCheck.rowCount === 0) {
      return res.status(404).json({ message: "Store not found." });
    }

    // Check for a pre-existing rating
    const existing = await dbQuery(
      "SELECT id FROM ratings WHERE store_id = $1 AND user_id = $2",
      [store_id, userId]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        message: "You have already rated this store. Use the update endpoint to change it.",
      });
    }

    const result = await dbQuery(
      `INSERT INTO ratings (store_id, user_id, score)
       VALUES ($1, $2, $3)
       RETURNING id, store_id, user_id, score, created_at`,
      [store_id, userId, score]
    );

    return res.status(201).json({ rating: result.rows[0] });
  } catch (err) {
    console.error("[Rating] Submit error:", err.message);
    return res.status(500).json({ message: "Could not submit rating." });
  }
};

/**
 * PATCH /api/ratings/:storeId
 * Update the current user's existing rating for a store.
 */
const updateRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { score } = req.body;
    const userId = req.user.id;

    const result = await dbQuery(
      `UPDATE ratings
       SET score = $1, updated_at = NOW()
       WHERE store_id = $2 AND user_id = $3
       RETURNING id, store_id, user_id, score, updated_at`,
      [score, storeId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Rating not found. Submit a rating first." });
    }

    return res.json({ rating: result.rows[0] });
  } catch (err) {
    console.error("[Rating] Update error:", err.message);
    return res.status(500).json({ message: "Could not update rating." });
  }
};

module.exports = {
  submitRating,
  updateRating,
  ratingValidators,
  updateRatingValidators,
};
