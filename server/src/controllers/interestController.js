import { Interest } from "../models/Interest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listInterests = asyncHandler(async (_req, res) => {
  const interests = await Interest.find().sort({ name: 1 });
  res.json(interests);
});
