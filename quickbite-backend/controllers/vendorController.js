const mongoose = require("mongoose");
const Order = require("../models/Order");
const Review = require("../models/Review");
const MenuItem = require("../models/menuItem");
const cloudinary = require("../config/cloudinary");
const Category = require("../models/Category");
const Inventory = require("../models/Inventory");
const Payout = require("../models/payoutModel");
const User = require("../models/userModel");

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const isRestaurantOpenNow = (vendor) => {
  const now = new Date();
  const currentDay = now
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  const todayHours = vendor.operatingHours?.[currentDay];
  if (!todayHours || !todayHours.isOpen) return false;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

const getNextOpeningTime = (vendor) => {
  const days = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ];
  const now = new Date();
  const todayIndex = now.getDay();
  for (let i = 0; i < 7; i++) {
    const index = (todayIndex + i) % 7;
    const day = days[index];
    const hours = vendor.operatingHours?.[day];
    if (hours && hours.isOpen && hours.open) {
      if (i === 0) {
        const currentTime = now.toTimeString().slice(0, 5);
        if (currentTime < hours.open) return `Today at ${hours.open}`;
      } else if (i === 1) {
        return `Tomorrow at ${hours.open}`;
      } else {
        return `${day.charAt(0).toUpperCase() + day.slice(1)} at ${hours.open}`;
      }
    }
  }
  return "Closed for now";
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

const getOverview = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      vendor: new mongoose.Types.ObjectId(vendorId),
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const totalOrders = orders.length;
    const revenue = orders.reduce(
      (sum, o) => (o.status === "completed" ? sum + o.totalAmount : sum),
      0
    );
    const avgPrepTime =
      orders.reduce((sum, o) => sum + (o.prepTime || 0), 0) /
      (orders.length || 1);

    const rating = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        revenue,
        avgPrepTime: Math.round(avgPrepTime),
        rating: rating[0]?.avgRating || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      vendor: new mongoose.Types.ObjectId(req.user._id),
      status: { $in: ["new", "accepted", "preparing"] },
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopItems = async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const topItems = await Order.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user._id),
          createdAt: { $gte: weekStart },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, items: topItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user._id),
          createdAt: { $gte: todayStart },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWeeklyRevenue = async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const revenue = await Order.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user._id),
          status: "completed",
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

const getVendorOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = { vendor: new mongoose.Types.ObjectId(req.user._id) };

    if (status) query.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query)
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      vendor: new mongoose.Types.ObjectId(req.user._id),
      status: { $in: ["completed", "cancelled"] },
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name phone email"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "accepted";
    await order.save();
    res.json({ success: true, message: "Order accepted", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "cancelled";
    order.rejectReason = req.body.reason;
    await order.save();
    res.json({ success: true, message: "Order rejected", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markOrderReady = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "ready";
    await order.save();
    res.json({ success: true, message: "Order ready for pickup", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePrepTime = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.prepTime = req.body.prepTime;
    await order.save();
    res.json({ success: true, message: "Preparation time updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── MENU ─────────────────────────────────────────────────────────────────────

const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ vendor: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({
      _id: req.params.id,
      vendor: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const menu = await MenuItem.create({
      vendor: req.user._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.file ? req.file.path : null,
    });
    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    if (menu.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    menu.name = req.body.name || menu.name;
    menu.description = req.body.description || menu.description;
    menu.price = req.body.price || menu.price;
    menu.category = req.body.category || menu.category;
    if (req.file) menu.image = req.file.path;

    await menu.save();
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    if (menu.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (menu.image) {
      const publicId = menu.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`uploads/${publicId}`);
    }
    await menu.deleteOne();
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    if (menu.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    menu.isAvailable = !menu.isAvailable;
    await menu.save();
    res.json({ success: true, message: "Menu availability updated", data: menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMenuPrice = async (req, res) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    if (menu.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (!req.body.price)
      return res.status(400).json({ message: "Price is required" });

    menu.price = req.body.price;
    await menu.save();
    res.json({ success: true, message: "Menu price updated", data: menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkMenuAvailability = async (req, res) => {
  try {
    const { menuIds, isAvailable } = req.body || {};
    if (!menuIds || menuIds.length === 0)
      return res.status(400).json({ message: "Menu IDs are required" });

    await MenuItem.updateMany(
      { _id: { $in: menuIds }, vendor: req.user._id },
      { $set: { isAvailable } }
    );
    res.json({ success: true, message: "Menu availability updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ vendor: req.user._id }).sort({
      order: 1,
      createdAt: -1,
    });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const existing = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      vendor: req.user._id,
    });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name, vendor: req.user._id });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const existing = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      vendor: req.user._id,
      _id: { $ne: req.params.id },
    });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    category.name = name || category.name;
    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const menuExists = await MenuItem.findOne({ category: req.params.id });
    if (menuExists)
      return res.status(400).json({ message: "Cannot delete category with menu items" });

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleCategoryVisibility = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    category.isActive = !category.isActive;
    await category.save();
    res.json({ success: true, message: "Category visibility updated", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body || {};
    if (!categories || !Array.isArray(categories))
      return res.status(400).json({ message: "Categories array is required" });

    for (const item of categories) {
      await Category.findOneAndUpdate(
        { _id: item.id, vendor: req.user._id },
        { order: item.order }
      );
    }
    res.json({ success: true, message: "Categories reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── INVENTORY ────────────────────────────────────────────────────────────────

const getIngredients = async (req, res) => {
  try {
    const ingredients = await Inventory.find({ vendor: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: ingredients.length, data: ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Inventory.find({
      vendor: req.user._id,
      $expr: { $lte: ["$quantity", "$threshold"] },
    }).sort({ quantity: 1 });

    res.json({ success: true, count: ingredients.length, data: ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addIngredient = async (req, res) => {
  try {
    const { name, quantity, unit, threshold } = req.body;
    if (!name) return res.status(400).json({ message: "Ingredient name is required" });

    const existing = await Inventory.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      vendor: req.user._id,
    });
    if (existing) return res.status(400).json({ message: "Ingredient already exists" });

    const ingredient = await Inventory.create({
      name, quantity, unit, threshold, vendor: req.user._id,
    });
    res.status(201).json({ success: true, data: ingredient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIngredient = async (req, res) => {
  try {
    const { name, quantity, unit, threshold } = req.body;
    const ingredient = await Inventory.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    if (ingredient.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (name) {
      const existing = await Inventory.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
        vendor: req.user._id,
        _id: { $ne: req.params.id },
      });
      if (existing) return res.status(400).json({ message: "Ingredient already exists" });
    }

    ingredient.name = name || ingredient.name;
    ingredient.quantity = quantity ?? ingredient.quantity;
    ingredient.unit = unit || ingredient.unit;
    ingredient.threshold = threshold ?? ingredient.threshold;
    await ingredient.save();
    res.json({ success: true, data: ingredient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Inventory.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    if (ingredient.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await ingredient.deleteOne();
    res.json({ success: true, message: "Ingredient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restockIngredient = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0)
      return res.status(400).json({ message: "Valid quantity is required" });

    const ingredient = await Inventory.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    if (ingredient.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    ingredient.quantity += quantity;
    await ingredient.save();
    res.json({ success: true, message: "Ingredient restocked successfully", data: ingredient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── EARNINGS ─────────────────────────────────────────────────────────────────

const getEarningsSummary = async (req, res) => {
  try {
    const completedOrders = await Order.find({
      vendor: req.user._id,
      status: "completed",
    });

    const totalOrders = completedOrders.length;
    const totalEarnings = completedOrders.reduce((s, o) => s + o.totalAmount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEarnings = completedOrders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((s, o) => s + o.totalAmount, 0);

    res.json({ success: true, data: { totalOrders, totalEarnings, todayEarnings } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRevenueTrend = async (req, res) => {
  try {
    const trend = await Order.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user._id),
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PAYOUTS ──────────────────────────────────────────────────────────────────

const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await Payout.find({ vendor: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: payouts.length, data: payouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPayoutDetail = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    if (payout.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    res.json({ success: true, data: payout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionBreakdown = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    if (payout.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const orders = await Order.find({ _id: { $in: payout.orders } });
    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const platformFee = totalRevenue * 0.1;
    const tax = totalRevenue * 0.05;
    const netPayout = totalRevenue - platformFee - tax;

    res.json({ success: true, data: { totalRevenue, platformFee, tax, netPayout, orders } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

const getVendorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.user._id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewSummary = async (req, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.user._id);

    const summary = await Review.aggregate([
      { $match: { vendor: vendorId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const avgData = await Review.aggregate([
      { $match: { vendor: vendorId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    const totalReviews = summary.reduce((s, i) => s + i.count, 0);
    const avgRating = avgData[0]?.avgRating || 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    summary.forEach((i) => (distribution[i._id] = i.count));

    res.json({
      success: true,
      data: { averageRating: avgRating.toFixed(1), totalReviews, distribution },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: "Reply message is required" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    review.reply = reply;
    await review.save();
    res.json({ success: true, message: "Reply added successfully", data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editReviewReply = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: "Reply is required" });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    review.reply = reply;
    await review.save();
    res.json({ success: true, message: "Reply updated successfully", data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const autoOpenStatus = isRestaurantOpenNow(vendor);
    const finalStatus = vendor.isOpen && autoOpenStatus;
    const nextOpen = getNextOpeningTime(vendor);

    res.json({
      success: true,
      data: {
        basicInfo: { name: vendor.name, email: vendor.email, role: vendor.role },
        restaurantInfo: {
          restaurantName: vendor.restaurantName,
          cuisine: vendor.cuisine,
          address: vendor.address,
          logo: vendor.logo,
          isOpen: vendor.isOpen,
          autoOpenStatus,
          finalStatus,
          nextOpen,
        },
        deliverySettings: vendor.deliverySettings,
        bankDetails: vendor.bankDetails,
        operatingHours: vendor.operatingHours,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { name, restaurantName, cuisine, address, deliverySettings, bankDetails } = req.body;
    if (name) vendor.name = name;
    if (restaurantName) vendor.restaurantName = restaurantName;
    if (cuisine) vendor.cuisine = cuisine;
    if (address) vendor.address = address;
    if (deliverySettings) vendor.deliverySettings = { ...vendor.deliverySettings, ...deliverySettings };
    if (bankDetails) vendor.bankDetails = { ...vendor.bankDetails, ...bankDetails };

    await vendor.save();
    res.json({ success: true, message: "Profile updated successfully", data: vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVendorLogo = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (!req.file) return res.status(400).json({ message: "Logo image is required" });

    vendor.logo = req.file.path;
    await vendor.save();
    res.json({ success: true, message: "Logo updated successfully", data: { logo: vendor.logo } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.isOpen = !vendor.isOpen;
    await vendor.save();
    res.json({
      success: true,
      message: `Restaurant is now ${vendor.isOpen ? "Open" : "Closed"}`,
      data: { isOpen: vendor.isOpen },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeliverySettings = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { radius, minOrder, avgPrepTime } = req.body;
    if (!vendor.deliverySettings) vendor.deliverySettings = {};
    if (radius !== undefined) vendor.deliverySettings.radius = radius;
    if (minOrder !== undefined) vendor.deliverySettings.minOrder = minOrder;
    if (avgPrepTime !== undefined) vendor.deliverySettings.avgPrepTime = avgPrepTime;

    await vendor.save();
    res.json({ success: true, message: "Delivery settings updated successfully", data: vendor.deliverySettings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBankDetails = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { accountNumber, ifsc, bankName, accountHolderName } = req.body;
    if (!vendor.bankDetails) vendor.bankDetails = {};
    if (accountNumber) vendor.bankDetails.accountNumber = accountNumber;
    if (ifsc) vendor.bankDetails.ifsc = ifsc;
    if (bankName) vendor.bankDetails.bankName = bankName;
    if (accountHolderName) vendor.bankDetails.accountHolderName = accountHolderName;

    await vendor.save();
    res.json({ success: true, message: "Bank details updated successfully", data: vendor.bankDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOperatingHours = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("operatingHours");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json({ success: true, data: vendor.operatingHours || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantStatus = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const autoOpenStatus = isRestaurantOpenNow(vendor);
    const finalStatus = vendor.isOpen && autoOpenStatus;
    const nextOpen = getNextOpeningTime(vendor);

    res.json({ success: true, data: { isOpen: vendor.isOpen, autoOpenStatus, finalStatus, nextOpen } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFullWeeklySchedule = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { operatingHours } = req.body;
    if (!operatingHours)
      return res.status(400).json({ message: "Operating hours are required" });

    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    for (const day of days) {
      const hours = operatingHours[day];
      if (hours) {
        if (hours.isOpen && (!hours.open || !hours.close))
          return res.status(400).json({ message: `${day} must have open and close time` });
        if (hours.open >= hours.close)
          return res.status(400).json({ message: `${day} opening time must be before closing time` });
      }
    }

    vendor.operatingHours = operatingHours;
    await vendor.save();
    res.json({ success: true, message: "Weekly schedule updated successfully", data: vendor.operatingHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSingleDayHours = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { day, open, close, isOpen } = req.body;
    if (!day) return res.status(400).json({ message: "Day is required" });

    const validDays = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    if (!validDays.includes(day.toLowerCase()))
      return res.status(400).json({ message: "Invalid day" });

    if (!vendor.operatingHours) vendor.operatingHours = {};
    vendor.operatingHours[day.toLowerCase()] = { open, close, isOpen };
    await vendor.save();

    res.json({ success: true, message: `${day} schedule updated`, data: vendor.operatingHours[day.toLowerCase()] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setHoliday = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });

    if (!vendor.holidays) vendor.holidays = [];
    const exists = vendor.holidays.find(
      (h) => new Date(h.date).toDateString() === new Date(date).toDateString()
    );
    if (exists) return res.status(400).json({ message: "Holiday already exists" });

    vendor.holidays.push({ date, reason });
    await vendor.save();
    res.status(201).json({ success: true, message: "Holiday added successfully", data: vendor.holidays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

module.exports = {
  getOverview,
  getLiveOrders,
  getTopItems,
  getOrderStats,
  getWeeklyRevenue,
  getVendorOrders,
  getOrderDetail,
  acceptOrder,
  rejectOrder,
  markOrderReady,
  updatePrepTime,
  getOrderHistory,
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateMenuPrice,
  bulkMenuAvailability,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
  reorderCategories,
  addIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients,
  restockIngredient,
  getEarningsSummary,
  getRevenueTrend,
  getPayoutHistory,
  getPayoutDetail,
  getTransactionBreakdown,
  getVendorReviews,
  getReviewSummary,
  replyToReview,
  editReviewReply,
  getProfile,
  updateProfile,
  updateVendorLogo,
  toggleVendorStatus,
  updateDeliverySettings,
  updateBankDetails,
  getOperatingHours,
  isRestaurantOpenNow,
  getNextOpeningTime,
  getRestaurantStatus,
  updateFullWeeklySchedule,
  updateSingleDayHours,
  setHoliday,
};