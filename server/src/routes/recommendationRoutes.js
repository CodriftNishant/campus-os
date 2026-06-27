import express from "express";
import { getMyRecommendations } from "../controllers/recommendationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/me", protect, authorize("student"), getMyRecommendations);
export default router;
