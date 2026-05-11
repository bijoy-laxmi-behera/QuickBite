const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 💰 Total payout amount
    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // 📊 Earnings breakdown
    breakdown: {
      orderEarnings: { type: Number, default: 0 },
      tips: { type: Number, default: 0 },
      bonuses: { type: Number, default: 0 },
      commission: { type: Number, default: 0 }, // deducted
    },

    // 🔗 Related transactions/orders
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },

    payoutDate: {
      type: Date,
      default: Date.now,
    },

    // 🔥 Payment reference (bank/razorpay)
    reference: {
      type: String,
      trim: true,
    },

    // 🔥 Gateway payout ID (important)
    gatewayPayoutId: String,

    paymentMethod: {
      type: String,
      enum: ["upi", "bank"], // ✅ removed card
      required: true,
    },

    failureReason: {
      type: String,
      default: "",
    },

    // 👨‍💼 Admin who processed payout
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", payoutSchema);