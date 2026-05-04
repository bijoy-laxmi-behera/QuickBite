const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // ✅ prevents fake reviews
    },

    // ✅ Use ONE reference (restaurant or vendor)
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true, // ✅ fixed typo
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate reviews per order + item
reviewSchema.index(
  { user: 1, order: 1, menuItem: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);