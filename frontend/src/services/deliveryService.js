// src/services/deliveryService.js
import API from "./axios";

// ── Profile ──────────────────────────────────────────────────────
export const getProfile      = ()     => API.get("/delivery/profile");
export const updateProfile   = (data) => API.put("/delivery/profile", data);

// ── Orders ───────────────────────────────────────────────────────
export const getAssignedOrders  = ()          => API.get("/delivery/orders");
export const acceptOrder        = (id)        => API.put(`/delivery/orders/${id}/accept`);
export const updateOrderStatus  = (id, data)  => API.put(`/delivery/orders/${id}/status`, data);
export const getOrderById       = (id)        => API.get(`/delivery/orders/${id}`);

// ── Earnings ─────────────────────────────────────────────────────
export const getEarnings     = ()     => API.get("/delivery/earnings");

// ── Dashboard Stats ──────────────────────────────────────────────
export const getDashboardStats = ()   => API.get("/delivery/stats");
