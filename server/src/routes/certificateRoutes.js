import { Router } from "express";
import { downloadCertificate,verifyCertificate } from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.get(
  "/verify/:registrationId",
  verifyCertificate
);

router.get(
  "/:eventId",
  protect,
  downloadCertificate
);

export default router;