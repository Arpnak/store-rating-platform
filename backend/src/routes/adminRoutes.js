const router = require("express").Router();
const {
  getDashboardStats,
  listUsers,
  getUserDetails,
  createUser,
  createUserValidators,
} = require("../controllers/adminController");
const { createStore, listStores, createStoreValidators } = require("../controllers/storeController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

// Every route in this file requires a valid token AND admin role
router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", listUsers);
router.get("/users/:id", getUserDetails);
router.post("/users", createUserValidators, handleValidationErrors, createUser);

// Store management (admin can create stores)
router.post("/stores", createStoreValidators, handleValidationErrors, createStore);

module.exports = router;
