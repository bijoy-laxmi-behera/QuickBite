const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔗 Vendor (owner)
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔗 Restaurant (important)
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // 📝 Description
    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      default: "https://via.placeholder.com/150",
    },

    // 🔗 Slug for URL
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔢 Display order
    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🌳 Parent category (optional)
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // 📊 Cached count
    itemCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔒 Unique category per vendor + restaurant
categorySchema.index(
  { vendor: 1, restaurant: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model("Category", categorySchema);