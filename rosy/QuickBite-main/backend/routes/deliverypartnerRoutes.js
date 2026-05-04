const express=require("express");
const router=express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload=require("../middleware/upload");
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
  markPickedUp,
  markDelivered,
  verifyOtp,
  reportIssue,
  getTodayEarnings,
  getWeeklyEarnings,
  getMonthlyEarnings,
  getPayouts,
  getTransactions,
  getOrderHistory, acceptOrder, 
  rejectOrder, getEarningsSummary, getOrderById,
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
  getTicketById
} = require("../controllers/deliveryPartner");
router.use(protect,authorize("deliveryPartner"));
router.get("/me",getMyProfile);
router.put("/me",updateProfile);
router.put("/me/avatar",upload.single("avatar"),updateAvatar);
router.put("/me/documents",upload.fields([
  {name:"license",maxCount:1},
  {name:"rc",maxCount:1},
  {name:"idProof",maxCount:1},
]),
uploadDocuments
);
router.put("/me/vehicle",updateVehicle);
router.put("/me/bank",updateBank);
router.delete("/me",deleteAccount);
router.patch("/me/status",toggleStatus);
router.get("/me/status",getStatus);
router.patch("/me/location",updateLocation);
router.get("/me/location",getLocation);
router.get("/orders/incoming",getIncomingOrders);
router.get("/orders/active",getActiveOrder);
router.get("/orders/history",getOrderHistory);
router.get("/orders/:id",getOrderById);
router.patch("/orders/:id/accept",acceptOrder);
router.patch("/orders/:id/reject",rejectOrder);
router.patch("/orders/:id/picked-up",markPickedUp);
router.patch("/orders/:id/delivered",markDelivered);
router.post("/orders/:id/otp-verify",verifyOtp);
router.post("/orders/:id/issue",reportIssue);
router.get("/earnings/summary",getEarningsSummary);
router.get("/earnings/today",getTodayEarnings);
router.get("/earnings/weekly",getWeeklyEarnings);
router.get("/earnings/monthly",getMonthlyEarnings);
router.get("/earnings/payouts",getPayouts);
router.get("/earnings/transactions",getTransactions);
router.get("/performance/stats",getStats);
router.get("/performance/stats", getStats);
router.get("/performance/ratings", getRatings);
router.get("/performance/badges", getBadges);
router.get("/performance/leaderboard", getLeaderboard);
router.get("/notifications",getNotifications);
router.patch("/notifications/:id/read",markAsRead);
router.patch("/notifications/read-all",markAllAsRead);
router.post("/notifications/fcm-token",saveFcmToken);
router.put("/notifications/preferences",updatePreferences);
router.get("/support/faqs",getFAQs);
router.post("/support/ticket",createTicket);
router.get("/support/tickets",getMyTickets);
router.get("/support/tickets/:id",getTicketById);
module.exports=router;