const express = require("express");
const router = express.Router();
const { getRoommates } = require("../controllers/roommateController");
const authMiddleware = require("../middleware/authMiddleware");

const requireRoommateUser = (req, res, next) => {
  if (!["user", "student", "jobholder"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Roommate matching is available only for students and jobholders.",
    });
  }
  next();
};

router.get("/", authMiddleware, requireRoommateUser, getRoommates);

module.exports = router;
