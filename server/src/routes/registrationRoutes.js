import express from "express";
import { myRegistrations, registerForEvent, unregisterFromEvent } from "../controllers/registrationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/me", protect, authorize("student"), myRegistrations);
router.post("/:eventId", protect, authorize("student"), registerForEvent);
router.delete("/:eventId", protect, authorize("student"), unregisterFromEvent);
export default router;
