const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// ----------------------
// TOKEN GENERATOR
// ----------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ----------------------
// REGISTER
// ----------------------
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    // 🔐 SAFE EMAIL (WILL NOT CRASH APP)
    try {
      await sendEmail(
        email,
        "Welcome to QuickBite 🍔",
        `<h2>Hey ${name}! 👋</h2>
         <p>Your account has been successfully created.</p>`
      );
    } catch (emailError) {
      console.error("❌ Email failed:", emailError);
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    // 🔥 SHOW FULL ERROR (VERY IMPORTANT)
    console.error("🔥 REGISTER ERROR FULL:", error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------
// LOGIN
// ----------------------
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("🔥 LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------
// FORGOT PASSWORD
// ----------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    try {
      await sendEmail(
        email,
        "Password Reset OTP",
        `<h3>Your OTP is: ${otp}</h3>`
      );
    } catch (emailError) {
      console.error("❌ Email failed:", emailError);
    }

    res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("🔥 FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------
// RESET PASSWORD
// ----------------------
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      email,
      resetOTP: otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetOTP = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("🔥 RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ----------------------
// CHANGE PASSWORD
// ----------------------
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("🔥 CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};