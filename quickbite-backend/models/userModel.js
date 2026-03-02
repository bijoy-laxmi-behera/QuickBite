const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,   // This already creates index
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "vendor", "delivery"],
      default: "customer",
    },

    resetOTP: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);



// ================= PASSWORD HASHING =================
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});



// ================= PASSWORD COMPARISON =================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};



module.exports = mongoose.model("User", userSchema);