const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  updateLocation,
  getOrderLocation,
  getActiveOrder,
  getOverview,
  getHistory,
  getEarnings,
  getProfile,
  updateProfile,
  markPickedUp,
  markDelivered,
} = require("../controllers/deliveryController");

// ─── OVERVIEW ────────────────────────────────────────────
router.get("/overview", protect, authorize("delivery"), getOverview);

// ─── ACTIVE ORDER ────────────────────────────────────────
router.get("/active-order", protect, authorize("delivery"), getActiveOrder);

// ─── ORDER ACTIONS ───────────────────────────────────────
router.patch("/orders/:id/picked-up",  protect, authorize("delivery"), markPickedUp);
router.patch("/orders/:id/delivered",  protect, authorize("delivery"), markDelivered);

// ─── LIVE LOCATION ───────────────────────────────────────
// Delivery partner updates their location
router.patch("/orders/:id/location", protect, authorize("delivery"), updateLocation);

// Customer polls this to get delivery location (no role restriction — customer can call it)
router.get("/orders/:id/location", protect, getOrderLocation);

// ─── HISTORY ─────────────────────────────────────────────
router.get("/history", protect, authorize("delivery"), getHistory);

// ─── EARNINGS ────────────────────────────────────────────
router.get("/earnings", protect, authorize("delivery"), getEarnings);

// ─── PROFILE ─────────────────────────────────────────────
router.get("/profile",  protect, authorize("delivery"), getProfile);
router.put("/profile",  protect, authorize("delivery"), updateProfile);

module.exports = router;
