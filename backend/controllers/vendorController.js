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

// OVERVIEW
const getOverview = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const orders = await Order.find({
      vendor: vendorId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => {
      return order.status === "delivered" ? sum + (order.pricing?.totalAmount || 0) : sum;
    }, 0);
    const avgPrepTime = orders.reduce((sum, o) => sum + (o.prepTime || 0), 0) / (orders.length || 1);
    const rating = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    res.json({
      success: true,
      data: {
        totalOrders,
        revenue,
        avgPrepTime: Math.round(avgPrepTime),
        rating: rating[0]?.avgRating || 0
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIVE ORDERS
const getLiveOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
    const orConditions = [{ vendor: new mongoose.Types.ObjectId(vendorId) }];
    if (restaurant) orConditions.push({ restaurant: new mongoose.Types.ObjectId(restaurant._id) });
    const orders = await Order.find({
      $or: orConditions,
      status: { $in: ["pending", "confirmed", "preparing", "new", "accepted"] }
    })
      .populate("user", "name phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOP ITEMS
const getTopItems = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const topItems = await Order.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), createdAt: { $gte: weekStart } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.menuItem", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    res.json({ success: true, items: topItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ORDER STATS
const getOrderStats = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const stats = await Order.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), createdAt: { $gte: todayStart } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WEEKLY REVENUE
const getWeeklyRevenue = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const revenue = await Order.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(vendorId),
          status: "delivered",
          createdAt: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$pricing.totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIST ALL ORDERS
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { status, date } = req.query;
    const restaurant = await Restaurant.findOne({ owner: vendorId }).select("_id");
    const orConditions = [{ vendor: new mongoose.Types.ObjectId(vendorId) }];
    if (restaurant) orConditions.push({ restaurant: new mongoose.Types.ObjectId(restaurant._id) });
    const andConditions = [{ $or: orConditions }];
    if (status) andConditions.push({ status });
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      andConditions.push({ createdAt: { $gte: start, $lte: end } });
    }
    const finalQuery = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
    const orders = await Order.find(finalQuery).populate("user", "name phone").sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ORDER DETAIL
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name phone email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// CREATE NOTIFICATION HELPER — defined BEFORE acceptOrder/rejectOrder
// so it's available when those functions call it.
// Tries `vendor` field first, falls back to `user` field if schema
// doesn't have `vendor` (handles both Notification schema variants).
// ============================================================
const createNotification = async ({ vendorId, userId, title, message, type, io }) => {
  try {
    // Build notification doc — support both schema shapes
    const notifData = { title, message, type: type || "order", isRead: false };
    if (vendorId) notifData.vendor = vendorId;
    if (userId)   notifData.user   = userId;

    const notification = await Notification.create(notifData);

    if (io && vendorId) {
      const vendor = await User.findById(vendorId).select("settings");
      const allowNotifications = vendor?.settings?.notifications !== false;
      if (allowNotifications) {
        io.to(vendorId.toString()).emit("newNotification", notification);
        const count = await Notification.countDocuments({ vendor: vendorId, isRead: false });
        io.to(vendorId.toString()).emit("notificationCount", count);
      }
    }

    return notification;
  } catch (error) {
    // Never let notification failure crash the caller
    console.error("createNotification error:", error.message);
  }
};

// ============================================================
// ACCEPT ORDER — FIXED
// Bug 1: restaurant null check missing → crash on restaurant.address
// Bug 2: createNotification called before it was defined (hoisting issue with const)
// Bug 3: notification crash took down whole request — now wrapped
// ============================================================
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status          = "confirmed";
    order.deliveryStatus  = "pending";
    order.vendorAcceptedAt = new Date();

    // Vendor name
    const vendorUser = await User.findById(req.user._id).select("name");
    order.vendorName = vendorUser?.name || "Restaurant";

    // ✅ FIX: guard against null restaurant
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (restaurant) {
      order.pickupAddress = {
        name:     restaurant.name    || order.vendorName,
        address:  restaurant.address || "",
        location: restaurant.location || null,
      };
    }

    await order.save();
    console.log(`✅ Order ${order.orderId || order._id} accepted. deliveryStatus: ${order.deliveryStatus}`);

    // Socket: notify active delivery partners
    const io = req.app.get("io");
    const activeDeliveries = await User.find({
      role:     { $in: ["delivery", "deliveryPartner", "deliveryagent"] },
      isOnline: true,
    }).select("_id name");

    const orderData = {
      _id:           order._id,
      orderId:       order.orderId,
      vendorName:    order.vendorName,
      pickupAddress: order.pickupAddress,
      address:       order.address,
      items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      pricing: {
        itemsTotal:  order.pricing?.itemsTotal,
        deliveryFee: order.pricing?.deliveryFee || 40,
        platformFee: order.pricing?.platformFee,
        tax:         order.pricing?.tax,
        totalAmount: order.pricing?.totalAmount,
      },
      paymentMethod: order.paymentMethod,
      createdAt:     order.createdAt,
    };

    if (io) {
      activeDeliveries.forEach(d => io.to(d._id.toString()).emit("newOrderAvailable", orderData));
      console.log(`📢 Notified ${activeDeliveries.length} delivery partners`);
    }

    // ✅ FIX: wrapped in try/catch — notification failure won't kill the response
    await createNotification({
      vendorId: order.vendor,
      title:   "Order Accepted ✅",
      message: `Order #${order.orderId || order._id} accepted and sent to delivery partners.`,
      type:    "order",
      io,
    });

    res.json({ success: true, message: "Order accepted and sent to delivery partners", order });
  } catch (error) {
    console.error("Error in acceptOrder:", error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// REJECT ORDER — FIXED
// Added customer notification on rejection
// ============================================================
const rejectOrder = async (req, res) => {
  try {
    const reason = req.body?.reason || "Order rejected by vendor";
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status         = "cancelled";
    order.deliveryStatus = "cancelled";
    order.rejectReason   = reason || "Order rejected by vendor";
    await order.save();

    const io = req.app.get("io");

    // Socket: notify customer
    if (io && order.user) {
      io.to(order.user.toString()).emit("orderRejected", {
        orderId:     order._id,
        orderNumber: order.orderId,
        reason:      order.rejectReason,
      });
    }

    // Notification to customer
    await createNotification({
      userId:  order.user,
      title:   "Order Rejected ❌",
      message: `Your order #${order.orderId || order._id} was rejected. Reason: ${order.rejectReason}`,
      type:    "order",
      io,
    });

    res.json({ success: true, message: "Order rejected", order });
  } catch (error) {
    console.error("Error in rejectOrder:", error);
    res.status(500).json({ message: error.message });
  }
};

// MARK ORDER READY FOR PREPARATION
const markOrderReady = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check via vendor OR restaurant owner
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const isOwner = 
      (order.vendor && order.vendor.toString() === req.user._id.toString()) ||
      (restaurant && order.restaurant && order.restaurant.toString() === restaurant._id.toString());

    if (!isOwner) return res.status(403).json({ message: "Not authorized" });

    order.status = "preparing";
    await order.save();
    res.json({ success: true, message: "Order is now being prepared", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PREPARATION TIME
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

// ORDER HISTORY
const getOrderHistory = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const orders = await Order.find({
      vendor: new mongoose.Types.ObjectId(vendorId),
      status: { $in: ["completed", "cancelled", "delivered"] }
    }).populate("user", "name").sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL MENU ITEMS
const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE MENU ITEM
const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================================
// CREATE MENU ITEM — FIXED
// Fix 1: category is now optional (cloud kitchen items have no category)
// Fix 2: category looked up globally, not filtered by vendor
// Fix 3: price=0 allowed for cloud kitchen items
// ============================================================
const createMenuItem = async (req, res) => {
  try {
    const {
      name, description, price, category,
      isveg, preparationTime, isAvailable,
      mealSlot, dayOfWeek,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Menu item name is required" });

    // Cloud kitchen items have price=0 and no category — don't enforce these
    const isCloudItem = !price || Number(price) === 0;
    if (!isCloudItem && (!price || Number(price) <= 0)) {
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }

    // FIX: category is optional; if provided, look it up globally (no vendor filter)
    let resolvedCategory = null;
    if (category && category.trim() !== "") {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Invalid category selected" });
      }
      resolvedCategory = category;
    }

    const menuData = {
      name:            name.trim(),
      description:     description || "",
      price:           isCloudItem ? 0 : Number(price),
      vendor:          req.user._id,
      isAvailable:     isAvailable === "true" || isAvailable === true,
      isveg:           isveg === "true" || isveg === true,
      preparationTime: preparationTime ? Number(preparationTime) : 30,
      stock:           -1,
      rating:          0,
      totalReviews:    0,
    };

    if (resolvedCategory)      menuData.category    = resolvedCategory;
    if (mealSlot)              menuData.mealSlot    = mealSlot;
    if (dayOfWeek)             menuData.dayOfWeek   = dayOfWeek;

    const vendor       = await User.findById(req.user._id).select("restaurantId restaurant");
    const restaurantId = vendor?.restaurantId || vendor?.restaurant;
    if (restaurantId)          menuData.restaurant  = restaurantId;

    if (req.file?.path) menuData.image = req.file.path;
    if (req.fileUrl)    menuData.image = req.fileUrl;

    const menuItem = await MenuItem.create(menuData);

    // Only increment category count if category exists
    if (resolvedCategory) {
      await Category.findByIdAndUpdate(resolvedCategory, { $inc: { itemCount: 1 } });
    }

    res.status(201).json({ success: true, data: menuItem, message: "Menu item created successfully" });
  } catch (error) {
    console.error("Error in createMenuItem:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((e) => e.message).join(", "),
      });
    }
    res.status(500).json({ success: false, message: error.message || "Failed to create menu item" });
  }
};

// ============================================================
// UPDATE MENU ITEM — FIXED
// Fix 1: optional chaining on menuItem.category (may be null) — old code
//        crashed with "Cannot read properties of null (reading 'toString')"
// Fix 2: category validated globally, not filtered by vendor
// Fix 3: handles category being cleared (set to empty string)
// Fix 4: mealSlot / dayOfWeek now persisted on update
// ============================================================
const updateMenuItem = async (req, res) => {
  try {
    const {
      name, description, price, category,
      isveg, preparationTime, isAvailable,
      mealSlot, dayOfWeek,
    } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ success: false, message: "Menu item not found" });
    if (menuItem.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to update this item" });

    // FIX: use optional chaining — menuItem.category may be null
    const currentCategoryId = menuItem.category?.toString() || "";
    const newCategoryId     = (category && category.trim() !== "") ? category.trim() : "";

    if (newCategoryId && newCategoryId !== currentCategoryId) {
      // Validate new category exists globally (no vendor filter)
      const categoryExists = await Category.findById(newCategoryId);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Invalid category selected" });
      }
      // Adjust item counts
      if (currentCategoryId) {
        await Category.findByIdAndUpdate(currentCategoryId, { $inc: { itemCount: -1 } });
      }
      await Category.findByIdAndUpdate(newCategoryId, { $inc: { itemCount: 1 } });
      menuItem.category = newCategoryId;
    } else if (newCategoryId === "" && currentCategoryId) {
      // Category cleared — decrement old count and unset
      await Category.findByIdAndUpdate(currentCategoryId, { $inc: { itemCount: -1 } });
      menuItem.category = null;
    }

    if (name)                         menuItem.name            = name.trim();
    if (description !== undefined)    menuItem.description     = description;
    if (price && Number(price) > 0)   menuItem.price           = Number(price);
    if (isveg !== undefined)          menuItem.isveg           = isveg === "true" || isveg === true;
    if (preparationTime)              menuItem.preparationTime = Number(preparationTime);
    if (isAvailable !== undefined)    menuItem.isAvailable     = isAvailable === "true" || isAvailable === true;
    if (mealSlot)                     menuItem.mealSlot        = mealSlot;
    if (dayOfWeek)                    menuItem.dayOfWeek       = dayOfWeek;
    if (req.file?.path)               menuItem.image           = req.file.path;
    if (req.fileUrl)                  menuItem.image           = req.fileUrl;

    await menuItem.save();
    res.status(200).json({ success: true, data: menuItem, message: "Menu item updated successfully" });
  } catch (error) {
    console.error("Error in updateMenuItem:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update menu item" });
  }
};

// DELETE MENU ITEM
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
    res.status(200).json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE AVAILABILITY
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

// UPDATE PRICE
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

// BULK AVAILABILITY
const bulkMenuAvailability = async (req, res) => {
  try {
    const { menuIds, isAvailable } = req.body;
    if (!menuIds || menuIds.length === 0)
      return res.status(400).json({ message: "Menu IDs are required" });
    await MenuItem.updateMany({ _id: { $in: menuIds }, vendor: req.user._id }, { $set: { isAvailable } });
    res.status(200).json({ success: true, message: "Menu availability updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

    const existing = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" }, vendor: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: "Category with this name already exists" });

    const categoryData = {
      name: name.trim(), description: description || '',
      vendor: req.user._id,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isActive: true, order: 0
    };

    const vendor = await User.findById(req.user._id).select('restaurantId restaurant');
    if (vendor && (vendor.restaurantId || vendor.restaurant))
      categoryData.restaurant = vendor.restaurantId || vendor.restaurant;

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, data: category, message: "Category created successfully" });
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const query = { vendor: req.user._id };
    const vendor = await User.findById(req.user._id).select('restaurantId restaurant');
    if (vendor && (vendor.restaurantId || vendor.restaurant))
      query.restaurant = vendor.restaurantId || vendor.restaurant;
    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE CATEGORY
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
        vendor: req.user._id, _id: { $ne: req.params.id }
      });
      if (existing) return res.status(400).json({ success: false, message: "Category with this name already exists" });
      category.name = name.trim();
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized to delete this category" });

    const menuExists = await MenuItem.findOne({ category: req.params.id, vendor: req.user._id });
    if (menuExists) return res.status(400).json({ success: false, message: "Cannot delete category with menu items. Please reassign or delete the items first." });

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: `Category "${category.name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete category" });
  }
};

// TOGGLE CATEGORY VISIBILITY
const toggleCategoryVisibility = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    if (category.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });
    category.isActive = !category.isActive;
    await category.save();
    res.status(200).json({ success: true, message: `Category ${category.isActive ? 'shown' : 'hidden'} successfully`, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REORDER CATEGORIES
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

// ADD INGREDIENT
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

// GET ALL INGREDIENTS
const getIngredients = async (req, res) => {
  try {
    const ingredients = await Inventory.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: ingredients.length, data: ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE INGREDIENT
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

// DELETE INGREDIENT
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

// LOW STOCK INGREDIENTS
const getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Inventory.find({ vendor: req.user._id, $expr: { $lte: ["$quantity", "$threshold"] } }).sort({ quantity: 1 });
    res.status(200).json({ success: true, count: ingredients.length, data: ingredients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESTOCK INGREDIENT
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

// EARNINGS SUMMARY
const getEarningsSummary = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const completedOrders = await Order.find({ vendor: vendorId, status: "delivered" });
    const totalOrders   = completedOrders.length;
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayOrders   = completedOrders.filter(o => new Date(o.createdAt) >= today);
    const todayEarnings = todayOrders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
    res.status(200).json({ success: true, data: { totalOrders, totalEarnings, todayEarnings } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REVENUE TREND
const getRevenueTrend = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const trend = await Order.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), status: "delivered" } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } }, revenue: { $sum: "$pricing.totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    res.status(200).json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PAYOUT HISTORY
const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await Payout.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payouts.length, data: payouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PAYOUT DETAIL
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

// TRANSACTION BREAKDOWN
const getTransactionBreakdown = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    if (payout.vendor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    const orders       = await Order.find({ _id: { $in: payout.orders } });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
    const platformFee  = totalRevenue * 0.1;
    const tax          = totalRevenue * 0.05;
    const netPayout    = totalRevenue - platformFee - tax;
    res.status(200).json({ success: true, data: { totalRevenue, platformFee, tax, netPayout, orders } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIST ALL REVIEWS
const getVendorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.user._id }).populate("user", "name").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REVIEW RATING SUMMARY
const getReviewSummary = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const summary = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } }
    ]);
    const totalReviews = summary.reduce((sum, item) => sum + item.count, 0);
    const avgRatingData = await Review.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const avgRating = avgRatingData[0]?.avgRating || 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    summary.forEach(item => { distribution[item._id] = item.count; });
    res.status(200).json({ success: true, data: { averageRating: avgRating.toFixed(1), totalReviews, distribution } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST REPLY TO REVIEW
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

// EDIT VENDOR REPLY
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

// GET PROFILE
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
        basicInfo:      { name: vendor.name, email: vendor.email, role: vendor.role },
        restaurantInfo: {
          restaurantName: restaurant?.name || vendor.restaurantName,
          cuisine:        restaurant?.cuisine || vendor.cuisine,
          address:        restaurant?.address || vendor.address,
          logo:           restaurant?.logo || restaurant?.image || vendor.logo,
          image:          restaurant?.image || vendor.logo,
          description:    restaurant?.description || "",
          deliveryTime:   restaurant?.deliveryTime || 30,
          minOrder:       restaurant?.minOrder || 199,
          isOpen:         vendor.isOpen,
          autoOpenStatus, finalStatus, nextOpen,
          type:           restaurant?.type || "Restaurant",
          isApproved:     restaurant?.isApproved || false,
          rating:         restaurant?.rating || 0,
          restaurantId:   restaurant?._id || null,
        },
        deliverySettings: vendor.deliverySettings,
        bankDetails:      vendor.bankDetails,
        operatingHours:   vendor.operatingHours,
        restaurant:       restaurant || null,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedData = { name };
    if (req.fileData) { updatedData.profilePic = req.fileData.imageUrl; updatedData.cloudinary_id = req.fileData.public_id; }
    const user = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });
    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// UPDATE VENDOR LOGO
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

// TOGGLE RESTAURANT OPEN/CLOSE
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

// UPDATE DELIVERY SETTINGS
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

// UPDATE BANK DETAILS
const updateBankDetails = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const { accountNumber, ifsc, bankName, accountHolderName } = req.body;
    if (!vendor.bankDetails) vendor.bankDetails = {};
    if (accountNumber)      vendor.bankDetails.accountNumber      = accountNumber;
    if (ifsc)               vendor.bankDetails.ifsc               = ifsc;
    if (bankName)           vendor.bankDetails.bankName           = bankName;
    if (accountHolderName)  vendor.bankDetails.accountHolderName  = accountHolderName;
    await vendor.save();
    res.status(200).json({ success: true, message: "Bank details updated successfully", data: vendor.bankDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET OPERATING HOURS
const getOperatingHours = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("operatingHours");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json({ success: true, data: vendor.operatingHours || {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESTAURANT OPEN/CLOSE HELPERS
const isRestaurantOpenNow = (vendor) => {
  const now        = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
  const currentTime= now.toTimeString().slice(0, 5);
  const todayHours = vendor.operatingHours?.[currentDay];
  if (!todayHours || !todayHours.isOpen) return false;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

const getNextOpeningTime = (vendor) => {
  const days       = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const now        = new Date();
  const todayIndex = now.getDay();
  for (let i = 0; i < 7; i++) {
    const day   = days[(todayIndex + i) % 7];
    const hours = vendor.operatingHours?.[day];
    if (hours && hours.isOpen && hours.open) {
      if (i === 0) {
        if (now.toTimeString().slice(0, 5) < hours.open) return `Today at ${hours.open}`;
      } else if (i === 1) {
        return `Tomorrow at ${hours.open}`;
      } else {
        return `${day.charAt(0).toUpperCase() + day.slice(1)} at ${hours.open}`;
      }
    }
  }
  return "Closed for now";
};

// RESTAURANT STATUS
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

// UPDATE FULL WEEKLY SCHEDULE
const updateFullWeeklySchedule = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const { operatingHours } = req.body;
    if (!operatingHours) return res.status(400).json({ message: "Operating hours are required" });
    for (const day of ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]) {
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

// UPDATE SPECIFIC DAY
const updateSingleDayHours = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const { day, open, close, isOpen } = req.body;
    if (!day) return res.status(400).json({ message: "Day is required" });
    if (!["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].includes(day.toLowerCase()))
      return res.status(400).json({ message: "Invalid day" });
    if (!vendor.operatingHours) vendor.operatingHours = {};
    vendor.operatingHours[day.toLowerCase()] = { open, close, isOpen };
    await vendor.save();
    res.status(200).json({ success: true, message: `${day} schedule updated`, data: vendor.operatingHours[day.toLowerCase()] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SET HOLIDAY
const setHoliday = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!vendor.holidays) vendor.holidays = [];
    if (vendor.holidays.find(h => new Date(h.date).toDateString() === new Date(date).toDateString()))
      return res.status(400).json({ message: "Holiday already exists" });
    vendor.holidays.push({ date, reason });
    await vendor.save();
    res.status(201).json({ success: true, message: "Holiday added successfully", data: vendor.holidays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PLACE ORDER
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

// GET NOTIFICATIONS
const getVendorNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ vendor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK NOTIFICATION READ
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

// GET SETTINGS
const getSettings = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select("settings");
    res.status(200).json({ success: true, settings: vendor?.settings || { darkMode: false, notifications: true } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE SETTINGS
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

// NOTIFY DELIVERY FOR PICKUP
const notifyDeliveryForPickup = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "preparing")
      return res.status(400).json({ success: false, message: 'Order must be in "preparing" status' });

    order.status  = "ready_for_pickup";
    order.readyAt = new Date();
    await order.save();

    const io = req.app.get("io");
    const activeDeliveries = await User.find({
      role: { $in: ["delivery", "deliveryPartner", "deliveryagent"] },
      isOnline: true
    }).select("_id");

    if (io && activeDeliveries.length > 0) {
      activeDeliveries.forEach(d => 
        io.to(d._id.toString()).emit("newOrderAvailable", {
          _id: order._id, orderId: order.orderId,
          address: order.address, items: order.items,
          pricing: order.pricing, paymentMethod: order.paymentMethod
        })
      );
    }

    res.status(200).json({ 
      success: true, 
      message: "Order ready for pickup", 
      data: { orderId: order._id, status: order.status, readyAt: order.readyAt } 
    });
  } catch (error) {
    console.error("notifyDeliveryForPickup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET DELIVERY STATUS
const getDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: { status: order.status, deliveryStatus: order.deliveryStatus || 'pending', message: order.deliveryPartner ? 'Delivery partner assigned' : 'Waiting for delivery partner' } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// REPORT DELIVERY ISSUE
const reportDeliveryIssue = async (req, res) => {
  try {
    const { issueType } = req.body;
    const validIssues = ['late_pickup', 'wrong_driver', 'driver_unresponsive', 'other'];
    if (!validIssues.includes(issueType)) return res.status(400).json({ success: false, message: 'Invalid issue type' });
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Delivery issue reported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET DELIVERY TRACKING LINK
const getDeliveryTrackingLink = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const trackingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order/${req.params.id}`;
    res.status(200).json({ success: true, data: { trackingLink } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CANCEL DELIVERY ASSIGNMENT
const cancelDeliveryAssignment = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Cancel reason is required' });
    const order = await Order.findOne({ _id: req.params.id, vendor: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryStatus  = "pending";
    order.deliveryPartner = null;
    order.deliveryAgent   = null;
    await order.save();

    const io = req.app.get("io");
    const activeDeliveries = await User.find({ role: { $in: ["delivery", "deliveryPartner", "deliveryagent"] }, isOnline: true }).select("_id");
    if (io && activeDeliveries.length > 0) {
      const orderData = { _id: order._id, orderId: order.orderId, vendorName: order.vendorName, pickupAddress: order.pickupAddress, address: order.address, items: order.items, pricing: order.pricing, paymentMethod: order.paymentMethod, createdAt: order.createdAt, note: "Delivery assignment cancelled - now available" };
      activeDeliveries.forEach(d => io.to(d._id.toString()).emit("newOrderAvailable", orderData));
    }

    res.status(200).json({ success: true, message: 'Delivery assignment cancelled successfully', data: { orderId: order._id, newStatus: order.status, cancelReason: reason } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while cancelling delivery assignment' });
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
  updateDeliverySettings, updateBankDetails,
  getOperatingHours, isRestaurantOpenNow, getNextOpeningTime,
  getRestaurantStatus, updateFullWeeklySchedule, updateSingleDayHours, setHoliday,
  createNotification, placeOrder,
  getVendorNotifications, markNotificationRead,
  getSettings, updateSettings,
  notifyDeliveryForPickup, getDeliveryStatus, reportDeliveryIssue,
  getDeliveryTrackingLink, cancelDeliveryAssignment,
};