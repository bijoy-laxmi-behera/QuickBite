// src/services/adminService.js
import API from "./axios";

// ── Dashboard ────────────────────────────────────────────────────
export const getDashboardStats  = ()     => API.get("/admin/stats");

// ── Users ────────────────────────────────────────────────────────
export const getAllUsers   = ()     => API.get("/admin/users");
export const getUserById   = (id)   => API.get(`/admin/users/${id}`);
export const updateUser    = (id, data) => API.put(`/admin/users/${id}`, data);
export const deleteUser    = (id)   => API.delete(`/admin/users/${id}`);

// ── Restaurants ──────────────────────────────────────────────────
export const getAllRestaurants  = ()     => API.get("/admin/restaurants");
export const approveRestaurant = (id)   => API.put(`/admin/restaurants/${id}/approve`);
export const deleteRestaurant  = (id)   => API.delete(`/admin/restaurants/${id}`);

// ── Orders ───────────────────────────────────────────────────────
export const getAllOrders   = ()     => API.get("/admin/orders");
export const getOrderById   = (id)   => API.get(`/admin/orders/${id}`);

// ── Categories ───────────────────────────────────────────────────
export const getCategories  = ()     => API.get("/admin/categories");
export const addCategory    = (data) => API.post("/admin/categories", data);
export const deleteCategory = (id)   => API.delete(`/admin/categories/${id}`);

// ── Coupons ──────────────────────────────────────────────────────
export const getCoupons     = ()     => API.get("/admin/coupons");
export const addCoupon      = (data) => API.post("/admin/coupons", data);
export const deleteCoupon   = (id)   => API.delete(`/admin/coupons/${id}`);

// ── Payouts ──────────────────────────────────────────────────────
export const getPayouts     = ()     => API.get("/admin/payouts");
export const processPayouts = (id)   => API.put(`/admin/payouts/${id}/process`);

// ── Support Tickets ──────────────────────────────────────────────
export const getSupportTickets  = ()     => API.get("/admin/support");
export const resolveTicket      = (id)   => API.put(`/admin/support/${id}/resolve`);

// ── Settings ─────────────────────────────────────────────────────
export const getSettings    = ()     => API.get("/admin/settings");
export const updateSettings = (data) => API.put("/admin/settings", data);
