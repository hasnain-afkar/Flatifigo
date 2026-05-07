const express = require("express");
const {
  getListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} = require("../controllers/listingController");
const authMiddleware = require("../middleware/authMiddleware");

const Report = require("../models/Report");
const Listing = require("../models/Listing");

const router = express.Router();

router.get("/", getListings);
router.get("/me", authMiddleware, getMyListings);
router.post("/", authMiddleware, createListing);
router.get("/:id", getListingById);
router.put("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

// Report a listing (user-facing)
router.post("/:id/report", authMiddleware, async (req, res, next) => {
  try {
    const { reason, description } = req.body;
    if (!reason || !["fake", "scam", "inappropriate", "other"].includes(reason)) {
      return res.status(400).json({
        success: false,
        message: "Valid reason is required (fake, scam, inappropriate, other).",
      });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    // Prevent duplicate reports from same user
    const existing = await Report.findOne({
      reporterId: req.user._id,
      targetId: req.params.id,
      targetType: "listing",
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this listing.",
      });
    }

    await Report.create({
      reporterId: req.user._id,
      targetType: "listing",
      targetId: req.params.id,
      reason,
      description: description || "",
    });

    // Increment report count and auto-flag at threshold
    listing.reportCount = (listing.reportCount || 0) + 1;
    if (listing.reportCount >= 3) {
      listing.flagged = true;
    }
    await listing.save();

    return res.json({
      success: true,
      message: "Report submitted successfully. Our team will review it.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
