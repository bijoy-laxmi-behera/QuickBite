const express = require("express");
const router = express.Router();
const upload=require("../middleware/upload");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getAllRestaurants } = require("../controllers/adminController");
router.get("/restaurants",protect,authorize("admin"),getAllRestaurants)
module.exports = router;