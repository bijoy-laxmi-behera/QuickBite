require("dotenv").config();
const path    = require("path");
const express = require("express");
const cors    = require("cors");
const cookieParser = require("cookie-parser");
const http    = require("http");
const { Server } = require("socket.io");

// ── DB ────────────────────────────────────────────────────────────────────────
const connectDB = require("./config/db");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const vendorRoutes   = require("./routes/vendorRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// ── Model (needed for broadcastOrderStatus helper) ────────────────────────────
const Order = require("./models/Order");

const app = express();

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
// CORS MUST be first
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.options("*", cors({ origin: allowedOrigins, credentials: true, methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/vendor",   vendorRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/feedback", feedbackRoutes);

// ── Static uploads ────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("🚀 QuickBite API Running..."));

// ── HTTP + Socket.IO server ───────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Make io accessible anywhere via req.app.get("io")
app.set("io", io);

// In-memory maps (no DB needed for these)
const activeDeliveryPartners = new Map(); // deliveryPartnerId → { socketId, location, currentOrder, lastUpdate }
const orderTrackingRooms     = new Map(); // socket.id → { orderId, userId }

// ── Socket.IO ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // ── Register user / join personal room ──────────────────────────────────────
  socket.on("register", ({ userId, role }) => {
    if (!userId) return;
    socket.join(userId.toString());
    if (role) socket.join(`${role}_${userId}`);

    if (role === "delivery") {
      activeDeliveryPartners.set(userId.toString(), {
        socketId: socket.id,
        location: null,
        currentOrder: null,
        lastUpdate: null,
      });
      console.log(`🚚 Delivery partner registered: ${userId}`);
    }
    console.log(`✅ ${role || "user"} joined room: ${userId}`);
  });

  // ── Order tracking room (used by OrderTracking.jsx) ──────────────────────────
  // Frontend emits: joinOrderRoom / leaveOrderRoom
  socket.on("joinOrderRoom", (orderId) => {
    if (!orderId) return;
    socket.join(`order-${orderId}`);
    orderTrackingRooms.set(socket.id, { orderId });
    console.log(`📍 Socket ${socket.id} joined order room: ${orderId}`);
    socket.emit("tracking-joined", { orderId, success: true });
  });

  socket.on("leaveOrderRoom", (orderId) => {
    if (!orderId) return;
    socket.leave(`order-${orderId}`);
    orderTrackingRooms.delete(socket.id);
    console.log(`📍 Socket ${socket.id} left order room: ${orderId}`);
  });

  // Legacy event names (kept for backward compatibility with older code)
  socket.on("join-order-tracking", ({ orderId, userId }) => {
    if (!orderId) return;
    socket.join(`order-${orderId}`);
    orderTrackingRooms.set(socket.id, { orderId, userId });
    socket.emit("tracking-joined", { orderId, success: true });
  });

  socket.on("leave-order-tracking", ({ orderId }) => {
    if (!orderId) return;
    socket.leave(`order-${orderId}`);
    orderTrackingRooms.delete(socket.id);
  });

  // ── Delivery live GPS location ────────────────────────────────────────────────
  socket.on("update-location", ({ deliveryPartnerId, orderId, location, status }) => {
    if (!deliveryPartnerId || !orderId || !location) return;

    if (activeDeliveryPartners.has(deliveryPartnerId)) {
      activeDeliveryPartners.set(deliveryPartnerId, {
        ...activeDeliveryPartners.get(deliveryPartnerId),
        location,
        currentOrder: orderId,
        lastUpdate: new Date(),
      });
    }

    // Broadcast to everyone tracking this order
    io.to(`order-${orderId}`).emit("delivery-location-update", {
      orderId,
      location: { lat: location.lat, lng: location.lng, accuracy: location.accuracy || null },
      status:    status || "on_the_way",
      timestamp: new Date(),
      deliveryPartnerId,
    });
  });

  socket.on("delivery-status", ({ orderId, status, estimatedArrival, deliveryPartnerId }) => {
    if (!orderId) return;
    io.to(`order-${orderId}`).emit("delivery-status-update", {
      orderId, status,
      estimatedArrival: estimatedArrival || null,
      timestamp: new Date(),
      deliveryPartnerId,
    });
  });

  // ── Order status update (emitted by controllers via req.app.get("io")) ────────
  // Frontend listens to: "orderStatusUpdate"
  socket.on("orderUpdate", ({ userId, data }) => {
    if (!userId) return;
    io.to(userId.toString()).emit("orderStatusUpdate", data);
    if (data.orderId) io.to(`order-${data.orderId}`).emit("orderStatusUpdate", data);
  });

  // ── Live location stream (request/stop) ───────────────────────────────────────
  socket.on("request-live-location", ({ orderId, customerId }) => {
    if (!orderId || !customerId) return;
    socket.join(`live-location-${orderId}`);
    socket.emit("live-location-started", { orderId, interval: 3000 });
  });

  socket.on("stop-live-location", ({ orderId }) => {
    if (!orderId) return;
    socket.leave(`live-location-${orderId}`);
  });

  socket.on("get-delivery-location", ({ orderId, deliveryPartnerId }) => {
    if (!orderId) return;
    const partner = activeDeliveryPartners.get(deliveryPartnerId);
    if (partner?.location) {
      socket.emit("delivery-current-location", {
        orderId,
        location:   partner.location,
        lastUpdate: partner.lastUpdate,
      });
    } else {
      socket.emit("delivery-location-error", { orderId, message: "Location not available" });
    }
  });

  // ── Notifications ─────────────────────────────────────────────────────────────
  socket.on("sendNotification", ({ userId, notification }) => {
    if (!userId) return;
    io.to(userId.toString()).emit("newNotification", notification);
  });

  // ── Typing indicator (support chat) ──────────────────────────────────────────
  socket.on("typing", ({ userId, orderId, isTyping }) => {
    if (!orderId) return;
    socket.to(`order-${orderId}`).emit("user-typing", { userId, isTyping });
  });

  // ── Disconnect cleanup ────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    orderTrackingRooms.delete(socket.id);

    for (const [key, val] of activeDeliveryPartners.entries()) {
      if (val.socketId === socket.id) {
        activeDeliveryPartners.delete(key);
        console.log(`🚚 Delivery partner ${key} disconnected`);
        break;
      }
    }
  });
});

// ── Global helpers (call these from any controller) ───────────────────────────

/**
 * Broadcast a delivery GPS location update to everyone tracking the order.
 * Usage in controller: global.broadcastDeliveryLocation(orderId, { lat, lng }, "on_the_way")
 */
global.broadcastDeliveryLocation = (orderId, location, status) => {
  io.to(`order-${orderId}`).emit("delivery-location-update", {
    orderId, location, status, timestamp: new Date(),
  });
};

/**
 * Broadcast an order status change to:
 *   - the order's tracking room  → picked up by OrderTracking.jsx
 *   - the customer's personal room → picked up by Orders.jsx
 *
 * Usage in controller:
 *   global.broadcastOrderStatus(order._id, "preparing", order.customer)
 */
global.broadcastOrderStatus = (orderId, status, userId, extra = {}) => {
  const payload = { orderId: orderId.toString(), status, timestamp: new Date(), ...extra };
  io.to(`order-${orderId}`).emit("orderStatusUpdate", payload);
  if (userId) io.to(userId.toString()).emit("orderStatusUpdate", payload);
};

/**
 * Broadcast a payment confirmation (used by razorpayController after webhook/verify).
 * Usage: global.broadcastPaymentConfirmed(orderId, userId)
 */
global.broadcastPaymentConfirmed = (orderId, userId) => {
  const payload = { orderId: orderId.toString(), status: "paid", timestamp: new Date() };
  io.to(`order-${orderId}`).emit("paymentConfirmed", payload);
  if (userId) io.to(userId.toString()).emit("paymentConfirmed", payload);
};

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO ready`);
  console.log(`📍 Live order tracking enabled`);
});