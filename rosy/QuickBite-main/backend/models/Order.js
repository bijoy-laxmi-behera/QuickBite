const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
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

    // ✅ Restaurant reference
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    // ✅ Price breakdown
    pricing: {
      itemsTotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ✅ Improved address
    address: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      pincode: { type: String, required: true },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    prepTime: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
      default: "cod",
    },

    // 🔗 Transaction link
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔐 OTP with expiry
    otp: String,
    otpExpiry: Date,

    deliveryStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "picked_up",
        "delivered",
        "rejected",
      ],
      default: "pending",
    },

    rejectionReason: String,
    issue: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);