require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/userModel");
const connectDB = require("./config/db");

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ email: "admin@quickbite.com" });

  if (existing) {
    console.log("❌ Admin already exists");
    process.exit();
  }

  await User.create({
    name: "Admin",
    email: "admin@quickbite.com",
    password: "admin123",   // ← change this
    role: "admin",
  });

  console.log("✅ Admin created successfully");
  console.log("📧 Email: admin@quickbite.com");
  console.log("🔑 Password: admin123");
  process.exit();
};

seedAdmin();