// backend/controllers/vendorFeaturesController.js
const mongoose    = require("mongoose");
const Order       = require("../models/Order");
const MenuItem    = require("../models/menuItem");
const Restaurant  = require("../models/Restaurant");
const Coupon      = require("../models/Coupon");
const Subscription = require("../models/Subscription");
const Notification = require("../models/Notification");


// ============================================================
// COUPON CONTROLLERS
// ============================================================

const getCoupons = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const coupons = await Coupon.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code, discountType, discountValue, minOrderAmount,
      maxDiscount, validFrom, validTo, usageLimit, description,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: "Code, type, and value are required" });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase(), vendor: req.user._id });
    if (exists) return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = await Coupon.create({
      code:           code.toUpperCase().trim(),
      discountType:   discountType,   // "percentage" | "flat"
      discountValue:  Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscount:    discountType === "percentage" ? (Number(maxDiscount) || 0) : null,
      validFrom:      validFrom || new Date(),
      validTo:        validTo   || null,
      usageLimit:     Number(usageLimit) || null,
      usedCount:      0,
      isActive:       true,
      vendor:         req.user._id,
      description:    description || "",
    });

    res.status(201).json({ success: true, data: coupon, message: "Coupon created" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    Object.assign(coupon, req.body);
    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, data: coupon, message: `Coupon ${coupon.isActive ? "activated" : "deactivated"}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ============================================================
// ANALYTICS CONTROLLERS
// ============================================================

const getAnalytics = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { period = "7" } = req.query; // days
    const from = new Date();
    from.setDate(from.getDate() - parseInt(period));

    const orders = await Order.find({
      vendor:    vendorId,
      createdAt: { $gte: from },
    }).populate("items.menuItem", "name price");

    // Daily revenue
    const dailyRevenue = {};
    orders.forEach(o => {
      const d = o.createdAt.toISOString().split("T")[0];
      if (!dailyRevenue[d]) dailyRevenue[d] = { date: d, revenue: 0, orders: 0 };
      dailyRevenue[d].revenue += o.pricing?.totalAmount || o.totalAmount || 0;
      dailyRevenue[d].orders  += 1;
    });

    // Status breakdown
    const statusCount = {};
    orders.forEach(o => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });

    // Total stats
    const totalRevenue  = orders.reduce((s, o) => s + (o.pricing?.totalAmount || o.totalAmount || 0), 0);
    const totalOrders   = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const delivered     = orders.filter(o => o.status === "delivered" || o.status === "completed").length;
    const cancelled     = orders.filter(o => o.status === "cancelled").length;
    const completionRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;

    res.json({
      success: true,
      data: {
        period:         parseInt(period),
        totalRevenue,
        totalOrders,
        avgOrderValue,
        completionRate,
        delivered,
        cancelled,
        dailyRevenue:   Object.values(dailyRevenue).sort((a,b) => a.date.localeCompare(b.date)),
        statusBreakdown: statusCount,
      },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getPeakHours = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const from = new Date();
    from.setDate(from.getDate() - 30);

    const hourly = await Order.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), createdAt: { $gte: from } } },
      { $group: {
          _id:    { $hour: "$createdAt" },
          orders: { $sum: 1 },
          revenue:{ $sum: "$pricing.totalAmount" },
        }
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill all 24 hours
    const full = Array.from({ length: 24 }, (_, h) => {
      const found = hourly.find(x => x._id === h);
      return { hour: h, label: `${h}:00`, orders: found?.orders || 0, revenue: found?.revenue || 0 };
    });

    res.json({ success: true, data: full });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getBestItems = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const from = new Date();
    from.setDate(from.getDate() - 30);

    const best = await Order.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId), createdAt: { $gte: from } } },
      { $unwind: "$items" },
      { $group: {
          _id:      "$items.menuItem",
          name:     { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue:  { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, data: best });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ============================================================
// FEATURED ITEMS
// ============================================================

const getFeaturedItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ vendor: req.user._id, isFeatured: true });
    res.json({ success: true, data: items });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const toggleFeatured = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.isFeatured = !item.isFeatured;
    await item.save();
    res.json({ success: true, data: item, message: `Item ${item.isFeatured ? "featured" : "unfeatured"}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ============================================================
// SPECIAL OFFERS
// ============================================================

const getOffers = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.json({ success: true, data: [] });
    const offers = restaurant.specialOffers || [];
    res.json({ success: true, data: offers });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createOffer = async (req, res) => {
  try {
    const { title, description, discountPercent, validFrom, validTo, offerType } = req.body;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    if (!restaurant.specialOffers) restaurant.specialOffers = [];
    restaurant.specialOffers.push({
      title, description, discountPercent: Number(discountPercent) || 0,
      validFrom: validFrom || new Date(),
      validTo:   validTo   || null,
      offerType: offerType || "general",
      isActive:  true,
      createdAt: new Date(),
    });
    await restaurant.save();
    res.status(201).json({ success: true, data: restaurant.specialOffers, message: "Offer created" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateOffer = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    const offer = restaurant.specialOffers?.id(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    Object.assign(offer, req.body);
    await restaurant.save();
    res.json({ success: true, data: offer });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteOffer = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    restaurant.specialOffers = restaurant.specialOffers?.filter(o => o._id.toString() !== req.params.id) || [];
    await restaurant.save();
    res.json({ success: true, message: "Offer deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ============================================================
// MENU PLANNER (Cloud Kitchen weekly plan)
// ============================================================

const getMenuPlan = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).select("menuPlan");
    res.json({ success: true, data: restaurant?.menuPlan || {} });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const saveMenuPlan = async (req, res) => {
  try {
    const { plan } = req.body; // { Monday: { lunch: [...itemIds], dinner: [...itemIds] }, ... }
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    restaurant.menuPlan = plan;
    await restaurant.save();
    res.json({ success: true, data: restaurant.menuPlan, message: "Menu plan saved" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ============================================================
// SUBSCRIBER DELIVERY TRACKING (Cloud Kitchen)
// ============================================================

const getTodayDeliveries = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.json({ success: true, data: [] });

    const subs = await Subscription.find({
      kitchenId: restaurant._id,
      status:    "active",
      endDate:   { $gt: new Date() },
    }).populate("user", "name phone email");

    // Attach delivery status for today (could be stored in a DailyDelivery model)
    // For now we return the subs with a delivered flag
    const data = subs.map(s => ({
      _id:        s._id,
      user:       s.user,
      mealType:   s.mealType,
      lunchSlot:  s.lunchSlot,
      dinnerSlot: s.dinnerSlot,
      address:    s.address,
      city:       s.city,
      planType:   s.planType,
      deliveredToday: s.deliveredToday || false,
      deliveredSlots: s.deliveredSlots || [],
    }));

    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const markDelivered = async (req, res) => {
  try {
    const { slot } = req.body; // "lunch" | "dinner"
    const sub = await Subscription.findById(req.params.subId);
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    if (!sub.deliveredSlots) sub.deliveredSlots = [];
    const today = new Date().toISOString().split("T")[0];
    const key   = `${today}_${slot}`;

    if (!sub.deliveredSlots.includes(key)) {
      sub.deliveredSlots.push(key);
    }

    // Check if both slots delivered today
    const lunchDone  = sub.deliveredSlots.includes(`${today}_lunch`);
    const dinnerDone = sub.deliveredSlots.includes(`${today}_dinner`);
    sub.deliveredToday = lunchDone && dinnerDone;

    await sub.save();

    // Notify customer
    try {
      await Notification.create({
        user:    sub.user,
        title:   `${slot === "lunch" ? "🌤️ Lunch" : "🌙 Dinner"} Delivered!`,
        message: `Your ${slot} meal has been delivered. Enjoy! 🍱`,
        type:    "general",
        isRead:  false,
      });
    } catch {}

    res.json({ success: true, message: `${slot} marked as delivered`, data: sub });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getSubscriberStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.json({ success: true, data: {} });

    const [active, paused, cancelled, total] = await Promise.all([
      Subscription.countDocuments({ kitchenId: restaurant._id, status: "active" }),
      Subscription.countDocuments({ kitchenId: restaurant._id, status: "paused" }),
      Subscription.countDocuments({ kitchenId: restaurant._id, status: "cancelled" }),
      Subscription.countDocuments({ kitchenId: restaurant._id }),
    ]);

    const revenue = await Subscription.aggregate([
      { $match: { kitchenId: restaurant._id, status: "active" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    res.json({
      success: true,
      data: {
        active, paused, cancelled, total,
        monthlyRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ============================================================
// GET ALL SUBSCRIPTIONS FOR THIS KITCHEN
// ============================================================
const getVendorSubscriptions = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    // Query by restaurantId OR vendorId — covers both storage patterns
    const query = restaurant
      ? { $or: [{ kitchenId: restaurant._id }, { kitchenId: req.user._id }, { vendor: req.user._id }] }
      : { $or: [{ kitchenId: req.user._id }, { vendor: req.user._id }] };

    const subs = await Subscription.find(query)
      .populate("user", "name phone email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subs });
  } catch (e) {
    console.error("getVendorSubscriptions error:", e.message);
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  // Coupons
  getCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon,
  // Analytics
  getAnalytics, getPeakHours, getBestItems,
  // Featured
  toggleFeatured, getFeaturedItems,
  // Offers
  getOffers, createOffer, updateOffer, deleteOffer,
  // Menu plan
  getMenuPlan, saveMenuPlan,
  // Deliveries
  getTodayDeliveries, markDelivered, getSubscriberStats,
  // Subscriptions list
  getVendorSubscriptions,
};