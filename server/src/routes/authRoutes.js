import express from "express";
import { login, me, signupClub, signupStudent } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { clubSignupSchema, loginSchema, studentSignupSchema } from "../validators/authValidators.js";

const router = express.Router();
router.post("/student/signup", validate(studentSignupSchema), signupStudent);
router.post("/club/signup", validate(clubSignupSchema), signupClub);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);
export default router;
