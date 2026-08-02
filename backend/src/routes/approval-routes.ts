import { Router } from "express";
import {
  getApprovalsByPR,
  getPendingApprovals,
  approvePR,
  rejectPR,
  returnPR,
} from "../controllers/approval-controller";
import { requireRole } from "../middleware/role-middleware";

const router = Router();

router.get(
  "/pending",
  requireRole("APPROVING_AUTHORITY", "PROCUREMENT_STAFF", "ADMIN"),
  getPendingApprovals,
);
router.get(
  "/pr/:prId",
  requireRole("APPROVING_AUTHORITY", "PROCUREMENT_STAFF", "ADMIN"),
  getApprovalsByPR,
);
router.patch(
  "/:id/approve",
  requireRole("APPROVING_AUTHORITY", "PROCUREMENT_STAFF", "ADMIN"),
  approvePR,
);
router.patch(
  "/:id/reject",
  requireRole("APPROVING_AUTHORITY", "PROCUREMENT_STAFF", "ADMIN"),
  rejectPR,
);
router.patch(
  "/:id/return",
  requireRole("APPROVING_AUTHORITY", "PROCUREMENT_STAFF", "ADMIN"),
  returnPR,
);

export default router;
