// models/menuItem.js — FIXED
// Key changes:
//  1. vendor is now required (prevents null vendor orders)
//  2. restaurant is indexed for faster lookups
//  3. Added compound index for common query patterns

const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },
    description: { type: String, default: "" },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // ✅ FIX: vendor (User _id) must always be set — this is what Order.vendor stores
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vendor is required"],
      index: true,
    },

    // ✅ FIX: restaurant (Restaurant _id) — set via owner lookup in createMenuItem
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },

    // veg/non-veg — stored as isveg to match existing code
    isveg: { type: Boolean, default: true },
    // alias so both isveg and isVeg work in queries
    isVeg: { type: Boolean },

    isPopular:  { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    preparationTime: { type: Number, default: 30 }, // minutes
    mealSlot: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "all", "snack"],
      default: "lunch",
    },
    dayOfWeek: {
      type: String,
      enum: ["daily", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      default: "daily",
    },

    rating:       { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    stock:        { type: Number, default: -1 }, // -1 = unlimited
  },
  {
    timestamps: true,
  }
);

// ✅ Compound indexes for common queries
menuItemSchema.index({ vendor: 1, isAvailable: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ category: 1, isAvailable: 1 });

// ✅ Keep isveg and isVeg in sync
menuItemSchema.pre("save", function (next) {
  if (this.isModified("isveg")) this.isVeg = this.isveg;
  if (this.isModified("isVeg") && !this.isModified("isveg")) this.isveg = this.isVeg;
  next();
});

module.exports = mongoose.model("MenuItem", menuItemSchema);