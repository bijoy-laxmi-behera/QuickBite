const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getOverview,
  getLiveOrders,
  getTopItems,
  getOrderStats,
  getWeeklyRevenue,
  getVendorOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  markOrderReady,
  updatePrepTime,
  getOrderHistory,
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateMenuPrice,
  bulkMenuAvailability,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
  reorderCategories,
  addIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,
  restockIngredient,
  getEarningsSummary,
  getRevenueTrend,
  getPayoutHistory,
  getPayoutDetail,
  getTransactionBreakdown,
  getVendorReviews,
  getReviewSummary,
  replyToReview,
  editReviewReply,
  getProfile,
  updateProfile,
  updateVendorLogo,
  toggleVendorStatus,
  updateDeliverySettings,
  updateBankDetails,
  getOperatingHours,
  getRestaurantStatus,
  updateFullWeeklySchedule,
  updateSingleDayHours,
  setHoliday,
} = require("../controllers/vendorController");

// ─── DASHBOARD ───────────────────────────────────────────
router.get("/overview",        protect, authorize("vendor"), getOverview);
router.get("/live-orders",     protect, authorize("vendor"), getLiveOrders);
router.get("/top-items",       protect, authorize("vendor"), getTopItems);
router.get("/order-stats",     protect, authorize("vendor"), getOrderStats);
router.get("/weekly-revenue",  protect, authorize("vendor"), getWeeklyRevenue);

// ─── ORDERS (static before parameterized) ────────────────
router.get("/orders/history",          protect, authorize("vendor"), getOrderHistory);
router.get("/orders",                  protect, authorize("vendor"), getVendorOrders);
router.get("/orders/:id",              protect, authorize("vendor"), getOrderDetail);
router.patch("/orders/:id/accept",     protect, authorize("vendor"), acceptOrder);
router.patch("/orders/:id/reject",     protect, authorize("vendor"), rejectOrder);
router.patch("/orders/:id/ready",      protect, authorize("vendor"), markOrderReady);
router.patch("/orders/:id/prep-time",  protect, authorize("vendor"), updatePrepTime);

// ─── MENU (static before parameterized) ──────────────────
router.patch("/menu/bulk-availability",      protect, authorize("vendor"), bulkMenuAvailability);
router.get("/menu",                          protect, authorize("vendor"), getMenu);
router.post("/menu",                         protect, authorize("vendor"), upload.single("image"), createMenuItem);
router.get("/menu/:id",                      protect, authorize("vendor"), getMenuItem);
router.put("/menu/:id",                      protect, authorize("vendor"), upload.single("image"), updateMenuItem);
router.delete("/menu/:id",                   protect, authorize("vendor"), deleteMenuItem);
router.patch("/menu/:id/availability",       protect, authorize("vendor"), toggleAvailability);
router.patch("/menu/:id/price",              protect, authorize("vendor"), updateMenuPrice);

// ─── CATEGORIES (static before parameterized) ────────────
router.patch("/categories/reorder",           protect, authorize("vendor"), reorderCategories);
router.get("/categories",                     protect, authorize("vendor"), getCategories);
router.post("/categories",                    protect, authorize("vendor"), createCategory);
router.put("/categories/:id",                 protect, authorize("vendor"), updateCategory);
router.delete("/categories/:id",              protect, authorize("vendor"), deleteCategory);
router.patch("/categories/:id/visibility",    protect, authorize("vendor"), toggleCategoryVisibility);

// ─── INVENTORY (static before parameterized) ─────────────
router.get("/inventory/low-stock",      protect, authorize("vendor"), getLowStockIngredients);
router.get("/inventory",                protect, authorize("vendor"), getIngredients);
router.post("/inventory",               protect, authorize("vendor"), addIngredient);
router.put("/inventory/:id",            protect, authorize("vendor"), updateIngredient);
router.delete("/inventory/:id",         protect, authorize("vendor"), deleteIngredient);
router.patch("/inventory/:id/restock",  protect, authorize("vendor"), restockIngredient);

// ─── EARNINGS ────────────────────────────────────────────
router.get("/earnings-summary",  protect, authorize("vendor"), getEarningsSummary);
router.get("/revenue-trend",     protect, authorize("vendor"), getRevenueTrend);

// ─── PAYOUTS (static before parameterized) ───────────────
router.get("/payout-history",                      protect, authorize("vendor"), getPayoutHistory);
router.get("/payout-history/:id",                  protect, authorize("vendor"), getPayoutDetail);
router.get("/payout-history/:id/transactions",     protect, authorize("vendor"), getTransactionBreakdown);

// ─── REVIEWS (static before parameterized) ───────────────
router.get("/reviews/summary",        protect, authorize("vendor"), getReviewSummary);
router.get("/reviews",                protect, authorize("vendor"), getVendorReviews);
router.post("/reviews/:id/reply",     protect, authorize("vendor"), replyToReview);
router.put("/reviews/:id/reply",      protect, authorize("vendor"), editReviewReply);

// ─── PROFILE (static before parameterized) ───────────────
router.get("/profile/hours",                    protect, authorize("vendor"), getOperatingHours);
router.get("/profile/status",                   protect, authorize("vendor"), getRestaurantStatus);
router.put("/profile/hours",                    protect, authorize("vendor"), updateFullWeeklySchedule);
router.patch("/profile/hours/day",              protect, authorize("vendor"), updateSingleDayHours);
router.post("/profile/holidays",                protect, authorize("vendor"), setHoliday);
router.patch("/profile/logo",                   protect, authorize("vendor"), upload.single("logo"), updateVendorLogo);
router.patch("/profile/status",                 protect, authorize("vendor"), toggleVendorStatus);
router.patch("/profile/delivery-settings",      protect, authorize("vendor"), updateDeliverySettings);
router.patch("/profile/bank",                   protect, authorize("vendor"), updateBankDetails);
router.get("/profile",                          protect, authorize("vendor"), getProfile);
router.put("/profile",                          protect, authorize("vendor"), updateProfile);

module.exports = router;