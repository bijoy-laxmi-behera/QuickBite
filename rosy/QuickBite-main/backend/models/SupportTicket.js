const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    // ✅ Category for filtering
    category: {
      type: String,
      enum: ["order", "payment", "account", "delivery", "other"],
      default: "other",
    },

    // ✅ Priority system
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },

    // ✅ Conversation thread (IMPORTANT)
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ✅ Admin assigned
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ✅ Attachments
    attachments: [String],

    // Optional quick reply (keep if you want simple system too)
    response: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);