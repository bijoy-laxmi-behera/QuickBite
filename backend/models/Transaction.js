const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    // Transaction type for wallet system
    type: {
      type: String,
      enum: ["credit", "debit", "payout", "order_payment", "refund"],
      default: "order_payment"
    },

    // For delivery partner earnings
    tip: {
      type: Number,
      default: 0
    },

    bonus: {
      type: Number,
      default: 0
    },

    // For delivery partner earnings breakdown
    breakdown: {
      deliveryFee: { type: Number, default: 0 },
      platformCommission: { type: Number, default: 0 },
      tip: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      adjustment: { type: Number, default: 0 }
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending", "processing"],
      default: "pending"
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "cash", "netbanking", "wallet"],
      default: "cash"
    },

    // Description for the transaction
    description: {
      type: String,
      default: ""
    },

    // Reference ID (order ID, withdrawal ID, etc.)
    reference: {
      type: String
    },

    // Metadata for additional info
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // Razorpay fields
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
  },
  { timestamps: true }
);

// Indexes for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ order: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Method to mark transaction as success
transactionSchema.methods.markSuccess = function(paymentDetails = {}) {
  this.status = 'success';
  if (paymentDetails.razorpay_payment_id) {
    this.razorpay_payment_id = paymentDetails.razorpay_payment_id;
  }
  if (paymentDetails.razorpay_signature) {
    this.razorpay_signature = paymentDetails.razorpay_signature;
  }
  return this.save();
};

// Method to mark transaction as failed
transactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.metadata = { ...this.metadata, failureReason: reason };
  return this.save();
};

// Static method to get wallet balance for a user
transactionSchema.statics.getWalletBalance = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: userId, status: 'success', type: { $in: ['credit', 'debit', 'payout'] } } },
    { $group: {
      _id: null,
      totalCredit: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
      totalDebit: { $sum: { $cond: [{ $in: ['$type', ['debit', 'payout']] }, '$amount', 0] } }
    }}
  ]);
  
  const balance = (result[0]?.totalCredit || 0) - (result[0]?.totalDebit || 0);
  return Math.max(0, balance);
};

// Static method to get earnings summary for delivery partner
transactionSchema.statics.getDeliveryEarnings = async function(userId, period = 'all') {
  let dateFilter = {};
  const now = new Date();
  
  if (period === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = { createdAt: { $gte: start } };
  } else if (period === 'week') {
    const start = new Date(now.setDate(now.getDate() - 7));
    dateFilter = { createdAt: { $gte: start } };
  } else if (period === 'month') {
    const start = new Date(now.setMonth(now.getMonth() - 1));
    dateFilter = { createdAt: { $gte: start } };
  }
  
  const result = await this.aggregate([
    { $match: { 
      user: userId, 
      status: 'success', 
      type: 'credit',
      ...dateFilter
    }},
    { $group: {
      _id: null,
      totalEarnings: { $sum: '$amount' },
      totalTips: { $sum: '$tip' },
      totalBonuses: { $sum: '$bonus' },
      count: { $sum: 1 }
    }}
  ]);
  
  return {
    totalEarnings: result[0]?.totalEarnings || 0,
    totalTips: result[0]?.totalTips || 0,
    totalBonuses: result[0]?.totalBonuses || 0,
    totalTransactions: result[0]?.count || 0
  };
};

module.exports = mongoose.model("Transaction", transactionSchema);