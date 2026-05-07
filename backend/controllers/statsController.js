const Listing = require("../models/Listing");
const User = require("../models/User");

const getPlatformStats = async (_req, res, next) => {
  try {
    const [listings, users, cities] = await Promise.all([
      Listing.countDocuments(),
      User.countDocuments(),
      Listing.distinct("city"),
    ]);

    return res.json({
      success: true,
      stats: {
        listings,
        users,
        cities: cities.filter(Boolean).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
};
