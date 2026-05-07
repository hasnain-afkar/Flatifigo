const Favorite = require("../models/Favorite");
const Listing = require("../models/Listing");
const { serializeListing } = require("./listingController");

const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: "listingId",
        populate: { path: "ownerId", select: "fullName email role" },
      })
      .sort({ createdAt: -1 });

    const listings = favorites
      .map((favorite) => favorite.listingId)
      .filter(Boolean)
      .map(serializeListing);

    return res.json({
      success: true,
      listings,
      favorites: listings,
    });
  } catch (error) {
    next(error);
  }
};

const getFavoriteIds = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).select("listingId");
    return res.json({
      success: true,
      ids: favorites.map((favorite) => favorite.listingId.toString()),
    });
  } catch (error) {
    next(error);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    await Favorite.updateOne(
      { userId: req.user._id, listingId: listing._id },
      { $setOnInsert: { userId: req.user._id, listingId: listing._id } },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: "Added to favorites.",
    });
  } catch (error) {
    next(error);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await Favorite.deleteOne({
      userId: req.user._id,
      listingId: req.params.listingId,
    });

    return res.json({
      success: true,
      message: "Removed from favorites.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
};
