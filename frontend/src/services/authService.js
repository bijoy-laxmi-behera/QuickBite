// src/services/authService.js
import API from "./axios";

export const login          = (data) => API.post("/auth/login", data);
export const register       = (data) => API.post("/auth/register", data);
export const logout         = ()     => API.post("/auth/logout");
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword  = (data) => API.post("/auth/reset-password", data);
export const getMe          = ()     => API.get("/auth/me");
