// controllers/customerController.js
const User = require("../models/userModel");
const MenuItem = require("../models/menuItem");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const cloudinary = require("cloudinary").v2;
const sendEmail = require("../utils/sendEmail");
const Subscription = require("../models/Subscription");

// ============ HELPER FUNCTIONS ============
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }

// ============ RESTAURANT CONTROLLERS ============
const getRestaurants = async (req, res) => {
  try {
    const { cuisine, limit = 20, page = 1 } = req.query;
    let filter = { isApproved: true, type: { $ne: "Cloud Kitchen" } };
    if (cuisine) filter.cuisine = { $in: [cuisine] };
    const restaurants = await Restaurant.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    const total = await Restaurant.countDocuments(filter);
    res.json({ success: true, data: restaurants, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchRestaurants = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const data = await Restaurant.find({
      isApproved: true, type: { $ne: "Cloud Kitchen" },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { cuisine: { $regex: q, $options: "i" } },
        { "address.city": { $regex: q, $options: "i" } }
      ],
    }).limit(20);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNearbyRestaurants = async (req, res) => {
  try {
    let { lat, lng, radius = 5000, limit = 20 } = req.query;
    lat = parseFloat(lat); lng = parseFloat(lng);
    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ success: false, message: "Invalid coordinates" });
    const restaurants = await Restaurant.find({
      isApproved: true,
      location: { $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: parseInt(radius) } },
    }).limit(parseInt(limit));
    const restaurantsWithDistance = restaurants.map(rest => {
      if (rest.location?.coordinates) {
        const distance = getDistanceFromLatLonInKm(lat, lng, rest.location.coordinates[1], rest.location.coordinates[0]);
        return { ...rest.toObject(), distance };
      }
      return { ...rest.toObject(), distance: null };
    });
    res.json({ success: true, data: restaurantsWithDistance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isApproved: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMenu = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findOne({ _id: restaurantId, isApproved: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const items = await MenuItem.find({
      $or: [
        { restaurant: restaurantId },
        { vendor: restaurant.owner },
      ],
      isAvailable: true,
    }).populate("category", "name slug order").lean();

    const grouped = {};
    const uncategorized = [];
    items.forEach((item) => {
      if (item.category?.name) {
        const catName = item.category.name;
        if (!grouped[catName]) grouped[catName] = { order: item.category.order || 99, items: [] };
        grouped[catName].items.push(item);
      } else {
        uncategorized.push(item);
      }
    });

    const sortedGrouped = Object.fromEntries(
      Object.entries(grouped).sort((a, b) => (a[1].order || 99) - (b[1].order || 99))
    );
    if (uncategorized.length > 0) sortedGrouped["Other"] = { items: uncategorized };

    const result = {};
    Object.entries(sortedGrouped).forEach(([key, val]) => { result[key] = val.items; });

    res.json({ success: true, data: result, totalItems: items.length });
  } catch (error) {
    console.error("getMenu error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ FIXED — getCategories
// Bug 1: platform-wide categories (no vendor field) were excluded by vendor filter
// Bug 2: count > 0 filter hid categories that exist but have no menu items yet
// Bug 3: restaurantId branch used vendor filter which missed admin-created categories
const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (restaurantId) {
      // Restaurant-specific: show categories that belong to this vendor
      // OR are platform-wide (created by admin with no vendor field)
      const restaurant = await Restaurant.findOne({ _id: restaurantId, isApproved: true }).select("owner");
      if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

      const categories = await Category.find({
        isActive: { $ne: false },
        $or: [
          { vendor: restaurant.owner },   // vendor's own categories
          { vendor: { $exists: false } }, // admin-created (no vendor field)
          { vendor: null },               // admin-created (null vendor)
        ],
      }).sort({ order: 1, createdAt: -1 });

      const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
          const count = await MenuItem.countDocuments({
            category: cat._id,
            isAvailable: true,
            $or: [
              { restaurant: restaurantId },
              { vendor: restaurant.owner },
            ],
          });
          return { ...cat.toObject(), count };
        })
      );

      // For restaurant-specific view, only show categories that have items
      return res.json({
        success: true,
        data: categoriesWithCount.filter((c) => c.count > 0),
      });
    }

    // ── No restaurantId: return ALL active platform categories ────────────────
    // Used by: customer Categories page, vendor Add Menu Item modal
    // Do NOT filter by count — show all categories even if no items yet
    const categories = await Category.find({
      isActive: { $ne: false },
    }).sort({ order: 1, createdAt: -1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await MenuItem.countDocuments({ category: cat._id, isAvailable: true });
        return { ...cat.toObject(), count };
      })
    );

    // Return ALL categories — don't filter by count so newly added
    // categories (with 0 items) are still visible in the explorer and dropdowns
    res.json({ success: true, data: categoriesWithCount });

  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const restaurant = await Restaurant.findOne({ _id: req.params.id, isApproved: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Review.countDocuments({ restaurant: req.params.id });
    res.json({ success: true, data: reviews, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchMenu = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const items = await MenuItem.find({ name: { $regex: q, $options: "i" } })
      .populate({ path: "restaurant", match: { isApproved: true }, select: "name logo address" })
      .populate("category", "name").limit(20);
    res.json({ success: true, data: items.filter(item => item.restaurant !== null) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId)
      .populate({ path: "restaurant", match: { isApproved: true }, select: "name logo address phone" })
      .populate("category", "name");
    if (!item || !item.restaurant) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTrendingItems = async (req, res) => {
  try {
    let items = await MenuItem.find({ isPopular: true })
      .populate({ path: "restaurant", match: { isApproved: true }, select: "name logo" })
      .limit(10).sort({ createdAt: -1 });
    items = items.filter(item => item.restaurant !== null);
    if (items.length === 0) {
      items = await MenuItem.find({ isAvailable: true })
        .populate({ path: "restaurant", match: { isApproved: true }, select: "name logo" })
        .limit(8);
      items = items.filter(item => item.restaurant !== null);
    }
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ PROFILE CONTROLLERS ============
const getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    const updatedUser = await user.save();
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload an image" });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "avatars" });
    user.avatar = result.secure_url;
    await user.save();
    res.status(200).json({ success: true, data: { avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADDRESS CONTROLLERS ============
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newAddress = { ...req.body, isDefault: user.addresses.length === 0 ? true : req.body.isDefault || false };
    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, message: "Address removed", data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, message: "Address updated", data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.forEach(addr => addr.isDefault = false);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    address.isDefault = true;
    await user.save();
    res.json({ success: true, message: "Default address set", data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ CART CONTROLLERS ============
const addToCart = async (req, res) => {
  try {
    let { menuItem, quantity = 1, customization = {} } = req.body;
    if (!menuItem) return res.status(400).json({ success: false, message: "Menu item ID is required" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.cart) user.cart = { items: [], totalAmount: 0, coupon: null };
    if (!user.cart.items) user.cart.items = [];
    const menuItemId = menuItem.toString();
    const menuItemExists = await MenuItem.findById(menuItemId);
    if (!menuItemExists) return res.status(404).json({ success: false, message: "Menu item not found" });
    const existingItemIndex = user.cart.items.findIndex(item => item.menuItem && item.menuItem.toString() === menuItemId);
    if (existingItemIndex !== -1) {
      user.cart.items[existingItemIndex].quantity += quantity;
    } else {
      user.cart.items.push({ menuItem: menuItemId, quantity, customization });
    }
    let totalAmount = 0;
    for (const item of user.cart.items) {
      const menuItemData = await MenuItem.findById(item.menuItem);
      if (menuItemData?.price) totalAmount += menuItemData.price * item.quantity;
    }
    user.cart.totalAmount = totalAmount;
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate("cart.items.menuItem");
    res.json({ success: true, data: { items: updatedUser.cart.items, totalAmount: updatedUser.cart.totalAmount, coupon: updatedUser.cart.coupon } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.items.menuItem");
    if (!user.cart) { user.cart = { items: [], totalAmount: 0, coupon: null }; await user.save(); }
    res.json({ success: true, data: { items: user.cart.items || [], totalAmount: user.cart.totalAmount || 0, coupon: user.cart.coupon || null } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.cart?.items) return res.status(404).json({ success: false, message: "Cart not found" });
    const item = user.cart.items.id(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    item.quantity = quantity;
    let totalAmount = 0;
    for (const cartItem of user.cart.items) {
      const menuItemData = await MenuItem.findById(cartItem.menuItem);
      if (menuItemData?.price) totalAmount += menuItemData.price * cartItem.quantity;
    }
    user.cart.totalAmount = totalAmount;
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate("cart.items.menuItem");
    res.json({ success: true, data: { items: updatedUser.cart.items, totalAmount: updatedUser.cart.totalAmount, coupon: updatedUser.cart.coupon } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.cart?.items) return res.status(404).json({ success: false, message: "Cart not found" });
    user.cart.items = user.cart.items.filter(item => item._id.toString() !== req.params.id);
    let totalAmount = 0;
    for (const cartItem of user.cart.items) {
      const menuItemData = await MenuItem.findById(cartItem.menuItem);
      if (menuItemData?.price) totalAmount += menuItemData.price * cartItem.quantity;
    }
    user.cart.totalAmount = totalAmount;
    await user.save();
    const updatedUser = await User.findById(req.user.id).populate("cart.items.menuItem");
    res.json({ success: true, data: { items: updatedUser.cart.items, totalAmount: updatedUser.cart.totalAmount, coupon: updatedUser.cart.coupon } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = { items: [], totalAmount: 0, coupon: null };
    await user.save();
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id).populate("cart.items.menuItem");
    const total = user.cart.totalAmount || 0;
    const coupons = {
      "SAVE10": { discount: 0.1, minOrder: 199, maxDiscount: 100 },
      "WELCOME20": { discount: 0.2, minOrder: 299, maxDiscount: 150 },
      "FLAT50": { discount: 50, type: "flat", minOrder: 399 }
    };
    const coupon = coupons[code.toUpperCase()];
    if (!coupon) return res.status(400).json({ success: false, message: "Invalid coupon code" });
    if (total < (coupon.minOrder || 0)) return res.status(400).json({ success: false, message: `Minimum order of ₹${coupon.minOrder} required` });
    const discountAmount = coupon.type === "flat" ? coupon.discount : Math.min(total * coupon.discount, coupon.maxDiscount || Infinity);
    user.cart.coupon = code.toUpperCase();
    await user.save();
    res.json({ success: true, data: { discount: discountAmount, coupon: code.toUpperCase() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ORDER CONTROLLERS ============
const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod = "cod", customerLocation, couponCode, addressText, city, pincode, landmark } = req.body;
    const user = await User.findById(req.user.id).populate("cart.items.menuItem");
    if (!user.cart.items.length) return res.status(400).json({ success: false, message: "Cart is empty" });

    let deliveryAddress = addressId ? user.addresses.id(addressId) : user.addresses.find(addr => addr.isDefault);
    if (!deliveryAddress && (addressText || req.body.address)) {
      deliveryAddress = { fullName: user.name || "Customer", phone: user.phone || "", street: addressText || req.body.address, city: city || "Unknown", pincode: pincode || "000000", landmark: landmark || "", state: "Unknown" };
    }
    if (!deliveryAddress) return res.status(400).json({ success: false, message: "Please add a delivery address" });

    let subtotal = 0;
    user.cart.items.forEach(item => { if (item.menuItem?.price) subtotal += item.menuItem.price * item.quantity; });
    const deliveryFee = subtotal > 300 ? 0 : 40;
    const platformFee = 10;
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + deliveryFee + platformFee + tax;
    const vendor = user.cart.items[0]?.menuItem?.vendor || user.cart.items[0]?.menuItem?.restaurant;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const items = user.cart.items.map(item => ({
      menuItem: item.menuItem._id, name: item.menuItem.name,
      quantity: item.quantity, customization: item.customization || {}, price: item.menuItem.price
    }));

    const order = await Order.create({
      user: user._id, vendor, restaurant: vendor, items,
      address: { fullName: deliveryAddress.fullName || user.name || "Customer", phone: deliveryAddress.phone || user.phone || "", street: deliveryAddress.street || addressText, city: deliveryAddress.city || city || "Unknown", pincode: deliveryAddress.pincode || pincode || "000000", landmark: deliveryAddress.landmark || landmark || "", state: deliveryAddress.state || "Unknown" },
      pricing: { itemsTotal: subtotal, deliveryFee, platformFee, tax, discount: 0, totalAmount },
      paymentMethod, status: "pending", deliveryStatus: "pending",
      orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      customerLocation: customerLocation || null, otp
    });

    user.cart.items = []; user.cart.coupon = null; await user.save();

    try {
      const customer = await User.findById(req.user.id);
      const otpEmailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;"><h2>Order Confirmed! 🎉</h2><p>Hey <b>${customer.name || 'Customer'}</b>, your order is being prepared.</p><p><strong>Order ID:</strong> ${order.orderId}</p><p><strong>Total:</strong> ₹${totalAmount}</p><div style="background:#fff3cd;padding:20px;border-radius:10px;text-align:center;"><p><strong>Delivery OTP</strong></p><h1 style="color:#ff512f;letter-spacing:8px;">${otp}</h1><p>Share this with your delivery partner.</p></div></div>`;
      await sendEmail(customer.email, `Order Confirmation - #${order.orderId}`, otpEmailHtml);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError.message);
    }

    res.status(201).json({ success: true, message: "Order placed successfully. OTP sent to your email.", data: order });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.menuItem", "name price image")
      .populate("vendor", "name logo address")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.menuItem", "name price image isveg")
      .populate("user", "name email phone")
      .populate("vendor", "name logo address phone cuisine")
      .populate("delivery", "name phone avatar");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Unauthorized" });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("delivery", "name phone avatar")
      .populate("vendor", "name address phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Unauthorized" });
    let estimatedArrival = order.estimatedArrival;
    if (!estimatedArrival) {
      if (order.deliveryStatus === "confirmed") estimatedArrival = "30-40 minutes";
      else if (order.deliveryStatus === "preparing") estimatedArrival = "25-35 minutes";
      else if (order.deliveryStatus === "on-the-way") estimatedArrival = "15-25 minutes";
      else if (order.deliveryStatus === "out_for_delivery") estimatedArrival = "5-15 minutes";
      else if (order.deliveryStatus === "delivered") estimatedArrival = "Delivered";
      else estimatedArrival = "45-60 minutes";
    }
    res.json({ success: true, data: { status: order.status, deliveryStatus: order.deliveryStatus, estimatedArrival, deliveryPartner: order.deliveryPartner, deliveryLocation: order.deliveryLocation, customerLocation: order.customerLocation, orderId: order.orderId, vendor: order.vendor, items: order.items, totalAmount: order.pricing?.totalAmount || order.totalAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== "pending" && order.status !== "confirmed") return res.status(400).json({ success: false, message: "Cannot cancel this order at this stage" });
    order.status = "cancelled"; order.deliveryStatus = "cancelled";
    await order.save();
    await Notification.create({ user: order.user, title: "Order Cancelled", message: `Your order #${order.orderId} has been cancelled.`, type: "order", isRead: false });
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reorder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.menuItem");
    const user = await User.findById(req.user.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    user.cart.items = order.items.map(item => ({ menuItem: item.menuItem._id, quantity: item.quantity, customization: item.customization || {} }));
    await user.save();
    res.json({ success: true, message: "Items added to cart" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ PAYMENT CONTROLLERS ============
const getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user.paymentMethods || [] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addPaymentMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.paymentMethods) user.paymentMethods = [];
    const newMethod = { ...req.body, isDefault: user.paymentMethods.length === 0 ? true : req.body.isDefault || false };
    if (newMethod.isDefault) user.paymentMethods.forEach(m => m.isDefault = false);
    user.paymentMethods.push(newMethod);
    await user.save();
    res.status(201).json({ success: true, data: user.paymentMethods });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const removePaymentMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.paymentMethods = user.paymentMethods.filter(m => m._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, data: user.paymentMethods });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const setDefaultPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.paymentMethods.forEach(m => m.isDefault = false);
    const method = user.paymentMethods.id(req.params.id);
    if (!method) return res.status(404).json({ success: false, message: "Not found" });
    method.isDefault = true;
    await user.save();
    res.json({ success: true, message: "Default payment set", data: method });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate("order").sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ============ REVIEW CONTROLLERS ============
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("menuItem", "name image price").populate("restaurant", "name logo").populate("order", "orderId createdAt").sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment, restaurantId, menuItemId, orderId, isAnonymous } = req.body;
    if (!rating || !comment) return res.status(400).json({ success: false, message: "Rating and comment are required" });
    if (orderId) {
      const existingReview = await Review.findOne({ user: req.user.id, order: orderId });
      if (existingReview) return res.status(400).json({ success: false, message: "You have already reviewed this order" });
    }
    const review = await Review.create({ user: req.user.id, rating, comment, restaurant: restaurantId || null, menuItem: menuItemId || null, order: orderId || null, isAnonymous: isAnonymous || false });
    const populatedReview = await Review.findById(review._id).populate("menuItem", "name image price").populate("restaurant", "name logo");
    res.status(201).json({ success: true, message: "Review added successfully", data: populatedReview });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (review.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Unauthorized" });
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    res.json({ success: true, message: "Review updated successfully", data: review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (review.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Unauthorized" });
    await review.deleteOne();
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ============ NOTIFICATION CONTROLLERS ============
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: "Not found" });
    notification.isRead = true; await notification.save();
    res.json({ success: true, message: "Marked as read" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notificationPreferences = { ...user.notificationPreferences, ...req.body };
    await user.save();
    res.json({ success: true, data: user.notificationPreferences });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ============ FAVOURITES CONTROLLERS ============
const getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({ path: "favourites", match: { isApproved: true } });
    res.json({ success: true, data: user.favourites || [] });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const addFavourite = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user.favourites) user.favourites = [];
    const restaurant = await Restaurant.findOne({ _id: itemId, isApproved: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found or not approved" });
    if (user.favourites.some(fav => fav.toString() === itemId)) return res.status(400).json({ success: false, message: "Already in favourites" });
    user.favourites.push(itemId); await user.save();
    res.json({ success: true, message: "Added to favourites", data: user.favourites });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const removeFavourite = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(req.user.id);
    if (!user.favourites) user.favourites = [];
    user.favourites = user.favourites.filter(item => item.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, message: "Removed from favourites", data: user.favourites });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const saveLocation = async (req, res) => {
  try {
    const { lat, lng, area, city, state, pincode, fullAddress } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.lastLocation = { lat, lng, area, city, state, pincode, fullAddress, updatedAt: new Date() };
    await user.save();
    res.json({ success: true, message: 'Location saved successfully' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ============ SUBSCRIPTION CONTROLLERS ============
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = {
      weekly: { label: "Weekly", price: 699, per: "week", features: ["Fresh Meals Daily", "Free Delivery", "Healthy Options"] },
      monthly: { label: "Monthly", price: 2499, per: "month", features: ["Fresh Meals Daily", "Free Delivery", "Healthy Options", "Priority Support", "Pause Anytime"] }
    };
    res.json({ success: true, data: plans });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user.id, status: "active", endDate: { $gt: new Date() } })
      .populate("kitchenId", "name image logo cuisine rating deliveryTime description phone address location")
      .sort({ createdAt: -1 });
    if (!sub) return res.json({ success: true, data: { active: false } });
    res.json({ success: true, data: { active: true, planType: sub.planType, price: sub.price, mealType: sub.mealType, lunchSlot: sub.lunchSlot, dinnerSlot: sub.dinnerSlot, address: sub.address, city: sub.city, pincode: sub.pincode, kitchenId: sub.kitchenId, status: sub.status, startDate: sub.startDate, endDate: sub.endDate, _id: sub._id } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createSubscription = async (req, res) => {
  try {
    const { planType, duration, mealType, lunchSlot, dinnerSlot, kitchenId, address, city, pincode, couponCode, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!planType || !duration) return res.status(400).json({ success: false, message: "planType and duration are required" });
    const prices = { weekly: 699, monthly: 2499 };
    const basePrice = prices[planType];
    if (!basePrice) return res.status(400).json({ success: false, message: "Invalid plan type" });
    let discount = 0;
    if (couponCode) { const coupons = { "SAVE10": 10, "WELCOME20": 20, "FLAT50": 7 }; discount = coupons[couponCode.toUpperCase()] || 0; }
    const finalPrice = Math.round(basePrice - (basePrice * discount / 100));
    await Subscription.updateMany({ user: req.user.id, status: "active" }, { status: "cancelled" });
    const startDate = new Date(); const endDate = new Date(); endDate.setDate(endDate.getDate() + parseInt(duration));
    const sub = await Subscription.create({ user: req.user.id, planType, price: finalPrice, mealType: mealType || "veg", lunchSlot: lunchSlot || "", dinnerSlot: dinnerSlot || "", address: address || "", city: city || "", pincode: pincode || "", kitchenId: kitchenId || null, status: "active", startDate, endDate, razorpayOrderId: razorpayOrderId || "", razorpayPaymentId: razorpayPaymentId || "", razorpaySignature: razorpaySignature || "", couponCode: couponCode || "", discount });
    await Transaction.create({ user: req.user.id, amount: finalPrice, type: "order_payment", status: "success", description: `${planType} Meal Plan subscription`, reference: sub._id.toString(), paymentMethod: "card" });
    try { await Notification.create({ user: req.user.id, title: "Subscription Activated 🎉", message: `Your ${planType} meal plan is now active until ${endDate.toLocaleDateString("en-IN")}.`, type: "payment", isRead: false }); } catch {}
    res.json({ success: true, message: "Subscription created successfully", data: { subscriptionId: sub._id, planType: sub.planType, price: sub.price, startDate: sub.startDate, endDate: sub.endDate, status: sub.status } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user.id, status: "active" });
    if (!sub) return res.status(404).json({ success: false, message: "No active subscription found" });
    sub.status = "cancelled"; await sub.save();
    try { await Notification.create({ user: req.user.id, title: "Subscription Cancelled", message: "Your meal plan subscription has been cancelled.", type: "general", isRead: false }); } catch {}
    res.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const applySubscriptionCoupon = async (req, res) => {
  try {
    const { code, planType } = req.body;
    const coupons = { "SAVE10": { discount: 10, type: "percentage" }, "WELCOME20": { discount: 20, type: "percentage" }, "FLAT50": { discount: 50, type: "flat" } };
    const coupon = coupons[code?.toUpperCase()];
    if (!coupon) return res.status(400).json({ success: false, message: "Invalid coupon code" });
    const prices = { weekly: 699, monthly: 2499 };
    const originalPrice = prices[planType] || 699;
    const discountAmount = coupon.type === "percentage" ? (originalPrice * coupon.discount) / 100 : Math.min(coupon.discount, originalPrice);
    res.json({ success: true, data: { discount: coupon.discount, discountAmount, finalPrice: originalPrice - discountAmount, couponCode: code.toUpperCase() } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
  getRestaurants, searchRestaurants, getNearbyRestaurants, getRestaurantById,
  getMenu, getReviews, searchMenu, getMenuItem, getCategories, getTrendingItems,
  getProfile, updateProfile, deleteProfile, updateAvatar,
  addAddress, getAddresses, updateAddress, setDefaultAddress, deleteAddress,
  getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon,
  placeOrder, getOrders, getOrderById, trackOrder, cancelOrder, reorder,
  getPaymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPayment, getTransactions,
  addReview, getMyReviews, updateReview, deleteReview,
  getNotifications, markAsRead, markAllAsRead, updateNotificationPreferences,
  getFavourites, addFavourite, removeFavourite,
  saveLocation,
  getSubscriptionPlans, getSubscriptionStatus, createSubscription, cancelSubscription, applySubscriptionCoupon
};