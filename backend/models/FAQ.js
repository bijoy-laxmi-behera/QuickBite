const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["order", "payment", "delivery", "account", "general"],
      default: "general",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    tags: [String],
  },
  { timestamps: true }
);

// 🔍 Indexes
faqSchema.index({ question: "text", answer: "text", tags: "text" });
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ order: 1 });

module.exports = mongoose.model("FAQ", faqSchema);