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

    // 📂 Category for grouping
    category: {
      type: String,
      enum: ["order", "payment", "delivery", "account", "general"],
      default: "general",
    },

    // 👁️ Visibility control
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔢 Sorting order
    order: {
      type: Number,
      default: 0,
    },

    // 🔍 Search keywords
    tags: [String],
  },
  { timestamps: true }
);

// 🔍 Text search index
faqSchema.index({ question: "text", answer: "text" });

module.exports = mongoose.model("FAQ", faqSchema);