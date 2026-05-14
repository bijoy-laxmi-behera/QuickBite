// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Made optional
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }, // Made optional

  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String }, // Made optional
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    customization: { type: Object, default: {} }
  }],

  address: {
    fullName: { type: String }, // Made optional
    phone: { type: String }, // Made optional
    street: { type: String }, // Made optional
    city: { type: String }, // Made optional
    state: { type: String },
    pincode: { type: String }, // Made optional
    country: { type: String, default: "India" }
  },

  pricing: {
    itemsTotal: { type: Number, default: 0 }, // Added default
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },

  paymentMethod: { type: String, enum: ["cod", "upi", "card"], default: "cod" },
  status: { type: String, enum: ["pending", "confirmed", "preparing", "on-the-way", "delivered", "cancelled"], default: "pending" },
  deliveryStatus: { type: String, default: "pending" },
  orderId: { type: String, unique: true },

  customerLocation: {
    lat: Number,
    lng: Number
  },

  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deliveryLocation: {
    lat: Number,
    lng: Number
  },
  otp: {
    type: String,
    default: function () {
      // Generate 6-digit OTP
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
  },
  distanceToCustomer: Number,
  estimatedArrival: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);