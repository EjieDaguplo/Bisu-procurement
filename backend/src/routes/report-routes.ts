import { Router } from "express";
import {
  getSummaryReport,
  getDepartmentReport,
  getStatusReport,
} from "../controllers/reports-controller";
import { requireRole } from "../middleware/role-middleware";

const router = Router();

router.get(
  "/summary",
  requireRole("ADMIN", "PROCUREMENT_STAFF"),
  getSummaryReport,
);
router.get(
  "/department",
  requireRole("ADMIN", "PROCUREMENT_STAFF"),
  getDepartmentReport,
);
router.get(
  "/status",
  requireRole("ADMIN", "PROCUREMENT_STAFF"),
  getStatusReport,
);

export default router;
