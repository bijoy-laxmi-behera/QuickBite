const express = require("express");
const router  = express.Router();

const upload            = require("../middleware/upload");
const uploadToCloudinary = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// ── Main controller ───────────────────────────────────────────────────────────
const {
  getOverview, getLiveOrders, getTopItems, getOrderStats, getWeeklyRevenue,
  getVendorOrders, getOrderDetail, acceptOrder, rejectOrder, markOrderReady,
  updatePrepTime, getOrderHistory,
  getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
  toggleAvailability, updateMenuPrice, bulkMenuAvailability,
  getCategories, createCategory, updateCategory, deleteCategory,
  toggleCategoryVisibility, reorderCategories,
  getEarningsSummary, getRevenueTrend,
  getPayoutHistory, getPayoutDetail, getTransactionBreakdown,
  getVendorReviews, getReviewSummary, replyToReview, editReviewReply,
  getProfile, updateProfile, updateVendorLogo, toggleVendorStatus,
  updateDeliverySettings, updateBankDetails,
  getOperatingHours, getRestaurantStatus, updateFullWeeklySchedule,
  updateSingleDayHours, setHoliday,
  getVendorNotifications, markNotificationRead,
  getSettings, updateSettings,
  notifyDeliveryForPickup, getDeliveryStatus, getDeliveryTrackingLink,
  reportDeliveryIssue, cancelDeliveryAssignment,
} = require("../controllers/vendorController");

// ── Features controller ───────────────────────────────────────────────────────
const {
  getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon,
  getAnalytics, getPeakHours, getBestItems,
  toggleFeatured, getFeaturedItems,
  getOffers, createOffer, updateOffer, deleteOffer,
  getMenuPlan, saveMenuPlan,
  getTodayDeliveries, markDelivered, getSubscriberStats,
  getVendorSubscriptions,
} = require("../controllers/vendorFeaturesController");

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
router.get("/overview",       protect, authorize("vendor"), getOverview);
router.get("/live-orders",    protect, authorize("vendor"), getLiveOrders);
router.get("/top-items",      protect, authorize("vendor"), getTopItems);
router.get("/order-stats",    protect, authorize("vendor"), getOrderStats);
router.get("/weekly-revenue", protect, authorize("vendor"), getWeeklyRevenue);

// ── ORDERS ────────────────────────────────────────────────────────────────────
router.get   ("/order/history",            protect, authorize("vendor"), getOrderHistory);
router.get   ("/orders",                   protect, authorize("vendor"), getVendorOrders);
router.get   ("/orders/:id",               protect, authorize("vendor"), getOrderDetail);
router.patch ("/orders/:id/accept",        protect, authorize("vendor"), acceptOrder);
router.patch ("/orders/:id/reject",        protect, authorize("vendor"), rejectOrder);
router.patch ("/orders/:id/ready",         protect, authorize("vendor"), markOrderReady);
router.patch ("/orders/:id/prep-time",     protect, authorize("vendor"), updatePrepTime);
router.patch ("/orders/:id/ready-for-pickup", protect, authorize("vendor"), notifyDeliveryForPickup);
router.get   ("/orders/:id/delivery-status",  protect, authorize("vendor"), getDeliveryStatus);
router.get   ("/orders/delivery-tracking/:id",protect, authorize("vendor"), getDeliveryTrackingLink);
router.post  ("/orders/:id/delivery-issue",   protect, authorize("vendor"), reportDeliveryIssue);
router.post  ("/orders/:id/cancel-delivery",  protect, authorize("vendor"), cancelDeliveryAssignment);

// ── MENU ──────────────────────────────────────────────────────────────────────
router.get   ("/menu/featured",         protect, authorize("vendor"), getFeaturedItems);
router.get   ("/menu",                  protect, authorize("vendor"), getMenu);
router.get   ("/menu/:id",              protect, authorize("vendor"), getMenuItem);
router.post  ("/menu",                  protect, authorize("vendor"), upload.single("image"), uploadToCloudinary, createMenuItem);
router.put   ("/menu/:id",              protect, authorize("vendor"), upload.single("image"), uploadToCloudinary, updateMenuItem);
router.delete("/menu/:id",              protect, authorize("vendor"), deleteMenuItem);
router.patch ("/menu/bulk-availability",protect, authorize("vendor"), bulkMenuAvailability);
router.patch ("/menu/:id/availability", protect, authorize("vendor"), toggleAvailability);
router.patch ("/menu/:id/price",        protect, authorize("vendor"), updateMenuPrice);
router.patch ("/menu/:id/featured",     protect, authorize("vendor"), toggleFeatured);

// ── MENU PLANNER ──────────────────────────────────────────────────────────────
router.get ("/menu-plan", protect, authorize("vendor"), getMenuPlan);
router.post("/menu-plan", protect, authorize("vendor"), saveMenuPlan);

// ── CATEGORIES ────────────────────────────────────────────────────────────────
router.get   ("/categories",                  protect, authorize("vendor"), getCategories);
router.post  ("/categories",                  protect, authorize("vendor"), createCategory);
router.patch ("/categories/reorder",          protect, authorize("vendor"), reorderCategories);
router.put   ("/categories/:id",              protect, authorize("vendor"), updateCategory);
router.delete("/categories/:id",              protect, authorize("vendor"), deleteCategory);
router.patch ("/categories/:id/visibility",   protect, authorize("vendor"), toggleCategoryVisibility);

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
router.get("/earnings-summary",        protect, authorize("vendor"), getEarningsSummary);
router.get("/revenue-trend",           protect, authorize("vendor"), getRevenueTrend);
router.get("/analytics",               protect, authorize("vendor"), getAnalytics);
router.get("/analytics/peak-hours",    protect, authorize("vendor"), getPeakHours);
router.get("/analytics/best-items",    protect, authorize("vendor"), getBestItems);

// ── PAYOUTS ───────────────────────────────────────────────────────────────────
router.get("/payout-history",                    protect, authorize("vendor"), getPayoutHistory);
router.get("/payout-history/:id",                protect, authorize("vendor"), getPayoutDetail);
router.get("/payout-history/:id/transactions",   protect, authorize("vendor"), getTransactionBreakdown);

// ── REVIEWS ───────────────────────────────────────────────────────────────────
router.get ("/reviews",            protect, authorize("vendor"), getVendorReviews);
router.get ("/reviews/summary",    protect, authorize("vendor"), getReviewSummary);
router.post("/reviews/:id/reply",  protect, authorize("vendor"), replyToReview);
router.put ("/reviews/:id/reply",  protect, authorize("vendor"), editReviewReply);

// ── COUPONS ───────────────────────────────────────────────────────────────────
router.get   ("/coupons",            protect, authorize("vendor"), getCoupons);
router.post  ("/coupons",            protect, authorize("vendor"), createCoupon);
router.put   ("/coupons/:id",        protect, authorize("vendor"), updateCoupon);
router.delete("/coupons/:id",        protect, authorize("vendor"), deleteCoupon);
router.patch ("/coupons/:id/toggle", protect, authorize("vendor"), toggleCoupon);

// ── SPECIAL OFFERS ────────────────────────────────────────────────────────────
router.get   ("/offers",      protect, authorize("vendor"), getOffers);
router.post  ("/offers",      protect, authorize("vendor"), createOffer);
router.put   ("/offers/:id",  protect, authorize("vendor"), updateOffer);
router.delete("/offers/:id",  protect, authorize("vendor"), deleteOffer);

// ── SUBSCRIPTIONS (Cloud Kitchen) ─────────────────────────────────────────────
router.get("/subscriptions", protect, authorize("vendor"), getVendorSubscriptions);

// ── SUBSCRIBER DELIVERY TRACKING ─────────────────────────────────────────────
router.get  ("/deliveries/today",       protect, authorize("vendor"), getTodayDeliveries);
router.patch("/deliveries/:subId/done", protect, authorize("vendor"), markDelivered);
router.get  ("/subscribers/stats",      protect, authorize("vendor"), getSubscriberStats);

// ── PROFILE ───────────────────────────────────────────────────────────────────
router.get  ("/profile",                  protect, authorize("vendor"), getProfile);
router.put  ("/profile",                  protect, authorize("vendor"), upload.single("image"), uploadToCloudinary, updateProfile);
router.patch("/profile/logo",             protect, authorize("vendor"), upload.single("logo"), uploadToCloudinary, updateVendorLogo);
router.patch("/profile/status",           protect, authorize("vendor"), toggleVendorStatus);
router.patch("/profile/delivery-settings",protect, authorize("vendor"), updateDeliverySettings);
router.patch("/profile/bank",             protect, authorize("vendor"), updateBankDetails);
router.get  ("/profile/hours",            protect, authorize("vendor"), getOperatingHours);
router.get  ("/profile/status",           protect, authorize("vendor"), getRestaurantStatus);
router.put  ("/profile/hours",            protect, authorize("vendor"), updateFullWeeklySchedule);
router.patch("/profile/hours/day",        protect, authorize("vendor"), updateSingleDayHours);
router.post ("/profile/holidays",         protect, authorize("vendor"), setHoliday);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
router.get("/notifications",           protect, authorize("vendor"), getVendorNotifications);
router.put("/notifications/:id/read",  protect, authorize("vendor"), markNotificationRead);

// ── SETTINGS ──────────────────────────────────────────────────────────────────
router.get("/settings", protect, authorize("vendor"), getSettings);
router.put("/settings", protect, authorize("vendor"), updateSettings);

module.exports = router;