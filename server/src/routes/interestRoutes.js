import express from "express";
import { listInterests } from "../controllers/interestController.js";

const router = express.Router();
router.get("/", listInterests);
export default router;
