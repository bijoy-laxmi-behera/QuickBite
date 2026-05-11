// routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const {
  // Restaurant
  getRestaurants,
  searchRestaurants,
  getNearbyRestaurants,
  getRestaurantById,
  getMenu,
  getReviews,
  searchMenu,
  getMenuItem,
  getCategories,
  getTrendingItems,
  // Profile
  getProfile,
  updateProfile,
  deleteProfile,
  updateAvatar,
  // Address
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  // Cart
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  // Order
  placeOrder,
  getOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  reorder,
  // Payment
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPayment,
  getTransactions,
  // Review
  addReview,
  getMyReviews,
  updateReview,
  deleteReview,
  // Notification
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationPreferences,
  // Favourites
  getFavourites,
  addFavourite,
  removeFavourite,
  saveLocation,
  getSubscriptionPlans,
  getSubscriptionStatus,
  createSubscription,
  cancelSubscription,
  applySubscriptionCoupon
} = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ============ PROFILE ROUTES ============
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.delete("/me", protect, deleteProfile);
router.put("/me/avatar", protect, upload.single("avatar"), updateAvatar);

// ============ RESTAURANT ROUTES (Public) ============
router.get("/restaurants", getRestaurants);
router.get("/restaurants/search", searchRestaurants);
router.get("/restaurants/nearby", getNearbyRestaurants);
router.get("/restaurants/:id", getRestaurantById);
router.get("/restaurants/:id/menu", getMenu);
router.get("/restaurants/:id/reviews", getReviews);
router.get("/menu/search", searchMenu);
router.get("/categories", getCategories);
router.get("/trending-items", getTrendingItems);
router.get("/menu-item/:itemId", getMenuItem);

// Legacy routes for backward compatibility
router.get("/", getRestaurants);
router.get("/search/restaurants", searchRestaurants);
router.get("/nearby", getNearbyRestaurants);
router.get("/restaurant/:id", getRestaurantById);
router.get("/:id/menu", getMenu);
router.get("/:id/reviews", getReviews);
router.get("/search", searchMenu);
router.get("/menu-item/:itemId", getMenuItem);

// ============ ADDRESS ROUTES ============
router.get("/me/addresses", protect, getAddresses);
router.post("/me/addresses", protect, addAddress);
router.put("/me/addresses/:id", protect, updateAddress);
router.delete("/me/addresses/:id", protect, deleteAddress);
router.patch("/me/addresses/:id/default", protect, setDefaultAddress);

// ============ CART ROUTES ============
router.get("/me/cart", protect, getCart);
router.post("/me/cart/items", protect, addToCart);
router.put("/me/cart/items/:id", protect, updateCartItem);
router.delete("/me/cart/items/:id", protect, removeCartItem);
router.delete("/me/cart", protect, clearCart);
router.post("/me/cart/apply-coupon", protect, applyCoupon);

// ============ ORDER ROUTES ============
router.post("/me/orders", protect, placeOrder);
router.get("/me/orders", protect, getOrders);
router.get("/me/orders/:id", protect, getOrderById);
router.get("/me/orders/:id/track", protect, trackOrder);
router.post("/me/orders/:id/cancel", protect, cancelOrder);
router.post("/me/orders/:id/reorder", protect, reorder);

// ============ PAYMENT ROUTES ============
router.get("/me/payment-methods", protect, getPaymentMethods);
router.post("/me/payment-methods", protect, addPaymentMethod);
router.delete("/me/payment-methods/:id", protect, removePaymentMethod);
router.patch("/me/payment-methods/:id/default", protect, setDefaultPayment);

// ============ TRANSACTION ROUTES ============
router.get("/me/transactions", protect, getTransactions);

// ============ REVIEW ROUTES ============
router.post("/me/orders/:id/review", protect, addReview);
router.get("/me/reviews", protect, getMyReviews);
router.put("/me/reviews/:id", protect, updateReview);
router.delete("/me/reviews/:id", protect, deleteReview);

// ============ NOTIFICATION ROUTES ============
router.get("/me/notifications", protect, getNotifications);
router.patch("/me/notifications/:id/read", protect, markAsRead);
router.patch("/me/notifications/read-all", protect, markAllAsRead);
router.put("/me/notifications/preferences", protect, updateNotificationPreferences);

// ============ FAVOURITE ROUTES ============
router.get("/me/favourites", protect, getFavourites);
router.post("/me/favourites", protect, addFavourite);
router.delete("/me/favourites/:id", protect, removeFavourite);

// ============ LOCATION ROUTES ============
router.post("/location/save", protect, saveLocation);
// Subscription Routes
router.get("/subscription/plans", protect, getSubscriptionPlans);
router.get("/subscription/status", protect, getSubscriptionStatus);
router.post("/subscription/create", protect, createSubscription);
router.post("/subscription/cancel", protect, cancelSubscription);
router.post("/subscription/apply-coupon", protect, applySubscriptionCoupon);
module.exports = router;