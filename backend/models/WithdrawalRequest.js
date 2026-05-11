const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 50
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["bank", "upi"],
      required: true
    },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      accountHolderName: String,
      bankName: String
    },
    upiId: String,
    transactionId: String,
    processedAt: Date,
    failureReason: String,
    remarks: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Indexes
withdrawalRequestSchema.index({ user: 1, status: 1 });
withdrawalRequestSchema.index({ createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: 1 });

// Virtual for formatted amount
withdrawalRequestSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Method to mark as processing
withdrawalRequestSchema.methods.markProcessing = function() {
  this.status = 'processing';
  return this.save();
};

// Method to mark as completed
withdrawalRequestSchema.methods.markCompleted = function(transactionId) {
  this.status = 'completed';
  this.transactionId = transactionId;
  this.processedAt = new Date();
  return this.save();
};

// Method to mark as failed
withdrawalRequestSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  return this.save();
};

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);