import express from "express";
import { clubStats, createEvent, deleteEvent, eventRegistrants, getEvent, listEvents, listMyClubEvents, updateEvent, exportRegistrants, markAttendance, eventAnalytics } from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/", listEvents);
router.get("/club/stats", protect, authorize("club_admin", "super_admin"), clubStats);
router.get("/club/mine", protect, authorize("club_admin"), listMyClubEvents);
router.get("/:id", protect, getEvent);
router.post("/", protect, authorize("club_admin"), upload.single("poster"), createEvent);
router.put("/:id", protect, authorize("club_admin", "super_admin"), upload.single("poster"), updateEvent);
router.delete("/:id", protect, authorize("club_admin", "super_admin"), deleteEvent);
router.get("/:id/registrants", protect, authorize("club_admin", "super_admin"), eventRegistrants);
router.get(
  "/:id/analytics",
  protect,
  authorize("club_admin", "super_admin"),
  eventAnalytics
);

router.patch(
  "/:eventId/attendance/:studentId",
  protect,
  authorize("club_admin", "super_admin"),
  markAttendance
);
router.get(
  "/:id/export",
  protect,
  authorize("club_admin", "super_admin"),
  exportRegistrants
);

export default router;
