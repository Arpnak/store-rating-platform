const router = require("express").Router();
const {
  login,
  register,
  getMe,
  changePassword,
  loginValidators,
  registerValidators,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");
const { body } = require("express-validator");

const changePasswordValidators = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("New password must contain at least one special character."),
];

router.post("/login", loginValidators, handleValidationErrors, login);
router.post("/register", registerValidators, handleValidationErrors, register);
router.get("/me", requireAuth, getMe);
router.patch(
  "/change-password",
  requireAuth,
  changePasswordValidators,
  handleValidationErrors,
  changePassword
);

module.exports = router;
