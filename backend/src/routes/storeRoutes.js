const router = require("express").Router();
const { listStores } = require("../controllers/storeController");
const { getMyStore } = require("../controllers/storeController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// All authenticated users can browse stores
router.get("/", requireAuth, listStores);

// Store owner only — their own store dashboard
router.get("/my-store", requireAuth, requireRole("store_owner"), getMyStore);

module.exports = router;
