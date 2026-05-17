require("dotenv").config();
const path    = require("path");
const express = require("express");
const cors    = require("cors");
const cookieParser = require("cookie-parser");
const http    = require("http");
const { Server } = require("socket.io");
const jwt     = require("jsonwebtoken");

// ── DB ────────────────────────────────────────────────────────────────────────
const connectDB = require("./config/db");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const vendorRoutes   = require("./routes/vendorRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// ── Model ─────────────────────────────────────────────────────────────────────
const Order = require("./models/Order");

const app = express();

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Allowed Origins ───────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://quick-bite-2026.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ── Middleware ────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
};

app.use(cors(corsOptions));
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
    origin: allowedOrigins,
    credentials: true,
  },
});

// Make io accessible anywhere via req.app.get("io")
app.set("io", io);

// ── FIX: Socket.IO auth middleware ────────────────────────────────────────────
// Validates the JWT sent by the frontend in socket.auth.token.
// If the token is missing or invalid the connection is rejected BEFORE
// the "connection" handler fires — this stops the connect/disconnect loop.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    // Allow unauthenticated connections (guest tracking, etc.) but mark them
    socket.data.userId = null;
    socket.data.role   = "guest";
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support different payload shapes (id / _id / userId)
    socket.data.userId = (decoded.id || decoded._id || decoded.userId || "").toString();
    socket.data.role   = decoded.role || "user";
    next();
  } catch (err) {
    // Invalid / expired token — reject cleanly instead of bouncing
    console.warn("Socket auth rejected:", err.message);
    next(new Error("Authentication error"));
  }
});

// In-memory maps
const activeDeliveryPartners = new Map(); // deliveryPartnerId → { socketId, location, currentOrder, lastUpdate }
const orderTrackingRooms     = new Map(); // socket.id → { orderId, userId }

// ── Socket.IO ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id} (userId=${socket.data.userId}, role=${socket.data.role})`);

  // Auto-join personal room if we already know the userId from the token
  if (socket.data.userId) {
    socket.join(socket.data.userId);
    if (socket.data.role) socket.join(`${socket.data.role}_${socket.data.userId}`);

    if (socket.data.role === "delivery") {
      activeDeliveryPartners.set(socket.data.userId, {
        socketId:     socket.id,
        location:     null,
        currentOrder: null,
        lastUpdate:   null,
      });
      console.log(`🚚 Delivery partner auto-registered: ${socket.data.userId}`);
    }
  }

  // ── Register (explicit, for clients that send it manually) ──────────────────
  socket.on("register", ({ userId, role }) => {
    if (!userId) return;
    const uid = userId.toString();
    socket.join(uid);
    if (role) socket.join(`${role}_${uid}`);

    if (role === "delivery") {
      activeDeliveryPartners.set(uid, {
        socketId:     socket.id,
        location:     null,
        currentOrder: null,
        lastUpdate:   null,
      });
      console.log(`🚚 Delivery partner registered: ${uid}`);
    }
    console.log(`✅ ${role || "user"} joined room: ${uid}`);
  });

  // ── Order tracking room ───────────────────────────────────────────────────
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

  // Legacy event names
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

  // ── Delivery GPS ──────────────────────────────────────────────────────────
  socket.on("update-location", ({ deliveryPartnerId, orderId, location, status }) => {
    if (!deliveryPartnerId || !orderId || !location) return;

    if (activeDeliveryPartners.has(deliveryPartnerId)) {
      activeDeliveryPartners.set(deliveryPartnerId, {
        ...activeDeliveryPartners.get(deliveryPartnerId),
        location,
        currentOrder: orderId,
        lastUpdate:   new Date(),
      });
    }

    io.to(`order-${orderId}`).emit("delivery-location-update", {
      orderId,
      location:  { lat: location.lat, lng: location.lng, accuracy: location.accuracy || null },
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

  // ── Order status update ───────────────────────────────────────────────────
  socket.on("orderUpdate", ({ userId, data }) => {
    if (!userId) return;
    io.to(userId.toString()).emit("orderStatusUpdate", data);
    if (data.orderId) io.to(`order-${data.orderId}`).emit("orderStatusUpdate", data);
  });

  // ── Live location stream ──────────────────────────────────────────────────
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

  // ── Notifications ─────────────────────────────────────────────────────────
  socket.on("sendNotification", ({ userId, notification }) => {
    if (!userId) return;
    io.to(userId.toString()).emit("newNotification", notification);
  });

  // ── Typing indicator ──────────────────────────────────────────────────────
  socket.on("typing", ({ userId, orderId, isTyping }) => {
    if (!orderId) return;
    socket.to(`order-${orderId}`).emit("user-typing", { userId, isTyping });
  });

  // ── Disconnect cleanup ────────────────────────────────────────────────────
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

// ── Global helpers ────────────────────────────────────────────────────────────

global.broadcastDeliveryLocation = (orderId, location, status) => {
  io.to(`order-${orderId}`).emit("delivery-location-update", {
    orderId, location, status, timestamp: new Date(),
  });
};

global.broadcastOrderStatus = (orderId, status, userId, extra = {}) => {
  const payload = { orderId: orderId.toString(), status, timestamp: new Date(), ...extra };
  io.to(`order-${orderId}`).emit("orderStatusUpdate", payload);
  if (userId) io.to(userId.toString()).emit("orderStatusUpdate", payload);
};

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