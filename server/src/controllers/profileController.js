import { User } from "../models/User.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { ClubProfile } from "../models/ClubProfile.js";
import { Interest } from "../models/Interest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RecommendationCache } from "../models/RecommendationCache.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = req.user.role === "student" ? await StudentProfile.findOne({ user: req.user._id }) : await ClubProfile.findOne({ user: req.user._id });
  res.json({ user: req.user, profile });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const { name, interests, ...profileFields } = req.body;
  if (name) await User.findByIdAndUpdate(req.user._id, { name });
  if (interests) {
    profileFields.interests = [...new Set(interests.map((item) => item.toLowerCase().trim()))];
    await Interest.bulkWrite(profileFields.interests.map((interest) => ({ updateOne: { filter: { name: interest }, update: { $setOnInsert: { name: interest } }, upsert: true } })));
  }
  const profile = await StudentProfile.findOneAndUpdate({ user: req.user._id }, profileFields, { new: true });
  await RecommendationCache.deleteOne({
  student: req.user._id
  });
  const user = await User.findById(req.user._id).select("-password");
  res.json({ user, profile });
});

export const updateClubProfile = asyncHandler(async (req, res) => {
  const { name, ...profileFields } = req.body;
  if (name) await User.findByIdAndUpdate(req.user._id, { name });
  const profile = await ClubProfile.findOneAndUpdate({ user: req.user._id }, profileFields, { new: true });
  const user = await User.findById(req.user._id).select("-password");
  res.json({ user, profile });
});
