const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshAccessToken,
  logout,
  getMe
} = require("../controllers/authController");

// AUTH ROUTES
router.post("/register", register);
router.post("/login", login);

// PASSWORD ROUTES
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);

// TOKEN ROUTES
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;