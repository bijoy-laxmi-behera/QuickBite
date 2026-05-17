const mongoose = require("mongoose");
const Order = require("../models/Order");
const Review = require("../models/Review");
const MenuItem = require("../models/menuItem");
const Category = require("../models/Category");
const Inventory = require("../models/Inventory");
const Payout = require("../models/payoutModel");
const User = require("../models/userModel");
const Restaurant = require("../models/Restaurant");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

// ─── HELPER: safely get total amount from either schema shape ────────────────
const getTotal = (order) =>
  order.pricing?.totalAmount ?? order.totalAmount ?? 0;

// ─── HELPER: restaurant open check ──────────────────────────────────────────
const isRestaurantOpenNow = (vendor) => {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  const todayHours = vendor.operatingHours?.[currentDay];
  if (!todayHours || !todayHours.isOpen) return false;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// ─── HELPER: next opening time ───────────────────────────────────────────────
const getNextOpeningTime = (vendor) => {
  const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
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

// ─── HELPER: build vendor order query ────────────────────────────────────────
// ✅ FIX: Orders placed before the fix may have vendor=null but restaurant set.
// This helper always queries by BOTH vendor (User _id) AND restaurant (_id),
// so old + new orders all appear. Used in every order-fetching function below.
const buildVendorOrderQuery = async (vendorId, extraFilters = {}) => {
  const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
  const orConditions = [
    { vendor: new mongoose.Types.ObjectId(vendorId) },
  ];
  if (restaurant) {
    orConditions.push({ restaurant: new mongoose.Types.ObjectId(restaurant._id) });
  }
  return { $or: orConditions, ...extraFilters };
};

// ============ OVERVIEW ============
const getOverview = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

    // ✅ FIX: use dual query
    const baseQuery = await buildVendorOrderQuery(vendorId);
    const orders = await Order.find({
      ...baseQuery,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) =>
      order.status === "delivered" ? sum + getTotal(order) : sum, 0);
    const avgPrepTime =
      orders.reduce((sum, o) => sum + (o.prepTime || 0), 0) / (orders.length || 1);

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

// ============ LIVE ORDERS ============
const getLiveOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    // ✅ FIX: dual query
    const query = await buildVendorOrderQuery(vendorId, {
      status: { $in: ["pending", "confirmed", "preparing"] },
    });
    const orders = await Order.find(query)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ TOP ITEMS ============
const getTopItems = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // ✅ FIX: fetch restaurant for $or match in aggregation
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
    const matchStage = {
      $or: [
        { vendor: new mongoose.Types.ObjectId(vendorId) },
        ...(restaurant ? [{ restaurant: new mongoose.Types.ObjectId(restaurant._id) }] : []),
      ],
      createdAt: { $gte: weekStart },
    };

    const topItems = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      { $group: { _id: "$items.menuItem", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, items: topItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ORDER STATS ============
const getOrderStats = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    // ✅ FIX: dual query in aggregation
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
    const matchStage = {
      $or: [
        { vendor: new mongoose.Types.ObjectId(vendorId) },
        ...(restaurant ? [{ restaurant: new mongoose.Types.ObjectId(restaurant._id) }] : []),
      ],
      createdAt: { $gte: todayStart },
    };

    const stats = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ WEEKLY REVENUE ============
const getWeeklyRevenue = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // ✅ FIX: dual query in aggregation
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
    const matchStage = {
      $or: [
        { vendor: new mongoose.Types.ObjectId(vendorId) },
        ...(restaurant ? [{ restaurant: new mongoose.Types.ObjectId(restaurant._id) }] : []),
      ],
      status: "delivered",
      createdAt: { $gte: weekStart },
    };

    const revenue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$pricing.totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ LIST ALL ORDERS ============
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { status, date } = req.query;

    // Find restaurant owned by this vendor
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");

    // Build $or conditions
    const orConditions = [
      { vendor: new mongoose.Types.ObjectId(vendorId) },
    ];
    if (restaurant) {
      orConditions.push({ restaurant: new mongoose.Types.ObjectId(restaurant._id) });
    }

    // Use $and so $or is never clobbered by spread
    const andConditions = [{ $or: orConditions }];
    if (status) andConditions.push({ status });
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      andConditions.push({ createdAt: { $gte: start, $lte: end } });
    }

    const query = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };

    const orders = await Order.find(query)
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ GET ORDER DETAIL ============
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phone email")
      .populate("items.menuItem", "name price image");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ACCEPT ORDER ============
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "confirmed";
    await order.save();

    await Notification.create({
      user:    order.user,
      title:   "Order Confirmed ✅",
      message: `Your order #${order.orderId} has been confirmed by the restaurant.`,
      type:    "order",
      isRead:  false,
    });

    res.json({ success: true, message: "Order accepted", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ REJECT ORDER ============
const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "cancelled";
    order.rejectReason = reason;
    await order.save();

    await Notification.create({
      user:    order.user,
      title:   "Order Cancelled ❌",
      message: `Your order #${order.orderId} was cancelled. Reason: ${reason || "N/A"}`,
      type:    "order",
      isRead:  false,
    });

    res.json({ success: true, message: "Order rejected", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ MARK ORDER READY ============
const markOrderReady = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ FIX: check authorization via vendor OR restaurant owner
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    const isVendorMatch     = order.vendor?.toString()     === req.user._id.toString();
    const isRestaurantMatch = order.restaurant?.toString() === restaurant?._id?.toString();
    if (!isVendorMatch && !isRestaurantMatch)
      return res.status(403).json({ message: "Not authorized" });

    order.status = "out_for_delivery";
    order.deliveryStatus = "on-the-way";
    await order.save();
    res.json({ success: true, message: "Order ready for delivery", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ UPDATE PREP TIME ============
const updatePrepTime = async (req, res) => {
  try {
    const { prepTime } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.prepTime = prepTime;
    await order.save();
    res.json({ success: true, message: "Preparation time updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ORDER HISTORY ============
const getOrderHistory = async (req, res) => {
  try {
    const vendorId = req.user._id;
    // ✅ FIX: dual query
    const query = await buildVendorOrderQuery(vendorId, {
      status: { $in: ["delivered", "cancelled"] },
    });
    const orders = await Order.find(query)
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ MENU ============
const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isveg, preparationTime, isAvailable, mealSlot, dayOfWeek } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Menu item name is required" });
    if (price === undefined || price === null || price === "")
      return res.status(400).json({ success: false, message: "Price is required" });

    if (category) {
      const categoryExists = await Category.findOne({ _id: category, vendor: req.user._id });
      if (!categoryExists)
        return res.status(400).json({ success: false, message: "Invalid category selected" });
    }

    const menuData = {
      name:            name.trim(),
      description:     description || "",
      price:           Number(price) || 0,
      mealSlot:        mealSlot  || "lunch",
      dayOfWeek:       dayOfWeek || "daily",
      vendor:          req.user._id,
      isAvailable:     isAvailable === "true" || isAvailable === true,
      isveg:           isveg === "true" || isveg === true,
      preparationTime: preparationTime ? Number(preparationTime) : 30,
      stock:           -1,
      rating:          0,
      totalReviews:    0,
    };

    // ✅ Always attach restaurant via owner lookup — critical for order routing
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    if (restaurant) menuData.restaurant = restaurant._id;

    if (category && category.trim() !== "") menuData.category = category;
    if (req.file) menuData.image = req.file.path || req.fileUrl || menuData.image;

    const menuItem = await MenuItem.create(menuData);
    if (category) await Category.findByIdAndUpdate(category, { $inc: { itemCount: 1 } });

    res.status(201).json({ success: true, data: menuItem, message: "Menu item created successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join(", ") });
    }
    res.status(500).json({ success: false, message: error.message || "Failed to create menu item" });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isveg, preparationTime, isAvailable } = req.body;
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ success: false, message: "Menu item not found" });
    if (menuItem.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });

    // ✅ Ensure restaurant is set if missing (backfill for old items)
    if (!menuItem.restaurant) {
      const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
      if (restaurant) menuItem.restaurant = restaurant._id;
    }

    if (category && menuItem.category && category !== menuItem.category.toString()) {
      await Category.findByIdAndUpdate(menuItem.category, { $inc: { itemCount: -1 } });
      await Category.findByIdAndUpdate(category, { $inc: { itemCount: 1 } });
      menuItem.category = category;
    }

    if (name)                      menuItem.name            = name.trim();
    if (description !== undefined) menuItem.description     = description;
    if (price !== undefined)       menuItem.price           = Number(price) || 0;
    if (isveg !== undefined)       menuItem.isveg           = isveg === "true" || isveg === true;
    if (preparationTime)           menuItem.preparationTime = Number(preparationTime);
    if (isAvailable !== undefined) menuItem.isAvailable     = isAvailable === "true" || isAvailable === true;
    if (req.body.mealSlot)         menuItem.mealSlot        = req.body.mealSlot;
    if (req.body.dayOfWeek)        menuItem.dayOfWeek       = req.body.dayOfWeek;
    if (req.file)                  menuItem.image           = req.file.path || req.fileUrl || menuItem.image;

    await menuItem.save();
    res.status(200).json({ success: true, data: menuItem, message: "Menu item updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update menu item" });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu item not found" });
    if (menu.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (menu.image) {
      try {
        const publicId = menu.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`uploads/${publicId}`);
      } catch {}
    }
    await menu.deleteOne();
    res.status(200).json({ success: true, message: "Menu item deleted successfully" });
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
    res.status(200).json({ success: true, message: "Menu availability updated", data: menu });
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
    if (!req.body.price) return res.status(400).json({ message: "Price is required" });
    menu.price = req.body.price;
    await menu.save();
    res.status(200).json({ success: true, message: "Menu price updated", data: menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkMenuAvailability = async (req, res) => {
  try {
    const { menuIds, isAvailable } = req.body;
    if (!menuIds || menuIds.length === 0)
      return res.status(400).json({ message: "Menu IDs are required" });
    await MenuItem.updateMany(
      { _id: { $in: menuIds }, vendor: req.user._id },
      { $set: { isAvailable } }
    );
    res.status(200).json({ success: true, message: "Menu availability updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ CATEGORIES ============
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

    const existing = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      vendor: req.user._id,
    });
    if (existing) return res.status(400).json({ success: false, message: "Category with this name already exists" });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const categoryData = {
      name: name.trim(), description: description || "",
      vendor: req.user._id, slug, isActive: true, order: 0,
    };

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    if (restaurant) categoryData.restaurant = restaurant._id;

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, data: category, message: "Category created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ vendor: req.user._id }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive, order } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (name && name !== category.name) {
      const existing = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        vendor: req.user._id, _id: { $ne: req.params.id },
      });
      if (existing) return res.status(400).json({ success: false, message: "Category with this name already exists" });
      category.name = name.trim();
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    if (description !== undefined) category.description = description;
    if (isActive !== undefined)    category.isActive    = isActive;
    if (order !== undefined)       category.order       = order;
    await category.save();
    res.status(200).json({ success: true, data: category, message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to delete this category" });

    const menuExists = await MenuItem.findOne({ category: req.params.id, vendor: req.user._id });
    if (menuExists)
      return res.status(400).json({ success: false, message: "Cannot delete category with menu items. Please reassign or delete the items first." });

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: `Category "${category.name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete category" });
  }
};

const toggleCategoryVisibility = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });
    category.isActive = !category.isActive;
    await category.save();
    res.status(200).json({ success: true, message: `Category ${category.isActive ? "shown" : "hidden"} successfully`, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories))
      return res.status(400).json({ success: false, message: "Categories array is required" });
    for (let i = 0; i < categories.length; i++) {
      const categoryId = categories[i].id || categories[i];
      await Category.findOneAndUpdate({ _id: categoryId, vendor: req.user._id }, { order: i });
    }
    res.status(200).json({ success: true, message: "Categories reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ INVENTORY ============
const addIngredient = async (req, res) => {
  try {
    const { name, quantity, unit, threshold } = req.body;
    if (!name) return res.status(400).json({ message: "Ingredient name is required" });
    const existing = await Inventory.findOne({ name: { $regex: `^${name}$`, $options: "i" }, vendor: req.user._id });
    if (existing) return res.status(400).json({ message: "Ingredient already exists" });
    const ingredient = await Inventory.create({ name, quantity, unit, threshold, vendor: req.user._id });
    res.status(201).json({ success: true, data: ingredient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIngredients = async (req, res) => {
  try {
    const ingredients = await Inventory.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: ingredients.length, data: ingredients });
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
      const existing = await Inventory.findOne({ name: { $regex: `^${name}$`, $options: "i" }, vendor: req.user._id, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ message: "Ingredient already exists" });
    }
    ingredient.name      = name      || ingredient.name;
    ingredient.quantity  = quantity  ?? ingredient.quantity;
    ingredient.unit      = unit      || ingredient.unit;
    ingredient.threshold = threshold ?? ingredient.threshold;
    await ingredient.save();
    res.status(200).json({ success: true, data: ingredient });
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
    res.status(200).json({ success: true, message: "Ingredient deleted successfully" });
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
    res.status(200).json({ success: true, count: ingredients.length, data: ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restockIngredient = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) return res.status(400).json({ message: "Valid quantity is required" });
    const ingredient = await Inventory.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    if (ingredient.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    ingredient.quantity += quantity;
    await ingredient.save();
    res.status(200).json({ success: true, message: "Ingredient restocked successfully", data: ingredient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ EARNINGS ============
const getEarningsSummary = async (req, res) => {
  try {
    const vendorId = req.user._id;
    // ✅ FIX: dual query
    const query = await buildVendorOrderQuery(vendorId, { status: "delivered" });
    const completedOrders = await Order.find(query);

    const totalOrders   = completedOrders.length;
    const totalEarnings = completedOrders.reduce((sum, o) => sum + getTotal(o), 0);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEarnings = completedOrders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + getTotal(o), 0);

    res.status(200).json({ success: true, data: { totalOrders, totalEarnings, todayEarnings } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRevenueTrend = async (req, res) => {
  try {
    const vendorId = req.user._id;
    // ✅ FIX: dual query in aggregation
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
    const matchStage = {
      $or: [
        { vendor: new mongoose.Types.ObjectId(vendorId) },
        ...(restaurant ? [{ restaurant: new mongoose.Types.ObjectId(restaurant._id) }] : []),
      ],
      status: "delivered",
    };

    const trend = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$pricing.totalAmount" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    res.status(200).json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ PAYOUTS ============
const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await Payout.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payouts.length, data: payouts });
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
    res.status(200).json({ success: true, data: payout });
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
    const totalRevenue = orders.reduce((sum, o) => sum + getTotal(o), 0);
    const platformFee  = totalRevenue * 0.1;
    const tax          = totalRevenue * 0.05;
    const netPayout    = totalRevenue - platformFee - tax;
    res.status(200).json({ success: true, data: { totalRevenue, platformFee, tax, netPayout, orders } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ REVIEWS ============
const getVendorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.user._id })
      .populate("user", "name").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewSummary = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const summary = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);
    const totalReviews = summary.reduce((sum, item) => sum + item.count, 0);
    const avgRatingData = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const avgRating = avgRatingData[0]?.avgRating || 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    summary.forEach(item => { distribution[item._id] = item.count; });
    res.status(200).json({ success: true, data: { averageRating: avgRating.toFixed(1), totalReviews, distribution } });
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
    res.status(200).json({ success: true, message: "Reply added successfully", data: review });
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
    res.status(200).json({ success: true, message: "Reply updated successfully", data: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ PROFILE ============
const getProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select(
      "name type cuisine address location image logo description deliveryTime minOrder isOpen isApproved rating"
    );

    const autoOpenStatus = isRestaurantOpenNow(vendor);
    const finalStatus    = vendor.isOpen && autoOpenStatus;
    const nextOpen       = getNextOpeningTime(vendor);

    res.status(200).json({
      success: true,
      data: {
        basicInfo: { name: vendor.name, email: vendor.email, role: vendor.role },
        restaurantInfo: {
          restaurantName: restaurant?.name        || vendor.restaurantName,
          cuisine:        restaurant?.cuisine     || vendor.cuisine,
          address:        restaurant?.address     || vendor.address,
          logo:           restaurant?.logo        || restaurant?.image || vendor.logo,
          image:          restaurant?.image       || vendor.logo,
          description:    restaurant?.description || "",
          deliveryTime:   restaurant?.deliveryTime || 30,
          minOrder:       restaurant?.minOrder     || 199,
          isOpen:         vendor.isOpen,
          autoOpenStatus, finalStatus, nextOpen,
          type:           restaurant?.type || "Restaurant",
          isApproved:     restaurant?.isApproved || false,
          rating:         restaurant?.rating      || 0,
          restaurantId:   restaurant?._id         || null,
        },
        deliverySettings: vendor.deliverySettings,
        bankDetails:      vendor.bankDetails,
        operatingHours:   vendor.operatingHours,
        restaurant:       restaurant || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedData = { name };
    if (req.fileData) {
      updatedData.profilePic    = req.fileData.imageUrl;
      updatedData.cloudinary_id = req.fileData.public_id;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

const updateVendorLogo = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (!req.file) return res.status(400).json({ message: "Logo image is required" });
    vendor.logo = req.file.path;
    await vendor.save();
    res.status(200).json({ success: true, message: "Logo updated successfully", data: { logo: vendor.logo } });
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
    res.status(200).json({ success: true, message: `Restaurant is now ${vendor.isOpen ? "Open" : "Closed"}`, data: { isOpen: vendor.isOpen } });
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
    if (radius !== undefined)      vendor.deliverySettings.radius      = radius;
    if (minOrder !== undefined)    vendor.deliverySettings.minOrder    = minOrder;
    if (avgPrepTime !== undefined) vendor.deliverySettings.avgPrepTime = avgPrepTime;
    await vendor.save();
    res.status(200).json({ success: true, message: "Delivery settings updated successfully", data: vendor.deliverySettings });
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
    if (accountNumber)     vendor.bankDetails.accountNumber     = accountNumber;
    if (ifsc)              vendor.bankDetails.ifsc              = ifsc;
    if (bankName)          vendor.bankDetails.bankName          = bankName;
    if (accountHolderName) vendor.bankDetails.accountHolderName = accountHolderName;
    await vendor.save();
    res.status(200).json({ success: true, message: "Bank details updated successfully", data: vendor.bankDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOperatingHours = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("operatingHours");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json({ success: true, data: vendor.operatingHours || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestaurantStatus = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const autoOpenStatus = isRestaurantOpenNow(vendor);
    const finalStatus    = vendor.isOpen && autoOpenStatus;
    const nextOpen       = getNextOpeningTime(vendor);
    res.status(200).json({ success: true, data: { isOpen: vendor.isOpen, autoOpenStatus, finalStatus, nextOpen } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFullWeeklySchedule = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const { operatingHours } = req.body;
    if (!operatingHours) return res.status(400).json({ message: "Operating hours are required" });
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
    res.status(200).json({ success: true, message: "Weekly schedule updated successfully", data: vendor.operatingHours });
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
    res.status(200).json({ success: true, message: `${day} schedule updated`, data: vendor.operatingHours[day.toLowerCase()] });
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
    const exists = vendor.holidays.find(h => new Date(h.date).toDateString() === new Date(date).toDateString());
    if (exists) return res.status(400).json({ message: "Holiday already exists" });
    vendor.holidays.push({ date, reason });
    await vendor.save();
    res.status(201).json({ success: true, message: "Holiday added successfully", data: vendor.holidays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ NOTIFICATIONS ============
const createNotification = async ({ vendorId, title, message, type, io }) => {
  try {
    const notification = await Notification.create({ vendor: vendorId, title, message, type });
    const vendor = await User.findById(vendorId).select("settings");
    if (vendor?.settings?.notifications !== false && io) {
      io.to(vendorId.toString()).emit("newNotification", notification);
      const count = await Notification.countDocuments({ vendor: vendorId, isRead: false });
      io.to(vendorId.toString()).emit("notificationCount", count);
    }
    return notification;
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

const placeOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    const io    = req.app.get("io");
    await createNotification({ vendorId: order.vendor, title: "New Order 🍔", message: `Order #${order._id} received`, type: "order", io });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVendorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ vendor: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    if (notification.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ SETTINGS ============
const getSettings = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("settings");
    res.status(200).json({ success: true, settings: vendor?.settings || { darkMode: false, notifications: true } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { darkMode, notifications } = req.body;
    const vendor = await User.findById(req.user._id);
    if (!vendor.settings) vendor.settings = {};
    if (darkMode !== undefined)      vendor.settings.darkMode      = darkMode;
    if (notifications !== undefined) vendor.settings.notifications = notifications;
    await vendor.save();
    const io = req.app.get("io");
    if (io) io.to(req.user._id.toString()).emit("settingsUpdated", vendor.settings);
    res.status(200).json({ success: true, settings: vendor.settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ DELIVERY ============
const notifyDeliveryForPickup = async (req, res) => {
  try {
    // ✅ FIX: find by id only, then check authorization via dual match
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    const isVendorMatch     = order.vendor?.toString()     === req.user._id.toString();
    const isRestaurantMatch = order.restaurant?.toString() === restaurant?._id?.toString();
    if (!isVendorMatch && !isRestaurantMatch)
      return res.status(403).json({ success: false, message: "Not authorized" });

    order.status  = "out_for_delivery";
    order.readyAt = new Date();
    await order.save();
    res.status(200).json({ success: true, message: "Order marked ready for pickup", data: { orderId: order._id, status: order.status, readyAt: order.readyAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    const isVendorMatch     = order.vendor?.toString()     === req.user._id.toString();
    const isRestaurantMatch = order.restaurant?.toString() === restaurant?._id?.toString();
    if (!isVendorMatch && !isRestaurantMatch)
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.status(200).json({ success: true, data: { orderStatus: order.status, deliveryStatus: order.deliveryStatus || "not_assigned" } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reportDeliveryIssue = async (req, res) => {
  try {
    const { issueType, description } = req.body;
    const validIssues = ["late_pickup", "wrong_driver", "driver_unresponsive", "other"];
    if (!validIssues.includes(issueType))
      return res.status(400).json({ success: false, message: "Invalid issue type" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    const isVendorMatch     = order.vendor?.toString()     === req.user._id.toString();
    const isRestaurantMatch = order.restaurant?.toString() === restaurant?._id?.toString();
    if (!isVendorMatch && !isRestaurantMatch)
      return res.status(403).json({ success: false, message: "Not authorized" });

    res.status(200).json({ success: true, message: "Delivery issue reported successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDeliveryTrackingLink = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    const isVendorMatch     = order.vendor?.toString()     === req.user._id.toString();
    const isRestaurantMatch = order.restaurant?.toString() === restaurant?._id?.toString();
    if (!isVendorMatch && !isRestaurantMatch)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const trackingLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/order-tracking/${order._id}`;
    res.status(200).json({ success: true, data: { trackingLink } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelDeliveryAssignment = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: "Cancel reason is required" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("_id");
    const isVendorMatch     = order.vendor?.toString()     === req.user._id.toString();
    const isRestaurantMatch = order.restaurant?.toString() === restaurant?._id?.toString();
    if (!isVendorMatch && !isRestaurantMatch)
      return res.status(403).json({ success: false, message: "Not authorized" });

    order.status         = "pending";
    order.deliveryStatus = "pending";
    await order.save();
    res.status(200).json({ success: true, message: "Delivery assignment cancelled successfully", data: { orderId: order._id, newStatus: order.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOverview, getLiveOrders, getTopItems, getOrderStats, getWeeklyRevenue,
  getVendorOrders, getOrderDetail, acceptOrder, rejectOrder, markOrderReady,
  updatePrepTime, getOrderHistory,
  getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
  toggleAvailability, updateMenuPrice, bulkMenuAvailability,
  getCategories, createCategory, updateCategory, deleteCategory,
  toggleCategoryVisibility, reorderCategories,
  addIngredient, getIngredients, updateIngredient, deleteIngredient,
  getLowStockIngredients, restockIngredient,
  getEarningsSummary, getRevenueTrend,
  getPayoutHistory, getPayoutDetail, getTransactionBreakdown,
  getVendorReviews, getReviewSummary, replyToReview, editReviewReply,
  getProfile, updateProfile, updateVendorLogo, toggleVendorStatus,
  updateDeliverySettings, updateBankDetails, getOperatingHours,
  isRestaurantOpenNow, getNextOpeningTime, getRestaurantStatus,
  updateFullWeeklySchedule, updateSingleDayHours, setHoliday,
  createNotification, placeOrder, getVendorNotifications, markNotificationRead,
  getSettings, updateSettings,
  notifyDeliveryForPickup, getDeliveryStatus, reportDeliveryIssue,
  getDeliveryTrackingLink, cancelDeliveryAssignment,
};