const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    tip: {
      type: Number,
      default: 0,
    },

    bonus: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "cash", "netbanking"],
      required: true,
    },

    // 🔥 Razorpay fields (VERY IMPORTANT)
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
  },
  { timestamps: true } // ✅ handles createdAt automatically
);

module.exports = mongoose.model("Transaction", transactionSchema);