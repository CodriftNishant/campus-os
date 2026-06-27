import express from "express";
import { getMyVerification, listVerificationRequests, requestVerification, reviewVerification } from "../controllers/verificationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/me", protect, authorize("student"), getMyVerification);
router.post("/request", protect, authorize("student"), requestVerification);
router.get("/requests", protect, authorize("super_admin"), listVerificationRequests);
router.patch("/requests/:id", protect, authorize("super_admin"), reviewVerification);
export default router;
