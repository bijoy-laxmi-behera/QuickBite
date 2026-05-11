const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { 
  getMyProfile, 
  updateProfile, 
  updateAvatar, 
  updateVehicle, 
  updateBank, 
  deleteAccount, 
  uploadDocuments, 
  toggleStatus, 
  getStatus, 
  updateLocation, 
  getLocation, 
  getIncomingOrders,
  getActiveOrder,
  getOrderById,
  acceptOrder, 
  rejectOrder,
  markPickedUp,
  markDelivered,
  verifyOtp,
  reportIssue,
  getOrderHistory,
  getEarningsSummary,
  getTodayEarnings,
  getWeeklyEarnings,
  getMonthlyEarnings,
  getPayouts,
  getTransactions,
  getStats,
  getRatings,
  getBadges,
  getLeaderboard,
  getNotifications,
  saveFcmToken,
  updatePreferences,
  markAsRead, 
  markAllAsRead,
  getFAQs,
  createTicket,
  getMyTickets,
  getTicketById,
  updateOrderLocation,
  getTrackingInfo,
  getWallet,
  getWalletTransactions,
  requestWithdrawal,
  getWithdrawalRequests,
  cancelWithdrawal,
  resendOtp
} = require("../controllers/deliveryController");

// All routes require authentication and delivery partner role
router.use(protect, authorize("delivery"));

// ==================== PROFILE ROUTES ====================
router.get("/me", getMyProfile);
router.put("/me", updateProfile);
router.put("/me/avatar", upload.single("avatar"), updateAvatar);
router.put("/me/documents", upload.fields([
  { name: "license", maxCount: 1 },
  { name: "rc", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
]), uploadDocuments);
router.put("/me/vehicle", updateVehicle);
router.put("/me/bank", updateBank);
router.delete("/me", deleteAccount);

// ==================== STATUS & LOCATION ROUTES ====================
router.patch("/me/status", toggleStatus);
router.get("/me/status", getStatus);
router.patch("/me/location", updateLocation);
router.get("/me/location", getLocation);

// ==================== ORDER ROUTES ====================
router.get("/orders/incoming", getIncomingOrders);
router.get("/orders/active", getActiveOrder);
router.get("/orders/history", getOrderHistory);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/accept", acceptOrder);
router.patch("/orders/:id/reject", rejectOrder);
router.patch("/orders/:id/picked-up", markPickedUp);
router.patch("/orders/:id/delivered", markDelivered);
router.post("/orders/:id/otp-verify", verifyOtp);
router.post("/orders/:id/issue", reportIssue);

// ==================== EARNINGS ROUTES ====================
router.get("/earnings/summary", getEarningsSummary);
router.get("/earnings/today", getTodayEarnings);
router.get("/earnings/weekly", getWeeklyEarnings);
router.get("/earnings/monthly", getMonthlyEarnings);
router.get("/earnings/payouts", getPayouts);
router.get("/earnings/transactions", getTransactions);

// ==================== PERFORMANCE ROUTES ====================
router.get("/performance/stats", getStats);  // Fixed: removed duplicate
router.get("/performance/ratings", getRatings);
router.get("/performance/badges", getBadges);
router.get("/performance/leaderboard", getLeaderboard);

// ==================== NOTIFICATION ROUTES ====================
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markAsRead);
router.patch("/notifications/read-all", markAllAsRead);
router.post("/notifications/fcm-token", saveFcmToken);
router.put("/notifications/preferences", updatePreferences);

// ==================== SUPPORT ROUTES ====================
router.get("/support/faqs", getFAQs);
router.post("/support/ticket", createTicket);
router.get("/support/tickets", getMyTickets);
router.get("/support/tickets/:id", getTicketById);
// Add these routes
router.patch("/orders/:orderId/location", protect, updateOrderLocation);
router.get("/orders/:orderId/tracking", protect, getTrackingInfo);
// Add these routes
router.get("/wallet", protect, getWallet);
router.get("/wallet/transactions", protect, getWalletTransactions);
router.post("/wallet/withdraw", protect, requestWithdrawal);
router.get("/wallet/withdrawals", protect, getWithdrawalRequests);
router.post("/wallet/withdrawals/:id/cancel", protect, cancelWithdrawal);
router.post("/orders/:id/resend-otp", protect, resendOtp);
module.exports = router;