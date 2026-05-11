// backend/models/Restaurant.js (Update your model)
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
  isApproved: { type: Boolean, default: false },  // ← ADD THIS LINE
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  description: String,
  phone: String,
  minOrder: { type: Number, default: 199 },
  offer: String,
  discount: String,
    
  // ✅ FIXED: Location in GeoJSON format
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      default: [85.8245, 20.2961] // Default to Bhubaneswar
    },
    address: String,
    city: String,
    area: String,
    pincode: String
  },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create geospatial index for nearby queries
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);