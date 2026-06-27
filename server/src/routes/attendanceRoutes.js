import { Router } from "express";
import {
  scanAttendanceQR
} from "../controllers/attendanceController.js";
import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/scan",
  protect,
  authorize("club_admin"),
  scanAttendanceQR
);

export default router;