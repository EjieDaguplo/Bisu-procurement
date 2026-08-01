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
  requireRole("APPROVER", "PROCUREMENT_OFFICER", "ADMIN"),
  getPendingApprovals,
);
router.get(
  "/pr/:prId",
  requireRole("APPROVER", "PROCUREMENT_OFFICER", "ADMIN"),
  getApprovalsByPR,
);
router.patch(
  "/:id/approve",
  requireRole("APPROVER", "PROCUREMENT_OFFICER", "ADMIN"),
  approvePR,
);
router.patch(
  "/:id/reject",
  requireRole("APPROVER", "PROCUREMENT_OFFICER", "ADMIN"),
  rejectPR,
);
router.patch(
  "/:id/return",
  requireRole("APPROVER", "PROCUREMENT_OFFICER", "ADMIN"),
  returnPR,
);

export default router;
