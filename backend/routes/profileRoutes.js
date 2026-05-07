const express = require("express");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.delete("/avatar", authMiddleware, deleteAvatar);

module.exports = router;
