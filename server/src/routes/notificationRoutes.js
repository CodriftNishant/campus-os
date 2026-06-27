import express from "express";
import {listNotifications,markNotificationRead,markAllNotificationsRead} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, listNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.patch(
  "/mark-all-read",
  protect,
  markAllNotificationsRead
);
export default router;
