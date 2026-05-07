const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    occupation: {
      type: String,
      default: "",
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    budgetMin: {
      type: Number,
      default: 0,
      min: 0,
    },
    budgetMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifestyle: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    preferredCity: {
      type: String,
      default: "",
      trim: true,
    },
    preferredArea: {
      type: String,
      default: "",
      trim: true,
    },
    genderPreference: {
      type: String,
      default: "",
      trim: true,
    },
    schedule: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    lookingForRoommate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
