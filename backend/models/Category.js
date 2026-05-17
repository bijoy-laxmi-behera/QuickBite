// backend/models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 🔗 Vendor (owner) — optional for platform-wide (admin) categories
    // Admin-created categories have NO vendor field (undefined/null)
    // Vendor-created categories have their userId here
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,   // ✅ FIXED: was required:true — broke admin category creation
      default: null,
      index: true,
    },

    // 🔗 Restaurant (optional)
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
      default: null,
      index: true,
    },

    // 📝 Description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
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
      default: null,
    },

    // 📊 Cached item count
    itemCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ FIXED unique index
// Old index: { vendor:1, name:1 } unique
//   → Only ONE admin category allowed because all have vendor=null (duplicate key on second)
//   → MongoDB treats null=null as duplicate
//
// New index: sparse unique per vendor for vendor-owned categories
//   Platform (admin) categories: no vendor field, NOT covered by this index
//   Vendor categories: unique name per vendor
categorySchema.index(
  { vendor: 1, name: 1 },
  {
    unique: true,
    sparse: true,   // ✅ sparse=true: documents where vendor is null are excluded from the index
                    //    so multiple admin categories with vendor=null don't conflict
    partialFilterExpression: { vendor: { $type: "objectId" } }, // only index docs that have a real vendor
  }
);

// Separate index for fast platform-wide category lookups (no vendor)
categorySchema.index({ name: 1, isActive: 1 });
categorySchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model("Category", categorySchema);