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
      required: false,
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

    discountedPrice: {
      type: Number,
      min: 0,
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/200",
    },

    // ✅ category is now OPTIONAL — vendor can add items without a category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,   // ← changed from true to false
      default: null,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isveg: {
      type: Boolean,
      default: true,
    },

    preparationTime: {
      type: Number,
      default: 30,
    },

    stock: {
      type: Number,
      default: -1, // -1 = unlimited
    },

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

    variants: [
      {
        name: String,
        price: Number,
      },
    ],

    addOns: [
      {
        name: String,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);