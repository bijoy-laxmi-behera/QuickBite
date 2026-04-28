const Order = require("../models/Order");
const User = require("../models/userModel");

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
const getOverview = async (req, res) => {
  try {
    const deliveryId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allOrders = await Order.find({
      deliveryPartner: deliveryId,
      deliveryStatus: "delivered",
    });

    const todayOrders = allOrders.filter(
      (o) => new Date(o.updatedAt) >= today
    );

    // ₹30 per delivery (flat rate for demo)
    const RATE = 30;

    res.json({
      success: true,
      data: {
        totalDeliveries: allOrders.length,
        todayDeliveries: todayOrders.length,
        todayEarnings: todayOrders.length * RATE,
        rating: req.user.rating || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ACTIVE ORDER ─────────────────────────────────────────────────────────────
const getActiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      deliveryPartner: req.user._id,
      deliveryStatus: { $in: ["assigned", "picked_up"] },
    })
      .populate("user", "name phone")
      .populate("vendor", "name restaurantName address");

    res.json({ success: true, order: order || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── MARK PICKED UP ───────────────────────────────────────────────────────────
const markPickedUp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.deliveryStatus = "picked_up";
    await order.save();

    res.json({ success: true, message: "Marked as picked up", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── MARK DELIVERED ───────────────────────────────────────────────────────────
const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.deliveryStatus = "delivered";
    order.status = "completed";
    order.deliveredAt = new Date();
    await order.save();

    res.json({ success: true, message: "Order delivered!", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE LOCATION ──────────────────────────────────────────────────────────
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Make sure only the assigned delivery partner can update
    if (order.deliveryPartner?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.deliveryLocation = { lat, lng, updatedAt: new Date() };
    await order.save();

    res.json({ success: true, location: order.deliveryLocation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET LOCATION (polled by customer) ────────────────────────────────────────
const getOrderLocation = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("deliveryLocation deliveryStatus");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      success: true,
      location: order.deliveryLocation || null,
      deliveryStatus: order.deliveryStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── HISTORY ──────────────────────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user._id,
      deliveryStatus: { $in: ["delivered", "cancelled"] },
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── EARNINGS ─────────────────────────────────────────────────────────────────
const getEarnings = async (req, res) => {
  try {
    const RATE = 30;
    const deliveryId = req.user._id;

    const allDelivered = await Order.find({
      deliveryPartner: deliveryId,
      deliveryStatus: "delivered",
    });

    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 7);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const todayCount  = allDelivered.filter((o) => new Date(o.updatedAt) >= today).length;
    const weekCount   = allDelivered.filter((o) => new Date(o.updatedAt) >= weekStart).length;
    const monthCount  = allDelivered.filter((o) => new Date(o.updatedAt) >= monthStart).length;

    res.json({
      success: true,
      data: {
        todayEarnings:    todayCount * RATE,
        weekEarnings:     weekCount * RATE,
        monthEarnings:    monthCount * RATE,
        totalDeliveries:  allDelivered.length,
        deliveryCharges:  allDelivered.length * RATE,
        tips:             0,
        bonuses:          0,
        recentPayouts:    [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const totalDeliveries = await Order.countDocuments({
      deliveryPartner: req.user._id,
      deliveryStatus: "delivered",
    });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        totalDeliveries,
        totalEarnings: totalDeliveries * 30,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicle, licensePlate } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name)         user.name         = name;
    if (phone)        user.phone        = phone;
    if (vehicle)      user.vehicle      = vehicle;
    if (licensePlate) user.licensePlate = licensePlate;

    await user.save();
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOverview,
  getActiveOrder,
  markPickedUp,
  markDelivered,
  updateLocation,
  getOrderLocation,
  getHistory,
  getEarnings,
  getProfile,
  updateProfile,
};
