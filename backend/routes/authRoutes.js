const express = require("express");
const {
  register,
  login,
  checkSession,
  logout,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check-session", authMiddleware, checkSession);
router.post("/logout", logout);

module.exports = router;
