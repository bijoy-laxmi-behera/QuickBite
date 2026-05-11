// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    console.log(`Authorize check - User role: ${userRole}, Allowed roles: ${roles}`);
    
    // Normalize role comparison - allow both "delivery" and "deliveryPartner"
    const hasRole = roles.some(role => {
      if (role === "deliveryPartner" && userRole === "delivery") return true;
      if (role === "delivery" && userRole === "deliveryPartner") return true;
      if (role === "delivery" && userRole === "deliveryagent") return true;
      if (role === "deliveryPartner" && userRole === "deliveryagent") return true;
      if (role === "deliveryagent" && (userRole === "delivery" || userRole === "deliveryPartner")) return true;
      return role === userRole;
    });
    
    if (!hasRole) {
      console.log(`Authorization failed: ${userRole} not in [${roles}]`);
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: ${userRole} does not have access to this resource` 
      });
    }
    
    console.log(`Authorization successful for role: ${userRole}`);
    next();
  };
};

// Add this - convenience wrapper for admin-only routes
const adminAuth = authorize("admin");

// Add this - convenience wrapper for vendor-only routes
const vendorAuth = authorize("vendor", "admin");

// Add this - convenience wrapper for delivery-only routes
const deliveryAuth = authorize("delivery", "deliveryPartner", "deliveryagent", "admin");

module.exports = { protect, authorize, adminAuth, vendorAuth, deliveryAuth };