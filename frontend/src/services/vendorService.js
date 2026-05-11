// src/services/vendorService.js
import API from "./axios";

// ── Restaurant ───────────────────────────────────────────────────
export const getMyRestaurant    = ()     => API.get("/vendor/restaurant");
export const updateRestaurant   = (data) => API.put("/vendor/restaurant", data);

// ── Menu ─────────────────────────────────────────────────────────
export const getMenuItems    = ()     => API.get("/vendor/menu");
export const addMenuItem     = (data) => API.post("/vendor/menu", data);
export const updateMenuItem  = (id, data) => API.put(`/vendor/menu/${id}`, data);
export const deleteMenuItem  = (id)   => API.delete(`/vendor/menu/${id}`);

// ── Orders ───────────────────────────────────────────────────────
export const getOrders       = ()     => API.get("/vendor/orders");
export const updateOrderStatus=(id, data)=> API.put(`/vendor/orders/${id}`, data);

// ── Reviews ──────────────────────────────────────────────────────
export const getReviews      = ()     => API.get("/vendor/reviews");

// ── Inventory ────────────────────────────────────────────────────
export const getInventory    = ()     => API.get("/vendor/inventory");
export const updateInventory = (id, data)=> API.put(`/vendor/inventory/${id}`, data);

// ── Payouts ──────────────────────────────────────────────────────
export const getPayouts      = ()     => API.get("/vendor/payouts");

// ── Dashboard Stats ──────────────────────────────────────────────
export const getDashboardStats = ()   => API.get("/vendor/stats");
