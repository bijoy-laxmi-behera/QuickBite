require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes     = require("./routes/authRoutes");
const vendorRoutes   = require("./routes/vendorRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes"); // ✅ NEW

const app = express();

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ─── ROUTES ───────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/vendor",   vendorRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/delivery", deliveryRoutes); // ✅ NEW
app.use("/uploads",      express.static("uploads"));

// ─── NOTIFICATIONS ────────────────────────────────────────
app.get("/api/notifications", (req, res) => {
  res.status(200).json({ success: true, notifications: [] });
});

// ─── ROOT ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("QuickBite API Running...");
});

// ─── 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── ERROR HANDLER ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
