const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    },
    totalTips: {
      type: Number,
      default: 0
    },
    totalBonuses: {
      type: Number,
      default: 0
    },
    lastTransactionAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Method to add earnings
walletSchema.methods.addEarnings = async function(amount, tip = 0, bonus = 0, orderId = null) {
  const totalAmount = amount + tip + bonus;
  this.balance += totalAmount;
  this.totalEarned += totalAmount;
  this.totalTips += tip;
  this.totalBonuses += bonus;
  this.lastTransactionAt = new Date();
  await this.save();
  
  return true;
};

// Method to deduct amount (for withdrawal)
walletSchema.methods.deductAmount = async function(amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  this.pendingBalance += amount;
  this.lastTransactionAt = new Date();
  await this.save();
  
  return true;
};

// Method to confirm withdrawal
walletSchema.methods.confirmWithdrawal = async function(amount) {
  this.pendingBalance -= amount;
  this.totalWithdrawn += amount;
  await this.save();
  
  return true;
};

// Method to reverse withdrawal (on cancellation)
walletSchema.methods.reverseWithdrawal = async function(amount) {
  this.balance += amount;
  this.pendingBalance -= amount;
  await this.save();
  
  return true;
};

module.exports = mongoose.model("Wallet", walletSchema);