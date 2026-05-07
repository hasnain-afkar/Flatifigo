const Listing = require("../models/Listing");

const serializeListing = (listing) => {
  const doc = listing.toObject ? listing.toObject() : listing;
  const owner = doc.ownerId && typeof doc.ownerId === "object" ? doc.ownerId : null;
  const ownerId = owner ? owner._id.toString() : doc.ownerId.toString();
  const ownerName = owner ? owner.fullName : doc.ownerName || "";

  return {
    id: doc._id.toString(),
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    rent: doc.rent,
    rooms: doc.rooms,
    city: doc.city,
    area: doc.area,
    amenities: doc.amenities || [],
    images: doc.images || [],
    contactName: doc.contactName,
    contactPhone: doc.contactPhone,
    contact_name: doc.contactName,
    contact_phone: doc.contactPhone,
    ownerId,
    owner_id: ownerId,
    ownerName,
    owner_name: ownerName,
    status: doc.status || "pending",
    verifiedBy: doc.verifiedBy ? doc.verifiedBy.toString() : null,
    verified_by: doc.verifiedBy ? doc.verifiedBy.toString() : null,
    verifiedAt: doc.verifiedAt || null,
    verified_at: doc.verifiedAt || null,
    views: doc.views || 0,
    createdAt: doc.createdAt,
    created_at: doc.createdAt,
    updatedAt: doc.updatedAt,
    updated_at: doc.updatedAt,
  };
};

const buildListingFilters = (query = {}) => {
  const filters = {};
  const parsedRooms = query.rooms ? Number(query.rooms) : null;
  const parsedMinRent = query.minRent ? Number(query.minRent) : null;
  const parsedMaxRent = query.maxRent ? Number(query.maxRent) : null;

  if (query.city) {
    filters.city = String(query.city).trim().toLowerCase();
  }

  if (Number.isFinite(parsedRooms) && parsedRooms > 0) {
    filters.rooms = parsedRooms;
  }

  if (Number.isFinite(parsedMinRent) || Number.isFinite(parsedMaxRent)) {
    filters.rent = {};
    if (Number.isFinite(parsedMinRent)) {
      filters.rent.$gte = parsedMinRent;
    }
    if (Number.isFinite(parsedMaxRent)) {
      filters.rent.$lte = parsedMaxRent;
    }
  }

  if (query.q) {
    const regex = new RegExp(String(query.q).trim(), "i");
    filters.$or = [
      { title: regex },
      { description: regex },
      { city: regex },
      { area: regex },
      { contactName: regex },
    ];
  }

  if (query.amenities) {
    const amenities = Array.isArray(query.amenities)
      ? query.amenities
      : String(query.amenities)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    if (amenities.length > 0) {
      filters.amenities = { $in: amenities };
    }
  }

  return filters;
};

const getListingsData = async (query = {}) => {
  const filters = buildListingFilters(query);
  // Only return approved listings to the public
  filters.status = "approved";
  const listings = await Listing.find(filters)
    .populate("ownerId", "fullName email role")
    .sort({ createdAt: -1 });

  return listings.map(serializeListing);
};

const getListings = async (req, res, next) => {
  try {
    const listings = await getListingsData(req.query);
    return res.json({
      success: true,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

const createListing = async (req, res, next) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only property owners can create listings.",
      });
    }

    const {
      title,
      description,
      rent,
      rooms,
      city,
      area,
      amenities = [],
      images = [],
      contactName,
      contactPhone,
    } = req.body;
    const parsedRent = Number(rent);
    const parsedRooms = Number(rooms);

    if (
      !title ||
      !description ||
      rent === undefined ||
      rooms === undefined ||
      !city ||
      !area ||
      !contactName ||
      !contactPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required listing fields.",
      });
    }

    if (!Number.isFinite(parsedRent) || parsedRent < 0) {
      return res.status(400).json({
        success: false,
        message: "Rent must be a valid positive number.",
      });
    }

    if (!Number.isFinite(parsedRooms) || parsedRooms < 1) {
      return res.status(400).json({
        success: false,
        message: "Rooms must be a valid number greater than 0.",
      });
    }

    const listing = await Listing.create({
      title: String(title).trim(),
      description: String(description).trim(),
      rent: parsedRent,
      rooms: parsedRooms,
      city: String(city).trim().toLowerCase(),
      area: String(area).trim(),
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      contactName: String(contactName).trim(),
      contactPhone: String(contactPhone).trim(),
      ownerId: req.user._id,
    });

    const populated = await listing.populate("ownerId", "fullName email role");

    return res.status(201).json({
      success: true,
      message: "Listing submitted successfully. It will be visible after admin approval.",
      listing: serializeListing(populated),
    });
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("ownerId", "fullName email role");

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    return res.json({
      success: true,
      listing: serializeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    if (listing.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing.",
      });
    }

    const fields = [
      "title",
      "description",
      "rent",
      "rooms",
      "city",
      "area",
      "amenities",
      "images",
      "contactName",
      "contactPhone",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (
      req.body.rent !== undefined &&
      (!Number.isFinite(Number(req.body.rent)) || Number(req.body.rent) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rent must be a valid positive number.",
      });
    }

    if (
      req.body.rooms !== undefined &&
      (!Number.isFinite(Number(req.body.rooms)) || Number(req.body.rooms) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rooms must be a valid number greater than 0.",
      });
    }

    if (
      req.body.status !== undefined &&
      !["available", "rented"].includes(String(req.body.status))
    ) {
      return res.status(400).json({
        success: false,
        message: "You can only set status to available or rented.",
      });
    }

    if (listing.city) {
      listing.city = String(listing.city).trim().toLowerCase();
    }

    if (req.body.rent !== undefined) {
      listing.rent = Number(req.body.rent);
    }

    if (req.body.rooms !== undefined) {
      listing.rooms = Number(req.body.rooms);
    }

    if (req.body.status !== undefined) {
      listing.status = String(req.body.status);
    }

    await listing.save();
    await listing.populate("ownerId", "fullName email role");

    return res.json({
      success: true,
      message: "Listing updated successfully.",
      listing: serializeListing(listing),
    });
  } catch (error) {
    next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    if (listing.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this listing.",
      });
    }

    await listing.deleteOne();

    return res.json({
      success: true,
      message: "Listing deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ ownerId: req.user._id })
      .populate("ownerId", "fullName email role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      listings: listings.map(serializeListing),
    });
  } catch (error) {
    next(error);
  }
};

const uploadImages = async (req, res) => {
  const filenames = (req.files || []).map((file) => file.filename);

  return res.json({
    success: true,
    message: "Images uploaded successfully.",
    filenames,
  });
};

module.exports = {
  buildListingFilters,
  getListingsData,
  serializeListing,
  getListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  uploadImages,
};
