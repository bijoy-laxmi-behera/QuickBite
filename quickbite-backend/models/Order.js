const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // ─── CORE ─────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "menuItem",
        },
        name:     String,
        price:    Number,
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "accepted", "preparing", "ready", "completed", "cancelled"],
      default: "new",
    },
    prepTime: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
    },

    // ─── DELIVERY ─────────────────────────────────────────
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveryStatus: {
      type: String,
      enum: ["assigned", "picked_up", "delivered"],
      default: null,
    },
    deliveryAddress: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },

    // ─── LIVE LOCATION ────────────────────────────────────
    deliveryLocation: {
      lat:       { type: Number, default: null },
      lng:       { type: Number, default: null },
      updatedAt: { type: Date,   default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
