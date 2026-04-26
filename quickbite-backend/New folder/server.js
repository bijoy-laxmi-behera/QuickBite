require("dotenv").config();   // FIRST LINE

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes=require("./routes/adminRoutes");
const app = express();

connectDB();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin",adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.get("/", (req, res) => {
  res.send("QuickBite API Running...");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});