import { User } from "../models/User.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { ClubProfile } from "../models/ClubProfile.js";
import { VerificationRequest } from "../models/VerificationRequest.js";
import { Interest } from "../models/Interest.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

const authResponse = async (user) => {
  const safeUser = await User.findById(user._id).select("-password");
  return { token: signToken(user), user: safeUser };
};

export const signupStudent = asyncHandler(async (req, res) => {
  const { name, email, password, rollNumber, department, year, phoneNumber, interests } = req.body;

  const existingRoll = await StudentProfile.findOne({
  rollNumber: rollNumber.trim().toUpperCase()
  });

  if (existingRoll) {
  throw new ApiError(400, "Roll number already registered");
  }
  const user = await User.create({ name, email, password, role: "student" });
  const cleanInterests = [...new Set((interests || []).map((item) => item.toLowerCase().trim()))];
  await StudentProfile.create({ user: user._id, rollNumber, department, year, phoneNumber, interests: cleanInterests });
  await VerificationRequest.create({ student: user._id, rollNumber, department, year });
  await Interest.bulkWrite(cleanInterests.map((name) => ({ updateOne: { filter: { name }, update: { $setOnInsert: { name } }, upsert: true } })));
  res.status(201).json(await authResponse(user));
});

export const signupClub = asyncHandler(async (req, res) => {
  const { name, email, password, clubName, category, description, contactEmail } = req.body;
  const existingClub = await ClubProfile.findOne({
    clubName: clubName.trim()
  });

  if (existingClub) {
    throw new ApiError(400, "Club name already exists");
  }

  const user = await User.create({ name, email, password, role: "club_admin" });
  await ClubProfile.create({ user: user._id, clubName, category, description, contactEmail });
  res.status(201).json(await authResponse(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid email or password");
  if (role && user.role !== role) throw new ApiError(403, "This login page is not enabled for your role");
  user.lastLoginAt = new Date();
  await user.save();
  res.json(await authResponse(user));
});

export const me = asyncHandler(async (req, res) => {
  const profile =
    req.user.role === "student"
      ? await StudentProfile.findOne({ user: req.user._id })
      : req.user.role === "club_admin"
        ? await ClubProfile.findOne({ user: req.user._id })
        : null;
  res.json({ user: req.user, profile });
});
