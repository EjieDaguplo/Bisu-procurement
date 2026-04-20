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
  requireRole("ADMIN", "PROCUREMENT_OFFICER"),
  getSummaryReport,
);
router.get(
  "/department",
  requireRole("ADMIN", "PROCUREMENT_OFFICER"),
  getDepartmentReport,
);
router.get(
  "/status",
  requireRole("ADMIN", "PROCUREMENT_OFFICER"),
  getStatusReport,
);

export default router;
