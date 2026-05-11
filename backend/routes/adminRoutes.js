// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, adminAuth } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getUserStats,
  getMyProfile,
  updateMyProfile,
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  getRestaurantOrders,
  getRestaurantMenu,
  searchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getAllOrders,
  updateOrderStatus,
  getLiveOrders,
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  getAgentDeliveries,
  getAllPayments,
  getPaymentById,
  refundPayment,
  getPaymentSummary,
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  getOverview,
  getRevenueAnalytics,
  getOrderAnalytics,
  getTopRestaurants,
  getPeakHours,
  getSettings,
  updateSettings,
} = require("../controllers/adminController");

// ============ MIDDLEWARE ============
// All admin routes require authentication and admin role
router.use(protect);
router.use(adminAuth); // This applies to all routes below

// ============ USER ROUTES ============
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);

// ============ PROFILE ROUTES ============
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

// ============ RESTAURANT ROUTES ============
router.get("/restaurants", getAllRestaurants);
router.get("/restaurants/pending", getPendingRestaurants);
router.post("/restaurants", createRestaurant);
router.get("/restaurants/:id", getRestaurantById);
router.put("/restaurants/:id", updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);
router.patch("/restaurants/:id/status", toggleRestaurantStatus);
router.patch("/restaurants/:id/approve", approveRestaurant);
router.patch("/restaurants/:id/reject", rejectRestaurant);
router.get("/restaurants/:id/orders", getRestaurantOrders);
router.get("/restaurants/:id/menu", getRestaurantMenu);

// ============ MENU ROUTES ============
router.get("/menu/search", searchMenuItems);
router.post("/menu", createMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);
router.patch("/menu/:id/availability", toggleAvailability);

// ============ ORDER ROUTES ============
router.get("/orders", getAllOrders);
router.get("/orders/live", getLiveOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// ============ AGENT ROUTES ============
router.get("/agents", getAllAgents);
router.post("/agents", createAgent);
router.put("/agents/:id", updateAgent);
router.delete("/agents/:id", deleteAgent);
router.patch("/agents/:id/status", toggleAgentStatus);
router.get("/agents/:id/deliveries", getAgentDeliveries);

// ============ PAYMENT ROUTES ============
router.get("/payments", getAllPayments);
router.get("/payments/summary", getPaymentSummary);
router.get("/payments/:id", getPaymentById);
router.post("/payments/:id/refund", refundPayment);

// ============ COUPON ROUTES ============
router.post("/coupons/validate", validateCoupon);
router.get("/coupons", getAllCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.patch("/coupons/:id/toggle", toggleCoupon);

// ============ ANALYTICS ROUTES ============
router.get("/analytics/overview", getOverview);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/analytics/orders", getOrderAnalytics);
router.get("/analytics/restaurants", getTopRestaurants);
router.get("/analytics/peak-hours", getPeakHours);

// ============ SETTINGS ROUTES ============
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;