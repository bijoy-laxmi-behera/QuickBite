const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
  code:           { type: String, required: true, uppercase: true },
  discountType:   { type: String, enum: ["percentage","flat"], required: true },
  discountValue:  { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount:    { type: Number },
  validFrom:      { type: Date, default: Date.now },
  validTo:        { type: Date },
  usageLimit:     { type: Number },
  usedCount:      { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
  vendor:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description:    { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.model("Coupon", couponSchema);