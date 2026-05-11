const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true,
    },

    discountType: {
      type: String,
      enum: ["flat", "percent"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      min: 0,
    },

    usageLimit: {
      type: Number,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    // 👤 Per user usage
    perUserLimit: {
      type: Number,
      default: 1,
    },

    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],

    // 📅 Time control
    startDate: {
      type: Date,
      default: Date.now,
    },

    expiresAt: Date,

    // 🎯 Apply to specific restaurant/vendor
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔒 Prevent invalid percentage
couponSchema.pre("save", function (next) {
  if (this.discountType === "percent" && this.discountValue > 100) {
    return next(new Error("Percentage discount cannot exceed 100"));
  }
  next();
});

module.exports = mongoose.model("Coupon", couponSchema);