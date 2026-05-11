const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // percentage
    },

    maxDeliveryDistance: {
      type: Number,
      default: 10,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    supportEmail: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    allowCOD: {
      type: Boolean,
      default: true,
    },

    allowOnlinePayment: {
      type: Boolean,
      default: true,
    },

    // 🔥 Payment config (important for Razorpay)
    paymentGateway: {
      name: {
        type: String,
        default: "razorpay",
      },
      mode: {
        type: String,
        enum: ["test", "live"],
        default: "test",
      },
    },

    // 💰 Platform commission (for vendors)
    platformCommission: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // 👨‍💼 Track admin who updated settings
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);