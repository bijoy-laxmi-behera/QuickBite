require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// ================= DB =================
const connectDB = require("./config/db");

// ================= ROUTES =================
const authRoutes     = require("./routes/authRoutes");
const vendorRoutes   = require("./routes/vendorRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); // ✅ moved to top

const app = express();

// ================= DB CONNECTION =================
connectDB();

// ================= MIDDLEWARE =================
// ✅ CORS must be FIRST — before express.json and all routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/auth",     authRoutes);
app.use("/api/vendor",   vendorRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/feedback", feedbackRoutes);

// ================= STATIC =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 QuickBite API Running...");
});

// ================= SOCKET.IO SETUP =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// 🔥 Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// Store active delivery partners and their locations
const activeDeliveryPartners = new Map();
const orderTrackingRooms = new Map();

// ================= SOCKET CONNECTION =================
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // ── REGISTER USER (JOIN ROOM) ─────────────────────────────────
  socket.on("register", ({ userId, role }) => {
    if (!userId) return;

    socket.join(userId.toString());

    if (role) {
      socket.join(`${role}_${userId}`);

      if (role === "delivery") {
        activeDeliveryPartners.set(userId.toString(), {
          socketId: socket.id,
          location: null,
          currentOrder: null,
        });
        console.log(`🚚 Delivery partner registered: ${userId}`);
      }
    }

    console.log(`✅ ${role || "user"} joined room: ${userId}`);
  });

  // ── ORDER TRACKING ────────────────────────────────────────────
  socket.on("join-order-tracking", ({ orderId, userId }) => {
    if (!orderId) return;
    socket.join(`order-${orderId}`);
    orderTrackingRooms.set(socket.id, { orderId, userId });
    console.log(`📍 Customer ${userId} joined tracking for order ${orderId}`);
    socket.emit("tracking-joined", { orderId, success: true });
  });

  socket.on("leave-order-tracking", ({ orderId }) => {
    if (!orderId) return;
    socket.leave(`order-${orderId}`);
    orderTrackingRooms.delete(socket.id);
    console.log(`📍 User left tracking for order ${orderId}`);
  });

  // ── DELIVERY LIVE LOCATION ────────────────────────────────────
  socket.on("update-location", ({ deliveryPartnerId, orderId, location, status }) => {
    if (!deliveryPartnerId || !orderId || !location) return;

    if (activeDeliveryPartners.has(deliveryPartnerId)) {
      const partner = activeDeliveryPartners.get(deliveryPartnerId);
      partner.location    = location;
      partner.currentOrder = orderId;
      partner.lastUpdate  = new Date();
      activeDeliveryPartners.set(deliveryPartnerId, partner);
    }

    io.to(`order-${orderId}`).emit("delivery-location-update", {
      orderId,
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || null,
      },
      status:    status || "on_the_way",
      timestamp: new Date(),
      deliveryPartnerId,
    });

    console.log(`📍 Delivery ${deliveryPartnerId} updated location for order ${orderId}`);
  });

  socket.on("delivery-status", ({ orderId, status, estimatedArrival, deliveryPartnerId }) => {
    if (!orderId) return;
    io.to(`order-${orderId}`).emit("delivery-status-update", {
      orderId, status,
      estimatedArrival: estimatedArrival || null,
      timestamp: new Date(),
      deliveryPartnerId,
    });
    console.log(`🚚 Delivery status for order ${orderId}: ${status}`);
  });

  // ── LIVE LOCATION STREAM ──────────────────────────────────────
  socket.on("request-live-location", ({ orderId, customerId }) => {
    if (!orderId || !customerId) return;
    socket.join(`live-location-${orderId}`);
    console.log(`📱 Customer ${customerId} requested live location for order ${orderId}`);
    socket.emit("live-location-started", { orderId, interval: 3000 });
  });

  socket.on("stop-live-location", ({ orderId }) => {
    if (!orderId) return;
    socket.leave(`live-location-${orderId}`);
    console.log(`📍 Live location stopped for order ${orderId}`);
  });

  socket.on("get-delivery-location", ({ orderId, deliveryPartnerId }) => {
    if (!orderId) return;
    const partner = activeDeliveryPartners.get(deliveryPartnerId);
    if (partner?.location) {
      socket.emit("delivery-current-location", {
        orderId, location: partner.location, lastUpdate: partner.lastUpdate,
      });
    } else {
      socket.emit("delivery-location-error", { orderId, message: "Location not available" });
    }
  });

  // ── ORDER STATUS UPDATE ───────────────────────────────────────
  socket.on("orderUpdate", ({ userId, data }) => {
    if (!userId) return;
    io.to(userId.toString()).emit("orderStatus", data);
    if (data.orderId) io.to(`order-${data.orderId}`).emit("orderStatus", data);
  });

  // ── NOTIFICATIONS ─────────────────────────────────────────────
  socket.on("sendNotification", ({ userId, notification }) => {
    if (!userId) return;
    io.to(userId.toString()).emit("newNotification", notification);
  });

  // ── TYPING INDICATOR ──────────────────────────────────────────
  socket.on("typing", ({ userId, orderId, isTyping }) => {
    if (!orderId) return;
    socket.to(`order-${orderId}`).emit("user-typing", { userId, isTyping });
  });

  // ── DISCONNECT ────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    orderTrackingRooms.delete(socket.id);

    for (const [key, value] of activeDeliveryPartners.entries()) {
      if (value.socketId === socket.id) {
        console.log(`🚚 Delivery partner ${key} disconnected`);
        activeDeliveryPartners.delete(key);
        break;
      }
    }
  });
});

// ================= GLOBAL HELPERS FOR CONTROLLERS =================
global.broadcastDeliveryLocation = (orderId, location, status) => {
  io.to(`order-${orderId}`).emit("delivery-location-update", {
    orderId, location, status, timestamp: new Date(),
  });
};

global.broadcastOrderStatus = (orderId, status, userId) => {
  io.to(`order-${orderId}`).emit("order-status-changed", {
    orderId, status, timestamp: new Date(),
  });
  if (userId) {
    io.to(userId.toString()).emit("order-status-changed", {
      orderId, status, timestamp: new Date(),
    });
  }
};
// Emit order status updates
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (order) {
    io.to(`user_${order.user}`).emit('orderStatusUpdate', {
      orderId: orderId,
      status: status,
      estimatedArrival: "15-20 min"
    });
  }
};
// ================= START SERVER =================
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
  console.log(`📍 Live tracking enabled`);
  console.log(`🔌 WebSocket server ready`);
});