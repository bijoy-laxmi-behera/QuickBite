const User = require("../models/userModel");
const Restaurant = require("../models/Restaurant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { otpTemplate } = require("../utils/emailTemplates");

// REGISTER
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      vehicle,
      licensePlate,
      restaurantName,
      restaurantType,
      cuisine,
      address,
      city,
      pincode,
      description,
      deliveryTime,
      minOrder,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const emailLower = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userData = {
      name,
      email: emailLower,
      password: hashedPassword,
      role: role || "customer",
      phone: phone || "",
    };

    if (role === "delivery") {
      userData.vehicle = vehicle || "";
      userData.licensePlate = licensePlate || "";
    }

    if (role === "vendor") {
      userData.restaurantName = restaurantName || "";
      userData.cuisine = cuisine || "";
      userData.address = address || "";
      userData.isOpen = true;
    }

    const user = await User.create(userData);
    console.log(`✅ User created: ${user.email} with role: ${user.role}`);

    let restaurant = null;
    if (role === "vendor" && restaurantName) {
      try {
        const cuisineArray = cuisine ? cuisine.split(",").map(c => c.trim()) : [];

        restaurant = await Restaurant.create({
          name: restaurantName,
          type: restaurantType || "Restaurant",
          cuisine: cuisineArray,
          rating: 0,
          reviewCount: 0,
          deliveryTime: parseInt(deliveryTime) || 30,
          minOrder: parseInt(minOrder) || 199,
          description: description || "",
          phone: phone || "",
          isOpen: true,
          isApproved: false,
          owner: user._id,
          address: {
            street: address || "",
            city: city || "",
            pincode: pincode || "",
            state: "",
          },
          location: {
            type: "Point",
            coordinates: [0, 0],
            city: city || "",
            area: address?.split(",")[0] || "",
            pincode: pincode || "",
          },
        });

        console.log(`✅ Restaurant created for vendor ${name}: ${restaurantName}`);
      } catch (restaurantError) {
        console.error("Error creating restaurant:", restaurantError);
      }
    }

    res.status(201).json({
      success: true,
      message: role === "vendor" && restaurant
        ? "User registered successfully! Your restaurant has been created and is pending admin approval."
        : "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...(restaurant && { restaurant: { _id: restaurant._id, name: restaurant.name } })
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check for vendor approval
    if (user.role === "vendor") {
      const restaurant = await Restaurant.findOne({ owner: user._id });
      if (restaurant && !restaurant.isApproved) {
        return res.status(403).json({
          message: "Your restaurant is pending admin approval. You will be notified once approved."
        });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      accessToken: token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REFRESH ACCESS TOKEN
const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendEmail(
      email,
      "Password Reset OTP",
      otpTemplate(otp)
    );
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log("DB OTP:", user.resetOTP, "| Input:", otp.trim(), "| Match:", user.resetOTP === otp.trim());
    if (!user.resetOTP || user.resetOTP !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }
    user.password  = await bcrypt.hash(newPassword, 10);
    user.resetOTP  = undefined;
    user.otpExpire = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: error.message });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshtoken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.json({ message: "Logout done" });
  }
};

// GET ME
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getMe
};