console.log("📦 Order.js v3 loaded from:", __filename);

const mongoose = require("mongoose");

function generateOrderId() {
  return "QB-" +
    Date.now().toString().slice(-8) +
    Math.random().toString(36).substring(2, 6).toUpperCase();
}

const orderSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendor:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },

  orderId:       { type: String, unique: true, default: generateOrderId },
  vendorName:    { type: String },
  pickupAddress: { type: Object },

  items: [{
    menuItem:      { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name:          { type: String },
    quantity:      { type: Number, required: true, default: 1 },
    price:         { type: Number, required: true },
    customization: { type: Object, default: {} },
  }],

  address: {
    fullName: { type: String },
    phone:    { type: String },
    street:   { type: String },
    city:     { type: String },
    state:    { type: String },
    pincode:  { type: String },
    country:  { type: String, default: "India" },
    location: { lat: Number, lng: Number },
  },

  pricing: {
    itemsTotal:  { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    tax:         { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
  },

  paymentMethod: {
    type: String,
    enum: ["cod", "upi", "card", "netbanking", "wallet"],
    default: "cod",
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "preparing", "ready_for_pickup", "on-the-way", "delivered", "cancelled"],
    default: "pending",
  },

  deliveryStatus: {
    type: String,
    enum: ["pending", "accepted", "picked_up", "delivered", "cancelled", "rejected"],
    default: "pending",
  },

  customerLocation: { lat: Number, lng: Number },

  deliveryPartner:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryAgent:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryLocation: { lat: Number, lng: Number },

  rejectedBy: [{
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason:          { type: String },
    rejectedAt:      { type: Date, default: Date.now },
  }],

  otp: {
    type: String,
    default: function () {
      return Math.floor(100000 + Math.random() * 900000).toString();
    },
  },

  rejectReason:       { type: String },
  issue:              { type: String },
  distanceToCustomer: { type: Number },
  estimatedArrival:   { type: String },
  prepTime:           { type: Number },

  vendorAcceptedAt: Date,
  acceptedAt:       Date,
  pickedAt:         Date,
  deliveredAt:      Date,
  readyAt:          Date,

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);