const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
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
} = require("../controllers/adminController");

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get("/stats", getAdminStats);

// Pending Listings
router.get("/listings", getPendingListings);
router.patch("/listings/:id/approve", approveListing);
router.patch("/listings/:id/reject", rejectListing);

// User Management
router.get("/users", getAllUsers);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);

// Reports
router.get("/reports", getAllReports);
router.patch("/reports/:id/resolve", resolveReport);

// Flagged Listings
router.get("/flagged", getFlaggedListings);
router.delete("/flagged/:id", deleteFlaggedListing);

module.exports = router;
