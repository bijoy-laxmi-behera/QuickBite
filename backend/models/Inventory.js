const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔗 Optional: link to menu items
    menuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["kg", "g", "ltr", "ml", "pcs"],
      default: "pcs",
    },

    threshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    // 💰 Cost tracking
    costPerUnit: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ⏳ Expiry (optional)
    expiryDate: {
      type: Date,
    },

    // 📊 Stock update history
    history: [
      {
        quantity: Number,
        type: {
          type: String,
          enum: ["add", "deduct"],
        },
        note: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 👨‍💼 Last updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate item names per vendor
inventorySchema.index({ vendor: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);