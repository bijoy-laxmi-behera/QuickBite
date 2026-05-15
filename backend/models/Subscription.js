// backend/models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  planType: {
    type: String,
    enum: ["weekly", "monthly"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  mealType: {
    type: String,
    enum: ["veg", "non-veg"],
    default: "veg",
  },
  lunchSlot:  { type: String, default: "" },
  dinnerSlot: { type: String, default: "" },
  address:    { type: String, default: "" },
  city:       { type: String, default: "" },
  pincode:    { type: String, default: "" },
  kitchenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  status: {
    type: String,
    enum: ["active", "paused", "cancelled", "expired"],
    default: "active",
  },
  startDate: { type: Date, default: Date.now },
  endDate:   { type: Date, required: true },
  // Razorpay refs
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  couponCode:        { type: String },
  discount:          { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Subscription", subscriptionSchema);