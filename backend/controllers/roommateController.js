const User = require("../models/User");
const Profile = require("../models/Profile");
const { serializeProfile } = require("./profileController");

const getRoommates = async (req, res, next) => {
  try {
    const loggedInUserId = req.user ? req.user._id : null;
    
    // Fetch logged in user's profile to compare
    let myProfile = null;
    if (loggedInUserId) {
      myProfile = await Profile.findOne({ userId: loggedInUserId });
    }

    // Find only normal users who can participate in roommate matching.
    const seekers = await User.find({ role: { $in: ["user", "student", "jobholder"] } });
    const seekerIds = seekers.map(s => s._id);

    // Find profiles for these seekers where lookingForRoommate is true
    const profiles = await Profile.find({
      userId: { $in: seekerIds },
      lookingForRoommate: true,
    }).populate("userId", "fullName role");

    let roommates = profiles.map(p => {
      const pObj = serializeProfile(p);
      const user = p.userId;
      
      return {
        ...pObj,
        id: user._id.toString(),
        full_name: user.fullName || "Unknown",
        role: user.role,
        match_score: 0
      };
    }).filter(r => r.id !== (loggedInUserId ? loggedInUserId.toString() : ""));

    // Calculate match scores
    roommates = roommates.map(d => {
      let match_score = 0;
      if (myProfile) {
        let score = 0;
        let maxScore = 0;

        const evaluateMatch = (weight, condition) => {
          maxScore += weight;
          if (condition) score += weight;
        };

        const matchField = (field, weight) => {
           if (myProfile[field] && d[field]) {
             evaluateMatch(weight, myProfile[field].toString().toLowerCase().trim() === d[field].toString().toLowerCase().trim());
           }
        };

        matchField('preferredCity', 30);
        matchField('preferredArea', 20);
        matchField('lifestyle', 25);
        matchField('schedule', 25);
        
        // Handle gender preference logic (if specified, it's a strict preference, but we treat it as high weight)
        if (myProfile.genderPreference && d.genderPreference) {
             evaluateMatch(40, myProfile.genderPreference.toLowerCase() === d.genderPreference.toLowerCase());
        }

        // Budget overlap logic
        if (myProfile.budgetMax && d.budgetMax) {
          maxScore += 30;
          const overlapMin = Math.max(myProfile.budgetMin || 0, d.budgetMin || 0);
          const overlapMax = Math.min(myProfile.budgetMax, d.budgetMax);
          if (overlapMax >= overlapMin) {
            // Overlapping budgets
            const overlapRange = overlapMax - overlapMin;
            const myRange = (myProfile.budgetMax - (myProfile.budgetMin || 0)) || 1;
            const overlapPercent = Math.min(overlapRange / myRange, 1);
            // 50% points just for overlapping, rest based on how much it overlaps
            score += Math.round(30 * (0.5 + 0.5 * overlapPercent));
          }
        }

        // Final score is a percentage of the total possible score based on provided fields
        match_score = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      }
      return { ...d, match_score };
    });

    // Sort by match_score desc
    roommates.sort((a, b) => b.match_score - a.match_score);

    return res.json({
      success: true,
      roommates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoommates,
};
