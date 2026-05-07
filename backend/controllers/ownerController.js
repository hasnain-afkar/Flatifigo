const Listing = require("../models/Listing");
const Message = require("../models/Message");

const getStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Default stats
    let totalViews = 0;
    let totalListings = 0;
    let activeListings = 0;
    let rentedListings = 0;

    const listings = await Listing.find({ ownerId });
    
    totalListings = listings.length;
    for (const l of listings) {
      totalViews += l.views || 0;
      if (l.status === "available") activeListings++;
      if (l.status === "rented") rentedListings++;
    }

    const unreadMessages = await Message.countDocuments({
      receiverId: ownerId,
      isRead: false
    });

    return res.json({
      success: true,
      stats: {
        totalViews,
        totalListings,
        activeListings,
        rentedListings,
        unreadMessages
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
