const fs = require("fs");
const path = require("path");
const Profile = require("../models/Profile");

const uploadsDir = path.join(__dirname, "..", "uploads");

const serializeProfile = (profile) => {
  const doc = profile.toObject ? profile.toObject() : profile;
  const budgetMin = doc.budgetMin || 0;
  const budgetMax = doc.budgetMax || 0;

  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    user_id: doc.userId.toString(),
    occupation: doc.occupation || "",
    budget: doc.budget || 0,
    budgetMin,
    budgetMax,
    budget_min: budgetMin,
    budget_max: budgetMax,
    lifestyle: doc.lifestyle || "",
    bio: doc.bio || "",
    preferredCity: doc.preferredCity || "",
    preferredArea: doc.preferredArea || "",
    preferred_city: doc.preferredCity || "",
    preferred_area: doc.preferredArea || "",
    genderPreference: doc.genderPreference || "",
    gender_preference: doc.genderPreference || "",
    schedule: doc.schedule || "",
    avatar: doc.avatar || "",
    lookingForRoommate: doc.lookingForRoommate ?? true,
    looking_for_roommate: doc.lookingForRoommate ?? true,
    updatedAt: doc.updatedAt,
    updated_at: doc.updatedAt,
  };
};

const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = await Profile.create({ userId });
  }
  return profile;
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id);
    return res.json({
      success: true,
      profile: serializeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id);

    const occupation = req.body.occupation ?? profile.occupation;
    const lifestyle = req.body.lifestyle ?? profile.lifestyle;
    const bio = req.body.bio ?? profile.bio;
    const preferredCity =
      req.body.preferredCity ?? req.body.preferred_city ?? profile.preferredCity;
    const preferredArea =
      req.body.preferredArea ?? req.body.preferred_area ?? profile.preferredArea;
    const genderPreference =
      req.body.genderPreference ??
      req.body.gender_preference ??
      profile.genderPreference;
    const schedule = req.body.schedule ?? profile.schedule;
    const lookingForRoommate = req.body.lookingForRoommate ?? req.body.looking_for_roommate ?? profile.lookingForRoommate ?? true;

    const parsedBudget =
      req.body.budget !== undefined && req.body.budget !== ""
        ? Number(req.body.budget)
        : profile.budget;
    const parsedBudgetMin =
      req.body.budgetMin !== undefined && req.body.budgetMin !== ""
        ? Number(req.body.budgetMin)
        : req.body.budget_min !== undefined && req.body.budget_min !== ""
          ? Number(req.body.budget_min)
          : profile.budgetMin;
    const parsedBudgetMax =
      req.body.budgetMax !== undefined && req.body.budgetMax !== ""
        ? Number(req.body.budgetMax)
        : req.body.budget_max !== undefined && req.body.budget_max !== ""
          ? Number(req.body.budget_max)
          : profile.budgetMax;

    if (
      [parsedBudget, parsedBudgetMin, parsedBudgetMax].some(
        (value) => Number.isNaN(value) || value < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Budget values must be valid positive numbers.",
      });
    }

    profile.occupation = String(occupation || "").trim();
    profile.lifestyle = String(lifestyle || "").trim();
    profile.bio = String(bio || "").trim();
    profile.preferredCity = String(preferredCity || "").trim();
    profile.preferredArea = String(preferredArea || "").trim();
    profile.genderPreference = String(genderPreference || "").trim();
    profile.schedule = String(schedule || "").trim();
    profile.budget = parsedBudget || parsedBudgetMax || parsedBudgetMin || 0;
    profile.budgetMin = parsedBudgetMin || 0;
    profile.budgetMax = parsedBudgetMax || 0;
    profile.lookingForRoommate = Boolean(lookingForRoommate);

    await profile.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: serializeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file.",
      });
    }

    const profile = await getOrCreateProfile(req.user._id);

    if (profile.avatar) {
      const oldPath = path.join(uploadsDir, profile.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    profile.avatar = req.file.filename;
    await profile.save();

    return res.json({
      success: true,
      message: "Avatar uploaded successfully.",
      filename: req.file.filename,
      profile: serializeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAvatar = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id);

    if (profile.avatar) {
      const oldPath = path.join(uploadsDir, profile.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    profile.avatar = "";
    await profile.save();

    return res.json({
      success: true,
      message: "Avatar removed successfully.",
      profile: serializeProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  serializeProfile,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
};
