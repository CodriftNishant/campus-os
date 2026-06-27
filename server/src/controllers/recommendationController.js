import { asyncHandler } from "../utils/asyncHandler.js";
import { getRecommendationsForStudent } from "../services/recommendationService.js";

export const getMyRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await getRecommendationsForStudent(req.user._id);
  res.json(recommendations);
});
