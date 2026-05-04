const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["order", "payment", "delivery", "promo", "general"],
      default: "general",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // 🔗 Reference system (flexible)
    reference: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      model: {
        type: String,
        enum: ["Order", "Transaction", "SupportTicket"],
      },
    },

    // 🔗 Frontend navigation
    actionUrl: {
      type: String,
    },

    // 📡 Notification channel
    channel: {
      type: String,
      enum: ["in_app", "push", "email"],
      default: "in_app",
    },

    // ⏳ Expiry (optional)
    expiresAt: Date,

    // 📢 Broadcast support
    isBroadcast: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);