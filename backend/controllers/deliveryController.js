// controllers/deliveryController.js
const User = require("../models/userModel");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Payout = require("../models/payoutModel");
const FAQ = require("../models/FAQ");
const SupportTicket = require("../models/SupportTicket");
// Add these imports at the top of deliveryController.js
const Wallet = require("../models/Wallet");
const WithdrawalRequest = require("../models/WithdrawalRequest");
const sendEmail = require("../utils/sendEmail");
// ==================== PROFILE CONTROLLERS ====================

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, vehicleType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (vehicleType) {
      user.vehicle = user.vehicle || {};
      user.vehicle.type = vehicleType;
    }

    await user.save();
    res.json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.avatar = req.file.path;
    await user.save();
    res.json({ success: true, message: "Avatar updated", data: { avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.documents = {
      ...user.documents,
      license: req.files?.license?.[0]?.path || user.documents?.license,
      rc: req.files?.rc?.[0]?.path || user.documents?.rc,
      idProof: req.files?.idProof?.[0]?.path || user.documents?.idProof,
    };

    await user.save();
    res.json({ success: true, message: "Documents uploaded", data: user.documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { type, number, model } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.vehicle = {
      type: type || user.vehicle?.type,
      number: number || user.vehicle?.number,
      model: model || user.vehicle?.model,
    };

    await user.save();
    res.json({ success: true, message: "Vehicle updated", data: user.vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBank = async (req, res) => {
  try {
    const { accountNumber, ifsc, accountHolderName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.bank = {
      accountNumber,
      ifsc,
      accountHolderName,
    };

    await user.save();
    res.json({ success: true, message: "Bank details updated", data: user.bank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await user.deleteOne();
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STATUS CONTROLLERS ====================

const toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isOnline = !user.isOnline;
    await user.save();
    res.json({ success: true, message: "Status updated", data: { isOnline: user.isOnline } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: { isOnline: user.isOnline } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LOCATION CONTROLLERS ====================

const updateLocation = async (req, res) => {
  try {
    let { lat, lng } = req.body;
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Invalid coordinates" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.location = {
      type: "Point",
      coordinates: [lng, lat],
      updatedAt: new Date()
    };

    await user.save();
    res.json({ success: true, message: "Location updated", data: user.location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLocation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: { location: user.location } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ORDER CONTROLLERS ====================

const getIncomingOrders = async (req, res) => {
  try {
    // DEBUG: check what's actually in DB
    const allOrders = await Order.find({}).select("status deliveryStatus deliveryPartner deliveryAgent orderId").lean();
    console.log("ALL ORDERS IN DB:", JSON.stringify(allOrders, null, 2));

    const orders = await Order.find({ 
      deliveryStatus: "pending",
      status: { $in: ["pending", "confirmed", "preparing"] },
    })
      .populate("user", "name phone")
      .populate("vendor", "name address phone")
      .sort({ createdAt: -1 });
    
    console.log("FILTERED ORDERS:", orders.length);
    
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { deliveryAgent: req.user.id },
        { deliveryPartner: req.user.id }
      ],
      deliveryStatus: { $in: ["accepted", "picked_up"] }
    })
      .populate("user", "name phone")
      .populate("vendor", "name address phone location");

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phone email")
      .populate("vendor", "name address phone location cuisine")
      .populate("items.menuItem", "name price image isveg");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const acceptOrder = async (req, res) => {
  try {
    console.log("=== ACCEPT ORDER DEBUG ===");
    console.log("Order ID:", req.params.id);
    console.log("Delivery Agent ID:", req.user.id);

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("Current order status:", order.deliveryStatus);

    if (order.deliveryStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be accepted. Current status: ${order.deliveryStatus}`
      });
    }

    // Update order
    order.deliveryPartner = req.user.id;
    order.deliveryAgent = req.user.id;   // keep for backward compat
    order.deliveryStatus = "accepted";
    order.acceptedAt = new Date();

    await order.save();

    console.log("Order accepted. New status:", order.deliveryStatus);
    console.log("Delivery agent saved:", order.deliveryAgent);

    res.json({
      success: true,
      message: "Order accepted successfully",
      data: order
    });

  } catch (error) {
    console.error("Error in acceptOrder:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.deliveryStatus = "rejected";
    order.rejectionReason = reason;
    await order.save();

    res.json({ success: true, message: "Order rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const markPickedUp = async (req, res) => {
  try {
    console.log("=== MARK PICKED UP DEBUG ===");
    console.log("Order ID:", req.params.id);
    console.log("Delivery Agent ID:", req.user.id);

    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log("Order not found");
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("Current order status:", order.deliveryStatus);
    console.log("Order delivery agent:", order.deliveryAgent);

    // Skip the delivery agent check for now (temporarily disable)
    // Just check if order is in accepted state
    if (order.deliveryStatus !== "accepted") {
      console.log("Invalid status for pickup:", order.deliveryStatus);
      return res.status(400).json({
        success: false,
        message: `Order cannot be picked up. Current status: ${order.deliveryStatus}. Expected: accepted`
      });
    }

    // Update order status
    order.deliveryStatus = "picked_up";
    order.pickedAt = new Date();

    // If delivery agent is not set, set it now
    if (!order.deliveryAgent) {
      order.deliveryAgent = req.user.id;
      console.log("Setting delivery agent to:", req.user.id);
    }

    await order.save();

    console.log("Order updated successfully. New status:", order.deliveryStatus);

    // Send notification to customer (optional - comment out if Notification model has issues)
    try {
      await Notification.create({
        user: order.user,
        title: "Order Picked Up",
        message: `Your order #${order.orderId} has been picked up by the delivery partner and is on the way!`,
        type: "order",
        isRead: false
      });
    } catch (notifError) {
      console.error("Notification error (non-critical):", notifError);
    }

    res.json({
      success: true,
      message: "Order picked up successfully",
      data: order
    });

  } catch (error) {
    console.error("Error in markPickedUp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if OTP exists
    if (!order.otp) {
      return res.status(400).json({ success: false, message: "OTP not generated for this order" });
    }

    if (order.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const markDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // FIXED: Check if deliveryAgent exists before comparing
    if (!order.deliveryAgent) {
      // If no delivery agent assigned, assign the current user
      order.deliveryAgent = req.user.id;
    }

    // Now safe to compare
    if (order.deliveryAgent.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check if order is in correct state
    if (order.deliveryStatus !== "picked_up") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be delivered. Current status: ${order.deliveryStatus}`
      });
    }

    order.deliveryStatus = "delivered";
    order.status = "delivered";
    order.deliveredAt = new Date();
    await order.save();

    // Add earnings to wallet
    const earnings = order.deliveryFee || 40;
    await addEarningsToWallet(order, req.user.id, earnings);

    // Send notification to customer
    try {
      await Notification.create({
        user: order.user,
        title: "Order Delivered",
        message: `Your order #${order.orderId} has been delivered successfully! Enjoy your meal!`,
        type: "order",
        isRead: false
      });
    } catch (notifError) {
      console.error("Notification error (non-critical):", notifError);
    }

    res.json({ success: true, message: "Order delivered successfully", data: order });

  } catch (error) {
    console.error("Error marking delivered:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const reportIssue = async (req, res) => {
  try {
    const { issue } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.issue = issue;
    await order.save();

    res.json({ success: true, message: "Issue reported" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;
    const filter = {
      deliveryAgent: req.user.id,
      deliveryStatus: "delivered"
    };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(filter)
      .populate("user", "name phone")
      .populate("vendor", "name")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EARNINGS CONTROLLERS ====================

const getEarningsSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Transaction.aggregate([
      { $match: { user: userId, status: "success", type: "delivery_earning" } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$amount" },
          totalTrips: { $sum: 1 },
        },
      },
    ]);

    const totalEarnings = result[0]?.totalEarnings || 0;
    const totalTrips = result[0]?.totalTrips || 0;

    res.json({
      success: true,
      totalEarnings,
      totalTrips,
      avgPerTrip: totalTrips ? totalEarnings / totalTrips : 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTodayEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const earnings = await Transaction.find({
      user: userId,
      createdAt: { $gte: start },
      status: "success",
      type: "delivery_earning"
    }).populate("order");

    const total = earnings.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      count: earnings.length,
      total,
      earnings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWeeklyEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const data = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          status: "success",
          type: "delivery_earning",
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyEarnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Transaction.aggregate([
      { $match: { user: userId, status: "success", type: "delivery_earning" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({
      vendor: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payouts.length,
      payouts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const transactions = await Transaction.find({
      user: req.user.id,
    })
      .populate("order")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PERFORMANCE CONTROLLERS ====================

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalAssigned = await Order.countDocuments({
      deliveryAgent: userId,
    });

    const completed = await Order.countDocuments({
      deliveryAgent: userId,
      deliveryStatus: "delivered",
    });

    const accepted = await Order.countDocuments({
      deliveryAgent: userId,
      deliveryStatus: { $in: ["accepted", "picked_up", "delivered"] },
    });

    // Avg delivery time (from accepted to delivered)
    const avgTimeData = await Order.aggregate([
      {
        $match: {
          deliveryAgent: userId,
          deliveryStatus: "delivered",
          deliveredAt: { $exists: true },
          acceptedAt: { $exists: true },
        },
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ["$deliveredAt", "$acceptedAt"] },
              1000 * 60, // minutes
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$duration" },
        },
      },
    ]);

    // Rating
    const ratingData = await Review.aggregate([
      {
        $match: {
          vendor: userId,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    res.json({
      success: true,
      rating: ratingData[0]?.avgRating || 0,
      completionRate: totalAssigned ? (completed / totalAssigned) * 100 : 0,
      acceptanceRate: totalAssigned ? (accepted / totalAssigned) * 100 : 0,
      avgDeliveryTime: avgTimeData[0]?.avgTime || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRatings = async (req, res) => {
  try {
    const reviews = await Review.find({
      vendor: req.user.id,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

    res.json({
      success: true,
      count: reviews.length,
      avgRating,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBadges = async (req, res) => {
  try {
    const completed = await Order.countDocuments({
      deliveryAgent: req.user.id,
      deliveryStatus: "delivered",
    });

    const rating = await Review.aggregate([
      { $match: { vendor: req.user.id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const avgRating = rating[0]?.avgRating || 0;

    const badges = [];

    if (completed >= 10) badges.push({ name: "Rookie Rider", earned: true, earnedDate: null });
    if (completed >= 50) badges.push({ name: "Pro Rider", earned: true, earnedDate: null });
    if (completed >= 100) badges.push({ name: "Elite Rider", earned: true, earnedDate: null });
    if (avgRating >= 4.8 && completed >= 20) badges.push({ name: "Gold Star", earned: true, earnedDate: null });
    if (completed >= 200) badges.push({ name: "Legend", earned: true, earnedDate: null });

    // Add locked badges
    if (completed < 10) badges.push({ name: "Rookie Rider", earned: false, requirement: "Complete 10 deliveries", progress: (completed / 10) * 100 });
    if (completed < 50 && completed >= 10) badges.push({ name: "Pro Rider", earned: false, requirement: "Complete 50 deliveries", progress: (completed / 50) * 100 });
    if (completed < 100 && completed >= 50) badges.push({ name: "Elite Rider", earned: false, requirement: "Complete 100 deliveries", progress: (completed / 100) * 100 });

    res.json({
      success: true,
      totalDeliveries: completed,
      badges,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Order.aggregate([
      {
        $match: {
          deliveryStatus: "delivered",
        },
      },
      {
        $group: {
          _id: "$deliveryAgent",
          totalDeliveries: { $sum: 1 },
        },
      },
      { $sort: { totalDeliveries: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      { $unwind: "$agent" },
      {
        $project: {
          _id: 1,
          totalDeliveries: 1,
          "agent.name": 1,
          "agent.avatar": 1,
        },
      },
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== NOTIFICATION CONTROLLERS ====================

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.fcmToken = token;
    await user.save();
    res.json({ success: true, message: "FCM token saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body,
    };

    await user.save();
    res.json({ success: true, message: "Preferences updated", data: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUPPORT CONTROLLERS ====================

const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required" });
    }

    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      message,
      status: "open",
    });

    res.status(201).json({ success: true, message: "Ticket created", data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateOrderLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify delivery partner owns this order
    if (order.deliveryAgent.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update delivery location
    order.deliveryLocation = {
      lat,
      lng,
      updatedAt: new Date()
    };

    if (status) {
      order.deliveryStatus = status;
    }

    await order.save();

    // Emit socket event for customer tracking
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${orderId}`).emit('deliveryLocationUpdate', {
        orderId,
        location: { lat, lng },
        status: order.deliveryStatus,
        estimatedArrival: order.estimatedArrival
      });
    }

    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error("Error updating order location:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get delivery tracking info for customer
const getTrackingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("deliveryAgent", "name phone avatar")
      .populate("vendor", "name address location");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Calculate ETA based on distance
    let eta = order.estimatedArrival;
    let distance = null;

    if (order.deliveryLocation && order.customerLocation) {
      distance = calculateDistance(
        order.deliveryLocation.lat,
        order.deliveryLocation.lng,
        order.customerLocation.lat,
        order.customerLocation.lng
      );
      eta = Math.ceil(distance * 3); // ~3 minutes per km
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.deliveryStatus,
        deliveryPartner: order.deliveryAgent,
        deliveryLocation: order.deliveryLocation,
        customerLocation: order.customerLocation,
        restaurantLocation: order.vendor?.location,
        estimatedArrival: eta,
        distanceToCustomer: distance,
        items: order.items,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error("Error getting tracking info:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
// ==================== WALLET CONTROLLERS ====================

// Get wallet balance
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user.id,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0
      });
    }

    res.json({ success: true, data: wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get wallet transactions
const getWalletTransactions = async (req, res) => {
  try {
    const { limit = 50, page = 1, type } = req.query;
    const filter = { user: req.user.id };

    if (type && type !== 'all') {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter)
      .populate("order", "orderId totalAmount")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request withdrawal
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, upiId, bankDetails } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is ₹50" });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Create withdrawal request
    const withdrawalRequest = await WithdrawalRequest.create({
      user: req.user.id,
      amount,
      paymentMethod,
      upiId: paymentMethod === 'upi' ? upiId : undefined,
      bankDetails: paymentMethod === 'bank' ? bankDetails : undefined,
      status: "pending"
    });

    // Deduct from wallet balance and add to pending
    wallet.balance -= amount;
    wallet.pendingBalance += amount;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      user: req.user.id,
      amount: amount,
      type: "debit",
      status: "pending",
      description: `Withdrawal request #${withdrawalRequest._id.toString().slice(-8)}`,
      reference: withdrawalRequest._id,
      paymentMethod
    });

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdrawalRequest
    });
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get withdrawal requests
const getWithdrawalRequests = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching withdrawal requests:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel withdrawal request
const cancelWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await WithdrawalRequest.findOne({ _id: id, user: req.user.id });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot cancel this request" });
    }

    request.status = "cancelled";
    await request.save();

    // Refund to wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (wallet) {
      wallet.balance += request.amount;
      wallet.pendingBalance -= request.amount;
      await wallet.save();
    }

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { reference: id, type: "debit" },
      { status: "failed" }
    );

    res.json({ success: true, message: "Withdrawal request cancelled" });
  } catch (error) {
    console.error("Error cancelling withdrawal:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add earnings to wallet (called when order is delivered)
const addEarningsToWallet = async (orderId, deliveryPartnerId, amount) => {
  try {
    let wallet = await Wallet.findOne({ user: deliveryPartnerId });
    if (!wallet) {
      wallet = await Wallet.create({
        user: deliveryPartnerId,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0
      });
    }

    wallet.balance += amount;
    wallet.totalEarned += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await Transaction.create({
      user: deliveryPartnerId,
      order: orderId,
      amount: amount,
      type: "credit",
      status: "success",
      description: `Delivery earning for order`,
      reference: orderId
    });

    return true;
  } catch (error) {
    console.error("Error adding earnings to wallet:", error);
    return false;
  }
};
const resendOtp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const customer = await User.findById(order.user);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Create email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your Delivery OTP</h2>
        <p>Your OTP for order #${order.orderId} is: <strong style="font-size: 24px;">${order.otp}</strong></p>
        <p>Please share this OTP with the delivery partner.</p>
      </div>
    `;

    await sendEmail(customer.email, `Your OTP for Order #${order.orderId}`, emailHtml);

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  // Profile
  getMyProfile,
  updateProfile,
  updateAvatar,
  uploadDocuments,
  updateVehicle,
  updateBank,
  deleteAccount,
  toggleStatus,
  getStatus,
  updateLocation,
  getLocation,
  // Orders
  getIncomingOrders,
  getActiveOrder,
  getOrderById,
  acceptOrder,
  rejectOrder,
  markPickedUp,
  markDelivered,
  verifyOtp,
  reportIssue,
  getOrderHistory,
  // Earnings
  getEarningsSummary,
  getTodayEarnings,
  getWeeklyEarnings,
  getMonthlyEarnings,
  getPayouts,
  getTransactions,
  // Performance
  getStats,
  getRatings,
  getBadges,
  getLeaderboard,
  // Notifications
  getNotifications,
  markAsRead,
  markAllAsRead,
  saveFcmToken,
  updatePreferences,
  // Support
  getFAQs,
  createTicket,
  getMyTickets,
  getTicketById,
  updateOrderLocation,
  getTrackingInfo,
  getWallet,
  getWalletTransactions,
  requestWithdrawal,
  getWithdrawalRequests,
  cancelWithdrawal,
  addEarningsToWallet,
  resendOtp
};