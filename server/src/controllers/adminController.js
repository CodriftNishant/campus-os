import { User } from "../models/User.js";
import { ClubProfile } from "../models/ClubProfile.js";
import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RecommendationCache } from "../models/RecommendationCache.js";

export const analytics = asyncHandler(async (_req, res) => {
  const [users, students, clubs, activeEvents, archivedEvents, registrations] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "club_admin" }),
    Event.countDocuments({ status: "active", deadline: { $gt: new Date() } }),
    Event.countDocuments({ status: "archived" }),
    EventRegistration.countDocuments({ status: "registered" })
  ]);
  res.json({ users, students, clubs, activeEvents, archivedEvents, registrations });
});

export const listClubs = asyncHandler(async (_req, res) => {
  const clubs = await ClubProfile.find().populate("user", "name email isActive").sort({ createdAt: -1 });
  res.json(clubs);
});

export const listAllEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res.json(events);
});

export const approveClub = asyncHandler(async (req, res) => {
  const club = await ClubProfile.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved !== false }, { new: true });
  res.json(club);
});

export const moderateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      archiveReason:
        req.body.archiveReason || "Moderated by super admin"
    },
    { new: true }
  );

  await RecommendationCache.deleteMany({});

  res.json(event);
});