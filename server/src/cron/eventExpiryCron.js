import cron from "node-cron";
import { Event } from "../models/Event.js";

export const archiveExpiredEvents = async () => {
  const result = await Event.updateMany(
    { status: "active", deadline: { $lte: new Date() } },
    { status: "archived", archiveReason: "Registration deadline expired" }
  );
  if (result.modifiedCount) console.log(`Archived ${result.modifiedCount} expired events`);
  return result;
};

export const startEventExpiryCron = () => {
  cron.schedule("*/15 * * * *", archiveExpiredEvents, { timezone: "Asia/Kolkata" });
  archiveExpiredEvents();
};
