const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    cuisine: {
      type: String,
    },

    address: {
      type: String,
      trim: true,
    },

    // ✅ Owner (vendor)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Geo location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val) {
            return (
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 &&
              val[1] >= -90 &&
              val[1] <= 90
            );
          },
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },

    // ✅ Rating system
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

    // ✅ Opening hours
    openingHours: {
      type: String,
      default: "Not specified",
    },

    // ✅ Restaurant image
    image: {
      type: String,
      default: "https://via.placeholder.com/300",
    },

    // ✅ Status control
    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ Delivery settings
    deliveryRadius: {
      type: Number,
      default: 10, // km
    },

    minOrderAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔥 Geo index (for nearby search)
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);