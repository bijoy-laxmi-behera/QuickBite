const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // 💸 Discounted price (optional)
    discountedPrice: {
      type: Number,
      min: 0,
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/200",
    },

    // ✅ FIXED category reference
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    // 📦 Stock management
    stock: {
      type: Number,
      default: -1, // -1 means unlimited
    },

    // ⭐ Ratings
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // 🍕 Customization options
    variants: [
      {
        name: String, // e.g. Small, Medium, Large
        price: Number,
      },
    ],

    addOns: [
      {
        name: String, // e.g. Extra Cheese
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);