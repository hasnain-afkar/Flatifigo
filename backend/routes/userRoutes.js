const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../models/Profile");

// GET /api/users/:id — Public user profile (for messaging, etc.)
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const profile = await Profile.findOne({ userId: user._id });

    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        full_name: user.fullName,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: profile ? profile.avatar : "",
        occupation: profile ? profile.occupation : "",
        bio: profile ? profile.bio : "",
        preferredCity: profile ? profile.preferredCity : "",
        preferredArea: profile ? profile.preferredArea : "",
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
