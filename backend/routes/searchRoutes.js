const express = require("express");
const { searchListings } = require("../controllers/searchController");

const router = express.Router();

router.get("/", searchListings);
router.get("/listings", searchListings);

module.exports = router;
