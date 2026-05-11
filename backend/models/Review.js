const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant"
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem"
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"  // Link review to specific order
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ restaurant: 1, rating: -1 });
reviewSchema.index({ order: 1 }); // Add index for order lookups

module.exports = mongoose.model("Review", reviewSchema);