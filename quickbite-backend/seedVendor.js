require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const connectDB = require("./config/db");

const seedVendor = async () => {
  await connectDB();

  // Force delete if exists
  await User.deleteOne({ email: "vendor@quickbite.com" });
  console.log("🗑️ Old vendor deleted");

  // Manually hash password
  const hashedPassword = await bcrypt.hash("vendor123", 12);

  // Insert directly to bypass any hook issues
  await User.collection.insertOne({
    name: "Test Vendor",
    email: "vendor@quickbite.com",
    password: hashedPassword,
    role: "vendor",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Vendor created with hashed password");
  console.log("📧 Email: vendor@quickbite.com");
  console.log("🔑 Password: vendor123");
  process.exit();
};

seedVendor();