const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Name should contain only letters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["customer", "vendor", "delivery", "admin"],
      default: "customer",
    },

    resetOTP: String,
    otpExpire: Date,

    restaurantName: String,
    cuisine: String,
    address: String,
    logo: String,

    isOpen: {
      type: Boolean,
      default: true,
    },

    deliverySettings: {
      radius: Number,
      minOrder: Number,
      avgPrepTime: Number,
    },

    bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
      accountHolderName: String,
    },

    operatingHours: {
      monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
      sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    },
  },
  { timestamps: true }
);


// 🔐 PASSWORD HASHING (FIXED — no next())
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// 🔑 PASSWORD COMPARE
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);