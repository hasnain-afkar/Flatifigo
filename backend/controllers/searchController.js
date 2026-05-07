const { getListingsData } = require("./listingController");

const searchListings = async (req, res, next) => {
  try {
    const listings = await getListingsData(req.query);
    return res.json({
      success: true,
      listings,
      filters: req.query,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchListings,
};
