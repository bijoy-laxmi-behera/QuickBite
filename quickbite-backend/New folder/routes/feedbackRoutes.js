const express = require("express");
const router = express.Router();

router.get("/testimonials", (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: "1",
        name: "Nitish",
        role: "Customer",
        review: "Amazing food!",
        rating: 5,
        image: "https://i.pravatar.cc/100"
      }
    ]
  });
});

module.exports = router;