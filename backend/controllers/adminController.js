const Listing = require("../models/Listing");
const User = require("../models/User");
const Report = require("../models/Report");
const { serializeListing } = require("./listingController");

/* ══════════════════════════════════════════
   DASHBOARD STATS
   ══════════════════════════════════════════ */

const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalListings, pendingListings, totalReports, flaggedListings] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "admin" } }),
        Listing.countDocuments(),
        Listing.countDocuments({ status: "pending" }),
        Report.countDocuments({ status: "pending" }),
        Listing.countDocuments({ flagged: true }),
      ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        pendingListings,
        totalReports,
        flaggedListings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════
   PENDING LISTINGS (existing)
   ══════════════════════════════════════════ */

const getPendingListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: "pending" })
      .populate("ownerId", "fullName email role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      listings: listings.map(serializeListing),
    });
  } catch (error) {
    next(error);
  }
};

const approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    listing.status = "approved";
    listing.verifiedBy = req.user._id;
    listing.verifiedAt = new Date();
    await listing.save();
    await listing.populate("ownerId", "fullName email role");

    return res.json({
      success: true,
      message: "Listing approved successfully.",
      listing: serializeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};

const rejectListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    listing.status = "rejected";
    listing.verifiedBy = req.user._id;
    listing.verifiedAt = new Date();
    await listing.save();
    await listing.populate("ownerId", "fullName email role");

    return res.json({
      success: true,
      message: "Listing rejected.",
      listing: serializeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════
   USER MANAGEMENT
   ══════════════════════════════════════════ */

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        status: u.status || "active",
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.role === "admin") {
      return res.status(400).json({ success: false, message: "Cannot block an admin." });
    }

    user.status = "blocked";
    await user.save();

    return res.json({
      success: true,
      message: `User ${user.fullName} has been blocked.`,
    });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.status = "active";
    await user.save();

    return res.json({
      success: true,
      message: `User ${user.fullName} has been unblocked.`,
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════
   REPORTS
   ══════════════════════════════════════════ */

const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "fullName email")
      .populate("resolvedBy", "fullName")
      .sort({ createdAt: -1 });

    // For listing reports, populate listing title
    const enriched = [];
    for (const report of reports) {
      const obj = report.toObject();
      obj.id = obj._id.toString();
      if (obj.targetType === "listing") {
        const listing = await Listing.findById(obj.targetId).select("title");
        obj.targetName = listing ? listing.title : "Deleted Listing";
      } else {
        const user = await User.findById(obj.targetId).select("fullName");
        obj.targetName = user ? user.fullName : "Deleted User";
      }
      enriched.push(obj);
    }

    return res.json({ success: true, reports: enriched });
  } catch (error) {
    next(error);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }

    report.status = "resolved";
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    return res.json({
      success: true,
      message: "Report marked as resolved.",
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════
   FLAGGED LISTINGS
   ══════════════════════════════════════════ */

const getFlaggedListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ flagged: true })
      .populate("ownerId", "fullName email role")
      .sort({ reportCount: -1 });

    return res.json({
      success: true,
      listings: listings.map((l) => ({
        ...serializeListing(l),
        reportCount: l.reportCount || 0,
        flagged: l.flagged || false,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const deleteFlaggedListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found." });
    }

    await Listing.findByIdAndDelete(req.params.id);
    // Also resolve all related reports
    await Report.updateMany(
      { targetId: req.params.id, targetType: "listing", status: "pending" },
      { status: "resolved", resolvedBy: req.user._id, resolvedAt: new Date() }
    );

    return res.json({
      success: true,
      message: "Flagged listing has been permanently deleted.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getPendingListings,
  approveListing,
  rejectListing,
  getAllUsers,
  blockUser,
  unblockUser,
  getAllReports,
  resolveReport,
  getFlaggedListings,
  deleteFlaggedListing,
};
