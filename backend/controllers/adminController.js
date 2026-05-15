const mongoose = require("mongoose");
const Order = require("../models/Order");
const Review = require("../models/Review");
const MenuItem = require("../models/menuItem");
const cloudinary = require("../config/cloudinary");
const Category = require("../models/Category");
const Inventory = require("../models/Inventory");
const Payout = require("../models/payoutModel");
const User = require("../models/userModel");
const Restaurant = require("../models/Restaurant");
const Razorpay = require("razorpay");
const Transaction = require("../models/Transaction");
const Coupon = require("../models/Coupon");
const Setting = require("../models/Setting");
const sendEmail = require("../utils/sendEmail");

// ============ USER CONTROLLERS ============
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      total,
      page,
      users,
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    const updatedUser = await user.save();
    res.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBlocked = true;
    await user.save();
    res.json({ message: "User blocked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBlocked = false;
    await user.save();
    res.json({ message: "User unblocked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    res.json({ totalUsers, blockedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const admin = await User.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;
    await admin.save();
    res.json({
      success: true,
      message: "Profile updated successfully",
      admin: { _id: admin._id, name: admin.name, email: admin.email, phone: admin.phone },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ RESTAURANT CONTROLLERS ============
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('owner', 'name email phone')  // ← ADD THIS LINE
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ message: "Restaurant created", restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });
    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json({ message: "Restaurant updated", restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });
    await restaurant.deleteOne();
    res.json({ message: "Restaurant deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    res.json({ message: "Status updated", isActive: restaurant.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ APPROVAL CONTROLLERS ============
const getPendingRestaurants = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({ isApproved: false })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingRestaurants
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.isApproved = true;
    await restaurant.save();

    const vendor = await User.findById(restaurant.owner);
    if (vendor && vendor.email) {
      try {
        await sendEmail(
          vendor.email,
          'Your Restaurant Has Been Approved! 🎉',
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #f97316;">Congratulations ${vendor.name}!</h2>
            <p>Your restaurant <strong>${restaurant.name}</strong> has been approved by the admin.</p>
            <p>You can now login to your vendor dashboard and start accepting orders.</p>
            <a href="http://localhost:5173/vendor/login" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          </div>`
        );
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }

    res.json({ success: true, message: 'Restaurant approved successfully', data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectRestaurant = async (req, res) => {
  try {
    const { reason } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.isApproved = false;
    restaurant.rejectionReason = reason;
    await restaurant.save();

    const vendor = await User.findById(restaurant.owner);
    if (vendor && vendor.email) {
      try {
        await sendEmail(
          vendor.email,
          'Restaurant Application Update',
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #dc2626;">Application Status Update</h2>
            <p>Dear ${vendor.name},</p>
            <p>Your restaurant <strong>${restaurant.name}</strong> requires some changes:</p>
            <p><strong>Reason:</strong> ${reason || 'Please contact support for more information'}</p>
            <p>Please update your restaurant information and contact support.</p>
          </div>`
        );
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }

    res.json({ success: true, message: 'Restaurant rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ORDER CONTROLLERS ============
const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const items = await MenuItem.find({ restaurant: id, isAvailable: true })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchMenuItems = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }
    const items = await MenuItem.find({
      name: { $regex: q, $options: "i" },
      isAvailable: true,
    })
      .populate("restaurant", "name")
      .populate("category", "name");
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, price, restaurant, category } = req.body;
    if (!name || !price || !restaurant || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const item = await MenuItem.create({
      name,
      price,
      restaurant,
      category,
      description: req.body.description,
      image: req.file ? req.file.path : null,
    });
    res.status(201).json({ message: "Menu item created", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.name = req.body.name || item.name;
    item.price = req.body.price || item.price;
    item.category = req.body.category || item.category;
    item.description = req.body.description || item.description;
    if (req.file) {
      item.image = req.file.path;
    }
    await item.save();
    res.json({ message: "Menu item updated", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await item.deleteOne();
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ message: "Availability updated", isAvailable: item.isAvailable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ORDER CONTROLLERS ============
const getAllOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const orders = await Order.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "accepted",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["pending", "accepted", "preparing", "out_for_delivery"] },
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ DELIVERY AGENT CONTROLLERS ============
const getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "deliveryPartner" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ count: agents.length, agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAgent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const agent = await User.create({
      name,
      email,
      password,
      phone,
      role: "deliveryPartner",
    });
    res.status(201).json({ message: "Agent created", agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== "deliveryPartner") {
      return res.status(404).json({ message: "Agent not found" });
    }
    agent.name = req.body.name || agent.name;
    agent.email = req.body.email || agent.email;
    agent.phone = req.body.phone || agent.phone;
    await agent.save();
    res.json({ message: "Agent updated", agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== "deliveryPartner") {
      return res.status(404).json({ message: "Agent not found" });
    }
    await agent.deleteOne();
    res.json({ message: "Agent deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAgentStatus = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== "deliveryPartner") {
      return res.status(404).json({ message: "Agent not found" });
    }
    agent.isOnline = !agent.isOnline;
    await agent.save();
    res.json({ message: "Status updated", isOnline: agent.isOnline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgentDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ PAYMENT CONTROLLERS ============
const getAllPayments = async (req, res) => {
  try {
    const payments = await Order.find({ paymentStatus: { $exists: true } })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Order.findById(req.params.id).populate("user", "name");
    if (!payment) return res.status(404).json({ message: "Transaction not found" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refundPayment = async (req, res) => {
  try {
    const payment = await Order.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Transaction not found" });
    payment.paymentStatus = "refunded";
    payment.refundReason = req.body.reason || "Customer request";
    payment.refundedAt = new Date();
    await payment.save();
    res.json({ message: "Refund processed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentSummary = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid", status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalTransactions = await Order.countDocuments({ paymentStatus: { $exists: true } });
    const successfulPayments = await Order.countDocuments({ paymentStatus: "paid" });
    const refundedAmount = await Order.aggregate([
      { $match: { paymentStatus: "refunded" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTransactions,
      successfulPayments,
      refundedAmount: refundedAmount[0]?.total || 0,
      averageTransaction: totalTransactions > 0 ? (totalRevenue[0]?.total || 0) / totalTransactions : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COUPON CONTROLLERS ============
const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon" });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon limit reached" });
    }
    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }
    let discount = 0;
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }
    res.json({
      valid: true,
      discount,
      finalAmount: amount - discount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    Object.assign(coupon, req.body);
    await coupon.save();
    res.json({ message: "Coupon updated", coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    await coupon.deleteOne();
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ message: "Coupon status updated", isActive: coupon.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ANALYTICS CONTROLLERS ============
const getOverview = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalRestaurants = await User.countDocuments({ role: "vendor" });
    const revenueData = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    res.json({
      totalOrders,
      totalUsers,
      totalRestaurants,
      totalRevenue: revenueData[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { status: "delivered" };
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const revenue = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderAnalytics = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopRestaurants = async (req, res) => {
  try {
    const top = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: "$vendor",
          totalOrders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "restaurants",
          localField: "_id",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" }
    ]);
    res.json(top);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPeakHours = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: { hour: { $hour: "$createdAt" } },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.hour": 1 } },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ SETTINGS CONTROLLERS ============
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    const allowedFields = [
      "deliveryFee",
      "serviceFee",
      "taxRate",
      "maxDeliveryDistance",
      "currency",
      "maintenanceMode",
      "supportEmail",
      "allowCOD",
      "allowOnlinePayment",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    await settings.save();
    res.json({ message: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ CATEGORY CONTROLLERS ============
const getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: cats });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const createCategory = async (req, res) => {
  try {
    const cat = await Category.create({
      ...req.body,
      vendor: null,
      slug: req.body.name?.toLowerCase().replace(/\s+/g, "-")
    });
    res.json({ success: true, data: cat });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
};

const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: cat });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

const toggleCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: "Not found" });
    cat.isActive = !cat.isActive;
    await cat.save();
    res.json({ success: true, data: cat });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = {
  // User
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getUserStats,
  getMyProfile,
  updateMyProfile,
  // Restaurant
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  getRestaurantOrders,
  getRestaurantMenu,
  // Menu
  searchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  // Order
  getAllOrders,
  updateOrderStatus,
  getLiveOrders,
  // Delivery Agents
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  getAgentDeliveries,
  // Payment
  getAllPayments,
  getPaymentById,
  refundPayment,
  getPaymentSummary,
  // Coupon
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  // Analytics
  getOverview,
  getRevenueAnalytics,
  getOrderAnalytics,
  getTopRestaurants,
  getPeakHours,
  // Settings
  getSettings,
  updateSettings,

  // Categories
getCategories,
createCategory,
updateCategory,
deleteCategory,
toggleCategory,
};