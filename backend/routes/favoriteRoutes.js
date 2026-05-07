const express = require("express");
const {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:listingId", addFavorite);
router.delete("/:listingId", removeFavorite);

module.exports = router;
