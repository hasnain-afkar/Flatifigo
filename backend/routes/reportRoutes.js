const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Report = require("../models/Report");
const Listing = require("../models/Listing");
const User = require("../models/User");

/**
 * POST /api/reports
 * Create a new report. Authenticated users only.
 * Body: { targetType, targetId, reason, description? }
 */
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    // Validate targetType
    if (!targetType || !["listing", "user"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "targetType must be 'listing' or 'user'.",
      });
    }

    // Validate reason
    if (!reason || !["fake", "scam", "inappropriate", "other"].includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Valid reason is required (fake, scam, inappropriate, other).",
      });
    }

    // Validate targetId exists
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: "targetId is required.",
      });
    }

    // Cannot report yourself
    if (targetType === "user" && targetId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself.",
      });
    }

    // Verify target exists
    if (targetType === "listing") {
      const listing = await Listing.findById(targetId);
      if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found." });
      }
    } else {
      const user = await User.findById(targetId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
    }

    // Prevent duplicate reports
    const existing = await Report.findOne({
      reporterId: req.user._id,
      targetId,
      targetType,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already reported this ${targetType}.`,
      });
    }

    // Create report
    await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
      description: description || "",
    });

    // Auto-flag listings at threshold
    if (targetType === "listing") {
      const listing = await Listing.findById(targetId);
      if (listing) {
        listing.reportCount = (listing.reportCount || 0) + 1;
        if (listing.reportCount >= 3) {
          listing.flagged = true;
        }
        await listing.save();
      }
    }

    return res.json({
      success: true,
      message: "Report submitted successfully. Our team will review it.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
