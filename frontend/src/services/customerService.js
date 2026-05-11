// src/services/customerService.js
import API from "./axios";

// ── Profile ──────────────────────────────────────────────────────
export const getProfile    = ()     => API.get("/customer/profile");
export const updateProfile = (data) => API.put("/customer/profile", data);

// ── Addresses ────────────────────────────────────────────────────
export const getAddresses  = ()     => API.get("/customer/addresses");
export const addAddress    = (data) => API.post("/customer/addresses", data);
export const deleteAddress = (id)   => API.delete(`/customer/addresses/${id}`);

// ── Cart ─────────────────────────────────────────────────────────
export const getCart       = ()     => API.get("/customer/cart");
export const addToCart     = (data) => API.post("/customer/cart", data);
export const updateCart    = (data) => API.put("/customer/cart", data);
export const clearCart     = ()     => API.delete("/customer/cart");

// ── Orders ───────────────────────────────────────────────────────
export const placeOrder    = (data) => API.post("/customer/orders", data);
export const getOrders     = ()     => API.get("/customer/orders");
export const getOrderById  = (id)   => API.get(`/customer/orders/${id}`);
export const trackOrder    = (id)   => API.get(`/customer/orders/${id}/track`);

// ── Favourites ───────────────────────────────────────────────────
export const getFavourites    = ()     => API.get("/customer/favourites");
export const addFavourite     = (data) => API.post("/customer/favourites", data);
export const removeFavourite  = (id)   => API.delete(`/customer/favourites/${id}`);

// ── Notifications ─────────────────────────────────────────────────
export const getNotifications   = ()    => API.get("/customer/notifications");
export const markNotificationRead = (id)=> API.put(`/customer/notifications/${id}/read`);

// ── Restaurants & Menu ───────────────────────────────────────────
export const getRestaurants    = ()     => API.get("/customer/restaurants");
export const getRestaurantById = (id)   => API.get(`/customer/restaurants/${id}`);
export const getMenuByRestaurant=(id)   => API.get(`/customer/restaurants/${id}/menu`);

// ── Reviews ──────────────────────────────────────────────────────
export const submitReview  = (data) => API.post("/customer/reviews", data);
export const getMyReviews  = ()     => API.get("/customer/reviews");

// ── Payments ─────────────────────────────────────────────────────
export const getPayments   = ()     => API.get("/customer/payments");
export const initiatePayment=(data) => API.post("/customer/payments", data);

// ── Subscription ─────────────────────────────────────────────────
export const getSubscriptionPlans = () => API.get("/customer/subscriptions/plans");
export const subscribeToplan=(data)    => API.post("/customer/subscriptions", data);
export const getMySubscription = ()    => API.get("/customer/subscriptions/me");
