const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/ownerController");

router.use(authMiddleware);
router.get("/stats", getStats);

module.exports = router;
