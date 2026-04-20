import { Router } from "express";
import {
  getTrackingByPR,
  getAllTracking,
} from "../controllers/tracking-controller";

const router = Router();

router.get("/", getAllTracking);
router.get("/pr/:prId", getTrackingByPR);

export default router;
