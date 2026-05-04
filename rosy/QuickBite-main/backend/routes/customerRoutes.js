const express=require("express");
const router=express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  updateAvatar,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  placeOrder,
  getOrders,
  getOrderById,
  trackOrder,
  cancelOrder,
  reorder,
  removePaymentMethod,
  addPaymentMethod,
  getPaymentMethods,
  getTransactions,
  addReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationPreferences,
  getFavourites,
  addFavourite,
  removeFavourite,
  getRestaurants,
  searchRestaurants,
  getNearbyRestaurants,
  getRestaurantById,
  getMenu,
  getReviews,
  searchMenu,
  getCategories,
  getTrendingItems,
  getMenuItem
}=require("../controllers/customerController");
const {protect}=require("../middleware/authMiddleware");
const upload=require("../middleware/upload");
// PROFILE
router.get("/me",protect,getProfile);
router.put("/me",protect,updateProfile);
router.delete("/me",protect,deleteProfile);
router.put("/me/avatar",protect,upload.single("avatar"),updateAvatar);
// RESTAURANTS
router.get("/",getRestaurants);
router.get("/search",searchRestaurants);
router.get("/nearby",getNearbyRestaurants);
router.get("/:id",getRestaurantById);
router.get("/:id/menu",getMenu);
router.get("/:id/reviews",getReviews);
router.get("/search",searchMenu);
router.get("/categories",getCategories);
router.get("/trending",getTrendingItems);
// MENU ITEM
router.get("/:itemId",getMenuItem);
// ADDRESSES
router.get("/me/addresses",protect,getAddresses);
router.post("/me/addresses",protect,addAddress);
router.put("/me/addresses/:id",protect,protect,updateAddress);
router.delete("/me/addresses/:id",protect,deleteAddress);
router.patch("/me/addresses/:id/default",protect,setDefaultAddress);
// CART
router.get("/me/cart",protect,getCart);
router.post("/me/cart/items",protect,addToCart);
router.put("/me/cart/items/:id",protect,updateCartItem);
router.delete("/me/cart/items/:id",protect,removeCartItem);
router.delete("/me/cart",protect,clearCart);
router.post("/me/cart/apply-coupon",protect,applyCoupon);
// ORDERS
router.post("/me/orders",protect,placeOrder);
router.get("/me/orders",protect,getOrders);
router.get("/me/orders/:id",protect,getOrderById);
router.get("/me/orders/:id/track",protect,trackOrder);
router.post("/me/orders/:id/cancel",protect,cancelOrder);
router.post("/me/orders/:id/reorder",protect,reorder);
// PAYMENT
router.get("/me/payment-methods",protect,getPaymentMethods);
router.post("/me/payment-methods",protect,addPaymentMethod);
router.delete("/me/payment-methods/:id",protect,removePaymentMethod);
router.patch("/me/payment-methods/:id/default",protect,setDefaultAddress);
// TRANSACTIONS
router.get("/me/transactions",protect,getTransactions);
// REVIEWS
router.post("/me/orders/:id/review",protect,addReview);
router.get("/me/reviews",protect,getMyReviews);
router.put("/me/reviews/:id",protect,updateReview);
router.delete("/me/reviews/:id",protect,deleteReview);
// NOTIFICATIONS
router.get("/me/notifications",protect,getNotifications);
router.patch("/me/notifications/:id/read",protect,markAsRead);
router.patch("/me/notifications/read-all",protect,markAllAsRead);
router.put("/me/notifications/preferences",protect,updateNotificationPreferences);
// FAVOURITES
router.get("/me/favourites",protect,getFavourites);
router.post("/me/favourites",protect,addFavourite);
router.delete("/me/favourites/:id",protect,removeFavourite);
module.exports=router;