// ============ SUBSCRIPTION CONTROLLERS (replace in customerController.js) ============
// Add this import at the top of customerController.js:
//   const Subscription = require("../models/Subscription");

const getSubscriptionPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        weekly:  { label:"Weekly",  price:699,  per:"week",  features:["7 fresh meals daily","Free delivery","Veg or non-veg","Cancel anytime"] },
        monthly: { label:"Monthly", price:2499, per:"month", features:["30 fresh meals daily","Free delivery","Priority support","Exclusive discounts","Cancel anytime"] },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      user:   req.user.id,
      status: "active",
      endDate:{ $gt: new Date() },
    })
      .populate("kitchenId", "name image logo cuisine rating deliveryTime description phone address location")
      .sort({ createdAt: -1 });

    if (!sub) {
      return res.json({ success: true, data: { active: false } });
    }

    res.json({
      success: true,
      data: {
        active:     true,
        planType:   sub.planType,
        price:      sub.price,
        mealType:   sub.mealType,
        lunchSlot:  sub.lunchSlot,
        dinnerSlot: sub.dinnerSlot,
        address:    sub.address,
        city:       sub.city,
        pincode:    sub.pincode,
        kitchenId:  sub.kitchenId,
        status:     sub.status,
        startDate:  sub.startDate,
        endDate:    sub.endDate,
        _id:        sub._id,
      },
    });
  } catch (error) {
    console.error("getSubscriptionStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSubscription = async (req, res) => {
  try {
    const {
      planType, duration, mealType,
      lunchSlot, dinnerSlot,
      kitchenId, address, city, pincode,
      couponCode,
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = req.body;

    if (!planType || !duration) {
      return res.status(400).json({ success: false, message: "planType and duration are required" });
    }

    const prices   = { weekly: 699, monthly: 2499 };
    const basePrice = prices[planType];
    if (!basePrice) {
      return res.status(400).json({ success: false, message: "Invalid plan type" });
    }

    // Apply coupon discount if any
    let discount = 0;
    if (couponCode) {
      const coupons = { "SAVE10": 10, "WELCOME20": 20, "FLAT50": 7 };
      discount = coupons[couponCode.toUpperCase()] || 0;
    }
    const finalPrice = Math.round(basePrice - (basePrice * discount / 100));

    // Cancel any existing active subscription
    await Subscription.updateMany(
      { user: req.user.id, status: "active" },
      { status: "cancelled" }
    );

    const startDate = new Date();
    const endDate   = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration));

    const sub = await Subscription.create({
      user:              req.user.id,
      planType,
      price:             finalPrice,
      mealType:          mealType || "veg",
      lunchSlot:         lunchSlot  || "",
      dinnerSlot:        dinnerSlot || "",
      address:           address    || "",
      city:              city       || "",
      pincode:           pincode    || "",
      kitchenId:         kitchenId  || null,
      status:            "active",
      startDate,
      endDate,
      razorpayOrderId:   razorpayOrderId   || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
      couponCode:        couponCode || "",
      discount,
    });

    // Record transaction
    await Transaction.create({
      user:        req.user.id,
      amount:      finalPrice,
      type:        "order_payment",
      status:      "success",
      description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Meal Plan subscription`,
      reference:   sub._id.toString(),
      paymentMethod: "card",
      razorpay_order_id:   razorpayOrderId   || "",
      razorpay_payment_id: razorpayPaymentId || "",
      razorpay_signature:  razorpaySignature || "",
    });

    // Send confirmation notification
    try {
      await Notification.create({
        user:    req.user.id,
        title:   "Subscription Activated 🎉",
        message: `Your ${planType} meal plan is now active until ${endDate.toLocaleDateString("en-IN")}.`,
        type:    "payment",
        isRead:  false,
      });
    } catch {}

    res.json({
      success: true,
      message: "Subscription created successfully",
      data: {
        subscriptionId: sub._id,
        planType:  sub.planType,
        price:     sub.price,
        startDate: sub.startDate,
        endDate:   sub.endDate,
        status:    sub.status,
        mealType:  sub.mealType,
        lunchSlot: sub.lunchSlot,
        dinnerSlot:sub.dinnerSlot,
      },
    });
  } catch (error) {
    console.error("createSubscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ user: req.user.id, status: "active" });
    if (!sub) {
      return res.status(404).json({ success: false, message: "No active subscription found" });
    }
    sub.status = "cancelled";
    await sub.save();

    try {
      await Notification.create({
        user:    req.user.id,
        title:   "Subscription Cancelled",
        message: "Your meal plan subscription has been cancelled.",
        type:    "general",
        isRead:  false,
      });
    } catch {}

    res.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const applySubscriptionCoupon = async (req, res) => {
  try {
    const { code, planType } = req.body;
    const coupons = {
      "SAVE10":   { discount: 10, type: "percentage", minAmount: 500  },
      "WELCOME20":{ discount: 20, type: "percentage", minAmount: 1000 },
      "FLAT50":   { discount: 50, type: "flat",       minAmount: 699  },
    };
    const coupon = coupons[code?.toUpperCase()];
    if (!coupon) return res.status(400).json({ success: false, message: "Invalid coupon code" });

    const prices = { weekly: 699, monthly: 2499 };
    const originalPrice = prices[planType] || 699;

    let discountAmount = coupon.type === "percentage"
      ? (originalPrice * coupon.discount) / 100
      : Math.min(coupon.discount, originalPrice);

    res.json({
      success: true,
      data: {
        discount:      coupon.discount,
        discountAmount: Math.round(discountAmount),
        finalPrice:    originalPrice - Math.round(discountAmount),
        couponCode:    code.toUpperCase(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};