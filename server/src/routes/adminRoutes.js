import express from "express";
import { analytics, approveClub, listAllEvents, listClubs, moderateEvent } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("super_admin"));
router.get("/analytics", analytics);
router.get("/clubs", listClubs);
router.get("/events", listAllEvents);
router.patch("/clubs/:id", approveClub);
router.patch("/events/:id/moderate", moderateEvent);
export default router;
