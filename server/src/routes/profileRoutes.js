import express from "express";
import { getProfile, updateClubProfile, updateStudentProfile } from "../controllers/profileController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { updateClubProfileSchema, updateStudentProfileSchema } from "../validators/profileValidators.js";

const router = express.Router();
router.get("/me", protect, getProfile);
router.put("/student", protect, authorize("student"), validate(updateStudentProfileSchema), updateStudentProfile);
router.put("/club", protect, authorize("club_admin"), validate(updateClubProfileSchema), updateClubProfile);
export default router;
