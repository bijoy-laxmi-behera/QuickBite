const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
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
const { protect, authorize } = require("../middleware/authMiddleware");

// ─── OVERVIEW ─────────────────────────────────────────────────────
router.get("/overview", protect, authorize("vendor"), getOverview);
router.get("/live-orders", protect, authorize("vendor"), getLiveOrders);
router.get("/top-items", protect, authorize("vendor"), getTopItems);
router.get("/order-stats", protect, authorize("vendor"), getOrderStats);
router.get("/weekly-revenue", protect, authorize("vendor"), getWeeklyRevenue);

// ─── ORDERS ───────────────────────────────────────────────────────
router.get("/orders/history", protect, authorize("vendor"), getOrderHistory);       // ⚠️ before /:id
router.get("/orders", protect, authorize("vendor"), getVendorOrders);
router.get("/orders/:id", protect, authorize("vendor"), getOrderDetail);
router.patch("/orders/:id/accept", protect, authorize("vendor"), acceptOrder);
router.patch("/orders/:id/reject", protect, authorize("vendor"), rejectOrder);
router.patch("/orders/:id/ready", protect, authorize("vendor"), markOrderReady);
router.patch("/orders/:id/prep-time", protect, authorize("vendor"), updatePrepTime);

// ─── MENU ─────────────────────────────────────────────────────────
router.get("/menu", protect, authorize("vendor"), getMenu);
router.post("/menu", protect, authorize("vendor"), upload.single("image"), createMenuItem);
router.patch("/menu/bulk-availability", protect, authorize("vendor"), bulkMenuAvailability); // ⚠️ before /:id
router.get("/menu/:id", protect, authorize("vendor"), getMenuItem);
router.put("/menu/:id", protect, authorize("vendor"), upload.single("image"), updateMenuItem);
router.delete("/menu/:id", protect, authorize("vendor"), deleteMenuItem);
router.patch("/menu/:id/availability", protect, authorize("vendor"), toggleAvailability);
router.patch("/menu/:id/price", protect, authorize("vendor"), updateMenuPrice);

// ─── CATEGORIES ───────────────────────────────────────────────────
router.get("/categories", protect, authorize("vendor"), getCategories);
router.post("/categories", protect, authorize("vendor"), createCategory);
router.patch("/categories/reorder", protect, authorize("vendor"), reorderCategories); // ⚠️ before /:id
router.put("/categories/:id", protect, authorize("vendor"), updateCategory);
router.delete("/categories/:id", protect, authorize("vendor"), deleteCategory);
router.patch("/categories/:id/visibility", protect, authorize("vendor"), toggleCategoryVisibility);

// ─── INVENTORY ────────────────────────────────────────────────────
router.get("/inventory/low-stock", protect, authorize("vendor"), getLowStockIngredients); // ⚠️ before /:id
router.get("/inventory", protect, authorize("vendor"), getIngredients);
router.post("/inventory", protect, authorize("vendor"), addIngredient);
router.put("/inventory/:id", protect, authorize("vendor"), updateIngredient);
router.delete("/inventory/:id", protect, authorize("vendor"), deleteIngredient);
router.patch("/inventory/:id/restock", protect, authorize("vendor"), restockIngredient);

// ─── EARNINGS & PAYOUTS ───────────────────────────────────────────
router.get("/earnings-summary", protect, authorize("vendor"), getEarningsSummary);
router.get("/revenue-trend", protect, authorize("vendor"), getRevenueTrend);
router.get("/payout-history", protect, authorize("vendor"), getPayoutHistory);
router.get("/payout-history/:id", protect, authorize("vendor"), getPayoutDetail);
router.get("/payout-history/:id/transactions", protect, authorize("vendor"), getTransactionBreakdown);

// ─── REVIEWS ──────────────────────────────────────────────────────
router.get("/reviews/summary", protect, authorize("vendor"), getReviewSummary);  // ⚠️ before /:id
router.get("/reviews", protect, authorize("vendor"), getVendorReviews);
router.post("/reviews/:id/reply", protect, authorize("vendor"), replyToReview);
router.put("/reviews/:id/reply", protect, authorize("vendor"), editReviewReply);

// ─── PROFILE ──────────────────────────────────────────────────────
router.get("/profile", protect, authorize("vendor"), getProfile);
router.put("/profile", protect, authorize("vendor"), updateProfile);
router.patch("/profile/logo", protect, authorize("vendor"), upload.single("logo"), updateVendorLogo);
router.patch("/profile/status", protect, authorize("vendor"), toggleVendorStatus);
router.patch("/profile/delivery-settings", protect, authorize("vendor"), updateDeliverySettings);
router.patch("/profile/bank", protect, authorize("vendor"), updateBankDetails);
router.get("/profile/hours", protect, authorize("vendor"), getOperatingHours);
router.get("/profile/status", protect, authorize("vendor"), getRestaurantStatus);
router.put("/profile/hours", protect, authorize("vendor"), updateFullWeeklySchedule);
router.patch("/profile/hours/day", protect, authorize("vendor"), updateSingleDayHours);
router.post("/profile/holidays", protect, authorize("vendor"), setHoliday);

module.exports = router;