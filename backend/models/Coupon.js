// backend/models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code:           { type: String, required: true, uppercase: true },
  discountType:   { type: String, enum: ["percentage", "flat"], required: true },
  discountValue:  { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount:    { type: Number },
  validFrom:      { type: Date, default: Date.now },
  validTo:        { type: Date },
  usageLimit:     { type: Number },
  usedCount:      { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },

  // null  → admin-created coupon (applies platform-wide)
  // ObjectId → vendor-created coupon (applies to that vendor only)
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Who created it — admin User _id or vendor User _id
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // true  = created by admin, visible to all vendors to opt-in
  // false = created by vendor themselves
  isAdminCoupon:  { type: Boolean, default: false },

  // Array of vendor User _ids who opted IN to this admin coupon
  // Only relevant when isAdminCoupon === true
  vendorAcceptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  description: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);