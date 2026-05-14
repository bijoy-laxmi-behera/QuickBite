// controllers/razorpayController.js
const Razorpay     = require("razorpay");
const crypto       = require("crypto");
const Order        = require("../models/Order");
const User         = require("../models/userModel");
const Transaction  = require("../models/Transaction");

// ── Razorpay instance ─────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/payments/create-razorpay-order
// Called by Checkout.jsx BEFORE the modal opens.
// Returns a Razorpay order { id, amount, currency } to the frontend.
// ─────────────────────────────────────────────────────────────────────────────
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount:  Math.round(Number(amount) * 100), // ₹ → paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    // order = { id: "order_xxx", amount, currency, receipt, status: "created" }

    return res.json({ success: true, data: order });
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/payments/verify-and-place-order
// Called after the user pays in the Razorpay modal.
// 1. Verifies HMAC signature
// 2. Creates Order in MongoDB (using correct schema: user, pricing{})
// 3. Clears user.cart.items  (cart is embedded in userModel, no Cart model)
// 4. Creates a Transaction record
// 5. Fires Socket.IO events
// ─────────────────────────────────────────────────────────────────────────────
const verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      // order fields from Checkout.jsx
      addressId,
      paymentMethod,
      address,
      addressText,
      couponCode,
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
    } = req.body;

    // ── 1. Validate required payment fields ───────────────────────────────────
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    // ── 2. Verify Razorpay HMAC signature ─────────────────────────────────────
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed — invalid signature",
      });
    }

    // ── 3. Load user with cart.items populated ────────────────────────────────
    // Cart is embedded inside User (userModel.js) — no separate Cart model
    const user = await User.findById(req.user.id).populate("cart.items.menuItem");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartItems = user.cart?.items || [];
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ── 4. Build order items array ────────────────────────────────────────────
    const orderItems = cartItems.map((item) => ({
      menuItem:      item.menuItem._id,
      name:          item.menuItem.name,
      price:         item.menuItem.price,
      quantity:      item.quantity,
      customization: item.customization || {},
    }));

    // ── 5. Determine vendor from first cart item ──────────────────────────────
    const vendorId = cartItems[0]?.menuItem?.vendor;

    // ── 6. Calculate totals server-side (never trust frontend totals) ─────────
    const itemsTotal  = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = itemsTotal > 300 ? 0 : 40;
    const platformFee = 10;
    const tax         = Math.round(itemsTotal * 0.05);
    const totalAmount = itemsTotal + deliveryFee + platformFee + tax;

    // ── 7. Resolve delivery address ───────────────────────────────────────────
    // Order.js address schema: { fullName, phone, street, city, state, pincode, country }
    let deliveryAddress = {};
    if (address && typeof address === "object") {
      deliveryAddress = {
        fullName: address.fullName || customerName  || user.name  || "",
        phone:    address.phone    || customerPhone || user.phone || "",
        street:   address.street   || addressText   || "",
        city:     address.city     || "City",
        pincode:  address.pincode  || "000000",
        country:  "India",
      };
    } else {
      deliveryAddress = {
        fullName: customerName  || user.name  || "",
        phone:    customerPhone || user.phone || "",
        street:   addressText   || "",
        city:     "City",
        pincode:  "000000",
        country:  "India",
      };
    }

    // ── 8. Generate orderId string ────────────────────────────────────────────
    const orderIdStr = `QB-${Date.now()}`;

    // ── 9. Create the Order ───────────────────────────────────────────────────
    // Matches Order.js schema exactly:
    //   user, vendor, restaurant, items[], address{}, pricing{}, paymentMethod,
    //   status, deliveryStatus, orderId, customerLocation, otp (auto-generated)
    const newOrder = await Order.create({
      user:            req.user.id,
      vendor:          vendorId,
      items:           orderItems,
      address:         deliveryAddress,
      pricing: {
        itemsTotal,
        deliveryFee,
        platformFee,
        tax,
        discount:    0,
        totalAmount,
      },
      paymentMethod:    paymentMethod || "card",
      status:           "confirmed",
      deliveryStatus:   "pending",
      orderId:          orderIdStr,
      customerLocation: customerLocation || undefined,
    });

    // ── 10. Clear the cart embedded in User ───────────────────────────────────
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        "cart.items":       [],
        "cart.totalAmount": 0,
        "cart.coupon":      null,
      },
    });

    // ── 11. Create a Transaction record ───────────────────────────────────────
    await Transaction.create({
      user:                req.user.id,
      order:               newOrder._id,
      amount:              totalAmount,
      currency:            "INR",
      type:                "order_payment",
      status:              "success",
      paymentMethod:       paymentMethod || "card",
      description:         `Payment for order ${orderIdStr}`,
      reference:           orderIdStr,
      razorpay_order_id:   razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature:  razorpaySignature,
    });

    // ── 12. Real-time Socket.IO events ────────────────────────────────────────
    if (global.broadcastOrderStatus) {
      global.broadcastOrderStatus(newOrder._id, "confirmed", req.user.id, {
        estimatedArrival: "30-40",
      });
    }
    if (global.broadcastPaymentConfirmed) {
      global.broadcastPaymentConfirmed(newOrder._id, req.user.id);
    }

    return res.json({ success: true, data: newOrder });
  } catch (err) {
    console.error("verifyAndPlaceOrder error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Order placement failed after payment",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customer/payments/verify-upi
// Verifies a UPI VPA using Razorpay API.
// Returns { valid: true/false, name: "Account holder" }
// ─────────────────────────────────────────────────────────────────────────────
const verifyUpi = async (req, res) => {
  try {
    const { vpa } = req.body;

    if (!vpa || !vpa.includes("@")) {
      return res.status(400).json({ success: false, message: "Invalid UPI ID format" });
    }

    const result = await razorpay.payments.fetchVPADetails(vpa);

    return res.json({
      success: true,
      data: { valid: true, name: result.name || "", vpa: result.vpa || vpa },
    });
  } catch (err) {
    // Razorpay throws BAD_REQUEST_ERROR when VPA doesn't exist
    if (
      err.statusCode === 400 ||
      err.error?.code === "BAD_REQUEST_ERROR" ||
      err.error?.description?.toLowerCase().includes("vpa")
    ) {
      return res.json({ success: true, data: { valid: false } });
    }
    console.error("verifyUpi error:", err);
    return res.status(500).json({ success: false, message: "UPI verification failed" });
  }
};

module.exports = { createRazorpayOrder, verifyAndPlaceOrder, verifyUpi };