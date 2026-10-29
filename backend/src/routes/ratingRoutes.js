const router = require("express").Router();
const {
  submitRating,
  updateRating,
  ratingValidators,
  updateRatingValidators,
} = require("../controllers/ratingController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

// Only normal users can submit / update ratings
router.post(
  "/",
  requireAuth,
  requireRole("normal_user"),
  ratingValidators,
  handleValidationErrors,
  submitRating
);

router.patch(
  "/:storeId",
  requireAuth,
  requireRole("normal_user"),
  updateRatingValidators,
  handleValidationErrors,
  updateRating
);

module.exports = router;
