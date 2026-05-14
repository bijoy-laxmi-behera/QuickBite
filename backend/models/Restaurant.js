// backend/models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // ✅ NEW: Restaurant type (Restaurant or Cloud Kitchen)
  type: {
    type: String,
    enum: ['Restaurant', 'Cloud Kitchen'],
    default: 'Restaurant',
  },

  cuisine: [String],
  rating: { type: Number, default: 4.0 },
  reviewCount: { type: Number, default: 0 },
  deliveryTime: { type: Number, default: 30 },
  priceForTwo: { type: Number, default: 500 },
  image: String,
  logo: String,
  coverImage: String,
  isOpen: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  description: String,
  phone: String,
  minOrder: { type: Number, default: 199 },
  offer: String,
  discount: String,
  rejectionReason: { type: String, default: '' },

  // ✅ Location in GeoJSON format
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      default: [85.8245, 20.2961], // Bhubaneswar
    },
    address: String,
    city: String,
    area: String,
    pincode: String,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Geospatial index for nearby queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);