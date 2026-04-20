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

router.get("/pending", requireRole("APPROVER", "ADMIN"), getPendingApprovals);
router.get("/pr/:prId", getApprovalsByPR);
router.patch("/:id/approve", requireRole("APPROVER", "ADMIN"), approvePR);
router.patch("/:id/reject", requireRole("APPROVER", "ADMIN"), rejectPR);
router.patch("/:id/return", requireRole("APPROVER", "ADMIN"), returnPR);

export default router;
