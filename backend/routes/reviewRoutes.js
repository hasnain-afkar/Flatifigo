const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Review = require("../models/Review");
const Listing = require("../models/Listing");
const User = require("../models/User");

// GET /api/reviews/:targetId - Get all reviews for a target
router.get("/:targetId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ targetId: req.params.targetId })
      .populate("userId", "fullName role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews - Create a review
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { targetId, targetType, rating, comment } = req.body;

    if (!targetId || !targetType || !["listing", "user"].includes(targetType)) {
      return res.status(400).json({ success: false, message: "Invalid target." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    if (targetType === "user" && targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot review yourself." });
    }

    // Check if target exists
    if (targetType === "listing") {
      const listing = await Listing.findById(targetId);
      if (!listing) return res.status(404).json({ success: false, message: "Listing not found." });
    } else {
      const user = await User.findById(targetId);
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ userId: req.user._id, targetId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this." });
    }

    await Review.create({
      userId: req.user._id,
      targetType,
      targetId,
      rating,
      comment: comment || "",
    });

    // Recalculate average rating
    const allReviews = await Review.find({ targetId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    if (targetType === "listing") {
      await Listing.findByIdAndUpdate(targetId, { avgRating: avgRating.toFixed(1), reviewCount: allReviews.length });
    } else {
      await User.findByIdAndUpdate(targetId, { avgRating: avgRating.toFixed(1), reviewCount: allReviews.length });
    }

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
