const express = require("express");
const Feedback = require("../models/Feedback");

const router = express.Router();

/* ==============================
   POST - Add New Feedback
================================ */
router.post("/", async (req, res) => {
  try {
    const { name, role, rating, review, image } = req.body;

    // Basic validation
    if (!name || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Name, rating and review are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const feedback = await Feedback.create({
      name,
      role,
      rating,
      review,
      image,
      isApproved: false, // default moderation
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. Waiting for approval.",
      data: feedback,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* ==============================
   GET - Random Approved Testimonials
================================ */
router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await Feedback.aggregate([
      { $match: { isApproved: true } },
      { $sample: { size: 3 } },
    ]);

    res.status(200).json({
      success: true,
      data: testimonials,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
    });
  }
});

module.exports = router;